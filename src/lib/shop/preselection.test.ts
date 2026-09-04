import { describe, expect, it } from 'vitest'
import { parsePreselection } from './checkout-schema'

describe('parsePreselection', () => {
  it('URL vide → aucun défaut imposé (la page garde les siens)', () => {
    expect(parsePreselection({})).toEqual({})
  })

  it('un pack connu est retenu', () => {
    expect(parsePreselection({ pack: 'leurres' })).toEqual({ pack: 'leurres' })
    expect(parsePreselection({ pack: 'goujons' })).toEqual({ pack: 'goujons' })
  })

  it('valeur inconnue ou forme inattendue → champ ignoré, jamais d’erreur', () => {
    // Une URL bricolée n'est pas une faute du visiteur : on retombe sur le
    // défaut de la page plutôt que d'afficher une erreur.
    expect(parsePreselection({ pack: 'gratuit' })).toEqual({})
    expect(parsePreselection({ pack: ['leurres', 'goujons'] })).toEqual({})
  })

  it('ignore les anciens paramètres de l’offre supprimée', () => {
    // `coloris`, `offre` et `cadeau` traînent encore dans des liens partagés
    // avant le 2026-09-04. Ils ne doivent ni être retenus, ni faire échouer.
    expect(parsePreselection({ coloris: 'coloris-1', offre: 'collection' })).toEqual({})
    expect(parsePreselection({ pack: 'leurres', offre: 'solo' })).toEqual({ pack: 'leurres' })
  })
})
