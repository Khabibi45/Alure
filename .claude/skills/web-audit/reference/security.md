# Audit sécurité — checklist de référence

Verdicts ancrés `fichier:ligne`. Sévérités : **bloquant** (faille exploitable ou secret exposé) /
**à corriger** / **mineur**.

## 1. Headers & CSP (`next.config.ts`)

- [ ] Les headers sont TOUS présents : `Content-Security-Policy`, `Strict-Transport-Security`
      (avec `includeSubDomains`), `X-Frame-Options: DENY` (ou CSP `frame-ancestors 'none'`),
      `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
      `poweredByHeader: false`.
- [ ] La CSP couvre **chaque service tiers réellement utilisé** : croiser les domaines de
      `connect-src`/`script-src`/`img-src`/`frame-src` avec les appels réels
      (`grep -rn "https://" src/ | grep -v "site-config"` + scripts/embeds dans les composants).
      Un tiers utilisé mais absent de la CSP = casse silencieuse en prod (**à corriger**) ;
      un domaine dans la CSP mais plus utilisé = surface inutile (**mineur**).
- [ ] `script-src` : `'unsafe-inline'` est toléré (hydratation Next en statique — cf.
      WEB-REFERENCE) ; **`'unsafe-eval'` ne l'est pas** (se retire sans douleur).
- [ ] Pas de wildcard large (`default-src *`, `script-src https:`).

## 2. Secrets & environnement

- [ ] `grep -rn "NEXT_PUBLIC_" src/ .env*` : chaque variable `NEXT_PUBLIC_*` est **publiable par
      nature** (URL publique, clé anonyme prévue pour ça). Une clé d'API secrète en
      `NEXT_PUBLIC_*` = **bloquant**.
- [ ] Aucun secret en dur : `grep -rnE "(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]{8,}" src/` — et vérifier les faux positifs à la main.
- [ ] `.env.local`/`.env` git-ignorés ET absents de l'historique (`git log --all --diff-filter=A -- .env*`).
- [ ] Les secrets ne sont lus QUE dans du code serveur (routes API, Server Components) — jamais
      dans un fichier `'use client'`.

## 3. Routes API (`src/app/api/**`)

Pour CHAQUE route :
- [ ] Entrée validée par **zod `safeParse`** (schéma partagé) ; seul `parsed.data` est utilisé/relayé.
- [ ] Parse JSON **sûr** (try/catch dédié → 400), **plafond de taille** du payload (→ 413).
- [ ] **Rate-limit** par IP sur toute route de mutation publique (→ 429 + `Retry-After`).
- [ ] Formulaire public → **honeypot** (succès simulé sans traitement).
- [ ] try/catch global → JSON d'erreur générique ; le message d'erreur ne **fuite** ni stack, ni
      chemin, ni détail d'implémentation.
- [ ] Les erreurs loggées côté serveur ne contiennent pas de données personnelles en clair.
- [ ] Méthodes non prévues non exportées (pas de GET fantôme sur une route d'écriture).

## 4. XSS & injection

- [ ] `grep -rn "dangerouslySetInnerHTML" src/` : seul cas légitime = JSON-LD, avec
      `JSON.stringify(...).replace(/</g, '\\u003c')`. Tout autre usage sur du contenu non maîtrisé
      = **bloquant**.
- [ ] Contenu markdown/rich text tiers rendu via une lib qui échappe (react-markdown sans
      `rehype-raw`), jamais par injection HTML brute.
- [ ] Pas de `eval`/`new Function` (`grep -rn "eval(" src/`).
- [ ] Redirections : pas d'open redirect (`redirect(searchParams.url)` sans liste blanche).

## 5. Dépendances & build

- [ ] `npm audit --omit=dev` : zéro vulnérabilité high/critical non traitée (une exception se
      justifie par écrit).
- [ ] Pas de dépendance abandonnée/inconnue ajoutée « pour un utilitaire » (vérifier les deps
      récentes du `package.json` contre leur usage réel).
- [ ] Build Docker : l'image finale ne contient ni `.env*`, ni sources inutiles (multi-stage,
      `output: 'standalone'`, `.dockerignore` couvre `.env*`).

## 6. Divers

- [ ] `robots.ts` n'expose pas de chemin « secret » (un disallow est une CARTE, pas une protection).
- [ ] Pas d'upload de fichier sans validation type/taille côté serveur (si la feature existe).
- [ ] Les pages d'erreur (404, error.tsx) ne révèlent rien de l'interne.
