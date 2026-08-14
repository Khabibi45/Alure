// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PRODUCT } from '@/lib/shop/product'

// Stripe est mocké : ces tests vérifient la ROUTE (gardes + contrats de réponse),
// pas l'API Stripe. Le comportement du mock se pilote test par test.
const createCheckoutSession = vi.fn()
vi.mock('@/lib/shop/stripe', () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
}))

import { POST } from './route'

// L'offre groupée exige le choix du 4e offert (cadeau) — ici le collector.
const valid = { coloris: PRODUCT.colorways[0].id, offre: 'collection', cadeau: PRODUCT.collector.id }
let ipCounter = 0

function makeReq(body: unknown, ip?: string) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  return new NextRequest('http://localhost/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip ?? `10.0.0.${++ipCounter}`,
    },
    body: raw,
  })
}

beforeEach(() => {
  createCheckoutSession.mockReset()
  createCheckoutSession.mockResolvedValue('https://checkout.stripe.com/c/pay/test_123')
})

describe('POST /api/checkout', () => {
  it('crée une session et retourne son URL pour une commande valide', async () => {
    const res = await POST(makeReq(valid))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//)
    expect(createCheckoutSession).toHaveBeenCalledWith(valid, expect.any(String))
  })

  it('rejette une offre inconnue (400) avec le détail par champ, sans appeler Stripe', async () => {
    const res = await POST(makeReq({ ...valid, offre: 'duo' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.issues.offre).toBeTruthy()
    expect(createCheckoutSession).not.toHaveBeenCalled()
  })

  it('rejette un coloris inconnu (400) sans appeler Stripe', async () => {
    const res = await POST(makeReq({ ...valid, coloris: 'coloris-pirate' }))
    expect(res.status).toBe(400)
    expect(createCheckoutSession).not.toHaveBeenCalled()
  })

  it('rejette un JSON malformé (400)', async () => {
    const res = await POST(makeReq('{ pas du json'))
    expect(res.status).toBe(400)
  })

  it('rejette un payload trop volumineux (413)', async () => {
    const res = await POST(makeReq({ ...valid, padding: 'A'.repeat(2000) }))
    expect(res.status).toBe(413)
  })

  it('répond 503 si le paiement n’est pas configuré (échec bruyant, message actionnable)', async () => {
    const { PaymentNotConfiguredError } = await import('@/lib/shop/errors')
    createCheckoutSession.mockRejectedValueOnce(new PaymentNotConfiguredError())
    const res = await POST(makeReq(valid))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('répond 500 (jamais un faux succès) si Stripe échoue', async () => {
    createCheckoutSession.mockRejectedValueOnce(new Error('stripe down'))
    const res = await POST(makeReq(valid))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.url).toBeUndefined()
    expect(body.error).toBeTruthy()
  })

  it('applique un rate-limit par IP (429 au-delà de 10/min)', async () => {
    const ip = '9.9.9.9'
    const codes: number[] = []
    for (let i = 0; i < 12; i++) {
      const res = await POST(makeReq(valid, ip))
      codes.push(res.status)
    }
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0)
  })
})
