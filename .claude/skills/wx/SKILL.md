---
name: wx
description: >-
  Point d'entrée UNIQUE d'un site web Next.js construit avec ce kit (invoqué par /wx).
  À appeler en PREMIER quand quelqu'un (humain ou agent) veut contribuer : démarrer le projet,
  cadrer le site, spécifier ou implémenter une page/feature, soigner le rendu, vérifier la
  qualité avant de livrer, lancer les audits (sécurité, performance, SEO, accessibilité, RGPD,
  qualité de code), ou proposer un plan de commits. Route vers web-onboarding, web-product,
  web-spec, web-feature, web-render, web-quality-gate, web-audit, web-commit, et pour le backend
  et les paiements web-backend, web-tests, web-anti-magic-string, web-illegal-states,
  web-mutation-testing. Encode le niveau
  de qualité d'un site public professionnel pour qu'un non-expert ne le dégrade pas.
---

# /wx — Point d'entrée & standard de qualité (site web Next.js)

Tu travailles sur un **site web public** (Next.js App Router) destiné à être **mis en ligne,
indexé et visité par de vrais utilisateurs**. Barre de qualité = site professionnel, pas side-project.

`/wx` est **le seul skill à retenir** : il te dit où aller, et rappelle les règles.

## Avant tout : la mémoire à 3 couches

Lis dans cet ordre au démarrage : **`CLAUDE.md`** (les règles), puis **`docs/PROGRESS.md`** +
**`docs/ROADMAP.md`** (où on en est). Le « pourquoi » du site est dans **`docs/product/`**.
Ne re-demande jamais un contexte déjà écrit là.

## Principe directeur n°1 — pérennité + « échec bruyant, jamais un chiffre faux »

Entre une solution rapide qui casse en silence dans 3 mois et une qui tient 2 ans, choisis celle
qui dure. **Zéro dégradation silencieuse** : un tiers qui échoue se **signale** (erreur typée, log)
— jamais une valeur vide ou fausse en silence. C'est LE défaut récurrent à éviter.

## Routage — choisis ta porte

| Tu veux… | Invoque | Ce que ça fait |
|---|---|---|
| Démarrer / installer / lancer / réparer | `web-onboarding` | create-next-app + pose du kit, deps, dev server, états cassés |
| Cadrer le site (1× au début) | `web-product` | Remplit `CLAUDE.md`, `VISION.md`, `PRODUCT.md`, `ROADMAP.md` + direction artistique |
| Spécifier une page/feature AVANT de coder | `web-spec` | Exigences → Design → Tâches → Vérif (une spec validée) |
| Implémenter depuis sa spec | `web-feature` | Tranche verticale : logique → composants → page → SEO → test |
| Soigner le rendu (page, section, anim) | `web-render` | Standard de rendu premium : tokens, animations sobres, anti « template IA », a11y |
| Vérifier avant de dire « fini » / commit | `web-quality-gate` | tsc/lint/test/build + vérification navigateur réelle |
| Auditer les domaines sensibles | `web-audit` | Lance en parallèle : sécurité, perf, SEO, a11y, RGPD, qualité de code |
| Finir une tâche / une partie du plan | `web-commit` | Propose un plan de commits atomiques à faire valider |
| Écrire/modifier une route API, la logique serveur, les paiements | `web-backend` | Le pattern des route handlers : validation zod partagée, rate-limit, échec bruyant, secrets |
| Écrire un test (backend uniquement) | `web-tests` | Ce qu'on teste (routes API, logique serveur) et ce qu'on ne teste pas (UI, composants) |
| Une valeur littérale : montant, date, identifiant, statut | `web-anti-magic-string` | Élimine les magic strings/numbers et impose le bon type au bon endroit |
| Modéliser un état (React, résultat d'API, statut de paiement) | `web-illegal-states` | Rend les états illégaux impossibles à représenter (unions discriminées, pas de booléens qui dérivent) |
| Vérifier que les tests détectent vraiment les bugs | `web-mutation-testing` | Optionnel, différé — mesure la valeur réelle des tests backend |

**Paiements — où est la vérité, dans cet ordre** : le **code livré** (`src/lib/shop/`,
`src/app/api/checkout/`, `src/app/api/stripe-webhook/`), puis sa spec **`docs/specs/boutique.md`**
(LOT 2, validée — T1 à T4 livrées et testées). En cas de désaccord entre un document et le code,
**le code a raison**.

Les trois faits qui évitent de faire du travail inutile :

- **Stripe Checkout en redirection pleine page** — aucun script Stripe sur notre domaine, donc
  **zéro ajout CSP** et zéro cookie tiers. Ce n'est pas un raccourci : c'est le choix documenté.
- **Activer un moyen de paiement = un réglage du dashboard Stripe.** `src/lib/shop/stripe.ts` ne
  fixe **volontairement pas** `payment_method_types` (son commentaire le dit). PayPal en fait
  partie. Aucun code, aucun composant, aucune CSP à écrire pour ça.
- **Pas de base de données, et c'est une règle permanente** (`CLAUDE.md`, règle Alure n°4) : la
  source de vérité des commandes est Stripe, le webhook ne fait que notifier par email. Ne
  présente jamais l'absence de BDD comme un manque à combler.

`docs/architecture/PAIEMENTS.md` complète avec les faits Stripe vérifiés et la doctrine de sécurité ;
`docs/adr/001-paiements-stripe.md` consigne la décision. Les specs `docs/specs/paiement-*.md`
documentent des moyens **non encore activés** : elles ne décrivent aucun code à écrire — un moyen de
paiement s'active au dashboard. Plusieurs sont explicitement **« sans objet aujourd'hui »**
(fractionné, SEPA, moyens locaux européens) avec le déclencheur qui les rouvrirait ; ne les traite
pas comme un backlog.

> Non sûr ? `web-onboarding` pour démarrer, `web-spec` puis `web-feature` pour coder, **toujours**
> `web-quality-gate` avant de dire « c'est fini », `web-audit` avant la mise en ligne,
> `web-commit` pour enregistrer.

## Les 10 règles non négociables (rappel — détail dans `CLAUDE.md`)

1. **TypeScript strict, zéro `any`** ni `@ts-ignore`.
2. **Aucun secret exposé** — `NEXT_PUBLIC_*` = public ; secrets côté serveur, jamais committés.
3. **Toute entrée externe validée** (zod partagé client/serveur) ; l'API ne relaie jamais du JSON arbitraire.
4. **Headers de sécurité complets** ; tiers ajouté = CSP mise à jour **dans le même commit**.
5. **Échec bruyant** — try/catch JSON typé, `res.ok` vérifié, états loading/vide/erreur distincts.
6. **Jamais de donnée fabriquée** dans l'UI (stat, témoignage, logo client).
7. **Images traitées AVANT intégration** — WebP, taille d'affichage réelle, `next/image` partout.
8. **Accessibilité native** — sémantique, alt, focus, clavier, contrastes, `prefers-reduced-motion`.
9. **SEO structurel à chaque page** — metadata unique, OG, sitemap, JSON-LD ; URL supprimée = 301.
10. **RGPD par défaut** — zéro tracker avant consentement, fonts self-hosted, pages légales,
    textes conformes à la charte de ton (`docs/standards/UI-COPY.md`).

## Le contrat de qualité

- **Le gate** : `npx tsc --noEmit`, `npx eslint .`, `npm run test`, `npm run build`, puis
  **vérification navigateur réelle**. Rien ne sort sans ça vert. Voir `web-quality-gate`.
- **Pas d'over-engineering** : pas de CMS headless, de state manager ou d'archi exotique « au cas
  où ». Server Components + un peu de client suffit jusqu'à preuve du contraire.
- **Faits web volatils** (versions, Tailwind v4, CSP/Next, pièges datés) : dans
  `docs/standards/WEB-REFERENCE.md`, **à vérifier contre la doc officielle** — jamais gravés de mémoire.

## Discipline de commit — proposer & faire valider (ne jamais committer seul)

À la **fin de chaque tâche/partie**, tu **proposes** un plan de commits atomiques par partie
(`content` / `ui` / `logic` / `api` / `seo` / `config` / `docs`), sujet court `<LOT>-<partie>` +
rapport non-technique, puis tu attends la **validation** avant d'exécuter. Détail : invoque `web-commit`.

---

**En résumé** : lis `CLAUDE.md` + `PROGRESS.md`. Pour coder, `web-spec` → `web-feature`. Avant
« fini », `web-quality-gate`. Avant la mise en ligne, `web-audit`. Si un doute sur une donnée
personnelle, un tracker ou un contenu légal : arrête-toi et demande.
