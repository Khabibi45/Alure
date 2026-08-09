# Audit performance — checklist de référence

Le budget : **Lighthouse mobile ≥ 90**, LCP < 2,5s, CLS < 0,1, INP < 200ms. Le site précédent a
payé un audit entier pour remonter de 61 à 85 — tout ici vise à ne jamais redescendre.

## 1. Images (le poste n°1, toujours)

- [ ] **Inventaire** : `find public src/app -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) -size +100k`
      — toute image raster > 100 KB doit se justifier ; > 300 KB = **à corriger** d'office.
- [ ] Format : WebP/AVIF pour le contenu photo ; PNG uniquement si transparence nécessaire et petit.
- [ ] **Dimensions vs affichage** : une image affichée en 400px ne doit pas faire 2000px
      (vérifier les hero/cards). Icône affichée ≤ 64px = SVG ou WebP minuscule.
- [ ] SVG : aucun raster base64 embarqué (`grep -rln "data:image/png\|data:image/jpeg" public src | head`)
      — le « SVG » d'1,2 MB du site précédent était ça.
- [ ] `next/image` partout (pas de `<img>` nu) ; `fill` accompagné d'un `sizes` réaliste ;
      `priority` sur l'image LCP uniquement ; `unoptimized` seulement si hôte dynamique inconnu.
- [ ] Séquences d'images animées au scroll : frame 1 chargée immédiatement, les suivantes en
      `requestIdleCallback` — jamais toutes dans le chemin critique.

## 2. Fonts

- [ ] `next/font` exclusivement (self-hosted, subset auto) — aucun `<link>` vers Google Fonts,
      aucun `@import` de font dans le CSS.
- [ ] ≤ 2 familles, graisses limitées à celles utilisées.

## 3. JavaScript & hydratation

- [ ] `'use client'` uniquement là où il y a de l'interactivité — une page entière cliente pour
      une seule section animée = **à corriger** (descendre la frontière client dans l'arbre).
- [ ] Gros composants sous la ligne de flottaison : `next/dynamic` (galerie lourde, embed, carte).
- [ ] Pas de lib entière pour un détail (`grep -rn "from 'lodash'\|from 'moment'" src/`).
- [ ] gsap/lenis absents du bundle si le site n'en a pas l'usage réel.
- [ ] Pas de `useEffect` de fetch là où un Server Component suffit.

## 4. Rendu & CLS

- [ ] Toute image/embed a ses dimensions réservées (width/height ou `fill` dans un conteneur
      dimensionné) — zéro saut de layout au chargement.
- [ ] Les animations d'entrée ne déplacent pas le contenu déjà lisible (transform/opacity only).
- [ ] Rien au-dessus de la ligne de flottaison n'attend un JS client pour s'afficher (le texte
      LCP est dans le HTML initial).

## 5. Réseau & cache

- [ ] Pages statiques par défaut (pas de `dynamic = 'force-dynamic'` sans raison écrite).
- [ ] Pas d'appel API au chargement pour du contenu connu au build.
- [ ] Assets versionnés servis avec cache long (Next le fait tout seul) ; pas de cache-buster maison.

## 6. Mesure (runtime, avant mise en ligne)

- [ ] `npm run build` : relever la taille First Load JS par page — une page > 200 KB se justifie.
- [ ] `npm run build && npm run start` + Lighthouse **mobile** sur accueil + 2 pages clés :
      Performance ≥ 90. Noter les chiffres dans le rapport (et dans `docs/PROGRESS.md`).
