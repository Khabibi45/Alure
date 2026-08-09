// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OFFER_IDS, PRODUCT, totalCents, checkoutLines, getOffer } from './product'

/**
 * Le SDK Stripe est mocké : ces tests vérifient CE QU'ON LUI ENVOIE, pas son
 * comportement. C'est le dernier point avant que l'argent soit demandé au client.
 */
const create = vi.fn()
vi.mock('stripe', () => {
  class MockStripe {
    checkout = { sessions: { create: (...args: unknown[]) => create(...args) } }
    static errors = { StripeSignatureVerificationError: class extends Error {} }
  }
  return { default: MockStripe }
})

import { createCheckoutSession } from './stripe'

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

  it('facture la collection en une ligne, plus le collector à 0,00 €', async () => {
    await createCheckoutSession({ coloris, offre: 'collection' })
    const items = lastLineItems()
    expect(items).toHaveLength(2)
    expect(items[0].price_data.unit_amount).toBe(getOffer('collection').amountCents)
    expect(items[1].price_data.unit_amount).toBe(0)
    expect(items[1].price_data.product_data.name).toMatch(/offert/i)
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

  it('ne livre qu’en France et transmet l’offre au webhook', async () => {
    await createCheckoutSession({ coloris, offre: 'collection' })
    const session = create.mock.calls[0][0]
    expect(session.shipping_address_collection.allowed_countries).toEqual(['FR'])
    expect(session.metadata).toMatchObject({ coloris, offre: 'collection' })
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
