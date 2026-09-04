'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import { PACK_IDS, PRODUCT, type PackId } from '@/lib/shop/product'
import { Button } from '@/components/ui/Button'
import { useCheckout } from './checkout-context'
import { PaymentMethods } from './PaymentMethods'
import type { LeurreStrings } from './leurre-strings'

/**
 * L'îlot d'achat de /leurre : le pack, son prix, la livraison, le bouton.
 *
 * ── CE QUI A DISPARU LE 2026-09-04, ET POURQUOI C'EST PLUS SIMPLE ──
 *
 * Il n'y a plus de coloris à choisir, plus d'offre à comparer, plus de 4e leurre
 * à désigner. Un pack de leurres contient une unité de CHAQUE coloris : la
 * question « lequel ? » ne se pose plus, et avec elle disparaissent le panneau
 * d'offre, la frise de progression et le champ « cadeau ». Les pastilles de
 * coloris restent, mais elles ne se cliquent pas — elles MONTRENT ce qu'on
 * reçoit.
 *
 * ── LA LIVRAISON EST DITE ICI, SOUS LE PRIX ──
 *
 * Elle n'est plus incluse. Le montant s'affiche donc au même endroit que le
 * prix, pas au moment de payer : un client qui découvre des frais à la caisse se
 * sent trompé, et c'est aussi une obligation.
 *
 * Aucun montant ne se calcule ni ne se formate ici : tout arrive du serveur,
 * déjà ponctué à la langue servie. Les NOMS de coloris restent en français dans
 * les deux langues et portent `translate="no"` — ils doivent correspondre au
 * reçu Stripe et à l'email.
 */
export function BuyBox({
  deliveryBanner,
  strings,
}: {
  deliveryBanner: ReactNode
  strings: LeurreStrings
}) {
  const { pack, setPack, status, submit, clearError } = useCheckout()

  const loading = status.state === 'loading'
  const chosen = strings.packs[pack]

  return (
    <div>
      {/* Prix (charte §8.7). key={pack} re-monte le bloc → .px-pop rejoue. */}
      <div>
        <p key={pack} className="px-stat px-pop">
          {chosen.price}
        </p>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{strings.shippingLine}</p>
        {chosen.perUnit !== null && (
          <p className="mt-1 text-[0.8125rem] font-bold text-success">{chosen.perUnit}</p>
        )}
      </div>

      {/* Le bandeau délai — entre le prix et la suite du parcours (§8.8). */}
      <div className="mt-5">{deliveryBanner}</div>

      {/* Le pack : radios natifs = navigation aux flèches gratuite. */}
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="text-[0.9375rem] text-muted-foreground">{strings.packLegend}</legend>
        <div className="mt-3 flex flex-col gap-3">
          {PACK_IDS.map((id: PackId) => (
            <label
              key={id}
              className={`flex cursor-pointer items-start gap-3 rounded-card bg-surface p-4 shadow-card ${
                id === pack
                  ? 'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-ring)]'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="pack"
                value={id}
                checked={id === pack}
                disabled={loading}
                onChange={() => {
                  setPack(id)
                  clearError()
                }}
                className="sr-only"
              />
              <div className="min-w-0 flex-grow">
                <p className="font-bold">{strings.packs[id].title}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {strings.packs[id].contents}
                </p>
              </div>
              <p className="shrink-0 font-bold tabular-nums">{strings.packs[id].price}</p>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Les coloris du pack — informatifs : on les reçoit tous. */}
      {pack === 'leurres' && (
        <div className="mt-6">
          <p className="text-[0.9375rem] text-muted-foreground">{strings.colorwayLabel}</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {PRODUCT.colorways.map((c) => (
              <li key={c.id} className="flex flex-col items-center gap-1">
                <span className="relative size-14 overflow-hidden rounded-card bg-muted">
                  <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="text-[0.75rem] text-muted-foreground" translate="no">
                  {c.shortLabel}
                </span>
                {!c.available && (
                  <span className="text-[0.75rem] text-muted-foreground">{strings.soldOut}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          onClick={submit}
          disabled={loading}
          className="w-full"
          aria-busy={loading}
        >
          {loading ? strings.buyLoading : strings.buy}
        </Button>
        <PaymentMethods strings={strings} />
      </div>

      {status.state === 'error' && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-text">
          {status.message}
        </p>
      )}
    </div>
  )
}
