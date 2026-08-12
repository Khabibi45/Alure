'use client'

import { useEffect, useRef, useState } from 'react'
import { ALURE_ARROW_PATH, ALURE_ARROW_VIEWBOX } from './AlureArrow'

/**
 * PROTOTYPE (test local) — LE chargement Alure : la flèche du logo qui SE
 * DESSINE au rythme du chargement, avec le libellé dans la typo du wordmark.
 *
 * Un seul indicateur de chargement pour tout le site (page, leurre 3D,
 * changement de langue…) : il se pose À L'ENDROIT du contenu qui charge.
 *
 * Deux modes :
 *   - `progress` fourni (0..1) : le tracé avance EXACTEMENT à la progression
 *     réelle — connexion lente, dessin lent ; cache plein, éclair. Jamais de
 *     fausse barre (échec bruyant, jamais un chiffre faux).
 *   - sans `progress` : chargement non mesurable (navigation, modèle sans
 *     Content-Length) — le tracé se dessine en boucle, comme une respiration.
 *
 * Technique : `pathLength=1` normalise le contour ; `stroke-dashoffset`
 * = 1 − progression trace le trait ; le remplissage fond à l'arrivée.
 *
 * `prefers-reduced-motion` : aucun tracé animé — logo plein + libellé (et le
 * pourcentage si mesurable). Le libellé porte le sens, l'animation est un plus.
 */

/** Durée d'un aller du tracé en mode non mesurable (le retour dure autant). */
const SWEEP_MS = 1500

export function AlureLoader({
  progress = null,
  label = 'Chargement.',
  showPercent = true,
  arrowClassName = 'w-40 sm:w-52',
  className = '',
}: {
  /** Progression réelle 0..1, ou `null`/absent si non mesurable. */
  progress?: number | null
  /** Libellé affiché dans la typo du wordmark (vient du dictionnaire en zone i18n). */
  label?: string
  /**
   * `false` quand la progression pilote le tracé SANS être une mesure (splash
   * sur durée définie) : afficher un « % » serait un chiffre inventé.
   */
  showPercent?: boolean
  /** Taille de la flèche — le hero la veut plus grande que les états de page. */
  arrowClassName?: string
  className?: string
}) {
  const [reducedMotion, setReducedMotion] = useState(false)
  /** Progression du tracé en mode boucle (non mesurable). */
  const [sweep, setSweep] = useState(0)
  const frameRef = useRef(0)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const indeterminate = progress === null || progress === undefined
  useEffect(() => {
    if (!indeterminate || reducedMotion) return
    const start = performance.now()
    const tick = (now: number) => {
      frameRef.current = requestAnimationFrame(tick)
      // ALLER-RETOUR (le trait se dessine puis se retire) : aucun saut de
      // remise à zéro — c'est ce qui rendait la boucle mécanique.
      const cycle = ((now - start) / SWEEP_MS) % 2
      const raw = cycle < 1 ? cycle : 2 - cycle
      // Amorti aux deux bouts : un tracé à vitesse constante fait mécanique.
      setSweep(raw < 0.5 ? 2 * raw * raw : 1 - (-2 * raw + 2) ** 2 / 2)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [indeterminate, reducedMotion])

  const clamped = indeterminate ? sweep : Math.min(1, Math.max(0, progress ?? 0))
  const drawn = reducedMotion ? 1 : clamped
  const complete = drawn >= 1

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped * 100)}
      aria-label={label}
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      <svg
        viewBox={ALURE_ARROW_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        className={arrowClassName}
      >
        <path
          d={ALURE_ARROW_PATH}
          fillRule="evenodd"
          pathLength={1}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{
            // Le trait avance à la progression ; le corps se REMPLIT
            // progressivement (cube de la progression : discret au début,
            // franc sur la fin) — plus de saut d'opacité à l'arrivée.
            strokeDasharray: 1,
            strokeDashoffset: 1 - drawn,
            fillOpacity: reducedMotion || complete ? 1 : 0.05 + drawn ** 3 * 0.95,
            transition: 'fill-opacity 200ms linear',
          }}
        />
      </svg>
      {/* Le libellé, dans la typo du wordmark — c'est lui qui dit « chargement ». */}
      <p className="font-display text-sm font-bold tracking-[0.12em] uppercase">
        {label}
        {!indeterminate && showPercent && (
          <span className="tabular-nums"> {Math.round(clamped * 100)}%</span>
        )}
      </p>
    </div>
  )
}
