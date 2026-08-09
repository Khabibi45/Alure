/**
 * Tokens motion de la fondation Pastel (couche 1 — FONDATION-PASTEL.md §6).
 * LA source unique pour tout framer-motion custom : 3 durées, 2 courbes.
 * Miroir exact des variables CSS de globals.css (--dur-*, --ease-*).
 */

export const DURATION = {
  /** Press, feedbacks immédiats, sorties de page. */
  micro: 0.14,
  /** Mouvements d'éléments : pops de chiffres, hovers, tracé du surligneur. */
  element: 0.28,
  /** Entrées de page, reveals au scroll. */
  page: 0.42,
} as const

/** Arrivées, hovers — sortie très douce. */
export const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Départs francs. */
export const EASE_IN_BRISK: [number, number, number, number] = [0.55, 0, 0.72, 0.35]

/** Décalage du relais : l'entrant démarre pendant que le sortant s'efface (§6). */
export const RELAY_DELAY = 0.09

/** Amplitudes de translation (px) — jamais plus. */
export const SHIFT = {
  /** Entrée de page / reveal. */
  enter: 16,
  /** Sortie de page. */
  exit: 12,
  /** Pop d'un chiffre qui change. */
  pop: 7,
} as const
