import { describe, expect, it } from 'vitest'
import {
  freebiesUnlocked,
  resolveOffer,
  sanitizeSelection,
} from './collection-selection'
import { OFFERS, PRODUCT, totalCents } from './product'

const [C1, C2, C3] = PRODUCT.colorways.map((c) => c.id)

describe('sanitizeSelection', () => {
  it('rejette tout ce qui n’est pas un tableau', () => {
    expect(sanitizeSelection(null)).toEqual([])
    expect(sanitizeSelection('coloris-1')).toEqual([])
    expect(sanitizeSelection({ 0: C1 })).toEqual([])
  })

  it('écarte les inconnus, GARDE les doublons (le panier est un compteur), borne à 3', () => {
    expect(sanitizeSelection([C2, 'leurre-magique', C2, 42, C1, C3])).toEqual([C2, C2, C1])
    expect(sanitizeSelection([C1])).toEqual([C1])
  })
})

describe('resolveOffer', () => {
  it('vide → null : rien à commander, pas de CTA', () => {
    expect(resolveOffer([])).toBeNull()
  })

  it('1 coloris → solo, avec CE coloris', () => {
    expect(resolveOffer([C2])).toEqual({ offre: 'solo', coloris: C2 })
  })

  it('2 coloris → toujours solo : il n’existe AUCUNE offre à 2 leurres', () => {
    expect(resolveOffer([C1, C3])?.offre).toBe('solo')
  })

  it('3 coloris → « 3 achetés, le 4e offert »', () => {
    const resolved = resolveOffer([C1, C2, C3])
    expect(resolved?.offre).toBe('collection')
    // L'invariant qui rend la résolution honnête : « 3 achetés » = exactement
    // 3 × l'unité, au centime près. Si le barème change, ce test force à revoir
    // la règle « 3 → l'offre complète ».
    expect(OFFERS.collection.paidCount * OFFERS.solo.amountCents).toBe(totalCents('collection'))
  })

  it('trois fois le MÊME leurre comptent aussi — un leurre quelconque suffit', () => {
    expect(resolveOffer([C1, C1, C1])?.offre).toBe('collection')
    expect(freebiesUnlocked([C1, C1, C1])).toBe(true)
  })
})

describe('freebiesUnlocked — le 4e offert se débloque à 3 achetés', () => {
  it('sous le seuil : rien d’offert', () => {
    expect(freebiesUnlocked([])).toBe(false)
    expect(freebiesUnlocked([C1])).toBe(false)
    expect(freebiesUnlocked([C1, C2])).toBe(false)
  })

  it('dès 3 achetés : le 4e leurre est offert, au choix', () => {
    expect(freebiesUnlocked([C1, C2, C3])).toBe(true)
  })
})
