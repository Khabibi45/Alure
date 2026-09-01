'use client'

import { useEffect, useRef, useState } from 'react'
import { LURE_MODELS, SELLABLE_LURE_MODELS } from '@/lib/lure-models'
import { getColorway } from '@/lib/shop/product'
import {
  DEFAULT_LURE_VIEW,
  LURE_VIEWS,
  ORBIT_KEY_STEP,
  ORBIT_RADIANS_PER_FRAME_WIDTH,
  getLureView,
  type LureViewId,
} from '@/lib/three/lure-views'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createLureStage, type LureStage } from '@/components/sections/home/lure-stage'
import { useColorwaySelection } from './colorway-context'
import { fillNodes } from './fill-nodes'
import type { LeurreStrings } from './leurre-strings'

type Status = 'loading' | 'ready' | 'unsupported' | 'failed'

/**
 * Le visuel principal de la page produit : le leurre en 3D, dans le coloris
 * sélectionné, IMMOBILE.
 *
 * Même scène que le hero de l'accueil, en mode `solo` : un seul leurre au centre,
 * les autres hors cadre. Changer de coloris déplace le rail — le modèle ne se
 * recharge pas, et le passage est amorti comme le reste du site.
 *
 * Mais contrairement à l'accueil, il ne nage PAS (option `still`, consigne Camil
 * du 2026-09-01) : ici on compare deux coloris et on détaille une forme, et un
 * mouvement permanent empêche exactement ces deux gestes. Sur l'accueil, où la
 * nage est l'argument, elle continue.
 *
 * Le collector n'y figure pas : il ne se vend pas, il n'a pas de coloris à montrer ici.
 *
 * Ses textes arrivent du serveur (`leurreStrings(locale)`) : ils étaient en
 * français en dur, et `/en/leurre` annonçait donc « Chargement du leurre… » au
 * milieu d'une page anglaise.
 *
 * ── LA ROTATION LIBRE (consigne Camil 2026-08-28) ──
 *
 * On oriente le leurre à la main, sur 360° en lacet et d'un quart de tour en
 * tangage. Trois choix qui méritent d'être dits :
 *
 * 1. **`touch-pan-y`, comme le carrousel de l'accueil.** Le cadre est un carré
 *    pleine largeur : capter les deux axes au doigt confisquerait le défilement
 *    de la page sur son plus gros élément. Le geste vertical part donc au
 *    défilement ; l'horizontal nous revient, et une fois le pointeur capturé le
 *    navigateur nous laisse aussi le vertical. On perd le tangage au premier
 *    geste vertical pur — au doigt, il reste accessible par les six vues.
 * 2. **Aucun `setState` dans le chemin du geste.** Le pointeur et le dernier
 *    point vivent dans des refs : à 60 images par seconde, un rendu React par
 *    déplacement ferait ramer une scène qui, elle, tourne déjà très bien.
 * 3. **La barre des six vues sert de retour à un angle nommé.** Pas de bouton
 *    « recentrer » en plus : les six vues SONT les points remarquables de
 *    l'espace de rotation. Après un glissé libre, aucune n'est enfoncée — le
 *    contrôle n'affirme jamais un angle qui n'est pas celui affiché.
 */
export function ColorwayViewer({ strings }: { strings: LeurreStrings }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<LureStage | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [loaded, setLoaded] = useState<readonly number[]>([])
  /**
   * L'angle courant : soit une vue nommée, soit « libre » après un glissé.
   * Une union plutôt qu'un `LureViewId` avec une valeur sentinelle — l'état
   * « aucune vue nommée » doit être représentable, pas deviné.
   */
  const [view, setView] = useState<{ kind: 'preset'; id: LureViewId } | { kind: 'libre' }>({
    kind: 'preset',
    id: DEFAULT_LURE_VIEW,
  })
  const orbitRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null)
  /** La largeur du cadre, tenue à jour par le ResizeObserver déjà monté. */
  const frameSizeRef = useRef(0)

  const { coloris } = useColorwaySelection()
  const index = Math.max(
    0,
    SELLABLE_LURE_MODELS.findIndex((m) => m.colorwayId === coloris)
  )
  const colorwayLabel = getColorway(coloris)?.label ?? ''
  const isLoaded = loaded.includes(index)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return

    const stage = createLureStage(
      canvas,
      SELLABLE_LURE_MODELS.map((m) => ({ src: m.src })),
      {
        onLoaded: (i) => {
          setLoaded((current) => (current.includes(i) ? current : [...current, i]))
          setStatus('ready')
        },
        onError: (i, error) => {
          console.error(`Page produit : échec du chargement de ${LURE_MODELS[i]?.src}.`, error)
          setStatus('failed')
        },
        onUnavailable: (error) => {
          console.error('Page produit : contexte WebGL indisponible.', error)
          setStatus('unsupported')
        },
      },
      // `still` : sur la page produit, le leurre ne nage pas. On y compare des
      // coloris et on détaille une forme — un mouvement permanent empêche les deux.
      { solo: true, still: true }
    )
    stageRef.current = stage
    stage.setView(getLureView(DEFAULT_LURE_VIEW).rotation)

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => stage.setReducedMotion(motionQuery.matches)
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)

    frameSizeRef.current = frame.clientWidth
    const observer = new ResizeObserver(() => {
      frameSizeRef.current = frame.clientWidth
      stage.resize()
    })
    observer.observe(frame)
    const visibility = new IntersectionObserver(
      ([entry]) => stage.setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 }
    )
    visibility.observe(frame)
    const onVisibilityChange = () => stage.setRunning(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      motionQuery.removeEventListener('change', syncMotion)
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stage.dispose()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.setTarget(index)
    stage.load(index)
  }, [index])

  // Une vue nommée réoriente le leurre ; le mode libre ne touche à rien (c'est
  // le geste qui a déjà écrit l'angle dans le moteur).
  useEffect(() => {
    if (view.kind !== 'preset') return
    stageRef.current?.setView(getLureView(view.id).rotation)
  }, [view])

  const broken = status === 'unsupported' || status === 'failed'

  /** Radians par pixel, dérivés de la largeur RÉELLE du cadre. */
  const radiansPerPixel = () => ORBIT_RADIANS_PER_FRAME_WIDTH / Math.max(1, frameSizeRef.current)

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (broken) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    orbitRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    stageRef.current?.beginOrbit()
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const orbit = orbitRef.current
    if (!orbit || orbit.pointerId !== event.pointerId) return
    // Incrément depuis le DERNIER point, pas depuis le point de départ : le
    // carrousel de l'accueil, lui, envoie un décalage absolu — les deux calculs
    // se ressemblent et ne s'échangent pas.
    const rad = radiansPerPixel()
    stageRef.current?.orbitBy(
      (event.clientX - orbit.lastX) * rad,
      (event.clientY - orbit.lastY) * rad
    )
    orbit.lastX = event.clientX
    orbit.lastY = event.clientY
    // Le geste a quitté les angles nommés : aucun bouton ne doit rester enfoncé.
    setView((current) => (current.kind === 'libre' ? current : { kind: 'libre' }))
  }

  // Les TROIS fins : un `pointercancel` ou une capture perdue sans cette garde
  // laisserait le moteur en suivi 1:1 pour toujours.
  const endOrbit = (event: React.PointerEvent<HTMLDivElement>) => {
    const orbit = orbitRef.current
    if (!orbit || orbit.pointerId !== event.pointerId) return
    orbitRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    stageRef.current?.endOrbit()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (broken) return
    const step = ORBIT_KEY_STEP
    const moves: Record<string, readonly [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const move = moves[event.key]
    if (move) {
      // Sans ça, les flèches font aussi défiler la page sous le leurre.
      event.preventDefault()
      stageRef.current?.orbitBy(move[0], move[1])
      setView((current) => (current.kind === 'libre' ? current : { kind: 'libre' }))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setView({ kind: 'preset', id: DEFAULT_LURE_VIEW })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={frameRef}
        role="group"
        aria-label={strings.viewerLabel}
        tabIndex={broken ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endOrbit}
        onPointerCancel={endOrbit}
        onLostPointerCapture={endOrbit}
        onKeyDown={onKeyDown}
        className="rounded-card bg-muted relative aspect-square w-full cursor-grab touch-pan-y overflow-hidden select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)] active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

        {broken && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {strings.viewerNoWebgl}
          </p>
        )}

        {!broken && !isLoaded && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {strings.viewerLoading}
          </p>
        )}

        {/* Le canvas est aria-hidden : voici ce qu'il montre. Le nom du coloris
            reste hors traduction — c'est celui du reçu et de l'email.
            Cette région ne suit PAS le glissé : à 60 images par seconde elle
            transformerait le lecteur d'écran en machine à parler. Elle ne
            reflète que le coloris et l'angle NOMMÉ. */}
        <p className="sr-only" aria-live="polite">
          {fillNodes(strings.viewerAlt, {
            coloris: <span translate="no">{colorwayLabel}</span>,
          })}
          {view.kind === 'preset'
            ? ` ${strings.viewDescriptions[view.id]}.`
            : ` ${strings.viewerFree}`}
        </p>
      </div>

      {!broken && (
        <>
          <SegmentedControl
            ariaLabel={strings.viewsLabel}
            value={view.kind === 'preset' ? view.id : null}
            onChange={(id) => setView({ kind: 'preset', id })}
            options={LURE_VIEWS.map((v) => ({ value: v.id, label: strings.views[v.id] }))}
            className="px-seg--sm"
          />
          <p className="text-muted-foreground text-center text-[0.75rem]">{strings.viewerHint}</p>
        </>
      )}
    </div>
  )
}
