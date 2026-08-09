---
name: web-quality-gate
description: >-
  La "definition of done" d'un site web construit avec ce kit. À invoquer AVANT de dire qu'une
  tâche est finie, avant un commit, avant une mise en ligne. Lance et interprète les vérifications
  (tsc --noEmit, eslint, vitest, next build) puis impose la vérification navigateur réelle
  (console, rendu mobile/desktop, clavier) et les checks manuels que les outils ne voient pas.
  Bloque la livraison tant que tout n'est pas vert.
---

# web-quality-gate — rien ne sort sans passer par là

Une tâche n'est **jamais** « finie » tant que ce gate n'est pas vert. On ne valide jamais « à l'œil ».

## 1. Vérifications automatiques (dans l'ordre)

```bash
npx tsc --noEmit     # 0 erreur — le check rapide, à lancer en premier
npx eslint .         # 0 erreur (jamais `next lint`, cassé sous Next 16 — cf. WEB-REFERENCE)
npm run test         # vitest : tous verts
npm run build        # le build prod passe (et attrape ce que le dev server tolère)
```

**Interprétation :**
- Une erreur TypeScript se **corrige** — jamais de `any`/`@ts-ignore` pour faire passer.
- Un test qui casse → comprends pourquoi ; ne le supprime pas, ne l'affaiblis pas.
- Un warning de build Next (page dynamique inattendue, image non optimisée) se traite, pas s'ignore.

## 2. Vérification navigateur RÉELLE (obligatoire pour tout changement visible)

Sous Claude Code : `preview_start` (config `dev`) puis, sur les pages touchées :

1. **Console** : zéro erreur, zéro warning nouveau (`read_console_messages`).
2. **Réseau** : pas de 404 de ressource, pas d'appel tiers non prévu (`read_network_requests`).
3. **Rendu** : vérifier la structure (`read_page`) et l'apparence — **mobile 375px ET desktop**
   (`resize_window`), mode sombre si retenu.
4. **Interactions touchées** : formulaire soumis (succès ET erreur), menu mobile, liens.
5. Capture d'écran de preuve pour l'utilisateur si le visuel a changé.

Sans outil de preview : `npm run dev` + vérification manuelle des mêmes points, et **dire**
ce qui a été vérifié comment.

## 3. Checks manuels (ce que les outils ne voient pas)

**UI (si touchée)** — la definition of done visuelle de `web-render` s'applique en entier
(tokens, reduced-motion, images WebP, clavier, contrastes, charte de ton).

**Données / logique**
- [ ] États loading / vide / erreur / contenu distincts ; **aucune donnée fabriquée**.
- [ ] Échec bruyant : erreurs affichées/loggées, jamais un faux succès ni un défaut silencieux.

**Route API (si touchée)**
- [ ] Zod `safeParse` + plafond de taille + rate-limit ; ne relaie que les données validées.
- [ ] try/catch → JSON d'erreur typé ; côté client `res.ok` vérifié.

**SEO (si page ajoutée/modifiée)**
- [ ] `metadata` unique (title/description), OG ; entrée `sitemap.ts` OU exclusion volontaire
      (sitemap ET robots) ; URL renommée → 301.

**Sécurité / RGPD (si tiers ou formulaire touché)**
- [ ] Nouveau domaine tiers dans la CSP (`next.config.ts`) **dans ce même lot**.
- [ ] Aucun secret dans le code/bundle ; aucun cookie non essentiel sans consentement.
- [ ] `grep -rn "TODO(kit)" src next.config.ts` ne retourne rien (sinon la config n'est pas finie).

## 4. Hygiène avant commit

- [ ] Pas de fichier scratch/debug, pas de `console.log` oublié, pas d'image source non optimisée committée.
- [ ] `docs/PROGRESS.md` mis à jour si l'état produit a changé.
- [ ] `git status` relu : on committe ce qu'on voulait, rien d'autre.

## 5. Verdict

- ✅ **Tout vert + cases cochées** → livrable. Propose un plan de commits (`web-commit`).
- ❌ **Une seule case rouge** → pas fini. Corrige, ou note explicitement pourquoi c'est accepté
  (et fais valider).

> Règle anti-mensonge : ne déclare jamais « les tests passent » sans les avoir lancés, ni « c'est
> responsive » sans l'avoir affiché à 375px. Si tu n'as pas vérifié, écris « non vérifié ».
