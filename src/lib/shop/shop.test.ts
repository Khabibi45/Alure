// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { checkoutSchema } from './checkout-schema'
import {
  OFFER_IDS,
  PRODUCT,
  checkoutLines,
  collectorIncluded,
  formatEuros,
  formatLength,
  formatSpecs,
  formatWeight,
  getOffer,
  offerSummary,
  orderableError,
  luresReceived,
  perLureAtMostCents,
  perLureCents,
  savingsCents,
  totalCents,
  type Colorway,
} from './product'

const validColoris = PRODUCT.colorways[0].id

describe('checkoutSchema (partagé client/serveur)', () => {
  it('accepte une commande valide', () => {
    expect(checkoutSchema.safeParse({ coloris: validColoris, offre: 'solo' }).success).toBe(true)
    expect(checkoutSchema.safeParse({ coloris: validColoris, offre: 'collection' }).success).toBe(
      true
    )
  })

  it.each(['', 'duo', 'COLLECTION', '3'])('rejette l’offre %s', (offre) => {
    expect(checkoutSchema.safeParse({ coloris: validColoris, offre }).success).toBe(false)
  })

  it('rejette une commande sans offre', () => {
    expect(checkoutSchema.safeParse({ coloris: validColoris }).success).toBe(false)
  })

  it('rejette un coloris hors liste', () => {
    expect(checkoutSchema.safeParse({ coloris: 'coloris-pirate', offre: 'solo' }).success).toBe(
      false
    )
  })

  it('n’accepte plus de quantité — le champ n’existe plus dans le domaine', () => {
    const res = checkoutSchema.safeParse({ coloris: validColoris, offre: 'solo', quantite: 99 })
    expect(res.success).toBe(true)
    if (res.success) expect('quantite' in res.data).toBe(false)
  })

  it('retire les clés inconnues (l’API ne relaie jamais du JSON arbitraire)', () => {
    const res = checkoutSchema.safeParse({
      coloris: validColoris,
      offre: 'solo',
      injected: 'payload',
    })
    expect(res.success).toBe(true)
    if (res.success) expect('injected' in res.data).toBe(false)
  })
})

describe('L’offre à deux paliers — montants exacts', () => {
  // Les deux montants sont écrits en dur À DESSEIN : les recalculer avec la formule
  // testerait la formule contre elle-même. Ici, changer un prix rend le gate rouge et
  // force à regarder les nouveaux montants un par un.
  it.each([
    ['solo', 2199],
    ['collection', 4398],
  ])('%s → %s centimes', (offre, expected) => {
    expect(totalCents(offre)).toBe(expected)
  })

  it('la collection vaut exactement deux fois le solo — « les 2 autres pour le prix d’un »', () => {
    expect(totalCents('collection')).toBe(totalCents('solo') * 2)
  })

  it('ne renvoie que des entiers de centimes', () => {
    for (const id of OFFER_IDS) expect(Number.isInteger(totalCents(id))).toBe(true)
  })

  it.each(['', 'duo', 'COLLECTION', 'solo ', '5'])('échoue bruyamment sur l’offre « %s »', (id) => {
    expect(() => totalCents(id)).toThrow(/inconnue/i)
  })
})

describe('savingsCents — l’économie annoncée est vraie', () => {
  it('est nulle pour un leurre seul : il n’y a rien à comparer', () => {
    expect(savingsCents('solo')).toBe(0)
  })

  it('vaut le prix d’un leurre sur la collection', () => {
    expect(savingsCents('collection')).toBe(PRODUCT.pricing.soloCents)
  })

  it('se réfère au prix réellement pratiqué, jamais à un prix de référence gonflé', () => {
    for (const id of OFFER_IDS) {
      const offer = getOffer(id)
      expect(savingsCents(id)).toBe(
        PRODUCT.pricing.soloCents * offer.colorwayCount - offer.amountCents
      )
      expect(savingsCents(id)).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('perLureCents — le chiffre qui fait décider, et jamais un chiffre faux', () => {
  it('vaut le prix plein pour un leurre seul', () => {
    expect(perLureCents('solo')).toBe(2199)
  })

  it('refuse de répondre quand la division n’est pas exacte', () => {
    // 43,98 € pour 4 leurres = 10,995 € pièce : un montant qui n'existe pas en
    // centimes. On préfère ne rien afficher plutôt qu'un arrondi en notre faveur.
    expect(perLureCents('collection')).toBeNull()
  })

  it('annonce alors « moins de 11 € », qui est vrai et vérifiable', () => {
    expect(perLureAtMostCents('collection')).toBe(1100)
    expect(getOffer('collection').amountCents / luresReceived('collection')).toBeLessThan(1100)
  })

  it('compte le collector parmi les leurres reçus', () => {
    expect(luresReceived('solo')).toBe(1)
    expect(luresReceived('collection')).toBe(PRODUCT.colorways.length + 1)
  })
})

describe('collectorIncluded', () => {
  it('n’est offert qu’avec la collection', () => {
    expect(collectorIncluded('solo')).toBe(false)
    expect(collectorIncluded('collection')).toBe(true)
  })
})

describe('checkoutLines — ce qu’on encaisse est ce qu’on affiche', () => {
  // L'invariant de l'offre : si la somme des lignes envoyées à Stripe s'écartait du
  // total affiché, le client paierait un montant qu'il n'a jamais vu.
  it.each(OFFER_IDS)('la somme des lignes vaut totalCents pour %s', (id) => {
    const sum = checkoutLines(id, 'Coloris test').reduce(
      (acc, l) => acc + l.unitAmountCents * l.quantity,
      0
    )
    expect(sum).toBe(totalCents(id))
  })

  it('nomme le coloris commandé sur l’offre solo', () => {
    const lines = checkoutLines('solo', 'Truite')
    expect(lines).toHaveLength(1)
    expect(lines[0].name).toContain('Truite')
  })

  it('facture le collector 0,00 € : il est offert, il ne change pas le total', () => {
    const lines = checkoutLines('collection', 'Truite')
    expect(lines).toHaveLength(2)
    const gift = lines.find((l) => l.unitAmountCents === 0)
    expect(gift).toBeDefined()
    expect(gift?.name).toMatch(/offert/i)
  })

  it.each(['', 'duo', 'panier'])('échoue bruyamment sur l’offre « %s »', (id) => {
    expect(() => checkoutLines(id, 'Truite')).toThrow(/inconnue/i)
  })
})

describe('offerSummary — la ligne lue dans les emails', () => {
  it('nomme le coloris pour un leurre seul', () => {
    expect(offerSummary('solo', 'Truite')).toContain('Truite')
  })

  it('annonce le collector pour la collection', () => {
    expect(offerSummary('collection', 'Truite')).toMatch(/offert/i)
  })
})

describe('orderableError — disponibilité réelle', () => {
  const fixtures: Colorway[] = [
    { id: 'ok', label: 'Dispo', available: true, image: '/produit/test.webp' },
    { id: 'epuise', label: 'Épuisé', available: false, image: '/produit/test.webp' },
  ]

  it('null pour un coloris disponible', () => {
    expect(orderableError('ok', fixtures)).toBeNull()
  })

  it('message pour un coloris épuisé', () => {
    expect(orderableError('epuise', fixtures)).toMatch(/épuisé/i)
  })

  it('message pour un coloris inconnu', () => {
    expect(orderableError('fantome', fixtures)).toMatch(/existe pas/i)
  })

  it('tous les coloris du produit réel sont dans un état cohérent', () => {
    for (const c of PRODUCT.colorways) {
      const err = orderableError(c.id)
      expect(err === null || /épuisé/i.test(err)).toBe(true)
    }
  })
})

describe('formatage', () => {
  it('formate les montants de l’offre sans décimale parasite', () => {
    expect(formatEuros(totalCents('solo'))).toContain('21,99')
    expect(formatEuros(totalCents('collection'))).toContain('43,98')
  })

  it('écrit les dimensions avec la virgule décimale française', () => {
    expect(formatLength()).toBe('6,5 cm')
    expect(formatWeight()).toBe('6,5 g')
    expect(formatSpecs()).toBe('6,5 cm · 6,5 g')
  })
})
