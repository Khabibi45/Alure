import type { Metadata } from 'next'
import Link from 'next/link'
import { Marker } from '@/components/ui/Marker'
import { getDictionary, t } from '@/lib/i18n'

/**
 * Cette page recopiait ses quatre étapes en dur, en double du dictionnaire que
 * `/en/suivi` utilisait déjà. Les deux ont divergé au passage du dropshipping
 * au stock français : la version française annonçait encore un « numéro de
 * suivi international », une activation en 2 à 4 jours et un recours à 30 jours
 * — trois promesses devenues fausses. Une seule source, désormais.
 */
const dict = getDictionary('fr')

export const metadata: Metadata = {
  title: t(dict, 'TRACKING.TITLE'),
  description: t(dict, 'TRACKING.META_DESCRIPTION', {
    delai: t(dict, 'PRODUCT.DELAY_VALUE'),
  }),
}

const STEP_KEYS = ['CONFIRMED', 'PREPARED', 'SHIPPED', 'DELIVERED'] as const

const STEPS: { title: string; detail: string }[] = STEP_KEYS.map((key) => ({
  title: t(dict, `TRACKING.STEP_${key}_TITLE`),
  detail: t(dict, `TRACKING.STEP_${key}_BODY`, {
    delai: t(dict, 'PRODUCT.DELAY_VALUE'),
  }),
}))

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
