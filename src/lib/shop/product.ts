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

import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/paths'

export type Colorway = {
  id: string
  /** Nom affiché (site, Stripe, emails). */
  label: string
  /**
   * Le nom court des cases du panier, où la place manque (375 px, 4 cases).
   *
   * CONTRAINTE, tenue par un test : `shortLabel` doit être un PRÉFIXE de
   * `label`. C'est ce qui satisfait WCAG 2.5.3 « Label in Name » — le texte
   * visible d'un contrôle doit être contenu dans son nom accessible, sinon la
   * commande vocale (« clique sur Truite ») n'atteint pas la cible.
   */
  shortLabel: string
  /** Passé à false à la main en cas de rupture : affiché « Épuisé », non commandable. */
  available: boolean
  /** Visuel produit (`public/produit/`) — jamais une image fournisseur. */
  image: string
  /**
   * La racine des fichiers de CE coloris dans `public/produit/` : la photo
   * principale est `leurre-<slug>.webp`, les gros plans
   * `details/<slug>-<detail>.webp`.
   *
   * Le slug, et non le chemin complet, parce que les gros plans sont CINQ par
   * coloris (cf. `lure-details.ts`) : les écrire un par un ferait quinze
   * chemins à maintenir à la main, et un fichier renommé casserait en silence.
   * Un test vérifie que les six fichiers de chaque slug existent vraiment.
   */
  photoSlug: string
}

export const PRODUCT = {
  id: 'alure-leurre-v1',
  name: 'Leurre souple Alure',
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
   * Passage aux LEURRES SOUPLES le 2026-09-01 (modèles fournis par Camil) :
   * les trois coloris vendus deviennent Bleu, Rouge et Vert, et le collector
   * reste le noir. Les noms sont volontairement les couleurs elles-mêmes —
   * décrire une robe qu'on n'a pas vue serait l'inventer (règle n°6). À affiner
   * quand les rendus définitifs seront validés.
   *
   * Les IMAGES sont les photos de shooting des leurres souples (2026-09-01,
   * fournies par Camil) : plus aucun visuel de l'articulé, qui montrait un
   * autre produit. Même plan, même ardoise mouillée sur les quatre — c'est ce
   * qui rend les coloris comparables entre eux.
   *
   * Historique — les noms décrivaient la robe de l'articulé (2026-08-08) :
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
      label: 'Bleu',
      shortLabel: 'Bleu',
      available: true,
      image: '/produit/leurre-bleu.webp',
      photoSlug: 'bleu',
    },
    {
      id: 'coloris-2',
      label: 'Rouge',
      shortLabel: 'Rouge',
      available: true,
      image: '/produit/leurre-rouge.webp',
      photoSlug: 'rouge',
    },
    {
      id: 'coloris-3',
      label: 'Vert',
      shortLabel: 'Vert',
      available: true,
      image: '/produit/leurre-vert.webp',
      photoSlug: 'vert',
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
    /**
     * Sa photo, au même titre que les trois coloris vendus : le Pirate ne
     * s'achète pas, mais il se CHOISIT — et on ne choisit pas un leurre qu'on
     * n'a pas vu. La pastille du 4e leurre offert montrait jusqu'ici une tête
     * de mort ; c'était une icône, pas le produit.
     */
    image: '/produit/leurre-pirate.webp',
    photoSlug: 'pirate',
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
  /**
   * Délai annoncé partout AVANT l'achat (règle Alure n°1) — jamais atténué.
   *
   * Passé de « 10 à 20 jours ouvrés » à « 3 à 5 » le 2026-08-28 : les leurres
   * ne partent plus de chez un fournisseur, ils sont stockés EN FRANCE et
   * expédiés par nos soins, en enveloppe matelassée noire. Le délai n'est donc
   * plus une contrainte d'acheminement mais une promesse qu'on tient nous-mêmes
   * — et cinq jours annoncés puis manqués se remarquent bien plus vite que
   * vingt. Ce chiffre est la SOURCE : tout le site, les emails et le reçu
   * Stripe en découlent.
   */
  deliveryDelay: '3 à 5 jours ouvrés',
} as const

/**
 * La convention décimale de chaque langue servie (multilingue, docs/i18n/).
 *
 * Typée `Record<Locale, string>` À DESSEIN : c'est le compilateur qui garantit
 * qu'aucune langue servie n'est oubliée ici. Avec un `Record<string, string>` et
 * un repli `?? 'fr-FR'`, une langue ajoutée sortait « 6,5 » ponctué en français
 * sans que rien ne le signale — la dégradation silencieuse qu'interdit le
 * principe n°1. Ajouter une langue casse maintenant le build, et c'est le but.
 */
const NUMBER_LOCALES: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(NUMBER_LOCALES[locale]).format(value)
}

/** « 6,5 cm » — virgule décimale en français, point en anglais. */
export function formatLength(locale: Locale = DEFAULT_LOCALE): string {
  return `${formatNumber(PRODUCT.specs.lengthCm, locale)} cm`
}

/** « 6,5 g ». */
export function formatWeight(locale: Locale = DEFAULT_LOCALE): string {
  return `${formatNumber(PRODUCT.specs.weightGrams, locale)} g`
}

/** « 6,5 cm · 6,5 g » — la forme courte affichée à côté du produit. */
export function formatSpecs(locale: Locale = DEFAULT_LOCALE): string {
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

/** « Livraison 3 à 5 jours ouvrés » — LA formulation courte, dérivée de la source unique. */
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
      {
        name: `${PRODUCT.name} · ${colorwayLabel}`,
        quantity: 1,
        unitAmountCents: offer.amountCents,
      },
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

/**
 * Formatage d'un montant en centimes : 2199 → « 21,99 € » en français,
 * « €21.99 » en anglais.
 *
 * La langue est un PARAMÈTRE, avec le français par défaut. Elle était figée à
 * `fr-FR` : la page anglaise affichait donc « 21,99 € », une virgule décimale
 * et un symbole postposé qu'un anglophone lit mal — et qui laissait croire à
 * une conversion approximative sur le seul écran qui doit être limpide, celui
 * du prix.
 *
 * Le défaut français n'est pas un repli paresseux : les emails, le reçu Stripe
 * et les pages légales restent en français par décision (le montant vu à
 * l'achat doit être celui du reçu), et ils appellent tous cette fonction sans
 * argument.
 */
export function formatEuros(cents: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(NUMBER_LOCALES[locale], {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
