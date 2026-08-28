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

/* ────────────────────── La rotation libre (page produit) ────────────────────── */

/**
 * Le tangage est borné à un quart de tour, EXACTEMENT les vues « Dessus » et
 * « Dessous ». Ce n'est pas un chiffre choisi au hasard : le geste atteint donc
 * précisément ce que les boutons atteignent, ni plus — le leurre ne se retourne
 * jamais tête en bas — ni moins.
 *
 * Le lacet, lui, n'est pas borné : un leurre se regarde sur 360°.
 */
export const ORBIT_MAX_PITCH = Math.PI / 2

/**
 * La sensibilité, exprimée en fraction de CADRE et non en degrés par pixel :
 * balayer toute la largeur fait un demi-tour. Un réglage en °/px se trompe
 * forcément d'un bout — trop lent sur un téléphone de 335 px, incontrôlable sur
 * un écran large. Normalisé, l'énoncé reste vrai partout.
 */
export const ORBIT_RADIANS_PER_FRAME_WIDTH = Math.PI

/** Le pas d'un appui sur une flèche : 15°, soit 24 appuis pour un tour complet. */
export const ORBIT_KEY_STEP = Math.PI / 12

/** Ramène un tangage dans ses bornes. Pur, pour être testable sans trois.js. */
export function clampOrbitPitch(pitch: number): number {
  return Math.min(ORBIT_MAX_PITCH, Math.max(-ORBIT_MAX_PITCH, pitch))
}

/**
 * Compose les angles d'orbite en rotation d'Euler, dans l'ordre XYZ de three.
 *
 * Cet ordre donne R = Rx(tangage) · Ry(lacet) · Rz(roulis) : le leurre pivote
 * d'abord sur sa propre verticale, puis bascule autour de l'horizontale de
 * l'ÉCRAN. C'est le comportement « tourne-disque » qu'on attend d'un objet
 * qu'on manipule — et c'est celui que les six vues nommées utilisent déjà.
 * En ordre `YXZ`, l'axe de bascule dériverait avec le lacet et la manipulation
 * deviendrait imprévisible dès un quart de tour.
 */
export function orbitToEuler(
  yaw: number,
  pitch: number,
  roll = 0
): readonly [number, number, number] {
  return [clampOrbitPitch(pitch), yaw, roll]
}
