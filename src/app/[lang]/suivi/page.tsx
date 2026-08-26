import type { Metadata } from 'next'
import Link from 'next/link'
import { Marker } from '@/components/ui/Marker'
import { getDictionary, t, isLocale, localePath, hreflangAlternates, type Dict } from '@/lib/i18n'

/**
 * Suivi de commande dans les langues sous préfixe — le pendant exact de
 * `src/app/(fr)/suivi/page.tsx` (spec boutique.md T4).
 *
 * Sans compte ni BDD : la page explique le parcours réel ; le numéro de suivi
 * fait foi et arrive par email. C'est LA page qu'un acheteur rouvre pendant les
 * 10 à 20 jours d'attente — elle ne pouvait pas rester française seule.
 *
 * Le délai vient de `PRODUCT.DELAY_VALUE`, jamais de `PRODUCT.deliveryDelay`
 * (chaîne française en dur) : une page anglaise qui annonce « 10 à 20 jours
 * ouvrés » est une promesse illisible.
 *
 * L'encadré « livraison France uniquement » est la contrepartie non négociable
 * de la version anglaise (docs/i18n/README.md §0) : un lecteur anglophone n'a
 * aucune raison de deviner que la boutique n'expédie qu'en France, et cette
 * page-ci parle justement d'acheminement.
 */

/** Les quatre étapes, dans l'ordre du parcours réel. Le délai total n'apparaît qu'à la dernière. */
function trackingSteps(dict: Dict): { title: string; detail: string }[] {
  const delai = t(dict, 'PRODUCT.DELAY_VALUE')
  return [
    {
      title: t(dict, 'TRACKING.STEP_CONFIRMED_TITLE'),
      detail: t(dict, 'TRACKING.STEP_CONFIRMED_BODY'),
    },
    {
      title: t(dict, 'TRACKING.STEP_PREPARED_TITLE'),
      detail: t(dict, 'TRACKING.STEP_PREPARED_BODY'),
    },
    {
      title: t(dict, 'TRACKING.STEP_SHIPPED_TITLE'),
      detail: t(dict, 'TRACKING.STEP_SHIPPED_BODY'),
    },
    {
      title: t(dict, 'TRACKING.STEP_DELIVERED_TITLE'),
      detail: t(dict, 'TRACKING.STEP_DELIVERED_BODY', { delai }),
    },
  ]
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
    title: t(dict, 'TRACKING.TITLE'),
    description: t(dict, 'TRACKING.META_DESCRIPTION', { delai: t(dict, 'PRODUCT.DELAY_VALUE') }),
    alternates: {
      canonical: localePath(lang, '/suivi'),
      languages: hreflangAlternates('/suivi').languages,
    },
  }
}

export default async function LangTrackingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  const steps = trackingSteps(dict)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <h1 className="text-3xl font-bold text-balance md:text-4xl">
        <Marker>{t(dict, 'TRACKING.TITLE_MARK')}</Marker> {t(dict, 'TRACKING.TITLE_REST')}
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{t(dict, 'TRACKING.LEAD')}</p>

      <aside className="mt-6 rounded-row bg-surface p-5 text-sm">
        <p className="font-semibold">{t(dict, 'SHIPPING_NOTICE.TITLE')}</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {t(dict, 'SHIPPING_NOTICE.BODY')}
        </p>
      </aside>

      <ol className="mt-10 space-y-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold tabular-nums"
            >
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-muted-foreground">{t(dict, 'TRACKING.CONTACT')}</p>
      <p className="mt-6">
        <Link
          href={localePath(locale, '/faq')}
          className="text-sm font-semibold underline underline-offset-4"
        >
          {t(dict, 'TRACKING.FAQ_LINK')}
        </Link>
      </p>
    </main>
  )
}
