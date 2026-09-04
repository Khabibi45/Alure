// @vitest-environment node
/**
 * CAMPAGNE DE RECETTE — le parcours d'achat en conditions réelles.
 *
 * Ce fichier envoie de VRAIS emails via Resend et parle à la VRAIE API Stripe.
 * Il ne fait donc PAS partie du filet de régression : `npm run test` le saute.
 * On le lance à la main, quand on veut vérifier la chaîne complète :
 *
 *     CAMPAGNE_REELLE=1 npx vitest run src/test/campagne-paiement.test.ts
 *
 * Ce qui est réel ici : la signature Stripe (HMAC local, aucune API), les
 * gabarits d'emails, les envois Resend, la validation zod, le rate-limit.
 * Seul `revalidateOrdersCount` est simulé : `revalidateTag` n'existe pas hors
 * du runtime Next et n'a rien à voir avec le paiement.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { NextRequest } from 'next/server'

/**
 * Le garde-fou. Sans lui, chaque `npm run test` enverrait une dizaine d'emails
 * réels et brûlerait le quota Resend : un test qui a des effets de bord dans le
 * monde ne doit jamais partir tout seul.
 */
const ACTIVE = process.env.CAMPAGNE_REELLE === '1'
const campagne = describe.skipIf(!ACTIVE)

// ── Environnement réel (vitest ne lit pas .env.local tout seul) ──────────────
beforeAll(() => {
  if (!ACTIVE) return
  const raw = fs.readFileSync('.env.local', 'utf8')
  for (const line of raw.split('\n')) {
    if (!line.includes('=') || line.trimStart().startsWith('#')) continue
    const i = line.indexOf('=')
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim()
    if (value) process.env[key] = value
  }
})

const revalidateOrdersCount = vi.fn()
vi.mock('@/lib/shop/orders-count', () => ({
  revalidateOrdersCount: () => revalidateOrdersCount(),
  ORDERS_COUNT_TAG: 'orders-count',
}))

import {
  PACKS,
  PACK_IDS,
  PRODUCT,
  SHIPPING,
  checkoutLines,
  formatEuros,
  packSummary,
  totalCents,
} from '@/lib/shop/product'
import {
  confirmationSubject,
  confirmationText,
  confirmationHtml,
  notificationText,
} from '@/lib/shop/emails'
import { verifyWebhookEvent } from '@/lib/shop/stripe'
import { POST as webhookPOST } from '@/app/api/stripe-webhook/route'
import { POST as checkoutPOST } from '@/app/api/checkout/route'

/** Signature Stripe officielle : `t=<ts>,v1=<hmac_sha256(ts.payload)>`. */
function signStripe(payload: string, secret: string, ts = Math.floor(Date.now() / 1000)): string {
  const sig = crypto.createHmac('sha256', secret).update(`${ts}.${payload}`, 'utf8').digest('hex')
  return `t=${ts},v1=${sig}`
}

let evtSeq = 0
type SessionOverrides = {
  offre?: string
  cadeau?: string
  coloris?: string
  paymentStatus?: string
  email?: string | null
  amountTotal?: number | null
  paymentIntent?: string | null
  type?: string
  eventId?: string
  sessionId?: string
}

function buildEvent(o: SessionOverrides = {}) {
  const offre = o.offre ?? 'solo'
  return {
    id: o.eventId ?? `evt_campagne_${++evtSeq}`,
    object: 'event',
    api_version: '2025-01-27.acacia',
    created: Math.floor(Date.now() / 1000),
    type: o.type ?? 'checkout.session.completed',
    livemode: false,
    data: {
      object: {
        id: o.sessionId ?? `cs_test_campagne_${evtSeq}`,
        object: 'checkout.session',
        amount_total: o.amountTotal === null ? null : (o.amountTotal ?? totalCents(offre)),
        currency: 'eur',
        mode: 'payment',
        status: 'complete',
        payment_status: o.paymentStatus ?? 'paid',
        // null : place le test sur le chemin « pas de marqueur durable », le
        // seul qui n'appelle pas l'API Stripe.
        payment_intent: o.paymentIntent ?? null,
        customer_details:
          o.email === null
            ? { email: null }
            : { email: o.email ?? 'delivered@resend.dev', name: 'Client Campagne' },
        metadata: {
          coloris: o.coloris ?? PRODUCT.colorways[0].id,
          offre,
          ...(o.cadeau ? { cadeau: o.cadeau } : {}),
        },
      },
    },
  }
}

async function callWebhook(event: unknown, opts: { signature?: string | null } = {}) {
  const payload = JSON.stringify(event)
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.signature !== null) {
    headers['stripe-signature'] = opts.signature ?? signStripe(payload, secret)
  }
  const req = new NextRequest('http://localhost:3000/api/stripe-webhook', {
    method: 'POST',
    headers,
    body: payload,
  })
  const res = await webhookPOST(req)
  return { status: res.status, body: await res.json() }
}

let ipSeq = 0
async function callCheckout(body: unknown, opts: { raw?: string; ip?: string } = {}) {
  const payload = opts.raw ?? JSON.stringify(body)
  const req = new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': opts.ip ?? `10.1.0.${++ipSeq}`,
    },
    body: payload,
  })
  const res = await checkoutPOST(req)
  return { status: res.status, body: await res.json() }
}

/* ══════════════════════════════════════════════════════════════════════════ */

campagne('1 · Le catalogue réellement vendable', () => {
  it('n’expose que deux packs — plus aucune vente à l’unité', () => {
    expect(PACK_IDS).toEqual(['leurres', 'goujons'])
    console.log('\n╔═══ CE QUE LE SITE VEND RÉELLEMENT ═══╗')
    for (const id of PACK_IDS) {
      const pack = PACKS[id]
      console.log(
        `  « ${pack.name} » → ${formatEuros(pack.amountCents)} | ` +
          `${pack.unitCount} pièces | + ${formatEuros(SHIPPING.amountCents)} de livraison ` +
          `= ${formatEuros(totalCents(id))} encaissés`
      )
    }
    console.log(
      `  Le pack de leurres contient UNE unité de chacun des ${PRODUCT.colorways.length} coloris : ` +
        PRODUCT.colorways.map((c) => c.label).join(', ')
    )
    console.log('  Il n’existe AUCUNE vente à l’unité, ni offre « 3 achetés le 4e offert ».')
  })

  it('facture les prix décidés, livraison en sus', () => {
    expect(PACKS.leurres.amountCents).toBe(1099)
    expect(PACKS.goujons.amountCents).toBe(599)
    expect(SHIPPING.amountCents).toBe(360)
    expect(totalCents('leurres')).toBe(1099 + 360)
    expect(totalCents('goujons')).toBe(599 + 360)
  })
})

campagne('2 · Le reçu Stripe — ce que le client voit et paie', () => {
  it('la somme des lignes PLUS la livraison vaut toujours le total encaissé', () => {
    for (const pack of PACK_IDS) {
      const lines = checkoutLines(pack)
      const sum = lines.reduce((t, l) => t + l.unitAmountCents * l.quantity, 0)
      expect(sum + SHIPPING.amountCents).toBe(totalCents(pack))
    }
  })

  it('détaille le reçu de chaque pack', () => {
    console.log('\n╔═══ LE REÇU, PACK PAR PACK ═══╗')
    for (const pack of PACK_IDS) {
      const lines = checkoutLines(pack)
      const articles = lines.reduce((t, l) => t + l.unitAmountCents * l.quantity, 0)
      console.log(`\n  ▸ ${PACKS[pack].name}`)
      for (const l of lines) {
        console.log(`      ${l.quantity} × ${l.name} — ${formatEuros(l.unitAmountCents)}`)
      }
      console.log(`      livraison (${SHIPPING.carrier}) — ${formatEuros(SHIPPING.amountCents)}`)
      console.log(`      ─────────────────────────────`)
      console.log(
        `      TOTAL : ${formatEuros(articles + SHIPPING.amountCents)}   (TVA non applicable art. 293 B)`
      )
      expect(articles + SHIPPING.amountCents).toBe(totalCents(pack))
    }
  })

  it('la livraison n’est JAMAIS une ligne d’article', () => {
    // Elle passe par les frais de port de Stripe. Facturée comme un article,
    // elle serait remboursée comme un produit en cas de rétractation.
    for (const pack of PACK_IDS) {
      expect(checkoutLines(pack).some((l) => l.unitAmountCents === SHIPPING.amountCents)).toBe(
        false
      )
    }
  })
})

campagne('3 · La signature du webhook — vérification cryptographique réelle', () => {
  it('accepte un événement correctement signé avec le secret du projet', () => {
    const payload = JSON.stringify(buildEvent())
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string
    const event = verifyWebhookEvent(payload, signStripe(payload, secret))
    expect(event.type).toBe('checkout.session.completed')
  })

  it('refuse un corps modifié après signature (montant gonflé)', () => {
    const original = JSON.stringify(buildEvent())
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string
    const signature = signStripe(original, secret)
    const falsifie = original.replace('"amount_total":2199', '"amount_total":1')
    expect(falsifie).not.toBe(original)
    expect(() => verifyWebhookEvent(falsifie, signature)).toThrow()
  })

  it('refuse une signature calculée avec un autre secret', () => {
    const payload = JSON.stringify(buildEvent())
    expect(() => verifyWebhookEvent(payload, signStripe(payload, 'whsec_faux_secret'))).toThrow()
  })

  it('refuse un horodatage trop ancien (anti-rejeu)', () => {
    const payload = JSON.stringify(buildEvent())
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string
    const vieux = Math.floor(Date.now() / 1000) - 3600
    expect(() => verifyWebhookEvent(payload, signStripe(payload, secret, vieux))).toThrow()
  })
})

campagne('4 · Le webhook, requête par requête', () => {
  it('sans en-tête de signature → 400', async () => {
    const r = await callWebhook(buildEvent(), { signature: null })
    expect(r.status).toBe(400)
    expect(r.body.error).toBe('Signature absente.')
  })

  it('signature invalide → 400, sans détail technique divulgué', async () => {
    const r = await callWebhook(buildEvent(), { signature: 't=1,v1=deadbeef' })
    expect(r.status).toBe(400)
    expect(r.body.error).toBe('Signature invalide.')
  })

  it('événement hors périmètre → 200 (accusé de réception, pas de boucle)', async () => {
    const r = await callWebhook(buildEvent({ type: 'payment_intent.succeeded' }))
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true })
  })

  it('paiement différé ÉCHOUÉ → 200, aucun email', async () => {
    const r = await callWebhook(
      buildEvent({ type: 'checkout.session.async_payment_failed', paymentStatus: 'unpaid' })
    )
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true })
  })

  it('tunnel terminé mais NON payé → 200 « pending », aucun email', async () => {
    const r = await callWebhook(buildEvent({ paymentStatus: 'unpaid' }))
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true, pending: true })
  })

  it('session sans email client → 200 « skipped », rien d’inventé', async () => {
    const r = await callWebhook(buildEvent({ email: null }))
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true, skipped: true })
  })
})

campagne('5 · Achat payé de bout en bout — VRAIS emails Resend', () => {
  it('UN LEURRE payé → confirmation client + notification vendeur', async () => {
    const r = await callWebhook(buildEvent({ offre: 'solo', coloris: 'coloris-2' }))
    console.log(`\n  ▸ Solo payé → HTTP ${r.status} ${JSON.stringify(r.body)}`)
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true })
    expect(revalidateOrdersCount).toHaveBeenCalled()
  }, 30_000)

  it('COLLECTION payée, 4e offert = Pirate → les deux emails partent', async () => {
    const r = await callWebhook(buildEvent({ offre: 'collection', cadeau: 'pirate' }))
    console.log(`  ▸ Collection + Pirate → HTTP ${r.status} ${JSON.stringify(r.body)}`)
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ received: true })
  }, 30_000)

  it('COLLECTION payée, 4e offert = un coloris en double → les deux emails partent', async () => {
    const r = await callWebhook(buildEvent({ offre: 'collection', cadeau: 'coloris-3' }))
    console.log(`  ▸ Collection + doublon → HTTP ${r.status} ${JSON.stringify(r.body)}`)
    expect(r.status).toBe(200)
  }, 30_000)

  it('le MÊME événement rejoué ne renvoie aucun email (idempotence)', async () => {
    const evt = buildEvent({ offre: 'solo', eventId: 'evt_campagne_rejeu' })
    const first = await callWebhook(evt)
    expect(first.status).toBe(200)
    expect(first.body).toEqual({ received: true })
    const second = await callWebhook(evt)
    console.log(
      `  ▸ Rejeu du même événement → HTTP ${second.status} ${JSON.stringify(second.body)}`
    )
    expect(second.status).toBe(200)
    expect(second.body).toEqual({ received: true, duplicate: true })
  }, 30_000)

  it('une offre inconnue en métadonnée n’empêche pas l’email, mais reste honnête', async () => {
    const r = await callWebhook(buildEvent({ offre: 'offre-supprimee-v0', amountTotal: 4999 }))
    console.log(`  ▸ Offre inconnue → HTTP ${r.status} ${JSON.stringify(r.body)}`)
    expect(r.status).toBe(200)
  }, 30_000)
})

campagne('6 · Le marqueur d’idempotence durable (API Stripe requise)', () => {
  it('marqueur illisible → 500, jamais un doublon silencieux', async () => {
    const r = await callWebhook(buildEvent({ paymentIntent: 'pi_test_campagne' }))
    console.log(`\n  ▸ Session AVEC PaymentIntent → HTTP ${r.status} ${JSON.stringify(r.body)}`)
    expect(r.status).toBe(500)
    expect(r.body.error).toBe('Vérification d’idempotence impossible.')
  }, 30_000)
})

campagne('7 · /api/checkout — la porte d’entrée de la commande', () => {
  it('refuse la collection sans choix du 4e leurre', async () => {
    const r = await callCheckout({ coloris: 'coloris-1', offre: 'collection' })
    expect(r.status).toBe(400)
    expect(r.body.issues?.cadeau?.[0]).toBe('Choisissez votre 4e leurre offert.')
  })

  it('refuse un coloris inexistant', async () => {
    const r = await callCheckout({ coloris: 'coloris-99', offre: 'solo' })
    expect(r.status).toBe(400)
  })

  it('refuse une offre inexistante', async () => {
    const r = await callCheckout({ coloris: 'coloris-1', offre: 'gratuit' })
    expect(r.status).toBe(400)
  })

  it('refuse un cadeau inexistant', async () => {
    const r = await callCheckout({ coloris: 'coloris-1', offre: 'collection', cadeau: 'licorne' })
    expect(r.status).toBe(400)
  })

  it('refuse un JSON illisible', async () => {
    const r = await callCheckout(null, { raw: '{coloris:' })
    expect(r.status).toBe(400)
    expect(r.body.error).toBe('JSON invalide.')
  })

  it('refuse un corps au-delà du plafond de 1 000 octets', async () => {
    const r = await callCheckout(null, {
      raw: JSON.stringify({ coloris: 'coloris-1', offre: 'solo', bourrage: 'x'.repeat(1200) }),
    })
    expect(r.status).toBe(413)
  })

  it('plafonne à 10 commandes par minute et par IP', async () => {
    const ip = '203.0.113.42'
    let premier429: number | null = null
    for (let i = 1; i <= 12; i++) {
      const r = await callCheckout({ coloris: 'coloris-1', offre: 'solo' }, { ip })
      if (r.status === 429 && premier429 === null) premier429 = i
    }
    console.log(`\n  ▸ Rate-limit déclenché à la requête n°${premier429}`)
    expect(premier429).toBe(11)
  }, 60_000)

  it('une commande valide crée une session, ou échoue sans rien divulguer', async () => {
    const r = await callCheckout({ coloris: 'coloris-1', offre: 'solo' })
    console.log(`  ▸ Commande valide → HTTP ${r.status} — « ${r.body.error ?? r.body.url} »`)
    expect([200, 500, 503]).toContain(r.status)
    if (r.status === 200) {
      expect(String(r.body.url)).toMatch(/^https:\/\/checkout\.stripe\.com\//)
    } else {
      // Échec bruyant côté serveur, message sobre côté client : aucune fuite.
      expect(String(r.body.error)).not.toMatch(/sk_|rk_|whsec_|Stripe|api_key/i)
    }
  }, 30_000)
})

campagne('8 · Les emails, tels qu’ils arrivent vraiment', () => {
  it('affiche le contenu exact de chaque email de commande', () => {
    const cas = PACK_IDS.map((pack) => ({
      titre: PACKS[pack].name,
      order: {
        sessionId: `cs_test_exemple_${pack}`,
        customerEmail: 'client@exemple.fr',
        packLabel: packSummary(pack),
        totalCents: totalCents(pack),
      },
    }))
    for (const c of cas) {
      console.log(`\n╔═══ EMAIL CLIENT — ${c.titre} ═══╗`)
      console.log(`Objet : ${confirmationSubject()}`)
      console.log(confirmationText(c.order))
      console.log(`\n╔═══ EMAIL VENDEUR — ${c.titre} ═══╗`)
      console.log(`Objet : Commande à traiter — ${c.order.packLabel}`)
      console.log(notificationText(c.order))

      // Règle Alure n°1 : le délai est ré-affiché dans l'email de confirmation.
      expect(confirmationText(c.order)).toContain(PRODUCT.deliveryDelay)
      expect(confirmationHtml(c.order)).toContain(PRODUCT.deliveryDelay)
      // Mentions légales obligatoires.
      expect(confirmationText(c.order)).toContain('293 B')
      expect(confirmationText(c.order)).toContain('rétractation de 14 jours')
      // Le montant affiché est CELUI qui a été encaissé.
      expect(confirmationText(c.order)).toContain(formatEuros(c.order.totalCents))
    }
  })

  it('échappe le HTML — un libellé piégé ne peut pas injecter de balise', () => {
    const html = confirmationHtml({
      sessionId: 'cs_x',
      customerEmail: 'a@b.fr',
      packLabel: '<script>alert(1)</script>',
      totalCents: 1459,
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
