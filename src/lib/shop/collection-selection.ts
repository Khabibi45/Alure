/**
 * Le panier de l'accueil : les coloris ajoutés depuis le carrousel 3D.
 *
 * ── LA RÈGLE, ET POURQUOI ELLE A CHANGÉ (2026-08-25) ───────────────────────
 *
 * Le panier est un ENSEMBLE de coloris DISTINCTS. Un coloris y est, ou il n'y
 * est pas. Jamais deux fois le même, jamais plus de `colorwayCount`.
 *
 * Jusqu'ici c'était un COMPTEUR qui acceptait les doublons. Ça mentait sur le
 * colis : l'offre groupée expédie « les 3 coloris » par construction
 * (`OFFERS.collection.colorwayCount`, et `offerSummary` l'écrit noir sur blanc
 * dans l'email client ET dans la notification fournisseur). Un visiteur pouvait
 * donc composer trois fois Truite arc-en-ciel, lire « 3 achetés, votre 4e est
 * offert », payer 65,97 € et recevoir Truite + Perche + Orange feu. L'écart se
 * découvrait à l'ouverture du colis, donc en litige — et un litige gèle un
 * compte Stripe. La permission qu'on retire était la permission de mentir sur
 * le contenu du colis.
 *
 * Le désir d'un coloris en double n'est pas nié : il est déplacé là où il est
 * vrai — le 4e leurre OFFERT, qui se choisit sur la page produit et peut être
 * un doublon (`GIFT_CHOICE_IDS`).
 *
 * Bénéfice structurel : la cardinalité devient une propriété du domaine. Un
 * état illégal (4 coloris, un doublon) n'est plus surveillé, il est
 * irreprésentable.
 */
import { OFFERS, PRODUCT, getColorway, orderableError, type OfferId } from './product'

/** Clé sessionStorage — la sélection survit à l'aller-retour vers /leurre. */
export const SELECTION_STORAGE_KEY = 'alure-collection-selection'

export type ResolvedOffer = { offre: OfferId; coloris: string }

/** Le nombre de coloris que l'offre groupée fait payer — le plafond du panier. */
export const CART_MAX = OFFERS.collection.colorwayCount

/**
 * Ne garde que des identifiants de coloris connus, DÉDOUBLONNÉS, dans l'ordre
 * d'ajout, et bornés à `CART_MAX`. Une donnée qui revient du stockage navigateur
 * est une entrée externe : elle se revalide entièrement.
 */
export function sanitizeSelection(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const known = new Set(PRODUCT.colorways.map((c) => c.id))
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of raw) {
    if (typeof value !== 'string' || !known.has(value) || seen.has(value)) continue
    seen.add(value)
    out.push(value)
    if (out.length === CART_MAX) break
  }
  return out
}

/** Le coloris est-il déjà au panier ? */
export function isInCart(selection: readonly string[], colorwayId: string): boolean {
  return selection.includes(colorwayId)
}

/** Le panier est-il plein (tous les coloris payés sont dedans) ? */
export function isCartFull(selection: readonly string[]): boolean {
  return selection.length >= CART_MAX
}

/**
 * Ajoute ou retire un coloris — l'unique mutation du panier.
 *
 * Un seul point d'entrée plutôt qu'un `add` et un `remove` : c'est ce qui rend
 * le bouton unique de l'interface (« Ajouter X » / « Retirer X ») fidèle à
 * l'état, sans qu'un appelant puisse ajouter deux fois le même.
 * Ajouter un coloris absent alors que le panier est plein ne fait RIEN — c'est
 * à l'interface de ne pas proposer l'action, pas au domaine de déborder.
 */
export function toggleColorway(selection: readonly string[], colorwayId: string): string[] {
  if (!getColorway(colorwayId)) return [...selection]
  if (selection.includes(colorwayId)) return selection.filter((id) => id !== colorwayId)
  if (selection.length >= CART_MAX) return [...selection]
  return [...selection, colorwayId]
}

/**
 * L'offre réelle vers laquelle la sélection résout — `null` si le panier est
 * vide. À `CART_MAX` coloris, c'est l'offre complète (le 4e se choisit sur la
 * page produit). En dessous, c'est le solo du PREMIER ajouté : le coloris
 * retourné présélectionne la page produit, il n'entre dans aucun montant.
 */
export function resolveOffer(selection: readonly string[]): ResolvedOffer | null {
  const first = selection[0]
  if (first === undefined) return null
  if (selection.length >= CART_MAX) return { offre: 'collection', coloris: first }
  return { offre: 'solo', coloris: first }
}

/** Le 4e leurre offert est-il débloqué ? Dès que les coloris payés y sont tous. */
export function freebiesUnlocked(selection: readonly string[]): boolean {
  return selection.length >= CART_MAX
}

/**
 * L'offre groupée est-elle seulement composable aujourd'hui ?
 *
 * Elle expédie LES coloris du catalogue : si l'un d'eux est épuisé, le colis ne
 * peut pas être formé, et l'offre se ferme. Encaisser 65,97 € en promettant un
 * colis qu'on ne peut pas composer, c'est le litige garanti — donc on préfère
 * fermer et le dire. Les autres coloris restent commandables à l'unité.
 */
export function collectionAvailable(): boolean {
  return PRODUCT.colorways.every((c) => orderableError(c.id) === null)
}

/* ─────────────── L'état d'affichage du panier (une seule source) ─────────────── */

/** L'état d'une case de la rangée, tel qu'il s'affiche. */
export type CartBoxState = 'libre' | 'au-panier' | 'epuise'

export function cartBoxState(selection: readonly string[], colorwayId: string): CartBoxState {
  if (orderableError(colorwayId) !== null) return 'epuise'
  return selection.includes(colorwayId) ? 'au-panier' : 'libre'
}

/** L'état de la 4e case — celle du leurre offert, qui ne se paie jamais. */
export type GiftBoxState = 'offert' | 'a-choisir' | 'suspendu'

export function giftBoxState(selection: readonly string[]): GiftBoxState {
  if (!collectionAvailable()) return 'suspendu'
  return freebiesUnlocked(selection) ? 'a-choisir' : 'offert'
}

/**
 * Quelle phrase d'état afficher, et avec quoi la remplir. Retourne une CLÉ de
 * dictionnaire, jamais un texte : la phrase se traduit (règle Alure n°6), et
 * c'est la couche i18n qui la rend.
 */
export type CartStatus = {
  readonly key: string
  /** Les libellés des coloris au panier, dans l'ordre d'ajout. */
  readonly labels: readonly string[]
}

export function cartStatus(selection: readonly string[]): CartStatus {
  const labels = selection
    .map((id) => getColorway(id)?.label)
    .filter((label): label is string => label !== undefined)

  if (!collectionAvailable()) return { key: 'CART.STATE_SOLD_OUT', labels }
  if (labels.length === 0) return { key: 'CART.STATE_EMPTY', labels }
  if (labels.length >= CART_MAX) return { key: 'CART.STATE_FULL', labels }
  return { key: labels.length === 1 ? 'CART.STATE_ONE' : 'CART.STATE_SOME', labels }
}
