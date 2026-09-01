// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { createSwimUniforms } from './swim-material'
import { LURE_SWIM } from './swim.config'
import type { LureBounds } from './lure-anatomy'

/**
 * Le filet de la rampe de flexion.
 *
 * Le shader ne fait qu'UNE chose : `t = clamp((x − pivot) · invSpan, 0, 1)`, et
 * tout le comportement en découle — corps immobile à `t = 0`, brin qui plie
 * entre les deux, palette rigide à `t = 1`. Ce qui rend cette formule correcte
 * ou fausse, c'est la conversion des fractions du preset (comptées DEPUIS LA
 * TÊTE) en coordonnées de scène (comptées en X croissants). Les deux ne vont
 * dans le même sens que si la tête est en `axisMin`.
 *
 * On ne peut pas exécuter du GLSL ici — mais on peut recalculer la rampe
 * exactement comme le shader, à partir des uniforms réellement produits. Une
 * inversion de sens se verrait alors immédiatement : le corps prendrait le
 * mouvement de la palette.
 */

/** La rampe du shader, à la virgule près (cf. `swimPaddleAngles`). */
function ramp(uniforms: ReturnType<typeof createSwimUniforms>, x: number): number {
  const raw = (x - uniforms.uSwimStemStartX.value) * uniforms.uSwimInvStemSpan.value
  return Math.min(1, Math.max(0, raw))
}

/** La coordonnée X d'une fraction comptée depuis la tête, pour une orientation donnée. */
function sceneX(bounds: LureBounds, fromHead: number): number {
  const headX = bounds.tailAtMin ? bounds.axisMin + bounds.axisLength : bounds.axisMin
  return headX + (bounds.tailAtMin ? -1 : 1) * fromHead * bounds.axisLength
}

const ORIENTATIONS: readonly { nom: string; bounds: LureBounds }[] = [
  // Le cas RÉEL des leurres souples : tête en axisMax, palette en axisMin.
  { nom: 'palette du côté X min', bounds: { axisMin: -1, axisLength: 2, tailAtMin: true } },
  // L'ancienne convention, toujours possible pour un modèle futur.
  { nom: 'palette du côté X max', bounds: { axisMin: -1, axisLength: 2, tailAtMin: false } },
]

describe('createSwimUniforms — la rampe, dans les deux sens', () => {
  for (const { nom, bounds } of ORIENTATIONS) {
    describe(nom, () => {
      const uniforms = createSwimUniforms(LURE_SWIM, bounds)

      it('laisse tout le CORPS parfaitement immobile', () => {
        for (const fromHead of [0, 0.2, 0.5, LURE_SWIM.stemStartRatio]) {
          expect(ramp(uniforms, sceneX(bounds, fromHead)), `fraction ${fromHead}`).toBe(0)
        }
      })

      it('fait plier le BRIN progressivement, et à peine près du corps', () => {
        const debut = ramp(uniforms, sceneX(bounds, LURE_SWIM.stemStartRatio + 0.01))
        const milieu = ramp(
          uniforms,
          sceneX(bounds, (LURE_SWIM.stemStartRatio + LURE_SWIM.hingeRatio) / 2)
        )
        expect(debut).toBeGreaterThan(0)
        expect(debut).toBeLessThan(0.2)
        expect(milieu).toBeCloseTo(0.5, 6)
      })

      it('rend la PALETTE rigide : même valeur partout, donc même rotation', () => {
        const surLaPalette = [LURE_SWIM.hingeRatio, 0.93, 0.97, 1].map((f) =>
          ramp(uniforms, sceneX(bounds, f))
        )
        for (const valeur of surLaPalette) expect(valeur).toBe(1)
      })
    })
  }

  it('ne divise jamais par zéro, même si le brin est de longueur nulle', () => {
    // Une palette immobile vaut mieux qu'un leurre disparu : sans ce garde-fou,
    // l'inverse d'un brin nul propagerait des NaN à TOUS les sommets.
    const degenere = createSwimUniforms(
      { ...LURE_SWIM, stemStartRatio: 0.8, hingeRatio: 0.8 },
      { axisMin: -1, axisLength: 2, tailAtMin: true }
    )
    expect(Number.isFinite(degenere.uSwimInvStemSpan.value)).toBe(true)
    expect(degenere.uSwimInvStemSpan.value).toBe(0)
  })
})
