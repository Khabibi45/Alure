import { SITE } from '@/lib/site-config'
import { PRODUCT } from './product'

/**
 * JSON-LD `Product` de la page /leurre (règle n°9 : SEO structurel à la création).
 * Ne déclare QUE des faits réels : prix décidé, disponibilité dérivée des données
 * produit — jamais d'avis ni de note (aucun avis réel à ce jour, règle n°6).
 */
export function productJsonLd(): Record<string, unknown> {
  const anyAvailable = PRODUCT.colorways.some((c) => c.available)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: PRODUCT.name,
    description: `Leurre de pêche souple pour carnassiers, ${PRODUCT.specs.lengthCm} cm pour ${PRODUCT.specs.weightGrams} g. Livraison incluse (${PRODUCT.deliveryDelay}).`,
    brand: { '@type': 'Brand', name: SITE.name },
    // Dimensions déclarées : elles alimentent les résultats enrichis et doivent
    // correspondre au chiffre affiché sur la page (même source, PRODUCT.specs).
    size: `${PRODUCT.specs.lengthCm} cm`,
    weight: {
      '@type': 'QuantitativeValue',
      value: PRODUCT.specs.weightGrams,
      unitCode: 'GRM',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/leurre`,
      // Le prix pour UN exemplaire. Pas d'AggregateOffer : son `lowPrice` annoncerait
      // le prix moyen d'un panier de 5 (15,40 €), qu'on ne peut pas payer à l'unité —
      // un prix affiché en résultat de recherche doit être un prix réellement payable.
      price: (PRODUCT.pricing.soloCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: anyAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}
