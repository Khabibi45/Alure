---
name: web-feature
description: >-
  Implémente une page ou une feature de site web depuis sa spec validée (docs/specs/), en tranches
  verticales : logique → composants → page → SEO → test. À invoquer pour écrire le code d'une
  feature déjà spécifiée (via web-spec) ou pour un petit changement trivial. Impose : Server
  Components par défaut, logique hors des composants, validation zod partagée, états
  loading/vide/erreur, aucune donnée fabriquée, échec bruyant, SEO de la page, tests du cœur.
---

# web-feature — implémenter en tranche verticale

Pré-requis : une spec validée dans `docs/specs/` (sinon → `web-spec`), le produit cadré
(`docs/product/`). Relis la spec ET la section pièges de `docs/standards/WEB-REFERENCE.md`
avant la première ligne.

## L'ordre d'une tranche verticale

1. **Logique / données** (`src/lib/`) — types, schéma zod, fonctions pures. Testable sans React.
2. **Composants** (`src/components/`) — sections et UI, sans logique métier inline.
3. **Page / route** (`src/app/`) — assemble les sections ; route API si besoin.
4. **SEO de la page** — `metadata` (title/description uniques), entrée `sitemap.ts`, JSON-LD si
   pertinent. Une page pas prête : exclue du sitemap ET de robots.
5. **Test** — le cœur (schéma, logique, route API) a son test vitest mappé aux critères de la spec.
6. **Gate** — `web-quality-gate` avant de dire « fini ».

## Règles d'implémentation

**Composants & pages**
- **Server Component par défaut.** `'use client'` seulement pour l'interactivité réelle (état,
  events, framer-motion) — et le plus **bas** possible dans l'arbre (la section interactive, pas la page).
- Une section > 200 lignes → sous-dossier (`sections/ma-section/` : composant, sous-composants, hook).
- La logique vit dans `src/lib/` ou un hook dédié (`useMonFormulaire`), **jamais** inline dans le JSX.
- Formulaires : `react-hook-form` + `zodResolver` sur le **schéma partagé** ; `useWatch` (jamais
  `form.watch()`, incompatible React Compiler).

**Données & API**
- Route API : le gabarit `starter` est le standard — parse sûr, plafond de taille, zod
  `safeParse`, rate-limit, honeypot, try/catch → JSON typé. Ne relaie que `parsed.data`.
- Client : `res.ok` vérifié avant `res.json()` ; erreur → message actionnable affiché.
- **États distincts** : loading / vide / erreur / contenu. Jamais « aucune donnée » sur une vraie erreur.
- **Jamais de donnée fabriquée** : contenu manquant → la section n'est pas rendue (et la spec le dit).

**Rendu**
- Toute UI nouvelle ou modifiée passe par le standard **`web-render`** (tokens, animations,
  images, micro-copies, a11y). Invoque-le dès que tu touches au visible.

**Fin de tranche**
- [ ] Critères d'acceptation de la spec re-vérifiés un à un
- [ ] `web-quality-gate` vert (dont vérification navigateur)
- [ ] Spec passée en statut `livrée` + `docs/PROGRESS.md` mis à jour
- [ ] Plan de commits proposé (`web-commit`)
