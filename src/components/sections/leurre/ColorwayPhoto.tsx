'use client'

import Image from 'next/image'
import { useColorwaySelection } from './colorway-context'
import type { LeurreStrings } from './leurre-strings'

/**
 * La photo du leurre dans le coloris choisi — le premier visuel de la page
 * produit, au-dessus de la visionneuse 3D.
 *
 * L'ordre est délibéré (décision Camil du 2026-09-01) : une photo dit ce qu'on
 * reçoit, la 3D dit comment c'est fait. On montre donc le produit d'abord, et
 * la manipulation ensuite — la 3D garde ce qu'elle seule apporte, les six
 * angles et la rotation libre.
 *
 * `priority` : c'est l'image la plus grande au-dessus de la ligne de flottaison,
 * donc le LCP de la page qui vend. La laisser en chargement paresseux la ferait
 * arriver après le reste.
 */
export function ColorwayPhoto({ strings }: { strings: LeurreStrings }) {
  const { coloris } = useColorwaySelection()
  // Même garde que la galerie de détails : un coloris inconnu retombe sur le
  // premier leurre photographié plutôt que sur un cadre vide.
  const photo = strings.photos[coloris] ?? Object.values(strings.photos)[0]

  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={1200}
      height={900}
      sizes="(min-width: 768px) 50vw, 100vw"
      priority
      className="rounded-card shadow-card h-auto w-full"
    />
  )
}
