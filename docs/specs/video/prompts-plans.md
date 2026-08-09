# Prompts de production — hero « Le lancer »

> **Source canonique des prompts.** `storyboard-scroll.html` en est la vue de travail : toute
> correction se fait ici, puis se reporte dans le tableau `PLANS` du `<script>`. Les blocs
> ci-dessous sont **générés depuis ces mêmes données** — ils sont identiques, mot pour mot, à ce
> que la page affiche.

Statut : `brouillon` · Version 0.8 · 2026-08-06 · 24 i/s
**7 segments · 240 images · 10 s** · piste de scroll 240 vh (1 vh = 1 image) · **8 keyframes**

## La règle des blocs : un plan, un copié-collé

Chaque bloc ci-dessous est **autonome et complet**. Il contient, dans cet ordre :

1. **INVARIANTS** — ce qui ne change jamais d'un plan à l'autre (aube froide, brume, un seul
   bateau, trois cagoulés identiques, leurre 6,5 cm, zéro marque). Rappelé en tête de chaque
   bloc pour qu'un prompt reste juste même collé seul.
2. **SHOT** — la description détaillée de CE plan.
3. **ATTACHED IMAGES** — le mode d'emploi des pièces jointes, écrit pour le modèle : ce qu'il
   doit prendre dans chaque image, et ce qu'il n'a pas le droit d'en réinterpréter.
4. **NEGATIVE PROMPT** — le negative commun + les ajouts du plan, en clair.

Il n'y a **rien d'autre à copier ailleurs** : plus de negative séparé, plus d'ancrage à coller
en plus. Si l'outil que vous utilisez a un champ « negative prompt » distinct, coupez la
dernière section et collez-la dedans ; sinon, laissez tout ensemble, les modèles la lisent.

## Les 3 rendus de référence — à joindre à CHAQUE génération

**Aucun modèle vidéo ne lit un fichier GLB** — ni Veo, ni Kling, ni Runway : ils n'acceptent que
des images. Le leurre exact entre donc à l'écran d'une seule façon : on rend **trois vues** de
`leurre_truite.glb` une fois pour toutes, et **ces trois fichiers accompagnent chaque prompt
d'image et chaque prompt vidéo** (« ingredients » pour Veo 3.1, pièces jointes pour Nano
Banana). Toujours les mêmes trois, jamais d'autres : c'est ce qui empêche le leurre de muter
d'un plan à l'autre.

| Rendu | Orientation exacte | Ce que le modèle doit y prendre |
|---|---|---|
| **A — profil** | **Profil droit strict**, caméra perpendiculaire, corps aligné, articulation à plat, leurre horizontal tête à gauche | **La vue maîtresse.** Silhouette courte et ventrue, deux sections, les deux axes métalliques apparents, dos jaune-olive, bande magenta-rose fondue, ventre blanc nacré, caudale translucide fourchue, œil noir cerclé d'argent, anneau de tête chromé, les deux triples |
| **B — trois-quarts** | **Trois-quarts avant**, ≈ 45° sur l'horizontale et ≈ 30° au-dessus, nez vers la caméra, flanc droit encore lisible | Le **volume** du corps — à quel point il est profond et rond — et la façon dont la lumière tourne du dos olive vers le ventre nacré. Empêche le modèle d'aplatir le leurre en poisson-planche |
| **C — dessus** | **Plongée verticale**, perpendiculaire au dos, **articulation fléchie d'environ 20°** (pas droite) | L'**épaisseur** vue de haut et surtout **comment les deux sections pivotent autour de l'axe**. Sans cette vue, la nage en S du plan 07 n'est pas crédible |

**Comment les produire sans Blender.** Une visionneuse GLB dans le navigateur suffit (le fichier
reste en local, rien n'est uploadé) : charger `leurre_truite.glb`, choisir un éclairage neutre
légèrement froid, un fond transparent ou uni très sombre de la gamme, exporter trois PNG.
Règles de rendu : leurre **plein cadre**, net partout, **aucune ombre portée dure**, **aucun
décor**, aucune signature ni filigrane — une signature présente dans une référence se recopie
dans l'image générée.

**L'échelle ne se joue pas dans les rendus, elle se joue dans les mots.** Trois images d'un
objet isolé ne disent rien de sa taille — c'est pour ça que le leurre sortait géant en v0.4.
Chaque prompt ancre donc les 6,5 cm contre un repère présent dans le plan : l'anneau de tête du
scion (`k3`), la main gantée, la gerbe d'impact « scaled to a 6.5 cm object » (`k7`), la tête du
bass dont la tête fait plus de deux fois le leurre (`k9`).

**Quand les joindre :** dès `k3` et pour toutes les keyframes suivantes, et pour **tous** les
prompts vidéo à partir du segment 02. `k1`, `k2` et le segment 01 n'ont pas de leurre à
l'écran — chaque bloc le dit explicitement.

**Le témoin blanc a été retiré.** Il n'existait que comme cible de tracking pour un compositing
Blender ; sans compositing il ne sert plus à rien, et il créerait un conflit — une keyframe
blanche avec des références colorées demanderait au moteur de repeindre l'objet en cours de
plan. Le vrai leurre est donc dans les keyframes ET dans les références.

**Le repli, si la fidélité ne suit pas sur 07–08.** Dans l'ordre : relancer plusieurs prises et
garder la bonne ; sinon fabriquer `k8` et `k9` avec un modèle d'image (bien plus fidèle à une
référence qu'un modèle vidéo) pour sécuriser au moins le poster ; en dernier recours seulement,
faire compositer ces deux segments par quelqu'un dont c'est le métier.

## Générer les vidéos — le modèle, le coût, l'ordre

**La contrainte qui filtre tout : il faut du *first frame + last frame*.** Toute l'architecture
repose là-dessus. Un modèle qui n'accepte que l'image de départ laisse la fin libre, donc il
invente. **Et le film est muet** : ne jamais activer l'audio, il double le prix chez Veo.

| Modèle | Prix/s sans audio | Durée rendue | Coût par prise | Pour ce film |
|---|---|---|---|---|
| **Kling 3.0 Standard** | ≈ 0,084 $ | 10 s | **≈ 0,84 $** | Meilleur rapport qualité-prix. Solide sur l'eau, entrée + sortie natives. |
| Kling 3.0 Pro | ≈ 0,112 $ | 10 s | ≈ 1,12 $ | Le repli si le Standard peine sur un segment. |
| **Veo 3.1 First-Last** | ≈ 0,20 $ | 8 s | **≈ 1,60 $** | Le plus fort sur les mouvements de caméra amples. Deux fois le prix, et 8 s au lieu de 10. |
| Seedance 2.0 | ≈ 0,05–0,14 $ | ~15 s | ≈ 0,75–2 $ | Le moins cher selon le revendeur. Entrée + sortie supportées. |
| Luma Ray | ≈ 0,06 $ | court | ≈ 0,60 $ | Réputé sur la physique de l'eau. Clips plus courts. |

**Budget total : ≈ 24 $ en Kling Standard, ≈ 45 $ en Veo** (7 segments × 4 prises). L'écart ne
mérite pas d'être optimisé : choisir sur la qualité.

**Où acheter : fal.ai, au paiement à l'usage** — endpoints dédiés
(`fal-ai/veo3.1/first-last-frame-to-video`, `fal-ai/kling-video/…/image-to-video`), et surtout la
possibilité de lancer le même couple d'images sur deux modèles pour comparer.

**La méthode : acheter la décision avant d'acheter le film.** Lancer le segment 02 seul, une
prise Kling et une prise Veo (~2,50 $). C'est le plus difficile ; celui qui le passe passera les
six autres. Puis s'y tenir, pour que le grain reste d'une seule main.

### Les sept segments par ordre de difficulté

1. **Segment 02 — le plus dur.** Caméra qui traverse le bateau + bateau qui s'arrête + armé. Et
   l'eau passe d'un sillage plein gaz à un miroir, ce qui ne se fait pas en deux secondes.
   *Parade : garder les 46 DERNIÈRES images des 8–10 s rendues, là où l'eau s'est calmée.*
2. **Segment 06.** Échelle, assiette du leurre, sens de la ligne et décor changent en même temps.
3. **Segment 03.** La caméra doit quitter le bateau entièrement.
4. **Segment 05.** La traversée de surface — surveiller l'échelle de l'éclaboussure.
5. **Segment 01.** Une descente continue. Vérifier qu'aucun second bateau n'apparaît.
6. **Segment 04.** Un vol en ligne à travers la brume.
7. **Segment 07 — le plus sûr.** `k7` et `k8` partagent tout, seul le bass entre. Idéal pour un
   premier essai de validation de chaîne.

**Si un segment hallucine :** raccourcir le prompt au seul paragraphe `SHOT`. Avec deux keyframes
fournies, le décor est déjà fixé par les images ; trop de texte pousse le modèle à réinventer ce
qu'il voit déjà.

## Tableau de montage

| Segment | Titre | Fabrication | Moteur | Images | Durée | Scroll |
|---|---|---|---|---|---|---|
| P01 | Le lac | IA vidéo | Veo 3 | 34 | 1,42 s | 0–34 vh |
| P02 | À bord, et l'armé | IA + réf. 3D | Veo 3 | 46 | 1,92 s | 34–80 vh |
| P03 | Le lancer | IA + réf. 3D | Veo 3 | 20 | 0,83 s | 80–100 vh |
| P04 | La brume | IA + réf. 3D | Veo 3 | 32 | 1,33 s | 100–132 vh |
| P05 | L'impact | IA + réf. 3D | Veo 3 | 30 | 1,25 s | 132–162 vh |
| P06 | La nage | IA + réf. 3D | Veo 3 | 40 | 1,67 s | 162–202 vh |
| P07 | Le bass | IA + réf. 3D | Veo 3 | 38 | 1,58 s | 202–240 vh |
| | **Total** | | | **240** | **10 s** | **240 vh** |

Le fil du plan-séquence : plongée aérienne vers le seul bateau du lac → la caméra franchit le
tableau arrière et se cale derrière le lanceur → l'armé → le lancer, la caméra fouette vers le
haut et part à la poursuite du leurre → la traversée de la brume → l'impact, la caméra crève la
surface avec lui → la nage en S de profil → le bass se cale derrière. **Une seule caméra, un
seul mouvement, dix secondes, zéro coupe.**

## Les 8 keyframes — une chaîne, pas des paires

Quatorze emplacements, **huit fichiers** : la fin du segment *n* EST le début du segment *n+1*, le
même fichier. Le faux raccord devient impossible par construction. Rangement :
`assets/hero/frames/k1.png` … `k9.png`.

| Fichier | Rôle | Fabrication | Rendus leurre |
|---|---|---|---|
| `k1` | ouverture — l'image mère | générée à froid | non |
| `k2` | fin P01 = début P02 | chaînée sur `k1` | non |
| `k3` | fin P02 = début P03 — l'armé maximal | chaînée sur `k2` | **oui** |
| `k4` | fin P03 = début P04 — la poursuite est lancée | chaînée sur `k3` | **oui** |
| `k5` | fin P04 = début P05 — sortie de brume | chaînée sur `k4` | **oui** |
| `k6` | fin P05 = début P06 — sous la surface | chaînée sur `k5` | **oui** |
| `k7` | fin P06 = début P07 — la nage installée, PAS de poisson | chaînée sur `k6` | **oui** |
| `k8` | fin P07 — **le poster**, le bass prend le leurre | chaînée sur `k7` | **oui** |

Le bass n'existe dans aucune keyframe sauf `k8` : il sort du massif d'algues PENDANT le segment
07, c'est Veo qui produit ce mouvement.

## Reprise sur la série V2 — ce qui se garde, ce qui se refait

L'ambiance est acquise. Ce qui suit corrige la structure et les défauts techniques.
La chaîne passe de 9 à 8 keyframes : l'ancienne `k3` disparaît, absorbée par la fusion des
segments 02 et 03. Les fichiers se renumérotent.

| Nouveau | Ancien | Action | Pourquoi |
|---|---|---|---|
| `k1` | `k1` | **Garder** | Rien à redire. Recadrer le ✦. |
| `k2` | `k2` | **Regénérer** | Lanceur sur le pont AVANT, et il lance alors que le bateau déjauge. Écusson de marque sur le hors-bord. |
| `k3` | `k4` | **Regénérer** | Carré 1:1. Nuage d'éclaboussures flottant sans cause. Bateau à l'arrêt désormais. |
| `k4` | `k5` | **Regénérer** | Carré 1:1. Leurre beaucoup trop gros. Vole dans le mauvais sens. |
| `k5` | `k6` | **Regénérer** | Le bateau réapparaît alors que l'image précédente ne le montre plus. Trois personnes debout au lieu de deux assises. |
| `k6` | `k7` | **Regénérer** | L'eau tire au turquoise tropical : seule image qui décroche de l'aube froide. |
| `k7` | `k8` | **Regénérer** | Le leurre lit comme une illustration 3D, et aucune ligne n'est attachée. |
| `k8` | `k9` | **Garder — renommer** | Validée : c'est la prise en charge du leurre par le bass. Recadrer le ✦. |

Une seule manipulation de fichier : renommer l'ancienne `k9` en `k8`.

### Trois pièges techniques constatés en génération

1. **Le format ne se règle pas dans le prompt.** Trois images sur neuf sont sorties en carré
   2048×2048 alors que le prompt disait 16:9. Régler le ratio sur 16:9 **dans l'outil**.
2. **Le losange ✦ apparaît sur toutes les images.** Signature du générateur, donc une marque à
   l'écran. Aucun negative ne l'empêche de façon fiable : le recadrer à la main.
3. **Les marques du bateau passent au travers** (écusson sur le hors-bord, logos sur les sièges).
   À contrôler à l'œil sur chaque image où le bateau est net.

## Ancrage complet — le filet, pas le quotidien

Sa version condensée est déjà en tête de chaque bloc ci-dessous. Celui-ci ne sert que si un
modèle dérive malgré tout : le coller en entier par-dessus, puis regénérer.

```text
Photoreal cinematic film still, 16:9, full-frame cinema camera, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation. Alpine lake at COLD BLUE DAWN, before sunrise: glassy dark steel-blue water, near-black forested shores, layered mountain ridges dissolving into a thick band of low mist lying on the water — the mist is present in every frame, it is the signature of this film. Cold grey-blue sky; the only warm thing in the world is one narrow pale-amber glow low behind the ridgeline on the LEFT, where the sun has not yet risen. That glow never moves and never gets stronger. Mood: silent, cold, precise, faintly menacing. Boat: ONE black metallic-flake bass boat and NO OTHER BOAT anywhere on the water — long, low and sporty, sharp raked bow, very low freeboard, wide flat dark casting decks fore and aft, two pedestal seats at a low console with two dark glowing electronics screens, one big black outboard centred on the transom on a jack plate between two vertical trim brackets, a bow-mounted electric trolling motor stowed flat on the front deck. Crew: EXACTLY THREE people aboard — never two, never four, always the same three — dressed strictly identically: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, a matte charcoal-black technical shell jacket with a clean minimal cut and the hood up, black technical trousers, black technical gloves, dark deck shoes. They are calm, precise, experienced anglers going to work at first light, always seen from behind or as backlit silhouettes, never turning toward the camera, so no face is ever readable. Tackle: matte black casting rod, dark grey reel, olive-grey braided line, clear leader. The lure is EXACTLY the jointed swimbait shown in the three attached reference renders and nothing else: a short deep-bodied two-section swimbait, exactly 6.5 centimetres long — TINY, shorter than the width of a hand — olive-yellow back, soft magenta-pink flank band, pearl-white belly, two exposed metal hinge pins, translucent milky forked tail, large black eye in a silver ring, two dark treble hooks. Never invent a different lure, never change its colours, never enlarge it: its 6.5 cm scale must stay believable against everything near it — rod tip, gloved hand, splash, fish. ABSOLUTELY NO BRANDING ANYWHERE IN THE FRAME: no logo, wordmark, decal, sticker, patch, embroidery or printed label — not on the hull, the outboard, the screens, the clothing, the caps, the sunglasses, the rod or the reel. Every surface is plain. No text and no watermark of any kind.
```

---

# Les 8 segments


---

## P01 — Le lac · `k1` → `k2` · 34 i (1,42 s)

**Intention.** Poser le monde en une seconde et demie : l'aube froide, la brume, et UN bateau noir — la seule présence humaine du paysage. La caméra plonge déjà : le plan-séquence est en mouvement dès sa première image.

### Keyframe `k1` — générée à froid

Générée à froid — la seule des huit. C'est l'image mère : la lumière d'aube froide, l'eau noire et la brume qu'elle fixe tiennent les 239 autres images. VALIDÉE — ne pas la regénérer.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Photoreal cinematic film still, 16:9 widescreen, full-frame cinema camera, filmic contrast, fine natural grain, deep clean shadows, no HDR. Very high aerial view over a vast alpine lake at COLD BLUE DAWN, before sunrise, camera tilted about 45 degrees down along its flight path, already moving. The dark steel-blue water fills most of the frame, glassy and still; a thick white band of low mist lies across the middle distance in front of the far ridges. Near-black forested shores frame the water; three layers of ridges fade upward into cold haze; one narrow pale-amber pre-dawn glow sits low behind the LEFT-HAND ridgeline, clearly on the left third of the frame — the only warmth in the world, and it never moves. ONE black bass boat, tiny in the lower centre, is the only human presence in the landscape — at speed, dragging a long thin white wake diagonally toward the lower-left corner, the brightest line in the whole frame. The upper third of the frame is clean, even, cold grey-blue sky with no cloud shapes in its centre. 24mm equivalent, f/4, deep focus, natural light only.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, low altitude, close-up boat, visible people, white hull, warm golden light, busy sky, centred horizon, amber glow on the right, square crop, 1:1 aspect ratio
```

### Keyframe `k2` — chaînée sur `k1`

Chaînée sur k1. Fin de P01 ET début de P02. À REGÉNÉRER : dans la version actuelle le lanceur est sur le pont AVANT et il lance alors que le bateau déjauge — on ne lance pas d'un bateau en marche. Ici il tient seulement sa canne, sur le pont ARRIÈRE.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame as the exact starting point, keep the cold dawn light, the water colour, the mist band and the ridgelines identical. The camera has dived and closed in: it now flies just behind and above the boat, about 30 degrees down, still moving. The black bass boat sits in the lower centre, about a third of the frame wide, running at speed straight away from the camera: we look down its length from behind, the big black outboard centred on the transom between its two trim brackets in the near foreground, the wide flat dark REAR casting deck just beyond it, white water churning under the hull, the wake opening in a wide white V that runs out through the two bottom corners. EXACTLY THREE anglers, dressed identically in black neck gaiters pulled up over the nose and mouth, black caps and matte charcoal hooded shell jackets: TWO seated low in the pedestal seats at the console with the faint glow of two dark screens in front of them, and ONE standing on the REAR casting deck closest to the camera, seen from behind, simply holding a matte black rod low and across his body — he is NOT casting, the line is not out, the lure is clipped to the rod's hook keeper and far too small to read at this distance. Nobody casts from a boat running on plane. No face, no skin. The pale-amber glow stays low on the LEFT horizon; the top of the frame stays clean cold sky. 24mm equivalent, f/4, slight motion blur in the foam.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k1 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, casting, line in the air, rod bent, angler on the front deck, angler on the bow, visible faces, two people, four people, level horizon, static hover, warm golden light, white hull, brand badge on the outboard cowling, emblem on the engine, logos on the seat backs, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 01

**À joindre — rien d'autre :** `k1.png` en **première image**, `k2.png` en **dernière image**.

```text
MOTION — One continuous take, segment 1 of a single unbroken camera move — no cut anywhere. Cinematic aerial shot over a vast alpine lake at cold blue dawn, before sunrise: glassy dark steel-blue water, near-black forested shores, a thick band of low mist lying on the water, one narrow pale-amber glow behind the left ridgeline. The camera starts very high, already moving, and dives fast and smoothly toward the ONLY boat on the water: a black bass boat at speed dragging a long white V wake. It ends close behind and above the boat, looking down its length from astern, where THREE identical anglers — black neck gaiters up against the cold, black caps, charcoal hooded shell jackets, all seen from behind — ride through the cold air: two seated at the console, one standing on the rear deck holding a rod low, not casting. Natural light only, 24 fps, filmic contrast, fine grain. Fast continuous descent, no orbit, no hesitation, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k1. Last frame: the attached keyframe k2. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, orbit, static hover, second boat, golden hour, birds, casting from a moving boat
```

**Raccords.** Entrée : Ouverture sur noir, 4 images de fondu — pas 8 : à cette durée, un fondu long mange le plan. · Sortie : La caméra est calée derrière le bateau, les trois silhouettes lisibles (= k2). · Frame d'arrêt : Image 24 — le sillage traverse le cadre en diagonale.


---

## P02 — À bord, et l'armé · `k2` → `k3` · 46 i (1,92 s)

**Intention.** Le segment fusionné — c'est la correction majeure de cette version. La caméra traverse le bateau entre les trois silhouettes, le bateau déjauge et s'arrête, l'eau se calme, et le lanceur arme dans la foulée. Un vrai déplacement de caméra ET une action : de quoi remplir les dix secondes de Veo sans qu'il invente. Avant, deux segments se partageaient un cadre immobile où seul un bras bougeait — Veo comblait le vide.

**Keyframe d'entrée `k2`** — rien à générer : le début de P02 = k2, la fin de P01 — le même fichier. Chaque jonction du plan-séquence est un fichier partagé : le faux raccord est impossible par construction.

### Keyframe `k3` — chaînée sur `k2`

Chaînée sur k2. Fin de P02 ET début de P03 — l'armé maximal. À REGÉNÉRER : l'ancienne k4 était en carré 1:1 et portait un nuage d'éclaboussures flottant sans cause. Ici, format 16:9, bateau à l'arrêt, eau lisse.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame as the exact starting point, keep the cold dawn light, the mist band, the boat and the three identical anglers. The camera has crossed the transom, glided low across the wide flat rear casting deck and settled close behind the standing angler, slightly below shoulder height, on the same axis. THE BOAT IS NOW STOPPED AND DRIFTING: no wake, no foam, the water around it flat and glassy, the mist band untouched. He fills the right third of the frame from mid-thigh up, seen strictly from behind — black neck gaiter over the nose and mouth, a plain black cap pulled low, a matte charcoal hooded shell jacket, black gloves. He has swept the rod back to its loading peak: the blank bends into a deep C above and behind him, the braid pulled dead straight. The 6.5 cm lure is swung back and up near the top-left of the frame and it is TINY: it hangs several metres from the camera, so on screen it must read SMALLER THAN THE ANGLER'S GLOVED HAND and no bigger than the diameter of the reel — a small pale shape the size of a matchbox, never a large object. A lure that reads bigger than the angler's head is the single most common failure of this frame. The clear leader is knotted to the CHROME EYELET ON ITS NOSE and runs taut from that nose toward the rod tip, so the lure is visibly being dragged nose-first by the line: the line is never attached to a hook and never trails from the tail. The two other anglers are soft dark shapes lower left, seated at the console. The pale-amber glow stays on the LEFT. Air is still, no spray in mid-air. 40mm equivalent, f/2.2, focus held on the rod tip and the lure.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k2 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, floating cloud of spray in mid air, unexplained water burst, boat still moving, wake, foam, visible faces, broken rod, snapped line, slack line, line tied to a hook, leader trailing from the tail, no line at all, oversized lure, lure bigger than the angler's hand, lure bigger than the angler's head, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 02

**À joindre — rien d'autre :** `k2.png` en **première image**, `k3.png` en **dernière image**.

```text
MOTION — One continuous take, segment 2 — one unbroken camera move, no cut. Continuing its dive, the camera crosses the transom of the black bass boat, glides low and fast along the wide flat casting deck between the three identical anglers — dark figures in black caps, black neck gaiters and charcoal hooded shell jackets, all seen from behind, two seated at the console with their screens glowing faintly — and settles close behind the one standing on the rear deck, just below his shoulders. As the camera settles, the boat comes off plane, slows and stops: the wake dies away, the water goes flat and glassy, the mist band stands still. Then, in the same continuous shot, he loads the cast in real time: the rod sweeps back, the blank bends into a deep C, the braid snaps dead straight, and the tiny 6.5 cm lure swings back and up on its leader — the clear leader knotted to the chrome eyelet on its nose, taut, dragging it nose-first. Cold blue dawn, thick mist ahead, pale-amber glow far left. 24 fps, filmic contrast, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k2. Last frame: the attached keyframe k3. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, beer can, drinking, party, visible faces, fourth person, casting while the boat is moving, boat still on plane at the end, two-handed overhead cast, fly casting
```

**Raccords.** Entrée : Continuité pure — le début de P02 est k2, le même fichier que la fin de P01. · Sortie : L'armé maximal, bateau arrêté, scion à sa flexion la plus forte (= k3). · Frame d'arrêt : Image 30 — les trois silhouettes lisibles, le lanceur au tiers droit.

**Note de production.** Segment le plus long du film après la nage : c'est lui qui absorbe l'ancien P03. Il contient trois choses — la traversée, l'arrêt du bateau, l'armé — donc de la matière pour dix secondes. Premier segment où les 3 photos de référence du leurre sont obligatoires.


---

## P03 — Le lancer · `k3` → `k4` · 20 i (0,83 s)

**Intention.** Le pivot du film. Le scion se détend, le leurre part — et au lieu de couper, la caméra fouette vers le haut et PART AVEC LUI. C'est le moment où le film quitte le monde des hommes pour celui du leurre, en un seul mouvement.

**Keyframe d'entrée `k3`** — rien à générer : le début de P03 = k3, la fin de P02 — le même fichier. La caméra ne coupe pas : elle part avec le leurre.

### Keyframe `k4` — chaînée sur `k3`

Chaînée sur k3 (lumière et décor seulement). Fin de P03 ET début de P04 : la poursuite est lancée, le bateau est derrière la caméra. À REGÉNÉRER : l'ancienne k5 était en carré 1:1, le leurre y était énorme et volait dans le mauvais sens.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame only for its cold dawn light, its dark water and its mist band, the cast has fired and the camera has whipped up off the boat and launched forward after the lure: we are now low over the open water, flying fast toward the thick wall of mist. In the centre of the frame, a few metres ahead, the 6.5 cm lure flies in a flat arc AWAY from the camera and deeper into the frame. ITS NOSE POINTS IN THE DIRECTION IT IS TRAVELLING, away from the boat and away from the line — it flies nose-first, like a thrown dart. The clear leader is knotted to the chrome eyelet on that nose and STREAMS BACK from it, running past the lure's own body and out toward the lower corner where the boat is: the line is always behind the lure, never ahead of its nose. It is TINY — a small pale tracer no wider than a thumb against the huge lake, never a large object filling the frame. Below: dark glassy water rushing past, streaked with faint cold reflections. Ahead: the wall of mist, tall and soft, its left side faintly warmed by the pale-amber glow. The boat is GONE from the frame, behind the camera now. 35mm equivalent, f/2.8, strong forward motion blur at the frame edges, the lure sharp.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k3 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, boat visible, angler visible, oversized lure, giant lure, lure filling a third of the frame, missile, rocket, lure flying tail-first, lure flying backwards, nose pointing back toward the line, leader in front of the nose, no line at all, warm golden light, birds, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 03

**À joindre — rien d'autre :** `k3.png` en **première image**, `k4.png` en **dernière image**.

```text
MOTION — One continuous take, segment 3 — no cut. The cast fires: the rod whips forward, the blank straightens, the line rips off the reel, and the tiny 6.5 cm lure launches out over the water, nose-first, the clear leader streaming back from the eyelet on its nose. In the same second the camera whips up off the boat and accelerates after the lure, leaving the boat behind and below, out of frame: now flying low over dark glassy water at cold blue dawn, chasing a small pale tracer straight toward the thick wall of mist. The lure stays small against the lake — it is a 6.5 cm object, not a projectile. Strong controlled speed, frame edges motion-blurred, the lure sharp. 24 fps, one unbroken accelerating move, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k3. Last frame: the attached keyframe k4. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, tangled line, backlash, rod breaking, lure hitting the boat, camera staying on the boat, oversized lure, missile, lure flying tail-first
```

**Raccords.** Entrée : Continuité pure sur k3 — la coupe n'existe pas : la caméra part avec le leurre. · Sortie : En poursuite au ras de l'eau, le leurre net au centre, la brume qui approche (= k4). · Frame d'arrêt : Image 15 — le leurre net, le mur de brume plein cadre devant.


---

## P04 — La brume · `k4` → `k5` · 32 i (1,33 s)

**Intention.** Le seul segment qui respire — le battement onirique du film, DANS sa signature : le leurre traverse la brume de l'aube. Le monde devient doux et silencieux une seconde, puis s'ouvre : l'eau noire attend.

**Keyframe d'entrée `k4`** — rien à générer : le début de P04 = k4, la fin de P03 — le même fichier. La poursuite entre dans la brume sans coupe.

### Keyframe `k5` — chaînée sur `k4`

Chaînée sur k4. Fin de P04 ET début de P05 : la sortie de brume, la bascule vers l'eau. À REGÉNÉRER : l'ancienne k6 faisait réapparaître le bateau et les trois personnes DEBOUT — un faux raccord franc, puisque l'image précédente ne montre plus le bateau du tout.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame as the exact starting point, keep the cold light, the mist and the water identical. The camera and the lure have crossed the mist band and come out the far side: the wall of mist now fills the rear third of the frame behind the lure, torn veils still curling where they crossed it. THE BOAT IS NOT IN THIS FRAME AT ALL — no hull, no anglers, no rod, nothing but open water, mist and sky. The 6.5 cm lure is at the top of its arc in the centre of the frame. The camera has closed in on it during the flight, so it reads larger on screen than in the previous frame — but it must still read unmistakably as a small 6.5 cm object against a huge lake, never as a big fish-sized body. IT STILL FLIES NOSE-FIRST, its nose pointing forward in the direction of travel and never back toward the line; the clear leader streams BACK from the eyelet on that nose, running past its body and disappearing into the mist behind it. Its nose is just tipping down toward the water. Below and ahead: open dark glassy water, very close now, smooth as black glass, holding a faint pale reflection of the mist. The pale-amber glow stays far LEFT, diffused by the mist like a lantern behind frosted glass. 35mm equivalent, f/2.8, the lure sharp, the mist soft.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k4 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, boat, hull, anglers, people, rod, second boat, clouds seen from above, aerial view of clouds, oversized lure, giant lure, lure the size of a real fish, lure flying tail-first, nose pointing back toward the line, missile, warm sunlight, birds, no line at all, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 04

**À joindre — rien d'autre :** `k4.png` en **première image**, `k5.png` en **dernière image**.

```text
MOTION — One continuous take, segment 4 — no cut. Flying alongside the tiny 6.5 cm lure as it arcs through the thick band of dawn mist lying over the lake: veils of grey-blue vapour tear past the camera and curl off the lure, the clear leader streaming back from its nose, the world turning soft and silent inside the mist, the pale-amber glow diffusing through from the left like a lantern behind frosted glass. Then the far side: the mist opens, the air clears, and the lure comes out over open black-glass water at the top of its arc, nose starting to tip down, the camera arcing over with it. The boat never comes back into frame. 35mm equivalent, f/2.8, smooth fast tracking, 24 fps, one unbroken move through the mist, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k4. Last frame: the attached keyframe k5. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, above the clouds, cloud deck, god rays through cumulus, boat, hull, anglers, rod, oversized lure, birds
```

**Raccords.** Entrée : Continuité pure sur k4 — la poursuite entre dans la brume. · Sortie : Sortie de brume, le leurre bascule nez vers l'eau, aucun bateau au cadre (= k5). · Frame d'arrêt : Image 24 — la sortie de brume, les voiles qui se déchirent.


---

## P05 — L'impact · `k5` → `k6` · 30 i (1,25 s)

**Intention.** Chute, impact, et la caméra crève la surface AVEC le leurre, sans s'arrêter. La charnière entre les deux mondes — l'air froid et l'eau — en un seul mouvement. L'éclaboussure est PETITE : c'est un objet de 6,5 cm qui tombe, pas un plongeur.

**Keyframe d'entrée `k5`** — rien à générer : le début de P05 = k5, la fin de P04 — le même fichier. La chute est déjà amorcée.

### Keyframe `k6` — chaînée sur `k5`

Chaînée sur k5 (lumière et température seulement). Fin de P05 ET début de P06 : sous la surface. À REGÉNÉRER : l'ancienne k7 était superbe mais son eau tirait au turquoise lumineux, presque tropical — c'est la seule image qui décrochait de l'aube froide.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame only for its cold light and colour temperature, the camera has hit the water with the lure and crossed the surface. We are just under water, looking slightly up. THE WATER IS COLD AND DARK: deep steel blue-green, desaturated, dim like a lake twenty minutes before sunrise — never bright turquoise, never tropical, never sunlit. The underside of the surface is a rippling ceiling of pale silver-blue with the collapsing crown of a small, tight impact splash still printed on it. A modest column of fine white bubbles — scaled to a 6.5 cm object, not a cannonball — trails down toward the camera, thinning into drifting particles. Faint cold light shafts angle down, weak and diffuse. In the centre, the 6.5 cm lure hangs nose-down amid the last bubbles, sinking gently; the clear leader is knotted to the chrome eyelet on its nose and runs UP from that nose toward the surface and out of frame, taut and straight — it is what will pull the lure. The water darkens to near-black blue-green at the bottom of the frame. No fish anywhere. 24mm equivalent, f/2.8, high-speed water detail.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k5 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, bright turquoise water, tropical water, sunlit lagoon, warm orange light through the surface, huge splash, tidal wave, explosion of foam, frozen droplet cliché, murky brown water, silt, debris, fish, bass, aquarium glass, gravel, oversized lure, no line at all, leader trailing from the tail, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 05

**À joindre — rien d'autre :** `k5.png` en **première image**, `k6.png` en **dernière image**.

```text
MOTION — One continuous take, segment 5 — no cut. Falling with the tiny 6.5 cm lure toward the black-glass water at cold blue dawn: the surface rushes up holding a pale reflection of the mist, then the impact — a small, tight splash scaled to a 6.5 cm object, a burst of fine bubbles — and the camera punches through the surface WITH the lure in the same continuous movement. Under water the world is cold, dark and desaturated, deep steel blue-green, never tropical: the surface becomes a rippling silver ceiling above, a modest bubble column trails down, faint cold light shafts angle through, and the lure sinks nose-down through drifting particles with the clear leader running up from its nose toward the surface. No fish yet. 24 fps, high-speed water detail, one unbroken move across the surface, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k5. Last frame: the attached keyframe k6. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, cut at the surface, scene change at impact, huge cinematic splash, bright turquoise water, tropical water, warm underwater glow, fish visible, bass visible
```

**Raccords.** Entrée : Continuité pure sur k5 — la chute est déjà amorcée. · Sortie : Sous la surface, la couronne d'impact au plafond, le leurre qui coule (= k6). · Frame d'arrêt : Image 24 — juste sous la surface, la couronne d'impact au-dessus.


---

## P06 — La nage · `k6` → `k7` · 40 i (1,67 s)

**Intention.** Le segment le plus long du hero, et c'est volontaire : c'est l'argument produit. La ligne se tend, le leurre se retourne et part, l'articulation travaille, la nage en S se lit de profil. Cadrage MACRO — caméra proche, faible profondeur de champ, particules larges au premier plan : c'est ce qui rend 6,5 cm crédible.

**Keyframe d'entrée `k6`** — rien à générer : le début de P06 = k6, la fin de P05 — le même fichier. La caméra se cale à hauteur de leurre.

### Keyframe `k7` — chaînée sur `k6`

Chaînée sur k6. Fin de P06 ET début de P07 : la nage installée. AUCUN poisson ici. À REGÉNÉRER : l'ancienne k8 avait une bonne composition mais le leurre y lisait comme une illustration 3D posée sur une photo, et il n'y avait aucune ligne attachée.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame as the exact starting point, keep the cold dark blue-green water, the faint light shafts and the drifting particles identical. The camera has settled at lure depth, turned to a profile framing and now tracks sideways: the 6.5 cm lure swims side-on in the centre-left, horizontal, moving left across the frame, its rear section angled off the hinge mid-kick. THE LURE MUST READ AS A REAL PHYSICAL OBJECT PHOTOGRAPHED UNDER WATER, not as a 3D render or an illustration pasted onto a photo: same grain, same slight softness, same water haze and same particles in front of it as everything else in the frame, wet specular highlights on its painted flanks, faint refraction at its edges. The clear leader is knotted to the chrome eyelet on its nose and runs FORWARD from that nose, taut and straight, out of the left edge of the frame — it is visibly what is pulling the lure, and it never trails from the tail. This is a MACRO framing — camera close, shallow depth of field, drifting particles reading large in the foreground. The background slides past: a dark weed bed to the RIGHT, dense enough for something large to be hiding in it, and deeper gloom opening beyond. A faint trail of micro-bubbles crosses the frame behind the lure. The bottom band of the frame is even, dark blue-green, with no sharp detail. 60mm equivalent macro, f/2.8, camera at lure height, matching its speed. No fish anywhere.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k6 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, any fish, bass, pike, 3d render look, cgi look, illustration, painted cartoon lure, lure pasted on the photo, lure sharper than the water around it, no line at all, leader trailing from the tail, line tied to a hook, oversized lure, wide landscape framing, aquarium glass, gravel substrate, tropical fish, busy lower band, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 06

**À joindre — rien d'autre :** `k6.png` en **première image**, `k7.png` en **dernière image**.

```text
MOTION — One continuous take, segment 6 — no cut. Under water at cold blue dawn, in dark desaturated blue-green water, the camera settles to lure depth and swings smoothly to a macro profile framing as the line comes tight: the tiny 6.5 cm two-section lure turns nose-first and settles into an S-shaped swim, the rear section kicking around the hinge while the head holds a steady line. The clear leader runs forward from the eyelet on its nose, taut, visibly pulling it. The camera tracks sideways at lure height, matching its speed — macro clarity on the lure, shallow depth of field, drifting particles large in the foreground, a dark weed bed sliding past on the right, a faint trail of micro-bubbles. The lure looks like a real object filmed under water, wet and slightly hazed by the water, never like a 3D render. 24 fps, one unbroken tracking move, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k6. Last frame: the attached keyframe k7. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, fish, bass, pike, 3d render look, cgi look, illustration, single-piece lure, no joint, stiff lure, oversized lure, no line, camera cutting to a new angle
```

**Raccords.** Entrée : Continuité pure sur k6 — la caméra se cale à hauteur de leurre. · Sortie : La nage en S installée, cadrage macro de profil, massif d'algues à droite (= k7). · Frame d'arrêt : Image 30 — le leurre de profil, articulation en pleine flexion.

**Note de production.** C'est ici que le leurre est jugé : net, de profil, plein cadre. Les 3 photos de référence ne sont pas optionnelles. Deux points à surveiller sur les rushes — la MATIÈRE (le leurre doit être photographié, pas incrusté) et la LIGNE (tendue, partant du nez vers l'avant). La bande basse porte le beat 2 : la garder homogène.


---

## P07 — Le bass · `k7` → `k8` · 38 i (1,58 s)

**Intention.** La fin du film change de nature : on ne coupe plus sur la traque, on montre la prise en charge. Le bass sort d'un massif d'algues, se referme sur le leurre et l'emporte. C'est plus fort et plus honnête pour vendre un leurre — la preuve, pas la promesse — et la page bascule aux specs sur cette image-là.

**Keyframe d'entrée `k7`** — rien à générer : le début de P07 = k7, la fin de P06 — le même fichier, SANS poisson. Le bass entre pendant le segment : c'est le seul changement que Veo doit produire.

### Keyframe `k8` — chaînée sur `k7`

Chaînée sur k7. C'est la keyframe la plus importante des huit : frame d'arrêt du hero, poster de la vidéo et image fixe du mode animations réduites. VALIDÉE — c'est ton ancienne k9, à renommer en k8. Ne pas la regénérer.

```text
INVARIANTS — true in every single shot of this film, never change them: cold blue dawn before sunrise; glassy dark steel-blue water; a thick band of low mist lying on the water, present in every frame; one narrow pale-amber glow low behind the LEFT ridgeline and no other warm light anywhere; ONE black bass boat and no other boat on the water; EXACTLY THREE anglers aboard — never two, never four — dressed strictly identically in cold-weather fishing kit: a plain black technical neck gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark polarised sunglasses, the hood of a matte charcoal shell jacket up, black technical gloves. They are calm, precise, experienced anglers going to work at first light. They are always seen from behind or as backlit silhouettes and never turn toward the camera, so no face is ever readable. Framing is 16:9 widescreen, never square. The lure is exactly the jointed swimbait shown in the attached reference photos, 6.5 cm long — TINY, shorter than the width of a hand, and it never grows. It is always tied to a clear fluorocarbon leader knotted to the CHROME EYELET ON ITS NOSE — never to a hook, never to the tail. The leader always behaves like a real line under tension: in the air during the cast the lure flies NOSE-FIRST in its direction of travel and the leader streams BACK from the nose eyelet, running past the lure's own body toward the rod behind it — the lure never flies tail-first and its nose never points back toward the line. Under water on the retrieve the leader runs FORWARD from the nose, taut and straight, because that is what is pulling the lure. It is thin and discreet but it is always there — a lure swimming with no line is the mistake to avoid. No logo, decal, sticker, patch or text on any surface anywhere in the frame. Photoreal cinematic film look, filmic contrast, fine natural grain, deep clean shadows, no HDR, no oversaturation.

SHOT — Using the attached frame as the exact starting point, keep the cold dark blue-green water, the light shafts, the drifting particles and the weed bed identical. The moment has arrived: a very large largemouth black bass has come out of the weed bed on the right and is taking the lure. It fills the right half of the frame, side-on, moving left toward the lure — deep-bodied and thick across the shoulders, dark olive-green mottled back, bronze-green flank broken by a ragged dark horizontal band, pale belly, spiny front dorsal then soft rear dorsal, pectoral fins fanned, one dark eye ringed with bronze locked forward. Its big jaw is open and closing on the rear of the lure, engulfing the tail section — the lure is one mouthful for it. The 6.5 cm lure is still sharp in the centre-left, its head clear of the fish, the clear leader running forward from the chrome eyelet on its nose and out of the left edge, taut. Keep the fish credible for the species: a very big largemouth is about 50 cm, so its head reads roughly two to three times the length of the lure — never five times, never pike-sized. No blood, no hook in the flesh, no angler, no net. The bottom band of the frame stays even and dark with no sharp detail. 60mm equivalent, f/2.8.

ATTACHED IMAGES — use each one exactly as described below, do not reinterpret them:
• Attached keyframe k7 — the exact starting point of this shot. Keep its light, colours, water, mist, boat, crew, tackle and framing strictly identical; change only what the SHOT paragraph asks to change.
• Reference render A — lure, strict right-side profile, body straight: THE master view — the lure may never look like anything else. Copy exactly: the short deep-bodied two-section shape, the two exposed metal hinge pins between the sections, the olive-yellow back, the soft magenta-pink flank band fading into a pearl-white belly, the two small olive dorsal fins, the large black eye in its silver ring, the chrome nose eyelet, the translucent milky-white forked tail, the two dark treble hooks on split rings.
• Reference render B — lure, straight-on front view: Copy the body volume — how deep and how wide the body is, and the way the olive back, the magenta flank band and the pearl belly meet. This is what stops the lure being flattened into a flat cut-out fish.
• Reference render C — lure, top view: Copy the body thickness seen from above and the position of the joint between the two sections. This is what makes the S-swim believable.
The lure in these renders is the only lure that may appear. It is 6.5 cm long — tiny, shorter than the width of a hand. Never enlarge it, never restyle it, never change its colours, never add or remove a hook.

NEGATIVE PROMPT — none of the following may appear anywhere in the image or the motion:
text, watermark, logo, brand name, signature, subtitles, caption, golden hour, warm sunny light, midday light, visible sun disc, orange sky filling the frame, HDR look, oversaturated colours, blown-out sky, face turned toward the camera, readable face, portrait framing, uncovered face, second boat, another boat, extra boats, kayak, canoe, jet ski, sailboat, pontoon boat, white fibreglass runabout, cabin cruiser, high freeboard hull, four people, fifth person, crowd, waders, oilskins, foul-weather bibs, fly fishing vest, hi-vis clothing, bright coloured clothing, casual streetwear, beer can, clothing logos, sponsor patches, team jersey, embroidered logo, printed label, brand sticker, boat brand decals, outboard engine branding, electronics brand logos, buildings, resorts, roads, power lines, birds, aircraft, contrails, rainbow, anamorphic flare stars, cartoon, illustration, 3d render look, plastic CGI water, warped anatomy, extra fingers, extra limbs, oversized lure, giant lure, lure bigger than a hand, different lure, restyled lure, changed lure colours, extra hooks, three hooks, single-piece lure, no joint, slim elongated glide bait, duplicated lure, lure with no line attached, leader tied to a hook, leader trailing from the tail, line pointing the wrong way, square crop, 1:1 aspect ratio, vertical crop, cut, jump cut, scene change, cross dissolve, montage, blood, hooked fish, hook in the flesh, angler hands, net, pike, northern pike, long duckbill snout, muskellunge, trout, carp, barracuda, shark, tropical fish, small bass, bass the same size as the lure, bass longer than one metre, giant fish, lure bigger than the bass's head, no line at all, square crop, 1:1 aspect ratio
```

### Prompt vidéo — segment 07

**À joindre — rien d'autre :** `k7.png` en **première image**, `k8.png` en **dernière image**.

```text
MOTION — One continuous take, segment 7 — no cut, one unbroken camera move. Same macro profile framing as the previous segment, in cold dark blue-green water: the tiny 6.5 cm lure keeps its S-swim in the sharp centre-left, the clear leader running forward from its nose, taut. Then the ambush: a very large largemouth black bass powers out of the dark weed bed on the RIGHT — deep-bodied and thick across the shoulders, dark olive-green mottled back, bronze-green flank with a ragged dark band, pectoral fins fanned, one dark eye locked forward — accelerates across the frame toward the lure, opens its big jaw at the last moment and takes the lure, engulfing the rear section. The lure is one mouthful for it. The shot ends on that instant: jaw closed on the lure, the fish's mass filling the right of the frame, particles swirling in the wake of the strike. Keep the fish credible for the species — a very big largemouth is about 50 cm, its head roughly two to three times the length of the lure. No blood, no hook, no angler, no net. 24 fps, one unbroken move, no cut.

HOLD — Everything in this shot is already defined by the two attached keyframes: the light, the water, the mist, the boat, the three identical anglers and the lure. Do not redesign any of it, do not add anything that is not already in those two images. Change ONLY what the MOTION paragraph describes. Exactly three people, one boat, one 6.5 cm jointed lure always tied to its line, no branding anywhere, and one single continuous camera move with no cut.

FRAMES — First frame: the attached keyframe k7. Last frame: the attached keyframe k8. The motion must start exactly on the first and land exactly on the last, in one unbroken move.

DO NOT — a second boat, another boat appearing, four people, a fourth person, a face turned toward the camera, uncovered face, bare head, the lure changing size, the lure growing, the lure changing shape or colours, a different lure, the lure flying tail-first, the lure with no line attached, the leader detaching, warm golden light, sunrise, the mist disappearing, any logo or text appearing, cut, jump cut, scene change, cross dissolve, speed ramp, slow motion, camera jumping to a new angle, morphing, warping, flickering, blood, hooked fish, hook in the flesh, angler hands, net, fish jumping out of the water, morphing fish, extra fins, pike, northern pike, long duckbill snout, muskellunge, trout, carp, small bass, bass longer than one metre, giant fish
```

**Raccords.** Entrée : Continuité pure sur k7 — le massif d'algues à droite s'anime, la masse en sort. · Sortie : Le bass a le leurre en gueule, la page se dépingle sur cette image. · Frame d'arrêt : Image 38 — la prise en charge. Poster + image du mode animations réduites.

**Note de production.** Le changement d'intention est ici : la version précédente interdisait l'attaque (« strike, bite, mouth closing » étaient dans les exclusions). Ils en sont retirés — c'est désormais le sujet du plan. Restent exclus le sang, l'hameçon planté, les mains et l'épuisette : on montre la prise en charge, jamais la capture. Garder l'échelle sous contrôle sur les rushes : Veo a tendance à faire grossir le poisson, or au-delà d'environ 50 cm un black-bass n'existe plus.



---

## Les deux moments de texte

On lit environ trois mots par seconde : un texte posé sur un plan de 1,4 s clignote au lieu de
se lire. Chaque beat couvre donc deux segments, et rien d'autre n'apparaît pendant les dix
secondes. Entrée sur [0.10 – 0.25] du beat, sortie sur [0.78 – 0.92], sur voile (charte §6).

### Beat 1 — Segments 01 → 02 (58 images, 2,42 s)

Lock-up complet « ALURE. » + flèche.

Corps : « Un leurre articulé, deux sections. »

Lock-up complet — wordmark et flèche dessous, cadrés comme sur l'affiche A4 n°2 : haut de cadre,
centrés, blancs sur le ciel froid, largeur ≈ 40 % du cadre, zone de protection 0,5x. C'est la
seule apparition de la flèche dans tout le hero. `k1`, `k2` et `k3` gardent donc le tiers haut
en ciel homogène.

### Beat 2 — Segments 07 → 08 (78 images, 3,25 s)

Sur-titre : « La nage »

Display : « Deux sections, une nage en S »

78 images = 3,25 s. Six mots, lisibles sans effort. Le corps de texte est volontairement vide :
ajouter une phrase ici la rendrait illisible. `k8` et `k9` gardent la bande basse en pénombre
bleu-vert homogène. Formulation à valider par un test en eau réelle avant publication — c'est
une affirmation sur le produit.

---

## Fiche technique affichée après le hero

| Champ | Valeur |
|---|---|
| Longueur | **à mesurer** |
| Poids | **à mesurer** |
| Sections | 2, articulation métal |
| Hameçons | 2 triples — **taille à vérifier** |
| Flottabilité | **à vérifier** |
| Nage | en S |

Aucune de ces valeurs ne s'écrit tant qu'un exemplaire n'a pas été pesé et mesuré. Le « 6,5 cm »
des prompts est une **échelle de génération** (mesurée sur le produit, mais non certifiée) :
il donne au modèle la bonne proportion entre le leurre, la main gantée et le bass. Il ne s'affiche
nulle part sur le site tant que la mesure officielle n'est pas faite.

---

## Coloris

Hors hero : ces rendus alimentent le **sélecteur de coloris 3D**, pas un plan vidéo.
36 rendus par coloris (un tour complet, pas de 10°), AVIF 800×800, ≈ 290 Ko par coloris.

| Nom (proposé) | Statut | Description |
|---|---|---|
| Truite | principal | Ventre blanc nacré, dos jaune-olive, bande latérale magenta-rose, caudale translucide fourchue, nageoires dorsales olive. **Le coloris principal** — celui du hero (via compositing), et le coloris sélectionné par défaut. |
| Perche fluo | candidat | Chartreuse vif, barres et pointillés or-brun. Le coloris « eau teintée » — celui qui se voit de loin. |
| Arête | candidat | Noir mat, gueule dentée et squelette blancs. Le coloris de contre-jour et de ciel bas. En rendu, il demandera une rim light renforcée : un noir mat sur fond bleu nuit disparaît sans elle. |
| Feu | candidat | Dégradé orange à rouge, finition brillante. Le plus agressif — et le seul point chaud possible du site : à voir s'il devient le contrepoint de l'aube froide. |
| Nacre | candidat | Blanc perle intégral, phosphorescent. Attention : proche du témoin blanc des plates — vérifier qu'il ne lit pas « prototype » à l'écran. |
| Jaune type Pikachu | **exclu** | Contrefaçon — n'apparaît nulle part. |

---

## Questions ouvertes

**1. Les specs réelles du leurre.** *(Bloquant)*

La fiche de la section 2 attend longueur, poids, flottabilité et taille des hameçons. Le 6,5 cm
des prompts est une mesure de travail, pas une spec certifiée. La VISION interdit d'inventer une
spec produit — la section ne peut pas être écrite tant qu'un exemplaire n'a pas été pesé et
mesuré. Elle n'empêche ni le hero ni les rendus 3D d'avancer.

**2. L'affirmation du beat 2.** *(Bloquant)*

« Deux sections, une nage en S » décrit un comportement produit, et c'est le seul texte du hero
à porter un argument. Une vidéo générée n'en est pas une preuve. Soit vous validez après un test
en eau réelle, soit le beat 2 se réduit au nom du produit.

**3. Le look cagoule à valider sur essai.** *(À vérifier avant d'enchaîner)*

Trois silhouettes cagoulées peuvent glisser vers un imaginaire « braquage » si la pose ou la
lumière tourne à l'agressif. Le garde-fou est écrit dans les prompts (« calm, precise, technical
crew ») — juger sur les premières générations de `k2`/`k3`, ajuster le vocabulaire si besoin,
PUIS enchaîner. Le raccord ne pardonne pas un changement de tenue en cours de chaîne.

**4. Combien de coloris dans le sélecteur.** *(À trancher)*

Truite est arrêté. Les quatre autres sont candidats. Le sélecteur est spécifié pour N options,
donc rien ne bloque techniquement — mais chaque coloris retenu, c'est un jeu de 36 rendus à
produire et à texturer. Le choix est un coût de production, pas une décision de design.

**5. Ce qui vient après le sélecteur.** *(À trancher)*

Cette spec s'arrête au sélecteur de coloris. La suite de la landing — bandeau de délai,
réassurance, CTA « Voir le leurre » — reste à cadrer, et c'est elle qui détermine si le hero
doit finir sur une suspension (le bass) ou sur un appel plus direct.
