'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { LURE_MODELS, lureDisplayName, wrapIndex } from '@/lib/lure-models'
import { DEFAULT_LURE_VIEW, LURE_VIEWS, getLureView, type LureViewId } from '@/lib/three/lure-views'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createLureStage, type LureStage } from './lure-stage'
import { LureSpecs } from './LureSpecs'

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
export function LureCarousel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<LureStage | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number } | null>(null)
  const movedRef = useRef(0)

  const [target, setTarget] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [loaded, setLoaded] = useState<readonly number[]>([])
  const [view, setView] = useState<LureViewId>(DEFAULT_LURE_VIEW)
  /** La fiche s’ouvre au CLIC sur le leurre — pas au glissé, qui change de leurre. */
  const [specsOpen, setSpecsOpen] = useState(false)

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
        onUnavailable: (error) => {
          console.error('Hero 3D : contexte WebGL indisponible.', error)
          setStatus('unsupported')
        },
      },
      // CALAGE SUR LA SÉQUENCE VIDÉO — c'est ce qui rend le fondu invisible.
      //
      // Mesuré sur la dernière image (`public/hero-frames/0121.webp`, 1280×720) :
      // le leurre y va de x=430 à x=950, soit 520 px = 40,6 % de la largeur.
      //
      // En X, on vise le centre du corps : 690 px.
      //
      // En Y, PAS la ligne médiane du corps (352 px). `normalizeGeometry` centre
      // le modèle sur sa boîte englobante, or celle-ci descend jusqu'au bas des
      // HAMEÇONS — son centre est donc plus bas que le corps. Aligner les deux
      // centres ferait remonter le corps 3D au-dessus du corps filmé. On vise
      // donc le centre de la boîte englobante du leurre filmé, hameçons compris :
      // du haut des dorsales (~255 px) au bas des triples (~500 px), affiné à l’œil
      // à 385 px.
      //
      // `DEFAULT_FRAME_WIDTH` (4,93) encode la taille : le leurre de 2 unités y
      // occupe 2/4,93 = 40,6 %. Les décalages ramènent son centre sur celui du
      // leurre filmé. La caméra suit le même recadrage « cover » que l'image.
      //
      // ⚠️ À REVÉRIFIER si les segments sont régénérés (ils le seront, pour
      // retirer le watermark) : refaire la mesure sur la nouvelle image 0121 et
      // ajuster ces trois nombres. Rien d'autre ne dépend d'eux.
      { offsetX: 691 / 1280 - 0.5, offsetY: 0.5 - 382 / 720 }
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
            {status === 'unsupported'
              ? 'Votre navigateur n’affiche pas la 3D. Les photos du leurre sont sur la page produit.'
              : 'Le modèle 3D n’a pas pu se charger. Les photos du leurre sont sur la page produit.'}
          </p>
        )}

        {!broken && !isActiveLoaded && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Chargement du leurre…
          </p>
        )}

        {/* Le canvas est aria-hidden : voici ce qu'il montre, pour qui ne le voit pas. */}
        <p className="sr-only" aria-live="polite">
          {activeModel.description} Vue : {activeView.description}.
        </p>
      </div>

      {/* Le leurre noir ne se vend pas : il s’obtient. Tant que la fiche n’est
          pas ouverte, le collector porte son cadenas et affiche EN GRAND ce qui
          le débloque — l’achat des trois leurres. Cliquer le leurre bascule sur
          la fiche technique (ci-dessous) ; recliquer revient à ce message.
          `pointer-events-none` : le clic traverse jusqu’au cadre qui ouvre la fiche. */}
      {activeModel.collector && !specsOpen && !broken && isActiveLoaded && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-card bg-background/60 px-8 py-7 text-center shadow-card backdrop-blur-md">
            <span
              aria-hidden
              className="flex size-14 items-center justify-center rounded-full bg-foreground/10"
            >
              <Lock className="size-7" strokeWidth={2} />
            </span>
            <p className="text-label uppercase text-muted-foreground">Le collector</p>
            <p className="font-display text-4xl font-bold sm:text-5xl">Offert</p>
            <p className="text-[0.9375rem] leading-relaxed text-prose-foreground">
              Le leurre noir ne s’achète pas. Il est offert dès l’achat des trois
              leurres de la collection.
            </p>
          </div>
        </div>
      )}

      {/* La fiche technique, tapée au clavier, EN PLEIN MILIEU (et non plus dans
          un coin) : au clic sur le leurre, elle s’ouvre au centre du hero. */}
      {specsOpen && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4">
          <LureSpecs model={activeModel} onClose={() => setSpecsOpen(false)} />
        </div>
      )}

      {/* Les commandes flottent au-dessus du cadre plein écran. `pointer-events`
          rendus aux seuls contrôles : le reste de la bande laisse passer le
          glissé sur le leurre. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 [&>*]:pointer-events-auto">
      {!broken && (
        <SegmentedControl
          ariaLabel="Angle de vue du leurre"
          value={view}
          onChange={setView}
          options={LURE_VIEWS.map((v) => ({ value: v.id, label: v.label }))}
        />
      )}

      {!broken && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Leurre précédent"
            className="px-btn px-btn--ghost px-btn--md !px-3"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {LURE_MODELS.map((model, index) => {
              const current = index === active
              return (
                <button
                  key={model.id}
                  type="button"
                  // On vise l'occurrence la plus proche du leurre demandé : depuis
                  // le dernier, cliquer le premier avance d'un cran au lieu de
                  // rembobiner toute la liste.
                  onClick={() => setTarget((now) => now + ringStep(now, index))}
                  aria-label={`Afficher le leurre ${lureDisplayName(model)}`}
                  aria-current={current ? 'true' : undefined}
                  className={`h-2.5 rounded-full transition-[width,background-color] duration-[var(--dur-element)] ease-[var(--ease-out-soft)] ${
                    current ? 'w-6 bg-foreground' : 'w-2.5 bg-border hover:bg-muted-foreground'
                  }`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Leurre suivant"
            className="px-btn px-btn--ghost px-btn--md !px-3"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}

      {!broken && (
        <p className="text-label text-muted-foreground uppercase">
          {lureDisplayName(activeModel)}
        </p>
      )}
      </div>
    </div>
  )
}

/** Nombre de crans, dans le sens le plus court, pour aller de `from` à `index`. */
function ringStep(from: number, index: number): number {
  const count = LURE_MODELS.length
  const raw = index - wrapIndex(from)
  const half = count / 2
  return ((((raw + half) % count) + count) % count) - half
}
