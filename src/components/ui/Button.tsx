import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = l'action ; ghost = secondaire (fond creux — jamais de bordure). */
  variant?: 'primary' | 'ghost'
  /** md = UI dense (36px) ; lg = marketing / mobile (44px, cible tactile a11y). */
  size?: 'md' | 'lg'
}

/**
 * Bouton fondation Pastel (FONDATION-PASTEL.md §2, §6) : pill, zéro bordure,
 * press qui répond avant de rebondir (0.14s enfoncé / 0.28s relâché).
 * `type` reste explicite à l'usage ('button' | 'submit') — pas de défaut caché.
 */
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const classes = ['px-btn', `px-btn--${variant}`, `px-btn--${size}`, className ?? '']
    .filter(Boolean)
    .join(' ')
  return <button className={classes} {...props} />
}
