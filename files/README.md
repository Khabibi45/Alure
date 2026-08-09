# Animation des leurres 3D — nage procédurale par shader

## 1. Diagnostic des trois `.glb` fournis

Inspection du chunk JSON de chaque fichier, avant d'écrire une ligne de code :

| Fichier | Poids | Triangles | Squelette | Clips d'animation | Générateur |
|---|---|---|---|---|---|
| `leurre_brochet.glb` | 25,4 Mo | 128 842 | aucun | **0** | meshy-scene |
| `leurre_orange.glb` | 22,5 Mo | 153 826 | aucun | **0** | pygltflib |
| `leurre_truite.glb` | 27,2 Mo | 128 842 | 15 os (UniRig) | **0** | Blender glTF I/O |

Trois conclusions qui déterminent toute l'approche :

**a) Aucun fichier ne contient d'animation.** `useAnimations` de drei et `THREE.AnimationMixer` ne
servent donc à rien : il n'y a pas de clip à jouer. Toute animation devra être *générée*, pas *lue*.

**b) Le seul rig disponible est inexploitable.** L'armature de la truite est auto-générée (UniRig).
Sa hiérarchie n'est pas une colonne vertébrale mais un nœud `Bone_001` qui se ramifie en six
branches — l'auto-rigger a confondu le corps et les appendices. Piloter une ondulation là-dessus
produirait des déformations aberrantes. Elle est supprimée au chargement.

**c) Le contrat d'orientation est homogène.** Sur les trois modèles, l'axe long est **X** et l'axe
le plus fin (donc l'axe latéral d'ondulation) est **Z**. Un seul shader générique couvre les trois.

> Conséquence : **déformation par vertex shader**, pas par squelette. Un unique chemin de code
> pour les trois leurres, indépendant du rig, ~0 coût CPU, et fonctionnel pour tout leurre
> ajouté plus tard sans passer par Blender.

## 2. Installation

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

`@react-three/fiber@9` s'appaire avec **React 19**. Sur React 18, rester en `fiber@8` + `drei@9`
(le code de ce module est compatible avec les deux).

Versions validées : `three@0.180`, `@react-three/fiber@9.7`, `@react-three/drei@10.7`, `react@19.2`.
Le module compile sans erreur sous `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.

## 3. Compression des assets — à faire avant toute mise en ligne

**75 Mo pour trois leurres est ineshippable.** Le problème n'est pas que le poids réseau : une
texture JPEG 4096×4096 est décompressée en VRAM en `4096 × 4096 × 4 = 67 Mo`. Quatre textures ×
trois leurres ≈ **800 Mo de VRAM**. Safari iOS tue l'onglet bien avant.

```bash
npm i -D @gltf-transform/cli sharp

npx gltf-transform optimize leurre_brochet.glb public/models/leurre_brochet.glb \
  --texture-compress webp \
  --texture-size 2048 \
  --compress meshopt \
  --simplify false
```

Résultats mesurés sur les fichiers réels :

| Fichier | Avant | Après | Avec `--simplify true --simplify-ratio 0.4` |
|---|---|---|---|
| brochet | 25,4 Mo | **1,28 Mo** | 831 Ko (51 536 tris) |
| orange | 22,5 Mo | **1,20 Mo** | — |
| truite | 27,2 Mo | **1,24 Mo** | — |
| **total** | **75 Mo** | **3,7 Mo** | ~2,5 Mo |

`--texture-size 2048` est le paramètre qui sauve la VRAM (÷4). `--texture-compress webp` sauve la
bande passante. Les deux sont nécessaires, aucun ne remplace l'autre.

Aucune config de loader n'est requise : `useGLTF` de drei branche `MeshoptDecoder` et `DRACOLoader`
par défaut.

**Niveau supérieur (optionnel)** : `--texture-compress ktx2` produit des textures compressées
*côté GPU* (VRAM ÷ 6 en plus du gain disque), au prix d'un `KTX2Loader` + transcoder Basis à
self-hoster et d'une légère perte de qualité sur les normal maps.

## 4. Arborescence

```
src/three/
├── config/swim.config.ts                  Presets de nage + registre des leurres. Aucune
│                                          valeur numérique de tuning ailleurs.
├── shaders/swim.shader.ts                 Les 3 chunks GLSL injectés dans three.js.
├── materials/applySwimDeformation.ts      Patch onBeforeCompile + matériau de profondeur.
├── hooks/useLureModel.ts                  Charge, aplatit, nettoie, normalise le .glb.
└── components/
    ├── SwimmingLure.tsx                   Un leurre animé.
    └── LureShowcase.tsx                   Scène Canvas complète.
```

Flux : `LureShowcase` → `SwimmingLure` → `useLureModel` → (`applySwimDeformation` + `swim.shader`),
avec `swim.config` lu par les deux extrémités.

## 5. Comment ça marche

### Étage 1 — déformation (GPU)

Le vertex shader de `MeshStandardMaterial` est patché via `onBeforeCompile`, ce qui conserve
gratuitement tout le pipeline PBR (normal map, metal/roughness, IBL, ombres, fog, tone mapping).
Écrire un `ShaderMaterial` complet aurait coûté ~600 lignes de GLSL pour un résultat visuel
inférieur.

```
displacement(t) = amplitude × envelope(t) × sin(t·frequency − time·speed)
```

où `t ∈ [0..1]` est la position normalisée le long du corps, dérivée de la bounding box réelle
— d'où l'indépendance à l'échelle du modèle.

Deux détails qui font la différence entre « ça bouge » et « ça nage » :

- **L'onde est progressive** (`− time·speed` à l'intérieur du sinus, pas à l'extérieur). Sans ce
  terme, on obtient un balancement d'essuie-glace au lieu d'une onde qui remonte le corps.
- **Les normales sont pivotées** de `−atan(d'(x))` autour de Y. Déplacer les sommets sans corriger
  les normales est l'erreur la plus courante : l'éclairage reste celui de la pose au repos et le
  leurre paraît rigide et plastique même en mouvement.

### Étage 2 — corps rigide (CPU)

Roulis, lacet et oscillation verticale du leurre entier, à des rapports de fréquence non
commensurables (0,5 / 0,33 / 0,318) pour qu'aucune boucle ne soit perceptible.

Coût par frame et par leurre : **4 écritures de float**. Les 70 000 à 84 000 sommets sont
déformés par le GPU.

## 6. Réglage

Tout se passe dans `SWIM_PRESETS` (`swim.config.ts`). Les trois presets fournis (`jerkbait`,
`crankbait`, `softbait`) correspondent aux familles réelles de leurres.

| Paramètre | Effet | Plage utile |
|---|---|---|
| `amplitudeRatio` | Amplitude latérale, en **fraction de la longueur du corps** | 0,02 – 0,09 |
| `frequency` | Radians d'onde répartis sur le corps (6,28 = une sinusoïde) | 3 – 8 |
| `speed` | Vitesse de propagation, rad/s | 3 – 10 |
| `headAnchor` | Fraction avant du corps qui reste rigide | 0,05 – 0,45 |
| `tailBias` | > 1 concentre le mouvement sur la queue | 1,2 – 2,5 |

Au-delà de `amplitudeRatio ≈ 0,10`, l'étirement dû à l'absence de préservation de longueur d'arc
devient visible. C'est la limite assumée de l'approche.

Pour un tuning en direct, brancher `leva` sur l'objet `uniforms` retourné par `useLureModel` :
les uniforms sont des références mutables, écrire dedans se répercute à la frame suivante sans
recompilation de shader.

## 7. Pièges corrigés dans le code

| Piège | Symptôme si non traité | Traitement |
|---|---|---|
| `emissiveFactor: [1,1,1]` + texture émissive sur les trois exports | Leurre auto-éclairé, PBR écrasé, rendu plat quelle que soit la lumière | `emissiveIntensity = 0` dans `sanitizeMaterial` |
| `doubleSided: true` | Fill rate doublé pour des faces jamais visibles | `side = FrontSide` |
| Matériaux mis en cache et partagés par `useGLTF` | Les trois leurres nagent exactement en phase | `material.clone()` par instance |
| Cache de programmes de three.js | Un matériau patché et un non patché partagent le même programme, l'ondulation disparaît de façon non déterministe | `customProgramCacheKey` |
| `<beginnormal_vertex>` est sous `#ifdef USE_DISPLACEMENTMAP` dans `MeshDepthMaterial` | Erreur de compilation GLSL sur la passe d'ombres | Chunks GLSL autonomes + `deformNormals: false` pour la profondeur |
| Ombres calculées sur la géométrie au repos | Le leurre ondule, son ombre reste raide et se décale | `customDepthMaterial` partageant les **mêmes** uniforms |
| `devicePixelRatio` à 3 sur Retina | 9× plus de pixels à remplir | `dpr={[1, 2]}` |
| `metalness` élevé sans map d'environnement | Leurre rendu noir | `<Environment>` obligatoire |
| Géométries/matériaux non libérés | Fuite VRAM à chaque démontage | `dispose()` dans le cleanup de `useEffect` |

## 8. Limites connues

- **Pas de préservation de longueur d'arc.** Le corps s'étire très légèrement à forte amplitude.
- **La suppression du squelette de la truite est sûre uniquement parce qu'il n'y a aucun clip**
  (en pose de repos, le skinning est l'identité). Si un clip est ajouté au fichier, revoir
  `flattenGeometry`.
- **Le contrat X-long / Z-latéral est implicite dans le shader.** Tout nouveau modèle qui ne le
  respecte pas doit être ramené via le champ `rotation` de `LureDefinition`.
- **`<Environment preset>` télécharge un HDR depuis un CDN tiers.** En production, self-hoster le
  `.hdr` et utiliser `files="/hdr/studio.hdr"`.
