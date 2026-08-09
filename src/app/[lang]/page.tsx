import type { Metadata } from 'next'
import { Hero } from '@/components/sections/home/Hero'
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
  const dict = getDictionary(isLocale(lang) ? lang : 'fr')
  return (
    <main>
      <Hero variant={HERO_VARIANT} title={t(dict, 'HOME.H1')} />
    </main>
  )
}
