/**
 * Rôle : les fragments GLSL injectés dans le vertex shader standard de three.js.
 *
 * Pourquoi patcher le shader existant plutôt qu'écrire un ShaderMaterial complet :
 * on conserve gratuitement tout le pipeline PBR (baseColor, normalMap, metalRoughness,
 * IBL, ombres, fog, tone mapping). Le réécrire à la main serait ~600 lignes de GLSL
 * à maintenir pour zéro gain visuel.
 *
 * Points d'ancrage utilisés, dans l'ordre où three.js les inline dans main() :
 *   <common>             → déclaration des uniforms et de la fonction d'onde
 *   <beginnormal_vertex> → définit objectNormal / objectTangent  → on les fait pivoter
 *   <begin_vertex>       → définit `transformed`                 → on le déplace
 *
 * CONTRAINTE : les deux chunks doivent être AUTONOMES (chacun recalcule ce dont il a
 * besoin). Raison : dans le vertex shader de MeshDepthMaterial, <beginnormal_vertex>
 * n'est présent que sous `#ifdef USE_DISPLACEMENTMAP`. Faire dépendre le chunk position
 * d'une variable déclarée par le chunk normal casserait la compilation de la passe
 * d'ombres. Le surcoût est d'un sin() par sommet — négligeable devant le fill rate.
 */

/**
 * Déclarations + fonction de déplacement.
 *
 * Le corps est paramétré par une coordonnée normalisée t ∈ [0..1] le long de l'axe X,
 * calculée depuis la bounding box réelle du modèle : le shader est donc indépendant de
 * l'échelle et se comporte à l'identique sur les trois leurres.
 *
 * displacement(t) = amplitude × enveloppe(t) × sin(t·freq − time·speed)
 *   - sin(t·freq − time·speed) est une onde PROGRESSIVE : elle voyage de la tête vers la
 *     queue. C'est ce terme qui distingue une nage d'un simple balancement d'essuie-glace.
 *   - l'enveloppe smoothstep(headAnchor, 1, t)^tailBias annule le mouvement à l'avant.
 *     Sans elle la tête vibre autant que la queue et le leurre a l'air en gelée.
 */
export const SWIM_UNIFORMS_CHUNK = /* glsl */ `
uniform float uSwimTime;
uniform float uSwimAmplitude;
uniform float uSwimFrequency;
uniform float uSwimSpeed;
uniform float uSwimHeadAnchor;
uniform float uSwimTailBias;
uniform float uSwimAxisMin;
uniform float uSwimAxisLength;

float swimDisplacement(in float bodyCoord) {
  float t = clamp((bodyCoord - uSwimAxisMin) / uSwimAxisLength, 0.0, 1.0);
  float envelope = pow(smoothstep(uSwimHeadAnchor, 1.0, t), uSwimTailBias);
  return uSwimAmplitude * envelope * sin(t * uSwimFrequency - uSwimTime * uSwimSpeed);
}
`;

/**
 * Rotation de la normale (et de la tangente si la normalMap en consomme une).
 *
 * Déplacer les sommets sans corriger les normales est l'erreur classique : l'éclairage
 * reste celui du modèle au repos, le leurre paraît rigide et « plastique » même en
 * mouvement. On corrige en pivotant la base locale autour de Y de l'angle de la pente.
 *
 * Dérivation du signe : la tangente de surface le long de X devient (1, 0, d'(x)).
 * Une rotation d'angle θ autour de Y envoie (1,0,0) sur (cosθ, 0, −sinθ).
 * Identifier (cosθ, −sinθ) ∝ (1, d') donne tanθ = −d', donc θ = −atan(d').
 *
 * La pente d'(x) vient d'une différence finie et non d'une dérivée analytique : la dérivée
 * exacte de pow∘smoothstep est lourde, et surtout elle devient silencieusement fausse dès
 * qu'on retouche la formule de l'enveloppe.
 */
export const SWIM_NORMAL_CHUNK = /* glsl */ `
#include <beginnormal_vertex>

float swimNormalEps = uSwimAxisLength * 0.01;
float swimNormalSlope =
  (swimDisplacement(position.x + swimNormalEps) - swimDisplacement(position.x)) / swimNormalEps;

float swimAngle = -atan(swimNormalSlope);
float swimCos = cos(swimAngle);
float swimSin = sin(swimAngle);

objectNormal = vec3(
  objectNormal.x * swimCos + objectNormal.z * swimSin,
  objectNormal.y,
  -objectNormal.x * swimSin + objectNormal.z * swimCos
);

#ifdef USE_TANGENT
  objectTangent = vec3(
    objectTangent.x * swimCos + objectTangent.z * swimSin,
    objectTangent.y,
    -objectTangent.x * swimSin + objectTangent.z * swimCos
  );
#endif
`;

/**
 * Déplacement latéral du sommet, sur l'axe Z (le plus fin des trois modèles).
 *
 * Limite assumée : un vrai pliage préserverait la longueur d'arc en reculant aussi le
 * sommet sur X. À amplitude ≤ 7 % de la longueur du corps, l'étirement reste sous le
 * pixel — le coût d'une intégration d'arc en GLSL ne se justifie pas ici.
 */
export const SWIM_POSITION_CHUNK = /* glsl */ `
#include <begin_vertex>

transformed.z += swimDisplacement(position.x);
`;
