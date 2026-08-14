/**
 * LA source de vérité produit (règle Alure n°2 : toute la logique commande vit
 * dans src/lib/shop/ — c'est le seul module à rebrancher si migration Shopify).
 *
 * Prix en CENTIMES partout : l'euro flottant produit des erreurs d'arrondi.
 * Décisions : 3 coloris, quantité 1 à 5, port inclus (France uniquement).
 * Offre à DEUX PALIERS (Solo / Collection) — cf. docs/specs/offre-collection.md.
 * `quantite` n'existe plus : on ne prend plus n fois le même leurre, on prend UN
 * coloris ou LA collection. Un champ qui ne veut plus rien dire finit mal interprété.
 *
 * Il n'y a volontairement PAS de `unitAmountCents` : avec un barème dégressif, un
 * « prix unitaire » n'existe plus. En exposer un inviterait à écrire
 * `unitAmountCents × quantité`, qui donnerait un montant faux EN SILENCE — exactement
 * la classe de bug que le principe n°1 interdit. Un seul chemin : `totalCents()`.
 */

export type Colorway = {
  id: string
  /** Nom affiché (site, Stripe, emails). */
  label: string
  /** Passé à false à la main en cas de rupture : affiché « Épuisé », non commandable. */
  available: boolean
  /** Visuel produit (rendu 3D maison, `public/produit/`) — jamais une image fournisseur. */
  image: string
}

export const PRODUCT = {
  id: 'alure-leurre-v1',
  name: 'Leurre Alure — articulé 2 sections',
  /**
   * Prix à l'unité, port inclus. TVA non applicable, art. 293 B du CGI.
   * « Chaque leurre à l'unité ; 3 achetés, le 4e offert au choix » — la règle
   * tient en une phrase, et c'est cette phrase-là qui s'affiche au client.
   */
  pricing: {
    /** Le prix d'un leurre seul. C'est LA référence de tous les autres montants. */
    soloCents: 2199,
  },
  currency: 'eur' as const,
  /**
   * Les noms des coloris décrivent la ROBE du leurre — vérifiée sur nos rendus
   * 3D (2026-08-08), jamais inventée :
   *   Truite arc-en-ciel : dos jaune-olive, flanc blanc barré de rose.
   *   Perche : dos vert olive marbré, flanc jaune moucheté. (PAS « brochet » :
   *   la robe est une livrée de perche, et VISION.md interdit de revendiquer le
   *   brochet où que ce soit — un 6,5 cm est un leurre de bass et de perche.)
   *   Orange feu : corps orange vif, ventre plus clair.
   * Le coloris façon Pikachu du fournisseur reste exclu (contrefaçon).
   */
  colorways: [
    {
      id: 'coloris-1',
      label: 'Truite arc-en-ciel',
      available: true,
      image: '/produit/leurre-truite.webp',
    },
    { id: 'coloris-2', label: 'Perche', available: true, image: '/produit/leurre-perche.webp' },
    {
      id: 'coloris-3',
      label: 'Orange feu',
      available: true,
      image: '/produit/leurre-orange.webp',
    },
  ] satisfies Colorway[],
  /**
   * Le leurre collector : jamais vendu seul — il se CHOISIT comme 4e leurre
   * offert (offre « 3 achetés, le 4e offert au choix », 2026-08-14). Il n'entre
   * dans aucun calcul de montant. C'est ce qui lui donne sa valeur : on ne peut
   * pas l'acheter. Renommé « Pirate » le 2026-08-12 (décision Camil) — le nom
   * se propage partout d'ici : site, reçus Stripe, emails, dictionnaires
   * ({collector}). L'`id` sert au champ `cadeau` du checkout.
   */
  collector: {
    id: 'pirate',
    label: 'Pirate',
  },
  /**
   * Dimensions réelles du leurre, confirmées par Camil le 2026-08-06 (le journal
   * les portait jusque-là en « à mesurer »). Source unique : toute mention de
   * taille ou de poids sur le site en découle, jamais un chiffre réécrit à la main.
   */
  specs: {
    lengthCm: 6.5,
    weightGrams: 6.5,
  },
  /** Délai annoncé partout AVANT l'achat (règle Alure n°1) — jamais atténué. */
  deliveryDelay: '10 à 20 jours ouvrés',
} as const

/** La convention décimale de chaque langue servie (multilingue, docs/i18n/). */
const NUMBER_LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  de: 'de-DE',
  nl: 'nl-NL',
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(NUMBER_LOCALES[locale] ?? 'fr-FR').format(value)
}

/** « 6,5 cm » — virgule décimale française par défaut, point en anglais, etc. */
export function formatLength(locale: string = 'fr'): string {
  return `${formatNumber(PRODUCT.specs.lengthCm, locale)} cm`
}

/** « 6,5 g ». */
export function formatWeight(locale: string = 'fr'): string {
  return `${formatNumber(PRODUCT.specs.weightGrams, locale)} g`
}

/** « 6,5 cm · 6,5 g » — la forme courte affichée à côté du produit. */
export function formatSpecs(locale: string = 'fr'): string {
  return `${formatLength(locale)} · ${formatWeight(locale)}`
}

export function getColorway(id: string): Colorway | undefined {
  return PRODUCT.colorways.find((c) => c.id === id)
}

/* ────────────────────────── L'offre à deux paliers ────────────────────────── */

export type OfferId = 'solo' | 'collection'

export type Offer = {
  readonly id: OfferId
  /** Libellé affiché (sélecteur d'offre, récapitulatifs). */
  readonly label: string
  /** Nombre de coloris VENDUS (le cadeau n'en fait pas partie). */
  readonly colorwayCount: number
  readonly amountCents: number
  /** Nombre de leurres PAYÉS, au prix de l'unité. */
  readonly paidCount: number
  /** Nombre de leurres OFFERTS — au choix de l'acheteur (champ `cadeau`). */
  readonly giftCount: number
}

/**
 * Deux paliers, pas trois : un choix binaire se décide, une liste de cinq prix se
 * calcule. Chaque leurre se vend À L'UNITÉ (le solo) ; le palier 2 est
 * « 3 ACHETÉS, LE 4e OFFERT AU CHOIX » (offre Camil 2026-08-14) : on paie trois
 * leurres au prix de l'unité, et l'acheteur CHOISIT son 4e — un coloris en
 * double ou le Pirate. Le montant est exactement 3 × l'unité.
 */
export const OFFERS = {
  solo: {
    id: 'solo',
    label: 'Un leurre',
    colorwayCount: 1,
    amountCents: PRODUCT.pricing.soloCents,
    paidCount: 1,
    giftCount: 0,
  },
  collection: {
    id: 'collection',
    label: '3 achetés, le 4e offert',
    colorwayCount: PRODUCT.colorways.length,
    // « 3 achetés » : on paie trois leurres à l'unité — jamais un prix recalculé.
    amountCents: PRODUCT.pricing.soloCents * 3,
    paidCount: 3,
    giftCount: 1,
  },
} as const satisfies Record<OfferId, Offer>

/**
 * La ligne sous le prix — par palier, jamais commune : afficher l'argument de la
 * collection sous le total d'un leurre seul décrirait une offre que le montant
 * ne reflète pas.
 */
export function priceTagline(offerId: string): string {
  assertOffer(offerId)
  return offerId === 'collection'
    ? '3 leurres achetés, le 4e offert au choix · port inclus · TVA non applicable, art. 293 B du CGI.'
    : 'Port inclus · TVA non applicable, art. 293 B du CGI.'
}

/** « Livraison 10 à 20 jours ouvrés » — LA formulation courte, dérivée de la source unique. */
export function deliveryShort(): string {
  return `Livraison ${PRODUCT.deliveryDelay}`
}

/** « 3 coloris + 1 collector · 2 sections » — le résumé vrai de la gamme. */
export function lineupSummary(): string {
  return `${PRODUCT.colorways.length} coloris + 1 collector · 2 sections`
}

export const OFFER_IDS = Object.keys(OFFERS) as OfferId[]

function assertOffer(id: string): asserts id is OfferId {
  if (!(id in OFFERS)) throw new Error(`Offre inconnue : ${id}`)
}

export function getOffer(id: OfferId): Offer {
  return OFFERS[id]
}

/** Total d'une commande en centimes — l'unique endroit où un montant se calcule. */
export function totalCents(offerId: string): number {
  assertOffer(offerId)
  return OFFERS[offerId].amountCents
}

/**
 * L'économie, calculée contre le prix RÉELLEMENT pratiqué d'un leurre seul
 * (21,99 € × le nombre de coloris). Jamais contre un prix de référence gonflé :
 * ce serait une pratique commerciale trompeuse, pas une astuce de conversion.
 * Le collector n'entre pas dans le calcul — il n'a pas de prix, il ne se vend pas.
 */
export function savingsCents(offerId: string): number {
  assertOffer(offerId)
  const offer = OFFERS[offerId]
  return PRODUCT.pricing.soloCents * offer.colorwayCount - offer.amountCents
}

/**
 * Le prix par leurre, **cadeau compris**. C'est LE chiffre qui fait décider.
 * Retourne `null` si la division n'est pas exacte — on n'affiche jamais un prix
 * arrondi qui, remultiplié, ne redonne pas le total (principe n°1).
 */
export function perLureCents(offerId: string): number | null {
  assertOffer(offerId)
  const offer = OFFERS[offerId]
  const lures = luresReceived(offerId)
  return offer.amountCents % lures === 0 ? offer.amountCents / lures : null
}

/** Nombre d'objets réellement expédiés, cadeau compris. */
export function luresReceived(offerId: string): number {
  assertOffer(offerId)
  const offer = OFFERS[offerId]
  return offer.paidCount + offer.giftCount
}

/**
 * Le prix par leurre arrondi à l'euro SUPÉRIEUR, à n'annoncer qu'avec « moins de ».
 *
 * 65,97 € pour 4 leurres font 16,4925 € pièce : un montant qui n'existe pas en
 * centimes. Plutôt que d'écrire « 16,49 € » — faux, et faux en notre faveur — on
 * annonce « moins de 17 € », qui est vrai et se vérifie.
 */
export function perLureAtMostCents(offerId: string): number {
  assertOffer(offerId)
  return Math.ceil(OFFERS[offerId].amountCents / luresReceived(offerId) / 100) * 100
}

/**
 * Le récapitulatif d'une commande, en une ligne — emails, logs, dashboard.
 * `giftLabel` : le 4e leurre choisi (webhook) — « au choix » s'il manque
 * (métadonnée d'une ancienne commande : on ne devine pas).
 */
export function offerSummary(offerId: string, colorwayLabel: string, giftLabel?: string): string {
  assertOffer(offerId)
  const offer = OFFERS[offerId]
  return offer.giftCount > 0
    ? `3 achetés — les ${offer.colorwayCount} coloris + le 4e offert : ${giftLabel ?? 'au choix'}`
    : `1 leurre — ${colorwayLabel}`
}

/* ──────────── Le 4e leurre offert, au choix (champ `cadeau`) ──────────── */

/** Les choix possibles du cadeau : chaque coloris, ou le collector. */
export const GIFT_CHOICE_IDS: readonly string[] = [
  ...PRODUCT.colorways.map((c) => c.id),
  PRODUCT.collector.id,
]

/** Le libellé public d'un choix de cadeau — `null` si l'identifiant est inconnu. */
export function giftLabel(giftId: string): string | null {
  if (giftId === PRODUCT.collector.id) return PRODUCT.collector.label
  return getColorway(giftId)?.label ?? null
}

/**
 * Le cadeau est-il réellement offrable ? Le collector l'est toujours (il ne
 * connaît pas la rupture d'un coloris) ; un coloris suit sa disponibilité.
 */
export function giftOrderableError(giftId: string): string | null {
  if (giftId === PRODUCT.collector.id) return null
  return orderableError(giftId)
}

/** Une ligne de commande telle qu'elle part chez Stripe et s'affiche au client. */
export type CheckoutLine = {
  readonly name: string
  readonly quantity: number
  readonly unitAmountCents: number
}

/**
 * Décompose une commande en lignes facturables.
 *
 * Le reçu dit l'offre telle qu'elle est vendue : chaque leurre à l'UNITÉ.
 * « 3 achetés, le 4e offert » = 3 × le prix unitaire, puis le 4e — CHOISI par
 * l'acheteur — en ligne à **0,00 €**. Invariant garanti par le test : la somme
 * des lignes vaut exactement `totalCents(offre)` — c'est lui qui interdit
 * l'écart entre le montant affiché et le montant encaissé.
 */
export function checkoutLines(
  offerId: string,
  colorwayLabel: string,
  chosenGiftLabel?: string
): CheckoutLine[] {
  assertOffer(offerId)
  const offer = OFFERS[offerId]

  if (offer.id === 'solo') {
    return [
      { name: `${PRODUCT.name} · ${colorwayLabel}`, quantity: 1, unitAmountCents: offer.amountCents },
    ]
  }

  return [
    {
      name: `${PRODUCT.name} · à l'unité`,
      quantity: offer.paidCount,
      unitAmountCents: PRODUCT.pricing.soloCents,
    },
    {
      name: `${PRODUCT.name} · 4e offert${chosenGiftLabel ? ` — ${chosenGiftLabel}` : ' au choix'}`,
      quantity: offer.giftCount,
      unitAmountCents: 0,
    },
  ]
}

/**
 * Vérifie qu'une commande est réellement passable (au-delà de la forme validée
 * par le schéma zod) : coloris connu ET disponible. Retourne le message d'erreur
 * à afficher, ou null si tout est bon. Partagé route API + îlot client.
 * `colorways` est injectable pour les tests.
 */
export function orderableError(
  colorisId: string,
  colorways: readonly Colorway[] = PRODUCT.colorways
): string | null {
  const colorway = colorways.find((c) => c.id === colorisId)
  if (!colorway) return 'Ce coloris n’existe pas.'
  if (!colorway.available) return 'Ce coloris est épuisé.'
  return null
}

/** Formatage d'un montant en centimes pour l'affichage : 2199 → « 21,99 € ». */
export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
