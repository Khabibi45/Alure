# Spec — Hero vidéo « Le lancer » + sélecteur de coloris 3D

> Rédigé le 2026-08-05. Sources : `docs/product/VISION.md`, `docs/product/PRODUCT.md`,
> `docs/product/CHARTE-GRAPHIQUE-V02.md`, `assets/photos leurre pour 3d/reference-fournisseur/`,
> `assets/moodboard marque/affiches a4/` (affiche 2 = point de départ visuel),
> `public/logo/alure-fleche-1.svg`.

Statut : `brouillon` → validée → en cours → livrée
Version : **0.4** — les prompts d'image d'entrée et de sortie de chaque plan, la description réelle
du leurre, et la route de fabrication des plans 05 à 08.
*(0.3 — recadré en hero de 10 s ; les bascules de coloris sortent de la vidéo.)*

## Les fichiers

| Fichier | Ce qu'il contient |
|---|---|
| `storyboard-scroll.html` | **La page interactive** : les 7 segments, leurs prompts copiables (image d'entrée, image de sortie, vidéo), la règle de montage, les deux beats de texte, la démo du sélecteur de coloris. C'est le livrable à ouvrir. |
| `prompts-plans.md` | **La source canonique des prompts.** Généré depuis les mêmes données que le HTML. Toute correction part d'ici. |
| `spec-technique.md` | L'intégration côté site : scrub, encodage, sélecteur 3D, `prefers-reduced-motion`, tests d'acceptation. |
| `generation-fal.md` | **La fabrication des rushes** : `npm run video` (fal.ai · Seedance 2.0), qui lit les prompts ci-dessus, applique le témoin gris et refuse de générer si la spec a dérivé. |
| `Dockerfile`, `nginx.conf`, `docker-compose.yml` | Servent la page en local sur `http://localhost:8080`. |

## 1. Exigences

**Problème / valeur.** Le trafic vient froid d'Instagram et de TikTok, sur mobile, sans notoriété
de marque. La landing doit convaincre seule. Un hero piloté au scroll montre la nage —
l'argument de vente réel — sans demander de cliquer sur « lire ». Il alimente la conversion
cible : l'achat du leurre.

**Ce que la v0.3 corrige.** La v0.2 spécifiait un film de 78 s scrubé sur ~22 écrans de
défilement. C'est un film de marque, pas un hero : personne ne consacre ça à une intro avant
d'arriver aux specs. Même histoire, coupée à l'os.

**Critères d'acceptation** (observables) :

- [ ] Le hero fait **240 images / 10,0 s** à 24 i/s, sur une piste de **240 vh** (1 vh = 1 image).
- [ ] Les 7 segments se raccordent : chaque jonction est un fichier de keyframe partagé, donc
      aucune rupture de lumière possible entre deux segments consécutifs.
- [ ] Le leurre à l'écran est **notre** leurre — rendu 3D incrusté — dans les plans 05 à 08, où il
      est lisible. Aucun leurre inventé par un modèle génératif n'apparaît.
- [ ] Il porte le coloris **Truite** pendant les dix secondes.
- [ ] **Deux moments de texte, pas huit.** Chacun couvre deux plans.
- [ ] Le fichier vidéo pèse **≤ 1 Mo** en définition mobile.
- [ ] Aucune image fournisseur brute n'est publiée. Aucun visage n'est reconnaissable.
- [ ] Le coloris jaune type Pikachu n'apparaît nulle part.
- [ ] En `prefers-reduced-motion`, la page reste complète : image fixe, textes empilés, sélecteur
      de coloris utilisable.
- [ ] Aucune spec produit n'est affichée tant qu'elle n'est pas mesurée.

**Hors-scope.** Le son (le film est muet par décision) · l'export réseaux sociaux (les rushes le
permettent gratuitement, mais ce n'est pas cette spec) · la suite de la landing après le
sélecteur de coloris — bandeau de délai, réassurance, CTA · la page produit `/leurre`.

## 2. La structure

| Section | Nature | Piste |
|---|---|---|
| **1 — Le hero** | Vidéo scrubée au scroll, 7 segments | 240 vh épinglés |
| **2 — La fiche** | Statique, DOM, aplat `--color-background` | flux normal |
| **3 — Les coloris** | Sélecteur 3D interactif, rendus pré-produits | flux normal |

## 3. Les décisions

1. **10 s, 7 segments, 240 images.** Un hero se traverse, il ne se regarde pas.
2. **Les bascules de coloris sortent de la vidéo.** Elles deviennent un composant de page,
   alimenté par des rendus 3D produits à part. La personne choisit son coloris au lieu de le
   subir dans un montage — et onze plans disparaissent de la production.
3. **Truite est le coloris principal.** Porté pendant tout le hero, sélectionné par défaut dans
   le sélecteur. Les autres restent des candidats : chacun retenu = 36 rendus à produire.
4. **Deux moments de texte.** On lit ~3 mots/seconde ; un texte sur un plan de 1,4 s clignote au
   lieu de se lire. Beat 1 = lock-up sur P01–P02, beat 2 = « Deux sections, une nage en S » sur
   P06–P07.
5. **Le film finit sur la prise en charge, jamais sur la capture.** Le hero se dépingle à
   l'instant où le bass sort du massif d'algues et referme sa gueule sur le leurre — c'est la
   preuve que le leurre fait son travail. Ce qu'on ne montre jamais : le sang, l'hameçon planté,
   les mains, l'épuisette, le poisson sorti de l'eau. (Décision du 2026-08-06 : la version
   précédente coupait sur la traque, gueule fermée. Montrer la prise vend mieux et ne coûte rien
   à l'élégance.)
6. **Le film est muet, partout.** `-an` à l'encodage.
7. **Aucun élément de marque hors du plan 01.** Le lock-up s'affiche à l'ouverture, cadré comme
   sur l'affiche A4 n°2, et nulle part ailleurs.
8. **Un modèle par étape** : Nano Banana pour les images d'entrée/sortie de chaque plan (c'est là
   que se gagnent les raccords), Kling 2.5 pour l'eau et la nage, Veo 3 pour les plans portés par
   le mouvement de caméra (01, 05), Blender pour le leurre incrusté et les rendus de coloris.
   **Seize emplacements d'image, quatorze fichiers** : `p04-in` = `p03-out` et `p06-in` = `p05-out`,
   le même fichier — ces deux coupes sont des continuités pures.
9. **On génère 5 s par plan, on en garde 1.** Aucun modèle ne produit un clip d'une seconde.
   Le dérushage laisse le choix du point de coupe — et les rushes complets donnent un film
   d'environ 40 s pour les réseaux, sans une génération de plus.
10. **La chaleur vient de l'image, jamais de l'habillage** (charte §1). Aucun texte incrusté au
    rendu : les textes sont du DOM, sur voile, dans les zones sûres de la charte §6.
11. **Les plans 05 à 08 se génèrent avec un témoin gris**, remplacé au compositing par le rendu
    Blender. C'est ce qui rend le critère « aucun leurre inventé n'apparaît » vérifiable au lieu
    d'être une intention : un volume gris mat ne peut pas inventer un coloris ni un hameçon.
12. **Les images sont composées pour les textes** : tiers haut libre sur les plans 01–02 (le
    lock-up), bande basse homogène sur les plans 07–08 (le beat 2), zone sûre 9:16 centrée
    partout. Ça se demande au prompt, ça ne se rattrape pas au recadrage.
13. **À bord, des pêcheurs pros — hommes et femmes — et jamais un visage.** Tenue de pêche du
    bass en eau douce (jersey manches longues, casquette ou bob, polarisantes) ; **pas de
    panoplie de mer** — ni waders, ni ciré, ni gilet de mouche. Chaque personnage est une
    silhouette en contre-jour ou vu strictement de dos. C'est le critère « aucun visage n'est
    reconnaissable » rendu opérationnel, et ça évite un droit à l'image sur un film de marque.
14. **Aucune marque, nulle part, sur rien** : coque, hors-bord, écrans, vêtements, casquettes,
    lunettes, canne, moulinet, canette. Consigne en capitales dans le bloc d'ancrage et reprise
    dans les 14 negative prompts. C'est le défaut qu'un modèle réintroduit à chaque génération —
    il se vérifie à l'œil sur chaque image, pas une fois pour toutes.

## 4. Ce qui bloque

| # | Sujet | Effet si non tranché |
|---|---|---|
| 1 | **Specs réelles du leurre** (longueur, poids, flottabilité, hameçons) | La section 2 ne peut pas être écrite. La VISION interdit d'inventer une spec. N'empêche ni le hero ni les rendus 3D d'avancer. |
| 2 | **L'affirmation du beat 2** | « Une nage en S » décrit un comportement produit, et c'est le seul argument écrit du hero. Sans test en eau réelle, le beat se réduit au nom du produit. |

Quatre points à trancher sans bloquer : les canettes du plan 02 (très désamorcé par le passage à
un flash d'une seconde, mais à confirmer avant génération), le témoin gris des plans 05 à 08 (à
valider sur une génération d'essai du plan 07 avant de lancer les quatre), le nombre de coloris
dans le sélecteur, et ce qui vient après le sélecteur.

## 5. Tâches

- [ ] Trancher les deux points bloquants.
- [ ] Modéliser le leurre depuis `assets/photos leurre pour 3d/photo finales leurre truite/`
      (6 vues), texturer **Truite** en priorité.
- [ ] Fabriquer les **14 images** d'entrée/sortie (Nano Banana), dans l'ordre, en donnant à chaque
      fois l'image de sortie du plan *n* en pièce jointe pour générer l'entrée du plan *n+1*.
      Prompts dans `prompts-plans.md`.
- [ ] Animer en image-to-video (Kling pour l'eau et la nage, Veo pour l'aérien et les nuages) —
      5 s générées par plan, 3 à 5 essais, rushes conservés.
- [ ] Incruster le leurre 3D dans les plans 05 à 08.
- [ ] Monter les 240 images, encoder (voir `spec-technique.md`).
- [ ] Produire les 36 rendus de turntable pour Truite, puis pour chaque coloris retenu.
- [ ] Intégrer le scrub GSAP + Lenis, le sélecteur de coloris et le mode `prefers-reduced-motion`.

## 6. Vérification

- Tests d'acceptation détaillés dans `spec-technique.md` §5.
- Gate : `web-quality-gate` (tsc / lint / test / build + navigateur réel 375 px et desktop).
- Audits concernés : performance (budget vidéo + séquences de turntable), a11y (reduced-motion,
  radiogroup du sélecteur, contrôles natifs), SEO (les textes sont du DOM, pas des pixels).
