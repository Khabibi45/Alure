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
    id: 'truite',
    workingName: 'Truite',
    src: '/models/leurre-truite.glb',
    colorwayId: 'coloris-1',
    collector: false,
    description:
      'Le leurre Alure en vue 3D, coloris « Truite arc-en-ciel » : dos jaune-olive, flanc blanc barré de rose, caudale translucide. Il nage sur place.',
    lines: [
      'Dos jaune-olive, flanc blanc barré de rose.',
      'Caudale souple et translucide, deux dorsales olive.',
      'Œil noir cerclé d’argent, anneau de tête chromé.',
    ],
  },
  {
    id: 'brochet',
    workingName: 'Brochet',
    src: '/models/leurre-brochet.glb',
    colorwayId: 'coloris-2',
    collector: false,
    description:
      'Le leurre Alure en vue 3D, coloris « Perche » : dos vert olive marbré, flanc jaune moucheté. Il nage sur place.',
    lines: [
      'Dos vert olive marbré, flanc jaune moucheté.',
      'Caudale souple et translucide, deux dorsales olive.',
      'Œil noir cerclé d’argent, anneau de tête chromé.',
    ],

  },
  {
    id: 'orange',
    workingName: 'Orange',
    src: '/models/leurre-orange.glb',
    colorwayId: 'coloris-3',
    collector: false,
    description:
      'Le leurre Alure en vue 3D, coloris « Orange feu » : corps orange vif, ventre plus clair. Il nage sur place.',
    lines: [
      'Corps orange vif, ventre plus clair.',
      'Caudale souple et translucide, deux dorsales assorties.',
      'Œil noir cerclé d’argent, anneau de tête chromé.',
    ],

  },
  {
    id: 'noir',
    workingName: 'Noir',
    src: '/models/leurre-noir.glb',
    // Ne se vend pas seul : il est offert à partir de trois leurres achetés.
    colorwayId: null,
    collector: true,
    description:
      'Le leurre collector Alure en vue 3D, coloris « Noir collector », offert avec la collection des trois coloris. Il nage sur place.',
    lines: [
      'Le collector. Il ne se vend pas : il s’obtient.',
      'Offert avec la collection des trois coloris.',
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
