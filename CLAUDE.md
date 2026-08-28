# Alure — Instructions agent (site web Next.js)

> Ce fichier ne contient que des **règles permanentes** — jamais de changelog (ça, c'est
> `docs/PROGRESS.md`).

Site web **public** (boutique e-commerce mono-produit : le leurre de pêche articulé Alure)
construit avec **Next.js (App Router)**, destiné à être **mis en ligne, indexé et visité par de
vrais utilisateurs**. La barre de qualité, de sécurité et de performance est celle d'un site
public professionnel, pas d'un side-project.

## Règles permanentes spécifiques Alure (e-commerce dropshipping)

1. **Délais honnêtes, partout.** Livraison **3 à 5 jours ouvrés** affichée AVANT l'achat (page
   produit, FAQ, récapitulatif checkout) et ré-affichée dans l'email de confirmation. Jamais
   atténuée, jamais cachée dans une page annexe — les litiges font geler Stripe/PayPal.
   **Depuis le 2026-08-28, le site ne fait plus de dropshipping** : les leurres sont stockés en
   France et expédiés par nos soins, en enveloppe matelassée noire. Le délai n'est donc plus subi,
   il est tenu — et cinq jours annoncés puis manqués se remarquent bien plus vite que vingt. La
   SOURCE du chiffre est `PRODUCT.deliveryDelay` et sa traduction `PRODUCT.DELAY_VALUE` ; aucune
   page, aucun email ne réécrit un délai à la main.
   **Livraison France uniquement**, dite AVANT l'achat et **y compris sur la version anglaise**,
   où le visiteur n'a aucune raison de le supposer (clés `SHIPPING_NOTICE`, `docs/i18n/README.md`
   §0). Le checkout n'accepte que `FR` (`src/lib/shop/stripe.ts`) : vendre sans le dire envoie le
   client au refus d'adresse **après** avoir payé.
2. **Toute la logique commande vit dans `src/lib/shop/`** (produit, coloris, prix, sessions
   checkout, webhooks). Rien de commerce dans les composants — c'est la condition d'une
   migration Shopify future sans réécriture.
3. **Aucune image du fournisseur publiée.** Les fichiers `assets/photos leurre pour 3d/` sont des
   références internes pour générer NOS visuels (3D/IA). Le coloris jaune imitant Pikachu est
   exclu de tout visuel (contrefaçon).
4. **Pas de BDD ni de comptes en v1.** La source de vérité des commandes = Stripe/PayPal.
   Ne pas introduire de persistance « au cas où ».
5. **Micro-entreprise FR** : TVA non applicable (art. 293 B du CGI) sur les prix et CGV ;
   rétractation 14 jours ; le vendeur est identifié dans les mentions légales.
6. **Deux langues, et l'anglais dans le même commit.** Le site n'existe qu'en **français** (la
   référence, servie à la racine) et en **anglais** (`/en`). En ajouter ou en retirer une est une
   décision du propriétaire, pas une opération de contenu : ça touche `LOCALES`, le sitemap, les
   `hreflang`, le sélecteur de langue et les redirections.
   **Tout texte visible s'écrit dans `docs/i18n/fr.md`, se répercute AUSSITÔT dans
   `docs/i18n/en.md`, puis `npm run i18n` régénère `src/lib/i18n/dictionaries.gen.ts`** (jamais
   édité à la main) : **les trois fichiers partent dans le même commit**. Un commit qui touche au
   texte sans toucher à l'anglais est *incomplet*, pas « à finir plus tard ».
   **Aucune chaîne visible en dur** dans un composant atteignable depuis `src/app/[lang]/` : les
   chaînes se préparent côté serveur (`src/lib/i18n/chrome.ts`) et arrivent en props — importer
   `getDictionary`/`t` depuis un fichier `'use client'` embarquerait les dictionnaires entiers
   dans le bundle. Restent en français par décision : les **noms propres du produit** (nom du
   leurre, coloris, « Pirate » — ils doivent correspondre au reçu Stripe et à l'email), les
   **pages légales** et les **gabarits d'email**.
   Le filet : `src/lib/i18n.test.ts` (périmètre, correspondance avec `LOCALES`, parité, ordre,
   placeholders) et `src/lib/i18n/gen.test.ts` (le généré = les sources). L'oubli sort en **gate
   rouge**, pas en page à moitié traduite.

---

## 🚦 Règle n°0 — Point d'entrée obligatoire : le skill `wx`

**Avant toute intervention** (code, page, composant, contenu, correctif, revue, mise en ligne), ta
**PREMIÈRE action** est d'invoquer le skill **`wx`** (outil Skill, nom `wx`). Il te route vers le
bon sous-skill et te rappelle les règles non négociables.
Seule exception : une simple question conversationnelle (« c'est quoi ce fichier ? »).

---

## La mémoire du projet — 3 couches (à ne jamais confondre)

| Couche | Où | Contenu | Change… |
|---|---|---|---|
| **Standards** | ce `CLAUDE.md` + `docs/standards/` | Règles, conventions, pièges web durables | ~jamais (fourni par le kit) |
| **Produit** | `docs/product/` (`VISION.md`, `PRODUCT.md`) | Le « pourquoi » de CE site, sa cible, sa conversion, sa direction artistique | 1× au démarrage, rare ensuite |
| **Specs** | `docs/specs/` | Le détail d'UNE page/feature (Exigences → Design → Tâches → Vérif) | à chaque feature |

**Au démarrage de session, lis `docs/PROGRESS.md` et `docs/ROADMAP.md`** pour savoir où on en est.

---

## Principe directeur n°1 — la PÉRENNITÉ, et « échec bruyant, jamais un chiffre faux »

Objectif qui prime sur tout : que ce site **reste correct, rapide et maintenable dans le temps**.
Entre une solution rapide qui casse en silence dans 3 mois et une solution un peu plus longue qui
tient 2 ans, **on choisit celle qui dure**.

1. **Zéro dégradation silencieuse.** Fetch qui échoue, JSON illisible, service tiers en panne :
   on **signale** (erreur typée affichée, log explicite) — **jamais** une valeur vide/fausse en silence.
2. **Tout tiers fragile est isolé** derrière un module unique : un changement d'API ne touche qu'un fichier.
3. **La doc dit la vérité** : ce `CLAUDE.md` + `docs/PROGRESS.md` = le code réel.
4. **Un filet de régression** : les tests (vitest) protègent le cœur (schémas, routes API, logique).
5. **Une seule source de vérité** : domaine/nom → `src/lib/site-config.ts` ; tokens design →
   `globals.css` (`@theme`) ; schéma de formulaire **partagé** client/serveur. Pas de duplication qui dérive.

---

## Les 10 règles non négociables (web)

Les casser = faille, casse silencieuse en prod, pénalité SEO, ou amende RGPD.

1. **TypeScript strict, zéro `any`** (ni `@ts-ignore`, ni `eslint-disable` de confort). Une erreur
   de type se corrige, elle ne se masque pas.
2. **Aucun secret exposé.** `NEXT_PUBLIC_*` = public par construction. Tout secret vit côté serveur
   (`.env.local` git-ignoré) — jamais dans le code, le bundle client, les logs, ou un commit.
3. **Toute entrée externe est validée par un schéma zod partagé** client ET serveur (une seule
   source). Une route API : parse JSON sûr, plafond de taille, rate-limit, honeypot sur formulaire
   public, et ne relaie **que** les données validées — jamais du JSON arbitraire.
4. **Headers de sécurité complets dès le jour 1** (CSP, HSTS, X-Frame-Options, nosniff,
   Permissions-Policy — cf. `next.config.ts`). Tout service tiers ajouté (analytics, Calendly,
   embed…) = CSP mise à jour **dans le même commit**, sinon casse silencieuse en prod.
5. **Échec bruyant, jamais une valeur fausse.** Route API → try/catch → JSON d'erreur typé ;
   client → `res.ok` vérifié ; états loading/vide/erreur distincts ; jamais un faux succès.
6. **Jamais de donnée fabriquée dans l'UI** : pas de faux témoignage, fausse stat, faux logo client,
   compteur inventé. Pas de vraie donnée → la section n'existe pas.
7. **Images traitées AVANT intégration** : WebP/AVIF, dimensionnées à l'affichage réel,
   `next/image` partout (`fill` + `sizes` ou width/height) ; jamais de raster base64 dans un SVG.
8. **Accessibilité native** : HTML sémantique, `alt` sur toute image informative, focus visible,
   parcours clavier complet, contrastes AA, `prefers-reduced-motion` respecté sur **chaque** animation.
9. **SEO structurel à la création de chaque page** : `metadata` unique (title/description), OG,
   entrée sitemap, JSON-LD si pertinent. Une page « pas prête » est exclue du sitemap **et** de
   robots. Toute URL supprimée/renommée = redirect 301.
10. **RGPD par défaut** : aucun cookie/tracker non essentiel avant consentement ; fonts self-hosted
    via `next/font` (jamais de fetch Google Fonts au runtime) ; pages légales dès la v1 ;
    minimisation des données de formulaire. **Tout texte visible respecte la charte de ton**
    (`docs/standards/UI-COPY.md`) : zéro tournure « IA générée ».

> Le détail volatil (versions, syntaxe Tailwind v4, pièges CSP/Next datés) vit dans
> `docs/standards/WEB-REFERENCE.md` et se **vérifie contre la doc officielle** au moindre doute.

---

## Stack par défaut (surcharger dans `docs/product/PRODUCT.md` si besoin)

- **Framework** : Next.js (App Router) + TypeScript strict. **Server Components par défaut** ;
  `'use client'` uniquement pour l'interactivité réelle.
- **Styles** : Tailwind CSS v4 — tokens dans `globals.css` via `@theme`. **Pas de `tailwind.config.ts`.**
  La couche visuelle invariante du studio (géométrie, surligneur, grain, motion) est fixée par
  **`docs/standards/FONDATION-PASTEL.md`** ; la DA de CE site n'en remplit que la couche 2.
- **Animations** : `framer-motion` avec les tokens de `src/lib/motion.ts` (reveals
  `AnimatedSection`, transition de page `PageRelay` — doctrine dans `FONDATION-PASTEL.md` §6).
  `gsap` + `lenis` **seulement si** scroll narratif (pin/scrub) — cf. pièges dans `WEB-REFERENCE.md`.
- **Formulaires** : `react-hook-form` + `zod` (`@hookform/resolvers`) — schéma partagé client/serveur.
- **Icônes** : `lucide-react`. **Jamais d'emoji comme icône d'UI.**
- **Tests** : `vitest` + Testing Library (jsdom). **Qualité** : ESLint (flat config) + Prettier (hooks auto).
- **Architecture** : contenu/config → `src/lib/site-config.ts` ; logique → `src/lib/` ;
  composants réutilisables → `src/components/ui/` ; sections de page → `src/components/sections/` ;
  une section > 200 lignes se découpe en sous-dossier.
- **Hébergement** : Vercel.

---

## Definition of done (le gate — invoque `web-quality-gate`)

Rien n'est « fini » tant que ce n'est pas **vert, vérifié, pas « à l'œil »** :

```bash
npx tsc --noEmit     # le check rapide, à lancer souvent
npx eslint .         # 0 erreur (ne pas utiliser `next lint`, cf. WEB-REFERENCE)
npm run test         # vitest
npm run build        # le build prod passe
```

Puis **vérification navigateur réelle** (serveur dev + console sans erreur + rendu mobile 375px
et desktop + parcours clavier) — le gate détaille.

---

## Protocole de fin de session

Quand tu changes l'état du produit :
1. **Ajoute une entrée en haut de `docs/PROGRESS.md`** (date + ce qui a changé + fichiers clés). C'est LA trace.
2. **Mets à jour `docs/ROADMAP.md`** si une priorité/phase bouge.
3. **N'ajoute une règle dans ce `CLAUDE.md`** que si tu as découvert un piège durable réutilisable
   (et répercute-le dans le repo `web-dev-kit` pour le prochain site).
4. **Propose un plan de commits** (skill `web-commit`) — jamais de commit de ta propre initiative.

Si tu ne fais qu'une chose : écris dans `docs/PROGRESS.md`.

---

## Où lire la vérité

| Fichier | Contenu |
|---|---|
| `CLAUDE.md` (ici) | Règles permanentes (couche Standards). À lire avant toute intervention. |
| `docs/standards/WEB-REFERENCE.md` | Faits web volatils + pièges vérifiés datés — à rafraîchir. |
| `docs/standards/FONDATION-PASTEL.md` | La fondation visuelle du studio (couche 1) : géométrie, surligneur, grain, motion — invariante. |
| `docs/standards/UI-COPY.md` | Charte de ton de chaque texte visible. |
| `docs/i18n/README.md` | Le standard des deux langues : ce qui se traduit, ce qui reste en français, et la contrepartie « livraison France » de la version anglaise. |
| `docs/product/VISION.md` · `PRODUCT.md` | Le « pourquoi » + cible + conversion + direction artistique. |
| `docs/ROADMAP.md` | Le parcours idée → mise en ligne, par phase. |
| `docs/PROGRESS.md` | Historique de ce qui a été livré (le + récent en haut). |
| `docs/specs/` | Le détail des features (une spec par feature). |
| `src/lib/site-config.ts` | Nom, domaine, description du site — la source unique. |
