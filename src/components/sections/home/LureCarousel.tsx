'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LURE_MODELS, lureDisplayName, wrapIndex, type LureModel } from '@/lib/lure-models'
import { PRODUCT, getColorway } from '@/lib/shop/product'
import {
  CART_MAX,
  cartBoxState,
  cartStatus,
  collectionAvailable,
  giftBoxState,
  isInCart,
} from '@/lib/shop/collection-selection'
import { fill } from '@/lib/i18n/fill'
import type { CarouselStrings } from './carousel-strings'
import { DEFAULT_LURE_VIEW, LURE_VIEWS, getLureView, type LureViewId } from '@/lib/three/lure-views'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { AlureLoader } from '@/components/ui/AlureLoader'
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
export function LureCarousel({ strings }: { strings: CarouselStrings }) {
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
  /** Le panier : un ENSEMBLE de coloris distincts — il montre le colis. */
  const { selection, toggle, clear } = useCollectionSelection()

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

      {/* La frise collection a été SUPPRIMÉE (consigne Camil 2026-08-20) : l'offre
          se raconte par les deux boutons du bas et leur ligne de statut. La fiche
          technique garde sa colonne sous le header (surcouche fixe de ~4,5rem). */}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-3 px-4 md:top-18 [&>*]:pointer-events-auto">
        {specsOpen && (
          <LureSpecs
            model={activeModel}
            onClose={() => setSpecsOpen(false)}
            footer={
              <SheetAction
                model={activeModel}
                selection={selection}
                strings={strings}
                onToggle={toggle}
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
            ariaLabel={strings.viewsLabel}
            value={view}
            onChange={setView}
            options={LURE_VIEWS.map((v) => ({ value: v.id, label: strings.views[v.id] }))}
            className="px-seg--sm"
          />
        )}

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

        {/* LE PANIER (consigne Camil 2026-08-25 : « un vrai panier à cliquer et à
            consulter »). Il remplace les anciennes puces de navigation : chaque
            case navigue ET porte son état, donc la rangée sert deux fois. */}
        <CartBand
          model={activeModel}
          selection={selection}
          strings={strings}
          onToggle={toggle}
          onClear={clear}
          onShowColorway={jumpToColorway}
          onShowCollector={jumpToCollector}
          onOpenSheet={() => setSpecsOpen(true)}
        />
      </div>
    </div>
  )
}

/**
 * LE PANIER, visible en permanence (spec `docs/specs/carrousel-achat.md`).
 *
 * Une rangée de quatre cases montre le COLIS, pas un compteur : les trois
 * coloris payés, puis le 4e leurre offert. Chaque case navigue (elle amène le
 * carrousel sur son leurre) ET porte son état — c'est ce qui répond d'un coup
 * d'œil aux quatre questions : combien, lesquels, combien ça coûte, comment
 * j'en enlève un.
 *
 * Deux sorties vers la caisse sont posées dessous et ne disparaissent JAMAIS,
 * quel que soit l'état. C'est le correctif du défaut le plus grave de la version
 * précédente : à 2 leurres au panier, plus aucun bouton ne menait au paiement.
 *
 * Règle de système : aucun bouton d'ici n'encaisse, donc AUCUN ne porte de
 * montant. Le prix vit dans les cases, la ligne d'état et la note de bas de
 * bande — donc visible dans tous les états. C'est ce qui rend impossible le
 * retour du bug « Acheter · 21,99 € » qui achetait un autre leurre que celui
 * affiché.
 */
function CartBand({
  model,
  selection,
  strings,
  onToggle,
  onClear,
  onShowColorway,
  onShowCollector,
  onOpenSheet,
}: {
  model: LureModel
  selection: readonly string[]
  strings: CarouselStrings
  onToggle: (colorwayId: string) => void
  onClear: () => void
  onShowColorway: (colorwayId: string) => void
  onShowCollector: () => void
  onOpenSheet: () => void
}) {
  const soloPrice = strings.soloPrice
  const displayed = model.colorwayId ? getColorway(model.colorwayId) : undefined
  const displayedTaken = displayed ? isInCart(selection, displayed.id) : false
  const displayedOrderable = displayed !== undefined && displayed.available
  const status = cartStatus(selection)
  const collectionOpen = collectionAvailable()

  // La phrase d'état : une CLÉ résolue par le domaine, remplie ici. Le domaine
  // ne connaît aucun texte, ce composant ne connaît aucune règle.
  const statusTemplate = {
    'CART.STATE_EMPTY': strings.stateEmpty,
    'CART.STATE_ONE': strings.stateOne,
    'CART.STATE_SOME': strings.stateSome,
    'CART.STATE_FULL': strings.stateFull,
    'CART.STATE_SOLD_OUT': strings.stateSoldOut,
  }[status.key]

  const statusText = fill(statusTemplate ?? strings.stateEmpty, {
    total: strings.collectionTotal,
    compte: String(status.labels.length),
    max: String(CART_MAX),
    liste: status.labels.join(', '),
  })

  const giftState = giftBoxState(selection)
  const giftLabel = {
    offert: strings.boxGiftFree,
    'a-choisir': strings.boxGiftChoose,
    suspendu: strings.boxGiftPaused,
  }[giftState]

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2 px-2">
      {/* ── La rangée du colis : 3 coloris payés + le 4e offert ── */}
      <div role="group" aria-label={strings.sheet} className="flex w-full items-stretch gap-1.5">
        {PRODUCT.colorways.map((colorway) => {
          const state = cartBoxState(selection, colorway.id)
          const shown = model.colorwayId === colorway.id
          const stateLabel =
            state === 'epuise'
              ? strings.boxSoldOut
              : state === 'au-panier'
                ? strings.boxTaken
                : fill(strings.boxPrice, { prix: soloPrice })
          return (
            <button
              key={colorway.id}
              type="button"
              onClick={() => onShowColorway(colorway.id)}
              aria-current={shown ? 'true' : undefined}
              aria-label={fill(strings.boxA11y, { coloris: colorway.label, etat: stateLabel })}
              className={`flex min-h-11 flex-1 flex-col items-center justify-center rounded-lg border px-1 py-1.5 transition-colors duration-[var(--dur-element)] ${
                shown ? 'border-foreground' : 'border-border hover:border-muted-foreground'
              } ${state === 'au-panier' ? 'bg-success/10' : ''} ${state === 'epuise' ? 'opacity-55' : ''}`}
            >
              <span className="text-label truncate uppercase" translate="no" aria-hidden="true">
                {colorway.shortLabel}
              </span>
              <span
                aria-hidden="true"
                className={`flex items-center gap-0.5 text-[0.6875rem] leading-tight ${
                  state === 'au-panier' ? 'font-bold text-success' : 'text-muted-foreground'
                }`}
              >
                {state === 'au-panier' && <Check className="size-3" strokeWidth={3} />}
                {stateLabel}
              </span>
            </button>
          )
        })}

        {/* La 4e case : le leurre offert. Elle ne se coche pas — elle se mérite. */}
        <button
          type="button"
          onClick={onShowCollector}
          aria-label={fill(strings.giftA11y, { collector: PRODUCT.collector.label })}
          className={`flex min-h-11 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-1 py-1.5 transition-colors duration-[var(--dur-element)] ${
            giftState === 'a-choisir' ? 'border-success' : 'border-border'
          } ${giftState === 'suspendu' ? 'opacity-55' : ''}`}
        >
          <span className="text-label truncate uppercase" aria-hidden="true">
            {strings.boxGift}
          </span>
          <span
            aria-hidden="true"
            className={`text-[0.6875rem] leading-tight ${
              giftState === 'a-choisir' ? 'font-bold text-success' : 'text-muted-foreground'
            }`}
          >
            {giftLabel}
          </span>
        </button>
      </div>

      {/* ── Les actions : ajouter/retirer le leurre regardé, et commander ── */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {displayedOrderable && displayed && (
          <Button
            type="button"
            size="md"
            variant="ghost"
            onClick={() => onToggle(displayed.id)}
            className="gap-1.5"
          >
            {displayedTaken && <Check aria-hidden className="size-4" strokeWidth={2.5} />}
            <span translate="no">
              {fill(displayedTaken ? strings.remove : strings.add, {
                coloris: displayed.shortLabel,
              })}
            </span>
            <span className="sr-only" translate="no">
              {displayed.label}
            </span>
          </Button>
        )}

        {collectionOpen && (
          <Link
            href={`/leurre?offre=collection${selection[0] ? `&coloris=${selection[0]}` : ''}#offert`}
            className="px-btn px-btn--primary px-btn--md"
          >
            {strings.orderCollection}
          </Link>
        )}
      </div>

      {/* ── La ligne d'état : montée au premier rendu, jamais démontée ── */}
      <p
        aria-live="polite"
        className="min-h-8 text-center text-xs leading-snug text-muted-foreground"
      >
        {statusText}
      </p>

      {/* ── Les sorties : toujours au moins une, dans tous les états ── */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.75rem]">
        <button type="button" onClick={onOpenSheet} className="underline underline-offset-2">
          {strings.sheet}
        </button>
        {displayedOrderable && displayed && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <Link
              href={`/leurre?offre=solo&coloris=${displayed.id}`}
              className="underline underline-offset-2"
            >
              <span translate="no">{fill(strings.orderSolo, { coloris: displayed.shortLabel })}</span>
            </Link>
          </>
        )}
        {selection.length > 0 && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <button type="button" onClick={onClear} className="underline underline-offset-2">
              {strings.clear}
            </button>
          </>
        )}
      </div>

      <p className="text-center text-[0.6875rem] leading-tight text-muted-foreground">
        {fill(strings.footnote, { prix: soloPrice, delai: strings.deliveryDelay })}
      </p>
    </div>
  )
}

/**
 * L'action au pied de la fiche technique — EXACTEMENT le même geste que dans la
 * bande du panier, pour que le leurre ouvert se prenne sans refermer sa fiche.
 *
 * Un coloris épuisé n'affiche pas de bouton (jamais un bouton qui ment). Le
 * collector non plus : il ne se vend pas, il se choisit comme 4e leurre offert
 * sur la page produit — c'est le lien « Commander les 4 » de la bande qui y mène.
 */
function SheetAction({
  model,
  selection,
  strings,
  onToggle,
}: {
  model: LureModel
  selection: readonly string[]
  strings: CarouselStrings
  onToggle: (colorwayId: string) => void
}) {
  const colorwayId = model.colorwayId
  if (!colorwayId) return null
  const colorway = getColorway(colorwayId)
  if (!colorway) return null
  if (!colorway.available) {
    return <p className="text-[0.8125rem] text-muted-foreground">{strings.boxSoldOut}</p>
  }

  const inCart = isInCart(selection, colorwayId)
  return (
    <Button
      type="button"
      size="md"
      variant={inCart ? 'ghost' : undefined}
      onClick={() => onToggle(colorwayId)}
      className="w-full gap-2"
    >
      {inCart && <Check aria-hidden className="size-4" strokeWidth={2.5} />}
      <span translate="no">
        {fill(inCart ? strings.remove : strings.add, { coloris: colorway.shortLabel })}
      </span>
      <span className="sr-only" translate="no">
        {colorway.label}
      </span>
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
