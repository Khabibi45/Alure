/**
 * Les modèles 3D du leurre affichés dans le hero.
 *
 * Ce ne sont PAS les coloris du catalogue : `src/lib/shop/product.ts` reste la
 * seule source de vérité commerciale. Chaque modèle vendable pointe son coloris
 * via `colorwayId`, et c'est le LIBELLÉ du catalogue qui s'affiche
 * (`lureDisplayName`) — le `workingName` n'est que le nom du fichier livré.
 */

import { getColorway } from './shop/product'

export type LureModel = {
  id: string
  /** Nom de TRAVAIL, repris du nom du fichier livré. Provisoire — cf. en-tête. */
  workingName: string
  /** Fichier servi depuis `public/`, compressé par `scripts/optimize-glb.mjs`. */
  src: string
  /**
   * Coloris vendable correspondant, ou `null` si ce modèle ne se vend pas seul
   * (cas du collector, offert à partir d'une certaine quantité).
   */
  colorwayId: string | null
  /**
   * Modèle offert, non vendable à l'unité. Il s'affiche dans le carrousel de
   * l'accueil, mais le sélecteur de coloris de la page produit le montre verrouillé.
   */
  collector: boolean
  /** Équivalent textuel de la scène 3D : un canvas ne dit rien tout seul. */
  description: string
  /**
   * Ce que le panneau tape au clavier quand on clique le leurre.
   *
   * DESCRIPTIF, jamais une promesse de rendement : chaque ligne décrit ce qu'on
   * VOIT sur le modèle, donc chaque ligne est vérifiable. Les arguments de pêche
   * (« spécialiste du brochet », « favorable aux eaux troubles ») sont des
   * affirmations commerciales — elles n'entrent ici que dictées par Camil,
   * jamais déduites. TODO(Camil) : une ligne d'argument par coloris.
   */
  readonly lines: readonly string[]
}

export const LURE_MODELS: readonly LureModel[] = [
  {
    id: 'bleu',
    workingName: 'Bleu',
    src: '/models/leurre-souple-bleu.glb',
    colorwayId: 'coloris-1',
    collector: false,
    description: 'Le leurre souple Alure en vue 3D, coloris « Bleu ». Il nage sur place.',
    lines: ['Corps souple, coloris bleu.'],
  },
  {
    id: 'rouge',
    workingName: 'Rouge',
    src: '/models/leurre-souple-rouge.glb',
    colorwayId: 'coloris-2',
    collector: false,
    description: 'Le leurre souple Alure en vue 3D, coloris « Rouge ». Il nage sur place.',
    lines: ['Corps souple, coloris rouge.'],
  },
  {
    id: 'vert',
    workingName: 'Vert',
    src: '/models/leurre-souple-vert.glb',
    colorwayId: 'coloris-3',
    collector: false,
    description: 'Le leurre souple Alure en vue 3D, coloris « Vert ». Il nage sur place.',
    lines: ['Corps souple, coloris vert.'],
  },
  {
    id: 'noir',
    workingName: 'Noir',
    src: '/models/leurre-souple-noir.glb',
    // Vendu comme les autres depuis le 2026-09-04 : il est dans le pack.
    colorwayId: 'coloris-4',
    collector: false,
    description: 'Le leurre souple Alure en vue 3D, coloris « Noir ». Il nage sur place.',
    lines: ['Corps souple, coloris noir.'],
  },
] as const

/**
 * Le modèle du PROCHAIN leurre — celui que la section « Prochaine sélection »
 * fait tourner sur l'accueil.
 *
 * Il est déclaré À PART, et pas dans `LURE_MODELS`, parce que ce registre-là
 * commande le carrousel et le sélecteur de coloris : y ajouter le goujon le
 * mettrait en vente. Or il ne se vend pas, il n'a pas de coloris, et il n'a
 * même pas de nom de catalogue.
 *
 * Mais il est SERVI, donc il doit être déclaré quelque part : le test qui
 * traque les `.glb` orphelins de `public/models/` compte cette entrée avec les
 * autres. Sans elle, ajouter un modèle hors carrousel sortirait en gate rouge —
 * et le supprimer du code laisserait 8 Mo servis pour rien.
 */
export const NEXT_LURE_MODEL = '/models/goujon.glb'

/**
 * Le nom PUBLIC d'un modèle : le libellé du coloris au catalogue. Le
 * `workingName` (nom du fichier) ne sort jamais à l'écran — deux sources de
 * nommage finiraient par diverger.
 */
export function lureDisplayName(model: LureModel): string {
  if (model.colorwayId) return getColorway(model.colorwayId)?.label ?? model.workingName
  return model.workingName
}

/**
 * Les modèles réellement achetables — c'est-à-dire tous, depuis que le noir a
 * cessé d'être un collector (2026-09-04). Le champ `collector` reste dans le
 * type : il ne coûte rien et redevient utile le jour où une pièce ne se vendra
 * pas. Aujourd'hui aucun modèle ne le porte.
 */
export const SELLABLE_LURE_MODELS = LURE_MODELS.filter((m) => !m.collector)

/** Le modèle 3D à montrer pour un coloris donné. */
export function getModelForColorway(colorwayId: string): LureModel | undefined {
  return LURE_MODELS.find((m) => m.colorwayId === colorwayId)
}

/**
 * Ramène un index non borné (le carrousel compte indéfiniment vers le haut ou
 * vers le bas) sur un index réel de la liste. C'est ce qui rend la boucle infinie
 * sans jamais recopier les modèles.
 */
export function wrapIndex(value: number, count: number = LURE_MODELS.length): number {
  return ((value % count) + count) % count
}
