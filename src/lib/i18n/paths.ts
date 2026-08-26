/**
 * La partie PURE du multilingue : locales et chemins, sans dictionnaires.
 *
 * Séparée de `index.ts` pour que les composants client (sélecteur de langue)
 * puissent l'importer sans embarquer les deux dictionnaires dans le bundle.
 */

/**
 * Le périmètre linguistique du site : français (la référence, à la racine) et
 * anglais (`/en`). Deux, pas plus — en ajouter ou en retirer une est une
 * décision du propriétaire (CLAUDE.md, règle Alure n°6), jamais un effet de
 * bord : cette ligne commande le sitemap, les hreflang, le sélecteur de langue
 * et les redirections. `src/lib/i18n.test.ts` la tient.
 */
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

/** Les langues servies sous préfixe d'URL (toutes sauf le français, à la racine). */
export const PREFIXED_LOCALES = LOCALES.filter((l): l is Locale => l !== DEFAULT_LOCALE)

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Les chemins qui existent dans TOUTES les langues, c'est-à-dire les routes
 * présentes sous `src/app/[lang]/`. Tout le reste du site n'existe qu'en
 * français, sous `src/app/(fr)/`.
 *
 * LA source unique de cette information. Sans elle, chaque consommateur
 * devinait : le sélecteur de langue fabriquait `/en/contact` pour n'importe
 * quel chemin, et le visiteur qui passait en anglais depuis une page française
 * atterrissait sur « Page introuvable » — sur 11 des 13 pages du site.
 *
 * Une page traduite s'ajoute ICI en même temps que sa route, et
 * `src/lib/i18n.test.ts` refuse que les deux divergent.
 */
export const TRANSLATED_PATHS = [
  '/',
  '/leurre',
  '/faq',
  '/contact',
  '/suivi',
  '/a-propos',
  '/merci',
  '/cgv',
  '/mentions-legales',
  '/confidentialite',
  '/retractation',
] as const

/** Cette page existe-t-elle dans les deux langues ? */
export function hasTranslation(path: string): boolean {
  return (TRANSLATED_PATHS as readonly string[]).includes(path)
}

/** Le chemin d'une page dans une langue : `/faq` → `/en/faq` (fr : inchangé). */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/**
 * Le chemin à suivre pour LIRE cette page dans une autre langue — l'accueil de
 * cette langue si la page n'y existe pas.
 *
 * Envoyer à l'accueil est un pis-aller, et la doctrine i18n le dit
 * (`docs/i18n/README.md` §4). Mais entre un pis-aller annoncé et une page
 * « introuvable », le choix est vite fait : le sélecteur PRÉVIENT (clé
 * `LANG.NO_TRANSLATION`) au lieu de faire semblant.
 */
export function localePathOrHome(locale: Locale, path: string): string {
  return hasTranslation(path) ? localePath(locale, path) : localePath(locale, '/')
}

/**
 * Sépare la langue d'un chemin : `/en/leurre` → `{ locale: 'en', path: '/leurre' }`.
 * C'est ce qui permet au sélecteur de changer de langue SANS changer de page —
 * renvoyer à l'accueil est la faute classique (docs/i18n/README.md §4).
 */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/')
  if (first && first !== DEFAULT_LOCALE && isLocale(first)) {
    const remainder = rest.join('/')
    return { locale: first, path: remainder ? `/${remainder}` : '/' }
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' }
}

/**
 * Les alternates `hreflang` d'une page traduite, pour `metadata` — réciproques
 * entre les deux versions, `x-default` sur le français (README §4). Ne
 * s'applique QU'AUX pages qui existent dans les deux langues.
 */
export function hreflangAlternates(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = localePath(locale, path)
  }
  languages['x-default'] = localePath(DEFAULT_LOCALE, path)
  return { languages }
}
