// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { checkoutSchema } from './checkout-schema'
import {
  OFFER_IDS,
  PRODUCT,
  checkoutLines,
  GIFT_CHOICE_IDS,
  giftLabel,
  giftOrderableError,
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
    expect(
      checkoutSchema.safeParse({
        coloris: validColoris,
        offre: 'collection',
        cadeau: PRODUCT.collector.id,
      }).success
    ).toBe(true)
  })

  it('exige le choix du 4e offert avec l’offre groupée — jamais un cadeau deviné', () => {
    expect(checkoutSchema.safeParse({ coloris: validColoris, offre: 'collection' }).success).toBe(
      false
    )
    expect(
      checkoutSchema.safeParse({
        coloris: validColoris,
        offre: 'collection',
        cadeau: 'leurre-magique',
      }).success
    ).toBe(false)
    // En solo, le cadeau n'existe pas — sa présence ne casse rien, il est ignoré en aval.
    expect(
      checkoutSchema.safeParse({ coloris: validColoris, offre: 'solo', cadeau: validColoris })
        .success
    ).toBe(true)
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
    // 2026-08-14 : « 3 achetés, le 4e offert au choix » — 3 × 2199.
    ['collection', 6597],
  ])('%s → %s centimes', (offre, expected) => {
    expect(totalCents(offre)).toBe(expected)
  })

  it('« 3 achetés, le 4e offert » vaut exactement trois fois le solo — on paie 3 unités', () => {
    expect(totalCents('collection')).toBe(totalCents('solo') * 3)
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

  it('est nulle aussi sur l’offre groupée : la valeur est le CADEAU, pas une remise', () => {
    // 3 coloris payés 3 × l'unité : aucun rabais à annoncer — le 4e offert ne
    // se chiffre pas (le collector n'a pas de prix). Jamais une fausse économie.
    expect(savingsCents('collection')).toBe(0)
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
    // 65,97 € pour 4 leurres = 16,4925 € pièce : un montant qui n'existe pas en
    // centimes. On préfère ne rien afficher plutôt qu'un arrondi en notre faveur.
    expect(perLureCents('collection')).toBeNull()
  })

  it('annonce alors « moins de 17 € », qui est vrai et vérifiable', () => {
    expect(perLureAtMostCents('collection')).toBe(1700)
    expect(getOffer('collection').amountCents / luresReceived('collection')).toBeLessThan(1700)
  })

  it('compte le cadeau parmi les leurres reçus', () => {
    expect(luresReceived('solo')).toBe(1)
    expect(luresReceived('collection')).toBe(getOffer('collection').paidCount + 1)
  })
})

describe('le 4e offert, au choix (cadeau)', () => {
  it('propose chaque coloris et le collector — rien d’autre', () => {
    expect(GIFT_CHOICE_IDS).toEqual([...PRODUCT.colorways.map((c) => c.id), PRODUCT.collector.id])
    expect(giftLabel(PRODUCT.collector.id)).toBe(PRODUCT.collector.label)
    expect(giftLabel(PRODUCT.colorways[0].id)).toBe(PRODUCT.colorways[0].label)
    expect(giftLabel('coloris-inconnu')).toBeNull()
  })

  it('le collector est toujours offrable, un coloris suit sa disponibilité', () => {
    expect(giftOrderableError(PRODUCT.collector.id)).toBeNull()
    expect(giftOrderableError(PRODUCT.colorways[0].id)).toBeNull()
    expect(giftOrderableError('coloris-inconnu')).toMatch(/existe pas/i)
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
    {
      id: 'ok',
      label: 'Dispo',
      shortLabel: 'Dispo',
      available: true,
      image: '/produit/test.webp',
      photoSlug: 'test',
    },
    {
      id: 'epuise',
      label: 'Épuisé',
      shortLabel: 'Épuisé',
      available: false,
      image: '/produit/test.webp',
      photoSlug: 'test',
    },
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
    expect(formatEuros(totalCents('collection'))).toContain('65,97')
  })

  it('écrit les dimensions avec la virgule décimale française', () => {
    expect(formatLength()).toBe('6,5 cm')
    expect(formatWeight()).toBe('6,5 g')
    expect(formatSpecs()).toBe('6,5 cm · 6,5 g')
  })
})
