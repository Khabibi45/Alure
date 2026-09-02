'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import { PRODUCT, giftLabel } from '@/lib/shop/product'
import { useColorwaySelection } from './colorway-context'
import { useCheckout } from './checkout-context'
import { fillNodes } from './fill-nodes'
import type { LeurreStrings } from './leurre-strings'

/**
 * L'îlot prix + coloris + cadeau de /leurre (charte V.02 §8.5–8.8). L'offre,
 * la progression et le CTA vivent dans `<OfferPanel>` — même contexte, même
 * statut de paiement. `deliveryBanner` est un slot serveur : la charte impose
 * le bandeau délai entre le prix et la suite (§8.8).
 *
 * Offre « 3 achetés, le 4e offert au choix » (2026-08-14) : en offre groupée,
 * l'acheteur choisit ici son 4e leurre — un coloris en double, ou le Pirate.
 *
 * Aucun montant ne se calcule ni ne se formate ici : `strings.total` arrive du
 * serveur, déjà ponctué à la langue servie. C'est ce qui a fait afficher
 * « 21,99 € » sur `/en/leurre` — le gros prix, l'écran qui doit être limpide.
 *
 * Les NOMS de coloris, eux, restent en français dans les deux langues et
 * portent `translate="no"` : ils doivent correspondre au reçu Stripe et à
 * l'email de confirmation.
 */
export function BuyBox({
  deliveryBanner,
  strings,
}: {
  deliveryBanner: ReactNode
  strings: LeurreStrings
}) {
  // Le coloris vit dans le contexte : la galerie 3D affiche LE coloris
  // sélectionné, elle doit donc lire la même sélection que cet îlot.
  const { coloris, setColoris, offre, cadeau, setCadeau } = useColorwaySelection()
  const { status, clearError } = useCheckout()

  const loading = status.state === 'loading'
  const total = strings.total[offre]
  const savings = strings.savings[offre]
  const selectedLabel = PRODUCT.colorways.find((c) => c.id === coloris)?.label ?? ''
  const giftSelectedLabel = giftLabel(cadeau) ?? ''

  const tileRing = (selected: boolean) =>
    selected ? 'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-ring)]' : ''

  return (
    <div>
      {/* Prix (charte §8.7) : total, TVA accolée.
          key={offre} re-monte le bloc → .px-pop rejoue (« tombe en place »). */}
      <div>
        <p key={offre} className="px-stat px-pop">
          {total}
        </p>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{strings.tagline[offre]}</p>
        {/* Le serveur ne prépare cette phrase que s'il y a réellement une
            économie : pas de « Vous économisez 0,00 € », pas de prix barré. */}
        {savings !== null && (
          <p className="mt-1 text-[0.8125rem] font-bold text-success">{savings}</p>
        )}
      </div>

      {/* Le bandeau délai — entre le prix et la suite du parcours (§8.8). */}
      <div className="mt-5">{deliveryBanner}</div>

      {/* Coloris (§8.5) : radios natifs = navigation aux flèches gratuite. */}
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="text-[0.9375rem] text-muted-foreground">
          {strings.colorwayLabel}{' '}
          <span className="font-bold text-foreground" translate="no">
            {selectedLabel}
          </span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {PRODUCT.colorways.map((c) => (
            <label
              key={c.id}
              className={`flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1 ${
                !c.available ? 'cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name="coloris"
                value={c.id}
                checked={c.id === coloris}
                disabled={!c.available || loading}
                onChange={() => {
                  setColoris(c.id)
                  clearError()
                }}
                className="sr-only"
              />
              {/* La pastille montre le VRAI coloris : le rendu 3D maison du leurre
                  (public/produit/), jamais un aplat de couleur inventé. */}
              <span
                aria-hidden
                className={`relative size-14 overflow-hidden rounded-card bg-muted transition-shadow ${tileRing(
                  c.id === coloris
                )} ${!c.available ? 'opacity-35' : ''}`}
              >
                <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="sr-only" translate="no">
                {c.label}
              </span>
              {!c.available && (
                <span className="text-[0.8125rem] text-muted-foreground">{strings.soldOut}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Le 4e leurre OFFERT, au choix — uniquement avec l'offre groupée. */}
      {offre === 'collection' && (
        <fieldset className="m-0 mt-6 border-0 p-0">
          <legend className="text-[0.9375rem] text-muted-foreground">
            {strings.giftLabel}{' '}
            <span className="font-bold text-success" translate="no">
              {giftSelectedLabel}
            </span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {PRODUCT.colorways.map((c) => (
              <label
                key={c.id}
                className={`flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1 ${
                  !c.available ? 'cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="radio"
                  name="cadeau"
                  value={c.id}
                  checked={cadeau === c.id}
                  disabled={!c.available || loading}
                  onChange={() => {
                    setCadeau(c.id)
                    clearError()
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`relative size-14 overflow-hidden rounded-card bg-muted transition-shadow ${tileRing(
                    cadeau === c.id
                  )} ${!c.available ? 'opacity-35' : ''}`}
                >
                  <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="sr-only">
                  {fillNodes(strings.giftDuplicateA11y, {
                    coloris: <span translate="no">{c.label}</span>,
                  })}
                </span>
                {!c.available && (
                  <span className="text-[0.8125rem] text-muted-foreground">{strings.soldOut}</span>
                )}
              </label>
            ))}

            {/* Le Pirate — LE choix : il ne s'obtient que comme ça. */}
            <label className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1">
              <input
                type="radio"
                name="cadeau"
                value={PRODUCT.collector.id}
                checked={cadeau === PRODUCT.collector.id}
                disabled={loading}
                onChange={() => {
                  setCadeau(PRODUCT.collector.id)
                  clearError()
                }}
                className="sr-only"
              />
              {/* Sa photo, comme les trois autres : la pastille montrait une tête
                  de mort — une icône, pas le leurre. On ne choisit pas son 4e
                  leurre sur un pictogramme. */}
              <span
                aria-hidden
                className={`relative size-14 overflow-hidden rounded-card bg-muted transition-shadow ${tileRing(
                  cadeau === PRODUCT.collector.id
                )}`}
              >
                <Image
                  src={PRODUCT.collector.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="sr-only">
                {fillNodes(strings.giftCollectorA11y, {
                  collector: <span translate="no">{PRODUCT.collector.label}</span>,
                })}
              </span>
            </label>
          </div>
        </fieldset>
      )}
    </div>
  )
}
