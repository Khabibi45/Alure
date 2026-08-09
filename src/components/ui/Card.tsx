import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift au survol (translateY −3px + ombre) — à couper si la carte n'est pas interactive. */
  hover?: boolean
}

/**
 * Carte fondation Pastel (FONDATION-PASTEL.md §2) : surface tonale posée sur le
 * fond, radius 1rem, UNE ombre diffuse, zéro bordure. La hiérarchie interne se
 * fait avec px-label / px-stat / px-hint (ou <Stat>).
 */
export function Card({ hover = false, className, ...props }: CardProps) {
  const classes = ['px-card', hover ? 'px-card--hover' : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  return <div className={classes} {...props} />
}
