'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AlureLoader } from './AlureLoader'

/**
 * PROTOTYPE (test local) — le rideau de chargement Alure : la flèche se
 * dessine sur une DURÉE DÉFINIE, puis le voile se dissout.
 *
 * Il se joue à CHAQUE chargement (demande Camil) :
 *   - arrivée sur le site et rafraîchissement (montage initial) ;
 *   - CHAQUE navigation interne (`usePathname`), MÊME si la page est en cache
 *     et s'afficherait instantanément — le temps de marque a toujours lieu.
 *     La remise à zéro se fait PENDANT le rendu (état dérivé du pathname) :
 *     le rideau est dans le même commit que la nouvelle page, aucun flash.
 *
 * Le tracé est piloté par le TEMPS, pas par une mesure : le pourcentage est
 * masqué (`showPercent={false}`) — un « 47 % » qui ne mesure rien serait un
 * chiffre inventé. Les vrais chargements mesurables gardent leur pourcentage.
 *
 * FILET DE SÉCURITÉ sans JavaScript : l'enveloppe porte l'animation CSS
 * `px-splash-failsafe` (globals.css) — le rideau s'efface SEUL à 2,6 s si
 * l'hydratation n'arrive pas. `key={pathname}` remonte l'enveloppe à chaque
 * navigation, sinon l'animation `forwards` resterait figée sur `hidden`.
 *
 * `prefers-reduced-motion` : aucun rideau, la page directement.
 */

/** La durée définie du tracé, puis celle du fondu de sortie. */
const SPLASH_DRAW_MS = 1500
const SPLASH_FADE_MS = 550
/** Le filet CSS dépasse le déroulé React (~2,05 s) : il ne se voit que si
 *  l'hydratation a échoué. */
const SPLASH_FAILSAFE_MS = 2600

type Phase = 'drawing' | 'leaving' | 'done'

export function SplashScreen({ label = 'Chargement.' }: { label?: string }) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('drawing')
  const [progress, setProgress] = useState(0)

  // État DÉRIVÉ du pathname, mis à jour pendant le rendu (pattern React
  // officiel) : le rideau réapparaît dans le MÊME commit que la nouvelle page.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setPhase('drawing')
    setProgress(0)
  }

  useEffect(() => {
    // Lu à CHAQUE déclenchement : la préférence peut changer entre deux pages.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      // Mouvement réduit : aucun rideau — la page, tout de suite.
      if (reducedMotion) {
        setPhase('done')
        return
      }
      const raw = Math.min((now - start) / SPLASH_DRAW_MS, 1)
      // Amorti aux DEUX bouts (easeInOutCubic) : le trait part et se pose en
      // douceur, sans à-coup de démarrage ni butée de fin.
      setProgress(raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2)
      if (raw < 1) frame = requestAnimationFrame(tick)
      else setPhase('leaving')
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    if (phase !== 'leaving') return
    const timer = setTimeout(() => setPhase('done'), SPLASH_FADE_MS)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'done') return null

  return (
    // L'enveloppe porte le FILET DE SÉCURITÉ CSS (auto-effacement sans JS) ;
    // l'intérieur porte le fondu piloté par React. Séparés : une animation CSS
    // écraserait la transition inline sur la même propriété.
    <div
      key={pathname}
      aria-hidden="true"
      className="fixed inset-0 z-[100]"
      style={{ animation: `px-splash-failsafe ${SPLASH_FAILSAFE_MS}ms ease forwards` }}
    >
      <div
        className="flex h-full w-full items-center justify-center bg-background text-foreground"
        style={{
          opacity: phase === 'leaving' ? 0 : 1,
          transition: `opacity ${SPLASH_FADE_MS}ms var(--ease-out-soft)`,
          pointerEvents: phase === 'leaving' ? 'none' : 'auto',
        }}
      >
        <AlureLoader progress={progress} showPercent={false} label={label} />
      </div>
    </div>
  )
}
