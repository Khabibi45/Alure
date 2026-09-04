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
import type {
  LeurreStrings,
  LureDetailBlock,
  LurePhoto,
  PackStrings,
} from '@/components/sections/leurre/leurre-strings'
import {
  LURE_DETAIL_IDS,
  PHOTOGRAPHED_LURES,
  lureDetailPhotoSrc,
  type LureDetailId,
} from '@/lib/shop/lure-details'
import {
  PACKS,
  PACK_IDS,
  PRODUCT,
  SHIPPING,
  formatEuros,
  perUnitAtMostCents,
  perUnitCents,
  type PackId,
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

/** Le pont entre l'identifiant d'un pack et le suffixe de ses clés. */
const PACK_KEYS: Record<PackId, string> = {
  leurres: 'LEURRES',
  goujons: 'GOUJONS',
}

/**
 * Le pont entre l'identifiant d'un détail (français, clé technique jamais
 * affichée) et le suffixe de ses trois clés de dictionnaire : `_TITLE`, `_BODY`
 * et `_ALT`. Même principe que `VIEW_KEYS` et `OFFER_KEYS`.
 */
const DETAIL_KEYS: Record<LureDetailId, string> = {
  yeux: 'EYES',
  paillettes: 'GLITTER',
  barrette: 'BLADE',
  queue: 'TAIL',
  palette: 'PADDLE',
}

export function leurreStrings(locale: Locale): LeurreStrings {
  const dict = getDictionary(locale)

  // Tout ce qui dépend du pack est préparé POUR LES DEUX : le pack est un état
  // client (radio), et aucun montant ne se calcule côté navigateur.
  const packs = {} as Record<PackId, PackStrings>
  for (const id of PACK_IDS) {
    const suffix = PACK_KEYS[id]
    // Le prix par pièce : exact quand la division tombe juste, « moins de »
    // sinon. C'est le domaine qui tranche (`perUnitCents` rend `null`), pas le
    // texte — on n'annonce jamais un montant arrondi en notre faveur.
    const exact = perUnitCents(id)
    packs[id] = {
      title: t(dict, `PACK.${suffix}_TITLE`),
      contents: t(dict, `PACK.${suffix}_CONTENTS`, {
        coloris: PRODUCT.colorways.map((c) => c.label).join(', '),
        nombre: String(PACKS[id].unitCount),
      }),
      price: formatEuros(PACKS[id].amountCents, locale),
      perUnit:
        exact !== null
          ? t(dict, 'PACK.PER_UNIT_EXACT', { montant: formatEuros(exact, locale) })
          : t(dict, 'PACK.PER_UNIT_AT_MOST', {
              montant: formatEuros(perUnitAtMostCents(id), locale),
            }),
    }
  }

  const views = {} as Record<LureViewId, string>
  const viewDescriptions = {} as Record<LureViewId, string>
  for (const view of LURE_VIEWS) {
    views[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}`)
    viewDescriptions[view.id] = t(dict, `HOME.VIEW_${VIEW_KEYS[view.id]}_DESC`)
  }
  // Les photos des QUATRE leurres, préparées d'avance : le coloris regardé est
  // un état client, et un `alt` doit arriver résolu (cf. `LureDetailBlock`).
  const photos = {} as Record<string, LurePhoto>
  for (const lure of PHOTOGRAPHED_LURES) {
    photos[lure.id] = {
      src: lure.image,
      alt: t(dict, 'PRODUCT.PHOTO_ALT', { coloris: lure.label }),
    }
  }

  const details: LureDetailBlock[] = LURE_DETAIL_IDS.map((id) => {
    const suffix = DETAIL_KEYS[id]
    const perLure = {} as Record<string, LurePhoto>
    for (const lure of PHOTOGRAPHED_LURES) {
      perLure[lure.id] = {
        src: lureDetailPhotoSrc(lure.photoSlug, id),
        alt: t(dict, `PRODUCT.DETAIL_${suffix}_ALT`, { coloris: lure.label }),
      }
    }
    return {
      id,
      title: t(dict, `PRODUCT.DETAIL_${suffix}_TITLE`),
      body: t(dict, `PRODUCT.DETAIL_${suffix}_BODY`),
      photos: perLure,
    }
  })

  return {
    deliveryBannerTitle: t(dict, 'PRODUCT.DELIVERY_BANNER', {
      delai: t(dict, 'PRODUCT.DELAY_VALUE'),
    }),
    deliveryBannerBody: t(dict, 'PRODUCT.DELIVERY_BANNER_BODY'),
    viewerLabel: t(dict, 'PRODUCT.VIEWER_LABEL'),
    viewerHint: t(dict, 'PRODUCT.VIEWER_HINT'),
    viewerFree: t(dict, 'PRODUCT.VIEWER_FREE'),
    viewsLabel: t(dict, 'HOME.VIEWS_LABEL'),
    views,
    viewDescriptions,
    shippingNoticeTitle: t(dict, 'SHIPPING_NOTICE.TITLE'),
    shippingNoticeBody: t(dict, 'SHIPPING_NOTICE.BODY'),
    mediaLabel: t(dict, 'PRODUCT.MEDIA_LABEL'),
    mediaPhoto: t(dict, 'PRODUCT.MEDIA_PHOTO'),
    mediaModel: t(dict, 'PRODUCT.MEDIA_MODEL'),
    viewerLoading: t(dict, 'HOME.LOADING'),
    viewerNoWebgl: t(dict, 'PRODUCT.VIEWER_NO_WEBGL'),
    viewerAlt: raw(dict, 'PRODUCT.VIEWER_ALT'),

    packLegend: t(dict, 'PACK.LEGEND'),
    packs,
    shippingLine: t(dict, 'PRODUCT.SHIPPING_LINE', {
      montant: formatEuros(SHIPPING.amountCents, locale),
      transporteur: SHIPPING.carrier,
    }),

    colorwayLabel: t(dict, 'PRODUCT.COLORWAY_LABEL'),
    soldOut: t(dict, 'PRODUCT.SOLD_OUT'),

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

    photos,
    detailsTitle: t(dict, 'PRODUCT.DETAILS_TITLE'),
    detailsIntro: t(dict, 'PRODUCT.DETAILS_INTRO'),
    details,

    errorFormInvalid: t(dict, 'STATES.FORM_INVALID'),
    errorPackUnknown: t(dict, 'STATES.PACK_UNKNOWN'),
    errorPackSoldOut: t(dict, 'STATES.PACK_SOLD_OUT'),
    errorRateLimited: t(dict, 'STATES.RATE_LIMITED'),
    errorPaymentUnavailable: t(dict, 'STATES.PAYMENT_UNAVAILABLE'),
    errorPaymentFailed: t(dict, 'STATES.PAYMENT_FAILED'),
    errorPaymentBadResponse: t(dict, 'STATES.PAYMENT_BAD_RESPONSE'),
    errorPaymentOffline: t(dict, 'STATES.PAYMENT_OFFLINE'),
  }
}
