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
  currency: 'eur' as const,
  /**
   * Passage aux LEURRES SOUPLES le 2026-09-01 (modèles fournis par Camil) :
   * les quatre coloris sont Bleu, Rouge, Vert et Noir. Les noms sont
   * volontairement les couleurs elles-mêmes —
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
    {
      /**
       * Le NOIR. Il s'appelait « Pirate » et ne se vendait pas : c'était le
       * collector, obtenu en 4e leurre offert. Cette mécanique est supprimée le
       * 2026-09-04 (décision Camil) — le pack contient une unité de CHAQUE
       * coloris, celui-ci compris, et le nom redevient simplement la couleur,
       * comme les trois autres.
       */
      id: 'coloris-4',
      label: 'Noir',
      shortLabel: 'Noir',
      available: true,
      image: '/produit/leurre-noir.webp',
      photoSlug: 'noir',
    },
  ] satisfies Colorway[],
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

/* ────────────────────────────── LES DEUX PACKS ────────────────────────────── */

/**
 * Le catalogue, depuis le 2026-09-04 (décision Camil) : on ne vend plus de
 * leurre à l'unité, on vend des PACKS.
 *
 * Ce qui a disparu ce jour-là, et pourquoi il n'en reste pas de trace ici :
 *
 *   - le prix à l'unité (21,99 €) ;
 *   - l'offre « 3 achetés, le 4e offert », avec son champ `cadeau` ;
 *   - le collector « Pirate », qui ne s'achetait pas.
 *
 * Un pack n'a rien à choisir : celui de leurres souples contient UNE UNITÉ DE
 * CHAQUE coloris. C'est ce qui rend le modèle simple à dire et à tenir — pas de
 * combinaison, pas de rupture partielle à gérer au panier, pas de prix à
 * recalculer selon la sélection.
 */
export type PackId = 'leurres' | 'goujons'

export type Pack = {
  readonly id: PackId
  /**
   * Le nom qui part sur le REÇU STRIPE et dans l'email de confirmation. Il
   * reste en français dans les deux langues : le client doit retrouver sur son
   * relevé exactement ce qu'il a vu en payant.
   */
  readonly name: string
  /** Montant du pack, HORS livraison. */
  readonly amountCents: number
  /** Nombre d'objets dans le pack — ce qui arrive vraiment dans l'enveloppe. */
  readonly unitCount: number
}

export const PACKS = {
  leurres: {
    id: 'leurres',
    name: 'Pack de leurres souples Alure',
    amountCents: 1099,
    // Une unité de chaque coloris : le compte SUIT le catalogue plutôt que d'être
    // écrit en dur. Ajouter un coloris changera le contenu du pack, et le test
    // le rappellera — plutôt qu'un 4 en dur qui mentirait en silence.
    unitCount: PRODUCT.colorways.length,
  },
  goujons: {
    id: 'goujons',
    name: 'Pack de goujons Alure',
    amountCents: 599,
    unitCount: 5,
  },
} as const satisfies Record<PackId, Pack>

export const PACK_IDS = Object.keys(PACKS) as PackId[]

function assertPack(id: string): asserts id is PackId {
  if (!(id in PACKS)) throw new Error(`Pack inconnu : ${id}`)
}

export function getPack(id: PackId): Pack {
  return PACKS[id]
}

/* ───────────────────────────── LA LIVRAISON ───────────────────────────── */

/**
 * La livraison n'est PLUS incluse (décision Camil, 2026-09-04) — elle se paie
 * en plus, et elle s'affiche donc avant le paiement : c'est une obligation, pas
 * une politesse.
 *
 * LE MONTANT N'EST PAS CHOISI, IL EST RELEVÉ. Tarif La Poste **Lettre Verte
 * Suivie**, en vigueur au 1er janvier 2026 : 2,02 € jusqu'à 20 g, **3,60 €
 * jusqu'à 100 g**, 5,74 € jusqu'à 250 g.
 *
 * Pourquoi la tranche 100 g, et pourquoi un forfait :
 *
 *   un pack de leurres pèse 4 × 6,5 g = 26 g ; l'enveloppe matelassée et la
 *   carte ajoutent une trentaine de grammes. Un envoi tourne donc autour de
 *   50 g, et deux packs ensemble restent sous les 100 g. Le tarif ne varie pas
 *   dans l'usage réel : un forfait dit la vérité, une grille par poids
 *   compliquerait la page sans changer le montant.
 *
 * ⚠️ Ce chiffre est un TARIF PUBLIC qui bouge chaque 1er janvier (+7,4 % en
 * 2026). À revérifier à cette date — et il doit rester identique au tarif
 * d'expédition configuré dans Stripe, sinon l'affiché et l'encaissé divergent.
 */
export const SHIPPING = {
  amountCents: 360,
  /** Le service postal réellement utilisé — il s'affiche au client. */
  carrier: 'Lettre Verte suivie',
  /** La tranche de poids couverte par ce tarif. */
  maxWeightGrams: 100,
} as const

/** Total réellement encaissé : le pack, plus la livraison. */
export function totalCents(packId: string): number {
  assertPack(packId)
  return PACKS[packId].amountCents + SHIPPING.amountCents
}

/**
 * Le prix par pièce dans un pack — `null` si la division n'est pas exacte.
 *
 * On n'affiche jamais un prix arrondi qui, remultiplié, ne redonne pas le
 * total : 10,99 € pour 4 leurres font 2,7475 € pièce, un montant qui n'existe
 * pas en centimes. Dans ce cas c'est `perUnitAtMostCents` qui parle, avec un
 * « moins de » qui, lui, est vrai.
 */
export function perUnitCents(packId: string): number | null {
  assertPack(packId)
  const pack = PACKS[packId]
  return pack.amountCents % pack.unitCount === 0 ? pack.amountCents / pack.unitCount : null
}

/** Le prix par pièce arrondi au dixième d'euro SUPÉRIEUR — à n'annoncer qu'avec « moins de ». */
export function perUnitAtMostCents(packId: string): number {
  assertPack(packId)
  const pack = PACKS[packId]
  return Math.ceil(pack.amountCents / pack.unitCount / 10) * 10
}

/** « 4 coloris · 6,5 cm » — le résumé vrai de la gamme. */
export function lineupSummary(): string {
  return `${PRODUCT.colorways.length} coloris · ${formatLength()}`
}

/** « Livraison 3 à 5 jours ouvrés » — LA formulation courte, dérivée de la source unique. */
export function deliveryShort(): string {
  return `Livraison ${PRODUCT.deliveryDelay}`
}

/**
 * La ligne sous le prix. Elle dit la livraison EN SUS — c'est le point sur
 * lequel un client se sent trompé s'il le découvre au paiement.
 */
export function priceTagline(): string {
  return `+ ${formatEuros(SHIPPING.amountCents)} de livraison · TVA non applicable, art. 293 B du CGI.`
}

/** Le récapitulatif d'une commande, en une ligne — emails, logs, dashboard. */
export function packSummary(packId: string): string {
  assertPack(packId)
  const pack = PACKS[packId]
  return `${pack.name} — ${pack.unitCount} pièces`
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
 * Le pack est UNE ligne : c'est ainsi qu'il se vend, et le reçu doit dire ce
 * que le client a acheté. La livraison n'en fait pas partie — elle passe par
 * `shipping_options` chez Stripe, ce qui la fait apparaître comme des frais de
 * port et non comme un article.
 *
 * Un test garde l'invariant qui compte : la somme des lignes plus la livraison
 * vaut exactement `totalCents(pack)`. C'est lui qui interdit l'écart entre le
 * montant affiché et le montant encaissé.
 */
export function checkoutLines(packId: string): CheckoutLine[] {
  assertPack(packId)
  const pack = PACKS[packId]
  return [{ name: pack.name, quantity: 1, unitAmountCents: pack.amountCents }]
}

/**
 * Vérifie qu'une commande est réellement passable, au-delà de la forme validée
 * par le schéma zod. Retourne le message à afficher, ou `null` si tout est bon.
 * Partagé route API + îlot client.
 *
 * Un pack n'a pas de coloris à choisir : sa disponibilité est celle de son
 * contenu. Le pack de leurres tombe donc dès qu'un seul coloris est en rupture
 * — il contient une unité de chacun, on ne peut pas en livrer trois sur quatre.
 */
export function orderableError(packId: string): string | null {
  if (!(packId in PACKS)) return 'Ce pack n’existe pas.'
  if (packId === 'leurres' && PRODUCT.colorways.some((c) => !c.available)) {
    return 'Un coloris du pack est épuisé.'
  }
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
