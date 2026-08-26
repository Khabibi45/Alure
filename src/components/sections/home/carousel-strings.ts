import type { LureViewId } from '@/lib/three/lure-views'

/**
 * TOUS les textes du carrousel 3D, tels qu'ils traversent la frontière
 * serveur → client.
 *
 * Pourquoi ce type vit ici et pas dans `src/lib/i18n/` : c'est le CONTRAT du
 * composant qui les consomme (`LureCarousel`, `'use client'`). Le serveur les
 * prépare (`carouselStrings()` dans `src/lib/i18n/chrome.ts`) et les passe en
 * props — un composant client ne peut pas appeler `getDictionary`, qui
 * embarquerait les deux dictionnaires entiers dans le bundle navigateur
 * (CLAUDE.md, règle Alure n°6).
 *
 * Les valeurs contenant des `{placeholders}` arrivent BRUTES : leurs paramètres
 * (le coloris regardé, le compte au panier, la liste) ne sont connus qu'au clic.
 * Le client les remplit avec `fill()` — pur, minuscule, sans dictionnaire.
 *
 * Ce type est la raison pour laquelle `/en` cessait d'être anglais dès le hero :
 * jusqu'au 2026-08-25, `LureCarousel` ne recevait AUCUNE prop, et tous ses
 * textes étaient donc en français en dur, y compris ses boutons d'achat.
 */
export type CarouselStrings = {
  /* ── Les valeurs, formatées SERVEUR à la langue servie ── */
  /**
   * Le prix d'un leurre et le total de l'offre, déjà formatés : « 21,99 € » en
   * français, « €21.99 » en anglais. Et le délai, pris au dictionnaire
   * (`PRODUCT.DELAY_VALUE`) et non à `PRODUCT.deliveryDelay`, qui est une
   * chaîne française en dur — elle donnait « Delivery 10 à 20 jours ouvrés »
   * au milieu d'une phrase anglaise.
   */
  readonly soloPrice: string
  readonly collectionTotal: string
  readonly deliveryDelay: string

  /* ── Le panier ── */
  /** Gabarit `{prix}` — le prix affiché dans une case libre. */
  readonly boxPrice: string
  readonly boxTaken: string
  readonly boxSoldOut: string
  readonly boxGift: string
  readonly boxGiftFree: string
  readonly boxGiftChoose: string
  readonly boxGiftPaused: string
  /** Gabarit `{coloris}` `{etat}` — le nom accessible d'une case. */
  readonly boxA11y: string
  /** Gabarit `{collector}`. */
  readonly giftA11y: string
  /** Gabarits `{coloris}`. */
  readonly add: string
  readonly remove: string
  readonly orderCollection: string
  /** Gabarit `{coloris}`. */
  readonly orderSolo: string
  readonly clear: string
  readonly sheet: string
  /** Gabarits d'état — paramètres `{total}` `{compte}` `{max}` `{liste}`. */
  readonly stateEmpty: string
  readonly stateOne: string
  readonly stateSome: string
  readonly stateFull: string
  readonly stateSoldOut: string
  /** Gabarit `{prix}` `{delai}`. */
  readonly footnote: string

  /* ── Les commandes du carrousel ── */
  readonly previous: string
  readonly next: string
  readonly loading: string
  readonly noWebgl: string
  readonly modelFailed: string
  readonly framesFailed: string
  readonly viewsLabel: string
  /** Le libellé de chaque angle de vue, par identifiant. */
  readonly views: Readonly<Record<LureViewId, string>>
  /** La description de chaque angle, pour la phrase lue aux lecteurs d'écran. */
  readonly viewDescriptions: Readonly<Record<LureViewId, string>>
  /** Gabarit `{nom}` `{vue}` — ce que décrit le canvas, qui est `aria-hidden`. */
  readonly modelAlt: string
}
