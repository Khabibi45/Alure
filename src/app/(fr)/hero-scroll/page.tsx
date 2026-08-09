import type { Metadata } from 'next'
import { Hero } from '@/components/sections/home/Hero'
import { getDictionary, t } from '@/lib/i18n'

/**
 * La variante « défilement », toujours, quelle que soit `HERO_VARIANT`.
 * Elle sert à comparer les deux mises en scène côte à côte — pas à refléter la
 * décision. Sa jumelle : `/hero-video`.
 *
 * Page de TRAVAIL : `noindex` + hors sitemap (règle n°9). À supprimer avec sa
 * jumelle une fois la variante tranchée.
 */
export const metadata: Metadata = {
  title: 'Hero — variante défilement',
  description: 'Comparaison interne : le hero piloté au défilement.',
  robots: { index: false, follow: false },
}

export default function HeroScrollPage() {
  return (
    <main>
      <Hero variant="scroll" title={t(getDictionary('fr'), 'HOME.H1')} />
    </main>
  )
}
