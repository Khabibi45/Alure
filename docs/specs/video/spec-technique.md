# Intégration — le scroll pilote l'image

> Complément technique de `README.md`. Cible : le hero de `/` (landing) et les deux sections
> qui le suivent. Contraintes de référence : `docs/product/CHARTE-GRAPHIQUE-V02.md` §9
> (grammaire des scènes), `docs/standards/WEB-REFERENCE.md` (pièges gsap + lenis).

## 1. Le hero

Une seule balise `<video>`, muette, `playsinline`, `preload="auto"`, **jamais lue en autonomie**.
Le scroll écrit `currentTime` et rien d'autre. La charte l'impose déjà : « vidéo pilotée par le
scroll (scrub — **pas de boucle autonome**) ».

Chaîne : Lenis lisse le scroll → GSAP ScrollTrigger convertit la progression de la piste en
timecode cible → une interpolation amortie (lerp ≈ 0,12) écrit `video.currentTime` à chaque frame
d'animation. L'amortissement est ce qui empêche le scrub de hacher : sans lui, chaque événement
de scroll déclenche un seek brut.

| | Valeur |
|---|---|
| Images | 240 (10,0 s à 24 i/s) |
| Piste de scroll | **240 vh** — soit **1 vh = 1 image** |
| Fichier | **un seul** (à 240 images, rien à découper ni à orchestrer) |

À cette taille, la découpe en segments et le préchargement progressif de la version longue n'ont
plus lieu d'être : le fichier entier arrive avant que la piste ne soit entamée.

Rappel de charte : une scène épinglée fait 150–220 vh. 240 vh est juste au-dessus, et c'est
assumé — c'est la seule scène épinglée de la page, et la ramener à 220 vh désynchroniserait le
rapport 1 vh = 1 image qui rend le réglage lisible.

## 2. Encodage

| Point | Valeur | Pourquoi |
|---|---|---|
| Codecs | **H.264 High** (principal) + **AV1** (alternatif) | H.264 : seek fiable partout. AV1 : poids. **HEVC seul est à proscrire** — seek erratique sur une partie du parc Android. |
| Intervalle d'images-clés | **6 images** (`-g 6`) | Un seek n'atterrit que sur une image-clé. À 6, le pire écart est 0,25 s — invisible. Au défaut (48), le scrub colle visiblement. |
| Profil de débit | CRF 20 (H.264), CRF 30 (AV1) | Le keyframe dense gonfle le fichier : compenser par le CRF, pas par la définition. |
| Définitions | 1920×1080 · 1280×720 · 960×540 | Servies par `media`. Le mobile ne télécharge jamais le 1080p. |
| Budget de poids | **≤ 1 Mo** en définition mobile | Un hero doit être là avant que le doigt ne bouge. |
| `faststart` | oui | `-movflags +faststart` : l'index passe en tête du fichier, sinon aucun seek avant téléchargement complet. |
| Cadrage | 16:9 avec **zone sûre 9:16 centrée** | Le recadrage mobile ne coupe jamais le leurre ni la bande de texte. À vérifier plan par plan au montage. |
| Poster | frame d'arrêt du plan 07 | AVIF + WebP, largeurs 750 / 1080 / 1920. C'est aussi l'image du mode reduced-motion. |

```
ffmpeg -i hero.mov -c:v libx264 -profile:v high -crf 20 \
  -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart -an hero.mp4
```

`-an` n'est pas un oubli : le film est muet, décision du 2026-08-05, et elle vaut aussi pour un
éventuel export réseaux.

## 3. Les deux beats de texte

Les textes sont du **DOM posé sur la vidéo**, jamais des pixels incrustés — ils sont donc
indexables, lisibles par un lecteur d'écran, et réutilisés tels quels en reduced-motion sans
double rédaction.

| Beat | Couvre | Images | Durée | Contenu |
|---|---|---|---|---|
| 1 | P01 → P02 | 58 | 2,42 s | Lock-up « ALURE. » + flèche, puis « Un leurre articulé, deux sections. » |
| 2 | P07 → P08 | 78 | 3,25 s | « Deux sections, une nage en S » |

Entrée sur la progression [0.10 – 0.25] **du beat**, sortie sur [0.78 – 0.92] (charte §9). Un
beat ne se cale pas sur un plan : à 1,4 s par plan, il n'aurait pas le temps d'être lu.
Cascade : 2 groupes maximum, 150 ms d'écart.

Placement : zones sûres §6 — mobile, bande basse voilée, marges 1,25 rem, 5,5 rem libres en bas ;
desktop, tiers inférieur. Voile obligatoire (`--gradient-scrim`), jamais de texte sur photo nue.

## 4. Le sélecteur de coloris 3D

Il remplace les quatre bascules de coloris de la v0.2. Ce ne sont plus des plans vidéo mais des
rendus produits à part, et c'est la personne qui pilote.

| Point | Valeur | Pourquoi |
|---|---|---|
| Rendus par coloris | **36 images** | Un tour complet par pas de 10°. Assez pour une rotation fluide, assez peu pour tenir en poids. |
| Format | AVIF 800×800 + fallback WebP | Fond uni de la gamme (#071128 → #20293e), jamais de fond blanc e-commerce, jamais d'ombre dure (charte §7). |
| Poids par coloris | ≈ 290 Ko | 36 × ~8 Ko. **Seule la séquence du coloris sélectionné se charge** ; les autres attendent le clic. |
| Rotation | **au geste, pas au scroll** | Le scroll sert à descendre la page. Le lui reprendre à cet endroit vole le contrôle : ici c'est le doigt ou la souris qui tourne le leurre. |
| Changement de coloris | fondu 0,28 s ease-out-soft | Charte §8.5. |
| Pastilles | photo du coloris, 32 px dans une cible tactile 44 px | Jamais un aplat de couleur inventé — le coloris d'un leurre est un motif, pas une teinte. |
| Sémantique | `role="radiogroup"` légendé « Coloris : {Nom} » | Navigation aux flèches, anneau de focus §3, sélectionné = anneau blanc 2 px offset 2 px. |
| Animations réduites | une image fixe par coloris | Pas de rotation, pas de séquence. Le sélecteur reste utilisable, le contenu reste complet. |

## 5. Mode animations réduites

En `prefers-reduced-motion`, **GSAP et Lenis ne sont pas initialisés** — pas « mis en pause ».
La page reste **complète, lisible, achetable** : même contenu, même ordre, mêmes CTA.

- Le hero devient une image fixe : la frame d'arrêt du plan 07 (le bass qui prend le leurre),
  avec le beat 2 posé dessus et le beat 1 au-dessus.
- Le lecteur vidéo reste disponible avec ses contrôles natifs : lire les dix secondes est un
  choix de la personne, jamais une boucle imposée.
- Le sélecteur de coloris perd sa rotation, garde ses pastilles et son changement d'image.
- Aucune opacité initiale à 0, aucune translation en attente de déclencheur.

## 6. Tests d'acceptation

1. **Scrub.** Sur les 240 vh, à vitesse lente comme rapide, aucune image ne « colle » plus de
   0,3 s et aucun retour arrière visuel ne se produit.
2. **Poids.** Fichier hero en définition mobile ≤ 1 Mo, vérifié sur le build.
3. **Lisibilité des beats.** Chronométrer : beat 1 ≥ 2,4 s à l'écran, beat 2 ≥ 3,2 s. En dessous,
   le texte n'est pas lu — c'est le critère, pas une préférence.
4. **Reduced-motion.** Page parcourue avec le réglage système actif : image fixe présente, les
   deux beats présents, sélecteur de coloris utilisable, aucun bloc vide.
5. **Cadrage mobile.** À 375 px, sur chacun des 7 segments, le leurre et la bande de texte sont
   entièrement dans le cadre.
6. **Voile.** Chaque texte est posé sur voile, jamais sur photo nue — vérifié plan par plan.
7. **Territoires de la charte.** La flèche n'apparaît **que** dans le lock-up du beat 1 — nulle
   part ailleurs, y compris en filigrane. Le surligneur n'apparaît nulle part sur la landing.
   Vérification : parcourir les 8 frames d'arrêt, le total attendu est 1.
8. **Véracité.** Aucun chiffre affiché qui ne soit mesuré. Aucun avis, aucun compteur, aucune
   rareté.
9. **Clavier.** La piste épinglée se parcourt au clavier (Page suiv. / Espace) — un pin GSAP mal
   configuré piège le focus. Le sélecteur de coloris se pilote aux flèches.
10. **Sélecteur.** Au chargement, une seule séquence de turntable est téléchargée. Vérifier dans
    l'onglet réseau qu'un coloris non sélectionné ne coûte rien.
11. **Les 14 images, avant toute génération vidéo.** Posées côte à côte dans l'ordre : le soleil
    reste du même côté, l'eau garde la même teinte, le leurre est le même objet d'un plan à
    l'autre. Une image qui ne raccorde pas se regénère — c'est le seul moment du projet où
    corriger ne coûte presque rien.
