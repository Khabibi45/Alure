# Audit qualité de code — checklist de référence

Objectif : que le code reste **lisible, réutilisable et honnête** dans 6 mois. Cible les dérives
typiques du vibe coding : contournements de types, composants monstres, duplication, code mort.

## 1. Honnêteté des types

- [ ] `grep -rn ": any\|as any\|@ts-ignore\|@ts-expect-error" src/` → chaque occurrence est un
      constat (**à corriger** ; un `@ts-expect-error` documenté d'une lib tierce peut passer en mineur).
- [ ] `grep -rn "eslint-disable" src/` → chaque désactivation se justifie en commentaire, sinon constat.
- [ ] Pas de `as unknown as X` pour forcer un cast.

## 2. Taille & découpage

- [ ] Composants > 200 lignes : `find src -name '*.tsx' | xargs wc -l | sort -rn | head -15` —
      toute section monstre se découpe en sous-dossier (composant, sous-composants, hook).
- [ ] Pas de « God page.tsx » : une page assemble des sections, elle ne contient pas tout inline.
- [ ] Un hook par logique d'écran complexe (`useContactForm` pattern) — pas 15 `useState` en vrac.

## 3. Duplication & sources de vérité

- [ ] Même bloc JSX/logique copié ≥ 3× → composant/fonction partagée.
- [ ] Domaine/nom du site : **uniquement** via `site-config.ts` —
      `grep -rn "https://" src/ | grep -v site-config` ne doit montrer que des URLs externes légitimes.
- [ ] Couleurs : `grep -rn "#[0-9a-fA-F]\{6\}\|text-\[#\|bg-\[#" src/components src/app --include='*.tsx'`
      → tout hex hors `globals.css` est un constat.
- [ ] Un seul schéma zod par formulaire, partagé client/serveur (pas de re-validation divergente).

## 4. Code mort & config morte

- [ ] Exports jamais importés ; composants orphelins ; assets de `public/` jamais référencés.
- [ ] **Config morte** : un `tailwind.config.ts` présent sans directive `@config` dans le CSS ne
      fait RIEN (piège Tailwind v4) — le supprimer ou le brancher.
- [ ] Dépendances non utilisées : croiser `package.json` avec les imports réels.
- [ ] `grep -rn "TODO\|FIXME\|HACK" src/` : un TODO sans ticket/date = constat mineur ;
      un `TODO(kit)` restant = configuration inachevée (**à corriger**).

## 5. Hygiène

- [ ] `grep -rn "console.log" src/` hors gestion d'erreur volontaire → à retirer.
- [ ] Conventions du CLAUDE.md respectées : composants PascalCase, utilitaires kebab-case,
      logique dans `src/lib/`, imports via `@/`.
- [ ] Pas de fichier scratch (`test.ts`, `old-truc.tsx`, `copie de …`) dans `src/`.

## 6. Tests

- [ ] Le cœur est couvert : schémas zod, routes API, logique `src/lib/`, hooks de formulaire.
- [ ] Les tests testent le **comportement observable** (statuts HTTP, messages), pas l'implémentation.
- [ ] Aucun test affaibli pour passer (assertion commentée, `.skip` sans raison écrite).
