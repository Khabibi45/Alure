# Audit SEO — checklist de référence

Un site invisible sur Google n'existe pas. Tout est structurel (pas de « growth hack ») : metadata,
cohérence sitemap/robots, données structurées, redirections.

## 1. Metadata (par page)

- [ ] `layout.tsx` racine : `metadataBase` posé (sinon toutes les URLs OG sont relatives = cassées),
      `title.template` (`%s — Nom`), description par défaut, OG + Twitter par défaut.
- [ ] **Chaque page** exporte `metadata` (ou `generateMetadata`) : title unique < ~60 car.,
      description unique < ~160 car. Deux pages avec le même title = **à corriger**.
- [ ] OG image présente (1200×630, < 300 KB, dans `public/`) — par défaut globale + spécifique si
      la page le mérite. Valider avec les debuggers Facebook/LinkedIn avant mise en ligne.
- [ ] `alternates.canonical` si une page a des variantes d'URL (params, pagination).

## 2. Sitemap ↔ robots — la cohérence, pas juste la présence

- [ ] `src/app/sitemap.ts` liste **toutes** les pages indexables — croiser avec
      `find src/app -name page.tsx` : toute page absente du sitemap doit être une exclusion
      **volontaire**.
- [ ] Toute page exclue l'est **des deux côtés** : absente du sitemap ET `disallow` dans
      `robots.ts` (une page « pas prête » listée d'un seul côté finit indexée).
- [ ] `robots.ts` : `sitemap:` pointe vers l'URL de prod, construite depuis `site-config.ts`
      (jamais un domaine en dur qui diverge).
- [ ] `/api/` est disallow.

## 3. Données structurées (JSON-LD)

- [ ] `Organization` (ou `LocalBusiness` si adresse physique) sur l'accueil ; `WebSite` ;
      `Article` sur les posts de blog ; `FAQPage` si FAQ ; `BreadcrumbList` si fil d'Ariane.
- [ ] Injecté via le composant `JsonLd` (échappement `<` inclus) — jamais un script inline maison.
- [ ] Le contenu du JSON-LD dit la **vérité** (pas de note agrégée inventée, pas d'adresse fictive).
- [ ] Validation : https://validator.schema.org sur les pages clés.

## 4. Structure HTML

- [ ] **Un seul `h1` par page**, qui décrit la page (pas le slogan du site répété partout).
- [ ] Hiérarchie de titres sans saut (h2 → h3, pas h2 → h4) — c'est aussi de l'a11y.
- [ ] Liens internes descriptifs (« voir nos offres d'audit », pas « cliquez ici »).
- [ ] `lang="fr"` (ou la bonne langue) sur `<html>`.
- [ ] 404 : `not-found.tsx` propre avec liens de sortie (pas une impasse).

## 5. URLs & redirections

- [ ] URLs courtes, en français, kebab-case, stables.
- [ ] **Toute URL renommée/supprimée a son redirect 301** dans `next.config.ts`
      (`permanent: true`). Vérifier : `git log --diff-filter=D --name-only -- 'src/app/**/page.tsx'`.
- [ ] Pas de contenu dupliqué accessible sous deux URLs sans canonical.

## 6. Icônes

- [ ] Favicon complet via les conventions de fichiers Next (`src/app/icon.png`, `apple-icon.png`)
      — pas de `<link>` manuels.

## 7. i18n (si multilingue)

- [ ] `hreflang` via `alternates.languages` ; chaque langue a ses metadata propres.
