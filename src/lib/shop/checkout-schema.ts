import { z } from 'zod'
import { PRODUCT, OFFER_IDS } from './product'

/** Taille maximale du corps de /api/checkout — le payload légitime fait ~60 octets. */
export const CHECKOUT_MAX_BYTES = 1_000

const colorwayIds = PRODUCT.colorways.map((c) => c.id) as [string, ...string[]]
const offerIds = OFFER_IDS as [string, ...string[]]

/**
 * Schéma de la demande de checkout. PARTAGÉ route API / îlot client (une seule
 * source de vérité). Il valide la FORME ; la disponibilité réelle du coloris se
 * vérifie ensuite via orderableError() (elle change à la main, hors schéma).
 */
export const checkoutSchema = z.object({
  // Le coloris compte même en collection : c'est celui que la page produit montrait
  // au moment du clic, et il aide au service après-vente.
  coloris: z.enum(colorwayIds, { message: 'Choisissez un coloris.' }),
  offre: z.enum(offerIds, { message: 'Choisissez une offre.' }),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
