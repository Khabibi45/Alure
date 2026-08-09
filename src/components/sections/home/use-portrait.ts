'use client'

import { useEffect, useState } from 'react'

/**
 * `true` quand l'écran est en PORTRAIT — le signal qui fait servir la vidéo
 * téléphone (`HERO_VIDEO_MOBILE`, recadrage central 9:16) et caler la caméra 3D
 * sur la largeur (`lure-stage`).
 *
 * Démarre à `false` (rendu serveur = mise en scène paysage) et se corrige au
 * montage : les composants qui en dépendent re-rendent une fois, avant toute
 * lecture vidéo.
 */
export function useIsPortrait(): boolean {
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(orientation: portrait)')
    const sync = () => setPortrait(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return portrait
}
