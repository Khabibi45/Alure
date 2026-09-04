'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LURE_MODELS, lureDisplayName, wrapIndex } from '@/lib/lure-models'
import { fill } from '@/lib/i18n/fill'
import type { CarouselStrings } from './carousel-strings'
import { LURE_VIEWS, getLureView, type LureViewId } from '@/lib/three/lure-views'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { AlureLoader } from '@/components/ui/AlureLoader'
import { createLureStage, type LureStage } from './lure-stage'
import { LureSpecs } from './LureSpecs'

/**
 * L'angle d'ouverture de l'accueil (consigne Camil, 2026-09-03) : le flanc
 * GAUCHE. Il ne suit pas `DEFAULT_LURE_VIEW`, qui reste la vue de référence de
 * la page produit — deux pages, deux premières impressions, et aucune raison
 * qu'elles se suivent.
 */
const INITIAL_VIEW: LureViewId = 'gauche'

/** Le coloris montré à l'ouverture de l'accueil. */
const OPENING_COLORWAY = 'coloris-4'

/** Fraction de la largeur du cadre à parcourir pour passer au leurre suivant. */
const DRAG_TRAVEL = 0.55
/** En dessous de ce déplacement, le geste compte comme un clic, pas un glissé. */
const CLICK_SLOP = 6

type Status = 'loading' | 'ready' | 'unsupported' | 'failed'

/**
 * Le carrousel 3D du hero. La boucle est infinie parce que la cible est un
 * entier NON borné : on compte indéfiniment, et `wrapIndex` ramène l'affichage
 * sur les trois modèles. Aucun modèle n'est dupliqué, aucun saut n'est visible
 * au passage du dernier au premier.
 *
 * Ce qu'il ne capture PAS : le scroll vertical de la page. Un hero qui détourne
 * la molette pour son propre carrousel enferme le visiteur — seuls un glissé
 * horizontal, une molette horizontale, les flèches du clavier et les boutons
 * changent de leurre.
 */
export function LureCarousel({ strings }: { strings: CarouselStrings }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<LureStage | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number } | null>(null)
  const movedRef = useRef(0)

  // Ce qu'on voit EN ARRIVANT sur la page (consigne Camil, 2026-09-03) : le
  // Le NOIR, de gauche (consigne Camil). Il s'appelait « Pirate » et ne se
  // vendait pas ; c'est aujourd'hui un coloris comme les autres, mais il reste
  // celui qu'on montre en premier.
  //
  // L'index est CHERCHÉ, pas écrit : `LURE_MODELS` peut changer d'ordre, et un 3
  // en dur montrerait alors un autre leurre sans que rien ne le signale.
  const [target, setTarget] = useState(() =>
    Math.max(
      0,
      LURE_MODELS.findIndex((m) => m.colorwayId === OPENING_COLORWAY)
    )
  )
  const [status, setStatus] = useState<Status>('loading')
  const [loaded, setLoaded] = useState<readonly number[]>([])
  const [view, setView] = useState<LureViewId>(INITIAL_VIEW)
  /** La fiche s’ouvre au CLIC sur le leurre — pas au glissé, qui change de leurre. */
  const [specsOpen, setSpecsOpen] = useState(false)
  /** Progression réelle du téléchargement de chaque modèle (`null` = non mesurable). */
  const [modelProgress, setModelProgress] = useState<Record<number, number | null>>({})

  const active = wrapIndex(target)
  const activeModel = LURE_MODELS[active]
  const isActiveLoaded = loaded.includes(active)
  const activeView = getLureView(view)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return

    const stage = createLureStage(
      canvas,
      LURE_MODELS.map((model) => ({ src: model.src })),
      {
        onLoaded: (index) => {
          setLoaded((current) => (current.includes(index) ? current : [...current, index]))
          setStatus('ready')
        },
        onError: (index, error) => {
          console.error(`Hero 3D : échec du chargement de ${LURE_MODELS[index].src}.`, error)
          setStatus('failed')
        },
        onProgress: (index, ratio) => {
          setModelProgress((current) =>
            current[index] === ratio ? current : { ...current, [index]: ratio }
          )
        },
        onUnavailable: (error) => {
          console.error('Hero 3D : contexte WebGL indisponible.', error)
          setStatus('unsupported')
        },
      },
      // ── LE CADRAGE : PLUS PETIT, ET CENTRÉ (consigne Camil, 2026-09-03) ──
      //
      // Jusqu'ici le leurre 3D était DÉCALÉ, à 691 × 336 dans une image de
      // 1280 × 720 : ces deux nombres l'alignaient sur le leurre FILMÉ, pour que
      // le fondu de la séquence vers la 3D ne bouge pas d'un pixel.
      //
      // Ce calage n'a plus d'objet, et c'est ce qui le rend supprimable plutôt
      // que réglable :
      //
      //   - la séquence montre encore l'ARTICULÉ, un autre produit que celui
      //     qu'on vend depuis les leurres souples — le raccord était déjà faux ;
      //   - sur téléphone, l'image de référence est rognée pour remplir l'écran,
      //     donc la cible n'était pas là où le calcul la plaçait ;
      //   - la boucle vidéo du décor est coupée depuis le 2026-09-02.
      //
      // Sans décalage, le leurre est au centre de la scène, donc au centre du
      // cadre. C'est ce qu'on cherche quand on regarde un produit.
      //
      // `zoom` COMMANDE LA TAILLE, et il agit sur la CAMÉRA, pas sur le modèle :
      // en dessous de 1, le cadre s'élargit et le leurre occupe moins de place.
      // Il ne faut surtout pas mettre le modèle à l'échelle — l'amplitude de nage
      // est une fraction de la longueur du corps, l'ondulation changerait avec.
      // À 0,72, le leurre occupe 29 % de la largeur du cadre au lieu de 41 %.
      // C'est CE nombre qu'on bouge pour l'agrandir ou le réduire.
      { zoom: 0.72 }
    )
    stageRef.current = stage

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => stage.setReducedMotion(motionQuery.matches)
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)

    const observer = new ResizeObserver(() => stage.resize())
    observer.observe(frame)

    // Hors écran ou onglet en arrière-plan : on arrête de dessiner.
    const visibility = new IntersectionObserver(
      ([entry]) => stage.setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 }
    )
    visibility.observe(frame)
    const onVisibilityChange = () => stage.setRunning(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)

    stage.load(0)

    return () => {
      motionQuery.removeEventListener('change', syncMotion)
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stage.dispose()
      stageRef.current = null
    }
  }, [])

  // La cible pilote la scène ; les voisins se préchargent une fois l'actif prêt,
  // pour que le premier affichage ne paie qu'un seul modèle.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.setTarget(target)
    stage.load(target)
    if (isActiveLoaded) {
      stage.load(target + 1)
      stage.load(target - 1)
    }
  }, [target, isActiveLoaded])

  useEffect(() => {
    stageRef.current?.setView(activeView.rotation)
  }, [activeView])

  const go = useCallback((step: number) => setTarget((current) => current + step), [])

  /** Amène le carrousel sur le modèle du coloris demandé (chemin le plus court). */

  // L'auto-avance après un ajout a été SUPPRIMÉE (2026-08-25) : elle faisait
  // pivoter le carrousel vers un autre leurre dans le même geste que le clic,
  // si bien que le visiteur voyait disparaître ce qu'il venait d'ajouter, sans
  // aucune confirmation. Désormais l'objet reste sous les yeux, et c'est sa
  // case qui se coche.

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX }
    movedRef.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    const width = frameRef.current?.clientWidth
    if (!drag || !stage || !width || drag.pointerId !== event.pointerId) return
    movedRef.current = Math.max(movedRef.current, Math.abs(event.clientX - drag.startX))
    stage.setDrag(-(event.clientX - drag.startX) / (width * DRAG_TRAVEL))
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (stage) setTarget(stage.releaseDrag())
    // Sous le seuil, le geste n’était pas un glissé : c’était un clic.
    if (movedRef.current < CLICK_SLOP) setSpecsOpen((open) => !open)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
  }

  // Molette : uniquement le geste horizontal (trackpad, souris à molette
  // inclinable). Le geste vertical reste au défilement de la page.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let cooldown = 0
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = event.timeStamp
      if (now - cooldown < 320) return
      cooldown = now
      setTarget((current) => current + (event.deltaX > 0 ? 1 : -1))
    }
    frame.addEventListener('wheel', onWheel, { passive: false })
    return () => frame.removeEventListener('wheel', onWheel)
  }, [])

  const broken = status === 'unsupported' || status === 'failed'

  return (
    // Plein cadre, comme le canvas d'images : c'est la condition pour que les
    // deux leurres se superposent. Une boîte centrée de largeur limitée aurait
    // son propre ratio, donc son propre recadrage — et le calage tomberait.
    <div className="absolute inset-0">
      <div
        ref={frameRef}
        role="group"
        aria-roledescription="carrousel"
        aria-label="Les coloris du leurre Alure en 3D"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

        {broken && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {status === 'unsupported' ? strings.noWebgl : strings.modelFailed}
          </p>
        )}

        {!broken && !isActiveLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-foreground">
            <AlureLoader progress={modelProgress[active] ?? null} label={strings.loading} />
          </div>
        )}

        {/* Le canvas est aria-hidden : voici ce qu'il montre, pour qui ne le voit pas. */}
        <p className="sr-only" aria-live="polite">
          {fill(strings.modelAlt, {
            nom: lureDisplayName(activeModel),
            vue: strings.viewDescriptions[activeView.id],
          })}
        </p>
      </div>

      {/* LA BANDE HAUTE — au-dessus du leurre, sous le header (surcouche fixe de
          ~4,5rem). Elle porte l'angle de vue et la fiche technique.

          Le sélecteur d'angle est REMONTÉ ici (consigne Camil 2026-08-28) : il
          orientait le leurre depuis le bas de l'écran, à côté des commandes
          d'achat, ce qui mélangeait deux gestes de nature différente. En haut,
          il agit sur l'objet qu'il modifie, et la bande basse redevient ce
          qu'elle doit être — le panier et les chemins vers la caisse. */}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-3 px-4 md:top-18 [&>*]:pointer-events-auto">
        {!broken && (
          <SegmentedControl
            ariaLabel={strings.viewsLabel}
            value={view}
            onChange={setView}
            options={LURE_VIEWS.map((v) => ({ value: v.id, label: strings.views[v.id] }))}
            className="px-seg--sm"
          />
        )}

        {specsOpen && <LureSpecs model={activeModel} onClose={() => setSpecsOpen(false)} />}
      </div>

      {/* Le bloc « Offert » du collector a été SUPPRIMÉ (consigne Camil
          2026-08-14) : le Pirate se montre nu, la frise et le bouton unique
          racontent l'offre. Cliquer le leurre ouvre la fiche, comme les autres. */}

      {/* Les commandes flottent au-dessus du cadre plein écran. `pointer-events`
          rendus aux seuls contrôles : le reste de la bande laisse passer le
          glissé sur le leurre. */}
      {/* Compact au général (itération Camil) : flèches et bouton un cran plus
          petits, interlignes resserrés. Le sélecteur d'angle a quitté cette
          bande le 2026-08-28 — il vit désormais au-dessus du leurre. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2 [&>*]:pointer-events-auto">
        {!broken && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={strings.previous}
              className="px-btn px-btn--ghost px-btn--md !h-8 !px-2.5"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>

            <p
              className="text-label min-w-32 text-center text-muted-foreground uppercase"
              translate="no"
            >
              {lureDisplayName(activeModel)}
            </p>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label={strings.next}
              className="px-btn px-btn--ghost px-btn--md !h-8 !px-2.5"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}

        {/* LE PANIER A DISPARU avec l'offre à composer (2026-09-04) : le pack
            contient une unité de chaque coloris, il n'y a donc plus rien à
            cocher ici. La bande basse ne porte plus que la navigation, et
            l'achat se fait sur la page produit, en une fois.

            Le bouton qui ouvre la fiche technique reste : c'est le seul geste
            que le carrousel doit encore offrir. */}
        <button
          type="button"
          onClick={() => setSpecsOpen(true)}
          className="px-btn px-btn--ghost px-btn--md !h-8"
        >
          {strings.sheetLabel}
        </button>
      </div>
    </div>
  )
}
