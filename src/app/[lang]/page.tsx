import type { Metadata } from 'next'
import { Hero } from '@/components/sections/home/Hero'
import { NextLure } from '@/components/sections/home/NextLure'
import { OrdersBanner } from '@/components/sections/OrdersBanner'
import { carouselStrings } from '@/lib/i18n/chrome'
import { HERO_VARIANT } from '@/lib/hero-variant'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * L'accueil dans les langues sous préfixe — même mise en scène que `/`
 * (la vidéo, le défilement réversible, le carrousel 3D), titre dans la langue.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    title: { absolute: `${t(dict, 'META.BRAND')} — ${t(dict, 'META.TAGLINE')}` },
    description: t(dict, 'META.DESCRIPTION'),
    alternates: {
      canonical: localePath(lang, '/'),
      languages: hreflangAlternates('/').languages,
    },
  }
}

export default async function LangHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  // Une SEULE résolution de la langue : le dictionnaire et les textes du hero
  // doivent parler la même, sinon la page mélange deux langues sans rien dire.
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  return (
    <main>
      <Hero variant={HERO_VARIANT} title={t(dict, 'HOME.H1')} strings={carouselStrings(locale)} />
      <NextLure locale={locale} />
      <OrdersBanner locale={locale} href={localePath(locale, '/nos-projets')} />
    </main>
  )
}
