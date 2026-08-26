'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { checkoutSchema } from '@/lib/shop/checkout-schema'
import { splitLocalePath } from '@/lib/i18n/paths'
import { getColorway, orderableError } from '@/lib/shop/product'
import { useColorwaySelection } from './colorway-context'
import type { LeurreStrings } from './leurre-strings'

/**
 * L'état du passage en caisse, partagé entre les deux panneaux de la page
 * produit : l'îlot prix/coloris (colonne) et le panneau d'offre (pleine
 * largeur). Le CTA vit dans le second, mais le premier doit savoir qu'un
 * paiement démarre (radios verrouillés) et pouvoir effacer une erreur quand la
 * sélection change. Un seul endroit décide — deux statuts divergents seraient
 * exactement l'état illégal que web-illegal-states interdit.
 */
export type CheckoutStatus =
  { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string }

type Checkout = {
  status: CheckoutStatus
  /** Valide la sélection, crée la session Stripe et part vers le paiement. */
  submit: () => Promise<void>
  /** À appeler quand la sélection change : une erreur périmée ne reste pas affichée. */
  clearError: () => void
}

const CheckoutContext = createContext<Checkout | null>(null)

export function CheckoutProvider({
  children,
  strings,
}: {
  children: ReactNode
  strings: LeurreStrings
}) {
  const pathname = usePathname()
  const { coloris, offre, cadeau } = useColorwaySelection()
  const [status, setStatus] = useState<CheckoutStatus>({ state: 'idle' })

  // La logique vient telle quelle de l'ancienne BuyBox (spec boutique.md T2) :
  // schéma partagé, disponibilité revérifiée, et navigation UNIQUEMENT vers
  // checkout.stripe.com — défense en profondeur, pas une politesse.
  const submit = useCallback(async () => {
    // Le cadeau n'existe qu'avec l'offre groupée — jamais relayé en solo.
    // La langue se lit dans l'URL courante : c'est elle qui décidera de la
    // langue de la page Stripe et des pages de retour. Sans ce champ, un
    // acheteur venu de `/en` payait sur un écran français.
    const { locale } = splitLocalePath(pathname)
    const parsed = checkoutSchema.safeParse({
      coloris,
      offre,
      langue: locale,
      ...(offre === 'collection' ? { cadeau } : {}),
    })
    if (!parsed.success) {
      setStatus({ state: 'error', message: strings.errorFormInvalid })
      return
    }
    // La règle reste au domaine ; seul le TEXTE change de langue. `orderableError`
    // répond en français (il sert aussi la route API et les emails) : on ne
    // relaie donc pas sa phrase, on redit la même chose dans la langue de la page.
    if (orderableError(parsed.data.coloris) !== null) {
      setStatus({
        state: 'error',
        message: getColorway(parsed.data.coloris)
          ? strings.errorColorwaySoldOut
          : strings.errorColorwayUnknown,
      })
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
        // Le corps de la réponse est écrit en FRANÇAIS par la route API : on le
        // journalise pour le diagnostic, mais on affiche la phrase de la langue
        // servie, choisie sur le STATUT — un anglophone n'a pas à lire
        // « Trop de tentatives » au moment de payer.
        console.error(
          'POST /api/checkout : réponse en erreur.',
          res.status,
          typeof body === 'object' && body !== null && 'error' in body
            ? (body as { error: unknown }).error
            : body
        )
        setStatus({ state: 'error', message: checkoutErrorMessage(res.status, strings) })
        return
      }
      const url =
        typeof body === 'object' && body !== null && 'url' in body
          ? String((body as { url: unknown }).url)
          : null
      if (!url || !url.startsWith('https://checkout.stripe.com/')) {
        setStatus({ state: 'error', message: strings.errorPaymentBadResponse })
        return
      }
      window.location.assign(url)
      // Pas de retour à idle : la page part vers Stripe.
    } catch {
      setStatus({ state: 'error', message: strings.errorPaymentOffline })
    }
  }, [coloris, offre, cadeau, pathname, strings])

  // Mise à jour fonctionnelle : pas de dépendance au statut courant.
  const clearError = useCallback(() => {
    setStatus((current) => (current.state === 'error' ? { state: 'idle' } : current))
  }, [])

  const value = useMemo<Checkout>(
    () => ({ status, submit, clearError }),
    [status, submit, clearError]
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

/**
 * Ce que l'acheteur lit quand `/api/checkout` refuse, dans la langue de sa page.
 *
 * Le STATUT HTTP fait foi, pas le corps de la réponse : c'est le seul élément
 * que la route garantit, et il dit déjà ce qu'il faut faire — patienter (429),
 * corriger sa sélection (400/413), ou réessayer plus tard (503). Traduire le
 * texte du serveur aurait supposé de le reconnaître par sa phrase, ce qui casse
 * silencieusement à la première reformulation.
 */
function checkoutErrorMessage(status: number, strings: LeurreStrings): string {
  if (status === 429) return strings.errorRateLimited
  if (status === 400 || status === 413) return strings.errorFormInvalid
  if (status === 503) return strings.errorPaymentUnavailable
  return strings.errorPaymentFailed
}

export function useCheckout(): Checkout {
  const value = useContext(CheckoutContext)
  // Échec bruyant : sans fournisseur, le CTA et les radios joueraient chacun leur
  // partition sans que rien ne le signale.
  if (!value) throw new Error('useCheckout doit être appelé sous <CheckoutProvider>.')
  return value
}
