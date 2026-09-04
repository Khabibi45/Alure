import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site-config'
import { LEGAL_COMPLETE } from '@/lib/legal-config'
import {
  PREFIXED_LOCALES,
  TRANSLATED_PATHS,
  localePath,
  hreflangAlternates,
} from '@/lib/i18n/paths'

/**
 * Les chemins traduits viennent de `paths.ts` — la SOURCE UNIQUE, celle que le
 * sélecteur de langue et les hreflang consultent déjà. Ce fichier en gardait sa
 * propre copie : les deux ont divergé le jour où les routes anglaises ont été
 * créées, et le sitemap aurait continué d'annoncer deux pages sur onze.
 *
 * Les pages hors index (`/merci`, et les pages légales tant que
 * `legal-config.ts` n'est pas rempli) sont retirées ci-dessous — dans les DEUX
 * langues, sinon la version anglaise d'une page exclue se ferait indexer.
 */
const HORS_INDEX: readonly string[] = ['/merci']
const LEGALES: readonly string[] = [
  '/mentions-legales',
  '/cgv',
  '/retractation',
  '/confidentialite',
]

function absolute(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([code, path]) => [
      code,
      `${SITE.url}${path === '/' ? '' : path}`,
    ])
  )
}

/**
 * RÈGLE (n°9) : chaque nouvelle page indexable s'ajoute ICI à sa création.
 * Une page volontairement hors index est exclue ici ET dans robots.ts
 * (les deux côtés, sinon elle finit indexée quand même).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE.url}/leurre`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE.url}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE.url}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE.url}/suivi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE.url}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Les versions traduites des pages qui existent dans toutes les langues.
    ...PREFIXED_LOCALES.flatMap((locale) =>
      TRANSLATED_PATHS.filter(
        (path) => !HORS_INDEX.includes(path) && (LEGAL_COMPLETE || !LEGALES.includes(path))
      ).map((path) => ({
        url: `${SITE.url}${localePath(locale, path)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: path === '/' ? 0.7 : 0.4,
        alternates: { languages: absolute(hreflangAlternates(path).languages) },
      }))
    ),
    // /merci : volontairement HORS sitemap (page de retour paiement, noindex).
    // Pages légales : indexables seulement quand les données réelles sont
    // remplies dans legal-config.ts (règle n°9 : une page pas prête est exclue
    // du sitemap ET de l'index — les pages portent aussi leur noindex).
    ...(LEGAL_COMPLETE
      ? (['mentions-legales', 'cgv', 'retractation', 'confidentialite'] as const).map((slug) => ({
          url: `${SITE.url}/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'yearly' as const,
          priority: 0.2,
        }))
      : []),
  ]
}
