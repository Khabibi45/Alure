import { describe, expect, it } from 'vitest'
import {
  CART_MAX,
  cartBoxState,
  cartStatus,
  collectionAvailable,
  freebiesUnlocked,
  giftBoxState,
  isCartFull,
  isInCart,
  resolveOffer,
  sanitizeSelection,
  toggleColorway,
} from './collection-selection'
import { OFFERS, PRODUCT, totalCents } from './product'

const [C1, C2, C3] = PRODUCT.colorways.map((c) => c.id)

describe('sanitizeSelection', () => {
  it('rejette tout ce qui n’est pas un tableau', () => {
    expect(sanitizeSelection(null)).toEqual([])
    expect(sanitizeSelection('coloris-1')).toEqual([])
    expect(sanitizeSelection({ 0: C1 })).toEqual([])
  })

  it('écarte les inconnus, DÉDOUBLONNE, et garde l’ordre d’ajout', () => {
    expect(sanitizeSelection([C2, 'leurre-magique', C2, 42, C1, C3])).toEqual([C2, C1, C3])
    expect(sanitizeSelection([C1])).toEqual([C1])
  })

  it('borne au nombre de coloris que l’offre fait payer', () => {
    expect(sanitizeSelection([C1, C2, C3, C1, C2])).toHaveLength(CART_MAX)
    expect(CART_MAX).toBe(OFFERS.collection.colorwayCount)
  })

  it('un panier restauré ne peut jamais contenir deux fois le même coloris', () => {
    // C'est l'invariant d'honnêteté : l'offre groupée expédie LES coloris du
    // catalogue. Un doublon au panier promettrait un colis qui n'existe pas.
    const restored = sanitizeSelection([C1, C1, C1])
    expect(restored).toEqual([C1])
    expect(new Set(restored).size).toBe(restored.length)
  })
})

describe('toggleColorway — l’unique mutation du panier', () => {
  it('ajoute un coloris absent', () => {
    expect(toggleColorway([], C1)).toEqual([C1])
    expect(toggleColorway([C1], C2)).toEqual([C1, C2])
  })

  it('retire un coloris présent', () => {
    expect(toggleColorway([C1, C2], C1)).toEqual([C2])
    expect(toggleColorway([C1], C1)).toEqual([])
  })

  it('n’ajoute jamais un doublon', () => {
    const once = toggleColorway([], C1)
    // Deuxième appel : c'est un retrait, pas un second exemplaire.
    expect(toggleColorway(once, C1)).toEqual([])
  })

  it('ignore un coloris inconnu au lieu de l’introduire', () => {
    expect(toggleColorway([C1], 'leurre-magique')).toEqual([C1])
  })

  it('ne déborde pas au-delà du plafond', () => {
    const full = [C1, C2, C3]
    expect(full).toHaveLength(CART_MAX)
    // Tous les coloris connus sont déjà pris : rien à ajouter, donc rien ne bouge.
    expect(toggleColorway(full, C1)).toEqual([C2, C3])
  })

  it('ne mute jamais le tableau reçu', () => {
    const before = [C1]
    toggleColorway(before, C2)
    expect(before).toEqual([C1])
  })
})

describe('isInCart / isCartFull', () => {
  it('dit ce qui est dedans', () => {
    expect(isInCart([C1, C2], C1)).toBe(true)
    expect(isInCart([C1, C2], C3)).toBe(false)
  })

  it('dit quand le panier est plein', () => {
    expect(isCartFull([])).toBe(false)
    expect(isCartFull([C1, C2])).toBe(false)
    expect(isCartFull([C1, C2, C3])).toBe(true)
  })
})

describe('resolveOffer', () => {
  it('vide → null : rien à commander', () => {
    expect(resolveOffer([])).toBeNull()
  })

  it('1 coloris → solo, avec CE coloris', () => {
    expect(resolveOffer([C2])).toEqual({ offre: 'solo', coloris: C2 })
  })

  it('2 coloris → toujours solo : il n’existe AUCUNE offre à 2 leurres', () => {
    expect(resolveOffer([C1, C3])?.offre).toBe('solo')
  })

  it('les 3 coloris → « 3 achetés, le 4e offert »', () => {
    const resolved = resolveOffer([C1, C2, C3])
    expect(resolved?.offre).toBe('collection')
    // L'invariant qui rend la résolution honnête : « 3 achetés » = exactement
    // 3 × l'unité, au centime près.
    expect(OFFERS.collection.paidCount * OFFERS.solo.amountCents).toBe(totalCents('collection'))
  })
})

describe('freebiesUnlocked — le 4e offert se débloque quand les payés y sont', () => {
  it('sous le seuil : rien d’offert', () => {
    expect(freebiesUnlocked([])).toBe(false)
    expect(freebiesUnlocked([C1])).toBe(false)
    expect(freebiesUnlocked([C1, C2])).toBe(false)
  })

  it('au complet : le 4e leurre est offert, au choix', () => {
    expect(freebiesUnlocked([C1, C2, C3])).toBe(true)
  })
})

describe('shortLabel — la contrainte WCAG 2.5.3 « Label in Name »', () => {
  it('est un préfixe du nom complet, pour chaque coloris', () => {
    for (const colorway of PRODUCT.colorways) {
      // Le texte VISIBLE d'un contrôle doit être contenu dans son nom
      // accessible : sans ça, « clique sur Truite » en commande vocale
      // n'atteint pas le bouton dont le nom accessible dit « Truite
      // arc-en-ciel ». Un shortLabel inventé (« Arc-en-ciel ») casserait ça.
      expect(
        colorway.label.startsWith(colorway.shortLabel),
        `« ${colorway.shortLabel} » n’est pas un préfixe de « ${colorway.label} » — la commande vocale n’atteindrait pas la case du panier`
      ).toBe(true)
    }
  })

  it('reste assez court pour quatre cases sur un écran de 375 px', () => {
    for (const colorway of PRODUCT.colorways) {
      expect(colorway.shortLabel.length).toBeLessThanOrEqual(8)
    }
  })
})

describe('l’état affiché des cases', () => {
  it('une case libre passe « au panier » une fois prise', () => {
    expect(cartBoxState([], C1)).toBe('libre')
    expect(cartBoxState([C1], C1)).toBe('au-panier')
  })

  it('la 4e case passe de « offert » à « à choisir » quand les payés y sont', () => {
    expect(giftBoxState([])).toBe('offert')
    expect(giftBoxState([C1, C2])).toBe('offert')
    expect(giftBoxState([C1, C2, C3])).toBe('a-choisir')
  })

  it('l’offre groupée est composable tant qu’aucun coloris n’est épuisé', () => {
    // Tous disponibles dans le catalogue livré : la garde est donc passante.
    expect(collectionAvailable()).toBe(PRODUCT.colorways.every((c) => c.available))
  })
})

describe('cartStatus — la phrase d’état est une CLÉ, jamais un texte', () => {
  it('rend une clé de dictionnaire, pas une phrase française', () => {
    for (const selection of [[], [C1], [C1, C2], [C1, C2, C3]]) {
      const status = cartStatus(selection)
      expect(status.key).toMatch(/^CART\.STATE_/)
      // Une phrase en dur ici casserait la règle Alure n°6 (parité anglaise).
      expect(status.key).not.toMatch(/[a-z]{4,}\s/)
    }
  })

  it('nomme les coloris du panier, dans l’ordre d’ajout', () => {
    const status = cartStatus([C2, C1])
    expect(status.labels).toEqual([
      PRODUCT.colorways.find((c) => c.id === C2)?.label,
      PRODUCT.colorways.find((c) => c.id === C1)?.label,
    ])
  })

  it('distingue les quatre situations', () => {
    expect(cartStatus([]).key).toBe('CART.STATE_EMPTY')
    expect(cartStatus([C1]).key).toBe('CART.STATE_ONE')
    expect(cartStatus([C1, C2]).key).toBe('CART.STATE_SOME')
    expect(cartStatus([C1, C2, C3]).key).toBe('CART.STATE_FULL')
  })
})
