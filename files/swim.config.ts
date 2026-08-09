/**
 * Rôle : source unique de vérité pour les constantes d'animation et le registre des leurres.
 *
 * Pourquoi un fichier de config isolé : les paramètres de nage sont des valeurs de tuning
 * que l'on veut ajuster sans jamais rouvrir le shader ni le composant. Zéro nombre magique
 * ailleurs dans le module.
 *
 * CONTRAT D'ORIENTATION (vérifié sur les 3 .glb fournis) :
 *   - axe LONG du corps          = X  (tête vers -X, queue vers +X, ou l'inverse selon le modèle)
 *   - axe LATÉRAL d'ondulation   = Z  (l'axe le plus fin de la bounding box)
 * Tout modèle ajouté au registre doit respecter ce contrat, sinon renseigner `rotation`
 * dans sa définition pour l'y ramener.
 */

/** Longueur cible en unités monde après normalisation. Uniformise 3 modèles d'échelles différentes. */
export const TARGET_LURE_LENGTH = 2;

/** Anisotropie appliquée aux textures. 8 est le compromis qualité/perf standard sur desktop. */
export const TEXTURE_ANISOTROPY = 8;

/**
 * Meshy/Blender exportent `emissiveFactor: [1,1,1]` + une texture émissive.
 * Résultat : le leurre s'auto-éclaire et le PBR est écrasé (aspect « sticker » plat).
 * On coupe l'émissif par défaut. Remonter à 0.15 max pour un effet holographique.
 */
export const DEFAULT_EMISSIVE_INTENSITY = 0;

/**
 * Rapports de fréquence des mouvements de corps secondaires par rapport à l'onde principale.
 *
 * Volontairement irrationnels (≈ 1/2, 1/3, 1/π) : des rapports entiers resynchroniseraient
 * périodiquement tous les mouvements et l'œil percevrait une boucle. Des rapports non
 * commensurables donnent un mouvement qui ne se répète jamais exactement.
 */
export const ROLL_FREQUENCY_RATIO = 0.5;
export const YAW_FREQUENCY_RATIO = 0.33;
export const BOB_FREQUENCY_RATIO = 0.318;

/** Paramètres d'une onde de nage. Toutes les valeurs sont sans unité sauf mention. */
export interface SwimPreset {
  /** Amplitude latérale, exprimée en FRACTION de la longueur du corps. 0.05 = 5 % de la longueur. */
  readonly amplitudeRatio: number;
  /** Nombre de radians d'onde répartis sur le corps. 6.28 = exactement une sinusoïde complète. */
  readonly frequency: number;
  /** Vitesse de propagation de l'onde, en radians/seconde. */
  readonly speed: number;
  /** Coordonnée normalisée [0..1] en dessous de laquelle le corps est rigide (la tête ne bouge pas). */
  readonly headAnchor: number;
  /** Exposant de l'enveloppe d'amplitude. > 1 concentre le mouvement sur la queue. */
  readonly tailBias: number;
  /** Roulis du corps entier autour de l'axe long, en radians. */
  readonly rollAmplitude: number;
  /** Lacet du corps entier autour de l'axe vertical, en radians. */
  readonly yawAmplitude: number;
  /** Oscillation verticale du corps entier, en unités monde. */
  readonly bobAmplitude: number;
}

/**
 * Trois comportements de nage correspondant aux familles réelles de leurres.
 * `satisfies` (et non `:`) pour conserver l'inférence littérale des clés → SwimPresetName typé.
 */
export const SWIM_PRESETS = {
  /** Jerkbait : corps rigide, action nerveuse concentrée sur l'arrière. */
  jerkbait: {
    amplitudeRatio: 0.035,
    frequency: 4.2,
    speed: 7.5,
    headAnchor: 0.35,
    tailBias: 2.2,
    rollAmplitude: 0.12,
    yawAmplitude: 0.09,
    bobAmplitude: 0.02,
  },
  /** Crankbait : roulis marqué, ondulation ample et lente. */
  crankbait: {
    amplitudeRatio: 0.05,
    frequency: 5.0,
    speed: 5.5,
    headAnchor: 0.2,
    tailBias: 1.6,
    rollAmplitude: 0.26,
    yawAmplitude: 0.05,
    bobAmplitude: 0.035,
  },
  /** Souple : corps entièrement mou, onde longue qui part presque de la tête. */
  softbait: {
    amplitudeRatio: 0.075,
    frequency: 6.3,
    speed: 4.5,
    headAnchor: 0.08,
    tailBias: 1.3,
    rollAmplitude: 0.06,
    yawAmplitude: 0.14,
    bobAmplitude: 0.05,
  },
} satisfies Record<string, SwimPreset>;

export type SwimPresetName = keyof typeof SWIM_PRESETS;

/** Description déclarative d'un leurre affichable. */
export interface LureDefinition {
  readonly id: string;
  readonly label: string;
  /** Chemin servi statiquement (ex. /public/models/... en Vite ou Next). */
  readonly url: string;
  readonly preset: SwimPresetName;
  /** Correction d'orientation si le modèle ne respecte pas le contrat X-long / Z-latéral. */
  readonly rotation?: readonly [number, number, number];
}

/**
 * Annotation explicite `readonly LureDefinition[]` plutôt que `as const satisfies` :
 * avec `as const`, TypeScript infère le type littéral exact de chaque entrée, et la
 * propriété optionnelle `rotation` devient inaccessible sur celles qui ne la déclarent pas.
 */
export const LURES: readonly LureDefinition[] = [
  { id: 'brochet', label: 'Leurre brochet', url: '/models/leurre_brochet.glb', preset: 'jerkbait' },
  { id: 'orange', label: 'Leurre orange', url: '/models/leurre_orange.glb', preset: 'crankbait' },
  { id: 'truite', label: 'Leurre truite', url: '/models/leurre_truite.glb', preset: 'softbait' },
];
