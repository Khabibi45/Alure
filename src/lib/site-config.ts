/**
 * LA source unique de vérité du site : nom, domaine, description.
 * Lue par layout.tsx (metadata), sitemap.ts, robots.ts et les schémas JSON-LD.
 * Un changement de domaine/nom = UN SEUL fichier à modifier.
 */
export const SITE = {
  name: 'Alure',
  // Domaine TRANCHÉ le 2026-09-02 (décision Camil) : alure-outdoor.com. Il remplace le
  // provisoire `alure-peche.fr`, qui n'avait jamais été acheté. C'est cette valeur que
  // suivent le sitemap, robots.txt, les URL canoniques, les hreflang et le JSON-LD — un
  // seul fichier à changer, et c'est ce qui rend le changement sûr.
  url: 'https://alure-outdoor.com',
  description:
    'Alure, le leurre souple à la nage ultra-réaliste pour la pêche du black-bass et de la perche.',
  locale: 'fr_FR',
  /** Vente en ligne uniquement — pas d'adresse LocalBusiness. */
  address: null as null | { locality: string; region: string; country: string },
  /**
   * Profils publics, repris en `sameAs` dans le JSON-LD : c'est ce qui permet à Google de
   * relier le site au compte. Renseigné le 2026-09-02 — le compte Instagram existe.
   */
  socialLinks: ['https://www.instagram.com/alurefishing/'] as string[],
} as const

export type SiteConfig = typeof SITE
