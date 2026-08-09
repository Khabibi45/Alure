import { getDictionary, t, type Locale } from '@/lib/i18n'
import { OFFERS, PRODUCT, formatEuros, formatLength, formatWeight } from '@/lib/shop/product'

/**
 * LA source unique du contenu FAQ, dans toutes les langues : la page ET le
 * JSON-LD FAQPage en dérivent (règle n°9). Les textes vivent dans
 * `docs/i18n/*.md` (clés `FAQ.Q_*` / `FAQ.A_*`), les CHIFFRES sont injectés
 * depuis `src/lib/shop/product` — jamais un montant écrit à la main.
 */

const FAQ_KEYS = [
  'DELIVERY_TIME',
  'SHIPPING_COST',
  'BULK',
  'SIZE',
  'TRACK',
  'RETURN',
  'LOST',
  'PAYMENT',
  'WHO',
] as const

export type FaqItem = { question: string; answer: string }

export function faqItems(locale: Locale): FaqItem[] {
  const dict = getDictionary(locale)
  const params = {
    delai: t(dict, 'PRODUCT.DELAY_VALUE'),
    prixSolo: formatEuros(PRODUCT.pricing.soloCents),
    prixCollection: formatEuros(OFFERS.collection.amountCents),
    nbColoris: String(PRODUCT.colorways.length),
    collector: PRODUCT.collector.label,
    longueur: formatLength(locale),
    poids: formatWeight(locale),
  }
  return FAQ_KEYS.map((key) => ({
    question: t(dict, `FAQ.Q_${key}`, params),
    answer: t(dict, `FAQ.A_${key}`, params),
  }))
}

/** JSON-LD FAQPage dérivé du même contenu, dans la même langue. */
export function faqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
