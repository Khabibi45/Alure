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
import { PRODUCT } from '@/lib/shop/product'

/**
 * Le coloris REGARDÉ, partagé par le visuel et la galerie de détails.
 *
 * Ce n'est plus un choix commercial. Depuis le passage aux packs (2026-09-04),
 * le pack de leurres contient une unité de CHAQUE coloris : il n'y a plus rien à
 * sélectionner pour acheter. Ce contexte ne dit donc qu'une chose — lequel des
 * quatre on est en train de détailler — et c'est pour ça qu'il ne connaît ni
 * l'offre, ni le cadeau, ni le pack.
 */
type ColorwaySelection = {
  coloris: string
  setColoris: Dispatch<SetStateAction<string>>
}

const ColorwayContext = createContext<ColorwaySelection | null>(null)

export function ColorwayProvider({
  children,
  initialColoris,
}: {
  children: ReactNode
  /** Coloris ouvert à l'arrivée, si l'URL en désigne un. */
  initialColoris?: string
}) {
  const [coloris, setColoris] = useState(initialColoris ?? PRODUCT.colorways[0].id)
  const value = useMemo(() => ({ coloris, setColoris }), [coloris])
  return <ColorwayContext.Provider value={value}>{children}</ColorwayContext.Provider>
}

export function useColorwaySelection(): ColorwaySelection {
  const value = useContext(ColorwayContext)
  // Échec bruyant : sans fournisseur, le visuel et la galerie afficheraient deux
  // coloris différents sans que rien ne le signale.
  if (!value) throw new Error('useColorwaySelection doit être appelé sous <ColorwayProvider>.')
  return value
}
