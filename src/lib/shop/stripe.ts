import 'server-only'
import Stripe from 'stripe'
import { SITE } from '@/lib/site-config'
import { PRODUCT, getColorway, checkoutLines, formatSpecs } from './product'
import {
  PaymentNotConfiguredError,
  WebhookNotConfiguredError,
  WebhookSignatureError,
} from './errors'
import type { CheckoutInput } from './checkout-schema'

/**
 * L'isolation Stripe (règle Alure n°2) : le reste du site ne connaît que
 * createCheckoutSession(). Un changement d'API Stripe — ou une migration
 * Shopify — ne touche que ce fichier.
 *
 * Choix d'intégration (spec boutique.md) : Stripe Checkout en REDIRECTION pleine
 * page. Aucun script Stripe sur notre site → zéro ajout CSP, zéro cookie tiers.
 * PayPal est proposé par la page Checkout elle-même : les moyens de paiement se
 * pilotent depuis le dashboard Stripe (ne PAS fixer payment_method_types ici).
 */

let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new PaymentNotConfiguredError()
  if (!stripeClient) stripeClient = new Stripe(key)
  return stripeClient
}

/**
 * Base des URLs de retour. En production : le domaine canonique (SITE.url) —
 * jamais l'en-tête Host, contrôlable par le client (open redirect après
 * paiement). En dev : l'origin réel du serveur local (port variable).
 *
 * Le test passe par `new URL(...).hostname`, pas par un préfixe de chaîne :
 * `startsWith('http://localhost')` accepterait `http://localhost.evil.com`.
 */
function isLocalDevOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin)
    return protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
  } catch {
    return false
  }
}

function returnBaseUrl(devOrigin: string | null): string {
  if (process.env.NODE_ENV === 'development' && devOrigin && isLocalDevOrigin(devOrigin)) {
    return devOrigin
  }
  return SITE.url
}

/**
 * Crée la session Stripe Checkout et retourne son URL de paiement.
 * N'accepte QUE des données déjà validées (schéma + orderableError).
 */
export async function createCheckoutSession(
  input: CheckoutInput,
  devOrigin: string | null = null
): Promise<string> {
  const stripe = getStripe()
  const colorway = getColorway(input.coloris)
  if (!colorway) throw new Error(`Coloris inconnu après validation : ${input.coloris}`)

  const base = returnBaseUrl(devOrigin)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'fr',
    // Deux lignes dès 2 leurres (barème dégressif) : la remise se lit sur la page
    // de paiement au lieu d'être noyée dans un total. Les montants viennent de
    // checkoutLines(), dont la somme est testée égale à totalCents().
    line_items: checkoutLines(input.offre, colorway.label).map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: PRODUCT.currency,
        unit_amount: line.unitAmountCents,
        product_data: {
          name: line.name,
          description: `${formatSpecs()}. Livraison incluse (${PRODUCT.deliveryDelay}). TVA non applicable, art. 293 B du CGI.`,
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ['FR'] },
    // Ce que le webhook relira pour l'email de confirmation.
    metadata: { coloris: colorway.id, offre: input.offre },
    success_url: `${base}/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/leurre`,
  })

  if (!session.url) {
    // Jamais vu en mode payment, mais échec bruyant plutôt qu'un undefined qui se propage.
    throw new Error(`Session Stripe ${session.id} créée sans URL de paiement.`)
  }
  return session.url
}

/**
 * Clé du marqueur d'idempotence posé sur le PaymentIntent une fois les emails
 * de commande partis. Le webhook la lit AVANT d'envoyer : une re-livraison du
 * même paiement — même des heures plus tard, sur une autre instance serverless —
 * ne renvoie rien. Le marqueur vit chez Stripe parce qu'il n'y a pas de BDD
 * (règle Alure n°4) : le dashboard reste la source de vérité, et ce marqueur
 * y est lisible (métadonnées du paiement).
 */
const FULFILLMENT_MARKER_KEY = 'alure_emails_commande'

/** L'ID du PaymentIntent d'une session Checkout (string non expansée en webhook). */
export function paymentIntentIdOf(session: Stripe.Checkout.Session): string | null {
  const intent = session.payment_intent
  if (typeof intent === 'string') return intent
  return intent?.id ?? null
}

/** Les emails de cette commande sont-ils déjà partis (marqueur posé chez Stripe) ? */
export async function hasFulfillmentMarker(paymentIntentId: string): Promise<boolean> {
  const intent = await getStripe().paymentIntents.retrieve(paymentIntentId)
  return Boolean(intent.metadata[FULFILLMENT_MARKER_KEY])
}

/** Pose le marqueur, avec l'ID de l'événement qui a déclenché l'envoi (traçable au dashboard). */
export async function setFulfillmentMarker(
  paymentIntentId: string,
  eventId: string
): Promise<void> {
  await getStripe().paymentIntents.update(paymentIntentId, {
    metadata: { [FULFILLMENT_MARKER_KEY]: eventId },
  })
}

/**
 * Vérifie la signature d'un webhook Stripe et retourne l'événement typé.
 * Corps BRUT obligatoire (le moindre re-parse/re-stringify casse la signature).
 * Lève WebhookSignatureError (→ 400) ou WebhookNotConfiguredError (→ 503).
 */
export function verifyWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new WebhookNotConfiguredError()
  try {
    return getStripe().webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new WebhookSignatureError(error)
    }
    throw error
  }
}
