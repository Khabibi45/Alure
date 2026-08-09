---
name: web-commit
description: >-
  Discipline de commit pour un site web construit avec ce kit. À invoquer à la fin d'une tâche ou
  d'une partie du plan. Les commits ne sont JAMAIS automatiques : tu PROPOSES toujours un plan de
  commits atomiques par partie (content/ui/logic/api/seo/config/docs), avec pour chacun un sujet
  court (LOT0-ui) et un rapport NON-TECHNIQUE. Tu fais valider ce plan, puis tu n'exécutes
  qu'APRÈS accord explicite.
---

# web-commit — proposer, faire valider, puis committer

**Jamais de commit de ta propre initiative.** Fin de tâche = un **plan de commits proposé**,
validation explicite de l'utilisateur, puis exécution. C'est tout.

## 1. Découper en commits atomiques par partie

Parties types d'un site : `content` (textes/images), `ui` (composants/sections/styles),
`logic` (src/lib, hooks), `api` (routes), `seo` (metadata, sitemap, JSON-LD, redirects),
`config` (next.config, CI, deps), `docs` (PROGRESS, specs, ROADMAP).

Un commit = une partie qui tient debout seule (le site build à chaque commit). Une feature
traverse plusieurs parties → plusieurs commits, dans l'ordre logique (logic → api → ui → seo → docs).

## 2. Le format du plan (à faire valider tel quel)

Exemple sur des fichiers **réels** du dépôt (la logique commande vit dans `src/lib/shop/` —
règle Alure n°2 ; jamais un `src/lib/<feature>-schema.ts` pour le commerce) :

```
Commit 1 — LOT2-logic : données produit et contrôle de la commande
  Fichiers : src/lib/shop/product.ts, src/lib/shop/checkout-schema.ts,
             src/lib/shop/shop.test.ts
  En clair : le site connaît le prix, les coloris et les quantités autorisées,
  et vérifie une commande de la même façon dans le navigateur et sur le serveur.

Commit 2 — LOT2-api : démarrage du paiement
  Fichiers : src/app/api/checkout/route.ts, src/app/api/checkout/route.test.ts
  En clair : cliquer « Acheter » emmène le visiteur sur la page de paiement
  sécurisée, le montant étant recalculé par le site — jamais envoyé par le
  navigateur. Une demande invalide est refusée proprement.
```

Règles du rapport « en clair » : **non-technique** (compréhensible par quelqu'un qui ne code
pas), ce que ça change pour le site/visiteur, pas de jargon, pas de vente.

## 3. Exécution (après validation seulement)

- `git status` + `git diff --stat` relus AVANT : on committe ce qu'on voulait, rien d'autre.
- Ajouter les fichiers **explicitement** (`git add <fichiers>`), jamais `git add -A` en aveugle.
- Sujet : `LOT<n>-<partie> : <résumé court>` ; corps : le rapport en clair du plan.
- **On travaille sur `main`** (projet solo) — jamais de branche sauf demande explicite.
- Si le worktree contient des changements qui ne sont pas de toi (autre agent/humain) : les
  **exclure** sans poser de question ; `docs/PROGRESS.md`/`ROADMAP.md` partagés se committent à part.

## 4. Ce qui ne se committe jamais

Secrets (`.env.local`), images sources non optimisées (le WebP oui, le PNG 4000px non),
`console.log` de debug, fichiers scratch, `node_modules`, `.next`.
