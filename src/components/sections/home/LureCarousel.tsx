'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LURE_MODELS, lureDisplayName, wrapIndex, type LureModel } from '@/lib/lure-models'
import { OFFERS, PRODUCT, formatEuros, getColorway, totalCents } from '@/lib/shop/product'
import { resolveOffer } from '@/lib/shop/collection-selection'
import { DEFAULT_LURE_VIEW, LURE_VIEWS, getLureView, type LureViewId } from '@/lib/three/lure-views'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { AlureLoader } from '@/components/ui/AlureLoader'
import { CollectionStrip } from './CollectionStrip'
import { useCollectionSelection } from './use-collection-selection'
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
  /** Progression réelle du téléchargement de chaque modèle (`null` = non mesurable). */
  const [modelProgress, setModelProgress] = useState<Record<number, number | null>>({})
  /** Le « panier » de la frise : un COMPTEUR de leurres — n'importe lequel compte. */
  const { selection, add, removeOne } = useCollectionSelection()

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

  /** Amène le carrousel sur le modèle du coloris demandé (chemin le plus court). */
  const jumpToColorway = useCallback((colorwayId: string) => {
    const index = LURE_MODELS.findIndex((m) => m.colorwayId === colorwayId)
    if (index >= 0) setTarget((now) => now + ringStep(now, index))
  }, [])

  const jumpToCollector = useCallback(() => {
    const index = LURE_MODELS.findIndex((m) => m.collector)
    if (index >= 0) setTarget((now) => now + ringStep(now, index))
  }, [])

  /**
   * L'action du bouton unique : ajouter le leurre affiché, puis AVANCER tout
   * seul — vers le prochain coloris tant qu'on est sous les 2 achetés, vers le
   * Pirate débloqué dès qu'ils y sont. Un clic = un pas de l'entonnoir.
   */
  const addAndAdvance = (colorwayId: string) => {
    add(colorwayId)
    const next = [...selection, colorwayId]
    if (next.length >= OFFERS.collection.paidCount) {
      jumpToCollector()
    } else {
      // On montre un AUTRE coloris pour la variété — mais n'importe quel leurre
      // compte, y compris le même une deuxième fois.
      const upcoming =
        PRODUCT.colorways.find((c) => c.available && !next.includes(c.id)) ??
        PRODUCT.colorways.find((c) => c.available && c.id !== colorwayId)
      if (upcoming) jumpToColorway(upcoming.id)
    }
  }

  /** Depuis le Pirate verrouillé : amène sur un coloris achetable. */
  const seekColorway = () => {
    const target = PRODUCT.colorways.find((c) => c.available)
    if (target) jumpToColorway(target.id)
  }

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
          <div className="absolute inset-0 flex items-center justify-center text-foreground">
            <AlureLoader progress={modelProgress[active] ?? null} />
          </div>
        )}

        {/* Le canvas est aria-hidden : voici ce qu'il montre, pour qui ne le voit pas. */}
        <p className="sr-only" aria-live="polite">
          {activeModel.description} Vue : {activeView.description}.
        </p>
      </div>

      {/* La frise collection (décision Camil 2026-08-12), sous le header (surcouche
          fixe de ~4,5rem), et la fiche technique DANS LA MÊME COLONNE DE FLUX :
          la fiche s'ouvre SOUS la frise — le chevauchement est impossible par
          construction, quelle que soit la hauteur de l'une ou de l'autre
          (itération Camil : « rien ne doit se chevaucher »). */}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-3 px-4 md:top-18 [&>*]:pointer-events-auto">
        <CollectionStrip
          selection={selection}
          activeColorwayId={activeModel.colorwayId}
          onJumpCollector={jumpToCollector}
        />

        {specsOpen && (
          <LureSpecs
            model={activeModel}
            onClose={() => setSpecsOpen(false)}
            footer={
              <AddToCollection
                model={activeModel}
                selection={selection}
                onAdd={add}
                onRemove={removeOne}
              />
            }
          />
        )}
      </div>

      {/* Le bloc « Offert » du collector a été SUPPRIMÉ (consigne Camil
          2026-08-14) : le Pirate se montre nu, la frise et le bouton unique
          racontent l'offre. Cliquer le leurre ouvre la fiche, comme les autres. */}


      {/* Les commandes flottent au-dessus du cadre plein écran. `pointer-events`
          rendus aux seuls contrôles : le reste de la bande laisse passer le
          glissé sur le leurre. */}
      {/* Compact au général (itération Camil) : segmented réduit, flèches et
          bouton un cran plus petits, interlignes resserrés. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2 [&>*]:pointer-events-auto">
      {!broken && (
        <SegmentedControl
          ariaLabel="Angle de vue du leurre"
          value={view}
          onChange={setView}
          options={LURE_VIEWS.map((v) => ({ value: v.id, label: v.label }))}
          className="px-seg--sm"
        />
      )}

      {!broken && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Leurre précédent"
            className="px-btn px-btn--ghost px-btn--md !h-8 !px-2.5"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
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
            className="px-btn px-btn--ghost px-btn--md !h-8 !px-2.5"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}

      {!broken && (
        <p className="text-label text-muted-foreground uppercase">
          {lureDisplayName(activeModel)}
        </p>
      )}

      {/* LE bouton (itération Camil : « un bouton, beaucoup d'actions ») —
          toujours visible, il porte tout l'entonnoir. Le retrait, plus rare,
          reste dans la fiche (clic sur le leurre). */}
      {!broken && (
        <SmartCartButton
          model={activeModel}
          selection={selection}
          onAddAdvance={addAndAdvance}
          onSeekColorway={seekColorway}
        />
      )}
      </div>
    </div>
  )
}

/**
 * L'UNIQUE bouton du hero — un état par moment de l'entonnoir, jamais deux
 * choix à la fois (itération Camil : minimaliste, compréhensible, rapide) :
 *
 *   panier à 3          → « Commander les 4 »            (part payer, cadeau au choix)
 *   coloris achetable   → « Ajouter · 21,99 € »          (ajoute + avance)
 *   Pirate, panier à 1  → « Commander · 21,99 € »        (le solo reste possible)
 *   Pirate, sinon       → « Offert dès 3 achetés »       (ramène sur un coloris)
 *
 * Tous les montants et seuils viennent d'`OFFERS` — jamais écrits à la main.
 */
function SmartCartButton({
  model,
  selection,
  onAddAdvance,
  onSeekColorway,
}: {
  model: LureModel
  selection: readonly string[]
  onAddAdvance: (colorwayId: string) => void
  onSeekColorway: () => void
}) {
  const resolved = resolveOffer(selection)

  // 3 achetés : plus rien à ajouter — on commande, le 4e se choisit sur /leurre.
  if (resolved?.offre === 'collection') {
    return (
      <Link
        href={`/leurre?offre=${resolved.offre}&coloris=${resolved.coloris}`}
        className="px-btn px-btn--primary px-btn--md min-w-44"
      >
        Commander les 4 · {formatEuros(totalCents('collection'))}
      </Link>
    )
  }

  // N'importe quel leurre compte — même celui déjà pris une première fois.
  const colorway = model.colorwayId ? getColorway(model.colorwayId) : undefined
  if (colorway?.available) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <Button
          type="button"
          size="md"
          onClick={() => onAddAdvance(colorway.id)}
          aria-label={`Ajouter ${colorway.label} au panier — ${formatEuros(totalCents('solo'))}`}
          className="min-w-44"
        >
          Ajouter · {formatEuros(totalCents('solo'))}
        </Button>
        {/* Le solo reste à un clic quand il n'y a qu'un leurre au panier. */}
        {resolved?.offre === 'solo' && selection.length === 1 && (
          <Link
            href={`/leurre?offre=solo&coloris=${resolved.coloris}`}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            ou commander 1 leurre · {formatEuros(totalCents('solo'))}
          </Link>
        )}
      </div>
    )
  }

  // Le solo ne se commande que pour UN leurre : à 2, on pousse le 3e — jamais
  // une commande qui paierait moins qu'annoncé au panier.
  if (resolved?.offre === 'solo' && selection.length === 1) {
    return (
      <Link
        href={`/leurre?offre=solo&coloris=${resolved.coloris}`}
        className="px-btn px-btn--primary px-btn--md min-w-44"
      >
        Commander · {formatEuros(totalCents('solo'))}
      </Link>
    )
  }

  // Pirate affiché, panier vide ou à 2 : le bouton ramène vers un coloris.
  return (
    <Button type="button" size="md" variant="ghost" onClick={onSeekColorway} className="min-w-44">
      {selection.length === 0
        ? `Offert dès ${OFFERS.collection.paidCount} achetés — choisir`
        : 'Encore 1 — le 4e sera offert'}
    </Button>
  )
}

/**
 * Le bouton de la fiche — après les specs du leurre. Le panier est un COMPTEUR :
 * ajouter tant qu'on est sous les 2 achetés, retirer une occurrence sinon.
 * Le collector n'a pas de bouton (il ne se vend pas), un coloris épuisé non
 * plus (jamais un bouton qui ment).
 */
function AddToCollection({
  model,
  selection,
  onAdd,
  onRemove,
}: {
  model: LureModel
  selection: readonly string[]
  onAdd: (colorwayId: string) => void
  onRemove: (colorwayId: string) => void
}) {
  const colorwayId = model.colorwayId
  if (!colorwayId) return null
  const colorway = getColorway(colorwayId)
  if (!colorway) return null
  if (!colorway.available) {
    return <p className="text-[0.8125rem] text-muted-foreground">Épuisé</p>
  }

  const inCart = selection.includes(colorwayId)
  const full = selection.length >= OFFERS.collection.paidCount

  if (inCart) {
    return (
      <Button
        type="button"
        size="md"
        variant="ghost"
        onClick={() => onRemove(colorwayId)}
        className="w-full gap-2"
      >
        <Check aria-hidden className="size-4" strokeWidth={2.5} />
        Retirer du panier
      </Button>
    )
  }

  if (full) {
    // 3 achetés : le panier est plein — le 4e se choisit en commandant.
    return (
      <p className="text-[0.8125rem] font-bold text-success">
        Le 4e leurre est offert — choisissez-le en commandant.
      </p>
    )
  }

  return (
    <Button type="button" size="md" onClick={() => onAdd(colorwayId)} className="w-full">
      Ajouter au panier
    </Button>
  )
}

/** Nombre de crans, dans le sens le plus court, pour aller de `from` à `index`. */
function ringStep(from: number, index: number): number {
  const count = LURE_MODELS.length
  const raw = index - wrapIndex(from)
  const half = count / 2
  return ((((raw + half) % count) + count) % count) - half
}
