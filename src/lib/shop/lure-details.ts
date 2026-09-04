import { PRODUCT, type Colorway } from './product'

/**
 * Les cinq détails du leurre montrés en gros plan sur la page produit.
 *
 * L'ordre EST celui de la page : on descend le long du leurre, de la tête à la
 * palette. Ce n'est pas un détail de présentation — c'est ce qui rend la
 * section lisible sans lire les titres.
 *
 * Les images sont recadrées dans les planches « toutes vues » fournies par
 * Camil (`assets/jpeg leurre souple/*allviews.jpg`), une planche par leurre,
 * même grille de huit vues sur les quatre. Jamais publiées telles quelles : ce
 * sont des sources internes, et seuls les recadrages WebP partent dans
 * `public/`.
 */
export const LURE_DETAIL_IDS = ['yeux', 'paillettes', 'barrette', 'queue', 'palette'] as const

export type LureDetailId = (typeof LURE_DETAIL_IDS)[number]

/**
 * Les leurres qui ont des photos — c'est-à-dire tout le catalogue. Le noir en
 * fait partie depuis qu'il a cessé d'être un collector (2026-09-04) : le pack
 * contient une unité de chacun, ils se montrent donc tous de la même façon.
 */
export const PHOTOGRAPHED_LURES: readonly Pick<Colorway, 'id' | 'label' | 'image' | 'photoSlug'>[] =
  PRODUCT.colorways

/**
 * Le chemin d'un gros plan, construit depuis le slug du coloris — la seule
 * façon d'avoir vingt fichiers sans écrire vingt chemins à la main.
 *
 * Rien ici ne vérifie que le fichier existe : c'est le rôle de
 * `lure-details.test.ts`, qui les cherche tous sur le disque. Un `next/image`
 * qui pointe dans le vide ne lève rien — il laisse un trou dans la page.
 */
export function lureDetailPhotoSrc(photoSlug: string, detail: LureDetailId): string {
  return `/produit/details/${photoSlug}-${detail}.webp`
}

/** Le chemin de la photo principale d'un coloris. Même règle, même slug. */
export function lurePhotoSrc(photoSlug: string): string {
  return `/produit/leurre-${photoSlug}.webp`
}
