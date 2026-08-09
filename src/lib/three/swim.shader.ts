/**
 * Les fragments GLSL injectés dans le vertex shader standard de three.
 *
 * On patche le shader existant au lieu d'écrire un ShaderMaterial complet : tout le
 * pipeline PBR (baseColor, normalMap, metalRoughness, IBL, tone mapping) est conservé
 * gratuitement. Le réécrire coûterait des centaines de lignes de GLSL pour un rendu
 * inférieur.
 *
 * LE MOUVEMENT : une ROTATION RIGIDE de la partie arrière autour de la charnière
 * (axe vertical Y planté en `uSwimHingeX`), d'angle θ(t) = A·sin(t·vitesse).
 * Aucune onde ne parcourt le corps : le leurre réel est en PVC, deux pièces
 * dures, une articulation (cf. swim.config.ts). Conséquences heureuses :
 *   - longueur d'arc préservée EXACTEMENT (c'est une rotation) ;
 *   - normales exactes : elles pivotent du même angle θ, pas de différences finies.
 *
 * `step(uSwimHingeX, position.x)` sépare les deux pièces : la tête est du côté
 * `axisMin` (contrat d'orientation), l'arrière pivote, l'avant ne bouge pas d'un
 * sommet. La coupure est FRANCHE et c'est voulu : les deux pièces du vrai leurre
 * sont disjointes au niveau de l'articulation, aucun triangle ne traverse le plan
 * de charnière — il n'y a rien à lisser.
 *
 * Points d'ancrage, dans l'ordre où three les inline dans main() :
 *   <common>             → uniforms + fonction d'angle
 *   <beginnormal_vertex> → définit objectNormal → on le fait pivoter
 *   <begin_vertex>       → définit `transformed` → on le fait pivoter
 *
 * CONTRAINTE : les deux chunks sont AUTONOMES (chacun recalcule l'angle, soit un
 * sin() de plus par sommet). Faire dépendre le chunk de position d'une variable
 * déclarée par le chunk de normale casserait la passe de profondeur, où
 * `<beginnormal_vertex>` n'existe que sous `#ifdef USE_DISPLACEMENTMAP`.
 */

export const SWIM_UNIFORMS_CHUNK = /* glsl */ `
uniform float uSwimTime;
uniform float uSwimSpeed;
uniform float uSwimHingeX;
uniform float uSwimHingeAmplitude;

/** L'angle de charnière du sommet : θ pour la pièce arrière, 0 pour la pièce avant. */
float swimHingeAngle(in float bodyX) {
  return uSwimHingeAmplitude * sin(uSwimTime * uSwimSpeed) * step(uSwimHingeX, bodyX);
}
`

/**
 * La normale (et la tangente si la normalMap en consomme une) pivote du MÊME angle
 * que la position — même matrice de rotation autour de Y. Une normale non pivotée
 * garderait l'éclairage de la pose au repos : la pièce arrière paraîtrait immobile
 * sous la lumière même en plein battement.
 */
export const SWIM_NORMAL_CHUNK = /* glsl */ `
#include <beginnormal_vertex>

float swimAngleN = swimHingeAngle(position.x);
float swimCosN = cos(swimAngleN);
float swimSinN = sin(swimAngleN);

objectNormal = vec3(
  swimCosN * objectNormal.x + swimSinN * objectNormal.z,
  objectNormal.y,
  -swimSinN * objectNormal.x + swimCosN * objectNormal.z
);

#ifdef USE_TANGENT
  objectTangent = vec3(
    swimCosN * objectTangent.x + swimSinN * objectTangent.z,
    objectTangent.y,
    -swimSinN * objectTangent.x + swimCosN * objectTangent.z
  );
#endif
`

/**
 * Rotation du sommet autour de l'axe vertical passant par la charnière :
 * on se place dans le repère de la charnière (dx = x − hingeX), on tourne dans le
 * plan XZ, on revient. Rotation Ry standard : x' = c·x + s·z ; z' = −s·x + c·z.
 */
export const SWIM_POSITION_CHUNK = /* glsl */ `
#include <begin_vertex>

float swimAngleP = swimHingeAngle(position.x);
float swimCosP = cos(swimAngleP);
float swimSinP = sin(swimAngleP);
float swimDx = transformed.x - uSwimHingeX;

transformed.x = uSwimHingeX + swimCosP * swimDx + swimSinP * transformed.z;
transformed.z = -swimSinP * swimDx + swimCosP * transformed.z;
`
