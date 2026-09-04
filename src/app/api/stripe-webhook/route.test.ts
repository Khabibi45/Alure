// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { totalCents } from '@/lib/shop/product'

// Stripe (vérification de signature, marqueur d'idempotence) et Resend (envoi)
// sont mockés : ces tests vérifient le CONTRAT de la route — signature,
// idempotence à deux étages, échec bruyant.
const verifyWebhookEvent = vi.fn()
const hasFulfillmentMarker = vi.fn()
const setFulfillmentMarker = vi.fn()
vi.mock('@/lib/shop/stripe', () => ({
  verifyWebhookEvent: (...args: unknown[]) => verifyWebhookEvent(...args),
  hasFulfillmentMarker: (...args: unknown[]) => hasFulfillmentMarker(...args),
  setFulfillmentMarker: (...args: unknown[]) => setFulfillmentMarker(...args),
  // Même logique que l'implémentation réelle : string, objet expansé, ou null.
  paymentIntentIdOf: (session: { payment_intent?: unknown }) =>
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : ((session.payment_intent as { id?: string } | null | undefined)?.id ?? null),
}))
const sendOrderEmails = vi.fn()
vi.mock('@/lib/shop/emails', () => ({
  sendOrderEmails: (...args: unknown[]) => sendOrderEmails(...args),
}))
// La revalidation du compteur (bandeau d'objectif) est mockée : `revalidateTag`
// n'existe pas hors du runtime Next, et on veut asserter QUAND elle part.
const revalidateOrdersCount = vi.fn()
vi.mock('@/lib/shop/orders-count', () => ({
  revalidateOrdersCount: (...args: unknown[]) => revalidateOrdersCount(...args),
}))

import { POST } from './route'
import { WebhookSignatureError } from '@/lib/shop/errors'

let eventCounter = 0

function completedEvent(overrides: Record<string, unknown> = {}, eventId?: string) {
  return {
    id: eventId ?? `evt_${++eventCounter}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_intent: 'pi_test_1',
        // « Terminé » ≠ « payé » : le défaut du fixture est un paiement immédiat
        // abouti, les cas différés se testent en surchargeant ce champ.
        payment_status: 'paid',
        customer_details: { email: 'client@exemple.fr' },
        metadata: { pack: 'leurres' },
        amount_total: totalCents('leurres'),
        ...overrides,
      },
    },
  }
}

function makeReq(withSignature = true) {
  return new NextRequest('http://localhost/api/stripe-webhook', {
    method: 'POST',
    headers: withSignature ? { 'stripe-signature': 't=1,v1=abc' } : {},
    body: '{"raw":"body"}',
  })
}

beforeEach(() => {
  verifyWebhookEvent.mockReset()
  sendOrderEmails.mockReset()
  sendOrderEmails.mockResolvedValue(undefined)
  hasFulfillmentMarker.mockReset()
  hasFulfillmentMarker.mockResolvedValue(false)
  setFulfillmentMarker.mockReset()
  setFulfillmentMarker.mockResolvedValue(undefined)
  revalidateOrdersCount.mockReset()
})

describe('POST /api/stripe-webhook', () => {
  it('envoie les emails pour une commande payée (signature valide)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
    expect(sendOrderEmails).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: 'client@exemple.fr',
        // Le résumé nomme le pack et son contenu — c'est ce que lit le client.
        packLabel: expect.stringMatching(/pack de leurres/i),
        totalCents: totalCents('leurres'),
      })
    )
  })

  it('invalide le compteur du bandeau APRÈS une commande payée traitée', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    await POST(makeReq())
    expect(revalidateOrdersCount).toHaveBeenCalledTimes(1)
  })

  it('rejette une signature invalide (400) sans envoyer d’email ni toucher au compteur', async () => {
    verifyWebhookEvent.mockImplementation(() => {
      throw new WebhookSignatureError()
    })
    const res = await POST(makeReq())
    expect(res.status).toBe(400)
    expect(sendOrderEmails).not.toHaveBeenCalled()
    expect(revalidateOrdersCount).not.toHaveBeenCalled()
  })

  it('rejette une requête sans en-tête de signature (400)', async () => {
    const res = await POST(makeReq(false))
    expect(res.status).toBe(400)
    expect(verifyWebhookEvent).not.toHaveBeenCalled()
  })

  it('ignore proprement les autres types d’événements (200, zéro email)', async () => {
    verifyWebhookEvent.mockReturnValue({ ...completedEvent(), type: 'payment_intent.created' })
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  it('est idempotent : le même événement livré deux fois → un seul envoi', async () => {
    const event = completedEvent({}, 'evt_dup')
    verifyWebhookEvent.mockReturnValue(event)
    const first = await POST(makeReq())
    const second = await POST(makeReq())
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
  })

  it('répond 500 si l’envoi échoue (Stripe re-livrera) — jamais un faux succès', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    sendOrderEmails.mockRejectedValueOnce(new Error('resend down'))
    const res = await POST(makeReq())
    expect(res.status).toBe(500)
  })

  it('un échec d’envoi ne marque PAS l’événement comme traité (le retry ré-envoie)', async () => {
    const event = completedEvent({}, 'evt_retry')
    verifyWebhookEvent.mockReturnValue(event)
    sendOrderEmails.mockRejectedValueOnce(new Error('resend down'))
    await POST(makeReq())
    const retry = await POST(makeReq())
    expect(retry.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(2)
  })

  it('répond 200 sur une session sans email client (re-livrer ne répare rien)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent({ customer_details: { email: null } }))
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  // « Terminé » n'est pas « payé » : un moyen à notification différée livre
  // `completed` avec payment_status 'unpaid'. Envoyer l'email ici annoncerait
  // « Total payé » sur un paiement qui peut encore échouer.
  it('n’envoie AUCUN email sur une session terminée mais non payée (paiement différé)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent({ payment_status: 'unpaid' }))
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ pending: true })
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  it('envoie les emails quand le paiement différé aboutit (async_payment_succeeded)', async () => {
    verifyWebhookEvent.mockReturnValue({
      ...completedEvent(),
      type: 'checkout.session.async_payment_succeeded',
    })
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
  })

  it('accepte no_payment_required (test officiel : traiter dès que ≠ unpaid)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent({ payment_status: 'no_payment_required' }))
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
  })

  it('accuse réception d’un paiement différé échoué sans envoyer d’email', async () => {
    verifyWebhookEvent.mockReturnValue({
      ...completedEvent(),
      type: 'checkout.session.async_payment_failed',
    })
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  // ── L'étage DURABLE de l'idempotence : le marqueur chez Stripe ─────────────
  // Le Set en mémoire ne couvre qu'une instance serverless ; ces tests couvrent
  // la re-livraison qui atterrit ailleurs.

  it('marqueur déjà posé chez Stripe → 200 duplicate, ZÉRO email (autre instance déjà passée)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    hasFulfillmentMarker.mockResolvedValue(true)
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ duplicate: true })
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  it('marqueur illisible (API Stripe en panne) → 500 et ZÉRO email — jamais un doublon deviné', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    hasFulfillmentMarker.mockRejectedValue(new Error('stripe api down'))
    const res = await POST(makeReq())
    expect(res.status).toBe(500)
    expect(sendOrderEmails).not.toHaveBeenCalled()
  })

  it('pose le marqueur APRÈS l’envoi, avec l’ID de l’événement déclencheur', async () => {
    const event = completedEvent({}, 'evt_marque')
    verifyWebhookEvent.mockReturnValue(event)
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
    expect(setFulfillmentMarker).toHaveBeenCalledWith('pi_test_1', 'evt_marque')
  })

  it('un échec d’ENVOI ne pose pas le marqueur (le retry doit ré-envoyer)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    sendOrderEmails.mockRejectedValueOnce(new Error('resend down'))
    const res = await POST(makeReq())
    expect(res.status).toBe(500)
    expect(setFulfillmentMarker).not.toHaveBeenCalled()
  })

  it('un échec de MARQUAGE après envoi répond quand même 200 (les emails sont partis)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent())
    setFulfillmentMarker.mockRejectedValue(new Error('stripe api down'))
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
  })

  it('session sans PaymentIntent : l’email part quand même (idempotence locale seulement)', async () => {
    verifyWebhookEvent.mockReturnValue(completedEvent({ payment_intent: null }))
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(sendOrderEmails).toHaveBeenCalledTimes(1)
    expect(hasFulfillmentMarker).not.toHaveBeenCalled()
    expect(setFulfillmentMarker).not.toHaveBeenCalled()
  })

  it('rejette un corps au-delà du plafond (413) sans vérifier la signature', async () => {
    const req = new NextRequest('http://localhost/api/stripe-webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=abc' },
      // Au-delà de WEBHOOK_MAX_BYTES (128 000) — un vrai event Checkout fait quelques Ko.
      body: 'x'.repeat(130_000),
    })
    const res = await POST(req)
    expect(res.status).toBe(413)
    expect(verifyWebhookEvent).not.toHaveBeenCalled()
  })
})
