import 'server-only'
import { Resend } from 'resend'
import { SITE } from '@/lib/site-config'
import { PRODUCT, SHIPPING, formatEuros } from './product'
import { EmailNotConfiguredError } from './errors'

/**
 * Emails transactionnels de commande (Resend). Isolés ici (règle Alure n°2).
 *
 * Expéditeur : RESEND_FROM — tant que le domaine n'est pas acheté, l'adresse de
 * test Resend (onboarding@resend.dev) est la seule utilisable. Bascule en LOT 4.
 * Destinataire des notifications internes : ORDER_NOTIFICATIONS_EMAIL.
 *
 * Les gabarits sont des fonctions PURES exportées : testables sans réseau.
 * Texte simple + HTML minimal sans image : un email de confirmation doit
 * arriver, pas impressionner.
 */

export type OrderSummary = {
  sessionId: string
  customerEmail: string
  /** Le pack commandé, en une ligne — cf. `packSummary()`. */
  packLabel: string
  /** Le montant RÉELLEMENT encaissé : le pack plus la livraison. */
  totalCents: number
}

export function confirmationSubject(): string {
  return `Votre commande ${SITE.name} est confirmée`
}

export function confirmationText(order: OrderSummary): string {
  return [
    'Bonjour,',
    '',
    `Votre commande est confirmée — merci de votre confiance.`,
    '',
    `Récapitulatif :`,
    `- ${PRODUCT.name}`,
    `- ${order.packLabel}`,
    `- Total payé : ${formatEuros(order.totalCents)}, livraison comprise (${formatEuros(SHIPPING.amountCents)}) — TVA non applicable, art. 293 B du CGI`,
    '',
    `Livraison : ${PRODUCT.deliveryDelay}, comme annoncé avant votre achat.`,
    `Dès l'expédition, vous recevrez le numéro de suivi par email.`,
    '',
    `Vous disposez d'un droit de rétractation de 14 jours après réception.`,
    `Une question ? Répondez simplement à cet email.`,
    '',
    `${SITE.name} — ${SITE.url}`,
  ].join('\n')
}

export function confirmationHtml(order: OrderSummary): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return [
    `<p>Bonjour,</p>`,
    `<p>Votre commande est confirmée — merci de votre confiance.</p>`,
    `<p><strong>Récapitulatif :</strong><br/>`,
    `${esc(PRODUCT.name)}<br/>`,
    `${esc(order.packLabel)}<br/>`,
    `Total payé : ${esc(formatEuros(order.totalCents))} (port inclus — TVA non applicable, art. 293 B du CGI)</p>`,
    `<p><strong>Livraison : ${esc(PRODUCT.deliveryDelay)}</strong>, comme annoncé avant votre achat. Dès l'expédition, vous recevrez le numéro de suivi par email.</p>`,
    `<p>Vous disposez d'un droit de rétractation de 14 jours après réception. Une question ? Répondez simplement à cet email.</p>`,
    `<p>${esc(SITE.name)} — <a href="${SITE.url}">${esc(SITE.url)}</a></p>`,
  ].join('\n')
}

export function notificationText(order: OrderSummary): string {
  return [
    `Nouvelle commande payée (session ${order.sessionId}) :`,
    `- Client : ${order.customerEmail}`,
    `- ${order.packLabel}`,
    `- Total : ${formatEuros(order.totalCents)}`,
    '',
    `À préparer et expédier, puis renseigner le n° de suivi au client par email.`,
    `Détails complets : dashboard Stripe.`,
  ].join('\n')
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new EmailNotConfiguredError()
  return new Resend(key)
}

function fromAddress(): string {
  return process.env.RESEND_FROM || `${SITE.name} <onboarding@resend.dev>`
}

/**
 * Envoie les 2 emails d'une commande payée. Lève à la moindre erreur : le
 * webhook répond alors 500 et Stripe re-livrera l'événement — jamais une
 * commande confirmée sans email en silence.
 */
export async function sendOrderEmails(order: OrderSummary): Promise<void> {
  const resend = getResend()
  const from = fromAddress()

  const confirmation = await resend.emails.send({
    from,
    to: order.customerEmail,
    subject: confirmationSubject(),
    text: confirmationText(order),
    html: confirmationHtml(order),
  })
  if (confirmation.error) {
    throw new Error(
      `Envoi confirmation échoué (${order.sessionId}) : ${confirmation.error.message}`
    )
  }

  const notifyTo = process.env.ORDER_NOTIFICATIONS_EMAIL
  if (!notifyTo) {
    // Sans notification interne, la commande risque de ne jamais être traitée :
    // échec bruyant, Stripe re-livrera quand la config sera complète.
    throw new EmailNotConfiguredError()
  }
  const notification = await resend.emails.send({
    from,
    to: notifyTo,
    subject: `Commande à traiter — ${order.packLabel}`,
    text: notificationText(order),
  })
  if (notification.error) {
    throw new Error(
      `Envoi notification échoué (${order.sessionId}) : ${notification.error.message}`
    )
  }
}
