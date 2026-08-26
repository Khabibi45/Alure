import { DICTIONARIES } from './dictionaries.gen'
import type { Locale } from './paths'
import { fill } from './fill'

/**
 * Le cœur du multilingue (standard : docs/i18n/README.md §4).
 *
 * - Le français vit À LA RACINE (`/`) : c'est le marché réel.
 *   L'anglais vit sous son préfixe (`/en`).
 * - Aucune redirection automatique sur la langue du navigateur : on propose
 *   (sélecteur), on n'impose pas.
 * - Échec bruyant : une clé absente ou un placeholder non fourni JETTE — sur
 *   des pages statiques, l'erreur sort au build, jamais chez le visiteur.
 *
 * Côté client, importer `./paths` (pur) — ce module-ci embarque les deux
 * dictionnaires et n'a sa place que côté serveur.
 */

export * from './paths'

export type Dict = Record<string, string>

export function getDictionary(locale: Locale): Dict {
  return DICTIONARIES[locale]
}

/**
 * Lit une clé, injecte les `{placeholders}`. Toute clé inconnue ou tout
 * placeholder resté sans valeur = erreur — jamais un texte à trou en silence.
 */
export function t(dict: Dict, key: string, params?: Record<string, string>): string {
  return fill(raw(dict, key), params)
}

/**
 * Le gabarit BRUT d'une clé, placeholders non remplis — pour les gabarits qu'un
 * composant client remplira lui-même au clic (il applique `fill`). Jette sur
 * une clé inconnue, exactement comme `t`.
 */
export function raw(dict: Dict, key: string): string {
  const value = dict[key]
  if (value === undefined) {
    throw new Error(`i18n : clé inconnue « ${key} » — lance \`npm run i18n\` et les tests.`)
  }
  return value
}
