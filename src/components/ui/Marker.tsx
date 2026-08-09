import type { ElementType, ReactNode } from 'react'

interface MarkerProps {
  children: ReactNode
  /** Balise rendue (span par défaut ; 'strong', 'em'… selon la sémantique). */
  as?: ElementType
  /**
   * Tracé différé : le surligneur se dessine EN DERNIER (delay 0.3s), après
   * l'arrivée du contenu — la signature de la fondation (§6). Mettre à false
   * pour un surligneur statique (contenu déjà en place).
   */
  draw?: boolean
  className?: string
}

/**
 * Le surligneur Pastel (FONDATION-PASTEL.md §3) — SEULE façon de le poser.
 * Emplacements autorisés : titre de page, UN héros par écran, nav active
 * (pour la nav, utiliser la classe `px-marker-block` sur l'item, pas <Marker>).
 * La couleur vient de --color-accent-soft (couche 2).
 */
export function Marker({ children, as: Tag = 'span', draw = true, className }: MarkerProps) {
  const classes = ['px-marker', draw ? 'px-marker-draw' : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  return <Tag className={classes}>{children}</Tag>
}
