import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import {
  hasFulfillmentMarker,
  paymentIntentIdOf,
  setFulfillmentMarker,
  verifyWebhookEvent,
} from '@/lib/shop/stripe'
import { sendOrderEmails, type OrderSummary } from '@/lib/shop/emails'
import { revalidateOrdersCount } from '@/lib/shop/orders-count'
import { packSummary } from '@/lib/shop/product'
import {
  EmailNotConfiguredError,
  WebhookNotConfiguredError,
  WebhookSignatureError,
} from '@/lib/shop/errors'

/**
 * Webhook Stripe (spec boutique.md T3) : à la commande PAYÉE, envoie l'email de
 * confirmation client + la notification interne. Pas de BDD : la source de
 * vérité reste le dashboard Stripe, ce webhook ne fait QUE notifier.
 *
 * « Payée » se lit sur `payment_status`, jamais sur le type d'événement : le
 * catalogue des moyens de paiement se pilote au dashboard (aucun
 * `payment_method_types` fixé dans le code, c'est la recommandation Stripe), donc
 * cette route ne peut pas supposer que tous les paiements sont immédiats.
 * L'endpoint doit être abonné à `checkout.session.completed`,
 * `async_payment_succeeded` ET `async_payment_failed`.
 *
 * Idempotence à DEUX étages : Stripe livre « au moins une fois », donc parfois
 * deux. (1) Un Set en mémoire coupe les doublons rapprochés sur la même
 * instance. (2) Le marqueur durable vit chez Stripe — métadonnées du
 * PaymentIntent, posées une fois les emails partis — et couvre ce que le Set ne
 * peut pas : la re-livraison qui atterrit sur une AUTRE instance serverless ou
 * après un recyclage. Sans lui, un client recevait deux confirmations et le
 * vendeur deux notifications « à commander » — risque réel de double commande
 * fournisseur. Sémantique d'échec : marqueur illisible → 500 (re-livraison,
 * jamais un doublon rendu invisible) ; pose du marqueur échouée APRÈS envoi →
 * 200 loggé fort (on ne re-livre pas des emails déjà partis).
 */
const processedEventIds = new Set<string>()
const PROCESSED_MAX = 1000

/**
 * Plafond du corps accepté, AVANT vérification de signature : un événement
 * Checkout fait quelques Ko, 128 Ko est très large. Borne ce qu'un inconnu peut
 * faire lire à un endpoint public (la signature, elle, ne coûte qu'après).
 */
const WEBHOOK_MAX_BYTES = 128_000

function markProcessed(id: string): void {
  processedEventIds.add(id)
  if (processedEventIds.size > PROCESSED_MAX) {
    const oldest = processedEventIds.values().next().value
    if (oldest) processedEventIds.delete(oldest)
  }
}

function toOrderSummary(session: Stripe.Checkout.Session): OrderSummary | null {
  const customerEmail = session.customer_details?.email
  const packId = session.metadata?.pack
  const totalCents = session.amount_total
  if (!customerEmail || !packId || totalCents === null) {
    return null
  }
  let summary: string
  try {
    summary = packSummary(packId)
  } catch {
    // Pack inconnu (métadonnée d'une commande passée sous une version
    // précédente du catalogue) : on ne devine pas, on transmet ce qu'on a lu.
    // L'email reste vrai, il est juste moins joli.
    summary = packId
  }
  return {
    sessionId: session.id,
    customerEmail,
    packLabel: summary,
    totalCents,
  }
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event
  try {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Signature absente.' }, { status: 400 })
    }
    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength > WEBHOOK_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload trop volumineux.' }, { status: 413 })
    }
    const rawBody = await request.text()
    if (rawBody.length > WEBHOOK_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload trop volumineux.' }, { status: 413 })
    }
    event = verifyWebhookEvent(rawBody, signature)
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 })
    }
    if (error instanceof WebhookNotConfiguredError) {
      console.error('POST /api/stripe-webhook : STRIPE_WEBHOOK_SECRET absente.')
      return NextResponse.json({ error: 'Webhook non configuré.' }, { status: 503 })
    }
    console.error('POST /api/stripe-webhook : échec de vérification.', error)
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 })
  }

  // Deux types déclenchent l'envoi, pas un seul (doctrine de fulfillment Stripe,
  // vérifiée le 06/08/2026) : `completed` pour un paiement immédiat, et
  // `async_payment_succeeded` pour un moyen à notification différée, dont le
  // paiement n'aboutit que plus tard. Tout le reste : accusé de réception
  // immédiat (200), sinon Stripe les re-livre en boucle.
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    if (event.type === 'checkout.session.async_payment_failed') {
      // Aucun email de confirmation n'est parti (la session était `unpaid`),
      // donc rien à rétracter côté client — mais l'échec doit se voir.
      console.error(
        `POST /api/stripe-webhook : paiement différé échoué (session ${event.data.object.id}, événement ${event.id}). Aucune commande à traiter.`
      )
    }
    return NextResponse.json({ received: true })
  }

  if (processedEventIds.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // `checkout.session.completed` ne veut PAS dire « payé » : il signifie « le
  // client a terminé le tunnel ». Un moyen à notification différée le livre avec
  // `payment_status: 'unpaid'`, et c'est `async_payment_succeeded` qui tranchera
  // ensuite. Envoyer l'email ici écrirait « Total payé » sur un paiement qui peut
  // encore échouer — un chiffre faux, et une expédition à perte.
  // Test officiel Stripe : traiter dès que `payment_status !== 'unpaid'`.
  if (event.data.object.payment_status === 'unpaid') {
    console.info(
      `POST /api/stripe-webhook : session ${event.data.object.id} terminée mais non payée (paiement différé). Aucun email — on attend checkout.session.async_payment_succeeded.`
    )
    return NextResponse.json({ received: true, pending: true })
  }

  const order = toOrderSummary(event.data.object)
  if (!order) {
    // Session incomplète (pas d'email client…) : on loggue l'ID — jamais le
    // contenu — et on répond 200 : re-livrer ne réparera pas ces données.
    console.error(
      `POST /api/stripe-webhook : session ${event.data.object.id} sans données exploitables (événement ${event.id}).`
    )
    return NextResponse.json({ received: true, skipped: true })
  }

  // Étage durable de l'idempotence : le marqueur chez Stripe. Lu AVANT l'envoi —
  // s'il est posé, une autre instance a déjà expédié ces emails.
  const intentId = paymentIntentIdOf(event.data.object)
  if (intentId) {
    let alreadySent: boolean
    try {
      alreadySent = await hasFulfillmentMarker(intentId)
    } catch (error) {
      // Illisible ≠ absent : on ne devine pas. 500 → Stripe re-livrera quand
      // l'API répondra — on préfère une re-livraison à un doublon possible.
      console.error(
        `POST /api/stripe-webhook : marqueur d'idempotence illisible (session ${order.sessionId}, événement ${event.id}).`,
        error
      )
      return NextResponse.json({ error: 'Vérification d’idempotence impossible.' }, { status: 500 })
    }
    if (alreadySent) {
      markProcessed(event.id)
      return NextResponse.json({ received: true, duplicate: true })
    }
  } else {
    // Jamais vu en mode payment. S'il manque, l'idempotence retombe sur la
    // mémoire de l'instance : on le signale, on ne bloque pas la commande.
    console.error(
      `POST /api/stripe-webhook : session ${order.sessionId} sans PaymentIntent — idempotence locale seulement (événement ${event.id}).`
    )
  }

  try {
    await sendOrderEmails(order)
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error('POST /api/stripe-webhook : emails non configurés (Resend).')
    } else {
      console.error(
        `POST /api/stripe-webhook : envoi des emails échoué (session ${order.sessionId}).`,
        error
      )
    }
    // 500 : Stripe re-livrera l'événement — une commande payée ne reste jamais
    // silencieusement sans email.
    return NextResponse.json({ error: 'Envoi des emails échoué.' }, { status: 500 })
  }

  markProcessed(event.id)
  // Une commande payée vient d'être traitée : le compteur du bandeau d'objectif
  // change — on invalide son cache (spec bandeau-objectif-commandes, T3).
  // APRÈS l'idempotence : un doublon détecté plus haut n'invalide rien.
  revalidateOrdersCount()
  // Marqueur posé APRÈS l'envoi : un échec d'ENVOI doit re-livrer (ci-dessus),
  // un échec de MARQUAGE non — les emails sont partis. On répond 200 en le
  // loggant fort : la seule conséquence possible est un doublon si Stripe
  // re-livre ET change d'instance, exactement le cas d'avant ce marqueur.
  if (intentId) {
    try {
      await setFulfillmentMarker(intentId, event.id)
    } catch (error) {
      console.error(
        `POST /api/stripe-webhook : pose du marqueur d'idempotence échouée (session ${order.sessionId}, événement ${event.id}) — un doublon d'email redevient possible en cas de re-livraison.`,
        error
      )
    }
  }
  return NextResponse.json({ received: true })
}
