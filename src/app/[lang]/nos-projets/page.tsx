import type { Metadata } from 'next'
import { PrecommandeSection } from '@/components/sections/PrecommandeSection'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'
import { formatEuros } from '@/lib/shop/product'
import { PRODUCT } from '@/lib/shop/product'
import { PRECOMMANDE_GOAL } from '@/lib/shop/precommande'

/**
 * « Nos projets » sous préfixe de langue — le pendant de
 * `src/app/(fr)/nos-projets/page.tsx`. Même contenu, même garde : si la
 * campagne est inactive, la page ne rend rien plutôt qu'une promesse creuse.
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
    title: t(dict, 'NAV.PROJECTS'),
    description: t(dict, 'PRECOMMANDE.INTRO', {
      objectif: String(PRECOMMANDE_GOAL),
      prixSolo: formatEuros(PRODUCT.pricing.soloCents, lang),
    }).slice(0, 155),
    alternates: {
      canonical: localePath(lang, '/nos-projets'),
      languages: hreflangAlternates('/nos-projets').languages,
    },
  }
}

export default async function LangNosProjetsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  return (
    <main>
      <PrecommandeSection locale={locale} />
    </main>
  )
}
