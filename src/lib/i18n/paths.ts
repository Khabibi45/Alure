/**
 * La partie PURE du multilingue : locales et chemins, sans dictionnaires.
 *
 * Séparée de `index.ts` pour que les composants client (sélecteur de langue)
 * puissent l'importer sans embarquer les cinq dictionnaires dans le bundle.
 */

export const LOCALES = ['fr', 'en', 'es', 'de', 'nl'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

/** Les langues servies sous préfixe d'URL (toutes sauf le français, à la racine). */
export const PREFIXED_LOCALES = LOCALES.filter((l): l is Locale => l !== DEFAULT_LOCALE)

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Le chemin d'une page dans une langue : `/leurre` → `/de/leurre` (fr : inchangé). */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/**
 * Sépare la langue d'un chemin : `/de/leurre` → `{ locale: 'de', path: '/leurre' }`.
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
 * entre les cinq versions, `x-default` sur le français (README §4). Ne
 * s'applique QU'AUX pages qui existent dans toutes les langues.
 */
export function hreflangAlternates(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = localePath(locale, path)
  }
  languages['x-default'] = localePath(DEFAULT_LOCALE, path)
  return { languages }
}
