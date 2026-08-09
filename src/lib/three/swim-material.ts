import * as THREE from 'three'
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
  /** Position X de la charnière, en unités de scène (espace objet normalisé). */
  readonly uSwimHingeX: THREE.IUniform<number>
  readonly uSwimHingeAmplitude: THREE.IUniform<number>
}

/**
 * three met les programmes compilés en cache. Sans clé dédiée, un matériau patché et un
 * matériau non patché partageant les mêmes defines recevraient le MÊME programme, et l'un
 * des deux perdrait son animation — de façon non déterministe selon l'ordre de rendu.
 * `v2` : la déformation par onde est devenue une rotation de charnière (2026-08-08).
 */
const SWIM_PROGRAM_CACHE_KEY = 'swim-articulation-v2'

export function createSwimUniforms(
  preset: SwimPreset,
  bounds: { axisMin: number; axisLength: number }
): SwimUniforms {
  return {
    uSwimTime: { value: 0 },
    uSwimSpeed: { value: preset.speed },
    // Le preset donne une FRACTION de la longueur ; on la convertit en coordonnée de
    // scène ici, une fois, plutôt qu'à chaque sommet et à chaque frame.
    uSwimHingeX: { value: bounds.axisMin + preset.hingeRatio * bounds.axisLength },
    uSwimHingeAmplitude: { value: preset.hingeAmplitude },
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
