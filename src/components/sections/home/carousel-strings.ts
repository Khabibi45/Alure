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
  /*
   * Le carrousel de l'accueil ne PORTE PLUS DE PANIER depuis le passage aux
   * packs (2026-09-04) : il n'y a plus de coloris à composer, donc plus de
   * cases à cocher, plus de total à afficher et plus de bouton d'achat ici.
   * L'achat se fait sur la page produit, où le pack se choisit en une fois.
   */

  /* ── Les commandes du carrousel ── */
  readonly previous: string
  readonly next: string
  readonly loading: string
  readonly noWebgl: string
  readonly modelFailed: string
  readonly framesFailed: string
  readonly viewsLabel: string
  /** Le bouton qui ouvre la fiche technique du leurre affiché. */
  readonly sheetLabel: string
  /** Le libellé de chaque angle de vue, par identifiant. */
  readonly views: Readonly<Record<LureViewId, string>>
  /** La description de chaque angle, pour la phrase lue aux lecteurs d'écran. */
  readonly viewDescriptions: Readonly<Record<LureViewId, string>>
  /** Gabarit `{nom}` `{vue}` — ce que décrit le canvas, qui est `aria-hidden`. */
  readonly modelAlt: string
}
