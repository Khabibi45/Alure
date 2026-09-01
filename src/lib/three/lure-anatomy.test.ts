// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { ANATOMY_SLICES, measurePeduncleFraction, tailIsAtAxisMin } from './lure-anatomy'

/**
 * Le filet de l'orientation.
 *
 * Ce que ces tests protègent n'est pas un calcul, c'est une DÉCISION : « la
 * partie la plus fine du corps est du côté de la queue ». Toute la nage en
 * dépend — si elle se retourne, l'animation part sur le nez du poisson, et
 * c'est exactement ce qui s'est produit avant le 2026-09-01.
 *
 * On travaille sur un poisson SYNTHÉTIQUE plutôt que sur un .glb : la mesure
 * doit être vraie de n'importe quel leurre en forme de poisson, pas seulement
 * des quatre fichiers du jour. Et un test qui n'ouvre aucun binaire reste
 * lisible et rapide.
 */

/** Le rayon du corps à une fraction donnée — le profil d'un shad à palette. */
function radiusAt(fraction: number): number {
  if (fraction < 0.3) return 0.04 + (fraction / 0.3) * 0.16 // museau → épaules
  if (fraction < 0.74) return 0.2 - ((fraction - 0.3) / 0.44) * 0.16 // effilement
  if (fraction < 0.89) return 0.03 // LE BRIN, la section minimale
  return 0.14 // LA PALETTE, large à nouveau
}

/**
 * Un leurre en anneaux, tête du côté `axisMin`. `mirrored` retourne le modèle
 * bout pour bout — c'est le cas réel des leurres souples de Meshy.
 */
function syntheticLure(mirrored = false): Float32Array {
  const RINGS = 200
  const PER_RING = 16
  const out = new Float32Array(RINGS * PER_RING * 3)
  let at = 0
  for (let r = 0; r < RINGS; r += 1) {
    const fraction = (r + 0.5) / RINGS
    const radius = radiusAt(fraction)
    const x = (mirrored ? 1 - fraction : fraction) * 2 - 1
    for (let k = 0; k < PER_RING; k += 1) {
      const angle = (k / PER_RING) * Math.PI * 2
      out[at++] = x
      out[at++] = Math.cos(angle) * radius
      out[at++] = Math.sin(angle) * radius
    }
  }
  return out
}

describe('measurePeduncleFraction — trouver le brin le plus fin', () => {
  it('trouve le pédoncule dans le brin, pas ailleurs sur le corps', () => {
    const fraction = measurePeduncleFraction(syntheticLure(), -1, 2)
    expect(fraction).not.toBeNull()
    // Le brin synthétique occupe 0,74 → 0,89 : le minimum doit y tomber.
    expect(fraction).toBeGreaterThanOrEqual(0.74)
    expect(fraction).toBeLessThanOrEqual(0.89)
  })

  it('suit le modèle quand il est retourné bout pour bout', () => {
    const fraction = measurePeduncleFraction(syntheticLure(true), -1, 2)
    expect(fraction).not.toBeNull()
    expect(fraction).toBeGreaterThanOrEqual(0.11)
    expect(fraction).toBeLessThanOrEqual(0.26)
  })

  it('ne se laisse pas prendre par les POINTES, qui tendent vers zéro', () => {
    // Sans l'écart des bords, le minimum tomberait toujours sur la première ou
    // la dernière tranche — la mesure serait constante et donc inutile.
    const fraction = measurePeduncleFraction(syntheticLure(), -1, 2)
    expect(fraction).toBeGreaterThan(0.1)
    expect(fraction).toBeLessThan(0.95)
  })

  it('ne dépend pas de la finesse du découpage', () => {
    for (const slices of [32, ANATOMY_SLICES, 128]) {
      const fraction = measurePeduncleFraction(syntheticLure(), -1, 2, slices)
      expect(fraction, `découpage à ${slices} tranches`).toBeGreaterThanOrEqual(0.7)
      expect(fraction, `découpage à ${slices} tranches`).toBeLessThanOrEqual(0.92)
    }
  })

  it('rend `null` plutôt qu’un chiffre faux quand la mesure n’a pas de sens', () => {
    // C'est le principe n°1 : jamais une valeur inventée en silence. L'appelant
    // reçoit `null` et le SIGNALE.
    expect(measurePeduncleFraction(new Float32Array(0), -1, 2)).toBeNull()
    expect(measurePeduncleFraction(syntheticLure(), -1, 0)).toBeNull()
    expect(measurePeduncleFraction(syntheticLure(), -1, -2)).toBeNull()
    expect(measurePeduncleFraction(syntheticLure(), -1, 2, 3)).toBeNull()
  })
})

describe('tailIsAtAxisMin — de quel côté est la palette', () => {
  it('lit correctement les deux orientations', () => {
    expect(tailIsAtAxisMin(measurePeduncleFraction(syntheticLure(), -1, 2))).toBe(false)
    expect(tailIsAtAxisMin(measurePeduncleFraction(syntheticLure(true), -1, 2))).toBe(true)
  })

  it('retombe sur l’ancienne convention quand la mesure a échoué', () => {
    // Un défaut assumé, pas une mesure : `normalizeGeometry` prévient en console.
    expect(tailIsAtAxisMin(null)).toBe(false)
  })
})
