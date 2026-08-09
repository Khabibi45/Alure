---
name: web-render
description: >-
  Standard de rendu web premium pour un site public professionnel. À invoquer DÈS qu'on crée ou
  modifie une page, une section, un composant, une navigation, un formulaire ou une interaction —
  ou qu'on touche au look & feel, aux animations, aux images, au responsive, au mode sombre, ou
  qu'on écrit le moindre texte visible (titre, CTA, état vide, erreur, 404). Impose les tokens du
  design system (@theme), des animations sobres respectant prefers-reduced-motion, le pipeline
  d'images WebP, la charte de ton des textes, l'anti « template IA », et la definition of done visuelle.
---

# web-render — standard de rendu web premium

Un site pro se reconnaît à sa **cohérence** (tout vient des mêmes tokens), sa **retenue**
(animations qui servent la lecture), sa **vitesse perçue** et ses **textes justes**. Ce skill
s'applique à chaque pixel livré.

## 0. La fondation Pastel (couche 1) — lire AVANT tout rendu

**`docs/standards/FONDATION-PASTEL.md` est le standard visuel invariant du studio** : surfaces
tonales sans bordure, radius (1rem / 0.75rem / pill), une ombre diffuse, geste « surligneur »
(`<Marker>`, 3 emplacements autorisés), échelle des chiffres (`text-stat` plafonné, zéro mono
dans l'UI), grain 0.02, et TOUTE la doctrine motion (3 durées, 2 courbes, transition `<PageRelay>`,
interdits). Les composants `px-*` du starter (`Marker`, `Button`, `Card`, `Stat`,
`SegmentedControl`, `PageRelay`, `AnimatedSection`) s'utilisent tels quels — on ne les recode pas,
on ne les contourne pas. La DA du site (couleurs, typos, imagerie — `docs/product/PRODUCT.md`)
est la **couche 2** : elle remplit les tokens sémantiques, elle ne touche jamais à la fondation.
Sa checklist de conformité (§9) s'ajoute à la definition of done ci-dessous.

## 1. Le design system : tokens d'abord

- **Toute couleur, font, rayon vient de `globals.css` (`@theme`)** — jamais de hex en dur dans un
  composant, jamais de classe arbitraire `text-[#4a8ffe]` pour une couleur de marque.
- Couleurs **sémantiques** (`--color-primary`, `--color-surface`, `--color-danger`…), pas
  descriptives (`--color-blue-2`). Mode sombre (si retenu au cadrage) : variantes via
  `@media (prefers-color-scheme: dark)` ou classe — décidé une fois, pas par composant.
- Typographie : échelle fluide (`clamp()`) pour les titres ; corps ≥ 16px ; interlignage ≥ 1.5 ;
  longueur de ligne ≤ ~70ch. Chiffres importants : `tabular-nums`.
- Espacement : l'échelle Tailwind, appliquée avec régularité (rythme vertical constant entre sections).

## 2. Anti « template IA » — ce qui trahit un site généré

À relire avant de livrer une page. Interdits sauf demande explicite :
- **Emoji comme icône** d'UI (🚀 ✨ 💡 en puces ou titres) → `lucide-react`, taille et graisse cohérentes.
- **Dégradé violet/bleu générique** sur hero + boutons + tout — la palette vient de la DA du
  cadrage, pas du réflexe.
- **Trois cards identiques** icône-titre-paragraphe comme seule idée de mise en page, répétée à
  chaque section. Varier les structures : alternance texte/image, liste éditoriale, pleine largeur,
  citation — la hiérarchie suit le contenu.
- **Glassmorphism/blur partout**, ombres portées énormes, coins ultra-arrondis par défaut.
- **Faux éléments de preuve** : logos clients inventés, étoiles d'avis sans avis, compteurs animés
  sans source (règle n°6).
- **Textes de remplissage** (« Lorem », « Une solution innovante pour… ») : le contenu réel vient
  de la spec ; s'il manque, la section attend.

## 3. Animations : sobres, jamais bloquantes

La doctrine complète (durées, courbes, transition de page, interdits) est dans
**`FONDATION-PASTEL.md` §6** — les tokens de `src/lib/motion.ts` sont la seule source pour du
framer-motion custom. En plus :

- **Primitives par défaut** : `AnimatedSection` (reveals au scroll — 16px + fondu, une fois,
  pas de re-trigger en remontant) et `PageRelay` (transition de page directionnelle).
- **`prefers-reduced-motion` respecté sur CHAQUE animation** : `useReducedMotion()` (framer) ou
  media query CSS → l'alternative est un affichage direct, pas une animation « plus lente ».
- Animer **uniquement `transform` et `opacity`** (compositor) — jamais top/left/width/height en continu.
- Le contenu **au-dessus de la ligne de flottaison n'attend pas une animation** pour être lisible
  (LCP) ; pas de page blanche qui « se construit ».
- **gsap + lenis** réservés au scroll narratif décidé au cadrage. Pièges connus (pin qui mesure
  trop tôt, câblage ticker) : lire `docs/standards/WEB-REFERENCE.md` **avant** d'en écrire.
- Hover : états discrets (≤ 150ms) ; le hover n'est jamais le seul indicateur (mobile).

## 4. Images : le chantier qui coûte si on le fait après

1. **Convertir AVANT d'intégrer** : `scripts/optimize-images.sh` (WebP q80, redimensionné à
   l'affichage réel — une icône 64px n'a pas besoin d'un PNG 1000px).
2. `next/image` partout : `fill` + `sizes` corrects, ou width/height explicites (anti-CLS).
3. Image LCP (hero) : `priority` ; les autres : lazy par défaut.
4. Jamais de SVG contenant un raster base64 ; jamais d'image de fond CSS pour du contenu.
5. `alt` informatif — ou `alt=""` si purement décorative.

## 5. Les textes visibles : charte de ton

Chaque chaîne (titre, CTA, label, état vide, erreur, 404, bannière cookies) se relit contre
**`docs/standards/UI-COPY.md`** : les 5 tournures « IA générée » sont interdites (leçon appendue,
métaphore martelée, auto-défense préventive, slogan symétrique, tiret-béquille). Un bouton dit ce
qu'il fait. Le marketing assumé vit sur la landing, pas dans les micro-copies.

## 6. Responsive & accessibilité visuelle

- **Mobile d'abord** : conçu à 375px, enrichi ensuite. Pas de scroll horizontal, jamais.
- Cibles tactiles ≥ 44px ; menu mobile utilisable au clavier ET au doigt.
- Contrastes AA (4.5:1 texte courant, 3:1 grands titres) — vérifiés sur les couleurs RÉELLES des
  tokens, y compris texte sur image (ajouter un voile si besoin).
- Focus **visible** sur tout interactif (jamais `outline: none` sans remplacement).
- Zoom navigateur 200 % : rien ne casse, rien ne se chevauche.

## 7. Definition of done visuelle (avant de dire « fini »)

- [ ] Rendu vérifié à 375px ET desktop (viewport réel, pas « ça devrait aller »)
- [ ] Aucune couleur/font hors tokens ; mode sombre cohérent si retenu
- [ ] Animations OK + version `prefers-reduced-motion` vérifiée
- [ ] Images en WebP aux bonnes dimensions, `alt` posés, zéro CLS visible au chargement
- [ ] Parcours clavier complet (tab visible, menu, formulaire, liens d'évitement si nav longue)
- [ ] Textes relus contre la charte (zéro tournure interdite, zéro faux contenu)
- [ ] Console navigateur : zéro erreur/warning nouveau
