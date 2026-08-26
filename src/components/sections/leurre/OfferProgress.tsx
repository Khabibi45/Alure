'use client'

import type { ReactNode } from 'react'
import { Check, Lock } from 'lucide-react'
import { PRODUCT, type OfferId } from '@/lib/shop/product'
import { fillNodes } from './fill-nodes'
import type { LeurreStrings } from './leurre-strings'

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
 *
 * Les libellés et le prix arrivent préparés du serveur : le montant du pas était
 * formaté sans la langue, et affichait donc « 21,99 € » sur la page anglaise.
 */
export function OfferProgress({ offre, strings }: { offre: OfferId; strings: LeurreStrings }) {
  const collection = offre === 'collection'
  const solo = strings.soloPrice

  const steps: {
    key: string
    title: ReactNode
    detail: string
    done: boolean
    reward?: boolean
  }[] = [
    {
      key: 'first',
      title: strings.progressFirst,
      detail: solo,
      done: true,
    },
    {
      key: 'second',
      title: strings.progressSecond,
      // Un signe, pas un mot : le pas d'un palier se lit dans les deux langues.
      detail: `+${solo}`,
      done: collection,
    },
    {
      key: 'third',
      title: strings.progressThird,
      detail: `+${solo}`,
      done: collection,
    },
    {
      key: 'gift',
      // Le nom du collector reste en français, hors traduction automatique :
      // c'est celui qui figurera sur le reçu et dans l'email.
      title: fillNodes(strings.progressCollector, {
        collector: <span translate="no">{PRODUCT.collector.label}</span>,
      }),
      detail: collection ? strings.progressCollectorDone : strings.progressCollectorTodo,
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
                {step.reward && !step.done && (
                  <span className="sr-only"> {strings.progressLockedA11y}</span>
                )}
              </span>
              <span className="block text-[0.8125rem] text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
