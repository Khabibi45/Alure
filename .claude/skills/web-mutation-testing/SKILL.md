---
name: web-mutation-testing
description: >-
  Mesure la QUALITÉ des tests backend par le score de mutation (Stryker) au lieu de la couverture,
  sur la logique à enjeu uniquement : vérification de signature et idempotence du webhook Stripe,
  calcul de montant, validation du schéma de commande. À invoquer quand on demande « mes tests
  servent-ils à quelque chose ? », « score de mutation », « Stryker », « mutant survivant », « la
  couverture est à 100 % mais ça casse quand même », ou avant de considérer la logique de paiement
  comme fiable. OPTIONNEL : Stryker n'est pas installé, ne rejoint jamais le gate, et ne s'ajoute
  qu'avec l'accord explicite du propriétaire.
---

# web-mutation-testing — la couverture ment, le mutant ne ment pas

La couverture dit **quelles lignes s'exécutent**. Le score de mutation dit si les tests
**détectent un changement de comportement** : 100 % de couverture avec 0 % de mutation est
parfaitement possible — il suffit d'exécuter le code sans rien assurer.

Un « mutant » = une modification automatique du code (`>` → `>=`, `&&` → `||`, un `return` vidé).
Mutant **tué** = au moins un test a échoué. Mutant **survivant** = personne n'a vu la différence.

## 1. Statut dans CE dépôt : OPTIONNEL, différé, jamais dans le gate

| Fait (vérifié dans le code le 2026-08-05) | État |
|---|---|
| Stryker installé | ❌ **non**, et c'est volontaire |
| Logique à enjeu existante | ✅ **livrée** : `stripe ^22.4.0`, `src/lib/shop/` (`product.ts`, `checkout-schema.ts`, `stripe.ts`, `emails.ts`, `errors.ts`), `src/app/api/checkout/route.ts`, `src/app/api/stripe-webhook/route.ts` |
| Tests backend existants | ✅ **44 tests verts** : `shop/shop.test.ts`, `shop/emails.test.ts`, `api/checkout/route.test.ts`, `api/stripe-webhook/route.test.ts`, `api/contact/route.test.ts` |
| Idempotence du webhook | ✅ **implémentée et testée** — `Set` en mémoire borné à 1000 IDs (`api/stripe-webhook/route.ts`), couverte par deux tests (rejeu → un seul envoi ; échec d'envoi → pas de marquage, le retry ré-envoie) |
| Quand l'installer | **Décision ouverte** — la matière à muter existe ; le coût (dépendance + config + minutes de CI) reste à arbitrer par le propriétaire |

**N'installe pas Stryker par zèle**, et surtout **pas sans accord explicite du propriétaire** :
c'est un outil pour *durcir* une logique à enjeu, pas un passage obligé. **Il ne rejoint jamais le
gate quotidien** (`tsc --noEmit` + `eslint .` + `vitest run` + `next build`).

Déclencheur d'activation — tous requis, et **c'est la liste complète** :

- [ ] Le propriétaire a validé l'ajout de la dépendance et du temps machine.
- [ ] Le gate `web-quality-gate` passe déjà entièrement.
- [ ] La cible est bien la logique à enjeu (montant, signature, idempotence, validation d'entrée),
      pas « tout le dépôt ».

> **Pas de prérequis « persistance ».** `CLAUDE.md` règle Alure n°4 tranche définitivement : **pas
> de BDD ni de comptes en v1**, la source de vérité des commandes est Stripe. Le `Set` en mémoire
> est la solution retenue, assumée et documentée dans le code (doublon inter-instances = un email
> de confirmation en double, pas une double commande). L'idempotence est donc **implémentée,
> testée, et parfaitement mutable** — ce n'est ni un manque, ni un blocage, et rien ici ne doit
> rouvrir ce débat.

## 2. Périmètre strict — ce qu'on mute et ce qu'on ne mute jamais

Cohérent avec la règle du projet « **tests sur le backend uniquement** » : **ce qui n'a pas de test
n'a pas de mutant à tuer** — muter un fichier non testé produit 100 % de survivants et zéro
information.

| On mute (fichiers réels, à enjeu, déjà testés) | Pourquoi |
|---|---|
| `src/app/api/stripe-webhook/route.ts` — vérification de signature | Une faille silencieuse ici = un webhook forgé traité comme un paiement réel |
| `src/app/api/stripe-webhook/route.ts` — idempotence (`processedEventIds`, `markProcessed`) | Stripe peut re-livrer un événement ; une dédup cassée = emails en double, ou pire, un marquage avant l'envoi qui perdrait une confirmation |
| `src/lib/shop/product.ts` — `totalCents`, bornes de quantité, `orderableError` | C'est **le seul endroit où un montant se calcule**. Un opérateur inversé = un chiffre faux facturé ; une borne relâchée = une commande hors 1-5 |
| `src/lib/shop/checkout-schema.ts` — bornes et enum dérivés de `PRODUCT` | Ce n'est pas un DTO décoratif : c'est la **frontière** qui empêche une quantité invalide d'atteindre `totalCents`. Les bornes viennent de `PRODUCT.quantityMin/Max`, l'enum des coloris réels |
| `src/app/api/checkout/route.ts` — gardes d'entrée et mapping d'erreur | Quatre branches renvoient 400, plus 413 / 429 / 503 / 500 : un `>` inversé ou un `catch` élargi rend une garde inopérante sans faire rougir un test faible |

| On NE mute PAS | Pourquoi |
|---|---|
| `src/lib/shop/stripe.ts` | **Aucun test direct aujourd'hui** : il est mocké dans les deux route.test.ts. Le muter donnerait 100 % de survivants — du bruit, pas un diagnostic. À rouvrir **si** un test direct est écrit (`returnBaseUrl` le mériterait : `SITE.url` en production, jamais l'en-tête `Host`) |
| Composants, pages, JSX | Aucun test dessus par décision du propriétaire ; ne propose jamais de test de composant |
| `src/lib/shop/emails.ts` | Gabarits de texte : un mutant y déplace une chaîne, pas un comportement à enjeu. Les règles qui comptent (délai ré-affiché, échappement HTML) sont déjà assertées |
| `site-config.ts`, `legal-config.ts`, contenu, tokens de design | Données, pas comportement |
| Fichiers de test eux-mêmes | Non-sens : ils sont l'oracle |
| Code appelant réellement Stripe ou Resend | Stryker rejoue la suite des dizaines de fois — les SDK doivent rester **mockés**, jamais de clé réelle ni d'appel réseau dans une campagne (règle n°2 du kit) |

Nommage : la tranche de paiement existe déjà et vit dans **`src/lib/shop/`** (règle Alure n°2 de
`CLAUDE.md`) + les deux routes ci-dessus — voir `web-backend`. Le `mutate` cible ces fichiers-là,
pas un `src/features/` qui n'existe pas.

> **Activer un moyen de paiement ne crée aucune matière à muter.** L'intégration est Stripe
> Checkout en redirection pleine page, et `payment_method_types` n'est délibérément pas fixé :
> ouvrir PayPal ou un portefeuille est un **réglage de dashboard Stripe**, pas une modification de
> code. Ni le schéma, ni le calcul de montant, ni le webhook ne changent — donc ni le périmètre de
> mutation, ni le score.

Prérequis de qualité en amont : montants typés en centimes (`web-anti-magic-string`), états en
union fermée (`web-illegal-states`), tests backend écrits selon `web-tests`.

## 3. Installation, le jour venu

```bash
# Paquets à vérifier contre stryker-mutator.io au moment de l'installation (ils bougent).
npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner
npm i -D @stryker-mutator/typescript-checker   # requis seulement si checkers: ['typescript']
npx stryker run                                 # campagne ponctuelle, JAMAIS dans le gate
```

Stryker **ne rejoint pas** `npm run test` ni la definition of done : trop lent.

> **Question ouverte, à trancher par le propriétaire le jour de l'installation — ne la tranche pas
> ici** : lancement **à la demande** (un agent lance `npx stryker run` avant une mise en ligne) ou
> **job CI dédié** (nocturne / pré-release, avec le coût de minutes que ça implique) ? Les deux se
> défendent ; le dépôt n'a aujourd'hui qu'une CI lint/tsc/test/build, et rien n'oblige à la
> charger. Note la décision dans `docs/PROGRESS.md` quand elle est prise.

## 4. Config de référence — `stryker.config.mjs`

> **À vérifier contre la doc Stryker au moment de l'installation** : noms d'options, plugins et
> valeurs par défaut évoluent d'une majeure à l'autre. Ce qui suit est une base d'intention.

```js
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',            // le projet teste déjà avec vitest (vitest.config.ts, env jsdom)
  checkers: ['typescript'],        // écarte les mutants qui ne compilent pas → moins de bruit
  tsconfigFile: 'tsconfig.json',

  // PÉRIMÈTRE : uniquement la logique à enjeu, et uniquement ce qui est réellement testé.
  // Ne jamais élargir « pour voir ».
  mutate: [
    'src/app/api/stripe-webhook/route.ts', // signature, idempotence, statuts de réponse
    'src/lib/shop/product.ts',             // totalCents, bornes de quantité, orderableError
    'src/lib/shop/checkout-schema.ts',     // bornes et enum dérivés de PRODUCT (la frontière d'entrée)
    'src/app/api/checkout/route.ts',       // gardes d'entrée + mapping d'erreur
    '!src/**/*.test.ts',                   // jamais les tests
    // 'src/lib/shop/stripe.ts' — volontairement absent : aucun test direct (cf. §2)
  ],

  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/index.html' }, // rapport git-ignoré

  coverageAnalysis: 'perTest',     // ne rejoue que les tests couvrant le mutant (gros gain de temps)
  incremental: true,               // ne re-teste que ce qui a changé depuis la dernière campagne
  incrementalFile: 'reports/mutation/stryker-incremental.json',
  concurrency: 4,                  // à caler sur la machine ; trop haut = flakiness

  // VALEURS DE DÉPART, non mesurées sur ce projet : à recaler après les premières campagnes (§9).
  thresholds: { high: 90, low: 80, break: 75 }, // break = code de sortie non nul sous 75 %
}
```

Ajoute `reports/` au `.gitignore` : un rapport HTML n'a rien à faire dans l'historique.

**Attendu sur `checkout-schema.ts`** : une partie des mutants y sera du bruit (chaînes de messages
zod, mutants équivalents sur des contraintes déclaratives). Ce qui compte, ce sont les mutants sur
les **bornes** et sur l'**enum dérivé**. Si la première campagne montre que le rapport bruit/signal
n'en vaut pas la peine, retire ce fichier du `mutate` et **note pourquoi** — pas en silence.

## 5. Un mutant a survécu — l'arbre de décision

Trois issues, et **une seule** consiste à écrire un test.

1. **Le changement modifie-t-il un comportement observable ?**
   → **NON** : *mutant équivalent* (ex. `i++` en `++i` isolé, un log réordonné). Impossible à
   tuer : on le **documente** sur place et on l'ignore — syntaxe à vérifier contre
   stryker-mutator.io, du type `// Stryker disable next-line all: <raison>`. Une ligne ignorée
   **sans raison écrite** est interdite, comme un `eslint-disable` de confort.
2. **OUI, mais la ligne n'est jamais atteignable ?** → *code mort*. On le **supprime**. Écrire un
   test pour un chemin impossible fige une branche morte dans le marbre.
3. **OUI, et le chemin est réel** → *lacune de test*. Écris le test ciblé (§7).

## 6. Les lacunes les plus fréquentes

| Pattern | Signe dans le rapport | Correctif |
|---|---|---|
| Assertion faible | Le mutant change la valeur, le test passe quand même | Asserter la valeur exacte, pas `toBeTruthy()` / `toBeGreaterThan(0)` |
| Borne manquante | `>` ↔ `>=` survit | Tester **les deux côtés** de la limite (n et n+1) |
| Chemin d'erreur non testé | Le `throw` / le `return 503` survit | Un test par branche d'échec (signature invalide, JSON illisible, service indisponible) |
| Condition composite non décomposée | `&&` ↔ `\|\|` survit | Un cas par opérande : (vrai,faux), (faux,vrai), (vrai,vrai) |
| Cas nul / vide non testé | `?? valeur` ou un garde survit | Tester `null`, `undefined`, chaîne vide, tableau vide |
| Valeur de retour non vérifiée | Le `return` vidé survit | Asserter ce que la fonction rend, pas seulement qu'elle ne jette pas |
| Effet de bord non vérifié | La suppression d'un appel survit | Asserter l'effet observable : le mock appelé, avec les **bons arguments**, le **bon nombre de fois** |

## 7. Écrire le test tueur — la méthode RIP

Trois conditions, toutes nécessaires :

- **R**each — le test doit **atteindre** la ligne mutée.
- **I**nfect — l'entrée doit rendre l'état **différent** entre l'original et le mutant.
- **P**ropagate — cette différence doit remonter **jusqu'à une assertion**.

Une couverture sans I ni P, c'est exactement le test qui laisse tout survivre.

Exemple réel du dépôt — `api/contact/route.ts` borne le rate-limit avec
`return recent.length > RATE_LIMIT_MAX` (`RATE_LIMIT_MAX = 5`). Le test existant :

```ts
// ❌ R et I sont là, P manque : le mutant `>` → `>=` SURVIT.
// Avec `>`  : les requêtes 6 et 7 sont en 429.
// Avec `>=` : les requêtes 5, 6 et 7 sont en 429.
// Dans les deux cas il existe au moins un 429 → l'assertion ne voit pas la différence.
expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0)
```

```ts
// ✅ la différence propage : on asserte les DEUX côtés de la borne, à leur rang exact.
const ip = '9.9.9.10' // IP dédiée : le compteur est un Map de module, partagé entre tests du fichier
const codes: number[] = []
for (let i = 0; i < 6; i++) codes.push((await POST(makeReq(valid, ip))).status)
expect(codes[4]).not.toBe(429) // 5e requête : encore autorisée avec `>`, refusée avec `>=`
expect(codes[5]).toBe(429)     // 6e requête : refusée dans tous les cas
```

`api/checkout/route.test.ts` a exactement la même faiblesse avec `RATE_LIMIT_MAX = 10` et
12 requêtes. Ces durcissements sont recensés dans `web-tests` §12 comme **recommandations non
appliquées** — une campagne de mutation ne fait que les confirmer chiffres en main.

Même méthode sur le reste du périmètre : bornes de `totalCents` (0, 1, 5, 6), rejeu d'un même
`event.id`, plafond `CHECKOUT_MAX_BYTES` et sa taille + 1. **Toujours n et n+1**, jamais « un cas
au milieu ». Le style d'assertion attendu (statut ET corps, valeurs exactes) est celui de
`web-tests`.

## 8. Anti-patterns bannis

- Écrire un test **uniquement** pour tuer un mutant, sans énoncer une règle métier vraie. Un test
  doit se lire comme une exigence, pas comme une réponse à un outil.
- Ignorer en masse un opérateur (`mutator.excludedMutations`) pour faire monter le score. C'est du
  maquillage : le score devient un chiffre faux — exactement ce que le kit interdit.
- Viser 100 %. Les mutants équivalents le rendent structurellement impossible.
- Muter les fichiers de test, les composants, ou un fichier qu'aucun test ne couvre.
- Faire tourner une campagne avec de vraies clés Stripe/Resend ou un vrai réseau : les SDK sont
  mockés, point.
- Affaiblir une assertion pour « stabiliser » une campagne. Un test qui n'assure plus rien ment sur
  la sécurité — pire que pas de test.
- Conclure d'un survivant qu'il faut **changer l'architecture**. Un mutant signale une lacune de
  test, jamais un besoin de stockage ou de dépendance supplémentaire.

## 9. ROI — jusqu'où monter

Le rendement décroît : les premiers mutants tués révèlent de vraies lacunes, les derniers coûtent
plus qu'ils ne rapportent. **Aucun seuil chiffré n'est gravé ici** — il n'en existe aucun de mesuré
sur ce projet, et un pourcentage inventé serait exactement le « chiffre faux » que le kit interdit.
Le point de bascule se constate sur les deux ou trois premières campagnes, puis se note dans
`docs/PROGRESS.md`. Les `thresholds` du §4 sont une **valeur de départ à valider**, pas un objectif.

- **Exception, où l'on vise haut** : **vérification de signature du webhook** et **idempotence**.
  Un mutant survivant là = un scénario où un webhook forgé passe, ou une commande payée reste sans
  email. Ici, un survivant non justifié est **bloquant**, pas une statistique.

Le score est un indicateur de conversation, jamais un objectif de tableau de bord : on regarde ce
que les survivants racontent, on ne compare pas deux modules entre eux.

## 10. Checklist de fin de campagne

- [ ] Le déclencheur d'activation (§1) était réuni — accord explicite du propriétaire compris. Sinon, on n'installe rien.
- [ ] `mutate` ne contient que la logique à enjeu **déjà testée** ; aucun composant, aucun fichier non couvert, aucun test.
- [ ] Aucune clé réelle, aucun appel réseau pendant la campagne.
- [ ] Chaque survivant est classé : équivalent (documenté) / code mort (supprimé) / lacune (test écrit).
- [ ] Zéro survivant non justifié sur la vérification de signature et sur l'idempotence.
- [ ] Aucun test ajouté sans règle métier lisible derrière ; aucune assertion affaiblie.
- [ ] Aucune exclusion de mutateur ajoutée pour gonfler le score.
- [ ] Aucune conclusion du type « il faudrait persister » : la règle Alure n°4 n'est pas rouverte par un rapport d'outil.
- [ ] `reports/` git-ignoré ; le rapport HTML n'est pas committé.
- [ ] Le gate `web-quality-gate` repasse vert après les tests ajoutés.
- [ ] `docs/PROGRESS.md` note ce que la campagne a réellement corrigé (pas le score seul), et la décision « à la demande vs job CI » si elle a été prise.
