import type { Metadata } from 'next'
import Link from 'next/link'
import { Marker } from '@/components/ui/Marker'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * Le retour de paiement Stripe dans les langues sous préfixe — le pendant de
 * `src/app/(fr)/merci/page.tsx`.
 *
 * Deux choses ne bougent pas d'une langue à l'autre :
 *
 * 1. `noindex`. C'est une page de retour de paiement : elle n'a aucune valeur
 *    d'index, elle est hors sitemap et `robots.ts` la bloque. La version
 *    anglaise doit porter le même `noindex` que la française, sinon `/en/merci`
 *    finit indexée alors que `/merci` ne l'est pas.
 * 2. Aucune vérification de session. Le contenu reste générique et honnête
 *    (« si votre paiement a été validé ») : c'est l'email envoyé par le webhook
 *    qui fait foi, pas cette page.
 *
 * Le délai vient de `PRODUCT.DELAY_VALUE` (dictionnaire) et JAMAIS de
 * `PRODUCT.deliveryDelay`, qui est une chaîne française en dur — elle donnerait
 * « delivered within 10 à 20 jours ouvrés » au milieu d'une phrase anglaise.
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
    title: t(dict, 'THANKS.TITLE'),
    description: t(dict, 'THANKS.BODY'),
    // Page de retour Stripe : jamais indexée (exclue du sitemap + robots).
    robots: { index: false, follow: false },
    alternates: {
      canonical: localePath(lang, '/merci'),
      languages: hreflangAlternates('/merci').languages,
    },
  }
}

export default async function LangThanksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  // Une SEULE résolution de la langue : le dictionnaire et les liens doivent
  // parler la même, sinon la page mélange deux langues sans rien dire.
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-4 py-16">
      {/* Le panier composé sur l'accueil n'a plus lieu d'être : la commande est
          partie. Sans ça, le hero le réaffichait au retour. */}
      <h1 className="text-3xl font-bold text-balance md:text-4xl">
        <Marker>{t(dict, 'THANKS.TITLE_MARK')}</Marker> {t(dict, 'THANKS.TITLE_REST')}
      </h1>
      <p className="mt-6 leading-relaxed">{t(dict, 'THANKS.BODY')}</p>
      {/* Le délai en gras, comme sur la page française : règle Alure n°1, il se
          ré-affiche après l'achat, jamais atténué. */}
      <p className="mt-4 leading-relaxed">
        <strong>{t(dict, 'THANKS.DELIVERY', { delai: t(dict, 'PRODUCT.DELAY_VALUE') })}</strong>{' '}
        {t(dict, 'THANKS.DELIVERY_NOTE')}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">{t(dict, 'THANKS.NO_EMAIL')}</p>
      <p className="mt-10">
        <Link
          href={localePath(locale, '/')}
          className="text-sm font-semibold underline underline-offset-4"
        >
          {t(dict, 'THANKS.CTA')}
        </Link>
      </p>
    </main>
  )
}
