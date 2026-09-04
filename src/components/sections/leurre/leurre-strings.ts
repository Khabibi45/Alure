import type { LureViewId } from '@/lib/three/lure-views'
import type { PackId } from '@/lib/shop/product'
import type { LureDetailId } from '@/lib/shop/lure-details'

/**
 * TOUS les textes de la page produit, tels qu'ils traversent la frontière
 * serveur → client.
 *
 * Même contrat que `CarouselStrings` (accueil), pour la même raison : les îlots
 * de /leurre sont `'use client'`, et un composant client ne peut pas appeler
 * `getDictionary` — cela embarquerait les DEUX dictionnaires entiers dans le
 * bundle navigateur (CLAUDE.md, règle Alure n°6). Le serveur prépare, le client
 * reçoit en prop.
 *
 * Trois conventions, à tenir en ajoutant un champ :
 *
 * 1. **Les montants sont déjà formatés à la langue servie** :
 *    `formatEuros(cents, locale)`. C'était la fuite la plus visible de la page
 *    anglaise — le prix principal y affichait « 21,99 € » au lieu de « €21.99 ».
 *    Aucun composant ne reformate un montant.
 * 2. **Ce qui dépend du pack choisi arrive en `Record<PackId, …>`** : le pack
 *    est un état CLIENT (radio), le serveur ne peut pas le connaître — il
 *    prépare donc les deux, et le composant lit le bon. Jamais de calcul de
 *    montant côté client.
 * 3. **Ce qui contient un NOM PROPRE arrive en gabarit BRUT** (`{coloris}`,
 *    `{collector}`). Les noms du catalogue restent en français dans les deux
 *    langues — ils doivent correspondre au reçu Stripe et à l'email — et ils se
 *    rendent avec `fillNodes()`, qui isole le nom dans un `translate="no"`.
 *    `fill()` (qui rend une chaîne) ne le permettrait pas.
 */
/** Une image et son équivalent textuel, résolus pour UN leurre. */
export type LurePhoto = {
  readonly src: string
  readonly alt: string
}

/**
 * Un des cinq blocs de « Ce qu'il y a dans le leurre » : son texte, et le gros
 * plan correspondant POUR CHAQUE leurre.
 *
 * Les photos arrivent toutes préparées, indexées par identifiant de coloris,
 * pour la même raison que les prix par palier : le coloris regardé est un état
 * CLIENT (radio), le serveur ne peut pas le connaître. Il prépare donc les
 * quatre, et le composant lit la bonne. L'`alt` est RÉSOLU (le nom du coloris
 * déjà dedans) et non laissé en gabarit : un attribut `alt` est une chaîne, il
 * ne peut pas passer par `fillNodes()`.
 */
export type LureDetailBlock = {
  readonly id: LureDetailId
  readonly title: string
  readonly body: string
  readonly photos: Readonly<Record<string, LurePhoto>>
}

/** Ce qu'un pack affiche : son nom, son contenu, son prix, et le prix à la pièce. */
export type PackStrings = {
  readonly title: string
  /** Ce qu'il y a dedans, en une ligne — « Une unité de chaque coloris ». */
  readonly contents: string
  /** Le prix du pack, formaté à la langue. */
  readonly price: string
  /** « Soit moins de 2,80 € le leurre. » — `null` quand la division ne tombe pas juste. */
  readonly perUnit: string | null
}

export type LeurreStrings = {
  /* ── La visionneuse 3D orientable ── */
  /** Le nom du groupe manipulable, pour les lecteurs d'écran. */
  /** Le bandeau de livraison : « Livraison 3 à 5 jours ouvrés » et son détail. */
  readonly deliveryBannerTitle: string
  readonly deliveryBannerBody: string

  readonly viewerLabel: string
  /** L'indice discret sous le leurre : comment on le fait tourner. */
  readonly viewerHint: string
  /** Ce qu'on annonce quand l'angle n'est plus une vue nommée. */
  readonly viewerFree: string
  /** Le libellé du groupe des six angles. */
  readonly viewsLabel: string
  /** Le nom de chaque angle, et sa description pour les lecteurs d'écran. */
  readonly views: Readonly<Record<LureViewId, string>>
  readonly viewDescriptions: Readonly<Record<LureViewId, string>>
  /**
   * « Livraison France métropolitaine uniquement », affiché AVANT tout bouton
   * d'achat, dans les DEUX langues (règle Alure n°1). Le checkout n'accepte que
   * le code pays `FR` : la Belgique, la Suisse et les DOM-TOM sont refusés au
   * formulaire d'adresse, donc après que le client a décidé d'acheter.
   */
  readonly shippingNoticeTitle: string
  readonly shippingNoticeBody: string
  /* ── Le sélecteur photo / 3D ── */
  readonly mediaLabel: string
  readonly mediaPhoto: string
  readonly mediaModel: string

  /* ── Le visuel 3D ── */
  readonly viewerLoading: string
  readonly viewerNoWebgl: string
  /** Gabarit `{coloris}` — l'équivalent textuel du canvas, qui est `aria-hidden`. */
  readonly viewerAlt: string

  /* ── Les deux packs ── */
  /** Le libellé du groupe de choix — « Votre pack ». */
  readonly packLegend: string
  /**
   * Tout ce qu'un pack affiche, préparé POUR LES DEUX : le pack choisi est un
   * état client (radio), et aucun montant ne se calcule côté navigateur. Les
   * prix arrivent déjà ponctués à la langue servie — sans quoi `/en/leurre`
   * afficherait « 10,99 € » sur l'écran qui doit être le plus limpide.
   */
  readonly packs: Readonly<Record<PackId, PackStrings>>
  /** « + 3,60 € de livraison (Lettre Verte suivie) » — elle n'est plus incluse. */
  readonly shippingLine: string

  /* ── Le sélecteur de coloris (informatif : le pack les contient tous) ── */
  readonly colorwayLabel: string
  readonly soldOut: string

  /* ── Le bouton d'achat et la barre collante mobile ── */
  readonly buy: string
  readonly buyLoading: string
  readonly buyLoadingShort: string
  /** « Livraison 3 à 5 jours ouvrés » — délai pris à `PRODUCT.DELAY_VALUE`. */
  readonly deliveryShort: string

  /* ── Les moyens de paiement ── */
  readonly paymentCard: string
  readonly paymentPaypal: string
  readonly paymentSafety: string

  /* ── Les photos, par leurre (clé = id du coloris, ou du collector) ── */
  /** La photo principale, celle qui ouvre la page produit. */
  readonly photos: Readonly<Record<string, LurePhoto>>

  /* ── « Ce qu'il y a dans le leurre » ── */
  readonly detailsTitle: string
  readonly detailsIntro: string
  /** Les cinq blocs, dans l'ordre de la page : de la tête à la palette. */
  readonly details: readonly LureDetailBlock[]

  /* ── Les échecs du passage en caisse ── */
  readonly errorFormInvalid: string
  readonly errorPackUnknown: string
  readonly errorPackSoldOut: string
  readonly errorRateLimited: string
  readonly errorPaymentUnavailable: string
  readonly errorPaymentFailed: string
  readonly errorPaymentBadResponse: string
  readonly errorPaymentOffline: string
}
