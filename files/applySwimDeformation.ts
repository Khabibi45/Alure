import {
  MeshDepthMaterial,
  RGBADepthPacking,
  type IUniform,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from 'three';

import type { SwimPreset } from '../config/swim.config';
import {
  SWIM_NORMAL_CHUNK,
  SWIM_POSITION_CHUNK,
  SWIM_UNIFORMS_CHUNK,
} from '../shaders/swim.shader';

/**
 * Rôle : brancher le shader d'ondulation sur un matériau three.js existant et exposer
 * un handle stable sur ses uniforms, pour que la boucle de rendu puisse y pousser le temps.
 *
 * Le point délicat : `onBeforeCompile` n'est appelé qu'au premier rendu du matériau.
 * On ne peut donc pas se contenter de retourner `shader.uniforms`. On crée nos propres
 * objets uniform en amont et on les branche PAR RÉFÉRENCE dans le callback : useFrame
 * peut écrire dedans dès la première frame, même avant compilation.
 */

/** Handle mutable partagé entre matériau visible, matériau de profondeur et boucle de rendu. */
export interface SwimUniforms {
  readonly uSwimTime: IUniform<number>;
  readonly uSwimAmplitude: IUniform<number>;
  readonly uSwimFrequency: IUniform<number>;
  readonly uSwimSpeed: IUniform<number>;
  readonly uSwimHeadAnchor: IUniform<number>;
  readonly uSwimTailBias: IUniform<number>;
  readonly uSwimAxisMin: IUniform<number>;
  readonly uSwimAxisLength: IUniform<number>;
}

export interface SwimGeometryBounds {
  /** Coordonnée X minimale de la géométrie, après normalisation. */
  readonly axisMin: number;
  /** Étendue de la géométrie sur X. Sert aussi d'échelle de référence pour l'amplitude. */
  readonly axisLength: number;
}

/**
 * Clé de cache programme. three.js met en cache les programmes compilés ; sans surcharge,
 * un matériau patché et un matériau non patché partageant les mêmes defines se verraient
 * attribuer le MÊME programme — l'un des deux perdrait son ondulation, de façon
 * non déterministe selon l'ordre de rendu.
 */
const SWIM_PROGRAM_CACHE_KEY = 'swim-deformation-v1';

export function createSwimUniforms(
  preset: SwimPreset,
  bounds: SwimGeometryBounds,
): SwimUniforms {
  return {
    uSwimTime: { value: 0 },
    // L'amplitude du preset est un RATIO : on le convertit en unités monde ici, une fois,
    // plutôt que de refaire la multiplication à chaque sommet à chaque frame.
    uSwimAmplitude: { value: preset.amplitudeRatio * bounds.axisLength },
    uSwimFrequency: { value: preset.frequency },
    uSwimSpeed: { value: preset.speed },
    uSwimHeadAnchor: { value: preset.headAnchor },
    uSwimTailBias: { value: preset.tailBias },
    uSwimAxisMin: { value: bounds.axisMin },
    uSwimAxisLength: { value: bounds.axisLength },
  };
}

/**
 * Injecte les chunks dans le vertex shader et branche les uniforms par référence.
 * `deformNormals` est faux pour la passe de profondeur : les normales n'y servent à rien,
 * et son shader ne déclare `<beginnormal_vertex>` que sous `#ifdef USE_DISPLACEMENTMAP`.
 */
function patchVertexShader(
  shader: WebGLProgramParametersWithUniforms,
  uniforms: SwimUniforms,
  deformNormals: boolean,
): void {
  Object.assign(shader.uniforms, uniforms);

  let vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>\n${SWIM_UNIFORMS_CHUNK}`,
  );

  if (deformNormals) {
    vertexShader = vertexShader.replace('#include <beginnormal_vertex>', SWIM_NORMAL_CHUNK);
  }

  shader.vertexShader = vertexShader.replace('#include <begin_vertex>', SWIM_POSITION_CHUNK);
}

/**
 * Applique l'ondulation au matériau visible.
 *
 * Mute le matériau passé en argument : il DOIT être un clone dédié à cette instance.
 * useGLTF met les matériaux en cache et les partage entre tous les consommateurs du même
 * fichier — sans clone, deux leurres affichés côte à côte nageraient exactement en phase.
 */
export function applySwimDeformation(material: Material, uniforms: SwimUniforms): void {
  material.onBeforeCompile = (shader) => patchVertexShader(shader, uniforms, true);
  material.customProgramCacheKey = () => SWIM_PROGRAM_CACHE_KEY;
  material.needsUpdate = true;
}

/**
 * Crée le matériau de profondeur correspondant.
 *
 * Sans lui, la passe d'ombres utilise la géométrie AU REPOS : le leurre ondule mais son
 * ombre reste raide et se décale visiblement du corps. On partage volontairement le MÊME
 * objet `uniforms` que le matériau visible — pas une copie — pour garantir que les deux
 * passes lisent rigoureusement le même `uSwimTime`.
 */
export function createSwimDepthMaterial(uniforms: SwimUniforms): MeshDepthMaterial {
  const depthMaterial = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });

  depthMaterial.onBeforeCompile = (shader) => patchVertexShader(shader, uniforms, false);
  depthMaterial.customProgramCacheKey = () => `${SWIM_PROGRAM_CACHE_KEY}-depth`;

  return depthMaterial;
}
