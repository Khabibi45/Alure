---
name: web-onboarding
description: >-
  Guide de démarrage d'un site web construit avec ce kit : créer le projet (create-next-app),
  poser le kit (install.sh), installer les dépendances, lancer le serveur dev, vérifier que tout
  est vert, et réparer un état cassé (port occupé, .next corrompu, deps désynchronisées, build qui
  casse). À invoquer pour mettre en route le projet, comprendre où sont les choses, ou débloquer
  un environnement. Donne les commandes exactes.
---

# web-onboarding — démarrer, lancer, réparer

## 1. Créer un nouveau site (une fois)

```bash
# 1. Scaffold officiel
npx create-next-app@latest mon-site --typescript --tailwind --eslint --app --src-dir --use-npm
cd mon-site

# 2. Poser le kit (CLAUDE.md, skills, docs, hooks + overlay starter/)
~/Dev/web-dev-kit/install.sh .

# 3. Dépendances du kit
npm i framer-motion lucide-react react-hook-form @hookform/resolvers zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event prettier

# 4. Scripts package.json — ajouter/vérifier :
#    "type-check": "tsc --noEmit"
#    "test": "vitest run"        "test:watch": "vitest"
#    "lint": "eslint ."          (PAS `next lint`, cf. WEB-REFERENCE.md)
```

**Option scroll narratif** (pin/scrub GSAP, smooth scroll) — seulement si le design le demande :
`npm i gsap lenis`, puis brancher `SmoothScrollProvider` dans `layout.tsx` (le composant est déjà
dans `src/components/providers/`, le câblage est en commentaire dans `layout.tsx`).
Un site sobre n'en a **pas besoin** : `AnimatedSection` (framer-motion) suffit.

## 2. Vérifier que la base est verte (avant d'écrire la moindre page)

```bash
npx tsc --noEmit && npx eslint . && npm run test && npm run build
```

Les 4 doivent passer **sur le squelette nu**. Les tests du starter couvrent déjà la route
`/api/contact` (validation, honeypot, rate-limit) — si ça casse ici, répare avant tout.

Puis lancer et regarder :
```bash
npm run dev        # http://localhost:3000
```
(Sous Claude Code : préférer l'outil de preview `preview_start` avec la config `dev` de
`.claude/launch.json` — jamais un serveur dev en Bash.)

## 3. Personnaliser (les TODO du kit)

```bash
grep -rn "TODO(kit)" src next.config.ts .github 2>/dev/null
```

À remplir dans l'ordre :
1. `src/lib/site-config.ts` — nom, domaine, description (LA source unique : sitemap, robots,
   metadata et JSON-LD la lisent).
2. `next.config.ts` — domaines CSP (`connect-src`, `img-src`) selon les services réellement utilisés.
3. `src/app/globals.css` — tokens `@theme` de la direction artistique (via `web-product`).
4. `src/lib/contact-schema.ts` + `src/app/api/contact/route.ts` — champs du formulaire + livraison
   (`deliver()` : Resend, webhook, backend…). Tant que ce n'est pas branché, la route répond 503
   **exprès** (échec bruyant, jamais un faux succès).
5. `.github/workflows/ci.yml` — le job deploy (SSH ou supprimer si Vercel).

Quand c'est fait : `grep -rn "TODO(kit)"` ne doit plus rien retourner (le gate le vérifie).

## 4. Où sont les choses

| Quoi | Où |
|---|---|
| Config site (nom, domaine) | `src/lib/site-config.ts` |
| Tokens design (couleurs, fonts, espacements) | `src/app/globals.css` (`@theme`) |
| Sections de page | `src/components/sections/` |
| Composants réutilisables | `src/components/ui/` |
| Logique / schémas | `src/lib/` |
| SEO | `layout.tsx` (metadata), `sitemap.ts`, `robots.ts`, `components/seo/JsonLd.tsx` |
| Formulaire | `contact-schema.ts` (partagé) + `app/api/contact/route.ts` |
| Images sources → WebP | `scripts/optimize-images.sh` |

## 5. Réparer un état cassé

| Symptôme | Réparation |
|---|---|
| `EADDRINUSE :3000` | `lsof -ti:3000 \| xargs kill` (un dev server traîne) |
| Comportement bizarre après grosse modif config | `rm -rf .next` puis relancer |
| `Module not found` sur une dep pourtant listée | `npm install` (lockfile désynchronisé) |
| `npm run build` échoue en `EPERM`/trace | un serveur dev tourne déjà — l'arrêter d'abord |
| `next lint` : « Invalid project directory » | normal (cassé sous Next 16) → `npx eslint .` |
| CSP bloque un service tiers en prod, pas en dev | ajouter le domaine dans `next.config.ts` (règle n°4) |
| Hooks de format inactifs | `npm i -D prettier` + vérifier `.claude/settings.json` |
| Tester sur téléphone réel | `npm run dev -- -H 0.0.0.0` + IP locale du Mac ; box qui isole WiFi/Ethernet → PC en WiFi |

## 6. Et ensuite

Produit pas encore cadré → `web-product`. Sinon → `docs/ROADMAP.md` pour la prochaine tâche,
`web-spec` pour la spécifier.
