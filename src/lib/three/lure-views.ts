/**
 * Les angles sous lesquels on peut regarder le leurre dans le hero.
 *
 * Les rotations découlent du CONTRAT D'ORIENTATION des .glb (cf. `swim.config.ts`) :
 *   axe long du corps = X, tête vers −X · vertical = Y · axe latéral (le plus fin) = Z.
 * La caméra est en +Z et regarde vers −Z. Chaque vue amène donc la face voulue sur +Z.
 *
 * Ajouter une vue = ajouter une entrée ici, et rien d'autre : le sélecteur, l'ordre des
 * boutons et l'annonce aux lecteurs d'écran en découlent.
 */

export type LureViewId = 'droite' | 'gauche' | 'dessus' | 'dessous' | 'devant' | 'derriere'

export type LureView = {
  readonly id: LureViewId
  /** Libellé du bouton. */
  readonly label: string
  /** Rotation appliquée au leurre, en radians (ordre XYZ de three). */
  readonly rotation: readonly [number, number, number]
  /** Ce que la vue montre — lu par les lecteurs d'écran, le canvas ne dit rien. */
  readonly description: string
}

const QUARTER = Math.PI / 2

export const LURE_VIEWS: readonly LureView[] = [
  {
    id: 'droite',
    label: 'Droite',
    rotation: [0, 0, 0],
    description: 'flanc droit',
  },
  {
    id: 'gauche',
    label: 'Gauche',
    // Demi-tour : c'est l'autre flanc qui fait face.
    rotation: [0, Math.PI, 0],
    description: 'flanc gauche',
  },
  {
    id: 'dessus',
    label: 'Dessus',
    // +Y amené sur +Z : on regarde le dos.
    rotation: [QUARTER, 0, 0],
    description: 'vu de dessus, le dos',
  },
  {
    id: 'dessous',
    label: 'Dessous',
    // −Y amené sur +Z : on regarde le ventre et les hameçons.
    rotation: [-QUARTER, 0, 0],
    description: 'vu de dessous, le ventre et les hameçons',
  },
  {
    id: 'devant',
    label: 'Devant',
    // La tête (−X) amenée sur +Z : le leurre fait face.
    rotation: [0, QUARTER, 0],
    description: 'de face, tête vers vous',
  },
  {
    id: 'derriere',
    label: 'Derrière',
    // La queue (+X) amenée sur +Z : on voit le leurre s'éloigner, comme le
    // poisson qui le suit.
    rotation: [0, -QUARTER, 0],
    description: 'de dos, caudale vers vous',
  },
] as const

/** La vue au premier affichage : le flanc, c'est là qu'un leurre se lit le mieux. */
export const DEFAULT_LURE_VIEW: LureViewId = 'droite'

export function getLureView(id: LureViewId): LureView {
  const view = LURE_VIEWS.find((v) => v.id === id)
  // Le type garantit l'existence ; ceci protège d'un id lu depuis l'extérieur.
  if (!view) throw new Error(`Vue de leurre inconnue : ${id}`)
  return view
}
