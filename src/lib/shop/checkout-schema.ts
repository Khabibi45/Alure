import { z } from 'zod'
import { GIFT_CHOICE_IDS, PRODUCT, OFFER_IDS, orderableError, type OfferId } from './product'
import { LOCALES } from '@/lib/i18n/paths'

/** Taille maximale du corps de /api/checkout — le payload légitime fait ~60 octets. */
export const CHECKOUT_MAX_BYTES = 1_000

const colorwayIds = PRODUCT.colorways.map((c) => c.id) as [string, ...string[]]
const offerIds = OFFER_IDS as [string, ...string[]]
const giftIds = [...GIFT_CHOICE_IDS] as [string, ...string[]]
const localeIds = [...LOCALES] as [string, ...string[]]

/**
 * Schéma de la demande de checkout. PARTAGÉ route API / îlot client (une seule
 * source de vérité). Il valide la FORME ; la disponibilité réelle du coloris
 * (et du cadeau) se vérifie ensuite via orderableError()/giftOrderableError().
 *
 * `cadeau` : le 4e leurre OFFERT, choisi par l'acheteur — obligatoire avec
 * l'offre « 3 achetés, le 4e offert », sans objet en solo.
 */
// L'objet nu reste accessible : `parsePreselection` valide champ par champ.
const checkoutFields = z.object({
  // Le coloris compte même en offre groupée : c'est celui que la page produit
  // montrait au moment du clic, et il aide au service après-vente.
  coloris: z.enum(colorwayIds, { message: 'Choisissez un coloris.' }),
  offre: z.enum(offerIds, { message: 'Choisissez une offre.' }),
  cadeau: z.enum(giftIds, { message: 'Choisissez votre 4e leurre offert.' }).optional(),
  /**
   * La langue dans laquelle le client achète. Elle décide de la langue de la
   * page Stripe Checkout ET des pages de retour : sans elle, un acheteur
   * anglophone terminait son parcours sur un écran de paiement français, puis
   * sur une page de remerciement française.
   *
   * Optionnelle et repliée sur le français côté serveur : une commande envoyée
   * sans ce champ (onglet ouvert avant la mise à jour) reste valide plutôt que
   * d'échouer au paiement.
   */
  langue: z.enum(localeIds).optional(),
})

export const checkoutSchema = checkoutFields.superRefine((data, ctx) => {
  if (data.offre === 'collection' && data.cadeau === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['cadeau'],
      message: 'Choisissez votre 4e leurre offert.',
    })
  }
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

/**
 * Présélection portée par l'URL de la page produit (`/leurre?offre=…&coloris=…`,
 * posée par la frise de l'accueil). Chaque champ est validé SEUL contre le
 * schéma partagé : une valeur inconnue ou un coloris épuisé retombe sur le
 * défaut, sans erreur — une URL bricolée n'est pas une faute du visiteur.
 */
export function parsePreselection(params: Record<string, string | string[] | undefined>): {
  coloris?: string
  offre?: OfferId
} {
  const coloris = checkoutFields.shape.coloris.safeParse(params.coloris)
  const offreRaw = checkoutFields.shape.offre.safeParse(params.offre)
  // Le safeParse garantit l'appartenance ; le find rend le type OfferId sans cast.
  const offre = offreRaw.success ? OFFER_IDS.find((id) => id === offreRaw.data) : undefined
  return {
    ...(coloris.success && orderableError(coloris.data) === null ? { coloris: coloris.data } : {}),
    ...(offre ? { offre } : {}),
  }
}
