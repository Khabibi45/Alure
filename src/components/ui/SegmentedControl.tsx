'use client'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>
  /**
   * `null` = aucune option sélectionnée. Nécessaire dès qu'un autre geste peut
   * amener dans un état qu'aucun bouton ne décrit — la rotation libre du leurre,
   * par exemple. Laisser un bouton enfoncé affirmerait alors une valeur fausse.
   */
  value: T | null
  onChange: (value: T) => void
  /** Libellé du groupe pour les lecteurs d'écran — ex. « Période affichée ». */
  ariaLabel: string
  className?: string
}

/**
 * Segmented control fondation Pastel (FONDATION-PASTEL.md §2) : conteneur pill
 * en creux (--color-muted), sélection = surface posée avec ombre légère.
 * C'est LA forme validée — jamais d'onglets « texte + point » (interdit §8).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={['px-seg', className ?? ''].filter(Boolean).join(' ')}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
