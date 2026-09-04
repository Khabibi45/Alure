import type { Metadata } from 'next'
import { Hero } from '@/components/sections/home/Hero'
import { carouselStrings } from '@/lib/i18n/chrome'
import { getDictionary, t } from '@/lib/i18n'

/**
 * Variante du hero, pour comparer : la vidéo se joue seule au lieu d'être
 * pilotée par le défilement. Tout le reste est identique à l'accueil — même
 * texte, même carrousel 3D, même calage.
 *
 * Page de TRAVAIL, pas une page du site : `noindex` et absente du sitemap
 * (règle n°9 — une page pas prête est exclue des deux). À supprimer une fois
 * la variante tranchée.
 */
export const metadata: Metadata = {
  title: 'Hero — variante vidéo',
  description: 'Comparaison interne : le hero en lecture automatique plutôt qu’au défilement.',
  robots: { index: false, follow: false },
}

export default function HeroVideoPage() {
  return (
    <main>
      <Hero
        variant="video"
        strings={carouselStrings('fr')}
        title={t(getDictionary('fr'), 'HOME.H1')}
      />
    </main>
  )
}
