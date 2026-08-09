/**
 * LA source unique des informations légales du vendeur, consommée par les 4
 * pages légales. Un changement (adresse, médiateur…) = UN fichier.
 *
 * ⚠️ TODO(Logan) — champs à compléter avec les VRAIES données de la
 * micro-entreprise avant mise en ligne. Tant qu'un champ contient
 * « À COMPLÉTER », les pages légales restent noindex (robots.ts) et hors
 * sitemap ; le gate de mise en ligne (web-audit) bloque dessus.
 * Le médiateur de la consommation est OBLIGATOIRE pour un e-commerçant FR
 * (art. L612-1 code de la consommation) — s'inscrire auprès d'un médiateur
 * agréé et reporter ses coordonnées ici.
 */
export const LEGAL = {
  /** Nom et prénom du micro-entrepreneur (l'éditeur et directeur de publication). */
  vendorName: 'À COMPLÉTER : nom et prénom du micro-entrepreneur',
  /** Numéro SIREN de la micro-entreprise. */
  siren: 'À COMPLÉTER : SIREN',
  /** Adresse du siège (domicile du micro-entrepreneur). */
  address: 'À COMPLÉTER : adresse du siège',
  /** Email de contact public (obligation LCEN) — sur le futur domaine. */
  contactEmail: 'À COMPLÉTER : email de contact',
  /** Adresse de retour des colis (rétractation). */
  returnAddress: 'À COMPLÉTER : adresse de retour des colis',
  /** Médiateur de la consommation (nom + site) — inscription obligatoire. */
  mediator: 'À COMPLÉTER : médiateur de la consommation (nom et site web)',
  /** L'hébergeur, lui, est connu. */
  host: 'Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com',
} as const

/** Vrai quand tous les champs sont remplis : pilote l'indexation des pages légales. */
export const LEGAL_COMPLETE = !Object.values(LEGAL).some((v) => v.startsWith('À COMPLÉTER'))
