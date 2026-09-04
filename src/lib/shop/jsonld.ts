import { SITE } from '@/lib/site-config'
import { PACKS, SHIPPING, PRODUCT } from './product'

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
      // Le prix du PACK de leurres — la seule façon de l'acheter depuis le
      // 2026-09-04. Un prix affiché en résultat de recherche doit être un prix
      // réellement payable : ce n'est donc ni un prix à l'unité (qui n'existe
      // plus), ni un total livraison comprise (qui dépend de la commande).
      price: (PACKS.leurres.amountCents / 100).toFixed(2),
      // La livraison est ANNONCÉE, pas fondue dans le prix : Google la présente
      // à part, et un « + 3,60 € » découvert au paiement est un litige.
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: (SHIPPING.amountCents / 100).toFixed(2),
          currency: 'EUR',
        },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      },
      priceCurrency: 'EUR',
      availability: anyAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}
