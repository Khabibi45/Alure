// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PACKS, PACK_IDS, PRODUCT, SHIPPING, totalCents, checkoutLines } from './product'

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

/** Le montant du tarif d'expédition posé sur la dernière session créée. */
function lastShippingCents(): number {
  const session = create.mock.calls[create.mock.calls.length - 1][0]
  return session.shipping_options[0].shipping_rate_data.fixed_amount.amount as number
}

beforeEach(() => {
  create.mockReset()
  create.mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' })
  process.env.STRIPE_SECRET_KEY = 'sk_test_pour_les_tests'
})

describe('createCheckoutSession — le montant demandé au client', () => {
  it.each(PACK_IDS)(
    'la somme des lignes PLUS la livraison vaut totalCents — pack %s',
    async (pack) => {
      await createCheckoutSession({ pack })
      const lignes = lastLineItems().reduce(
        (somme, item) => somme + item.quantity * item.price_data.unit_amount,
        0
      )
      // L'INVARIANT : ce que Stripe encaisse est ce que la page affiche.
      expect(lignes + lastShippingCents()).toBe(totalCents(pack))
    }
  )

  it('facture le pack en UNE ligne, à son prix', async () => {
    await createCheckoutSession({ pack: 'leurres' })
    const items = lastLineItems()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1)
    expect(items[0].price_data.unit_amount).toBe(PACKS.leurres.amountCents)
    expect(items[0].price_data.product_data.name).toBe(PACKS.leurres.name)
  })

  it('passe la livraison en FRAIS DE PORT, jamais en article', async () => {
    // C'est ce qui fait voir au client « pack + livraison » au lieu d'un total
    // opaque — et ce qui évite qu'un frais de port soit remboursé comme un
    // produit en cas de rétractation partielle.
    await createCheckoutSession({ pack: 'leurres' })
    expect(lastShippingCents()).toBe(SHIPPING.amountCents)
    expect(lastLineItems().some((i) => i.price_data.unit_amount === SHIPPING.amountCents)).toBe(
      false
    )
  })

  it('reste aligné sur checkoutLines — une seule source de barème', async () => {
    await createCheckoutSession({ pack: 'goujons' })
    const expected = checkoutLines('goujons').map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unit_amount: l.unitAmountCents,
    }))
    expect(
      lastLineItems().map((i) => ({
        name: i.price_data.product_data.name,
        quantity: i.quantity,
        unit_amount: i.price_data.unit_amount,
      }))
    ).toEqual(expected)
  })

  it('facture en euros', async () => {
    await createCheckoutSession({ pack: 'leurres' })
    expect(lastLineItems()[0].price_data.currency).toBe(PRODUCT.currency)
  })

  it('ne livre qu’en France et transmet le pack au webhook', async () => {
    await createCheckoutSession({ pack: 'goujons' })
    const session = create.mock.calls[0][0]
    expect(session.shipping_address_collection.allowed_countries).toEqual(['FR'])
    expect(session.metadata).toEqual({ pack: 'goujons' })
  })

  it('refuse un pack inconnu AVANT d’appeler Stripe', async () => {
    await expect(createCheckoutSession({ pack: 'duo' })).rejects.toThrow(/inconnu/i)
    expect(create).not.toHaveBeenCalled()
  })

  it('échoue bruyamment si Stripe renvoie une session sans URL', async () => {
    create.mockResolvedValueOnce({ id: 'cs_test_2', url: null })
    await expect(createCheckoutSession({ pack: 'leurres' })).rejects.toThrow(/sans URL/i)
  })
})

describe('createCheckoutSession — les URLs de retour', () => {
  it('bâtit le retour sur le domaine canonique, jamais sur l’en-tête Host', async () => {
    await createCheckoutSession({ pack: 'leurres' }, 'https://attaquant.example')
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
