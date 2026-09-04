'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { usePathname } from 'next/navigation'
import { checkoutSchema } from '@/lib/shop/checkout-schema'
import { splitLocalePath } from '@/lib/i18n/paths'
import { PACKS, orderableError, type PackId } from '@/lib/shop/product'
import type { LeurreStrings } from './leurre-strings'

/**
 * LE PACK CHOISI et l'état du passage en caisse, au même endroit.
 *
 * Les deux vont ensemble : changer de pack change le prix affiché ET doit
 * effacer une erreur périmée. Les séparer laisserait exister un instant où le
 * bouton paie un pack pendant que le prix en montre un autre — exactement
 * l'état illégal que `web-illegal-states` interdit.
 *
 * Le coloris, lui, vit ailleurs (`colorway-context`) : depuis les packs, ce
 * n'est plus une décision d'achat, seulement ce qu'on regarde.
 */
export type CheckoutStatus =
  { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string }

type Checkout = {
  /** Le pack qui sera payé. */
  pack: PackId
  setPack: Dispatch<SetStateAction<PackId>>
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
  initialPack,
}: {
  children: ReactNode
  strings: LeurreStrings
  /** Pack ouvert à l'arrivée, si l'URL en désigne un. */
  initialPack?: PackId
}) {
  const pathname = usePathname()
  const [pack, setPack] = useState<PackId>(initialPack ?? 'leurres')
  const [status, setStatus] = useState<CheckoutStatus>({ state: 'idle' })

  // La logique vient telle quelle de l'ancienne BuyBox (spec boutique.md T2) :
  // schéma partagé, disponibilité revérifiée, et navigation UNIQUEMENT vers
  // checkout.stripe.com — défense en profondeur, pas une politesse.
  const submit = useCallback(async () => {
    // La langue se lit dans l'URL courante : c'est elle qui décidera de la
    // langue de la page Stripe et des pages de retour. Sans ce champ, un
    // acheteur venu de `/en` payait sur un écran français.
    const { locale } = splitLocalePath(pathname)
    const parsed = checkoutSchema.safeParse({ pack, langue: locale })
    if (!parsed.success) {
      setStatus({ state: 'error', message: strings.errorFormInvalid })
      return
    }
    // La règle reste au domaine ; seul le TEXTE change de langue. `orderableError`
    // répond en français (il sert aussi la route API et les emails) : on ne
    // relaie donc pas sa phrase, on redit la même chose dans la langue de la page.
    if (orderableError(parsed.data.pack) !== null) {
      setStatus({
        state: 'error',
        message: parsed.data.pack in PACKS ? strings.errorPackSoldOut : strings.errorPackUnknown,
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
  }, [pack, pathname, strings])

  // Mise à jour fonctionnelle : pas de dépendance au statut courant.
  const clearError = useCallback(() => {
    setStatus((current) => (current.state === 'error' ? { state: 'idle' } : current))
  }, [])

  const value = useMemo<Checkout>(
    () => ({ pack, setPack, status, submit, clearError }),
    [pack, status, submit, clearError]
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
