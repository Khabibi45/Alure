// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { checkoutSchema } from './checkout-schema'
import {
  PACKS,
  PACK_IDS,
  PRODUCT,
  SHIPPING,
  checkoutLines,
  formatEuros,
  formatLength,
  formatSpecs,
  formatWeight,
  getPack,
  orderableError,
  perUnitAtMostCents,
  perUnitCents,
  totalCents,
} from './product'

describe('checkoutSchema (partagé client/serveur)', () => {
  it('accepte une commande valide', () => {
    expect(checkoutSchema.safeParse({ pack: 'leurres' }).success).toBe(true)
    expect(checkoutSchema.safeParse({ pack: 'goujons', langue: 'en' }).success).toBe(true)
  })

  it('rejette une commande sans pack', () => {
    expect(checkoutSchema.safeParse({}).success).toBe(false)
  })

  it('rejette un pack hors liste', () => {
    expect(checkoutSchema.safeParse({ pack: 'leurre-unique' }).success).toBe(false)
  })

  it('n’accepte plus ni coloris, ni offre, ni cadeau — ils ont quitté le domaine', () => {
    // Ces trois champs commandaient l'ancienne offre « 3 achetés, le 4e offert ».
    // Le schéma les IGNORE plutôt que de les refuser : un onglet resté ouvert
    // avant la bascule doit pouvoir payer, pas échouer au dernier écran.
    const parsed = checkoutSchema.safeParse({
      pack: 'leurres',
      coloris: 'coloris-1',
      offre: 'collection',
      cadeau: 'pirate',
    })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data).toEqual({ pack: 'leurres' })
  })

  it('n’accepte pas de quantité — le champ n’existe pas', () => {
    const parsed = checkoutSchema.safeParse({ pack: 'leurres', quantite: 99 })
    expect(parsed.success && 'quantite' in parsed.data).toBe(false)
  })
})

describe('les deux packs — montants exacts', () => {
  it('le pack de leurres contient une unité de chaque coloris', () => {
    expect(PACKS.leurres.unitCount).toBe(PRODUCT.colorways.length)
  })

  it('annonce les prix décidés : 10,99 € le pack de leurres, 5,99 € celui de goujons', () => {
    expect(PACKS.leurres.amountCents).toBe(1099)
    expect(PACKS.goujons.amountCents).toBe(599)
  })

  it('ne manipule que des entiers de centimes', () => {
    for (const id of PACK_IDS) {
      expect(Number.isInteger(getPack(id).amountCents)).toBe(true)
    }
    expect(Number.isInteger(SHIPPING.amountCents)).toBe(true)
  })
})

describe('la livraison — le tarif postal relevé, pas choisi', () => {
  it('vaut 3,60 € : la tranche « jusqu’à 100 g » de la Lettre Verte suivie', () => {
    expect(SHIPPING.amountCents).toBe(360)
    expect(SHIPPING.maxWeightGrams).toBe(100)
  })

  it('couvre le poids réel d’un pack, et même de deux', () => {
    // Le pack de leurres pèse 4 × 6,5 g. L'enveloppe matelassée et la carte
    // ajoutent une trentaine de grammes ; deux packs restent sous la tranche.
    const packGrams = PACKS.leurres.unitCount * PRODUCT.specs.weightGrams
    const emballageGrams = 30
    expect(2 * packGrams + emballageGrams).toBeLessThan(SHIPPING.maxWeightGrams)
  })

  it('n’est PAS incluse dans le prix du pack — c’est tout le changement', () => {
    for (const id of PACK_IDS) {
      expect(totalCents(id)).toBe(getPack(id).amountCents + SHIPPING.amountCents)
      expect(totalCents(id)).toBeGreaterThan(getPack(id).amountCents)
    }
  })
})

describe('perUnitCents — le chiffre qui fait décider, et jamais un chiffre faux', () => {
  it('refuse de répondre quand la division n’est pas exacte', () => {
    // 10,99 € pour 4 leurres font 2,7475 € pièce : un montant qui n'existe pas
    // en centimes. On ne l'arrondit pas, on se tait.
    expect(perUnitCents('leurres')).toBeNull()
  })

  it('annonce alors « moins de 2,80 € », qui est vrai et se vérifie', () => {
    const borne = perUnitAtMostCents('leurres')
    expect(borne).toBe(280)
    expect(borne * PACKS.leurres.unitCount).toBeGreaterThanOrEqual(PACKS.leurres.amountCents)
  })

  it('répond quand la division tombe juste', () => {
    // 5,99 € pour 5 goujons ne tombent pas juste non plus — la borne, elle,
    // reste vraie. Le test vaut pour la RÈGLE, pas pour un cas particulier.
    const exact = perUnitCents('goujons')
    if (exact !== null) {
      expect(exact * PACKS.goujons.unitCount).toBe(PACKS.goujons.amountCents)
    } else {
      expect(perUnitAtMostCents('goujons') * PACKS.goujons.unitCount).toBeGreaterThanOrEqual(
        PACKS.goujons.amountCents
      )
    }
  })
})

describe('checkoutLines — ce qu’on encaisse est ce qu’on affiche', () => {
  it.each(PACK_IDS)('le pack %s tient en UNE ligne, au prix du pack', (id) => {
    const lines = checkoutLines(id)
    expect(lines).toHaveLength(1)
    expect(lines[0].quantity).toBe(1)
    expect(lines[0].unitAmountCents).toBe(getPack(id).amountCents)
    expect(lines[0].name).toBe(getPack(id).name)
  })

  it.each(PACK_IDS)('la somme des lignes PLUS la livraison vaut exactement le total — %s', (id) => {
    // C'EST L'INVARIANT QUI COMPTE : il interdit l'écart entre le montant
    // affiché sur la page et le montant encaissé par Stripe.
    const lignes = checkoutLines(id).reduce((somme, l) => somme + l.quantity * l.unitAmountCents, 0)
    expect(lignes + SHIPPING.amountCents).toBe(totalCents(id))
  })

  it('lève sur un pack inconnu plutôt que de facturer au hasard', () => {
    expect(() => checkoutLines('pack-fantome')).toThrow()
    expect(() => totalCents('pack-fantome')).toThrow()
  })
})

describe('orderableError — disponibilité réelle', () => {
  it('null pour un pack existant et complet', () => {
    expect(orderableError('leurres')).toBeNull()
    expect(orderableError('goujons')).toBeNull()
  })

  it('message pour un pack inconnu', () => {
    expect(orderableError('pack-fantome')).toBeTruthy()
  })

  it('tous les coloris du catalogue réel sont dans un état cohérent', () => {
    for (const c of PRODUCT.colorways) {
      expect(typeof c.available).toBe('boolean')
      expect(c.label.length).toBeGreaterThan(0)
      // WCAG 2.5.3 « Label in Name » : le texte visible doit être contenu dans
      // le nom accessible, sinon la commande vocale n'atteint pas la cible.
      expect(c.label.startsWith(c.shortLabel)).toBe(true)
    }
  })

  it('le catalogue compte les quatre coloris, noir compris', () => {
    expect(PRODUCT.colorways.map((c) => c.label)).toEqual(['Bleu', 'Rouge', 'Vert', 'Noir'])
  })
})

describe('formatage', () => {
  it('formate les montants sans décimale parasite', () => {
    expect(formatEuros(PACKS.leurres.amountCents)).toContain('10,99')
    expect(formatEuros(SHIPPING.amountCents)).toContain('3,60')
  })

  it('écrit les dimensions avec la virgule décimale française', () => {
    expect(formatLength()).toBe('6,5 cm')
    expect(formatWeight()).toBe('6,5 g')
    expect(formatSpecs()).toBe('6,5 cm · 6,5 g')
  })

  it('ponctue à l’anglaise sur la page anglaise', () => {
    expect(formatEuros(PACKS.leurres.amountCents, 'en')).toContain('10.99')
  })
})
