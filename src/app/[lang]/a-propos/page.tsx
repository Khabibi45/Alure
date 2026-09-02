import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PRODUCT, formatSpecs } from '@/lib/shop/product'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * « Qui on est », dans les langues sous préfixe — le pendant de
 * `src/app/(fr)/a-propos/page.tsx`, mêmes preuves et mêmes visuels.
 *
 * Cette page est la page de CONFIANCE : la cible se méfie du dropshipping, et
 * la transparence est l'argument (VISION.md). Chaque affirmation reste donc
 * vérifiable (règle n°6) — aucune équipe fantôme, aucun chiffre inventé.
 *
 * Deux points que la version anglaise ne peut pas se permettre de rater :
 *   1. les montants et les cotes passent par `formatSpecs(locale)` — sans la
 *      langue, un anglophone lit « 6,5 cm », ponctué en français ;
 *   2. le délai vient de `PRODUCT.DELAY_VALUE` (dictionnaire), jamais de
 *      `PRODUCT.deliveryDelay`, qui est une chaîne française en dur.
 *
 * `SHIPPING_NOTICE.BODY` s'affiche ici alors que la page française ne le dit
 * pas : en français, « on livre en France » est l'état de fait implicite ; un
 * visiteur anglophone n'a aucune raison de le supposer (docs/i18n/README.md §0).
 *
 * Les noms propres du produit (coloris, collector) restent en français dans
 * les deux langues — ils doivent correspondre au reçu Stripe et à l'email.
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
    title: t(dict, 'NAV.ABOUT'),
    description: t(dict, 'ABOUT.DESCRIPTION'),
    alternates: {
      canonical: localePath(lang, '/a-propos'),
      languages: hreflangAlternates('/a-propos').languages,
    },
  }
}

export default async function LangAboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  // Une SEULE résolution de la langue : le dictionnaire, les cotes et les
  // montants doivent parler la même, sinon la page mélange deux langues.
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)

  const colorwayNames = PRODUCT.colorways.map((c) => c.label).join(', ')

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10 pb-4 md:pt-14">
      <h1 className="font-display text-3xl leading-tight font-bold text-balance md:text-4xl">
        {t(dict, 'ABOUT.H1')}
      </h1>

      <div className="relative mt-8 aspect-[1200/568] overflow-hidden rounded-card">
        <Image
          src="/produit/marque-lac.webp"
          alt={t(dict, 'ABOUT.HERO_ALT')}
          fill
          priority
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>{t(dict, 'ABOUT.INTRO', { specs: formatSpecs(locale) })}</p>
        <p>
          {t(dict, 'ABOUT.RANGE', {
            nbColoris: String(PRODUCT.colorways.length),
            coloris: colorwayNames,
          })}{' '}
          {t(dict, 'ABOUT.COLLECTOR_RULE', { collector: PRODUCT.collector.label })}
        </p>
      </div>

      <h2 className="font-display mt-12 text-xl font-bold md:text-2xl">
        {t(dict, 'ABOUT.VISUALS_TITLE')}
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>{t(dict, 'ABOUT.VISUALS_BODY')}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PRODUCT.colorways.map((c) => (
          <figure key={c.id} className="m-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Image
                src={c.image}
                alt={t(dict, 'ABOUT.COLORWAY_ALT', { coloris: c.label })}
                fill
                sizes="(min-width: 768px) 15rem, 33vw"
                className="object-cover"
              />
            </div>
            {/* Le nom du coloris est le nom du reçu : jamais traduit, ni par
                nous, ni par la traduction automatique du navigateur. */}
            <figcaption
              className="mt-2 text-center text-[0.8125rem] text-muted-foreground"
              translate="no"
            >
              {c.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <h2 className="font-display mt-12 text-xl font-bold md:text-2xl">
        {t(dict, 'ABOUT.TRANSPARENCY_TITLE')}
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>{t(dict, 'ABOUT.TRANSPARENCY_BODY', { delai: t(dict, 'PRODUCT.DELAY_VALUE') })}</p>
        <p>{t(dict, 'SHIPPING_NOTICE.BODY')}</p>
      </div>

      {/* Le format suit l'image : le 3:2 garde à la fois la tête du poisson et la
        palette du leurre, là où le panoramique précédent coupait les deux. */}
      <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-card">
        <Image
          src="/produit/prise-vert.webp"
          alt={t(dict, 'ABOUT.SCENE_ALT')}
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 mb-8">
        <Link href={localePath(locale, '/leurre')} className="px-btn px-btn--primary px-btn--lg">
          {t(dict, 'HOME.CTA')}
        </Link>
      </div>
    </main>
  )
}
