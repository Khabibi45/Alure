'use client'

import { useEffect, useRef, useState } from 'react'
import { AlureLoader } from '@/components/ui/AlureLoader'
import { NEXT_LURE_MODEL } from '@/lib/lure-models'
import { createLureStage } from './lure-stage'

/** Vitesse du tour sur lui-même, en radians par seconde. Un tour ≈ 25 s. */
const SPIN_RADIANS_PER_SECOND = 0.25

type Status = 'idle' | 'loading' | 'ready' | 'unsupported' | 'failed'

/**
 * Le prochain leurre, en 3D, qui tourne lentement sur lui-même.
 *
 * ── POURQUOI IL NE SE CHARGE PAS TOUT DE SUITE ──
 *
 * Le modèle pèse 8,4 Mo et la section vit SOUS la ligne de flottaison. Le
 * télécharger au chargement de l'accueil ferait payer à chaque visiteur — sur
 * mobile, souvent en 4G — un fichier que la plupart ne verront jamais. La scène
 * n'est donc montée qu'à l'entrée dans le champ (`IntersectionObserver`), et la
 * boucle de rendu s'arrête dès qu'elle en sort (`setRunning`) : un canvas WebGL
 * qui tourne hors écran consomme de la batterie pour rien.
 *
 * ── LA ROTATION ──
 *
 * `beginOrbit()` une fois, puis un incrément par image : la pose suit sans
 * amortissement, donc la rotation est régulière au lieu de traîner derrière sa
 * cible. Le leurre ne NAGE pas (`still`) — ici on montre une forme qu'on ne peut
 * pas encore acheter, pas une nage.
 *
 * `prefers-reduced-motion` coupe la rotation : le leurre reste posé sur son
 * angle de départ, visible et net (règle n°8). Ce n'est pas un repli dégradé,
 * c'est la même scène immobile.
 */
export function NextLureViewer({
  loadingLabel,
  description,
}: {
  loadingLabel: string
  description: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  // Entrée dans le champ : c'est ce qui déclenche le téléchargement, une fois.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return

    setStatus('loading')
    const stage = createLureStage(
      canvas,
      [{ src: NEXT_LURE_MODEL }],
      {
        onLoaded: () => setStatus('ready'),
        onError: (_index, error) => {
          console.error(`Accueil : échec du chargement de ${NEXT_LURE_MODEL}.`, error)
          setStatus('failed')
        },
        onUnavailable: (error) => {
          console.error('Accueil : contexte WebGL indisponible pour le prochain leurre.', error)
          setStatus('unsupported')
        },
      },
      { solo: true, still: true }
    )
    stage.load(0)

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => stage.setReducedMotion(motionQuery.matches)
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)

    const resizeObserver = new ResizeObserver(() => stage.resize())
    resizeObserver.observe(frame)

    // La boucle de rendu ne tourne que quand la scène est à l'écran.
    const runObserver = new IntersectionObserver((entries) => {
      stage.setRunning(entries.some((entry) => entry.isIntersecting))
    })
    runObserver.observe(frame)

    let raf = 0
    let last = performance.now()
    stage.beginOrbit()
    const spin = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      if (!motionQuery.matches) stage.orbitBy(delta * SPIN_RADIANS_PER_SECOND, 0)
      raf = requestAnimationFrame(spin)
    }
    raf = requestAnimationFrame(spin)

    return () => {
      cancelAnimationFrame(raf)
      runObserver.disconnect()
      resizeObserver.disconnect()
      motionQuery.removeEventListener('change', syncMotion)
      stage.endOrbit()
      stage.dispose()
    }
  }, [visible])

  return (
    <div ref={frameRef} className="relative aspect-square w-full">
      <canvas ref={canvasRef} aria-hidden className="size-full" />

      {/* L'équivalent textuel : un canvas ne dit rien tout seul. */}
      <p className="sr-only">{description}</p>

      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {status === 'unsupported' || status === 'failed' ? (
            // Échec bruyant, mais sobre : la section garde son texte, qui porte
            // déjà tout le message. On ne fabrique pas un visuel de remplacement.
            <p className="px-5 text-center text-[0.9375rem] text-muted-foreground">{description}</p>
          ) : (
            <AlureLoader label={loadingLabel} />
          )}
        </div>
      )}
    </div>
  )
}
