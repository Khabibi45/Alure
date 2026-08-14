'use client'

import { Fragment } from 'react'
import { Check, Gift } from 'lucide-react'
import { OFFERS, PRODUCT } from '@/lib/shop/product'
import { freebiesUnlocked } from '@/lib/shop/collection-selection'

/**
 * La frise « collection » du hero — un RAIL DE POINTS, fin et large. PURE
 * STATUT : l'action vit dans l'unique bouton du carrousel (`SmartCartButton`).
 *
 * Les jalons sont NEUTRES (le panier est un COMPTEUR — un leurre quelconque
 * suffit) : trois points « achetés » (1, 2, 3), puis LE 4e OFFERT AU CHOIX
 * (offre Camil 2026-08-14) qui s'allume dès 3 leurres au panier — l'acheteur
 * choisit son cadeau sur la page produit, jusqu'au Pirate. Jamais un faux
 * « épuisé », aucune urgence fabriquée.
 */
export function CollectionStrip({
  selection,
  activeColorwayId,
  onJumpCollector,
}: {
  /** Le panier — seule sa TAILLE compte ici. */
  selection: readonly string[]
  /** Le coloris affiché par le carrousel (`null` = le collector). */
  activeColorwayId: string | null
  /** Amène le carrousel sur le collector. */
  onJumpCollector: () => void
}) {
  const count = selection.length
  // Dès 2 achetés, les 2 autres (3e coloris + Pirate) sont offerts.
  const unlocked = freebiesUnlocked(selection)
  const collector = PRODUCT.collector.label

  // Une phrase par état — l'offre vraie, jamais une urgence fabriquée.
  const message =
    count === 0
      ? `3 achetés = le 4e offert, au choix — jusqu'au ${collector}.`
      : count === 1
        ? `1 leurre au panier. Encore 2 — n'importe lesquels — et le 4e est offert.`
        : count === 2
          ? `2 au panier. Encore 1, et le 4e est offert — au choix.`
          : `3 achetés — votre 4e leurre est offert, au choix.`

  const dot =
    'flex size-7 shrink-0 items-center justify-center rounded-full bg-muted transition-[box-shadow,opacity,color] duration-[var(--dur-micro)]'
  /** L'anneau vert d'un jalon acquis ou offert. */
  const earned = 'shadow-[0_0_0_2px_var(--color-success)] text-success'
  /** L'anneau du jalon actif (le Pirate affiché par le carrousel). */
  const activeRing = 'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-ring)]'

  return (
    <section
      aria-label="Votre collection"
      className="flex w-[min(52rem,calc(100vw-2rem))] flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-full bg-background/55 px-5 py-1.5 shadow-card backdrop-blur-md"
    >
      {/* Le rail : les 2 achetés, puis les 2 offerts, reliés par un trait. */}
      <div className="flex min-w-0 flex-1 basis-full items-center sm:basis-auto">
        {Array.from({ length: OFFERS.collection.paidCount }, (_, index) => {
          const step = index + 1
          const done = count >= step
          return (
            <Fragment key={step}>
              {index > 0 && <span aria-hidden className="h-px min-w-3 flex-1 bg-border" />}
              <span className={`${dot} ${done ? earned : 'opacity-60'}`}>
                {done ? (
                  <Check aria-hidden className="size-4" strokeWidth={2.5} />
                ) : (
                  <span aria-hidden className="text-xs font-bold">
                    {step}
                  </span>
                )}
                <span className="sr-only">
                  {done ? `${step}ᵉ leurre au panier` : `${step}ᵉ leurre à ajouter`}
                </span>
              </span>
            </Fragment>
          )
        })}

        <span aria-hidden className="h-px min-w-3 flex-1 bg-border" />

        {/* Le 4e offert, AU CHOIX — cliquer montre le Pirate (le choix star).
            `key` re-monte le jalon au déblocage → `.px-pop` rejoue (une fois,
            motion-safe). */}
        <button
          key={unlocked ? 'gift-earned' : 'gift-locked'}
          type="button"
          onClick={onJumpCollector}
          aria-current={activeColorwayId === null ? 'true' : undefined}
          aria-label={`Le 4e leurre, offert au choix — ${
            unlocked ? 'à choisir en commandant' : 'offert dès 3 leurres achetés'
          }. Voir le ${collector}.`}
          className={`${dot} ${activeColorwayId === null ? activeRing : ''} ${
            unlocked ? `px-pop ${earned}` : 'opacity-60 hover:opacity-90'
          }`}
        >
          {unlocked ? (
            <Check aria-hidden className="size-4" strokeWidth={2.5} />
          ) : (
            <Gift aria-hidden className="size-3.5" strokeWidth={2} />
          )}
        </button>
      </div>

      <p aria-live="polite" className="text-xs leading-snug text-prose-foreground">
        {message}
      </p>
    </section>
  )
}
