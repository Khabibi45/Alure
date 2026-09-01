/**
 * Constantes de la nage procédurale. LA source unique des valeurs de réglage :
 * aucun nombre magique dans le shader ni dans la scène.
 *
 * LE MODÈLE PHYSIQUE (revu le 2026-09-01, consigne Camil : « la seule animation
 * doit se faire depuis la charnière entre le paddle et le corps »).
 *
 * Le produit est un leurre SOUPLE à PALETTE, d'une seule pièce moulée. Trois
 * zones, et une seule bouge vraiment :
 *
 *   LE CORPS    — rigoureusement immobile. Pas un sommet ne se déplace.
 *   LE BRIN     — la partie fine et striée. Elle fléchit, et TRÈS peu : son
 *                 angle monte de 0 (côté corps) au maximum (côté palette).
 *   LA PALETTE  — rigide. Elle ne se déforme pas, elle PIVOTE, d'un bloc.
 *
 * Les deux modèles précédents sont caducs et le rester : l'articulé à deux
 * pièces de PVC (2026-08-08) décrivait un autre produit, et la « queue qui
 * ondule jusqu'à la pointe » (plus tôt le 2026-09-01) faisait travailler toute
 * l'arrière du leurre au lieu de la seule palette.
 *
 * CONTRAT D'ORIENTATION — et il ne se suppose plus, il se MESURE :
 *   axe LONG du corps = X (mesuré : `normalizeGeometry` redresse la géométrie) ;
 *   côté de la QUEUE  = mesuré (`src/lib/three/lure-anatomy.ts`, par le
 *                       pédoncule). Les leurres souples sortent de Meshy tête
 *                       du côté `axisMax` — l'inverse de ce que le moteur
 *                       supposait, ce qui faisait fléchir le NEZ du poisson ;
 *   axe LATÉRAL       = Z ;
 *   la flexion compose un lacet (autour de Y) et un tangage (autour de Z).
 *
 * Toutes les fractions de ce fichier se comptent DEPUIS LA TÊTE : 0 = le nez,
 * 1 = le bout de la palette, quel que soit le sens du modèle sur l'axe X.
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
 * Rapports de fréquence des mouvements du CORPS ENTIER par rapport au battement de la
 * palette. Volontairement non commensurables (≈ 1/2, 1/3, 1/π) : avec des rapports
 * entiers, tous les mouvements se resynchroniseraient périodiquement et l'œil verrait
 * la boucle.
 *
 * Ils portent le mouvement d'ensemble du leurre — celui qui se superpose à la flexion
 * de la palette sans jamais lui voler la vedette (cf. `LURE_SWIM`).
 */
export const ROLL_FREQUENCY_RATIO = 0.5
export const YAW_FREQUENCY_RATIO = 0.33
export const BOB_FREQUENCY_RATIO = 0.318

export type SwimPreset = {
  /**
   * Où commence le brin fin et strié, en FRACTION [0..1] de la longueur DEPUIS
   * LA TÊTE (0 = nez, 1 = bout de la palette). Avant lui, le corps est
   * absolument rigide : pas un sommet ne bouge.
   *
   * C'est aussi le POINT DE PIVOT. Le brin fléchit progressivement à partir de
   * là, et tout ce qui suit la charnière tourne d'un bloc autour de ce point.
   */
  readonly stemStartRatio: number
  /**
   * La CHARNIÈRE : la fraction, toujours depuis la tête, où la palette
   * s'attache au brin fin. Au-delà, l'angle ne bouge plus — la palette est donc
   * rigoureusement RIGIDE, elle ne fait que pivoter.
   *
   * Entre `stemStartRatio` et cette valeur, l'angle monte linéairement de 0 au
   * maximum : c'est le brin qui « s'ondule à peine », d'autant moins qu'on est
   * près du corps.
   */
  readonly hingeRatio: number
  /**
   * Balayage LATÉRAL (gauche-droite) de la palette, en radians de part et
   * d'autre. C'est le mouvement principal.
   */
  readonly paddleYawAmplitude: number
  /** Battement VERTICAL (bas-haut) de la palette, en radians de part et d'autre. */
  readonly paddlePitchAmplitude: number
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
 * Réglage RÉVISÉ le 2026-09-01 (consigne Camil, au vu du rendu) :
 *
 *   « la seule animation doit se faire depuis la charnière entre le paddle et le
 *   corps du leurre, la partie la plus fine et striée doit s'onduler à peine, la
 *   nage doit être linéaire et le paddle seulement doit bouger avec la charnière. »
 *
 * LES DEUX FRACTIONS NE SONT PAS CHOISIES, ELLES SONT MESURÉES. Le leurre a été
 * découpé en 100 tranches le long de son axe long et chaque section relevée. Le
 * résultat, identique sur les quatre coloris :
 *
 *   fraction (depuis la tête) │ ce qu'on y trouve
 *   ──────────────────────────┼──────────────────────────────────────────────
 *   0,00 → 0,31               │ tête puis épaules ; section maximale à 0,315
 *   0,31 → 0,74               │ le corps s'effile régulièrement
 *   0,74 → 0,89               │ LE BRIN FIN ET STRIÉ — section minimale (0,0072,
 *                             │ soit 16 fois moins que les épaules) à 0,845
 *   0,89 → 1,00               │ LA PALETTE — la tranche la plus plate du modèle
 *                             │ (rapport 0,27) à son extrémité
 *
 * D'où `stemStartRatio = 0.74` et `hingeRatio = 0.89` : ce sont les bornes du
 * brin, relevées, pas des curseurs de goût.
 *
 * LE CORPS BOUGE, MAIS À PEINE (consigne du 2026-09-01 : « fais légèrement
 * bouger le corps du leurre aussi »). C'est un mouvement d'ENSEMBLE — le leurre
 * entier oscille — alors que la flexion, elle, ne concerne que le brin et la
 * palette. Les deux se superposent sans se confondre.
 *
 * L'ordre de grandeur EST le sujet : le lacet du corps vaut moins du septième du
 * balayage de la palette. Au-delà, le corps cesserait de servir de référence et
 * on ne verrait plus la palette battre — on verrait le leurre entier se tortiller.
 * Un test garde cet écart.
 *
 * ⚠️ LES AMPLITUDES, ELLES, SE JUGENT À L'ŒIL. Contrairement aux fractions,
 * elles ne se mesurent pas sur le modèle : ce sont des curseurs.
 */
export const LURE_SWIM: SwimPreset = {
  stemStartRatio: 0.74,
  hingeRatio: 0.89,
  // Le latéral domine — une palette balaie surtout de gauche à droite. Les deux
  // oscillations partagent la MÊME phase : la palette décrit donc une droite en
  // diagonale, jamais une ellipse. C'est ça, la « nage linéaire ».
  paddleYawAmplitude: 0.45,
  paddlePitchAmplitude: 0.22,
  speed: 4.6,
  // Le corps : 3,4° de lacet, 1,4° de roulis, et un bercement de 0,6 % de la
  // longueur du leurre. Assez pour qu'il ne paraisse pas cloué, pas assez pour
  // qu'on le regarde à la place de la palette.
  rollAmplitude: 0.025,
  yawAmplitude: 0.06,
  bobAmplitude: 0.012,
}
