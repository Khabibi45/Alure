'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { checkoutSchema } from '@/lib/shop/checkout-schema'
import {
  OFFER_IDS,
  PRODUCT,
  collectorIncluded,
  deliveryShort,
  formatEuros,
  getOffer,
  orderableError,
  perLureAtMostCents,
  perLureCents,
  priceTagline,
  savingsCents,
  totalCents,
} from '@/lib/shop/product'
import { COLLECTOR_LURE_MODEL, lureDisplayName } from '@/lib/lure-models'
import { useColorwaySelection } from './colorway-context'
import { OfferProgress } from './OfferProgress'
import { PaymentMethods } from './PaymentMethods'

type Status = { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string }

/**
 * L'îlot d'achat de /leurre (charte V.02 §8.5–8.9). Seule partie cliente de la
 * page. La validation vient du module shop (schéma partagé).
 * `deliveryBanner` est un slot serveur : la charte impose le bandeau délai
 * ENTRE le prix et le bouton d'achat (§8.8) — le prix vivant ici (il devient le
 * total avec la quantité), le bandeau doit transiter par l'îlot.
 */
export function BuyBox({ deliveryBanner }: { deliveryBanner: ReactNode }) {
  // Le coloris et la quantité vivent dans le contexte : la galerie 3D affiche LE
  // coloris sélectionné, elle doit donc lire la même sélection que cet îlot.
  const { coloris, setColoris, offre, setOffre } = useColorwaySelection()
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const ctaRef = useRef<HTMLDivElement>(null)
  const [stickyVisible, setStickyVisible] = useState(false)

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

  async function submit() {
    const parsed = checkoutSchema.safeParse({ coloris, offre })
    if (!parsed.success) {
      setStatus({ state: 'error', message: 'Choisissez un coloris et une offre.' })
      return
    }
    const unorderable = orderableError(parsed.data.coloris)
    if (unorderable) {
      setStatus({ state: 'error', message: unorderable })
      return
    }

    setStatus({ state: 'loading' })
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const body: unknown = await res.json()
      if (!res.ok) {
        const message =
          typeof body === 'object' && body !== null && 'error' in body
            ? String((body as { error: unknown }).error)
            : 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.'
        setStatus({ state: 'error', message })
        return
      }
      const url =
        typeof body === 'object' && body !== null && 'url' in body
          ? String((body as { url: unknown }).url)
          : null
      // Défense en profondeur : on ne navigue QUE vers la page de paiement
      // Stripe. La chaîne est de confiance (notre API → SDK serveur), mais si
      // elle se déréglait un jour, on refuse ici plutôt que d'envoyer le
      // visiteur n'importe où. En dev local, l'URL Stripe reste https.
      if (!url || !url.startsWith('https://checkout.stripe.com/')) {
        setStatus({
          state: 'error',
          message: 'Réponse de paiement invalide. Réessayez dans un instant.',
        })
        return
      }
      window.location.assign(url)
      // Pas de retour à idle : la page part vers Stripe.
    } catch {
      setStatus({
        state: 'error',
        message: 'Le paiement n’a pas pu démarrer (connexion interrompue). Réessayez.',
      })
    }
  }

  const loading = status.state === 'loading'
  const total = formatEuros(totalCents(offre))
  const savings = savingsCents(offre)
  const selectedLabel = PRODUCT.colorways.find((c) => c.id === coloris)?.label ?? ''
  const collectorEarned = collectorIncluded(offre)
  const collectorMessage = collectorEarned
    ? `Le ${PRODUCT.collector.label} est offert avec votre commande.`
    : `Prenez la collection pour débloquer le ${PRODUCT.collector.label}.`

  return (
    <div>
      {/* Prix (charte §8.7) : total, TVA accolée, sous-ligne unité si qté > 1.
          key={quantite} re-monte le bloc → .px-pop rejoue (« tombe en place »). */}
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

      {/* Le bandeau délai — entre le prix et le bouton d'achat (§8.8). */}
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
                  if (status.state === 'error') setStatus({ state: 'idle' })
                }}
                className="sr-only"
              />
              {/* La pastille montre le VRAI coloris : le rendu 3D maison du leurre
                  (public/produit/), jamais un aplat de couleur inventé. */}
              <span
                aria-hidden
                className={`relative size-14 overflow-hidden rounded-card bg-muted transition-shadow ${
                  c.id === coloris
                    ? 'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-ring)]'
                    : ''
                } ${!c.available ? 'opacity-35' : ''}`}
              >
                <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="sr-only">{c.label}</span>
              {!c.available && (
                <span className="text-[0.8125rem] text-muted-foreground">Épuisé</span>
              )}
            </label>
          ))}

          {/* Le collector : jamais sélectionnable, il ne se vend pas — il s'obtient.
              Présent quand même dans le sélecteur pour qu'on voie ce qu'on gagne. */}
          {COLLECTOR_LURE_MODEL && (
            <span
              className="flex min-h-11 min-w-11 flex-col items-center gap-1"
              title={collectorMessage}
            >
              <span
                aria-hidden
                className={`flex size-14 items-center justify-center rounded-card bg-muted transition-opacity ${
                  collectorEarned ? 'opacity-100' : 'opacity-35'
                }`}
              >
                {collectorEarned ? (
                  <Check className="size-5" strokeWidth={2.5} />
                ) : (
                  <Lock className="size-5" strokeWidth={2} />
                )}
              </span>
              <span className="sr-only">
                {lureDisplayName(COLLECTOR_LURE_MODEL)} — {collectorMessage}
              </span>
            </span>
          )}
        </div>

        <p
          className={`mt-3 text-[0.8125rem] ${
            collectorEarned ? 'font-bold text-success' : 'text-muted-foreground'
          }`}
        >
          {collectorMessage}
        </p>
      </fieldset>

      {/* L'offre : deux paliers, un choix binaire. Radios natifs = clavier gratuit. */}
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="px-label mb-2">Votre offre</legend>
        <div className="space-y-3">
          {OFFER_IDS.map((id) => {
            const offer = getOffer(id)
            const selected = id === offre
            const perLure = perLureCents(id)
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
                    if (status.state === 'error') setStatus({ state: 'idle' })
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
                    <span className="font-bold">{offer.label}</span>
                    <span className="font-bold tabular-nums">
                      {formatEuros(offer.amountCents)}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
                    {id === 'solo'
                      ? `Le coloris ${selectedLabel}.`
                      : `Les ${offer.colorwayCount} coloris + le ${PRODUCT.collector.label} offert.`}
                    {perLure !== null
                      ? ` Soit ${formatEuros(perLure)} le leurre.`
                      : ` Soit moins de ${formatEuros(perLureAtMostCents(id))} le leurre.`}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* La progression — où j'en suis, ce qu'il me manque, ce que ça débloque. */}
      <div className="mt-5">
        <OfferProgress offre={offre} />
      </div>

      {/* CTA (§8.1) : « Acheter », largeur pleine (verrouillée pendant le swap). */}
      <div ref={ctaRef} className="mt-6">
        <Button
          type="button"
          size="lg"
          onClick={submit}
          disabled={loading}
          className="w-full"
          aria-busy={loading}
        >
          {loading ? 'Redirection vers le paiement…' : 'Acheter'}
        </Button>
        <PaymentMethods />
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
            <p className="text-xs text-muted-foreground">{deliveryShort()}</p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={submit}
            disabled={loading}
            tabIndex={stickyVisible ? 0 : -1}
            className="min-w-32"
          >
            {loading ? 'Redirection…' : 'Acheter'}
          </Button>
        </div>
      </div>
    </div>
  )
}
