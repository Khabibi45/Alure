import type { Metadata } from 'next'
import { Truck, Undo2, CreditCard, Mail, MapPin } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { Marker } from '@/components/ui/Marker'
import { BuyBox } from '@/components/sections/leurre/BuyBox'
import { OfferPanel } from '@/components/sections/leurre/OfferPanel'
import { CheckoutProvider } from '@/components/sections/leurre/checkout-context'
import { ColorwayProvider } from '@/components/sections/leurre/colorway-context'
import { ColorwayViewer } from '@/components/sections/leurre/ColorwayViewer'
import { parsePreselection } from '@/lib/shop/checkout-schema'
import { productJsonLd } from '@/lib/shop/jsonld'
import { OFFERS, PRODUCT, formatEuros, formatLength, formatWeight } from '@/lib/shop/product'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'
import { leurreStrings } from '@/lib/i18n/leurre-strings'

/**
 * La page produit / achat dans les langues sous préfixe — le pendant de
 * `src/app/(fr)/leurre/page.tsx` : même mise en page, même îlot d'achat, même
 * JSON-LD, textes du dictionnaire.
 *
 * Deux différences assumées avec la version française :
 *
 * 1. L'encadré « livraison France uniquement » (`SHIPPING_NOTICE.*`) ouvre la
 *    page, AVANT tout bouton d'achat. C'est la condition de publication de la
 *    version anglaise (docs/i18n/README.md §0) : un visiteur qui lit le site en
 *    anglais n'a aucune raison de supposer que la boutique n'expédie qu'en
 *    France, et le lui cacher jusqu'au formulaire d'adresse, c'est le laisser
 *    payer d'abord et découvrir ensuite. En français, c'est l'état de fait —
 *    l'encadré y reste donc implicite.
 * 2. Les montants et les dimensions sont formatés AVEC la langue
 *    (`formatEuros(cents, locale)`, `formatLength(locale)`) : sans elle, la
 *    page anglaise affiche « 21,99 € » et « 6,5 cm ».
 *
 * Les îlots client (`BuyBox`, `OfferPanel`, `OfferProgress`, `ColorwayViewer`,
 * `PaymentMethods`) reçoivent leurs textes du serveur, en une seule prop
 * `strings` préparée par `leurreStrings(locale)` : ils sont partagés avec la
 * page française, et un composant `'use client'` ne peut pas lire un
 * dictionnaire sans l'embarquer entier dans le bundle (règle Alure n°6).
 * Jusqu'au 2026-08-26, ils portaient leurs textes en français EN DUR — d'où
 * « Chargement du leurre… », « Coloris : » et « 21,99 € » sur /en/leurre.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  const prixSolo = formatEuros(PRODUCT.pricing.soloCents, lang)
  return {
    title: t(dict, 'PRODUCT.TITLE', { prixSolo }),
    description: t(dict, 'PRODUCT.DESCRIPTION', {
      prixSolo,
      prixCollection: formatEuros(OFFERS.collection.amountCents, lang),
      // Le délai vient du dictionnaire, jamais de `PRODUCT.deliveryDelay`, qui
      // est une chaîne française en dur.
      delai: t(dict, 'PRODUCT.DELAY_VALUE'),
    }),
    alternates: {
      canonical: localePath(lang, '/leurre'),
      languages: hreflangAlternates('/leurre').languages,
    },
  }
}

export default async function LangLeurrePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)
  // TOUS les textes des îlots client, formatés à la langue servie — montants
  // compris. Un seul objet traverse la frontière serveur → client.
  const strings = leurreStrings(locale)

  // Présélection posée par la frise de l'accueil — validée par le schéma
  // partagé, une valeur inconnue retombe sur les défauts sans erreur.
  const preselection = parsePreselection(await searchParams)

  const reassurance = [
    { icon: Undo2, text: t(dict, 'PRODUCT.REASSURANCE_RETURN') },
    { icon: CreditCard, text: t(dict, 'PRODUCT.REASSURANCE_PAYMENT') },
    { icon: Mail, text: t(dict, 'PRODUCT.REASSURANCE_TRACKING') },
  ]

  return (
    // pb-28 mobile : réserve la place de la barre d'achat collante (fixed bottom).
    <main className="mx-auto max-w-5xl px-5 py-8 pb-28 md:py-16 md:pb-16">
      <JsonLd data={productJsonLd()} />

      {/* La limite d'expédition, en tête de page — au-dessus du prix, des
        coloris, du bouton d'achat et de la barre collante. Elle se lit AVANT
        qu'on puisse payer, jamais après (README i18n §0). */}
      <aside className="flex items-start gap-3 rounded-card bg-surface p-5 shadow-card">
        <MapPin className="mt-0.5 size-6 shrink-0 text-info" strokeWidth={1.75} aria-hidden />
        <div className="space-y-1">
          <p className="font-bold">{t(dict, 'SHIPPING_NOTICE.TITLE')}</p>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {t(dict, 'SHIPPING_NOTICE.BODY')}
          </p>
        </div>
      </aside>

      <ColorwayProvider initialColoris={preselection.coloris} initialOffre={preselection.offre}>
        <CheckoutProvider strings={strings}>
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Visuel principal : le leurre en 3D, dans le coloris sélectionné dans
              l'îlot d'achat. min-w-0 : sans lui, le canvas fixe la largeur de la
              colonne grid et fait déborder toute la page à 375px. */}
            <section aria-label={t(dict, 'PRODUCT.SECTION_VISUAL')} className="min-w-0">
              <ColorwayViewer strings={strings} />
            </section>

            {/* Prix + coloris — l'offre et le CTA sont en pleine largeur dessous. */}
            <section
              aria-label={t(dict, 'PRODUCT.BUY')}
              className="min-w-0 md:sticky md:top-24 md:self-start"
            >
              <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
                {t(dict, 'PRODUCT.H1_LEAD')} <Marker>{t(dict, 'PRODUCT.H1_MARK')}</Marker>{' '}
                {t(dict, 'PRODUCT.H1_TAIL')}
              </h1>
              {/* Les dimensions juste sous le titre : un leurre s'achète d'abord sur
                sa taille et son poids de lancer. Ponctuation décimale de la langue. */}
              <p className="mt-2 text-[0.9375rem] text-muted-foreground tabular-nums">
                {t(dict, 'PRODUCT.SPECS', {
                  longueur: formatLength(locale),
                  poids: formatWeight(locale),
                })}
              </p>

              <div className="mt-5">
                <BuyBox
                  strings={strings}
                  deliveryBanner={
                    /* Bandeau délai (charte §8.8) : carte surface, icône info, statique. */
                    <div className="flex items-start gap-3 rounded-card bg-surface p-5 shadow-card">
                      <Truck
                        className="mt-0.5 size-6 shrink-0 text-info"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <div className="space-y-1">
                        <p className="font-bold">
                          {t(dict, 'PRODUCT.DELIVERY_BANNER', {
                            delai: t(dict, 'PRODUCT.DELAY_VALUE'),
                          })}
                        </p>
                        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                          {t(dict, 'PRODUCT.DELIVERY_BANNER_BODY')}
                        </p>
                      </div>
                    </div>
                  }
                />
              </div>
            </section>
          </div>

          {/* L'offre, la progression et le CTA — sur toute la largeur de la page
            (consigne Camil 2026-08-12). */}
          <section aria-label={t(dict, 'OFFER.LEGEND')} className="mt-10 md:mt-14">
            <OfferPanel strings={strings} />

            {/* Réassurance (§8.10) — trois faits ; en rang sur desktop. */}
            <ul className="mt-8 md:grid md:grid-cols-3 md:gap-6">
              {reassurance.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex min-h-14 items-center gap-3 border-t border-border text-[0.9375rem]"
                >
                  <Icon
                    className="size-5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </CheckoutProvider>
      </ColorwayProvider>
    </main>
  )
}
