import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqList } from '@/components/sections/FaqList'
import { faqItems, faqJsonLd } from '@/lib/faq'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * La FAQ dans les langues sous préfixe — même contenu, même JSON-LD, depuis la
 * source unique multilingue. Le lien produit mène à la page FRANÇAISE tant que
 * `/leurre` n'est pas traduit (un lien qui marche vaut mieux qu'un 404).
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
    title: t(dict, 'NAV.FAQ'),
    description: t(dict, 'META.DESCRIPTION'),
    alternates: {
      canonical: localePath(lang, '/faq'),
      languages: hreflangAlternates('/faq').languages,
    },
  }
}

export default async function LangFaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  const items = faqItems(locale)
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <JsonLd data={faqJsonLd(items)} />
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
        {t(dict, 'NAV.FAQ')}
      </h1>

      <FaqList items={items} />

      <p className="mt-6">
        <Link href="/leurre" className="text-sm font-bold underline underline-offset-[3px]">
          {t(dict, 'HOME.CTA')}
        </Link>
      </p>
    </main>
  )
}
