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
}

const ColorwayContext = createContext<ColorwaySelection | null>(null)

export function ColorwayProvider({ children }: { children: ReactNode }) {
  const [coloris, setColoris] = useState(PRODUCT.colorways[0].id)
  const [offre, setOffre] = useState<OfferId>('solo')
  const value = useMemo(() => ({ coloris, setColoris, offre, setOffre }), [coloris, offre])
  return <ColorwayContext.Provider value={value}>{children}</ColorwayContext.Provider>
}

export function useColorwaySelection(): ColorwaySelection {
  const value = useContext(ColorwayContext)
  // Échec bruyant : sans fournisseur, la galerie et l'îlot d'achat afficheraient
  // deux sélections différentes sans que rien ne le signale.
  if (!value) throw new Error('useColorwaySelection doit être appelé sous <ColorwayProvider>.')
  return value
}
