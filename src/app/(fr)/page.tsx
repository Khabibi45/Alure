import type { Metadata } from 'next'
import { Hero } from '@/components/sections/home/Hero'
import { HERO_VARIANT } from '@/lib/hero-variant'
import { SITE } from '@/lib/site-config'
import { getDictionary, t, hreflangAlternates } from '@/lib/i18n'

export const metadata: Metadata = {
  // Titre absolu : l'accueil porte le nom + LA requête (« leurre articulé »),
  // pas le gabarit « %s — Alure » des pages intérieures.
  title: { absolute: `${SITE.name} — leurre articulé 2 sections pour black-bass et perche` },
  description: SITE.description,
  // hreflang réciproques : l'accueil existe dans les cinq langues.
  alternates: { canonical: '/', languages: hreflangAlternates('/').languages },
}

/**
 * Accueil. La mise en scène du hero vient de `HERO_VARIANT` — un seul mot à
 * changer pour basculer entre la séquence au défilement et la vidéo.
 * Le reste du scroll narratif arrive au LOT 3 avec les autres visuels.
 */
export default function HomePage() {
  return (
    <main>
      <Hero variant={HERO_VARIANT} title={t(getDictionary('fr'), 'HOME.H1')} />
    </main>
  )
}
