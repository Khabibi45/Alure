'use client'

import { Check, Lock } from 'lucide-react'
import { PRODUCT, formatEuros, type OfferId } from '@/lib/shop/product'

/**
 * La progression de l'offre, en trois points.
 *
 * Elle répond à trois questions d'un coup d'œil : où j'en suis, ce qu'il me
 * manque, ce que ça débloque. C'est le seul « effet de jeu » du site, et il est
 * borné par les règles d'honnêteté de la spec :
 *  - un point non atteint dit ce qu'il FAUT FAIRE, jamais un compte à rebours inventé ;
 *  - aucune urgence fabriquée (pas de minuteur, pas de « plus que X en stock ») ;
 *  - la barre se remplit UNE FOIS (fondation §6), et `prefers-reduced-motion`
 *    l'affiche directement remplie via `motion-safe:`.
 */
export function OfferProgress({ offre }: { offre: OfferId }) {
  const collection = offre === 'collection'
  const solo = formatEuros(PRODUCT.pricing.soloCents)

  const steps = [
    {
      key: 'first',
      title: 'Votre premier leurre',
      detail: solo,
      done: true,
    },
    {
      key: 'others',
      title: 'Les 2 autres pour le prix d’un',
      detail: collection ? `+${solo} — les 3 coloris sont à vous` : `+${solo}`,
      done: collection,
    },
    {
      key: 'collector',
      title: `Le ${PRODUCT.collector.label}`,
      detail: collection ? 'offert avec votre collection' : 'offert dès les 3 coloris réunis',
      done: collection,
      reward: true,
    },
  ]

  const reached = steps.filter((s) => s.done).length
  const fill = ((reached - 1) / (steps.length - 1)) * 100

  return (
    <div className="rounded-card bg-surface p-5">
      {/* La barre : un rail, un remplissage. Transition unique, jamais en boucle. */}
      <div aria-hidden className="relative mb-5 h-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-success motion-safe:transition-[width] motion-safe:duration-[550ms] motion-safe:[transition-timing-function:var(--ease-out-soft)]"
          style={{ width: `${fill}%` }}
        />
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-3">
            <span
              aria-hidden
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                step.done ? 'bg-success text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.done ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <Lock className="size-3" strokeWidth={2.5} />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-[0.9375rem] font-bold ${
                  step.done ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
                {step.reward && !step.done && <span className="sr-only"> — à débloquer</span>}
              </span>
              <span className="block text-[0.8125rem] text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
