// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  confirmationSubject,
  confirmationText,
  confirmationHtml,
  notificationText,
  type OrderSummary,
} from './emails'
import { PRODUCT, offerSummary, totalCents } from './product'

const order: OrderSummary = {
  sessionId: 'cs_test_123',
  customerEmail: 'client@exemple.fr',
  colorisLabel: PRODUCT.colorways[0].label,
  offerSummary: offerSummary('collection', PRODUCT.colorways[0].label),
  totalCents: totalCents('collection'),
}

describe('gabarits des emails de commande', () => {
  it('la confirmation ré-affiche le délai annoncé (règle Alure n°1)', () => {
    expect(confirmationText(order)).toContain(PRODUCT.deliveryDelay)
    expect(confirmationHtml(order)).toContain(PRODUCT.deliveryDelay)
  })

  it('la confirmation contient le récapitulatif exact', () => {
    const text = confirmationText(order)
    expect(text).toContain(order.offerSummary)
    // Le montant vient de la source unique — jamais un chiffre en dur qui
    // dérive quand le barème change. Intl formate avec une espace insécable
    // fine (U+202F) : on normalise.
    const totalAffiche = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
      .format(totalCents('collection') / 100)
      .replace(/\s/g, ' ')
    expect(text.replace(/\s/g, ' ')).toContain(totalAffiche)
    expect(text).toContain('rétractation de 14 jours')
  })

  it('la confirmation vouvoie (jamais de tutoiement)', () => {
    const text = confirmationText(order)
    expect(text).toMatch(/[Vv]otre|[Vv]ous/)
    expect(text).not.toMatch(/\b[Tt]on\b|\b[Tt]a\b|\b[Tt]u\b/)
  })

  it('le HTML échappe les valeurs interpolées', () => {
    const hostile = { ...order, colorisLabel: '<script>alert(1)</script>' }
    expect(confirmationHtml(hostile)).not.toContain('<script>')
  })

  it('la notification interne contient de quoi traiter la commande', () => {
    const text = notificationText(order)
    expect(text).toContain('cs_test_123')
    expect(text).toContain('client@exemple.fr')
    expect(text).toContain(order.offerSummary)
  })

  it('le sujet dit ce qui s’est passé', () => {
    expect(confirmationSubject()).toMatch(/confirmée/)
  })
})
