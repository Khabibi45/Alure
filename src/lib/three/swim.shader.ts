/**
 * Les fragments GLSL injectés dans le vertex shader standard de three.
 *
 * On patche le shader existant au lieu d'écrire un ShaderMaterial complet : tout le
 * pipeline PBR (baseColor, normalMap, metalRoughness, IBL, tone mapping) est conservé
 * gratuitement. Le réécrire coûterait des centaines de lignes de GLSL pour un rendu
 * inférieur.
 *
 * ── LE MOUVEMENT (2026-09-01) : la palette pivote, le brin plie, le corps ne bouge pas.
 *
 * Tout tient dans UNE rampe. Pour chaque sommet on calcule
 *
 *     t = clamp((x − pivot) / (charnière − pivot), 0, 1)
 *
 * et l'angle de flexion vaut `amplitude · t · sin(ωt)`. Les trois zones du leurre
 * tombent alors toutes seules, sans le moindre branchement :
 *
 *   t = 0          → LE CORPS. Angle nul, donc rotation nulle : pas un sommet ne bouge.
 *   0 < t < 1      → LE BRIN fin et strié. L'angle monte linéairement ; comme le bras de
 *                    levier grandit en même temps, le déplacement croît en t² — le brin
 *                    « s'ondule à peine » près du corps, franchement près de la palette.
 *   t = 1          → LA PALETTE. Tous ses sommets partagent le MÊME angle autour du MÊME
 *                    pivot : c'est une rotation rigide exacte. La palette ne se déforme
 *                    donc jamais, par construction — elle ne fait que pivoter.
 *
 * Le dénominateur est SIGNÉ (`uSwimInvStemSpan`), ce qui absorbe l'orientation du modèle :
 * que la palette soit du côté X min ou X max, la même formule marche. C'est nécessaire,
 * ces leurres sortant tête du côté `axisMax` (cf. `lure-anatomy.ts`).
 *
 * LA NAGE EST LINÉAIRE, au sens propre. Le lacet et le tangage partagent exactement la
 * même phase `sin(ωt)` : leur rapport est constant, donc la palette parcourt un SEGMENT
 * DE DROITE en diagonale. Un déphasage entre les deux la ferait décrire une ellipse —
 * c'est précisément ce qu'on ne veut pas, et c'est pour ça qu'il n'y a qu'un seul `sin()`.
 *
 * CE QUE ÇA COÛTE, ET POURQUOI ON L'ACCEPTE. Sur la palette, la transformation est une
 * rotation rigide : longueur d'arc et normales exactes. Sur le brin, l'angle varie d'un
 * sommet à l'autre — il se raccourcit très légèrement en flexion, et ses normales,
 * pivotées de l'angle LOCAL, ignorent le cisaillement dû à cette variation. Écarts du
 * second ordre, sur la seule zone du modèle qui est fine et courte. Les annoncer
 * « exacts » serait faux ; les corriger coûterait un calcul de dérivée par sommet pour
 * un gain invisible.
 *
 * Points d'ancrage, dans l'ordre où three les inline dans main() :
 *   <common>             → uniforms + fonction d'angles
 *   <beginnormal_vertex> → définit objectNormal → on le fait pivoter
 *   <begin_vertex>       → définit `transformed` → on le fait pivoter
 *
 * CONTRAINTE : les deux chunks sont AUTONOMES (chacun recalcule les angles). Faire
 * dépendre le chunk de position d'une variable déclarée par le chunk de normale
 * casserait la passe de profondeur, où `<beginnormal_vertex>` n'existe que sous
 * `#ifdef USE_DISPLACEMENTMAP`.
 */

export const SWIM_UNIFORMS_CHUNK = /* glsl */ `
uniform float uSwimTime;
uniform float uSwimSpeed;
uniform float uSwimStemStartX;
uniform float uSwimInvStemSpan;
uniform float uSwimPaddleYawAmplitude;
uniform float uSwimPaddlePitchAmplitude;

/**
 * Les deux angles de flexion d'un sommet : x = lacet (gauche-droite),
 * y = tangage (bas-haut). Vaut (0,0) sur tout le corps, par le clamp à 0.
 */
vec2 swimPaddleAngles(in float bodyX) {
  float ramp = clamp((bodyX - uSwimStemStartX) * uSwimInvStemSpan, 0.0, 1.0);
  float wave = ramp * sin(uSwimTime * uSwimSpeed);
  return vec2(uSwimPaddleYawAmplitude * wave, uSwimPaddlePitchAmplitude * wave);
}
`

/**
 * La normale (et la tangente si la normalMap en consomme une) pivote des MÊMES deux
 * angles que la position. Une normale non pivotée garderait l'éclairage de la pose au
 * repos : la palette paraîtrait immobile sous la lumière en plein battement.
 */
export const SWIM_NORMAL_CHUNK = /* glsl */ `
#include <beginnormal_vertex>

vec2 swimAnglesN = swimPaddleAngles(position.x);
float swimCosYawN = cos(swimAnglesN.x);
float swimSinYawN = sin(swimAnglesN.x);
float swimCosPitchN = cos(swimAnglesN.y);
float swimSinPitchN = sin(swimAnglesN.y);

vec3 swimNormalYawed = vec3(
  swimCosYawN * objectNormal.x + swimSinYawN * objectNormal.z,
  objectNormal.y,
  -swimSinYawN * objectNormal.x + swimCosYawN * objectNormal.z
);
objectNormal = vec3(
  swimCosPitchN * swimNormalYawed.x - swimSinPitchN * swimNormalYawed.y,
  swimSinPitchN * swimNormalYawed.x + swimCosPitchN * swimNormalYawed.y,
  swimNormalYawed.z
);

#ifdef USE_TANGENT
  vec3 swimTangentYawed = vec3(
    swimCosYawN * objectTangent.x + swimSinYawN * objectTangent.z,
    objectTangent.y,
    -swimSinYawN * objectTangent.x + swimCosYawN * objectTangent.z
  );
  objectTangent = vec3(
    swimCosPitchN * swimTangentYawed.x - swimSinPitchN * swimTangentYawed.y,
    swimSinPitchN * swimTangentYawed.x + swimCosPitchN * swimTangentYawed.y,
    swimTangentYawed.z
  );
#endif
`

/**
 * Rotation du sommet autour du PIVOT, c'est-à-dire du début du brin fin : on se place
 * dans son repère (dx = x − pivot), on applique le lacet (plan XZ) puis le tangage
 * (plan XY), et on revient.
 *
 * Le pivot est au DÉBUT du brin, côté corps — pas à la charnière elle-même. C'est ce
 * qui fait plier le brin : au ras du corps le bras de levier est nul ET l'angle est nul,
 * donc rien ne bouge ; à la charnière les deux sont au maximum. Pivoter à la charnière
 * ferait partir le brin À L'ENVERS de la palette, comme une paire de ciseaux.
 *
 * La géométrie est centrée à l'origine au chargement, donc l'axe de flexion passe bien
 * par y = 0 et z = 0 : le pivot est un point du corps, pas un coin de la boîte.
 *
 * Ry standard : x' =  c·x + s·z ; z' = −s·x + c·z
 * Rz standard : x' =  c·x − s·y ; y' =  s·x + c·y
 */
export const SWIM_POSITION_CHUNK = /* glsl */ `
#include <begin_vertex>

vec2 swimAnglesP = swimPaddleAngles(position.x);
float swimCosYawP = cos(swimAnglesP.x);
float swimSinYawP = sin(swimAnglesP.x);
float swimCosPitchP = cos(swimAnglesP.y);
float swimSinPitchP = sin(swimAnglesP.y);

vec3 swimLocal = vec3(transformed.x - uSwimStemStartX, transformed.y, transformed.z);
vec3 swimYawed = vec3(
  swimCosYawP * swimLocal.x + swimSinYawP * swimLocal.z,
  swimLocal.y,
  -swimSinYawP * swimLocal.x + swimCosYawP * swimLocal.z
);

transformed = vec3(
  uSwimStemStartX + swimCosPitchP * swimYawed.x - swimSinPitchP * swimYawed.y,
  swimSinPitchP * swimYawed.x + swimCosPitchP * swimYawed.y,
  swimYawed.z
);
`
