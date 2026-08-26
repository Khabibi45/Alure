'use client'

import { useEffect, useRef, useState } from 'react'
import { LURE_MODELS, SELLABLE_LURE_MODELS } from '@/lib/lure-models'
import { getColorway } from '@/lib/shop/product'
import { DEFAULT_LURE_VIEW, getLureView } from '@/lib/three/lure-views'
import { createLureStage, type LureStage } from '@/components/sections/home/lure-stage'
import { useColorwaySelection } from './colorway-context'
import { fillNodes } from './fill-nodes'
import type { LeurreStrings } from './leurre-strings'

type Status = 'loading' | 'ready' | 'unsupported' | 'failed'

/**
 * Le visuel principal de la page produit : le leurre en 3D, dans le coloris
 * sélectionné, qui nage sur place.
 *
 * Même scène que le hero de l'accueil, en mode `solo` : un seul leurre au centre,
 * les autres hors cadre. Changer de coloris déplace le rail — le modèle ne se
 * recharge pas, et le passage est amorti comme le reste du site.
 *
 * Le collector n'y figure pas : il ne se vend pas, il n'a pas de coloris à montrer ici.
 *
 * Ses textes arrivent du serveur (`leurreStrings(locale)`) : ils étaient en
 * français en dur, et `/en/leurre` annonçait donc « Chargement du leurre… » au
 * milieu d'une page anglaise.
 */
export function ColorwayViewer({ strings }: { strings: LeurreStrings }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<LureStage | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [loaded, setLoaded] = useState<readonly number[]>([])

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
      { solo: true }
    )
    stageRef.current = stage
    stage.setView(getLureView(DEFAULT_LURE_VIEW).rotation)

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => stage.setReducedMotion(motionQuery.matches)
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)

    const observer = new ResizeObserver(() => stage.resize())
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

  const broken = status === 'unsupported' || status === 'failed'

  return (
    <div
      ref={frameRef}
      className="relative aspect-square w-full overflow-hidden rounded-card bg-muted"
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
          reste hors traduction — c'est celui du reçu et de l'email. */}
      <p className="sr-only" aria-live="polite">
        {fillNodes(strings.viewerAlt, {
          coloris: <span translate="no">{colorwayLabel}</span>,
        })}
      </p>
    </div>
  )
}
