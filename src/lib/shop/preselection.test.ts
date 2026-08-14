import { describe, expect, it } from 'vitest'
import { parsePreselection } from './checkout-schema'
import { PRODUCT } from './product'

const C1 = PRODUCT.colorways[0].id

describe('parsePreselection', () => {
  it('URL vide → aucun défaut imposé (la page garde les siens)', () => {
    expect(parsePreselection({})).toEqual({})
  })

  it('valeurs valides → présélection complète', () => {
    expect(parsePreselection({ offre: 'collection', coloris: C1 })).toEqual({
      offre: 'collection',
      coloris: C1,
    })
  })

  it('valeur inconnue ou forme inattendue → champ ignoré, jamais d’erreur', () => {
    expect(parsePreselection({ offre: 'gratuite', coloris: C1 })).toEqual({ coloris: C1 })
    expect(parsePreselection({ offre: ['solo', 'solo'], coloris: 'coloris-pirate' })).toEqual({})
  })

  it('un champ valide survit à un champ invalide', () => {
    expect(parsePreselection({ offre: 'solo', coloris: 'nope' })).toEqual({ offre: 'solo' })
  })
})
