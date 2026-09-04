import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'
import { PACKS, SHIPPING, PRODUCT, formatEuros } from '@/lib/shop/product'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * Les CGV dans les langues sous préfixe.
 *
 * Le fond juridique est celui de la page française, article par article, dans le
 * même ordre : c'est une TRADUCTION, pas une réécriture. La version française
 * reste la seule contractuelle et la page le DIT en tête
 * (`LEGAL.TRANSLATION_DISCLAIMER`, doctrine `docs/i18n/README.md` §2).
 *
 * Deux pièges tenus ici :
 * - les montants passent par `formatEuros(cents, locale)` — sans la langue, la
 *   page anglaise afficherait « 21,99 € » au lieu de « €21.99 » ;
 * - le délai vient de `PRODUCT.DELAY_VALUE`, jamais de `PRODUCT.deliveryDelay`
 *   qui est une chaîne française.
 * La mention de TVA, elle, ne se traduit pas (article de loi français) : le
 * dictionnaire la reprend telle quelle, glosée entre parenthèses.
 */

/** Le gabarit des titres d'article — un seul endroit, onze articles. */
const H2 = 'mt-10 text-[1.25rem] font-bold text-foreground'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    title: t(dict, 'LEGAL.TERMS_TITLE'),
    description: t(dict, 'LEGAL.TERMS_META_DESCRIPTION', { marque: SITE.name }),
    // Tant que `legal-config.ts` porte des « À COMPLÉTER », la page reste hors
    // index — exactement comme sa jumelle française.
    robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
    alternates: {
      canonical: localePath(lang, '/cgv'),
      languages: hreflangAlternates('/cgv').languages,
    },
  }
}

export default async function LangCgvPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)

  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        {t(dict, 'LEGAL.TERMS_H1_LEAD')} <Marker>{t(dict, 'LEGAL.TERMS_H1_MARKED')}</Marker>
      </h1>

      {/* L'avertissement AVANT le texte : on ne laisse personne lire onze
          articles en croyant lire la version qui engage. */}
      <div className="mt-6 rounded-row border border-border bg-surface p-5">
        <p className="text-sm text-foreground">{t(dict, 'LEGAL.TRANSLATION_DISCLAIMER')}</p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{t(dict, 'LEGAL.TERMS_EFFECTIVE')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S1_TITLE')}</h2>
      <p className="mt-3">
        {t(dict, 'LEGAL.TERMS_S1_BODY', {
          vendeur: LEGAL.vendorName,
          siren: LEGAL.siren,
          adresse: LEGAL.address,
          email: LEGAL.contactEmail,
        })}
      </p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S2_TITLE')}</h2>
      <p className="mt-3">
        {t(dict, 'LEGAL.TERMS_S2_BODY', {
          marque: SITE.name,
          prixPack: formatEuros(PACKS.leurres.amountCents, locale),
          prixGoujons: formatEuros(PACKS.goujons.amountCents, locale),
          livraison: formatEuros(SHIPPING.amountCents, locale),
          nbColoris: String(PRODUCT.colorways.length),
          coloris: PRODUCT.colorways.map((c) => c.label).join(', '),
        })}
      </p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S3_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S3_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S4_TITLE')}</h2>
      <p className="mt-3">
        {t(dict, 'LEGAL.TERMS_S4_BODY', { delai: t(dict, 'PRODUCT.DELAY_VALUE') })}
      </p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S5_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S5_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S6_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S6_BODY', { email: LEGAL.contactEmail })}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S7_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S7_BODY', { mediateur: LEGAL.mediator })}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S8_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S8_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S9_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S9_BODY', { marque: SITE.name })}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S10_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S10_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.TERMS_S11_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.TERMS_S11_BODY')}</p>
    </main>
  )
}
