import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  BOB_FREQUENCY_RATIO,
  DEFAULT_EMISSIVE_INTENSITY,
  LURE_SWIM,
  ROLL_FREQUENCY_RATIO,
  TARGET_LURE_LENGTH,
  TEXTURE_ANISOTROPY,
  YAW_FREQUENCY_RATIO,
} from '@/lib/three/swim.config'
import { applySwimDeformation, createSwimUniforms, type SwimUniforms } from '@/lib/three/swim-material'

/**
 * La scène three du hero, en impératif et sans React : le composant ne garde que l'état et
 * l'accessibilité (logique hors des composants, CLAUDE.md).
 *
 * Les leurres NAGENT SUR PLACE, en boucle. C'est une dérogation explicite aux interdits
 * motion de la fondation (§6 : « toute animation en boucle »), demandée par le propriétaire
 * le 2026-08-06 et bornée à cette scène 3D : aucune autre animation du site ne boucle.
 * `prefers-reduced-motion` fige tout, sans exception.
 *
 * Deux étages de mouvement, et c'est leur battement qui se lit comme de la nage :
 *   1. ARTICULATION (GPU, vertex shader) — la partie arrière pivote d'un bloc autour de la
 *      charnière, seule liberté du leurre réel en PVC (deux pièces rigides, cf. swim.config).
 *   2. CORPS RIGIDE (CPU, ici) — roulis, lacet, oscillation verticale, à des fréquences non
 *      commensurables du battement pour qu'aucune boucle ne se perçoive.
 * Coût CPU : quatre écritures de float par leurre et par frame.
 */

/** Écart entre deux leurres sur le rail, en unités de scène. Assez large pour que les
 *  voisins ne fassent que dépasser du cadre : sans ça, les trois se chevauchent et on ne
 *  lit plus lequel est sélectionné. */
const SPACING = 2.35
/** Écart en mode solo (page produit) : assez large pour que les autres modèles
 *  soient hors cadre. On garde un seul chemin de code plutôt qu'une seconde scène. */
const SOLO_SPACING = 9
/** Recul du leurre voisin : la profondeur remplace le fondu (pas de tri alpha). */
const DEPTH_PUSH = 0.7
/** Réduction du voisin — repère de hiérarchie, jamais plus d'un tiers. */
const NEIGHBOUR_SHRINK = 0.28
/**
 * Le ratio de référence : celui des images de la séquence vidéo (1280×720).
 * La caméra suit la MÊME logique de recadrage que le `object-cover` du canvas
 * d'images — sans ça, le calage 3D/vidéo ne tiendrait qu'à une seule taille
 * d'écran et se décalerait au premier redimensionnement.
 */
const REFERENCE_ASPECT = 16 / 9
/**
 * Largeur visible au ratio de référence, en unités de scène. Le leurre mesure
 * `TARGET_LURE_LENGTH` (2), il occupe donc 2/4.93 ≈ 40,6 % de la largeur —
 * exactement la part qu'occupe le leurre filmé dans l'image de la séquence.
 */
const DEFAULT_FRAME_WIDTH = 4.93
/**
 * Constante de temps de l'amortissement du carrousel. 3τ ≈ 0,42 s = `--dur-page` : le
 * passage est posé à la durée de la fondation, pas à une valeur choisie au hasard.
 */
const TIME_CONSTANT = 0.14
/** Décalage de phase entre leurres : sans lui, les trois nagent au même instant. */
const PHASE_STEP = 1.7

export type LureStageEvents = {
  onLoaded: (index: number) => void
  onError: (index: number, error: unknown) => void
  /** Pas de contexte WebGL : GPU bloqué, machine ancienne, navigateur durci. */
  onUnavailable: (error: unknown) => void
}

export type LureStage = {
  /** Cible entière NON bornée : +1 = suivant, -1 = précédent, indéfiniment. */
  setTarget: (target: number) => void
  /** Décalage continu pendant un glissé, en fraction de leurre. */
  setDrag: (offset: number) => void
  /**
   * Fin du glissé : replie le décalage dans la position courante AVANT d'arrêter sur le
   * leurre le plus proche, et retourne la nouvelle cible. Sans ce repli, relâcher ferait
   * revenir l'image en arrière d'un demi-leurre avant de repartir.
   */
  releaseDrag: () => number
  /** Charge un modèle. Idempotent : rappeler ne retélécharge rien. */
  load: (index: number) => void
  /** Oriente tous les leurres (vue de droite, dessus, devant…), en radians XYZ. */
  setView: (rotation: readonly [number, number, number]) => void
  setReducedMotion: (reduced: boolean) => void
  resize: () => void
  /** Coupe la boucle de rendu quand la scène sort de l'écran ou l'onglet. */
  setRunning: (running: boolean) => void
  dispose: () => void
}

/** Un leurre chargé : son placement carrousel, son groupe animé et ses uniforms. */
type Slot = {
  /** Porte le placement carrousel (x, z, échelle). */
  readonly root: THREE.Group
  /** Porte la VUE choisie (droite, dessus, devant…). Interpolée, pas réécrite sèchement. */
  readonly pose: THREE.Group
  /** Réécrit à chaque frame : roulis, lacet, oscillation. Enfant de la pose, pour que le
   *  roulis se fasse bien autour de l'axe long du corps quelle que soit la vue. */
  readonly animated: THREE.Group
  readonly uniforms: SwimUniforms
  readonly phaseOffset: number
}

/** Distance signée la plus courte sur un anneau — le cœur de la boucle infinie. */
function ringOffset(value: number, count: number): number {
  const half = count / 2
  return ((((value + half) % count) + count) % count) - half
}

/** Libère géométries, matériaux et textures : sans ça, changer de page fuit en VRAM. */
function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as Partial<THREE.Mesh>
    mesh.geometry?.dispose()
    const material = mesh.material
    const materials = Array.isArray(material) ? material : material ? [material] : []
    for (const entry of materials) {
      for (const value of Object.values(entry)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      entry.dispose()
    }
  })
}

/** Le premier maillage du fichier. Les trois leurres n'en contiennent qu'un. */
function findFirstMesh(root: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null
  root.traverse((child) => {
    if (!found && child instanceof THREE.Mesh) found = child
  })
  return found
}

/**
 * Aplatit la géométrie en espace monde et purge le skinning.
 *
 * Les .glb arrivent avec une hiérarchie parasite (armature auto-générée, nœuds
 * intermédiaires, transforms imbriquées) que le shader ne peut pas rattraper : il raisonne
 * sur l'attribut `position` brut, qui doit donc être directement comparable à la bounding
 * box. `applyMatrix4(matrixWorld)` absorbe toute la chaîne parente.
 *
 * Retirer le squelette de la truite est sûr PARCE QU'il n'y a aucun clip d'animation dans
 * le fichier : en pose de repos le skinning est l'identité, le maillage nu est identique.
 * Si un clip est ajouté un jour au .glb, cette étape devient destructive.
 */
function flattenGeometry(mesh: THREE.Mesh): THREE.BufferGeometry {
  const geometry = mesh.geometry.clone()
  mesh.updateWorldMatrix(true, false)
  geometry.applyMatrix4(mesh.matrixWorld)
  geometry.deleteAttribute('skinIndex')
  geometry.deleteAttribute('skinWeight')
  return geometry
}

/** Recentre sur l'origine et ramène tous les leurres à la même longueur : c'est le même
 *  produit, il ne doit pas changer de gabarit d'un coloris à l'autre. */
function normalizeGeometry(geometry: THREE.BufferGeometry): { axisMin: number; axisLength: number } {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  if (!box) return { axisMin: -1, axisLength: 2 }

  const center = box.getCenter(new THREE.Vector3())
  geometry.translate(-center.x, -center.y, -center.z)
  const size = box.getSize(new THREE.Vector3())
  // X est l'axe long des trois modèles (contrat documenté dans swim.config.ts).
  const scale = size.x > 0 ? TARGET_LURE_LENGTH / size.x : 1
  geometry.scale(scale, scale, scale)
  geometry.computeBoundingBox()

  const normalized = geometry.boundingBox
  if (!normalized) return { axisMin: -1, axisLength: 2 }
  return { axisMin: normalized.min.x, axisLength: normalized.max.x - normalized.min.x }
}

/** Clone le matériau et corrige les réglages d'export hostiles au temps réel. */
function sanitizeMaterial(source: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  const material = source.clone()
  // `emissiveFactor: [1,1,1]` + texture émissive sur les trois exports : sans ça, le leurre
  // s'auto-éclaire et le PBR est écrasé.
  material.emissiveIntensity = DEFAULT_EMISSIVE_INTENSITY
  // `doubleSided` par défaut des exporteurs : du fill rate doublé pour des faces internes
  // jamais visibles sur un corps fermé.
  material.side = THREE.FrontSide
  if (material.map) material.map.anisotropy = TEXTURE_ANISOTROPY
  if (material.normalMap) material.normalMap.anisotropy = TEXTURE_ANISOTROPY
  return material
}

/** Scène inerte : même contrat, aucun effet — le composant n'a pas de cas nul à gérer. */
function inertStage(): LureStage {
  return {
    setTarget: () => {},
    setDrag: () => {},
    releaseDrag: () => 0,
    load: () => {},
    setView: () => {},
    setReducedMotion: () => {},
    resize: () => {},
    setRunning: () => {},
    dispose: () => {},
  }
}

export function createLureStage(
  canvas: HTMLCanvasElement,
  // Un seul réglage de nage pour tous (`LURE_SWIM`) : même moule, même battement.
  lures: readonly { src: string }[],
  events: LureStageEvents,
  options: {
    /** `solo` : un seul leurre au centre, les autres hors cadre (page produit). */
    solo?: boolean
    /**
     * Grossissement du leurre à l'écran. On rapproche la CAMÉRA plutôt que
     * d'agrandir la géométrie : l'amplitude de nage est une FRACTION de la
     * longueur du corps, donc changer l'échelle du modèle changerait aussi
     * l'ondulation. Le cadrage se règle à la caméra, la nage non.
     */
    zoom?: number
    /** Décalage du leurre dans le cadre, en fraction de la largeur visible. */
    offsetX?: number
    /** Décalage vertical, en fraction de la hauteur visible. Positif = vers le haut. */
    offsetY?: number
  } = {}
): LureStage {
  const count = lures.length
  const spacing = options.solo ? SOLO_SPACING : SPACING
  const frameWidth =
    options.zoom && options.zoom > 0 ? DEFAULT_FRAME_WIDTH / options.zoom : DEFAULT_FRAME_WIDTH
  const offsetX = options.offsetX ?? 0
  const offsetY = options.offsetY ?? 0

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch (error) {
    // On ne relance pas : l'appelant recevrait l'échec pendant le montage, avant même
    // d'avoir fini de se câbler. Tous les événements de la scène lui parviennent de la
    // même façon — en rappel, après coup.
    queueMicrotask(() => events.onUnavailable(error))
    return inertStage()
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0, 5.4)

  // Éclairage : un environnement généré en mémoire plutôt qu'un HDR téléchargé — les
  // matériaux PBR ont besoin de réflexions, pas d'un fichier de plus (et surtout pas d'un
  // CDN tiers, qui casserait la CSP).
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  scene.environment = environment.texture
  // Les leurres sont vernis (rugosité ~0.25) : ils renvoient beaucoup d'environnement.
  // Au-delà, le coloris se dilue dans les reflets — or c'est lui que ce hero doit montrer.
  scene.environmentIntensity = 0.6
  room.dispose()
  pmrem.dispose()

  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(2.5, 3, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.3)
  fill.position.set(-3, -1, 2)
  scene.add(fill)

  const track = new THREE.Group()
  scene.add(track)

  const slots: (Slot | null)[] = lures.map(() => null)
  const requested = new Set<number>()
  const loader = new GLTFLoader()

  let progress = 0
  let target = 0
  let drag = 0
  let reducedMotion = false
  let running = true
  let frame = 0
  let disposed = false
  let lastTime = performance.now()
  /** Vue courante et vue visée. On interpole en QUATERNION : interpoler des angles
   *  d'Euler ferait passer le leurre par des orientations absurdes entre deux vues. */
  const currentPose = new THREE.Quaternion()
  const targetPose = new THREE.Quaternion()
  /** Temps de nage accumulé — distinct de l'horloge murale : il se fige en mouvement
   *  réduit, et ne rattrape pas le temps passé onglet caché. */
  let swimTime = 0

  function layout(): void {
    const position = progress + drag
    for (let index = 0; index < count; index += 1) {
      const slot = slots[index]
      if (!slot) continue
      const offset = ringOffset(index - position, count)
      const distance = Math.abs(offset)
      slot.root.position.x = offset * spacing
      slot.root.position.z = -distance * DEPTH_PUSH
      slot.root.scale.setScalar(1 - Math.min(distance, 1) * NEIGHBOUR_SHRINK)
      // Au-delà d'un leurre et demi, l'objet est hors cadre : ne pas le dessiner.
      slot.root.visible = distance < 1.6
    }
  }

  /** La vue est commune aux trois leurres : un seul quaternion, recopié. */
  function pose(): void {
    for (const slot of slots) {
      if (slot) slot.pose.quaternion.copy(currentPose)
    }
  }

  function swim(): void {
    for (const slot of slots) {
      if (!slot || !slot.root.visible) continue
      const time = swimTime + slot.phaseOffset

      // Étage 1 : la seule donnée que le shader attend.
      slot.uniforms.uSwimTime.value = time

      // Étage 2 : la phase du corps est calée sur celle du battement (même `speed`), sinon
      // le roulis et l'articulation dériveraient lentement l'un par rapport à l'autre.
      const phase = time * LURE_SWIM.speed
      slot.animated.rotation.x = Math.sin(phase * ROLL_FREQUENCY_RATIO) * LURE_SWIM.rollAmplitude
      slot.animated.rotation.y = Math.sin(phase * YAW_FREQUENCY_RATIO) * LURE_SWIM.yawAmplitude
      slot.animated.position.y = Math.sin(phase * BOB_FREQUENCY_RATIO) * LURE_SWIM.bobAmplitude
    }
  }

  function tick(): void {
    if (disposed) return
    frame = requestAnimationFrame(tick)
    const now = performance.now()
    // Plafonné : après un onglet en arrière-plan, un delta énorme téléporterait le
    // carrousel et ferait sauter la nage d'un coup.
    const delta = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now

    const gap = target - progress
    if (reducedMotion) {
      progress = target
      currentPose.copy(targetPose)
    } else {
      swimTime += delta
      if (Math.abs(gap) < 0.0005) progress = target
      else progress += gap * (1 - Math.exp(-delta / TIME_CONSTANT))
      currentPose.slerp(targetPose, 1 - Math.exp(-delta / TIME_CONSTANT))
    }

    layout()
    pose()
    swim()
    renderer.render(scene, camera)
  }

  function resize(): void {
    const parent = canvas.parentElement
    if (!parent) return
    const { clientWidth, clientHeight } = parent
    if (clientWidth === 0 || clientHeight === 0) return
    renderer.setSize(clientWidth, clientHeight, false)
    const aspect = clientWidth / clientHeight
    camera.aspect = aspect
    // Le leurre est large et plat : c'est la largeur qui contraint le cadrage, pas la
    // hauteur. Trois régimes, calés sur le traitement des médias filmés :
    //   aspect ≥ 16/9  → largeur figée, rognage en hauteur (« cover », écrans larges) ;
    //   1 ≤ aspect < 16/9 → hauteur figée, rognage en largeur (« cover », tablette) ;
    //   aspect < 1 (PORTRAIT) → largeur figée À NOUVEAU : contrairement à la vidéo
    //   (plein cadre recadré depuis 2026-08-09), la 3D montre le leurre ENTIER —
    //   c'est le produit qu'on vend, un rognage latéral en couperait la moitié.
    const referenceHeight = frameWidth / REFERENCE_ASPECT
    const visibleHeight =
      aspect >= REFERENCE_ASPECT || aspect < 1 ? frameWidth / aspect : referenceHeight
    camera.position.z = visibleHeight / 2 / Math.tan((camera.fov * Math.PI) / 360)

    // Les décalages sont exprimés en fraction de l'image de RÉFÉRENCE, pas du
    // conteneur : ce sont donc des constantes de scène, justes à toute taille.
    track.position.x = offsetX * frameWidth
    track.position.y = offsetY * referenceHeight

    camera.updateProjectionMatrix()
  }

  function load(index: number): void {
    const wrapped = ((index % count) + count) % count
    if (requested.has(wrapped)) return
    requested.add(wrapped)
    loader.load(
      lures[wrapped].src,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene)
          return
        }
        const source = findFirstMesh(gltf.scene)
        const sourceMaterial = source
          ? Array.isArray(source.material)
            ? source.material[0]
            : source.material
          : null
        if (!source || !(sourceMaterial instanceof THREE.MeshStandardMaterial)) {
          requested.delete(wrapped)
          events.onError(wrapped, new Error(`${lures[wrapped].src} : aucun maillage exploitable.`))
          return
        }

        const geometry = flattenGeometry(source)
        const bounds = normalizeGeometry(geometry)
        // La géométrie source est clonée : l'originale ne sert plus à rien en VRAM.
        source.geometry.dispose()

        const material = sanitizeMaterial(sourceMaterial)
        const uniforms = createSwimUniforms(LURE_SWIM, bounds)
        applySwimDeformation(material, uniforms)

        const animated = new THREE.Group()
        animated.add(new THREE.Mesh(geometry, material))

        // Trois niveaux, et pas un seul : le carrousel écrit sur `root`, la VUE sur
        // `poseGroup`, la nage sur `animated`. Les fusionner ferait écraser l'un par
        // l'autre à chaque frame — la vue choisie disparaîtrait sous le roulis.
        const poseGroup = new THREE.Group()
        poseGroup.quaternion.copy(currentPose)
        poseGroup.add(animated)

        const root = new THREE.Group()
        root.add(poseGroup)
        root.visible = false
        slots[wrapped] = {
          root,
          pose: poseGroup,
          animated,
          uniforms,
          phaseOffset: wrapped * PHASE_STEP,
        }
        track.add(root)
        layout()
        events.onLoaded(wrapped)
      },
      undefined,
      (error) => {
        // Échec bruyant : le composant affiche un vrai message, pas un cadre vide.
        requested.delete(wrapped)
        events.onError(wrapped, error)
      }
    )
  }

  resize()
  tick()

  return {
    setTarget(next) {
      target = next
    },
    setDrag(offset) {
      drag = offset
    },
    releaseDrag() {
      progress += drag
      drag = 0
      target = Math.round(progress)
      return target
    },
    load,
    setView(rotation) {
      targetPose.setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]))
    },
    setReducedMotion(reduced) {
      reducedMotion = reduced
    },
    resize,
    setRunning(next) {
      if (next === running) return
      running = next
      if (next) {
        lastTime = performance.now() // oublie le temps écoulé pendant la pause
        tick()
      } else {
        cancelAnimationFrame(frame)
      }
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      for (const slot of slots) if (slot) disposeObject(slot.root)
      environment.texture.dispose()
      renderer.dispose()
    },
  }
}
