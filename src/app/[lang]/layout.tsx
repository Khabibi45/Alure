import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import { glacial } from '@/lib/fonts'
import { SITE } from '@/lib/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema, webSiteSchema } from '@/lib/schemas'
import { SiteHeader } from '@/components/sections/SiteHeader'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { headerNav, langSwitcher } from '@/lib/i18n/chrome'
import {
  getDictionary,
  t,
  isLocale,
  localePath,
  PREFIXED_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/lib/i18n'

/**
 * LE layout racine des langues sous préfixe (`/en`, `/es`, `/de`, `/nl`) —
 * le pendant de `src/app/(fr)/layout.tsx` (structure « deux layouts racines »
 * de l'App Router : chacun porte son `<html lang>`, exigence du README i18n §4).
 *
 * `dynamicParams = false` : seules les langues déclarées existent — `/xyz`
 * retombe sur l'attrape-tout français, `/en/xyz` sur le 404 anglais.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${t(dict, 'META.BRAND')} — ${t(dict, 'META.TAGLINE')}`,
      template: `%s — ${SITE.name}`,
    },
    description: t(dict, 'META.DESCRIPTION'),
    openGraph: {
      type: 'website',
      locale: t(dict, 'META.LOCALE'),
      siteName: SITE.name,
      title: SITE.name,
      description: t(dict, 'META.DESCRIPTION'),
      url: localePath(lang, '/'),
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE.name }],
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  // Langue inconnue, ou français explicite (`/fr` serait un doublon de `/`).
  if (!isLocale(lang) || lang === DEFAULT_LOCALE) notFound()
  const locale: Locale = lang

  return (
    <html lang={locale}>
      {/* px-grain : le grain fondation (0.02) se pose UNE fois, sur la racine. */}
      <body className={`${glacial.variable} px-grain font-sans antialiased`}>
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <SiteHeader locale={locale} navItems={headerNav(locale)} switcher={langSwitcher(locale)} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  )
}
