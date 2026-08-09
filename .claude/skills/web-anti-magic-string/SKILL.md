---
name: web-anti-magic-string
description: >-
  Élimine les valeurs littérales dont le sens n'est pas évident (magic strings, magic numbers,
  booléens positionnels) et impose le bon TYPE au bon endroit (montant en centimes entiers, date,
  identifiant, URL). À invoquer dès qu'on écrit ou relit du code contenant un littéral discriminant :
  statut, rôle, route, clé de storage, code HTTP, seuil, durée, devise, montant, type MIME, code
  d'erreur, nom d'événement analytics, token de design. S'applique au front comme aux routes API.
---

# web-anti-magic-string — nommer les valeurs, choisir le bon type

Deux problèmes distincts, souvent confondus :

1. **La valeur n'est pas nommée** → on ne sait pas ce que `"pending"` ou `3000` veut dire.
2. **Le type est le mauvais** → un montant en `number` flottant, une date en `string`, un ID en
   `string` nue. Là, nommer ne suffit pas : il faut changer de type.

Le second est le plus cher, et il est **mesuré ici, pas raconté** : au prix réel du site,
`21.99 * 5` vaut **`109.94999999999999`** en flottant (vérifié dans Node). En centimes entiers,
`2199 * 5` vaut `10995`. Ça ne se corrige pas en renommant.

> Marques utilisées ici : **LIVRÉ** = vérifié dans le dépôt le 2026-08-05 · **PROPOSITION** =
> modèle utile, **le fichier n'existe pas** aujourd'hui. Ne cite jamais une PROPOSITION comme si
> c'était une convention en place : le skill mentirait sur le dépôt.

## 1. Quand nommer — la règle de décision

Un littéral **reste acceptable** si les trois conditions sont vraies :

1. il n'apparaît **qu'une seule fois** ;
2. son sens est **évident dans le contexte** ;
3. il ne sera **jamais comparé** ailleurs.

Sinon : constante nommée ou union de littéraux.

**Union `as const` vs constante isolée** — la question qui tranche :
> « Ajouter une valeur oblige-t-il à modifier le reste du code ? »
> **Oui** → union `as const` (ensemble fermé, exhaustivité vérifiée par TS).
> **Non** → constante simple (config, seuil, durée).

```ts
// ✅ ensemble fermé : le compilateur vérifie l'exhaustivité
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

// ✅ config : ajouter un seuil ne change rien ailleurs
export const RATE_LIMIT_MAX = 10
export const RATE_LIMIT_WINDOW_MS = 60_000
```

> ⚠️ L'exemple `PAYMENT_STATUS` est une **illustration de forme**, pas du code de ce dépôt : il n'y
> a **aucun statut de commande applicatif** ici (pas de BDD — règle Alure n°4, la source de vérité
> est le dashboard Stripe). Ne l'introduis pas « pour faire bien » : voir `web-illegal-states`.

**Ce que le dépôt fait déjà — LIVRÉ.** On étend ce modèle, on ne le contredit pas :

| Constante | Fichier | Valeur | Ce qu'elle protège |
|---|---|---|---|
| `PRODUCT.unitAmountCents` | `src/lib/shop/product.ts` | `2199` | Le prix, en centimes, source unique |
| `PRODUCT.quantityMin` / `quantityMax` | `src/lib/shop/product.ts` | `1` / `5` | Les bornes, lues par le schéma zod |
| `CHECKOUT_MAX_BYTES` | `src/lib/shop/checkout-schema.ts` | `1_000` | Plafond de payload de `/api/checkout` |
| `CONTACT_MAX_BYTES` | `src/lib/contact-schema.ts` | `20_000` | Idem pour `/api/contact` |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | `src/app/api/checkout/route.ts` | `10` / `60_000` | Rate-limit checkout |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | `src/app/api/contact/route.ts` | `5` / `60_000` | Rate-limit contact |
| `PROCESSED_MAX` | `src/app/api/stripe-webhook/route.ts` | `1000` | Borne du `Set` d'IDs d'événements traités |
| `DURATION` / `EASE_*` / `SHIFT` | `src/lib/motion.ts` | — | Les 3 durées et 2 courbes motion |

Deux détails qui valent une leçon :

- Les deux `RATE_LIMIT_MAX` **diffèrent volontairement** (10 pour l'achat, 5 pour le contact). C'est
  exactement pourquoi ce sont des constantes **locales à leur route** et non un réglage global
  partagé : centraliser aurait forcé une valeur unique, donc un mauvais réglage sur l'une des deux.
- Le plafond de taille est vérifié **deux fois** (en-tête `content-length` **et** longueur réelle du
  corps) contre la **même** constante. Une seule source, deux points de contrôle — pas deux nombres.

## 2. Ce qui doit être nommé dans CE projet

| Catégorie | Exemples ici | Où ça vit |
|---|---|---|
| Données produit (prix, bornes, coloris, délai) | `2199`, `1`/`5`, `'10 à 20 jours ouvrés'` | **LIVRÉ** — `src/lib/shop/product.ts`, source unique |
| Durées & seuils | fenêtre de rate-limit, plafond de payload, borne d'idempotence | **LIVRÉ** — constantes `*_MS` / `*_MAX_BYTES` / `*_MAX` près de leur route |
| Codes HTTP | `400`, `413`, `429`, `500`, `503` | Littéral **accepté** dans un `NextResponse.json` : unique et évident sur place (c'est ce que font les 3 routes) |
| Erreurs de configuration | secret Stripe / Resend absent | **LIVRÉ** — classes typées dans `src/lib/shop/errors.ts`, jamais une chaîne comparée |
| Tokens de design (couleurs, rayons, ombres, échelle) | `#071128`, `1rem`, `--text-stat` | **LIVRÉ** — `src/app/globals.css` `@theme`. Zéro hex en TS (vérifié : 0 occurrence) |
| Tokens motion (durées, courbes) | `0.28`, `cubic-bezier(0.22, 1, 0.36, 1)` | **LIVRÉ** — `globals.css` **et** `src/lib/motion.ts`, miroir assumé (voir ci-dessous) |
| Statuts / états métier | état de l'îlot d'achat | union discriminée près de la logique — cf. `web-illegal-states` |
| Routes internes & endpoints | `/leurre`, `/merci`, `/api/checkout` | **PROPOSITION** `src/lib/routes.ts` — n'existe pas, et ne se justifie pas encore (voir §4) |
| Clés de storage | `localStorage` / cookie | **PROPOSITION** `src/lib/storage-keys.ts` — n'existe pas ; le site n'utilise **aucun** storage client aujourd'hui |
| Variables d'env | `STRIPE_SECRET_KEY`, `RESEND_API_KEY` | **PROPOSITION** `src/lib/env.ts` — n'existe pas ; le dépôt utilise un autre pattern, décrit plus bas |
| Codes d'erreur applicatifs | ce que la route renvoie au client | union `as const` partagée client/serveur, si un jour le client doit les distinguer |
| Types MIME | `image/webp`, `application/json` | constante si comparé |
| Événements analytics | **aucun analytics branché** à ce jour (Vercel Analytics prévu au LOT 4) | union `as const` le jour où il y en aura |

**Les tokens de design ne se dupliquent pas en TS — vérifié.** Après l'intégration de la charte
V.02, `globals.css` porte plus de rôles qu'avant (`--color-prose-foreground`, `--color-danger-text`
distinct de `--color-danger`, `--color-success`, `--color-info`, `--color-ring`, `--color-scrim`,
plus `--radius-card` / `--radius-row`, les `--shadow-*`, les `--ease-*` et l'échelle
`--text-stat` / `--text-label`). Tous vivent dans `@theme` ; un composant utilise la classe Tailwind
ou `var(--color-…)`. Une recherche de littéral hexadécimal dans `src/**/*.ts(x)` renvoie **zéro
résultat** — c'est l'état à préserver.

Trois nuances réelles, à connaître avant de « corriger » quelque chose qui est volontaire :

- `--gradient-scrim` et les durées `--dur-micro` / `--dur-element` / `--dur-page` sont dans `:root`,
  **hors `@theme`** : elles sont consommées par les classes `px-*` et par `motion.ts`, pas par des
  utilitaires Tailwind. Ce n'est pas un oubli.
- `src/lib/motion.ts` **duplique** les 3 durées et 2 courbes en TS, et le dit
  (« miroir exact des variables CSS »). C'est le **seul** miroir toléré, parce que framer-motion a
  besoin de nombres JS, pas de `var()`. Conséquence : on modifie **les deux** ou aucun.
- **À VÉRIFIER** : la barre d'achat collante de `BuyBox.tsx` porte une ombre en valeur arbitraire
  Tailwind (`shadow-[0_-10px_26px_-14px_rgb(2_6_16/0.45)]`) — une ombre **montante**, qu'aucun des
  trois `--shadow-*` ne couvre. Ce n'est pas un hex en dur, mais c'est une couleur qui ne vient pas
  d'un token : si la charte la sanctionne, elle mérite son propre `--shadow-*` ; sinon, c'est la
  dérive exacte que ce skill sert à rattraper.

**Variables d'environnement — ce que fait le dépôt (LIVRÉ), et pourquoi.**

Il n'y a **pas** de module `env.ts`. Chaque secret est lu au point d'usage, et son absence lève une
**erreur typée** que la route traduit en réponse bruyante :

```ts
// src/lib/shop/stripe.ts — LIVRÉ
const key = process.env.STRIPE_SECRET_KEY
if (!key) throw new PaymentNotConfiguredError()   // → la route répond 503, log explicite
```

Secrets réellement utilisés : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`RESEND_FROM`, `ORDER_NOTIFICATIONS_EMAIL`. Aucun `NEXT_PUBLIC_*`, aucune valeur de repli sur un
secret : `fromAddress()` a un défaut, mais c'est une **adresse d'expéditeur**, pas un secret.

L'intérêt de ce pattern paresseux ici : une clé Resend manquante ne doit pas empêcher la vitrine de
rendre — elle doit faire échouer **bruyamment** la seule route concernée. Un module `env.ts` qui
valide tout à l'import ferait tomber le site entier pour une clé qui ne sert qu'au checkout.

**PROPOSITION** (modèle, à n'introduire que si le nombre de secrets devient ingérable — pas
aujourd'hui) :

```ts
// src/lib/env.ts — N'EXISTE PAS dans ce dépôt : modèle proposé, serveur uniquement
function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`)
  return value
}
```

Dans les deux cas, la règle est la même : **jamais de valeur de repli sur un secret**, et une
absence se voit (règle n°5 : échec bruyant).

## 3. Le bon type au bon endroit (la partie qui coûte cher)

| Besoin | ❌ Mauvais | ✅ Bon |
|---|---|---|
| **Montant** | `21.99` (float), `"21,99 €"` | **entier en centimes + devise** : `{ unitAmountCents: 2199, currency: 'eur' }` |
| Date / heure | `"2026-08-05"` comparée | `Date`, et formatage **déterministe** (locale + timezone explicites) |
| Identifiant | `string` nue | branded type **si** confusion possible (voir ci-dessous) |
| URL construite | concaténation `+` | `new URL()` + `searchParams.set()` |
| Donnée structurée reçue | `JSON.parse` casté | parse **validé** au point d'entrée (zod) |
| Regex complexe | inline | constante nommée + commentaire d'intention |
| Lookup fréquent | `array.includes()` | `Set.has()` |
| Drapeaux combinés | `"readonly-compact-dark"` | objet d'options explicite |

### Montants — la règle absolue, et son application LIVRÉE

**Un montant est un entier de centimes, jamais un flottant.** Stripe raisonne dans la plus petite
unité monétaire (`unit_amount: 2199` = 21,99 €). Le flottant se glisse dans un total et produit un
écart d'un centime que personne ne retrouve.

Le dépôt applique ça de bout en bout — c'est le meilleur exemple disponible, il est réel :

```ts
// src/lib/shop/product.ts — LIVRÉ
unitAmountCents: 2199,                    // 21,99 € port inclus, TVA non applicable (293 B du CGI)

/** Total d'une commande en centimes — l'unique endroit où un montant se calcule. */
export function totalCents(quantity: number): number {
  if (!Number.isInteger(quantity)) throw new Error(`Quantité non entière : ${quantity}`)
  if (quantity < PRODUCT.quantityMin || quantity > PRODUCT.quantityMax) {
    throw new Error(`Quantité hors bornes : ${quantity}`)
  }
  return PRODUCT.unitAmountCents * quantity
}

/** Formatage d'un montant en centimes pour l'affichage : 2199 → « 21,99 € ». */
export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
```

Ce qu'il faut en retenir, et ne jamais casser :

- **Un seul endroit multiplie.** `totalCents()` est la seule multiplication de montant du dépôt,
  et elle **lève** sur une quantité hors bornes plutôt que de retourner un total faux.
- **La division n'arrive qu'au bord.** `formatEuros()` (affichage) et
  `(PRODUCT.unitAmountCents / 100).toFixed(2)` dans `src/lib/shop/jsonld.ts` (Schema.org exige une
  chaîne décimale) sont les deux seules sorties. Aucune de ces valeurs n'est **re-lue** pour
  recalculer quoi que ce soit.
- **Le client n'envoie jamais de montant.** Le corps de `/api/checkout` ne contient que
  `{ coloris, quantite }` ; le prix vient de `PRODUCT.unitAmountCents` côté serveur. Un montant
  transmis par le navigateur ne serait pas une valeur mal typée : ce serait une faille.
- **Le webhook relit le montant chez Stripe** (`session.amount_total`, déjà en centimes) pour
  l'email — il ne le recalcule pas.

### Identifiants — branded types quand la confusion est possible

Dès que deux identifiants de même type primitif peuvent être **inversés silencieusement** dans une
signature, on les distingue au niveau du type :

```ts
type Brand<T, B extends string> = T & { readonly __brand: B }
export type CheckoutSessionId = Brand<string, 'CheckoutSessionId'>
```

**Aucun branded type n'existe dans ce dépôt aujourd'hui, et c'est correct** : le seul identifiant
manipulé est le `sessionId` de Stripe (`OrderSummary` dans `src/lib/shop/emails.ts`), sans voisin
confondable. Le déclencheur pour en introduire un : **deux identifiants du même type primitif côte
à côte dans une signature**. Avant ça, c'est de la cérémonie.

## 4. Ce qu'il ne faut PAS abstraire (sur-ingénierie)

```ts
// ✅ ces littéraux restent des littéraux
console.error('POST /api/contact : livraison non configurée.')  // message unique
array.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))          // argument d'API
const utilisateurDeTest = { nom: 'Marie Dupont' }                // fixture de test
```

Ne crée pas non plus :

- une constante pour une chaîne utilisée une fois dans un log ;
- un branded type pour un identifiant qui n'a aucun voisin confondable ;
- un fichier `constants.ts` monolithique — on groupe **par domaine**. Le dépôt le fait déjà :
  `src/lib/shop/` (produit, schéma, Stripe, emails, erreurs, JSON-LD), `src/lib/site-config.ts`,
  `src/lib/legal-config.ts`, `src/lib/motion.ts` ;
- **`src/lib/routes.ts` aujourd'hui** : les chemins littéraux sont peu nombreux et localisés
  (`success_url` / `cancel_url` dans `stripe.ts`, un `fetch('/api/checkout')` dans `BuyBox.tsx`,
  les `<Link>` des pages). Le déclencheur honnête : le jour où une même route est écrite à la main
  dans **trois** fichiers, ou qu'un renommage d'URL impose un 301 (règle n°9) ;
- **`src/lib/storage-keys.ts` aujourd'hui** : zéro `localStorage`, zéro cookie applicatif dans
  `src/**` (vérifié). Le déclencheur : la première clé écrite côté client.

## 5. Checklist de relecture

**Valeurs nommées**
- [ ] Aucune chaîne littérale comparée avec `===` hors constante / union `as const`
- [ ] Aucun nombre magique (hors `0`, `1`, `-1` dans un contexte évident)
- [ ] Aucun booléen passé en argument positionnel — objet d'options ou union
- [ ] Seuils et plafonds : une constante nommée, vérifiée éventuellement à plusieurs endroits, mais
      jamais deux nombres pour la même limite
- [ ] Secret absent → erreur typée / échec bruyant, jamais de valeur de repli
- [ ] Aucune couleur/rayon/ombre en dur en TS (ça vient de `@theme`) ; si tu touches une durée
      motion, tu touches `globals.css` **et** `motion.ts`

**Bon type**
- [ ] Tout montant est un **entier de centimes** ; la division n'arrive qu'à l'affichage
- [ ] Aucun montant ne vient du client — il est recalculé côté serveur depuis `product.ts`
- [ ] Les dates sont des `Date`, formatées avec locale + timezone explicites (piège hydratation,
      cf. `WEB-REFERENCE.md`)
- [ ] Les URLs dynamiques passent par `new URL()`
- [ ] Toute donnée externe est **parsée et validée** (zod), jamais castée
- [ ] Les identifiants confondables sont brandés — les autres non

**Équilibre**
- [ ] Pas de constante pour un littéral unique et évident
- [ ] Pas de fichier de centralisation créé « en avance » (routes, storage-keys, env) sans le
      déclencheur écrit au §4
- [ ] Pas de chaîne qui encode plusieurs états (→ objet d'options, ou union discriminée :
      voir `web-illegal-states`)
