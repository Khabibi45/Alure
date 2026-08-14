'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { checkoutSchema } from '@/lib/shop/checkout-schema'
import { orderableError } from '@/lib/shop/product'
import { useColorwaySelection } from './colorway-context'

/**
 * L'état du passage en caisse, partagé entre les deux panneaux de la page
 * produit : l'îlot prix/coloris (colonne) et le panneau d'offre (pleine
 * largeur). Le CTA vit dans le second, mais le premier doit savoir qu'un
 * paiement démarre (radios verrouillés) et pouvoir effacer une erreur quand la
 * sélection change. Un seul endroit décide — deux statuts divergents seraient
 * exactement l'état illégal que web-illegal-states interdit.
 */
export type CheckoutStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; message: string }

type Checkout = {
  status: CheckoutStatus
  /** Valide la sélection, crée la session Stripe et part vers le paiement. */
  submit: () => Promise<void>
  /** À appeler quand la sélection change : une erreur périmée ne reste pas affichée. */
  clearError: () => void
}

const CheckoutContext = createContext<Checkout | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { coloris, offre, cadeau } = useColorwaySelection()
  const [status, setStatus] = useState<CheckoutStatus>({ state: 'idle' })

  // La logique vient telle quelle de l'ancienne BuyBox (spec boutique.md T2) :
  // schéma partagé, disponibilité revérifiée, et navigation UNIQUEMENT vers
  // checkout.stripe.com — défense en profondeur, pas une politesse.
  const submit = useCallback(async () => {
    // Le cadeau n'existe qu'avec l'offre groupée — jamais relayé en solo.
    const parsed = checkoutSchema.safeParse({
      coloris,
      offre,
      ...(offre === 'collection' ? { cadeau } : {}),
    })
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
  }, [coloris, offre, cadeau])

  // Mise à jour fonctionnelle : pas de dépendance au statut courant.
  const clearError = useCallback(() => {
    setStatus((current) => (current.state === 'error' ? { state: 'idle' } : current))
  }, [])

  const value = useMemo<Checkout>(() => ({ status, submit, clearError }), [status, submit, clearError])

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout(): Checkout {
  const value = useContext(CheckoutContext)
  // Échec bruyant : sans fournisseur, le CTA et les radios joueraient chacun leur
  // partition sans que rien ne le signale.
  if (!value) throw new Error('useCheckout doit être appelé sous <CheckoutProvider>.')
  return value
}
