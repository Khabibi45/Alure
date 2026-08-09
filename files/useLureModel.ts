import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  BufferGeometry,
  FrontSide,
  Mesh,
  MeshStandardMaterial,
  SkinnedMesh,
  Vector3,
  type MeshDepthMaterial,
  type Object3D,
} from 'three';

import {
  DEFAULT_EMISSIVE_INTENSITY,
  TARGET_LURE_LENGTH,
  TEXTURE_ANISOTROPY,
  type SwimPreset,
} from '../config/swim.config';
import {
  applySwimDeformation,
  createSwimDepthMaterial,
  createSwimUniforms,
  type SwimUniforms,
} from '../materials/applySwimDeformation';

/**
 * Rôle : transformer un .glb brut en un Mesh unique, propre, normalisé et prêt à ondulder.
 *
 * Ce hook existe parce que les .glb issus de générateurs (Meshy, UniRig, export Blender)
 * arrivent avec trois défauts systématiques que le shader ne peut pas rattraper :
 *
 *  1. HIÉRARCHIE PARASITE — armature, nœuds intermédiaires, transforms imbriquées.
 *     On aplatit tout en une seule géométrie en world space : le shader raisonne alors
 *     sur des coordonnées `position` directement comparables à la bounding box.
 *
 *  2. SKIN INUTILISABLE — un des modèles porte une armature auto-générée (15 os) mais
 *     AUCUN clip d'animation, et sa hiérarchie d'os est incohérente (branches multiples
 *     là où une colonne vertébrale est attendue). On la supprime.
 *     C'est sûr précisément PARCE QU'il n'y a aucun clip : en pose de repos, le skinning
 *     est l'identité, donc le rendu du Mesh nu est pixel-identique au SkinnedMesh.
 *     ⚠ Si un clip est ajouté un jour au fichier, cette étape devient destructive.
 *
 *  3. ÉMISSIF À FOND — `emissiveFactor: [1,1,1]` + texture émissive : le leurre s'auto-
 *     éclaire, le PBR est écrasé et le rendu paraît plat, quelle que soit la lumière.
 */

export interface LureModel {
  readonly object: Mesh;
  readonly depthMaterial: MeshDepthMaterial;
  readonly uniforms: SwimUniforms;
}

/** Attributs de skinning à purger : 4 attributs × 4 floats/sommet de VRAM récupérés. */
const SKINNING_ATTRIBUTES = ['skinIndex', 'skinWeight'] as const;

/** Extrait le premier maillage rencontré. Les trois leurres n'en contiennent qu'un. */
function findFirstMesh(root: Object3D): Mesh | SkinnedMesh | null {
  let found: Mesh | SkinnedMesh | null = null;

  root.traverse((child) => {
    if (found === null && (child instanceof Mesh || child instanceof SkinnedMesh)) {
      found = child;
    }
  });

  return found;
}

/**
 * Aplatit la géométrie en world space et purge le skinning.
 * `applyMatrix4(matrixWorld)` absorbe toute la chaîne de transforms parentes, ce qui rend
 * la géométrie autonome et supprime le besoin de conserver la hiérarchie d'origine.
 */
function flattenGeometry(mesh: Mesh | SkinnedMesh): BufferGeometry {
  const geometry = mesh.geometry.clone();

  mesh.updateWorldMatrix(true, false);
  geometry.applyMatrix4(mesh.matrixWorld);

  for (const attribute of SKINNING_ATTRIBUTES) {
    geometry.deleteAttribute(attribute);
  }

  return geometry;
}

/**
 * Recentre la géométrie sur l'origine et la met à l'échelle cible.
 * Indispensable ici : les trois modèles ont des échelles et des origines différentes
 * (l'un est 1,5× plus grand et posé sur Y=0). Sans ça, aucun réglage d'amplitude,
 * de caméra ou d'espacement n'est transposable d'un leurre à l'autre.
 */
function normalizeGeometry(geometry: BufferGeometry): void {
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (box === null) {
    return;
  }

  const center = box.getCenter(new Vector3());
  geometry.translate(-center.x, -center.y, -center.z);

  const size = box.getSize(new Vector3());
  // X est l'axe long des trois modèles (contrat documenté dans swim.config.ts).
  const scale = TARGET_LURE_LENGTH / size.x;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
}

/** Clone le matériau et corrige les réglages d'export hostiles au rendu temps réel. */
function sanitizeMaterial(source: MeshStandardMaterial): MeshStandardMaterial {
  const material = source.clone();

  material.emissiveIntensity = DEFAULT_EMISSIVE_INTENSITY;
  // `doubleSided: true` est mis par défaut par les exporteurs. Sur un corps fermé c'est
  // du fill rate doublé pour des faces jamais visibles.
  material.side = FrontSide;

  if (material.map !== null) {
    material.map.anisotropy = TEXTURE_ANISOTROPY;
  }
  if (material.normalMap !== null) {
    material.normalMap.anisotropy = TEXTURE_ANISOTROPY;
  }

  return material;
}

/**
 * Charge un leurre et retourne un Mesh prêt à l'emploi.
 * `useGLTF` suspend : le composant appelant doit être sous un <Suspense>.
 */
export function useLureModel(url: string, preset: SwimPreset): LureModel | null {
  const { scene } = useGLTF(url);

  const model = useMemo<LureModel | null>(() => {
    const sourceMesh = findFirstMesh(scene);
    if (sourceMesh === null) {
      return null;
    }

    const sourceMaterial = Array.isArray(sourceMesh.material)
      ? sourceMesh.material[0]
      : sourceMesh.material;

    if (!(sourceMaterial instanceof MeshStandardMaterial)) {
      return null;
    }

    const geometry = flattenGeometry(sourceMesh);
    normalizeGeometry(geometry);

    const box = geometry.boundingBox ?? new Box3();
    const uniforms = createSwimUniforms(preset, {
      axisMin: box.min.x,
      axisLength: box.max.x - box.min.x,
    });

    const material = sanitizeMaterial(sourceMaterial);
    applySwimDeformation(material, uniforms);

    // Référence conservée localement : `Object3D.customDepthMaterial` est typé `Material`,
    // la relire perdrait le type concret dont on a besoin pour dispose().
    const depthMaterial = createSwimDepthMaterial(uniforms);

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // three.js lit cette propriété pendant la passe d'ombres, hors du graphe React.
    mesh.customDepthMaterial = depthMaterial;

    return { object: mesh, depthMaterial, uniforms };
  }, [scene, preset]);

  // Géométries et matériaux vivent en VRAM : React ne les libère pas tout seul.
  useEffect(() => {
    if (model === null) {
      return;
    }

    return () => {
      model.object.geometry.dispose();
      (model.object.material as MeshStandardMaterial).dispose();
      model.depthMaterial.dispose();
    };
  }, [model]);

  return model;
}
