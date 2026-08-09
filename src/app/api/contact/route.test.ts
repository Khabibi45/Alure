// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

const valid = {
  email: 'jean@exemple.fr',
  message: 'Bonjour, où en est ma commande ?',
  orderNumber: 'cs_test_123',
}

function makeReq(body: unknown, ip: string) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: raw,
  })
}

describe('POST /api/contact', () => {
  // deliver() EST branché (Resend, dans la route). Le 503 testé ici est le
  // comportement VOULU quand RESEND_API_KEY / ORDER_NOTIFICATIONS_EMAIL sont
  // absentes de l'environnement de test : échec bruyant plutôt qu'un faux
  // succès qui perdrait des demandes réelles en silence.
  it('répond 503 tant que la livraison n’est pas configurée (échec bruyant)', async () => {
    const res = await POST(makeReq(valid, '1.1.1.1'))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('rejette un payload invalide (400) avec le détail par champ', async () => {
    const res = await POST(makeReq({ ...valid, email: 'pas-un-email' }, '1.1.1.2'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.issues.email).toBeTruthy()
  })

  it('traite le honeypot comme un succès sans rien livrer (200)', async () => {
    const res = await POST(makeReq({ ...valid, website: 'http://spam.example' }, '1.1.1.3'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('rejette un JSON malformé (400)', async () => {
    const res = await POST(makeReq('{ pas du json', '1.1.1.4'))
    expect(res.status).toBe(400)
  })

  it('rejette un numéro de commande à saut de ligne — il part dans le SUJET de l’email (400)', async () => {
    const res = await POST(makeReq({ ...valid, orderNumber: 'cs_123\r\nBcc: spam@evil.tld' }, '1.1.1.6'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.issues.orderNumber).toBeTruthy()
  })

  it('rejette un payload trop volumineux (413)', async () => {
    const res = await POST(makeReq({ ...valid, message: 'A'.repeat(21000) }, '1.1.1.5'))
    expect(res.status).toBe(413)
  })

  it('applique un rate-limit par IP (429 au-delà de 5/min)', async () => {
    const ip = '9.9.9.9'
    const codes: number[] = []
    for (let i = 0; i < 7; i++) {
      const res = await POST(makeReq({ ...valid, email: 'bad' }, ip))
      codes.push(res.status)
    }
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0)
  })
})
