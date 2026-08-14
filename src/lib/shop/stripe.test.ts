// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OFFER_IDS, PRODUCT, totalCents, checkoutLines, getOffer } from './product'

/**
 * Le SDK Stripe est mocké : ces tests vérifient CE QU'ON LUI ENVOIE, pas son
 * comportement. C'est le dernier point avant que l'argent soit demandé au client.
 */
const create = vi.fn()
const list = vi.fn()
vi.mock('stripe', () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: (...args: unknown[]) => create(...args),
        list: (...args: unknown[]) => list(...args),
      },
    }
    static errors = { StripeSignatureVerificationError: class extends Error {} }
  }
  return { default: MockStripe }
})

import { countPaidOrders, createCheckoutSession } from './stripe'

type LineItem = {
  quantity: number
  price_data: { currency: string; unit_amount: number; product_data: { name: string } }
}

function lastLineItems(): LineItem[] {
  return create.mock.calls[create.mock.calls.length - 1][0].line_items as LineItem[]
}

const coloris = PRODUCT.colorways[0].id

beforeEach(() => {
  create.mockReset()
  create.mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' })
  process.env.STRIPE_SECRET_KEY = 'sk_test_pour_les_tests'
})

describe('createCheckoutSession — le montant demandé au client', () => {
  it.each(OFFER_IDS)('la somme des lignes envoyées à Stripe vaut totalCents pour %s', async (offre) => {
    await createCheckoutSession({ coloris, offre })
    const sum = lastLineItems().reduce((acc, l) => acc + l.price_data.unit_amount * l.quantity, 0)
    expect(sum).toBe(totalCents(offre))
  })

  it('n’envoie qu’une ligne pour un leurre seul', async () => {
    await createCheckoutSession({ coloris, offre: 'solo' })
    const items = lastLineItems()
    expect(items).toHaveLength(1)
    expect(items[0].price_data.unit_amount).toBe(PRODUCT.pricing.soloCents)
  })

  it('facture « 3 achetés, le 4e offert » : 3 × l’unité, puis le cadeau à 0,00 €', async () => {
    await createCheckoutSession({ coloris, offre: 'collection', cadeau: PRODUCT.collector.id })
    const items = lastLineItems()
    expect(items).toHaveLength(2)
    expect(items[0].quantity).toBe(getOffer('collection').paidCount)
    expect(items[0].price_data.unit_amount).toBe(PRODUCT.pricing.soloCents)
    expect(items[1].price_data.unit_amount).toBe(0)
    expect(items[1].price_data.product_data.name).toMatch(/offert/i)
    // Le choix de l'acheteur se lit sur le reçu — jamais un cadeau anonyme.
    expect(items[1].price_data.product_data.name).toContain(PRODUCT.collector.label)
  })

  it('reste aligné sur checkoutLines — une seule source de barème', async () => {
    const colorway = PRODUCT.colorways[1]
    await createCheckoutSession({ coloris: colorway.id, offre: 'collection' })
    const sent = lastLineItems().map((l) => ({ q: l.quantity, cents: l.price_data.unit_amount }))
    const expected = checkoutLines('collection', colorway.label).map((l) => ({
      q: l.quantity,
      cents: l.unitAmountCents,
    }))
    expect(sent).toEqual(expected)
  })

  it('facture en euros et nomme le coloris commandé sur l’offre solo', async () => {
    const colorway = PRODUCT.colorways[1]
    await createCheckoutSession({ coloris: colorway.id, offre: 'solo' })
    for (const item of lastLineItems()) {
      expect(item.price_data.currency).toBe('eur')
    }
    expect(lastLineItems()[0].price_data.product_data.name).toContain(colorway.label)
  })

  it('ne livre qu’en France et transmet l’offre ET le cadeau au webhook', async () => {
    await createCheckoutSession({ coloris, offre: 'collection', cadeau: PRODUCT.collector.id })
    const session = create.mock.calls[0][0]
    expect(session.shipping_address_collection.allowed_countries).toEqual(['FR'])
    expect(session.metadata).toMatchObject({
      coloris,
      offre: 'collection',
      cadeau: PRODUCT.collector.id,
    })
    expect(session.mode).toBe('payment')
  })

  it('refuse une offre inconnue AVANT d’appeler Stripe', async () => {
    await expect(createCheckoutSession({ coloris, offre: 'duo' })).rejects.toThrow(/inconnue/i)
    expect(create).not.toHaveBeenCalled()
  })

  it('échoue bruyamment si Stripe renvoie une session sans URL', async () => {
    create.mockResolvedValueOnce({ id: 'cs_test_2', url: null })
    await expect(createCheckoutSession({ coloris, offre: 'solo' })).rejects.toThrow(/sans URL/i)
  })
})

describe('createCheckoutSession — les URLs de retour', () => {
  it('bâtit le retour sur le domaine canonique, jamais sur l’en-tête Host', async () => {
    await createCheckoutSession({ coloris, offre: 'solo' }, 'https://attaquant.example')
    const session = create.mock.calls[0][0]
    expect(session.success_url).not.toContain('attaquant.example')
    expect(session.cancel_url).not.toContain('attaquant.example')
    expect(session.success_url).toContain('/merci')
    expect(session.cancel_url).toContain('/leurre')
  })
})

/** Le SDK expose la pagination en itérable asynchrone : on la simule telle quelle. */
function asAsyncIterable(sessions: { payment_status: string }[]) {
  return {
    async *[Symbol.asyncIterator]() {
      yield* sessions
    },
  }
}

describe('countPaidOrders — le chiffre vrai du bandeau', () => {
  it('ne compte que les sessions payées (un tunnel terminé non payé ne compte pas)', async () => {
    list.mockReturnValueOnce(
      asAsyncIterable([
        { payment_status: 'paid' },
        { payment_status: 'unpaid' },
        { payment_status: 'paid' },
        { payment_status: 'no_payment_required' },
      ])
    )
    await expect(countPaidOrders()).resolves.toBe(3)
    // Seules les sessions TERMINÉES sont demandées à Stripe.
    expect(list.mock.calls[0][0]).toMatchObject({ status: 'complete' })
  })

  it('zéro session → zéro, pas une valeur par défaut', async () => {
    list.mockReturnValueOnce(asAsyncIterable([]))
    await expect(countPaidOrders()).resolves.toBe(0)
  })

  it('échoue bruyamment si Stripe échoue — jamais un chiffre inventé', async () => {
    list.mockImplementationOnce(() => {
      throw new Error('Stripe indisponible')
    })
    await expect(countPaidOrders()).rejects.toThrow(/indisponible/i)
  })
})
