import { z } from 'zod'

/** Taille maximale acceptée pour le corps de la requête /api/contact (anti-abus). */
export const CONTACT_MAX_BYTES = 20_000

/**
 * Les messages de refus du schéma — les SEULS textes de ce module que le
 * visiteur lit.
 *
 * Ils sont un PARAMÈTRE et non des constantes, parce que le même schéma sert
 * deux publics : la route API (serveur, journal français) et le formulaire, qui
 * doit refuser dans la langue de sa page. Sans ça, `/en/contact` affichait
 * « Votre email est requis » sous un champ anglais.
 */
export type ContactMessages = {
  readonly emailRequired: string
  readonly emailInvalid: string
  readonly messageRequired: string
  readonly orderNumberInvalid: string
}

/**
 * Le français par défaut : la route API (`src/app/api/contact/route.ts`) et ses
 * tests continuent d'appeler `contactSchema` sans rien savoir des langues.
 */
export const CONTACT_MESSAGES_FR: ContactMessages = {
  emailRequired: 'Votre email est requis',
  emailInvalid: 'Email invalide',
  messageRequired: 'Décrivez votre demande',
  orderNumberInvalid: 'Numéro de commande invalide',
}

/**
 * Schéma de validation du formulaire de contact.
 * PARTAGÉ entre la route API (serveur) et le formulaire (resolver react-hook-form) :
 * une seule source de vérité — un champ ajouté = un seul endroit à modifier.
 * Les clés inconnues sont retirées par zod : l'API ne relaie jamais du JSON arbitraire.
 *
 * Minimisation RGPD (cadrage 2026-08-05) : email + message + n° de commande
 * optionnel. Pas de champ nom — répondre ne l'exige pas.
 *
 * Seuls les MESSAGES changent d'une langue à l'autre ; les règles (longueurs,
 * format, honeypot) sont les mêmes partout — c'est ce qui garantit que ce que le
 * formulaire accepte, la route l'accepte aussi.
 */
export function createContactSchema(messages: ContactMessages = CONTACT_MESSAGES_FR) {
  return z.object({
    email: z.string().trim().min(1, messages.emailRequired).max(200).email(messages.emailInvalid),
    message: z.string().trim().min(1, messages.messageRequired).max(5000),
    /**
     * Optionnel : uniquement si la demande concerne une commande. Ni saut de
     * ligne ni tabulation : la valeur part dans le SUJET de l'email — on ne
     * confie pas à l'API d'envoi le soin de neutraliser un en-tête forgé.
     */
    orderNumber: z
      .string()
      .trim()
      .max(100)
      .regex(/^[^\r\n\t]*$/, messages.orderNumberInvalid)
      .optional(),
    // Honeypot anti-spam : champ caché qui doit rester vide (les bots le remplissent).
    website: z.string().max(200).optional(),
  })
}

/** Le schéma en français — celui de la route API. */
export const contactSchema = createContactSchema()

export type ContactInput = z.infer<typeof contactSchema>
