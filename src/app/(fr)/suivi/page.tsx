import type { Metadata } from 'next'
import Link from 'next/link'
import { Marker } from '@/components/ui/Marker'
import { PRODUCT } from '@/lib/shop/product'

export const metadata: Metadata = {
  title: 'Suivi de commande',
  description:
    'Où en est votre commande Alure : confirmation, préparation, expédition avec numéro de suivi, livraison sous 10 à 20 jours ouvrés.',
}

const STEPS: { title: string; detail: string }[] = [
  {
    title: 'Commande confirmée',
    detail:
      'Juste après votre paiement, vous recevez un email de confirmation avec le récapitulatif. Pas d’email sous 30 minutes ? Vérifiez vos courriers indésirables.',
  },
  {
    title: 'Préparation',
    detail:
      'Nous transmettons votre commande à l’expédition sous 1 à 2 jours ouvrés. Votre coloris part tel que vous l’avez choisi.',
  },
  {
    title: 'Expédition',
    detail:
      'Vous recevez par email un numéro de suivi international. Il peut mettre 2 à 4 jours à s’activer chez le transporteur : c’est normal.',
  },
  {
    title: 'Livraison',
    detail: `Votre leurre arrive sous ${PRODUCT.deliveryDelay} au total. Au-delà de 30 jours ouvrés sans livraison, contactez-nous : renvoi ou remboursement, à votre choix.`,
  },
]

/**
 * Suivi de commande (spec boutique.md T4). Sans compte ni BDD : cette page
 * explique le parcours réel ; le numéro de suivi fait foi et arrive par email.
 */
export default function SuiviPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <h1 className="text-3xl font-bold text-balance md:text-4xl">
        <Marker>Suivi</Marker> de commande
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Pas de compte à créer : chaque étape vous est confirmée par email, à l'adresse utilisée au
        paiement.
      </p>

      <ol className="mt-10 space-y-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold tabular-nums"
            >
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-muted-foreground">
        Pour toute question sur votre commande, répondez à votre email de confirmation : il arrive
        directement chez nous.
      </p>
      <p className="mt-6">
        <Link href="/faq" className="text-sm font-semibold underline underline-offset-4">
          Lire les questions fréquentes
        </Link>
      </p>
    </main>
  )
}
