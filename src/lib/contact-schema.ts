import { z } from 'zod'

/** Taille maximale acceptée pour le corps de la requête /api/contact (anti-abus). */
export const CONTACT_MAX_BYTES = 20_000

/**
 * Schéma de validation du formulaire de contact.
 * PARTAGÉ entre la route API (serveur) et le formulaire (resolver react-hook-form) :
 * une seule source de vérité — un champ ajouté = un seul endroit à modifier.
 * Les clés inconnues sont retirées par zod : l'API ne relaie jamais du JSON arbitraire.
 *
 * Minimisation RGPD (cadrage 2026-08-05) : email + message + n° de commande
 * optionnel. Pas de champ nom — répondre ne l'exige pas.
 */
export const contactSchema = z.object({
  email: z.string().trim().min(1, 'Votre email est requis').max(200).email('Email invalide'),
  message: z.string().trim().min(1, 'Décrivez votre demande').max(5000),
  /**
   * Optionnel : uniquement si la demande concerne une commande. Ni saut de
   * ligne ni tabulation : la valeur part dans le SUJET de l'email — on ne
   * confie pas à l'API d'envoi le soin de neutraliser un en-tête forgé.
   */
  orderNumber: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^\r\n\t]*$/, 'Numéro de commande invalide')
    .optional(),
  // Honeypot anti-spam : champ caché qui doit rester vide (les bots le remplissent).
  website: z.string().max(200).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
