import { getDictionary, t } from './index'
import { localePath, LOCALES, DEFAULT_LOCALE, type Locale } from './paths'
import type { LangOption } from '@/components/sections/LangSwitcher'

/**
 * L'habillage commun (header/footer) préparé CÔTÉ SERVEUR pour chaque langue :
 * le client ne reçoit que des chaînes prêtes, jamais un dictionnaire entier.
 */

export type NavItem = { href: string; label: string }

/**
 * Les entrées du header. Pages traduites aujourd'hui : accueil, FAQ, contact.
 * Le produit, le suivi et À propos mènent à leur version FRANÇAISE tant que
 * leur traduction n'est pas branchée — un lien qui marche vaut mieux qu'un 404.
 */
export function headerNav(locale: Locale): NavItem[] {
  const dict = getDictionary(locale)
  const fr = locale === DEFAULT_LOCALE
  const items: NavItem[] = [{ href: '/leurre', label: t(dict, 'NAV.PRODUCT') }]
  if (fr) items.push({ href: '/a-propos', label: t(dict, 'NAV.ABOUT') })
  items.push({ href: localePath(locale, '/faq'), label: t(dict, 'NAV.FAQ') })
  if (fr) items.push({ href: '/suivi', label: t(dict, 'NAV.TRACKING') })
  items.push({ href: '/contact', label: t(dict, 'NAV.CONTACT') })
  return items
}

/** Le bouton + la liste du sélecteur, libellés dans la langue de chacun. */
export function langSwitcher(locale: Locale): { buttonLabel: string; options: LangOption[] } {
  const dict = getDictionary(locale)
  return {
    buttonLabel: t(dict, 'LANG.LABEL'),
    options: LOCALES.map((code) => ({
      code,
      label: t(dict, `LANG.${code.toUpperCase()}`),
    })),
  }
}
