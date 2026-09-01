/**
 * De quel côté est la QUEUE — mesuré sur la géométrie, jamais supposé.
 *
 * POURQUOI CE FICHIER EXISTE. Le moteur a longtemps SUPPOSÉ deux choses sur les
 * modèles : que l'axe long était X, et que la tête était du côté `axisMin`. La
 * première supposition a coûté un leurre agrandi 5,9 fois et plié en travers
 * (2026-09-01, cf. `docs/PROGRESS.md`) — on mesure désormais l'axe. La seconde
 * était fausse elle aussi : les leurres souples sortent de Meshy **tête du côté
 * `axisMax`**, donc l'animation de nage s'appliquait au NEZ du poisson.
 *
 * Les deux erreurs ont la même forme : une convention d'export prise pour une
 * loi. D'où ce module — la géométrie répond elle-même à la question.
 *
 * COMMENT ON TRANCHE. On coupe le corps en tranches perpendiculaires à l'axe
 * long et on cherche la **section la plus fine**. Sur tout leurre en forme de
 * poisson, ce point est le PÉDONCULE : le brin étroit qui relie le corps à la
 * caudale. Il est, par construction, du côté de la queue — c'est ce qui en fait
 * un repère fiable là où « le bout le plus épais » ne l'est pas (sur ces
 * modèles, la palette est plus large que le nez, et ce critère-là se tromperait).
 *
 * Mesuré sur les quatre leurres souples : pédoncule à la fraction 0,155,
 * section 0,0065–0,0072, soit ~16 fois moins que le corps à son maximum
 * (fraction 0,685). Les quatre donnent le même chiffre au millième.
 */

/**
 * Ce que le moteur sait d'un modèle une fois normalisé : son étendue sur l'axe
 * long, et de quel côté est la queue. `tailAtMin` est le fruit d'une MESURE —
 * ne jamais le remplacer par une constante « puisque tous nos modèles sont
 * pareils », c'est exactement l'erreur qui a fait fléchir le nez du poisson.
 */
export type LureBounds = {
  readonly axisMin: number
  readonly axisLength: number
  /** `true` si la queue (et donc la palette) est du côté X minimal. */
  readonly tailAtMin: boolean
}

/** Le nombre de tranches. Assez fin pour situer le pédoncule au centième près. */
export const ANATOMY_SLICES = 64

/**
 * La part de chaque extrémité qu'on ÉCARTE de la recherche.
 *
 * Sans elle, le minimum tomberait toujours sur la toute première ou la toute
 * dernière tranche : aux deux pointes, la section tend vers zéro. On ne cherche
 * donc le pédoncule que dans le corps, pas dans les bouts.
 */
export const ANATOMY_EDGE_SKIP = 0.08

/**
 * La fraction [0..1] de l'axe long où la section est la plus fine, ou `null` si
 * la mesure n'a pas de sens (géométrie vide, axe de longueur nulle).
 *
 * `positions` est un tampon de triplets x, y, z — l'attribut `position` d'une
 * BufferGeometry, déjà normalisé (axe long = X).
 */
export function measurePeduncleFraction(
  positions: ArrayLike<number>,
  axisMin: number,
  axisLength: number,
  slices: number = ANATOMY_SLICES
): number | null {
  if (!(axisLength > 0) || slices < 4 || positions.length < 3) return null

  const yMin = new Float64Array(slices).fill(Infinity)
  const yMax = new Float64Array(slices).fill(-Infinity)
  const zMin = new Float64Array(slices).fill(Infinity)
  const zMax = new Float64Array(slices).fill(-Infinity)
  const count = new Uint32Array(slices)

  for (let i = 0; i + 2 < positions.length; i += 3) {
    const fraction = (positions[i] - axisMin) / axisLength
    const slice = Math.min(slices - 1, Math.max(0, Math.floor(fraction * slices)))
    const y = positions[i + 1]
    const z = positions[i + 2]
    if (y < yMin[slice]) yMin[slice] = y
    if (y > yMax[slice]) yMax[slice] = y
    if (z < zMin[slice]) zMin[slice] = z
    if (z > zMax[slice]) zMax[slice] = z
    count[slice] += 1
  }

  const skip = Math.max(1, Math.round(slices * ANATOMY_EDGE_SKIP))
  let bestSlice = -1
  let bestSection = Infinity
  for (let slice = skip; slice < slices - skip; slice += 1) {
    if (count[slice] === 0) continue
    const section = (yMax[slice] - yMin[slice]) * (zMax[slice] - zMin[slice])
    if (section < bestSection) {
      bestSection = section
      bestSlice = slice
    }
  }

  if (bestSlice < 0) return null
  return (bestSlice + 0.5) / slices
}

/**
 * `true` si la queue (donc la palette) est du côté X minimal.
 *
 * Le pédoncule est TOUJOURS du côté de la queue : s'il tombe dans la première
 * moitié du corps, la queue est en `axisMin`. Une mesure impossible (`null`)
 * retombe sur `false`, c'est-à-dire l'ancienne convention « tête en axisMin » —
 * l'appelant doit alors le SIGNALER, jamais l'avaler en silence.
 */
export function tailIsAtAxisMin(peduncleFraction: number | null): boolean {
  return peduncleFraction !== null && peduncleFraction < 0.5
}
