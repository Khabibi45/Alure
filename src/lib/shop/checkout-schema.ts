import { z } from 'zod'
import { PACK_IDS } from './product'
import { LOCALES } from '@/lib/i18n/paths'

/** Taille maximale du corps de /api/checkout — le payload légitime fait ~40 octets. */
export const CHECKOUT_MAX_BYTES = 1_000

const packIds = [...PACK_IDS] as [string, ...string[]]
const localeIds = [...LOCALES] as [string, ...string[]]

/**
 * Schéma de la demande de checkout. PARTAGÉ route API / îlot client (une seule
 * source de vérité). Il valide la FORME ; la disponibilité réelle du pack se
 * vérifie ensuite via `orderableError()`.
 *
 * Il n'y a plus qu'un champ à choisir. Depuis le 2026-09-04, on ne vend plus de
 * leurre à l'unité mais des PACKS, et un pack n'a rien à composer : celui de
 * leurres contient une unité de chaque coloris. Les champs `coloris`, `offre` et
 * `cadeau` ont disparu avec l'offre « 3 achetés, le 4e offert ».
 */
const checkoutFields = z.object({
  pack: z.enum(packIds, { message: 'Choisissez un pack.' }),
  /**
   * La langue dans laquelle le client achète. Elle décide de la langue de la
   * page Stripe Checkout ET des pages de retour : sans elle, un acheteur
   * anglophone terminait son parcours sur un écran de paiement français.
   *
   * Optionnelle et repliée sur le français côté serveur : une commande envoyée
   * sans ce champ (onglet ouvert avant la mise à jour) reste valide plutôt que
   * d'échouer au paiement.
   */
  langue: z.enum(localeIds).optional(),
})

export const checkoutSchema = checkoutFields

export type CheckoutInput = z.infer<typeof checkoutSchema>

/**
 * Présélection portée par l'URL de la page produit (`/leurre?pack=…`, posée par
 * l'accueil). Validée contre le schéma partagé : une valeur inconnue retombe sur
 * le défaut, sans erreur — une URL bricolée n'est pas une faute du visiteur.
 */
export function parsePreselection(params: Record<string, string | string[] | undefined>): {
  pack?: string
} {
  const pack = checkoutFields.shape.pack.safeParse(params.pack)
  return pack.success ? { pack: pack.data } : {}
}
