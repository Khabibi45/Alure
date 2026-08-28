import type { Metadata } from 'next'
import { ProjectsPage } from '@/components/sections/ProjectsPage'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'
import { PRECOMMANDE_GOAL } from '@/lib/shop/precommande'

/**
 * « Nos projets » sous préfixe de langue — le pendant de
 * `src/app/(fr)/nos-projets/page.tsx`. Même corps, même source de textes.
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
    title: t(dict, 'PROJECTS.TITLE'),
    description: t(dict, 'PROJECTS.DESCRIPTION', {
      delai: t(dict, 'PRODUCT.DELAY_VALUE'),
      objectif: String(PRECOMMANDE_GOAL),
    }),
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
  return (
    <main>
      <ProjectsPage locale={isLocale(lang) ? lang : 'fr'} />
    </main>
  )
}
