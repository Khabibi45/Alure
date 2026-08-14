/**
 * La sélection « panier » de l'accueil : les coloris ajoutés depuis le carrousel 3D.
 *
 * Ce n'est PAS un panier à quantités — l'offre reste binaire (solo / « 3 achetés,
 * le 4e offert au choix », spec `offre-collection.md`). La sélection ne fait que
 * résoudre vers l'une des deux offres réelles : 1 leurre → solo ; 3 → l'offre
 * complète (le 4e se choisit sur la page produit). Il n'existe pas d'offre à
 * 2 leurres — la frise pousse le 3e, jamais une commande approximative.
 */
import { OFFERS, PRODUCT, type OfferId } from './product'

/** Clé sessionStorage — la sélection survit à l'aller-retour vers /leurre. */
export const SELECTION_STORAGE_KEY = 'alure-collection-selection'

export type ResolvedOffer = { offre: OfferId; coloris: string }

/**
 * Ne garde que des identifiants de coloris connus. Une donnée qui revient du
 * stockage navigateur est une entrée externe : elle se revalide.
 *
 * Les DOUBLONS sont légitimes (itération Camil 2026-08-13 : « un leurre
 * quelconque à chaque fois suffit ») — le panier est un COMPTEUR, pas une
 * collection de coloris distincts. On borne au nombre d'achetés utile
 * (`paidCount`) : au-delà de 2, rien ne change ni au prix ni au colis.
 */
export function sanitizeSelection(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const known = new Set(PRODUCT.colorways.map((c) => c.id))
  return raw
    .filter((id): id is string => typeof id === 'string' && known.has(id))
    .slice(0, OFFERS.collection.paidCount)
}

/**
 * L'offre réelle vers laquelle la sélection résout — `null` si rien n'est choisi.
 * Dès `paidCount` leurres (3 achetés), la résolution est l'offre complète : le
 * 4e se choisit sur la page produit. En dessous, c'est le solo du PREMIER
 * ajouté — le coloris retourné présélectionne la page produit, il n'entre dans
 * aucun montant.
 */
export function resolveOffer(selection: readonly string[]): ResolvedOffer | null {
  const first = selection[0]
  if (first === undefined) return null
  if (selection.length >= OFFERS.collection.paidCount) {
    return { offre: 'collection', coloris: first }
  }
  return { offre: 'solo', coloris: first }
}

/**
 * Les 2 offerts sont-ils débloqués ? Dès `paidCount` leurres au panier
 * (2 achetés), le reste du colis est offert — le seuil vient de l'offre,
 * jamais d'un chiffre local.
 */
export function freebiesUnlocked(selection: readonly string[]): boolean {
  return selection.length >= OFFERS.collection.paidCount
}
