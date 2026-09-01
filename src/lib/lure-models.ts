/**
 * Les modèles 3D du leurre affichés dans le hero.
 *
 * Ce ne sont PAS les coloris du catalogue : `src/lib/shop/product.ts` reste la
 * seule source de vérité commerciale. Chaque modèle vendable pointe son coloris
 * via `colorwayId`, et c'est le LIBELLÉ du catalogue qui s'affiche
 * (`lureDisplayName`) — le `workingName` n'est que le nom du fichier livré.
 */

import { PRODUCT, getColorway } from './shop/product'

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
    description:
      'Le leurre souple Alure en vue 3D, coloris « Bleu ». Il nage sur place.',
    lines: ['Corps souple, coloris bleu.'],
  },
  {
    id: 'rouge',
    workingName: 'Rouge',
    src: '/models/leurre-souple-rouge.glb',
    colorwayId: 'coloris-2',
    collector: false,
    description:
      'Le leurre souple Alure en vue 3D, coloris « Rouge ». Il nage sur place.',
    lines: ['Corps souple, coloris rouge.'],
  },
  {
    id: 'vert',
    workingName: 'Vert',
    src: '/models/leurre-souple-vert.glb',
    colorwayId: 'coloris-3',
    collector: false,
    description:
      'Le leurre souple Alure en vue 3D, coloris « Vert ». Il nage sur place.',
    lines: ['Corps souple, coloris vert.'],
  },
  {
    id: 'noir',
    workingName: 'Noir',
    src: '/models/leurre-souple-noir.glb',
    // Ne se vend pas seul : il se CHOISIT comme 4e leurre offert (3 achetés).
    colorwayId: null,
    collector: true,
    description:
      'Le leurre souple collector Alure en vue 3D, coloris « Pirate » : corps noir, à choisir comme 4e leurre offert dès 3 achetés. Il nage sur place.',
    lines: [
      'Le collector. Il ne se vend pas : il s’obtient.',
      'À choisir comme 4e leurre offert, dès 3 achetés.',
      'Corps noir, mêmes cotes, même nage.',
    ],
  },
] as const

/**
 * Le nom PUBLIC d'un modèle : le libellé du coloris au catalogue pour un modèle
 * vendable, celui du collector sinon. Le `workingName` (nom du fichier) ne sort
 * jamais à l'écran — deux sources de nommage finiraient par diverger.
 */
export function lureDisplayName(model: LureModel): string {
  if (model.colorwayId) return getColorway(model.colorwayId)?.label ?? model.workingName
  return model.collector ? PRODUCT.collector.label : model.workingName
}

/** Les modèles réellement achetables (le collector n'en fait pas partie). */
export const SELLABLE_LURE_MODELS = LURE_MODELS.filter((m) => !m.collector)

/** Le modèle offert, s'il y en a un. */
export const COLLECTOR_LURE_MODEL = LURE_MODELS.find((m) => m.collector) ?? null

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
