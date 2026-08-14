'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import { Skull } from 'lucide-react'
import {
  PRODUCT,
  formatEuros,
  giftLabel,
  priceTagline,
  savingsCents,
  totalCents,
} from '@/lib/shop/product'
import { useColorwaySelection } from './colorway-context'
import { useCheckout } from './checkout-context'

/**
 * L'îlot prix + coloris + cadeau de /leurre (charte V.02 §8.5–8.8). L'offre,
 * la progression et le CTA vivent dans `<OfferPanel>` — même contexte, même
 * statut de paiement. `deliveryBanner` est un slot serveur : la charte impose
 * le bandeau délai entre le prix et la suite (§8.8).
 *
 * Offre « 3 achetés, le 4e offert au choix » (2026-08-14) : en offre groupée,
 * l'acheteur choisit ici son 4e leurre — un coloris en double, ou le Pirate.
 */
export function BuyBox({ deliveryBanner }: { deliveryBanner: ReactNode }) {
  // Le coloris vit dans le contexte : la galerie 3D affiche LE coloris
  // sélectionné, elle doit donc lire la même sélection que cet îlot.
  const { coloris, setColoris, offre, cadeau, setCadeau } = useColorwaySelection()
  const { status, clearError } = useCheckout()

  const loading = status.state === 'loading'
  const total = formatEuros(totalCents(offre))
  const savings = savingsCents(offre)
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
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{priceTagline(offre)}</p>
        {savings > 0 && (
          <p className="mt-1 text-[0.8125rem] font-bold text-success">
            Vous économisez {formatEuros(savings)}.
          </p>
        )}
      </div>

      {/* Le bandeau délai — entre le prix et la suite du parcours (§8.8). */}
      <div className="mt-5">{deliveryBanner}</div>

      {/* Coloris (§8.5) : radios natifs = navigation aux flèches gratuite. */}
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="text-[0.9375rem] text-muted-foreground">
          Coloris : <span className="font-bold text-foreground">{selectedLabel}</span>
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
              <span className="sr-only">{c.label}</span>
              {!c.available && (
                <span className="text-[0.8125rem] text-muted-foreground">Épuisé</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Le 4e leurre OFFERT, au choix — uniquement avec l'offre groupée. */}
      {offre === 'collection' && (
        <fieldset className="m-0 mt-6 border-0 p-0">
          <legend className="text-[0.9375rem] text-muted-foreground">
            Votre 4e leurre, offert :{' '}
            <span className="font-bold text-success">{giftSelectedLabel}</span>
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
                <span className="sr-only">{c.label} — en double, offert</span>
                {!c.available && (
                  <span className="text-[0.8125rem] text-muted-foreground">Épuisé</span>
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
              <span
                aria-hidden
                className={`flex size-14 items-center justify-center rounded-card bg-foreground text-background transition-shadow ${tileRing(
                  cadeau === PRODUCT.collector.id
                )}`}
              >
                <Skull className="size-6" strokeWidth={1.75} />
              </span>
              <span className="sr-only">{PRODUCT.collector.label} — le collector, offert</span>
            </label>
          </div>
        </fieldset>
      )}
    </div>
  )
}
