/**
 * Constantes de la nage procédurale. LA source unique des valeurs de réglage :
 * aucun nombre magique dans le shader ni dans la scène.
 *
 * LE MODÈLE PHYSIQUE (imposé par le produit réel, consigne du 2026-08-08) :
 * le leurre est en PVC, en DEUX PIÈCES RIGIDES reliées par une charnière —
 *   partie 1 : tête, buste, premier hameçon ;
 *   partie 2 : corps arrière, finition triangulaire, hameçon, queue.
 * SEULE l'articulation bouge. Aucune ondulation ne parcourt le corps, la queue
 * ne bat pas d'elle-même : la partie arrière pivote d'un bloc autour de la
 * charnière. C'est une rotation rigide — donc longueur d'arc préservée et
 * normales exactes, par construction.
 *
 * CONTRAT D'ORIENTATION (vérifié sur les .glb) :
 *   axe LONG du corps = X, tête du côté de `axisMin` ;
 *   axe LATÉRAL      = Z (le plus fin de la bounding box) ;
 *   la charnière est un axe VERTICAL (Y) planté à `hingeRatio` de la longueur.
 * Un modèle ajouté qui ne le respecte pas doit être redressé avant d'entrer ici.
 */

/** Longueur cible après normalisation. Uniformise des modèles d'échelles différentes. */
export const TARGET_LURE_LENGTH = 2

/** Anisotropie des textures — compromis qualité/perf standard. */
export const TEXTURE_ANISOTROPY = 8

/**
 * Les exports portent `emissiveFactor: [1,1,1]` + une texture émissive : le leurre
 * s'auto-éclaire et écrase le PBR (aspect « sticker » plat, insensible à la lumière).
 * On coupe l'émissif.
 */
export const DEFAULT_EMISSIVE_INTENSITY = 0

/**
 * Rapports de fréquence des mouvements de corps par rapport au battement de la charnière.
 * Volontairement non commensurables (≈ 1/2, 1/3, 1/π) : avec des rapports entiers, tous les
 * mouvements se resynchroniseraient périodiquement et l'œil verrait la boucle.
 */
export const ROLL_FREQUENCY_RATIO = 0.5
export const YAW_FREQUENCY_RATIO = 0.33
export const BOB_FREQUENCY_RATIO = 0.318

export type SwimPreset = {
  /**
   * Position de la charnière, en FRACTION [0..1] de la longueur du corps depuis
   * la tête — bounding box complète, POINTE DE CAUDALE COMPRISE (elle allonge
   * nettement la boîte). Mesurée sur le rendu 3D : les broches de l'articulation
   * tombent à ~47 % de cette longueur totale.
   */
  readonly hingeRatio: number
  /** Débattement maximal de la partie arrière, en radians de part et d'autre. */
  readonly hingeAmplitude: number
  /** Pulsation du battement, rad/s. */
  readonly speed: number
  /** Roulis du corps entier autour de l'axe long, en radians. */
  readonly rollAmplitude: number
  /** Lacet du corps entier autour de l'axe vertical, en radians. */
  readonly yawAmplitude: number
  /** Oscillation verticale du corps entier, en unités de scène. */
  readonly bobAmplitude: number
}

/**
 * LE réglage de nage — au singulier, et c'est le fond du sujet : les quatre
 * coloris sont le MÊME leurre sorti du même moule. Des « personnalités » de
 * nage différentes par coloris (l'ancien système jerkbait/crankbait/softbait)
 * étaient une fiction : l'animation est identique sur tous les modèles 3D,
 * fidèle à la pièce en PVC.
 */
/**
 * Réglage RÉVISÉ le 2026-09-01, au passage aux leurres souples.
 *
 * L'articulé avait une charnière réelle à 47 % du corps, et le shader la
 * reproduisait : une cassure nette entre deux pièces rigides. Un leurre souple
 * n'a pas de charnière — appliquer l'ancien réglage le plierait en deux au
 * milieu, ce qui ne ressemble à rien.
 *
 * On recule donc le pivot vers la caudale et on adoucit le débattement : le
 * corps reste tenu, la queue travaille. Ce n'est pas encore une ondulation
 * (le shader ne sait faire qu'une rotation autour d'un axe), mais c'est
 * l'approximation la plus proche de ce que fait un souple à la traction.
 *
 * ⚠️ À REVOIR À L'ŒIL sur les nouveaux modèles : ces trois nombres ont été
 * choisis par raisonnement, pas mesurés sur le rendu comme les précédents.
 */
export const LURE_SWIM: SwimPreset = {
  // 0.62 : le pivot passe derrière le corps, à l'attache de la caudale.
  hingeRatio: 0.62,
  // Plus de débattement qu'un articulé, mais réparti sur une pièce souple.
  hingeAmplitude: 0.38,
  speed: 4.6,
  rollAmplitude: 0.06,
  yawAmplitude: 0.12,
  bobAmplitude: 0.03,
}
