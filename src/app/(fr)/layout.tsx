import type { Metadata } from 'next'
import '../globals.css'
import { glacial } from '@/lib/fonts'
import { SITE } from '@/lib/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema, webSiteSchema } from '@/lib/schemas'
import { SiteHeader } from '@/components/sections/SiteHeader'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { headerNav, langSwitcher } from '@/lib/i18n/chrome'

/**
 * LE layout racine français — le site vit à la racine (`/`), c'est le marché
 * réel. Les autres langues ont leur propre racine sous `src/app/[lang]/`
 * (structure « deux layouts racines » de l'App Router : chacun porte son
 * `<html lang>`). L'habillage commun (police, header, footer) est partagé.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — le leurre articulé deux sections`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
    images: ['/og-image.png'],
  },
}

// Scroll narratif : tranché en `position: sticky` natif (HeroScroll) — gsap et
// lenis ont été retirés du projet, le piège du pin est documenté dans
// docs/standards/WEB-REFERENCE.md.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* px-grain : le grain fondation (0.02) se pose UNE fois, sur la racine. */}
      <body className={`${glacial.variable} px-grain font-sans antialiased`}>
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <SiteHeader locale="fr" navItems={headerNav('fr')} switcher={langSwitcher('fr')} />
        {children}
        <SiteFooter locale="fr" />
      </body>
    </html>
  )
}
