---
name: web-spec
description: >-
  Cadre une page ou une feature de site web AVANT d'écrire du code, en spec-driven : Exigences →
  Design → Tâches → Vérification. À invoquer dès qu'on veut ajouter quelque chose de non trivial
  (nouvelle page, formulaire, section animée, intégration tierce). Produit une spec validée dans
  docs/specs/<feature>.md qui sert de contrat : l'agent peut reprendre en cours sans re-briefing,
  et l'implémentation ne dérive pas. À faire valider par l'utilisateur avant de passer à web-feature.
---

# web-spec — spécifier avant de coder

Une feature non triviale sans spec = re-briefings, oublis SEO/a11y, dérive. La spec est **courte**
(1 page), **testable**, et **validée par l'utilisateur** avant le premier fichier de code.

## Quand une spec est obligatoire (vs. trivial)

- **Spec** : nouvelle page, formulaire, section au scroll, intégration tierce (analytics,
  Calendly, embed), blog, refonte d'une section.
- **Trivial (pas de spec)** : correction de texte, ajustement de style, bug localisé. → direct
  `web-feature` avec bon sens.

## La méthode

1. Copie `docs/specs/_TEMPLATE.md` → `docs/specs/<nom-court>.md`.
2. Remplis les 4 parties **dans l'ordre** (le design web a ses points fixes ci-dessous).
3. **Fais valider** la spec (statut `brouillon` → `validée`), puis passe à `web-feature`.

## Points fixes du design (partie 2) — à traiter dans CHAQUE spec de page

- **Contenu réel** : d'où viennent les textes/images ? (Règle n°6 : pas de contenu inventé —
  si le contenu n'existe pas, la spec attend.)
- **SEO de la page** : title/description uniques, entrée sitemap, JSON-LD pertinent ?
  (`Organization`, `Article`, `FAQPage`…) — et si la page remplace une URL : redirect 301.
- **États** : tout ce qui est dynamique (formulaire, fetch) a ses états loading/vide/erreur définis.
- **Animations** : lesquelles, et leur version `prefers-reduced-motion`.
- **Images** : lesquelles, à quelles dimensions d'affichage → plan de conversion WebP
  (`scripts/optimize-images.sh`) AVANT intégration.
- **Tiers** : tout nouveau service tiers → domaines à ajouter à la CSP (même commit) + impact
  RGPD (consentement ?).
- **Responsive** : les points de rupture qui changent la mise en page (mobile 375px d'abord).

## Ce qui rend une spec bonne

- Les **critères d'acceptation sont observables** (« le formulaire refuse un email invalide et
  affiche l'erreur sous le champ », pas « le formulaire marche bien »).
- Le **hors-scope est écrit** (ce que cette feature ne fait PAS).
- Chaque tâche est une **tranche verticale finissable en une session**.
- La partie Vérification mappe chaque critère à un test vitest ou à un check du gate.
