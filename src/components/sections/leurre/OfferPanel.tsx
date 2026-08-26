'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { OFFER_IDS, PRODUCT, getOffer } from '@/lib/shop/product'
import { useColorwaySelection } from './colorway-context'
import { useCheckout } from './checkout-context'
import { OfferProgress } from './OfferProgress'
import { PaymentMethods } from './PaymentMethods'
import { fillNodes } from './fill-nodes'
import type { LeurreStrings } from './leurre-strings'

/**
 * Le panneau d'offre de /leurre, sur TOUTE la largeur de la page (consigne
 * Camil 2026-08-12) : les deux paliers côte à côte sur desktop, puis la
 * progression et le CTA. La logique de paiement vit dans `useCheckout` — ce
 * panneau et l'îlot prix/coloris lisent le même statut.
 *
 * Aucun montant n'est formaté ici, et aucune phrase n'est assemblée à la main :
 * le serveur prépare les deux paliers (`leurreStrings(locale)`), le composant
 * lit celui qui est coché. Les phrases « Soit moins de X le leurre » sont des
 * gabarits du dictionnaire, pas des concaténations — en anglais l'ordre des
 * mots n'est pas celui du français.
 */
export function OfferPanel({ strings }: { strings: LeurreStrings }) {
  const { coloris, offre, setOffre } = useColorwaySelection()
  const { status, submit, clearError } = useCheckout()
  const ctaRef = useRef<HTMLDivElement>(null)
  const [stickyVisible, setStickyVisible] = useState(false)

  // Barre d'achat collante mobile (§8.9) : visible quand le CTA sort de l'écran.
  useEffect(() => {
    const target = ctaRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const loading = status.state === 'loading'
  const total = strings.total[offre]
  const selectedLabel = PRODUCT.colorways.find((c) => c.id === coloris)?.label ?? ''

  return (
    <div>
      {/* L'offre : deux paliers, un choix binaire. Radios natifs = clavier gratuit. */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="px-label mb-2">{strings.offerLegend}</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {OFFER_IDS.map((id) => {
            const selected = id === offre
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-card p-4 transition-shadow ${
                  selected ? 'bg-muted shadow-[0_0_0_2px_var(--color-ring)]' : 'bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="offre"
                  value={id}
                  checked={selected}
                  disabled={loading}
                  onChange={() => {
                    setOffre(id)
                    clearError()
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`mt-1 size-4 shrink-0 rounded-full ${
                    selected ? 'bg-foreground' : 'bg-border'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-bold">{strings.offerTitle[id]}</span>
                    <span className="font-bold tabular-nums">{strings.total[id]}</span>
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
                    {/* Un seul jeu de paramètres pour les deux paliers :
                        `fillNodes` ignore une valeur dont le gabarit n'a pas
                        besoin. Les NOMS PROPRES arrivent en nœuds, donc hors
                        traduction du navigateur — ce sont eux qui figureront
                        sur le reçu Stripe. Le nombre de coloris, lui, vient du
                        domaine, jamais d'un chiffre réécrit à la main. */}
                    {fillNodes(strings.offerDetail[id], {
                      coloris: <span translate="no">{selectedLabel}</span>,
                      nbColoris: String(getOffer(id).colorwayCount),
                      collector: <span translate="no">{PRODUCT.collector.label}</span>,
                    })}{' '}
                    {strings.perLure[id]}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Progression à gauche, CTA à droite — empilés sur mobile. */}
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
        <OfferProgress offre={offre} strings={strings} />

        <div ref={ctaRef}>
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
      </div>

      {status.state === 'error' && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-text">
          {status.message}
        </p>
      )}

      {/* Barre d'achat collante mobile (§8.9). Entrée 0.28s, sortie 0.14s. */}
      <div
        aria-hidden={!stickyVisible}
        className={`fixed inset-x-0 bottom-0 z-40 bg-surface px-5 pt-3 shadow-[0_-10px_26px_-14px_rgb(2_6_16/0.45)] [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] md:hidden motion-safe:transition-[transform,opacity] ${
          stickyVisible
            ? 'translate-y-0 opacity-100 motion-safe:duration-[var(--dur-element)] motion-safe:[transition-timing-function:var(--ease-out-soft)]'
            : 'pointer-events-none translate-y-full opacity-0 motion-safe:duration-[var(--dur-micro)] motion-safe:[transition-timing-function:var(--ease-in-brisk)]'
        }`}
      >
        {status.state === 'error' && (
          <p aria-hidden className="mb-2 text-sm font-medium text-danger-text">
            {status.message}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold tabular-nums">{total}</p>
            {/* Dérivé de la source unique (règle n°1) — jamais une réécriture du délai. */}
            <p className="text-xs text-muted-foreground">{strings.deliveryShort}</p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={submit}
            disabled={loading}
            tabIndex={stickyVisible ? 0 : -1}
            className="min-w-32"
          >
            {loading ? strings.buyLoadingShort : strings.buy}
          </Button>
        </div>
      </div>
    </div>
  )
}
