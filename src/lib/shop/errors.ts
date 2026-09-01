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

/**
 * Stripe a REFUSÉ la clé : expirée, révoquée, ou d'un autre compte.
 *
 * Distincte de `PaymentNotConfiguredError` (clé absente) et d'une panne Stripe,
 * parce que le geste de réparation n'est pas le même — ici il faut remplacer une
 * valeur dans `.env.local`, personne n'attend que ça se rétablisse tout seul.
 * Et distincte d'un incident, parce qu'un incident mérite une trace complète
 * quand une erreur de configuration mérite une phrase et une consigne.
 */
export class PaymentKeyRejectedError extends Error {
  constructor(cause?: unknown) {
    super(
      'Clé Stripe refusée (expirée, révoquée ou d’un autre compte). ' +
        'Remplacez STRIPE_SECRET_KEY dans .env.local par une clé sk_test_… du dashboard. ' +
        'Une clé rkcs_… est un jeton temporaire de connecteur : elle expire en quelques heures.'
    )
    this.cause = cause
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
