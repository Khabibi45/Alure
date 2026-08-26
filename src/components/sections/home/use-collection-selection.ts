'use client'

import { useSyncExternalStore } from 'react'
import {
  SELECTION_STORAGE_KEY,
  sanitizeSelection,
  toggleColorway,
} from '@/lib/shop/collection-selection'

/**
 * La sélection « panier » de l'accueil, adossée au sessionStorage : elle
 * survit à l'aller-retour vers /leurre et revient au montage SANS écart
 * d'hydratation (le serveur voit une sélection vide, le client se resynchronise
 * après l'hydratation — c'est exactement le contrat de `useSyncExternalStore`).
 *
 * Le cache module évite de relire/reparser le stockage à chaque rendu : le
 * snapshot doit être STABLE par référence, sinon React boucle.
 */
let cache: readonly string[] | null = null
const listeners = new Set<() => void>()

const EMPTY: readonly string[] = []

function readSelection(): readonly string[] {
  if (cache === null) {
    try {
      const raw = window.sessionStorage.getItem(SELECTION_STORAGE_KEY)
      // Une donnée qui revient du stockage est une entrée externe : revalidée.
      cache = raw ? sanitizeSelection(JSON.parse(raw)) : EMPTY
    } catch {
      // Stockage indisponible ou JSON corrompu : la sélection repart vide.
      cache = EMPTY
    }
  }
  return cache
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function writeSelection(next: readonly string[]): void {
  cache = next
  try {
    window.sessionStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Stockage indisponible : la sélection vit le temps de la page, sans bruit.
  }
  for (const listener of listeners) listener()
}

export function useCollectionSelection(): {
  selection: readonly string[]
  /** Ajoute le coloris s'il est absent, le retire s'il est présent. */
  toggle: (colorwayId: string) => void
  /** Vide le panier. */
  clear: () => void
} {
  const selection = useSyncExternalStore(subscribe, readSelection, () => EMPTY)
  return {
    selection,
    toggle: (colorwayId: string) => {
      writeSelection(toggleColorway(readSelection(), colorwayId))
    },
    clear: () => writeSelection(EMPTY),
  }
}

/**
 * Efface le panier — appelé au retour de paiement (`/merci`).
 *
 * Sans ça, le hero réaffichait « Commander les 4 » à quelqu'un qui venait de
 * payer : le sessionStorage survit à l'aller-retour vers checkout.stripe.com
 * dans le même onglet. Exporté hors du hook parce que la page de retour n'a pas
 * besoin de lire la sélection, seulement de la jeter.
 */
export function clearStoredSelection(): void {
  writeSelection(EMPTY)
}
