import { getDictionary, raw, t } from './index'
import { localePath, LOCALES, type Locale } from './paths'
import type { LangOption } from '@/components/sections/LangSwitcher'
import type { CarouselStrings } from '@/components/sections/home/carousel-strings'
import { LURE_VIEWS, type LureViewId } from '@/lib/three/lure-views'
import { OFFERS, PRODUCT, formatEuros } from '@/lib/shop/product'

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
  return [
    { href: localePath(locale, '/leurre'), label: t(dict, 'NAV.PRODUCT') },
    { href: localePath(locale, '/a-propos'), label: t(dict, 'NAV.ABOUT') },
    { href: localePath(locale, '/faq'), label: t(dict, 'NAV.FAQ') },
    { href: localePath(locale, '/suivi'), label: t(dict, 'NAV.TRACKING') },
    { href: localePath(locale, '/contact'), label: t(dict, 'NAV.CONTACT') },
  ]
}

/**
 * Le pont entre l'identifiant d'un angle de vue (français, il sert de clé
 * technique et ne s'affiche jamais) et le suffixe de sa clé de dictionnaire.
 */
const VIEW_KEYS: Record<LureViewId, string> = {
  droite: 'RIGHT',
  gauche: 'LEFT',
  dessus: 'TOP',
  dessous: 'BOTTOM',
  devant: 'FRONT',
  derriere: 'BACK',
}

/**
 * TOUS les textes du carrousel 3D, préparés pour le composant client.
 * `raw` et non `t` pour les gabarits à paramètres : leurs valeurs (le coloris
 * regardé, le compte, la liste) ne sont connues qu'au clic, côté navigateur.
 */
export function carouselStrings(locale: Locale): CarouselStrings {
  const dict = getDictionary(locale)
  // Les six angles de vue : leurs identifiants font foi, les libellés viennent
  // du dictionnaire. `LURE_VIEWS` ne porte donc plus de texte affichable.
  const views = {} as Record<LureViewId, string>
  const viewDescriptions = {} as Record<LureViewId, string>
  for (const view of LURE_VIEWS) {
    views[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}`)
    viewDescriptions[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}_DESC`)
  }
  return {
    soloPrice: formatEuros(PRODUCT.pricing.soloCents, locale),
    collectionTotal: formatEuros(OFFERS.collection.amountCents, locale),
    deliveryDelay: t(dict, 'PRODUCT.DELAY_VALUE'),
    previous: t(dict, 'HOME.PREV'),
    next: t(dict, 'HOME.NEXT'),
    loading: t(dict, 'HOME.LOADING'),
    noWebgl: t(dict, 'HOME.NO_WEBGL'),
    modelFailed: t(dict, 'HOME.MODEL_FAILED'),
    framesFailed: t(dict, 'HOME.FRAMES_FAILED'),
    viewsLabel: t(dict, 'HOME.VIEWS_LABEL'),
    views,
    viewDescriptions,
    modelAlt: raw(dict, 'HOME.MODEL_ALT'),
    boxPrice: raw(dict, 'CART.BOX_PRICE'),
    boxTaken: t(dict, 'CART.BOX_TAKEN'),
    boxSoldOut: t(dict, 'CART.BOX_SOLD_OUT'),
    boxGift: t(dict, 'CART.BOX_GIFT'),
    boxGiftFree: t(dict, 'CART.BOX_GIFT_FREE'),
    boxGiftChoose: t(dict, 'CART.BOX_GIFT_CHOOSE'),
    boxGiftPaused: t(dict, 'CART.BOX_GIFT_PAUSED'),
    boxA11y: raw(dict, 'CART.BOX_A11Y'),
    giftA11y: raw(dict, 'CART.GIFT_A11Y'),
    add: raw(dict, 'CART.ADD'),
    remove: raw(dict, 'CART.REMOVE'),
    orderCollection: t(dict, 'CART.ORDER_COLLECTION'),
    orderSolo: raw(dict, 'CART.ORDER_SOLO'),
    clear: t(dict, 'CART.CLEAR'),
    sheet: t(dict, 'CART.SHEET'),
    stateEmpty: raw(dict, 'CART.STATE_EMPTY'),
    stateOne: raw(dict, 'CART.STATE_ONE'),
    stateSome: raw(dict, 'CART.STATE_SOME'),
    stateFull: raw(dict, 'CART.STATE_FULL'),
    stateSoldOut: t(dict, 'CART.STATE_SOLD_OUT'),
    footnote: raw(dict, 'CART.FOOTNOTE'),
  }
}

/** Le bouton + la liste du sélecteur, libellés dans la langue de chacun. */
export function langSwitcher(locale: Locale): {
  buttonLabel: string
  options: LangOption[]
  noTranslationNote: string
} {
  const dict = getDictionary(locale)
  return {
    buttonLabel: t(dict, 'LANG.LABEL'),
    noTranslationNote: t(dict, 'LANG.NO_TRANSLATION'),
    options: LOCALES.map((code) => ({
      code,
      label: t(dict, `LANG.${code.toUpperCase()}`),
    })),
  }
}
