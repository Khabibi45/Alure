# WEB-REFERENCE — faits volatils & pièges vérifiés (à re-vérifier, pas à croire)

> **Standard (couche 1), mais VOLATIL.** Chaque entrée est datée : c'était vrai à cette date, sur
> cette version. Avant de s'appuyer dessus pour un choix structurant, re-vérifier contre la doc
> officielle (nextjs.org, tailwindcss.com). Quand un piège est réparé upstream ou qu'un nouveau
> apparaît : mettre à jour ICI et répercuter dans le repo `web-dev-kit`.

## Versions de référence du kit (07/2026)

| Brique | Version éprouvée | Note |
|---|---|---|
| Next.js | 16.x (App Router) | Node ≥ 20.9 requis |
| React | 19.x | React Compiler : voir piège `useWatch` |
| Tailwind CSS | v4 | tokens via `@theme` dans le CSS — voir piège config |
| zod | 4.x | schéma partagé client/serveur |
| vitest | 4.x | + jsdom + Testing Library |
| framer-motion | 12.x | `useReducedMotion()` dispo |
| gsap / lenis | 3.x / 1.x | seulement si scroll narratif |

À la création d'un site : `npm outdated` puis vérifier les breaking changes des majeures avant de monter.

## Pièges payés & vérifiés (les re-payer est interdit)

### Tailwind v4 — `tailwind.config.ts` N'EST PAS chargé (vérifié 07/2026)
Sans directive `@config` dans le CSS, un `tailwind.config.ts` est de la **config morte** (piège
classique post-migration : il traînait, mort, sur le site précédent). Règle du kit : **pas de
fichier config du tout** — tokens dans `globals.css` via `@theme`, plugins via `@plugin`.

### CSP × Next.js statique — `'unsafe-inline'` sur `script-src` est obligatoire (vérifié 07/2026)
Les scripts d'hydratation inline de Next l'exigent en rendu statique. Le retirer = nonce = tout le
site passe en rendu **dynamique** (perf perdue). En revanche **`'unsafe-eval'` se retire sans
douleur**. Corollaire : chaque service tiers ajouté (analytics, Calendly, embed…) va dans
`connect-src`/`script-src`/`frame-src` **dans le même commit**, sinon casse silencieuse en prod
(en dev la CSP ne bloque pas pareil).

### `next lint` cassé sous Next 16 (vérifié 07/2026)
`next lint` interprète « lint » comme un dossier (« Invalid project directory …/lint »).
→ script `"lint": "eslint ."` et gate = `npx eslint .` + `npx tsc --noEmit`.

### WSL × Windows — un seul `node_modules` ne peut pas servir les deux (bug payé, 08/2026)
Un projet posé sur `/mnt/d` (donc `D:\` vu de Windows) est atteignable depuis les deux systèmes,
**mais `node_modules` ne l'est pas** : Next, Tailwind, lightningcss, rolldown et sharp embarquent
des binaires `.node` compilés par plateforme, livrés en dépendances optionnelles.

`npm install` n'installe **que** les binaires de la plateforme courante et **supprime les autres**.
Conséquence en boucle :

- installé depuis Windows → `vitest` meurt sous WSL sur `Cannot find native binding` (rolldown) ;
- installé depuis WSL → `next dev`/`next build` meurt sous Windows sur
  `Cannot find module '../lightningcss.win32-x64-msvc.node'`, à la compilation de `globals.css`.

Le second casse le site, pas seulement l'outillage : il tombe sur la CSS, donc sur toutes les pages.

→ **Règle : on choisit UN système et on n'en bouge plus.** Toutes les commandes `npm` (`install`,
`dev`, `build`, `test`) partent du même. Réparation quand c'est arrivé : relancer `npm install`
depuis le système qu'on veut servir, puis purger `.next` (les chunks compilés gardent les chemins
de l'autre plateforme). `--no-save` ne protège pas — il préserve `package.json` et
`package-lock.json`, pas les binaires natifs déjà installés.

Symptôme trompeur associé : un `package-lock.json` traînant dans un dossier PARENT hors dépôt fait
déduire à Turbopack une racine hors projet, et `next dev` démarre puis meurt sur
`IO error … lockfile`. → fixer `turbopack: { root: process.cwd() }` dans `next.config.ts`.

### GSAP ScrollTrigger + `pin` — mesure du layout trop tôt (bug payé, non corrigé sur le site source)
Une section pinnée peut passer en `position:fixed; width:0` au chargement (le contenu disparaît,
un resize répare). **Parade** : créer les triggers dans un `requestAnimationFrame` après montage,
ou appeler `ScrollTrigger.refresh()` une fois le layout stable (fonts/images chargées).
Ne jamais copier un composant pinné d'un autre site sans cette correction.

### Lenis + GSAP — le câblage qui ne saute pas
`<ReactLenis root options={{ lerp: 0.1, smoothWheel: true }} autoRaf={false}>` + boucle unique :
`gsap.ticker.add((t) => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)`.
(C'est le `SmoothScrollProvider` du starter — déjà câblé.)

### React Compiler — `useWatch`, pas `form.watch()` (react-hook-form)
`form.watch()` n'est pas un abonnement réactif compatible compilateur : valeurs figées.
→ `const values = useWatch({ control })` dans les hooks de formulaire.

### Images — les chiffres qui justifient la règle n°7
Audit du site précédent : Lighthouse mobile **61 → 85**, LCP **15,9s → 4,0s**, uniquement en
traitant les images (WebP, dimensions réelles, next/image, SVG-base64 banni, frames différées).
Conversion : `cwebp -q 80 -resize 1280 0 in.jpg -o out.webp` (paquet Homebrew `webp`) — ou
`scripts/optimize-images.sh` pour un dossier entier. **Avant** intégration, jamais après.

### 3D — une convention d'export n'est pas une loi (bug payé deux fois, 09/2026)
Un modèle importé arrive avec l'orientation qu'a choisie l'outil qui l'a produit. Deux fois en
quinze jours, le moteur a pris cette convention pour un invariant : d'abord « l'axe long est X »
(les nouveaux modèles sortaient sur Z → objet agrandi 5,9 fois et plié en travers), puis « la tête
est du côté `axisMin`** (elle était en `axisMax` → l'animation s'appliquait au museau).

→ **Règle : toute orientation dont dépend une animation se MESURE au chargement.** L'axe long est
le plus grand côté de la bounding box ; le sens se déduit d'un repère de forme (pour un poisson, la
section la plus fine du corps est le pédoncule, donc le côté de la queue). Deux pièges de méthode :
le critère « le bout le plus épais » se trompe dès qu'un appendice est plus large que le corps, et
un minimum de section cherché sans écarter les extrémités tombe toujours sur une pointe.

Symptôme à reconnaître : l'animation « ne ressemble à rien » et chaque nouveau réglage échoue —
c'est le signe qu'on règle le bon paramètre au mauvais endroit.

### meshoptimizer — `compactMesh` modifie son entrée SUR PLACE (bug payé, 09/2026)
Deux pièges, dans la même ligne de code, tous deux silencieux :
1. `compactMesh(indices)` retourne un **couple** `[remap, nombre de sommets gardés]`. Le prendre
   pour le remap seul donne des attributs vides et un modèle **invisible**, sans erreur.
2. Il **remappe `indices` sur place** (son helper `reorder` finit par
   `indices[i] = remap[indices[i]]`). Le tableau qui en ressort est déjà final. Réappliquer `remap`
   par-dessus calcule `remap[remap[i]]` : des triangles reliant des sommets sans rapport, qui
   apparaissent à l'écran comme des **fils tendus d'un bout à l'autre du modèle**.

Aucun des deux ne lève d'erreur — le GLB reste valide, il est juste faux. **Ne jamais juger une
décimation à l'œil** : mesurer la plus longue arête (3D et UV) avant/après et exiger zéro arête
au-delà d'une fraction de l'objet. Corollaire : `simplify` ne regarde que les positions et fond les
coutures UV ; utiliser `simplifyWithAttributes` en lui passant UV et normales.

### Docker — `output: 'standalone'` obligatoire
Sans lui, l'image prod doit réinstaller TypeScript juste pour lire `next.config.ts` (hack payé
sur le site précédent). Avec lui : `node server.js`, image minimale. Déjà posé dans le
`next.config.ts` du starter ; le Dockerfile du starter en dépend.

### API routes — le trio d'échec bruyant
1. **Toujours** try/catch retournant du JSON (sinon Next renvoie du HTML → `res.json()` client crash).
2. Côté client, **toujours** vérifier `res.ok` avant `res.json()`.
3. Rendu statique : une page qui fetch au build peut figer des données — pour du contenu
   vivant, ISR (`revalidate`) ou fetch client assumé avec états.

### Tester sur téléphone réel
`npm run dev -- -H 0.0.0.0` puis `http://<IP-locale>:3000` depuis le téléphone (même réseau).
⚠️ Certaines box (Livebox) isolent WiFi ↔ Ethernet : mettre le Mac en WiFi.

### Hydration mismatch — les causes récurrentes
`Date.now()`/`Math.random()`/`toLocaleDateString()` rendus côté serveur, ou du HTML invalide
(`<div>` dans `<p>`). Parade : valeurs stables au rendu, formatage de dates déterministe
(locale + timezone explicites), ou `suppressHydrationWarning` ciblé si légitime (horloge).

## Recettes rapides

- **OG à valider avant mise en ligne** : debuggers Facebook (developers.facebook.com/tools/debug)
  et LinkedIn (linkedin.com/post-inspector).
- **Bannière cookies** : si un jour nécessaire, `pastel-ia-frontend` a un `CookieBanner` +
  `src/lib/cookieConsent.ts` fonctionnels à adapter (consentement par catégorie, 6 mois).
  Par défaut le kit n'en a pas besoin (zéro tracker).
- **Search Console** : vérification DNS ou balise ; soumettre `sitemap.xml` dès la mise en ligne.
- **Contenu FR en JSX** : `react/no-unescaped-entities` est off dans l'eslint du starter
  (apostrophes françaises libres) — ne pas le réactiver.
