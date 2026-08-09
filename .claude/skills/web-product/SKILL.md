---
name: web-product
description: >-
  Cadre un NOUVEAU site web au démarrage : remplit la couche produit du kit (CLAUDE.md, VISION.md,
  PRODUCT.md, ROADMAP.md) à partir de l'idée de l'utilisateur, y compris la direction artistique
  (tokens, ton) et le plan des pages. À invoquer une seule fois juste après avoir posé le kit dans
  un repo neuf, ou quand le positionnement du site change. Pose les bonnes questions (cible,
  conversion, pages, hébergement, analytics) et écrit les fichiers.
---

# web-product — cadrer le site (1× au début)

But : qu'après cette session, **plus aucun `{{…}}` ne traîne** dans `CLAUDE.md`, `VISION.md`,
`PRODUCT.md`, et que `ROADMAP.md` liste les vraies pages. Un site qui démarre sans ce cadrage
dérive (pages sans objectif, design décidé au fil de l'eau, CSP jamais remplie).

## 1. Les questions à poser (une passe, groupées)

**Le pourquoi**
- Quel est ce site, pour qui, et **quelle action doit faire le visiteur** (la conversion :
  formulaire ? prise de RDV ? téléchargement d'app ? achat ?) ?
- Qu'est-ce qui différencie l'offre ? Anti-scope : qu'est-ce que le site ne fera PAS ?

**Le concret**
- Domaine (et redirections d'anciennes URLs à prévoir ?)
- Pages v1 (typique : accueil, offre(s), à-propos, contact, légal) — et ce qui attend la v2
- Langue(s) — i18n ou français seul ?
- Formulaire de contact : quels champs (minimisation RGPD !), et **où livrer** (email via Resend ?
  webhook ? backend ?)
- Hébergement : Vercel ou VPS/Docker ? Analytics : aucun / respectueux (Plausible, Umami) /
  autre (⚠️ consentement) ?

**La direction artistique**
- ⚠️ La DA d'un site = la **couche 2** : palette (valeurs des tokens sémantiques, dont
  `--color-accent` → surligneur), typos, imagerie, ton. La **couche 1** (géométrie, surfaces,
  motion, surligneur, grain) est FIXÉE par `docs/standards/FONDATION-PASTEL.md` — on ne
  re-questionne jamais radius, ombres ou animations au cadrage.
- Existe-t-il une charte (couleurs, typo, logo) ? Sinon : 2-3 adjectifs du rendu voulu +
  1-2 sites de référence. Mode sombre : oui/non ?
- Ton des textes : tutoiement ou vouvoiement ? (La charte `UI-COPY.md` s'applique dans les deux cas.)
- Scroll narratif / animations riches (gsap+lenis) ou site sobre (framer seul) ?

## 2. Écrire les fichiers (dans cet ordre)

1. **`docs/product/VISION.md`** — problème, proposition de valeur, conversion cible, persona, anti-scope.
2. **`docs/product/PRODUCT.md`** — pages v1/v2, formulaire (champs + livraison), hébergement,
   analytics, direction artistique (palette avec valeurs hex, fonts, ton, mode sombre, niveau d'animation).
3. **`CLAUDE.md`** — remplacer `{{NOM_SITE}}` et tous les `{{…}}` (type de site, hébergement).
4. **`docs/ROADMAP.md`** — remplacer les features gabarits par les vraies pages, dans l'ordre de valeur.
5. **`src/lib/site-config.ts`** — nom, domaine, description, réseaux sociaux.
6. **`src/app/globals.css`** — poser les VALEURS couche 2 des tokens `@theme` (couleurs
   sémantiques, fonts) en respectant les rôles fondation : `background` teinté jamais blanc pur,
   `accent-soft` dérivé de l'accent et lisible sous du texte encre. Ne pas toucher aux blocs
   marqués COUCHE 1.
7. **`docs/PROGRESS.md`** — première entrée : « produit cadré ».

## 3. Règles du cadrage

- **Conversion d'abord** : chaque page v1 doit servir la conversion ou la confiance. Une page qui
  ne sert ni l'une ni l'autre attend la v2.
- **Minimisation RGPD dès le cadrage** : chaque champ de formulaire doit se justifier (« secteur »
  optionnel, jamais de date de naissance « au cas où »).
- **La DA se fixe en tokens, pas en adjectifs** : à la fin, `globals.css` contient des valeurs hex
  et des noms de fonts réels — pas « moderne et épuré ».
- **Pas de page fantôme** : une page listée en v1 sans contenu réel disponible (témoignages,
  logos clients, chiffres) passe en v2 — règle n°6, jamais de donnée fabriquée pour remplir.
- Si le site doit avoir des **comptes utilisateurs / une BDD** : le noter dans `PRODUCT.md`
  section contraintes — ce kit couvre le site public ; l'app authentifiée demande des règles en
  plus (RLS, middleware liste-blanche, scoping par user) à cadrer à part.

## 4. Fiche produit & textes marketing

Le marketing **assumé** est permis sur la landing (c'est un site !) — mais les 5 tournures
interdites de `docs/standards/UI-COPY.md` s'appliquent quand même (pas de slogan symétrique,
pas de tiret-béquille, pas d'auto-défense préventive…). Les micro-copies fonctionnelles
(formulaires, erreurs, 404, cookie banner) suivent la charte strictement.
