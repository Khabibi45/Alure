'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { PRODUCT, type OfferId } from '@/lib/shop/product'

/**
 * Le coloris et la quantité choisis, partagés par la galerie 3D et l'îlot d'achat.
 *
 * Ils vivent ici plutôt que dans `<BuyBox>` parce que la galerie doit montrer LE
 * coloris sélectionné : deux composants séparés par la grille de la page produit
 * lisent la même sélection. Le fournisseur est un composant client qui accepte des
 * enfants rendus côté serveur — la page reste un Server Component.
 */

type ColorwaySelection = {
  coloris: string
  setColoris: Dispatch<SetStateAction<string>>
  offre: OfferId
  setOffre: Dispatch<SetStateAction<OfferId>>
  /** Le 4e leurre OFFERT, au choix (offre groupée) — coloris ou collector. */
  cadeau: string
  setCadeau: Dispatch<SetStateAction<string>>
}

const ColorwayContext = createContext<ColorwaySelection | null>(null)

export function ColorwayProvider({
  children,
  initialColoris,
  initialOffre,
}: {
  children: ReactNode
  /** Présélection portée par l'URL (frise de l'accueil), déjà validée côté serveur. */
  initialColoris?: string
  initialOffre?: OfferId
}) {
  const [coloris, setColoris] = useState(initialColoris ?? PRODUCT.colorways[0].id)
  const [offre, setOffre] = useState<OfferId>(initialOffre ?? 'solo')
  // Le Pirate est le choix par défaut du 4e offert : c'est lui qu'on vient chercher.
  const [cadeau, setCadeau] = useState<string>(PRODUCT.collector.id)
  const value = useMemo(
    () => ({ coloris, setColoris, offre, setOffre, cadeau, setCadeau }),
    [coloris, offre, cadeau]
  )
  return <ColorwayContext.Provider value={value}>{children}</ColorwayContext.Provider>
}

export function useColorwaySelection(): ColorwaySelection {
  const value = useContext(ColorwayContext)
  // Échec bruyant : sans fournisseur, la galerie et l'îlot d'achat afficheraient
  // deux sélections différentes sans que rien ne le signale.
  if (!value) throw new Error('useColorwaySelection doit être appelé sous <ColorwayProvider>.')
  return value
}
