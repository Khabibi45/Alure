import { getDictionary, raw, t } from './index'
import type { Locale } from './paths'
import { LURE_VIEWS, type LureViewId } from '@/lib/three/lure-views'

/**
 * Le pont entre l'identifiant d'un angle (français, clé technique jamais
 * affichée) et le suffixe de sa clé de dictionnaire. Même table que
 * `chrome.ts` : les six angles sont partagés par le carrousel et la page
 * produit, et leurs textes ne se dédoublent pas.
 */
const VIEW_KEYS: Record<LureViewId, string> = {
  droite: 'RIGHT',
  gauche: 'LEFT',
  dessus: 'TOP',
  dessous: 'BOTTOM',
  devant: 'FRONT',
  derriere: 'BACK',
}
import type { LeurreStrings } from '@/components/sections/leurre/leurre-strings'
import {
  OFFER_IDS,
  PRODUCT,
  formatEuros,
  perLureAtMostCents,
  perLureCents,
  savingsCents,
  totalCents,
  type OfferId,
} from '@/lib/shop/product'

/**
 * Les textes de la page produit, préparés CÔTÉ SERVEUR pour ses îlots client.
 *
 * Même rôle que `carouselStrings()` (src/lib/i18n/chrome.ts) pour l'accueil, et
 * pour la même raison : `/leurre` est la page qui vend, ses îlots sont
 * interactifs donc `'use client'`, et un composant client ne peut pas lire un
 * dictionnaire sans l'embarquer entier dans le bundle (règle Alure n°6).
 *
 * Ce module vit à part de `chrome.ts` : celui-ci prépare l'habillage commun de
 * TOUTES les pages (header, footer, sélecteur de langue), celui-ci prépare UNE
 * page. Les mélanger ferait grossir l'habillage de chaque page du site des
 * textes d'une seule.
 *
 * `raw` et non `t` pour tout gabarit dont un paramètre est un NOM PROPRE ou un
 * état client : le coloris regardé n'est connu qu'au clic, et le nom doit être
 * rendu par `fillNodes()` dans un `translate="no"` (cf. `fill-nodes.tsx`).
 */

/** Le pont entre l'identifiant d'un palier et le suffixe de ses clés. */
const OFFER_KEYS: Record<OfferId, string> = {
  solo: 'SOLO',
  collection: 'COLLECTION',
}

export function leurreStrings(locale: Locale): LeurreStrings {
  const dict = getDictionary(locale)

  // Tout ce qui dépend du palier est préparé POUR LES DEUX : le palier est un
  // état client (radio), et aucun montant ne se calcule côté navigateur.
  const total = {} as Record<OfferId, string>
  const tagline = {} as Record<OfferId, string>
  const savings = {} as Record<OfferId, string | null>
  const offerTitle = {} as Record<OfferId, string>
  const offerDetail = {} as Record<OfferId, string>
  const perLure = {} as Record<OfferId, string>

  for (const id of OFFER_IDS) {
    const suffix = OFFER_KEYS[id]
    total[id] = formatEuros(totalCents(id), locale)
    tagline[id] = t(dict, `PRICING.TAGLINE_${suffix}`)
    offerTitle[id] = t(dict, `OFFER.${suffix}_TITLE`)
    // Gabarit brut : `{coloris}` (solo) et `{collector}` (collection) sont des
    // noms propres, rendus par le composant hors traduction automatique.
    offerDetail[id] = raw(dict, `OFFER.${suffix}_DETAIL`)

    // Une économie nulle ne s'affiche pas : pas de « Vous économisez 0,00 € »,
    // et surtout jamais un prix de référence gonflé (règle n°6).
    const saved = savingsCents(id)
    savings[id] =
      saved > 0 ? t(dict, 'PRICING.SAVINGS', { montant: formatEuros(saved, locale) }) : null

    // Le prix par leurre : exact quand la division tombe juste, « moins de X »
    // sinon. C'est le domaine qui tranche (`perLureCents` rend `null`), pas le
    // texte — on n'annonce jamais un montant arrondi en notre faveur.
    const exact = perLureCents(id)
    perLure[id] =
      exact !== null
        ? t(dict, 'OFFER.PER_LURE_EXACT', { montant: formatEuros(exact, locale) })
        : t(dict, 'OFFER.PER_LURE_AT_MOST', {
            montant: formatEuros(perLureAtMostCents(id), locale),
          })
  }

  const views = {} as Record<LureViewId, string>
  const viewDescriptions = {} as Record<LureViewId, string>
  for (const view of LURE_VIEWS) {
    views[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}`)
    viewDescriptions[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}_DESC`)
  }
  return {
    viewerLabel: t(dict, 'PRODUCT.VIEWER_LABEL'),
    viewerHint: t(dict, 'PRODUCT.VIEWER_HINT'),
    viewerFree: t(dict, 'PRODUCT.VIEWER_FREE'),
    viewsLabel: t(dict, 'HOME.VIEWS_LABEL'),
    views,
    viewDescriptions,
    shippingNoticeTitle: t(dict, 'SHIPPING_NOTICE.TITLE'),
    shippingNoticeBody: t(dict, 'SHIPPING_NOTICE.BODY'),
    viewerLoading: t(dict, 'HOME.LOADING'),
    viewerNoWebgl: t(dict, 'PRODUCT.VIEWER_NO_WEBGL'),
    viewerAlt: raw(dict, 'PRODUCT.VIEWER_ALT'),

    total,
    tagline,
    savings,

    colorwayLabel: t(dict, 'PRODUCT.COLORWAY_LABEL'),
    soldOut: t(dict, 'PRODUCT.SOLD_OUT'),

    giftLabel: t(dict, 'PRODUCT.GIFT_LABEL'),
    giftDuplicateA11y: raw(dict, 'PRODUCT.GIFT_DUPLICATE_A11Y'),
    giftCollectorA11y: raw(dict, 'PRODUCT.GIFT_COLLECTOR_A11Y'),

    offerLegend: t(dict, 'OFFER.LEGEND'),
    offerTitle,
    offerDetail,
    perLure,

    progressFirst: t(dict, 'PROGRESS.STEP_FIRST'),
    progressSecond: t(dict, 'PROGRESS.STEP_SECOND'),
    progressThird: t(dict, 'PROGRESS.STEP_THIRD'),
    progressCollector: raw(dict, 'PROGRESS.STEP_COLLECTOR'),
    progressCollectorDone: t(dict, 'PROGRESS.COLLECTOR_PICK'),
    progressCollectorTodo: t(dict, 'PROGRESS.COLLECTOR_TODO'),
    progressLockedA11y: t(dict, 'PROGRESS.LOCKED_A11Y'),
    soloPrice: formatEuros(PRODUCT.pricing.soloCents, locale),

    buy: t(dict, 'PRODUCT.BUY'),
    buyLoading: t(dict, 'PRODUCT.BUY_LOADING'),
    buyLoadingShort: t(dict, 'PRODUCT.BUY_LOADING_SHORT'),
    // Le délai vient du dictionnaire, JAMAIS de `PRODUCT.deliveryDelay`, qui est
    // une chaîne française en dur — elle donnait « Delivery 10 à 20 jours
    // ouvrés » au milieu de la barre d'achat anglaise.
    deliveryShort: t(dict, 'PRODUCT.DELIVERY_BANNER', { delai: t(dict, 'PRODUCT.DELAY_VALUE') }),

    paymentCard: t(dict, 'PAYMENT.CARD'),
    paymentPaypal: t(dict, 'PAYMENT.PAYPAL'),
    paymentSafety: t(dict, 'PAYMENT.SAFETY'),

    errorFormInvalid: t(dict, 'STATES.FORM_INVALID'),
    errorColorwayUnknown: t(dict, 'STATES.COLORWAY_UNKNOWN'),
    errorColorwaySoldOut: t(dict, 'STATES.COLORWAY_SOLD_OUT'),
    errorRateLimited: t(dict, 'STATES.RATE_LIMITED'),
    errorPaymentUnavailable: t(dict, 'STATES.PAYMENT_UNAVAILABLE'),
    errorPaymentFailed: t(dict, 'STATES.PAYMENT_FAILED'),
    errorPaymentBadResponse: t(dict, 'STATES.PAYMENT_BAD_RESPONSE'),
    errorPaymentOffline: t(dict, 'STATES.PAYMENT_OFFLINE'),
  }
}
