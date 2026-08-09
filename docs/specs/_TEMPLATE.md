# Spec — {{Nom de la page/feature}}

> Copie ce fichier en `docs/specs/<nom-feature>.md` et remplis-le via `web-spec`.
> À faire **valider** avant de coder (`web-feature`).

Statut : `brouillon` → `validée` → `en cours` → `livrée`
Date : {{AAAA-MM-JJ}}

## 1. Exigences (le quoi & le pourquoi)
- **Problème / valeur** : {{quel besoin, lien avec docs/product/VISION.md — quelle contribution à la conversion}}
- **Critères d'acceptation** (observables) :
  - [ ] Étant donné {{contexte}}, quand {{action}}, alors {{résultat observable}}.
  - [ ] …
- **Hors-scope** : {{ce que cette feature ne fait PAS}}

## 2. Design (le comment, avant le code)
- **Contenu réel** : {{d'où viennent textes/images — s'ils n'existent pas, la spec attend}}
- **Sections / composants** : {{structure de la page, composants réutilisés vs créés}}
- **États** : loading / vide / erreur / contenu → {{ce qu'on montre dans chacun (si dynamique)}}
- **SEO** : {{title/description, entrée sitemap, JSON-LD pertinent, 301 si remplacement d'URL}}
- **Images** : {{lesquelles, dimensions d'affichage → plan WebP via scripts/optimize-images.sh}}
- **Animations** : {{lesquelles + comportement en prefers-reduced-motion}}
- **Tiers** : {{aucun / lesquels → domaines CSP + impact RGPD}}
- **Responsive** : {{ce qui change entre 375px et desktop}}
- **Décisions notables** → ADR : {{lien docs/adr/… si choix structurant}}

## 3. Tâches (tranches verticales, chacune finissable en une session)
- [ ] {{Tâche 1 : logique → composants → page → SEO → test}}
- [ ] {{Tâche 2}}

## 4. Vérification
- **Tests** (vitest) mappés aux critères : {{quels tests}}
- **Gate** : `web-quality-gate` (tsc/lint/test/build + navigateur réel 375px/desktop).
- **Audits concernés** : {{sécurité si route API / SEO / a11y / RGPD si tiers… via web-audit}}
