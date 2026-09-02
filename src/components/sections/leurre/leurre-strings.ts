import type { LureViewId } from '@/lib/three/lure-views'
import type { OfferId } from '@/lib/shop/product'
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
 * 2. **Ce qui dépend de l'offre choisie arrive en `Record<OfferId, …>`** : le
 *    palier est un état CLIENT (radio), le serveur ne peut pas le connaître — il
 *    prépare donc les deux valeurs, et le composant lit la bonne. Jamais de
 *    calcul de montant côté client.
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
  /* ── Le visuel 3D ── */
  readonly viewerLoading: string
  readonly viewerNoWebgl: string
  /** Gabarit `{coloris}` — l'équivalent textuel du canvas, qui est `aria-hidden`. */
  readonly viewerAlt: string

  /* ── Le prix, par palier ── */
  /** Le total de l'offre, formaté : « 21,99 € » / « 65,97 € » — « €21.99 » en anglais. */
  readonly total: Record<OfferId, string>
  /** La ligne sous le prix : port et TVA, plus la règle de l'offre groupée. */
  readonly tagline: Record<OfferId, string>
  /**
   * L'économie annoncée, phrase complète — `null` quand il n'y en a pas.
   * C'est le serveur qui tranche : une économie nulle ne s'affiche pas, et
   * aucun composant n'a de raison de savoir la calculer (règle n°6 : jamais de
   * chiffre fabriqué dans l'UI).
   */
  readonly savings: Record<OfferId, string | null>

  /* ── Le sélecteur de coloris ── */
  readonly colorwayLabel: string
  readonly soldOut: string

  /* ── Le 4e leurre offert, au choix ── */
  readonly giftLabel: string
  /** Gabarit `{coloris}` — le nom accessible d'un coloris pris en double. */
  readonly giftDuplicateA11y: string
  /** Gabarit `{collector}`. */
  readonly giftCollectorA11y: string

  /* ── Le sélecteur d'offre ── */
  readonly offerLegend: string
  readonly offerTitle: Record<OfferId, string>
  /** Gabarits `{coloris}` (solo) et `{nbColoris}` `{collector}` (collection). */
  readonly offerDetail: Record<OfferId, string>
  /** « Soit 21,99 € le leurre. » / « Soit moins de 17,00 € le leurre. » — résolu. */
  readonly perLure: Record<OfferId, string>

  /* ── La progression en quatre points ── */
  readonly progressFirst: string
  readonly progressSecond: string
  readonly progressThird: string
  /** Gabarit `{collector}`. */
  readonly progressCollector: string
  readonly progressCollectorDone: string
  readonly progressCollectorTodo: string
  readonly progressLockedA11y: string
  /** Le prix d'un leurre seul, formaté — le pas de chaque palier de la progression. */
  readonly soloPrice: string

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
  readonly errorColorwayUnknown: string
  readonly errorColorwaySoldOut: string
  readonly errorRateLimited: string
  readonly errorPaymentUnavailable: string
  readonly errorPaymentFailed: string
  readonly errorPaymentBadResponse: string
  readonly errorPaymentOffline: string
}
