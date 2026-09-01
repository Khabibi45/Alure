import * as THREE from 'three'
import type { LureBounds } from './lure-anatomy'
import type { SwimPreset } from './swim.config'
import { SWIM_NORMAL_CHUNK, SWIM_POSITION_CHUNK, SWIM_UNIFORMS_CHUNK } from './swim.shader'

/**
 * Branche le shader d'articulation sur un matériau three existant et rend ses uniforms
 * accessibles à la boucle de rendu.
 *
 * Le point délicat : `onBeforeCompile` n'est appelé qu'au premier rendu du matériau. On ne
 * peut donc pas se contenter de lire `shader.uniforms` après coup. On crée nos propres
 * objets uniform en amont et on les branche PAR RÉFÉRENCE dans le callback : la boucle peut
 * écrire dedans dès la première frame, avant même la compilation.
 */

export type SwimUniforms = {
  readonly uSwimTime: THREE.IUniform<number>
  readonly uSwimSpeed: THREE.IUniform<number>
  /**
   * Le PIVOT : position X du début du brin fin, en unités de scène (espace objet
   * normalisé). Tout ce qui est du côté du corps ne bouge pas.
   */
  readonly uSwimStemStartX: THREE.IUniform<number>
  /**
   * L'inverse SIGNÉ de la longueur du brin. Signé, parce que c'est lui qui porte
   * l'orientation du modèle : négatif quand la palette est du côté X minimal.
   * Le shader n'a donc aucun branchement à faire, et une division de moins par
   * sommet et par frame.
   */
  readonly uSwimInvStemSpan: THREE.IUniform<number>
  readonly uSwimPaddleYawAmplitude: THREE.IUniform<number>
  readonly uSwimPaddlePitchAmplitude: THREE.IUniform<number>
}

/**
 * three met les programmes compilés en cache. Sans clé dédiée, un matériau patché et un
 * matériau non patché partageant les mêmes defines recevraient le MÊME programme, et l'un
 * des deux perdrait son animation — de façon non déterministe selon l'ordre de rendu.
 * `v2` : la déformation par onde est devenue une rotation de charnière (2026-08-08).
 * `v3` : la charnière est devenue une flexion progressive de la queue (2026-09-01).
 * `v4` : seuls le brin et la palette bougent, et l'orientation est mesurée (2026-09-01).
 */
const SWIM_PROGRAM_CACHE_KEY = 'swim-articulation-v4'

export function createSwimUniforms(preset: SwimPreset, bounds: LureBounds): SwimUniforms {
  /**
   * Le preset compte ses fractions DEPUIS LA TÊTE ; la scène, elle, compte en X
   * croissants. Les deux ne vont dans le même sens que si la tête est du côté
   * `axisMin` — ce qui n'est PAS le cas des leurres souples. On convertit donc
   * ici, une fois, plutôt qu'à chaque sommet et à chaque frame.
   */
  const headX = bounds.tailAtMin ? bounds.axisMin + bounds.axisLength : bounds.axisMin
  const towardTail = bounds.tailAtMin ? -1 : 1
  const at = (ratio: number) => headX + towardTail * ratio * bounds.axisLength

  const stemStartX = at(preset.stemStartRatio)
  const stemSpan = at(preset.hingeRatio) - stemStartX

  return {
    uSwimTime: { value: 0 },
    uSwimSpeed: { value: preset.speed },
    uSwimStemStartX: { value: stemStartX },
    // Garde-fou : un brin de longueur nulle (les deux fractions égales) donnerait
    // une division par zéro — donc des NaN propagés à TOUS les sommets et un
    // leurre qui disparaît. On préfère une palette immobile à un leurre invisible.
    uSwimInvStemSpan: { value: stemSpan !== 0 ? 1 / stemSpan : 0 },
    uSwimPaddleYawAmplitude: { value: preset.paddleYawAmplitude },
    uSwimPaddlePitchAmplitude: { value: preset.paddlePitchAmplitude },
  }
}

/**
 * Injecte les chunks et branche les uniforms. Mute le matériau : il DOIT être un clone
 * dédié à cette instance, sinon deux leurres partageant un matériau battraient en phase.
 *
 * Pas de `customDepthMaterial` ici : ce hero n'a ni sol ni lumière projetant d'ombre, donc
 * aucune passe de profondeur. Si des ombres sont ajoutées un jour, il en faudra un —
 * partageant le MÊME objet `uniforms` — sinon l'ombre restera raide pendant que l'arrière
 * bat. (Et sans normales déformées : dans `MeshDepthMaterial`, `<beginnormal_vertex>`
 * n'existe que sous `#ifdef USE_DISPLACEMENTMAP` et la compilation échouerait.)
 */
export function applySwimDeformation(material: THREE.Material, uniforms: SwimUniforms): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${SWIM_UNIFORMS_CHUNK}`)
      .replace('#include <beginnormal_vertex>', SWIM_NORMAL_CHUNK)
      .replace('#include <begin_vertex>', SWIM_POSITION_CHUNK)
  }
  material.customProgramCacheKey = () => SWIM_PROGRAM_CACHE_KEY
  material.needsUpdate = true
}
