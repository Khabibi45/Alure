/**
 * Erreurs typées du module shop — dans leur propre fichier pour que les tests
 * puissent mocker stripe.ts sans casser les instanceof de la route.
 */

/** Clé Stripe absente : le paiement n'est pas configuré (dev sans .env.local). */
export class PaymentNotConfiguredError extends Error {
  constructor() {
    super('STRIPE_SECRET_KEY manquante : paiement non configuré.')
  }
}

/** Signature Stripe invalide sur le webhook : requête à rejeter en 400. */
export class WebhookSignatureError extends Error {
  constructor(cause?: unknown) {
    super('Signature du webhook Stripe invalide.')
    this.cause = cause
  }
}

/** Secret du webhook absent : vérification impossible (config incomplète). */
export class WebhookNotConfiguredError extends Error {
  constructor() {
    super('STRIPE_WEBHOOK_SECRET manquante : webhook non configuré.')
  }
}

/** Clé Resend absente : les emails transactionnels ne partent pas. */
export class EmailNotConfiguredError extends Error {
  constructor() {
    super('RESEND_API_KEY manquante : emails non configurés.')
  }
}
