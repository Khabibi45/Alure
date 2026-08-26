import { getDictionary, t } from './index'
import type { Locale } from './paths'
import type { ContactStrings } from '@/components/sections/contact/contact-strings'

/**
 * Les textes du formulaire de contact, préparés CÔTÉ SERVEUR pour l'îlot client
 * `ContactForm` — même patron que `carouselStrings()` dans `chrome.ts` : le
 * client reçoit des chaînes prêtes, jamais un dictionnaire entier (règle Alure
 * n°6).
 *
 * Un module à part et non une fonction de plus dans `chrome.ts` : `chrome.ts`
 * habille TOUTES les pages (header, footer, sélecteur de langue), alors que ces
 * chaînes-ci ne servent qu'à une page. Les garder séparées évite qu'un
 * formulaire fasse grossir l'habillage commun.
 *
 * `t` partout et jamais `raw` : aucune de ces clés ne porte de `{placeholder}`,
 * donc rien n'est laissé à remplir au navigateur.
 */
export function contactStrings(locale: Locale): ContactStrings {
  const dict = getDictionary(locale)
  return {
    emailLabel: t(dict, 'CONTACT.EMAIL'),
    orderNumberLabel: t(dict, 'CONTACT.ORDER_NUMBER_LABEL'),
    orderNumberOptional: t(dict, 'CONTACT.OPTIONAL'),
    messageLabel: t(dict, 'CONTACT.MESSAGE'),
    honeypotLabel: t(dict, 'CONTACT.HONEYPOT_LABEL'),
    submit: t(dict, 'CONTACT.SUBMIT'),
    sending: t(dict, 'CONTACT.SENDING'),
    successTitle: t(dict, 'CONTACT.SUCCESS_TITLE'),
    successDetail: t(dict, 'CONTACT.SUCCESS_DETAIL'),
    error: t(dict, 'CONTACT.ERROR'),
    errorOffline: t(dict, 'CONTACT.ERROR_OFFLINE'),
    errorRateLimit: t(dict, 'CONTACT.ERROR_RATE_LIMIT'),
    errorUnavailable: t(dict, 'CONTACT.ERROR_UNAVAILABLE'),
    validation: {
      emailRequired: t(dict, 'CONTACT.EMAIL_REQUIRED'),
      emailInvalid: t(dict, 'CONTACT.EMAIL_INVALID'),
      messageRequired: t(dict, 'CONTACT.MESSAGE_REQUIRED'),
      orderNumberInvalid: t(dict, 'CONTACT.ORDER_NUMBER_INVALID'),
    },
  }
}
