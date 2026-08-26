import type { Metadata } from 'next'
import { ContactForm } from '@/components/sections/contact/ContactForm'
import { contactStrings } from '@/lib/i18n/contact-strings'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * Le contact dans les langues sous préfixe — même page que `/contact`, mêmes
 * champs, textes depuis la source unique multilingue.
 *
 * Pas de `<Marker>` sur le titre : le surligneur découpe le titre français en
 * deux morceaux (« Nous <Marker>écrire</Marker> »), et ce découpage ne survit
 * pas au changement d'ordre des mots d'une langue à l'autre. `[lang]/faq`
 * tranche déjà pareil — titre plein, une seule clé.
 *
 * `ContactForm` est un îlot client : ses textes ne peuvent pas venir du
 * dictionnaire (il partirait entier dans le bundle navigateur). Ils sont donc
 * préparés ICI, côté serveur, par `contactStrings(locale)` — y compris les
 * messages de refus du schéma zod partagé.
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
    title: t(dict, 'NAV.CONTACT'),
    description: t(dict, 'CONTACT.META_DESCRIPTION'),
    alternates: {
      canonical: localePath(lang, '/contact'),
      languages: hreflangAlternates('/contact').languages,
    },
  }
}

export default async function LangContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
        {t(dict, 'CONTACT.TITLE')}
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{t(dict, 'CONTACT.INTRO')}</p>
      <div className="mt-8">
        <ContactForm strings={contactStrings(locale)} />
      </div>
    </main>
  )
}
