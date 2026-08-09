import type { ReactNode } from 'react'
import { Marker } from './Marker'

interface StatProps {
  /** Sur-titre (uppercase, espacé) — ex. « Séances ce mois ». */
  label: string
  /** Le chiffre — plafonné à text-stat (1.8rem), tabular-nums, jamais de mono. */
  value: ReactNode
  /** Unité accolée — ex. « / 16 », « min ». */
  unit?: string
  /** Ligne de contexte sous le chiffre. */
  hint?: string
  /** LE chiffre héros de l'écran (un seul !) : surligné au marqueur (§3). */
  hero?: boolean
  className?: string
}

/**
 * Bloc chiffre-clé fondation Pastel (FONDATION-PASTEL.md §4). À poser dans une
 * <Card>. `hero` réserve le surligneur à UN Stat par écran — pas deux.
 */
export function Stat({ label, value, unit, hint, hero = false, className }: StatProps) {
  return (
    <div className={className}>
      <p className="px-label mb-2">{label}</p>
      <p className="px-stat">
        {hero ? <Marker>{value}</Marker> : value}
        {unit ? <span className="px-unit">{unit}</span> : null}
      </p>
      {hint ? <p className="px-hint mt-2.5">{hint}</p> : null}
    </div>
  )
}
