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
import { OFFERS, PRODUCT, formatEuros, formatSpecs } from '@/lib/shop/product'
import { DEFAULT_LOCALE } from '@/lib/i18n/paths'
import { leurreStrings } from '@/lib/i18n/leurre-strings'

export const metadata: Metadata = {
  title: `Leurre articulé 2 sections — ${formatEuros(PRODUCT.pricing.soloCents)} port inclus`,
  description: `Le leurre Alure : articulé deux sections, pensé pour les carnassiers. ${formatEuros(PRODUCT.pricing.soloCents)} le leurre à l'unité — et 3 achetés, le 4e offert au choix (jusqu'au coloris collector) : 4 leurres pour ${formatEuros(OFFERS.collection.amountCents)}. Livraison incluse (${PRODUCT.deliveryDelay}), paiement carte ou PayPal, rétractation 14 jours.`,
}

/**
 * Page produit / achat (spec boutique.md T2 + charte V.02 §8).
 * Server Component ; l'interactivité vit dans l'îlot <BuyBox>, qui reçoit le
 * bandeau délai en slot serveur (la charte l'impose entre le prix et le bouton).
 * Visuels : emplacements en attente du pipeline LOT 3, jamais de photo
 * fournisseur. Pas de section « Caractéristiques » tant que les specs ne sont
 * pas vérifiées sur l'échantillon reçu (règle n°6).
 *
 * Les îlots client reçoivent leurs textes du serveur, comme sur `/en/leurre` :
 * un seul chemin de textes pour les deux langues, donc pas de version française
 * qui dérive de sa traduction. Ici, la langue est celle de la racine.
 */
export default async function LeurrePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Présélection posée par la frise de l'accueil — validée par le schéma
  // partagé, une valeur inconnue retombe sur les défauts sans erreur.
  const preselection = parsePreselection(await searchParams)
  const strings = leurreStrings(DEFAULT_LOCALE)

  return (
    // pb-28 mobile : réserve la place de la barre d'achat collante (fixed bottom).
    <main className="mx-auto max-w-5xl px-5 py-8 pb-28 md:py-16 md:pb-16">
      <JsonLd data={productJsonLd()} />

      {/* « Livraison France métropolitaine uniquement », AVANT tout bouton
          d'achat (règle Alure n°1). Sur la version française aussi : le
          checkout n'accepte que le code pays `FR`, ce qui exclut la Belgique,
          la Suisse, le Québec — et les DOM-TOM, qui ont leurs propres codes
          ISO. Un francophone n'a pas plus de raison qu'un anglophone de le
          deviner, et il ne doit pas le découvrir au formulaire d'adresse,
          après avoir décidé d'acheter. */}
      <aside className="rounded-card bg-surface shadow-card flex items-start gap-3 p-5">
        <MapPin className="text-info mt-0.5 size-6 shrink-0" strokeWidth={1.75} aria-hidden />
        <div className="space-y-1">
          <p className="font-bold">{strings.shippingNoticeTitle}</p>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {strings.shippingNoticeBody}
          </p>
        </div>
      </aside>

      <ColorwayProvider initialColoris={preselection.coloris} initialOffre={preselection.offre}>
        <CheckoutProvider strings={strings}>
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Visuel principal : le leurre en 3D, dans le coloris sélectionné dans
              l'îlot d'achat. min-w-0 : sans lui, le canvas fixe la largeur de la
              colonne grid et fait déborder toute la page à 375px. */}
            <section aria-label="Visuel du leurre" className="min-w-0">
              <ColorwayViewer strings={strings} />
            </section>

            {/* Prix + coloris — l'offre et le CTA sont en pleine largeur dessous. */}
            <section aria-label="Acheter" className="min-w-0 md:sticky md:top-24 md:self-start">
              <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
                Le leurre <Marker>articulé</Marker> deux sections
              </h1>
              {/* Les dimensions juste sous le titre : un leurre s'achète d'abord sur
                sa taille et son poids de lancer. */}
              <p className="mt-2 text-[0.9375rem] text-muted-foreground tabular-nums">
                {formatSpecs()}
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
                        <p className="font-bold">Livraison sous 10 à 20 jours</p>
                        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                          Votre leurre est expédié depuis notre fournisseur en Chine. Vous recevez
                          un numéro de suivi par email dès l'envoi.
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
          <section aria-label="Votre offre" className="mt-10 md:mt-14">
            <OfferPanel strings={strings} />

            {/* Réassurance (§8.10) — trois faits ; en rang sur desktop. */}
            <ul className="mt-8 md:grid md:grid-cols-3 md:gap-6">
              {[
                { icon: Undo2, text: 'Rétractation 14 jours' },
                { icon: CreditCard, text: 'Paiement par Stripe ou PayPal' },
                { icon: Mail, text: 'Suivi de commande par email' },
              ].map(({ icon: Icon, text }) => (
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
