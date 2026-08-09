---
name: web-backend
description: >-
  Écrit et relit le SEUL backend de ce site : les route handlers Next.js (`src/app/api/**/route.ts`)
  et la logique serveur de `src/lib/`. À invoquer dès qu'on touche à une route API, un webhook, une
  vérification de signature, une idempotence, un calcul de montant, un mapping de statut, un secret
  d'environnement — et pour toute la partie paiement (Stripe, Checkout Session, moyens de paiement).
  Impose le module par domaine (`src/lib/shop/`), l'adaptateur HTTP mince, les erreurs typées,
  l'échec bruyant et les garde-fous d'entrée déjà en place sur les trois routes livrées.
---

# web-backend — les route handlers sont le seul back

Ici, **« backend » = `src/app/api/**/route.ts` + la logique serveur de `src/lib/`**. Pas de serveur
séparé, pas de service à part, pas de `src/features/`. Une seule application Next.js.

**Trois routes existent, testées, en place. Ce sont les modèles : on les étend, jamais on ne les
contredit.** Tout ce qui suit décrit le code réel au 2026-08-05 — si un exemple d'ici diverge du
code, **le code a raison**.

| Route livrée | Rôle | Logique serveur | Tests |
|---|---|---|---|
| `src/app/api/contact/route.ts` | formulaire public → Resend | `src/lib/contact-schema.ts` | `route.test.ts` |
| `src/app/api/checkout/route.ts` | crée la session Stripe Checkout | `src/lib/shop/` | `route.test.ts` |
| `src/app/api/stripe-webhook/route.ts` | webhook signé → emails de commande | `src/lib/shop/` | `route.test.ts` |

## 1. Où vit la logique — un DOSSIER MODULE par domaine

**Règle Alure n°2 (`CLAUDE.md`) : toute la logique commande vit dans `src/lib/shop/`.** Pas une
préférence esthétique : `PRODUCT.md` désigne ce module comme **le point de greffe d'une migration
Shopify** (« un seul module à rebrancher »). Un composant qui calculerait un prix, ou une route qui
appellerait le SDK Stripe en direct, casse cette promesse.

Le module **existe** — on l'étend, on ne réinvente pas son arborescence :

| Fichier réel | Rôle | Connaît HTTP ? |
|---|---|---|
| `src/lib/shop/product.ts` | source de vérité produit : `PRODUCT`, `getColorway()`, `totalCents()`, `orderableError()`, `formatEuros()` | non |
| `src/lib/shop/checkout-schema.ts` | schéma zod **partagé** client + serveur + `CHECKOUT_MAX_BYTES` | non |
| `src/lib/shop/stripe.ts` | **le seul** import du SDK Stripe : `createCheckoutSession()`, `verifyWebhookEvent()` | non |
| `src/lib/shop/errors.ts` | erreurs typées, isolées pour que les tests mockent `stripe.ts` sans casser les `instanceof` | non |
| `src/lib/shop/emails.ts` | Resend + gabarits **purs** exportés (testables sans réseau) | non |
| `src/lib/shop/jsonld.ts` | JSON-LD produit, dérivé de `PRODUCT` | non |
| `src/lib/shop/shop.test.ts` · `emails.test.ts` | tests vitest, **à côté** du code testé | non |
| `src/app/api/<route>/route.ts` | adaptateur HTTP mince | oui, et lui seul |

Hors commerce, une petite feature sans tiers à isoler tient dans un **fichier à plat** de `src/lib/`
(`contact-schema.ts` ↔ `api/contact/route.ts`). Dès qu'un domaine a plusieurs fichiers ou isole un
tiers, il devient **un dossier module**, comme `shop/`. **Aucun `src/features/`, jamais.**

**Tests : backend uniquement** (route, schéma, signature, idempotence, montant, statut), jamais de
composant ni de page — **voir `web-tests`**.

## 2. Le route handler est un ADAPTATEUR — le code réel

Il traduit HTTP ↔ logique, et ne contient **aucune** règle métier. Extrait fidèle de
`src/app/api/checkout/route.ts` :

```ts
export async function POST(request: NextRequest) {
  try {
    // … rate-limit 429, plafond de taille 413, JSON.parse gardé 400 : le pipeline du §3 …
    const parsed = checkoutSchema.safeParse(json)                 // 1. la FORME
    if (!parsed.success) return NextResponse.json(
      { error: 'Commande invalide.', issues: parsed.error.flatten().fieldErrors }, { status: 400 })

    const unorderable = orderableError(parsed.data.coloris)       // 2. la RÉALITÉ métier
    if (unorderable) return NextResponse.json({ error: unorderable }, { status: 400 })

    const url = await createCheckoutSession(parsed.data, request.nextUrl.origin)
    return NextResponse.json({ url })                             // l'îlot client navigue dessus
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) { /* log sans payload */
      return NextResponse.json({ error: 'Le paiement est momentanément indisponible…' }, { status: 503 }) }
    console.error('POST /api/checkout : échec de création de session Stripe.', error)
    return NextResponse.json({ error: 'Le paiement est momentanément indisponible…' }, { status: 500 })
  }
}
```

- **Sortie `{ url }`, pas un 303** : un `fetch` ne peut pas suivre une redirection cross-origin vers
  Stripe, donc la route rend l'URL et l'îlot client navigue (note T2 de `docs/specs/boutique.md`).
- **Un seul `try/catch`, en fin de route**, qui mappe les erreurs typées vers un statut (§5).
- **Aucune donnée client dans les logs** — on logge l'événement, jamais le payload.

**Le trio d'échec bruyant** (`WEB-REFERENCE.md`) : `try/catch` retournant du **JSON** (sinon Next
renvoie du HTML et le `res.json()` client plante) · côté client, `res.ok` **avant** `res.json()` ·
rendu statique — un fetch au build fige les données (`revalidate`, ou fetch client assumé avec états
loading/vide/erreur).

## 3. Le pipeline d'entrée obligatoire, et la validation en DEUX temps

Ordre exact, appliqué sur `api/contact` et `api/checkout` — toute nouvelle route POST publique le
reprend tel quel :

| # | Étape | Échec |
|---|---|---|
| 1 | rate-limit par IP (`RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` ; 10/min sur checkout) | `429` + `Retry-After` |
| 2 | plafond de taille : en-tête `content-length` **puis** longueur réelle du texte lu | `413` |
| 3 | `JSON.parse` dans un `try/catch` | `400` « JSON invalide. » |
| 4 | `safeParse` du schéma zod **partagé** (clés inconnues retirées) | `400` + `issues` |
| 5 | **règle métier réelle** : `orderableError()` sur checkout ; honeypot `website` sur formulaire public | `400` métier / faux succès pour le bot |
| 6 | ne relayer que `parsed.data` ; `console.error` **sans le payload** | — |

L'étape 2 se fait en deux temps parce que l'en-tête est déclaratif : un client peut mentir.

**Les étapes 4 et 5 sont deux validations différentes, les deux nécessaires.** `checkoutSchema` valide
**la forme** (coloris ∈ liste connue, quantité entière 1-5) : statique, dérivée de `PRODUCT`, partagée
avec le client. `orderableError()` valide **la réalité métier** : le coloris existe *et* est
disponible — une disponibilité se bascule à la main (`available: false`), elle n'a rien à faire dans
un schéma. Un schéma vert ne veut donc pas dire « commande passable ». Ne jamais fusionner les deux.

> zod : `package.json` porte `zod ^3.25.76` au 2026-08-05, `WEB-REFERENCE.md` annonce 4.x. N'écris
> aucune API spécifique à une version : reste sur ce qu'utilisent les routes livrées (`safeParse`,
> `error.flatten().fieldErrors`).

## 4. Le montant se recalcule côté serveur — règle établie, pas objectif

Le client n'envoie que `{ coloris, quantite }`. **Le prix ne traverse jamais le réseau depuis le
navigateur.** `stripe.ts` reconstruit la ligne à partir de `PRODUCT` :

```ts
line_items: [{ quantity: input.quantite, price_data: {
  currency: PRODUCT.currency, unit_amount: PRODUCT.unitAmountCents, /* … */ } }],
```

- **Montants en centimes entiers, partout** — l'euro flottant produit des erreurs d'arrondi.
  `totalCents()` est le seul endroit où un total se calcule, `formatEuros()` le seul où il devient
  du texte. `totalCents()` **lève** hors bornes : invariante de programmation, pas entrée
  utilisateur (celle-là est déjà refusée en 400 par le schéma).
- Même discipline sur les URLs de retour : `returnBaseUrl()` utilise `SITE.url` en production,
  **jamais l'en-tête `Host`** — sinon open redirect après paiement.

## 5. Le pattern d'erreur du projet : des erreurs TYPÉES, mappées dans le `catch`

`src/lib/shop/errors.ts` définit le vocabulaire des pannes, et rien d'autre. Le module qui isole le
tiers les lève ; la route les attrape et les mappe :

| Erreur | Levée par | Statut | Pourquoi |
|---|---|---|---|
| `PaymentNotConfiguredError` | `stripe.ts` (clé absente) | `503` | config incomplète de notre côté |
| `WebhookNotConfiguredError` | `stripe.ts` (secret absent) | `503` | on ne peut pas vérifier |
| `WebhookSignatureError` | `stripe.ts` (signature fausse) | `400` | la requête est mauvaise |
| `EmailNotConfiguredError` | `emails.ts` | `500` (webhook) | Stripe doit re-livrer |

**Une panne nommée, un statut distinct, jamais un faux succès.** « Signature invalide » et « secret
manquant » ne sont pas la même panne et ne rendent pas le même code. Ces classes vivent dans leur
propre fichier pour une raison concrète : les tests mockent `stripe.ts`, et un `instanceof` continue
de fonctionner parce que la classe ne vient pas du module mocké.

**Et l'union discriminée ?** Elle reste la bonne forme pour **modéliser un état** (îlot client,
résultat consommé par plusieurs appelants) — sujet de `web-illegal-states`. Elle n'est **pas** la
forme des routes ici : la logique lève une erreur typée, la route retourne tôt sur chaque refus, le
`catch` final mappe. **Ne réécris pas les routes livrées** pour introduire un `Outcome`.

## 6. Interdits

- **`throw` pour un refus utilisateur attendu** — coloris épuisé, quantité hors bornes : ce sont des
  **retours tôt** avec un statut (`orderableError()` retourne un message, il ne lève pas). Le `throw`
  est réservé aux pannes et aux invariantes de programmation.
- **`try/catch` autour d'une validation attendue** — une entrée invalide n'est pas un incident.
- **Avaler une exception** (`catch {}`, repli silencieux, `?? 0` sur un montant) ou servir **un faux
  succès** : tiers non configuré ou en panne → `503`/`500`, jamais un `{ success: true }`.
- **Relayer du JSON arbitraire** non validé, ou **importer le SDK Stripe en valeur** hors de
  `shop/stripe.ts` (un `import type Stripe from 'stripe'` pour typer un événement, comme le fait la
  route webhook, est effacé à la compilation : ce n'est pas une fuite du tiers).
- `any`, `@ts-ignore`, `eslint-disable` de confort.

## 7. Webhook Stripe — la forme livrée, à respecter

`src/app/api/stripe-webhook/route.ts`, adossé à `verifyWebhookEvent()`. Ce webhook **ne fait que
notifier** : deux emails, aucune commande à persister (la source de vérité, c'est Stripe).

```ts
const signature = request.headers.get('stripe-signature')
if (!signature) return NextResponse.json({ error: 'Signature absente.' }, { status: 400 })
const rawBody = await request.text()      // CORPS BRUT — JAMAIS request.json()
event = verifyWebhookEvent(rawBody, signature)   // → WebhookSignatureError (400) | WebhookNotConfiguredError (503)

if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true })  // 200 immédiat
if (processedEventIds.has(event.id)) return NextResponse.json({ received: true, duplicate: true })

const order = toOrderSummary(event.data.object)
if (!order) { console.error(`… session ${event.data.object.id} sans données exploitables`)
  return NextResponse.json({ received: true, skipped: true }) }   // 200 : re-livrer ne réparera rien

try { await sendOrderEmails(order); markProcessed(event.id); return NextResponse.json({ received: true }) }
catch { return NextResponse.json({ error: 'Envoi des emails échoué.' }, { status: 500 }) }  // 500 VOULU → Stripe re-livre
```

Les quatre décisions à ne pas inverser : **en-tête `stripe-signature` absent → `400`** avant même de
lire le corps · **`await request.text()`** (le moindre re-parse/re-stringify casse la signature) ·
**événement non traité → `200` immédiat** (sinon Stripe le re-livre en boucle) · **échec d'email →
`500` volontaire**, et l'événement n'est marqué traité **qu'après** l'envoi réussi — une commande
payée ne reste jamais silencieusement sans email.

Faits officiels (vérifiés le 05/08/2026 contre `docs.stripe.com/webhooks`) :

- Signature = **HMAC SHA-256** sur le corps brut, comparaison à temps constant, **tout schéma autre
  que `v1` ignoré**. En rotation, deux secrets peuvent être actifs jusqu'à 24 h.
- **2xx rapide** avant toute logique lourde ; traitement asynchrone **si le volume l'exige** (à
  < 10 commandes/jour, l'envoi synchrone est le bon choix : c'est lui qui rend le 500 utile).
- **Dédupliquer** par ID d'événement traité (§8). **Aucun ordre garanti** : ne jamais en dépendre.
- **S'abonner au strict nécessaire**, jamais « tous les événements ». Toute protection CSRF
  **exempte** cette route. Une **Checkout Session expire automatiquement après 24 h**.

Tout fait Stripe absent de ce bloc et de `docs/architecture/PAIEMENTS.md` s'écrit *(à vérifier
contre docs.stripe.com)* — jamais un tarif, un délai de versement ou une disponibilité pays gravé
de mémoire.

## 8. Idempotence : raisonne sur la CONSÉQUENCE du doublon, pas sur l'idéal

L'hébergement est **Vercel**, et **règle Alure n°4 : pas de BDD ni de comptes en v1, la source de
vérité des commandes est Stripe. Ne pas introduire de persistance « au cas où ».** Le compromis qui
suit est **tranché**, pas ouvert.

Le mécanisme livré : un `Set` en mémoire borné à `PROCESSED_MAX = 1000` IDs d'événements. En
serverless multi-instance, c'est une borne **par instance** — le doublon inter-instances reste
possible et **accepté**. Le raisonnement est écrit dans la route : ce webhook **ne fait que
notifier**, donc un doublon coûte **un email en double**, pas une double commande ni un double débit.

**C'est ce raisonnement qu'on reproduit, et il tient en une question : que coûte un doublon ?**

| Ce que fait le traitement | Coût d'un doublon | Mécanisme justifié |
|---|---|---|
| envoyer un email (cas Alure) | un email en double | **borne en mémoire** — livré, suffisant |
| débiter, rembourser, capturer | argent en double | clé d'idempotence sur l'appel sortant, obligatoire |
| réserver du stock, ouvrir un accès | état faux durable | le compromis tombe → **décision du propriétaire, en ADR** |

Deux corollaires déjà à l'œuvre :

- Le `Map` de rate-limit (`api/contact`, `api/checkout`) est aussi une borne **par instance** :
  N instances = N × la limite. Suffisant contre l'abus naïf ; Stripe a ses propres protections.
- `createCheckoutSession()` ne passe **pas** de clé d'idempotence : un doublon y produit une session
  Checkout non payée, qui **expire seule sous 24 h**. Coût nul. La clé (UUID v4 ou combinaison
  stable, ≤ 255 caractères, **jamais** de donnée personnelle dedans ; Stripe rejoue statut *et*
  corps de la première requête, y compris une 500) devient obligatoire dès qu'un POST sortant a un
  effet financier.

**N'introduis pas Postgres, Redis ou un KV pour « rendre le webhook vraiment idempotent »** : ce
serait contredire une règle permanente du projet, pour un bénéfice qui vaut un email en double.

## 9. Activer un moyen de paiement = un réglage de DASHBOARD, pas du code

`stripe.ts` ne fixe **délibérément pas** `payment_method_types` — son commentaire le dit : « les
moyens de paiement se pilotent depuis le dashboard Stripe ». Conséquence directe :

- **PayPal, cartes, wallets : rien à coder.** C'est un interrupteur dans le dashboard. « Ajoute
  PayPal » n'appelle aucun fichier nouveau, aucun composant, aucune CSP à toucher.
- Le travail réel est ailleurs : vérifier devise et pays des clients, remboursement, litige,
  mentions légales — puis **tester en mode test**.
- Périmètre actuel : `shipping_address_collection.allowed_countries = ['FR']`, panier 21,99 €. Un
  moyen de paiement destiné à des clients hors France, ou au fractionnement d'un panier de 21,99 €,
  est **sans objet aujourd'hui** — voir `docs/specs/paiement-*.md` et `docs/architecture/PAIEMENTS.md`.

## 10. Secrets & environnement

- Secret = **serveur uniquement**, dans `.env.local` (git-ignoré) : jamais dans le code, le bundle
  client, un log, un commit. En usage : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY`, plus `RESEND_FROM` / `ORDER_NOTIFICATIONS_EMAIL`.
- **`NEXT_PUBLIC_*` = public par construction.** Une clé secrète ainsi préfixée part dans le JS du
  navigateur : fuite immédiate. **Aucun `NEXT_PUBLIC_` n'existe dans `src/` — garde-le ainsi.**
- **Un secret ne se lit que dans le module qui isole le tiers** (`stripe.ts`, `emails.ts`,
  `deliver()` de `api/contact`), au moment de l'usage, et son absence lève une **erreur typée** →
  `503`. **Jamais de repli silencieux sur un secret** : mieux vaut une panne visible.
- **CSP : `CONNECT_EXTRA` / `SCRIPT_EXTRA` / `FRAME_EXTRA` sont vides — et c'est CORRECT.** Le
  paiement se fait en **redirection pleine page** : aucun script Stripe sur notre domaine, Resend est
  appelé côté serveur. **N'ajoute pas de domaine Stripe « par précaution ».** Bascule un jour vers un
  script embarqué (Elements, iframe) = CSP mise à jour **dans le même commit**.

## Checklist de fin

- [ ] Logique commande dans `src/lib/shop/` ; SDK Stripe importé **uniquement** dans `stripe.ts` — jamais de `src/features/`
- [ ] La route ne contient aucune règle métier ; un seul `try/catch` final qui mappe les erreurs typées
- [ ] Validation en deux temps : schéma zod **partagé** (forme) **puis** règle métier réelle (`orderableError()`)
- [ ] Pipeline complet : rate-limit → taille (en-tête **et** corps) → `JSON.parse` gardé → `safeParse` → règle métier → `parsed.data` seul
- [ ] Montant recalculé côté serveur depuis `PRODUCT`, en centimes entiers ; URLs de retour sur `SITE.url`, jamais `Host`
- [ ] Aucune exception avalée, aucun faux succès ; erreurs en **JSON typé** ; le client vérifie `res.ok` ; aucun payload dans les logs
- [ ] Webhook : signature absente → 400, `request.text()`, événement non traité → 200 immédiat, échec d'email → 500 volontaire, marquage **après** succès
- [ ] Idempotence : conséquence du doublon évaluée avant le mécanisme — **aucune persistance introduite**
- [ ] Moyen de paiement : réglage dashboard + vérifications + test en mode test — pas de code
- [ ] Secrets dans le seul module qui isole le tiers ; aucun `NEXT_PUBLIC_` sur un secret ; CSP inchangée tant que le paiement reste en redirection
- [ ] Test vitest sur la logique serveur (`web-tests`) — **pas** de test de composant ; puis `tsc --noEmit`, `eslint .`, `npm run test`, `npm run build` verts (`web-quality-gate`)
