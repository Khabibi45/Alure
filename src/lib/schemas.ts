import { SITE } from './site-config'

/**
 * Constructeurs de schémas JSON-LD (Schema.org), tous ancrés sur site-config.ts.
 * À injecter via <JsonLd data={...} /> (components/seo/JsonLd.tsx).
 * Règle : le JSON-LD dit la VÉRITÉ — pas d'adresse fictive, pas de note inventée.
 */

type Schema = Record<string, unknown>

export function organizationSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: `${SITE.url}/icon.png`,
    ...(SITE.socialLinks.length > 0 ? { sameAs: SITE.socialLinks } : {}),
    ...(SITE.address
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: SITE.address.locality,
            addressRegion: SITE.address.region,
            addressCountry: SITE.address.country,
          },
        }
      : {}),
  }
}

export function webSiteSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
  }
}

export function faqSchema(items: { question: string; answer: string }[]): Schema {
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

export function articleSchema(input: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
}): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: `${SITE.url}${input.path}`,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }
}
