# Spec — Hero 3D de l'accueil (carrousel des trois leurres)

Statut : `livré` · Date : 2026-08-06 · Gate vert (tsc, eslint, 48 tests, build) + vérification
navigateur réelle 1280 px et 375 px.

Le hero de `/` affiche les trois modèles 3D du leurre et permet de passer de l'un à l'autre en
boucle. Il remplace l'accueil intérimaire. Le reste du scroll narratif (gsap + lenis) reste au
LOT 3 — ce document ne couvre que le hero.

**Fichiers** : `src/components/sections/home/Hero.tsx` (serveur) ·
`LureCarousel.tsx` (îlot client : état, gestes, accessibilité) · `lure-stage.ts` (la scène three,
sans React) · `src/lib/three/{swim.config,swim.shader,swim-material}.ts` (le moteur de nage) ·
`src/lib/lure-models.ts` (les trois modèles) · `scripts/optimize-glb.mjs` (compression) ·
`public/models/*.glb` (les fichiers servis).

**Origine du moteur de nage** : kit déposé par Camil dans `files/` (diagnostic des `.glb`,
shader, presets). Le cœur en a été **porté** — il est en three pur — plutôt qu'installé tel
quel : le kit est écrit pour `@react-three/fiber` + `drei`, que ce site n'utilise pas, et son
`<Environment preset>` télécharge un HDR depuis un **CDN tiers** (interdit par la CSP et la
règle n°10 ; ici l'éclairage est généré en mémoire par `RoomEnvironment`). `files/` est exclu
de `tsconfig` et d'ESLint : c'est une source de référence, pas du code du site.

---

## 1. Les décisions, et leur pourquoi

| # | Décision | Pourquoi |
|---|---|---|
| 1 | **`three` seul**, pas `@react-three/fiber` ni `drei` | Une dépendance au lieu de trois, pour un hero qui affiche trois objets sans interaction complexe. La scène tient en un fichier impératif ; R3F se justifierait pour une scène qui vit avec l'état React, pas ici |
| 2 | **Les `.glb` sont recompressés avant d'entrer dans `public/`** | Les exports Blender pèsent **75 Mo à trois** (~20 Mo de JPEG 4K chacun). `public/` part dans git et chez le visiteur : rien de brut n'y entre. Textures ramenées à 1024 px → **14,9 Mo**, soit −80 % |
| 3 | **`blob:` ajouté à `connect-src`** dans `next.config.ts` | GLTFLoader extrait les textures embarquées en URL `blob:` puis les récupère par `fetch`. Sans cette directive les modèles s'affichent **en blanc**, textures muettes, et l'erreur ne sort que dans la console. Ce n'est pas une ouverture vers un tiers : le blob est créé par notre page à partir d'un fichier déjà servi par notre domaine |
| 4 | **Les leurres nagent sur place, en boucle** — dérogation explicite à la fondation §6 (« toute animation en boucle » y est interdite), demandée par le propriétaire le 2026-08-06 | Bornée à cette scène 3D : aucune autre animation du site ne boucle, et `prefers-reduced-motion` fige tout sans exception. Le passage d'un leurre à l'autre reste amorti sur `--dur-page` (τ = 0,14 s, donc 3τ = 0,42 s exactement). Aucune rotation automatique en revanche : le leurre ne pivote pas sur lui-même |
| 5 | **Le scroll vertical de la page n'est jamais capturé** | Un hero qui détourne la molette enferme le visiteur. Changent de leurre : le **glissé horizontal**, la **molette horizontale** (uniquement si `|deltaX| > |deltaY|`), les **flèches du clavier**, les **boutons** et les **pastilles** |
| 6 | **Chargement paresseux, un modèle à la fois** | Au premier affichage, un seul `.glb` est téléchargé (6,8 Mo). Les voisins ne partent qu'**une fois l'actif rendu**, jamais avant |
| 7 | **Les noms affichés sont des noms de TRAVAIL** | `product.ts` reste la seule source de vérité commerciale et ses trois coloris portent encore des libellés provisoires. On ne sait pas quel `.glb` correspond à quel coloris : `colorwayId` vaut `null`, et rien n'est inventé (règle n°6) |

**La boucle infinie, concrètement** : la cible est un entier **non borné** — on compte
indéfiniment vers le haut ou vers le bas. Chaque leurre est placé à la distance signée la plus
courte sur l'anneau (`ringOffset`). Aucun modèle n'est dupliqué, et le passage du dernier au
premier ne fait aucun saut : il avance d'un cran comme les autres.

---

## 1 bis. La nage — deux étages, aucun clip d'animation

**Aucun des trois `.glb` ne contient d'animation** (0 clip). Il n'y a donc rien à *jouer* :
la nage est *générée*. Et le seul rig disponible — l'armature auto-générée de la truite — est
inexploitable : sa hiérarchie n'est pas une colonne vertébrale mais un nœud qui se ramifie en
six branches. Elle est supprimée au chargement (sûr **parce qu'**il n'y a aucun clip : en pose
de repos, le skinning est l'identité).

D'où : **déformation par vertex shader**, pas par squelette. Un seul chemin de code pour les
trois leurres, indépendant du rig, coût CPU quasi nul.

| Étage | Où | Quoi |
|---|---|---|
| **1 — déformation** | GPU, vertex shader patché via `onBeforeCompile` | `displacement(t) = amplitude × enveloppe(t) × sin(t·freq − time·speed)` le long de l'axe X, déplacé sur Z |
| **2 — corps rigide** | CPU, 4 écritures de float par leurre et par frame | roulis, lacet, oscillation verticale, à des rapports de fréquence **non commensurables** (0,5 / 0,33 / 0,318) pour qu'aucune boucle ne se perçoive |

Un seul étage ne suffit jamais : la déformation seule donne un poisson qui ondule mais reste
scotché dans l'air ; le corps rigide seul donne un objet qu'on secoue. C'est leur battement
qui se lit comme de la nage.

Deux détails qui font la différence entre « ça bouge » et « ça nage » :
- **L'onde est progressive** — `− time·speed` est *dans* le sinus. Hors du sinus, on obtient un
  balancement d'essuie-glace.
- **Les normales sont pivotées** de `−atan(d'(x))`. Déplacer les sommets sans corriger les
  normales laisse l'éclairage de la pose au repos : le leurre paraît rigide et plastique
  **même en mouvement**.

On patche le shader standard plutôt que d'écrire un `ShaderMaterial` : tout le pipeline PBR
(baseColor, normalMap, metalRoughness, IBL, tone mapping) est conservé gratuitement.

**Pièges traités, et leur symptôme si on les rate** — les trois exports portent
`emissiveFactor: [1,1,1]` + une texture émissive (leurre auto-éclairé, PBR écrasé, rendu plat) →
`emissiveIntensity = 0` · `doubleSided: true` (fill rate doublé pour des faces internes jamais
visibles) → `FrontSide` · cache de programmes de three (un matériau patché et un non patché
partagent le même programme, l'ondulation disparaît de façon non déterministe) →
`customProgramCacheKey` · matériaux partagés (les trois leurres nagent en phase) → `clone()` +
décalage de phase par leurre.

**Pas d'ombres, donc pas de `customDepthMaterial`** : ce hero n'a ni sol ni lumière projetant
d'ombre. Si des ombres arrivent un jour, il en faudra un, partageant le **même** objet
`uniforms` — sinon l'ombre reste raide pendant que le corps ondule.

---

## 1 ter. Recette — ajouter un leurre au carrousel

Un geste voué à se répéter, donc standardisé. **Trois gestes, et le gate rattrape les oublis.**

1. Déposer l'export Blender dans `assets/3d models/` (n'importe quel poids : il sera compressé).
2. `npm run models` — traite **tous** les `.glb` du dossier vers `public/models/`, en renommant
   `leurre_x.glb` → `leurre-x.glb`. Idempotent : relancer ne casse rien.
3. Ajouter une entrée à `LURE_MODELS` (`src/lib/lure-models.ts`) : `id`, `workingName`, `src`,
   `preset` de nage, `description` (elle est lue à voix haute — le canvas ne dit rien).

C'est tout. Le carrousel, sa boucle infinie, les pastilles, le préchargement des voisins et le
sélecteur de vues s'adaptent au nombre d'entrées — **aucune de ces mécaniques ne connaît le
chiffre 3**.

**Ce que le gate rattrape** (`src/lib/lure-models.test.ts`), parce qu'aucun de ces oublis ne
casse à la compilation et que le symptôme serait un trou dans le carrousel en production :
- un `src` déclaré mais **absent** de `public/models` → « lance `npm run models` » ;
- un `.glb` compressé mais **jamais enregistré** → il serait servi pour rien, ou plutôt jamais
  affiché malgré ses mégaoctets ;
- un `preset` de nage qui n'existe pas · des `id` en double · un nom ou une description vide.

**Le contrat d'orientation** (`swim.config.ts`) doit être respecté par tout nouveau modèle :
axe long = X (tête vers −X), vertical = Y, axe latéral le plus fin = Z. Un modèle exporté
autrement nagerait dans le mauvais axe et le sélecteur de vues montrerait des faces fausses.
Se vérifie en une commande sur la bounding box avant d'ajouter.

## 1 quater. Le sélecteur de vues

Cinq angles : **droite, gauche, dessus, dessous, devant**. Chacun est une rotation exacte
dérivée du contrat d'orientation ci-dessus, définie dans `src/lib/three/lure-views.ts` —
**ajouter une vue = ajouter une entrée**, les boutons et l'annonce vocale en découlent.

Deux points d'implémentation qui comptent :
- **Interpolation en quaternion**, pas en angles d'Euler : entre « dessus » et « devant », une
  interpolation d'Euler ferait passer le leurre par des orientations absurdes.
- **Trois groupes imbriqués** — `root` (placement carrousel) → `pose` (la vue) → `animated`
  (la nage). Les fusionner ferait écraser la vue choisie par le roulis à la frame suivante ;
  et c'est aussi ce qui garantit que le roulis reste autour de l'axe long du corps **quelle
  que soit la vue**.

## 1 quinquies. Recette — basculer entre les mises en scène du hero

Trois mises en scène coexistent et sont maintenues **en permanence**. Elles racontent la même
chose et finissent sur **la même image**, ce qui est la condition pour que le calage du leurre 3D
vaille pour toutes.

| | Ce que le visiteur fait | Poids | Route |
|---|---|---|---|
| **`cine`** — EN LIGNE | il regarde la vidéo d'ouverture, puis il pilote — remonter fait défiler la séquence à rebours | la vidéo (2,3 Mo) + la séquence (5,5 Mo) | `/` (l'accueil) |
| **`scroll`** | il pilote — la séquence avance avec le défilement | 5,5 Mo (302 images WebP, 30 fps) | `/hero-scroll` |
| **`video`** | il regarde — la vidéo se joue puis passe la main | 2,3 Mo (un mp4 de 10 s) | `/hero-video` |

### La bascule : un seul mot

```ts
// src/lib/hero-variant.ts
export const HERO_VARIANT: HeroVariant = 'cine'   // ← 'scroll' ou 'video' et c'est fait
```

**Rien d'autre.** Aucun composant, aucun import, aucun asset à toucher. Les assets des trois
variantes sont produits et versionnés en permanence.

Les deux routes de comparaison affichent **toujours** leur variante, quelle que soit la valeur
de `HERO_VARIANT` : elles servent à trancher, pas à refléter la décision. Elles portent un
`noindex` de page et ne sont **volontairement plus** listées dans `robots.ts` (audit sécurité du
2026-08-08) : un `disallow` serait une carte publique des chemins, et il empêcherait les robots
de voir le `noindex` — c'est lui qui les tient hors index. À supprimer toutes les deux le jour
où le choix est définitif.

### Ce que le gate garantit

`src/lib/hero-variant.test.ts` vérifie les assets des **trois** variantes, pas seulement de celle
qui est en ligne. C'est le point : l'intérêt d'avoir plusieurs mises en scène disparaît le jour où
l'une casse sans que personne ne le voie, parce qu'elle n'est pas celle qui est affichée. Il
vérifie aussi que :
- le manifeste (`public/hero-frames/manifest.json`) annonce **exactement** autant d'images qu'il
  en existe (une image en trop ou en moins et la fin de séquence resterait figée en silence) ;
- le poster de la vidéo **est** la dernière image de la séquence — c'est ce qui fait que les deux
  variantes finissent au même endroit, donc que le même calage 3D marche pour les deux.

### Refabriquer les assets

```bash
npm run frames    # la séquence : assets/video scroll trigger/V3 → public/hero-frames/
npm run montage -- --only=seg5-k5-k6,seg6-k6-k7 --dest="public/hero-video/hero.mp4"
```

Les deux partent **des mêmes segments**. Changer les segments impose de relancer les deux, sinon
les variantes divergent — et le test du poster le fera échouer.

### Ce qui les distingue vraiment, pour trancher

- **`cine`** (en ligne aujourd'hui) combine les deux : la vidéo d'ouverture raconte au rythme du
  montage puis dépose le visiteur sur la 3D ; remonter fait défiler la séquence à rebours,
  recharger la page rejoue la vidéo. Le prix : elle charge la vidéo ET la séquence.
- **`scroll`** donne le contrôle : le visiteur avance à son rythme, peut revenir. Mais il doit
  scroller pour que quoi que ce soit se passe, et la section occupe 320 vh.
- **`video`** raconte au rythme voulu par le montage, sur une seule hauteur d'écran. Mais la
  lecture automatique peut être refusée par le navigateur (le composant bascule alors directement
  sur la 3D), et le visiteur ne contrôle rien.

## 2. Accessibilité et états

- Le cadre est un `role="group"` nommé, focalisable, avec `aria-roledescription="carrousel"` ;
  les flèches ← → y naviguent.
- Le `<canvas>` est `aria-hidden` : un canvas ne dit rien. Un texte `sr-only` en `aria-live`
  décrit le leurre affiché et suit les changements.
- Boutons précédent/suivant et pastilles nommés (« Afficher le leurre Truite »), avec
  `aria-current` sur la pastille active. Focus visible partout (anneau global de `globals.css`).
- **`prefers-reduced-motion`** : le passage devient instantané, plus aucun amorti. Écouté en
  continu, pas seulement au montage.
- **Trois états distincts, jamais un cadre vide** : « Chargement du leurre… » tant que l'actif
  n'est pas rendu · message explicite si le `.glb` échoue · message explicite si le navigateur
  n'a pas de contexte WebGL. Les deux échecs renvoient vers les photos de la page produit et
  sont loggués en console.
- Rendu **suspendu** hors écran (IntersectionObserver) et onglet en arrière-plan
  (`visibilitychange`) : pas de GPU qui tourne pour rien.

---

## 3. Poids — ce qui est fait, ce qui reste

| | Avant | Après |
|---|---|---|
| `leurre_truite.glb` | 25,9 Mo | **6,8 Mo** |
| `leurre_brochet.glb` | 24,2 Mo | **4,0 Mo** |
| `leurre_orange.glb` | 21,5 Mo | **4,7 Mo** |
| **Total** | **71,6 Mo** | **15,5 Mo** |

Le gain vient **entièrement des textures** (4096² → 1024², JPEG q82 mozjpeg) et, quand elles
existent, des tangentes retirées — three reconstruit la base TBN par dérivées d'écran.

**Ce qui reste, chiffré et assumé** — à traiter avant la mise en ligne, pas avant de regarder :

1. **La géométrie n'est pas compressée** (~4 Mo par modèle : 130 à 155 k triangles, indices
   uint32, positions/normales/UV en float32). **Non fait**, et il y a deux routes distinctes :
   - **`EXT_meshopt_compression`** (route du kit de `files/` — son `brochet.opt.glb` fait
     **1,22 Mo**, soit les trois leurres à ~3,7 Mo). Décode 4× mieux, **mais** exige le
     `MeshoptDecoder`, qui instancie du **WebAssembly** : il faudrait `'wasm-unsafe-eval'` dans
     `script-src`. C'est un affaiblissement de la CSP — la décision se prend explicitement.
   - **`KHR_mesh_quantization` + `EXT_texture_webp` seuls**, sans meshopt : three les gère
     **nativement, sans aucun décodeur ni wasm**, donc **sans toucher à la CSP**. Gain plus
     modeste (positions/normales/UV en entiers courts) mais gratuit côté sécurité.
     C'est la route à essayer en premier.
2. **`leurre-truite.glb` transporte un squelette inutile** : `JOINTS_0/1` + `WEIGHTS_0/1`
   (8 influences par sommet) pour **zéro animation**, soit ~2,3 Mo. Il est bien **purgé au
   chargement** (`flattenGeometry`), donc il ne coûte plus de VRAM — mais il voyage encore sur
   le réseau. Le retirer du fichier lui-même reste **à faire**.
3. **Les `.glb` bruts d'`assets/3d models/`** : `leurre_truite.glb` est **déjà dans l'historique
   git** (26 Mo) ; `brochet` et `orange` (46 Mo) ne sont **pas** suivis et ne le seront pas sans
   décision explicite. Un dépôt à 100 Mo de sources se paie à chaque clone.

---

## 4. Vérification

- **Gate** : `tsc --noEmit` 0 · `eslint .` 0 · 48 tests · `next build` OK.
- **Navigateur réel** (Chromium, serveur dev) : rendu 1280×800 et 375×812, **zéro erreur console**,
  aucun scroll horizontal à 375 px, boucle vérifiée sur un tour complet
  (Truite → Brochet → Orange → Truite), contrôles présents dans l'arbre d'accessibilité avec
  leurs libellés. **Nage vérifiée par capture de deux frames successives** : le corps a roulé et
  la queue changé d'angle entre les deux — le mouvement est réel, pas juste compilé.
- **Pas de test automatisé** : règle du propriétaire — aucun test de composant, jamais. Une scène
  WebGL ne se teste pas en jsdom de toute façon.
- **Non vérifié** : `prefers-reduced-motion` en conditions réelles, et le rendu sur un vrai GPU
  mobile (la vérification s'est faite sur le rendu logiciel de Chromium headless).
