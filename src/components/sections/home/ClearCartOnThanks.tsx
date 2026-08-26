'use client'

import { useEffect } from 'react'
import { clearStoredSelection } from './use-collection-selection'

/**
 * Vide le panier à l'arrivée sur la page de retour de paiement.
 *
 * Sans ça, le hero réaffichait « Commander les 4 leurres » à quelqu'un qui
 * venait de payer : le sessionStorage survit à l'aller-retour vers
 * checkout.stripe.com dans le même onglet, et rien n'effaçait la sélection.
 *
 * Volontairement inconditionnel : cette page n'est atteinte que par la
 * `success_url` de Stripe. On ne cherche PAS à vérifier la session ici — la
 * page reste générique et honnête (« si votre paiement a été validé »), c'est
 * l'email envoyé par le webhook qui fait foi.
 *
 * Ne rend rien : c'est un effet, pas un morceau d'interface.
 */
export function ClearCartOnThanks() {
  useEffect(() => {
    clearStoredSelection()
  }, [])
  return null
}
