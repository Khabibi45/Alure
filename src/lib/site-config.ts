/**
 * LA source unique de vérité du site : nom, domaine, description.
 * Lue par layout.tsx (metadata), sitemap.ts, robots.ts et les schémas JSON-LD.
 * Un changement de domaine/nom = UN SEUL fichier à modifier.
 */
export const SITE = {
  name: 'Alure',
  // TODO(cadrage 2026-08-05): domaine PROVISOIRE — non tranché, non acheté. À remplacer avant
  // toute mise en ligne (candidats vérifiés libres : alure-peche.fr, alure.fish,
  // alurefishing.com, alure-fishing.fr, alure-leurres.fr, alure.store — alure.fr est pris).
  url: 'https://alure-peche.fr',
  description:
    'Alure, le leurre articulé deux sections à la nage ultra-réaliste pour la pêche du black-bass et de la perche.',
  locale: 'fr_FR',
  /** Vente en ligne uniquement — pas d'adresse LocalBusiness. */
  address: null as null | { locality: string; region: string; country: string },
  /** Profils publics (JSON-LD sameAs) — à remplir quand les comptes Instagram/TikTok existent. */
  socialLinks: [] as string[],
} as const

export type SiteConfig = typeof SITE
