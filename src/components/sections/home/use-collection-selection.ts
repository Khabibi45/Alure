'use client'

import { useSyncExternalStore } from 'react'
import { SELECTION_STORAGE_KEY, sanitizeSelection } from '@/lib/shop/collection-selection'

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
  /** Ajoute UN leurre — les doublons sont permis, le panier est un compteur. */
  add: (colorwayId: string) => void
  /** Retire UNE occurrence de ce coloris (la dernière ajoutée). */
  removeOne: (colorwayId: string) => void
} {
  const selection = useSyncExternalStore(subscribe, readSelection, () => EMPTY)
  return {
    selection,
    add: (colorwayId: string) => {
      writeSelection([...readSelection(), colorwayId])
    },
    removeOne: (colorwayId: string) => {
      const current = readSelection()
      const index = current.lastIndexOf(colorwayId)
      if (index >= 0) writeSelection([...current.slice(0, index), ...current.slice(index + 1)])
    },
  }
}
