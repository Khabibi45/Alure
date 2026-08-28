# Spec — Socle d'encaissement (Checkout + webhook)

Statut : `livré` — LOT 2, tâches T1 à T4 · Date : 2026-08-05
Spec de référence : **[`./boutique.md`](./boutique.md)** (validée par le propriétaire — elle fait foi
sur le périmètre). Ce document ne la remplace pas et ne se ré-implémente pas.

> **Ce socle EXISTE.** `stripe ^22.4.0` est installé, `src/lib/shop/` est en place, et
> `POST /api/checkout` + `POST /api/stripe-webhook` sont **livrées, committées et testées**
> (48 tests vitest verts). Ce document consigne le **contrat réellement en vigueur** et les
> vérifications qui restent à passer dessus. Toute rédaction qui décrirait du code à écrire ici
> serait un mensonge : **en cas de désaccord entre ce document et le code, le code a raison.**

Doctrine complète : [`../architecture/PAIEMENTS.md`](../architecture/PAIEMENTS.md) ·
décision : [`../adr/001-paiements-stripe.md`](../adr/001-paiements-stripe.md) ·
moyens de paiement : [`./paiements-ROADMAP.md`](./paiements-ROADMAP.md).

## 0. État réel au 2026-08-05 — relu fichier par fichier

| Élément | État |
|---|---|
| `stripe` dans `package.json` | **LIVRÉ** (`^22.4.0`) |
| `src/lib/shop/` — `product.ts`, `checkout-schema.ts`, `stripe.ts`, `emails.ts`, `errors.ts`, `jsonld.ts` | **LIVRÉ** — dossier **module par domaine** (règle Alure n°2), point de greffe d'une migration Shopify |
| `POST /api/checkout` | **LIVRÉ + testé** (`route.test.ts`) |
| `POST /api/stripe-webhook` | **LIVRÉ + testé** (`route.test.ts`) |
| Emails de commande (Resend) | **LIVRÉ + testé** (`emails.test.ts`) |
| Pages `/leurre`, `/merci` (noindex), `/suivi`, `/faq` | **LIVRÉ** |
| Catalogue, prix, devise | **LIVRÉ** — `PRODUCT` : 2199 centimes, `eur`, 3 coloris, quantité 1-5, délai « 3 à 5 jours ouvrés » |
| `site-config.ts` | **LIVRÉ** — `Alure` / `https://alure-peche.fr` (domaine **PROVISOIRE**, non tranché) |
| Domaines Stripe en CSP | **aucun, et c'est correct** — `CONNECT_EXTRA` / `SCRIPT_EXTRA` / `FRAME_EXTRA` de `next.config.ts` sont vides **par choix** (redirection pleine page, zéro script tiers) |
| Stockage (BDD, KV, fichier) | **aucun, et c'est une règle permanente** — `CLAUDE.md` règle Alure n°4 : pas de BDD ni de comptes en v1, la source de vérité des commandes est Stripe. Ce n'est pas un manque à combler |
| Variables d'environnement | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `ORDER_NOTIFICATIONS_EMAIL` — serveur uniquement, `.env.local` git-ignoré. Les **valeurs** de test attendent Logan (T5) |

## 1. Le contrat du socle (critères observables)

Chacun est **prouvé par un test** sauf mention contraire.

- [x] Un client qui tenterait d'imposer un montant n'y arrive pas : le corps de `/api/checkout`
      n'accepte que `{ coloris, quantite }` (zod, clés inconnues retirées) et le prix vient de
      `PRODUCT.unitAmountCents` côté serveur.
- [x] Corps JSON illisible → **400** · hors schéma → **400** + `issues` · au-delà de
      `CHECKOUT_MAX_BYTES` (en-tête `content-length` **puis** corps réel) → **413** · plus de
      10 requêtes/minute par IP → **429** + `Retry-After`.
- [x] Coloris inexistant ou épuisé → **400** via `orderableError()` — la garde **métier**, distincte
      de la garde de forme, parce qu'une disponibilité se bascule à la main.
- [x] `STRIPE_SECRET_KEY` absente → **503** typé et loggué (`PaymentNotConfiguredError`), jamais un
      faux succès ni une session vide.
- [x] La route répond **`{ url }`** et l'îlot client navigue dessus : un `fetch` ne peut pas suivre
      une redirection cross-origin vers Stripe (note d'implémentation T2 de `boutique.md`).
- [x] En-tête `Stripe-Signature` absente → **400** avant toute lecture ; signature invalide →
      **400** et **rien** n'est traité ; `STRIPE_WEBHOOK_SECRET` absent → **503**.
- [x] Le même `event.id` livré deux fois → un seul envoi d'emails, et **les deux appels répondent
      2xx**.
- [x] Un échec d'envoi d'email → **500 volontaire** (Stripe re-livrera) **et** l'événement n'est
      **pas** marqué traité, donc la re-livraison ré-essaie vraiment.
- [x] Tout `event.type` hors des **trois** traités (`checkout.session.completed`,
      `async_payment_succeeded`, `async_payment_failed`) → **200 immédiat** (sinon Stripe re-livre
      en boucle) ; session sans données exploitables → **200** + log de **l'ID seul**.
- [x] Une session **terminée mais non payée** (`payment_status === 'unpaid'`, cas d'un moyen à
      notification différée) → **200 `{ pending: true }`** et **aucun email** : le mail partira à
      l'`async_payment_succeeded`. Corrigé le 2026-08-06 — sans cette garde, le site annonçait
      « Total payé » sur un paiement qui pouvait encore échouer.
- [x] Aucune dépendance à l'ordre d'arrivée des événements : un seul type est traité et **aucun état
      de commande n'est tenu**.
- [x] Le retour navigateur n'est **jamais** une preuve de paiement : `src/app/merci/page.tsx` ne lit
      même pas `session_id` et n'affiche aucun détail de commande. Le webhook signé fait seul foi.
- [x] Retour d'annulation : `cancel_url` renvoie sur `/leurre`, page normale, sans message parasite.
- [x] URLs de retour bâties sur `SITE.url` en production, **jamais** l'en-tête `Host` (open redirect
      après paiement). Exception bornée : origin local en `NODE_ENV === 'development'`.
- [ ] **Non prouvé par un test, et ça ne peut pas l'être** : le parcours réel de bout en bout en mode
      test (T5 de `boutique.md`) — bloqué en attente des clés Stripe test et du compte Resend.

**Hors-scope de ce socle** : comptes clients, persistance, codes promo, back-office,
remboursements et litiges (dashboard Stripe, à la main), facturation, livraison hors France.

## 2. L'architecture livrée — ce qu'on ne réécrit pas

| Fichier réel | Rôle | Connaît HTTP ? |
|---|---|---|
| `src/lib/shop/product.ts` | source de vérité produit : `PRODUCT`, `getColorway()`, `totalCents()`, `orderableError()`, `formatEuros()` | non |
| `src/lib/shop/checkout-schema.ts` | schéma zod **partagé** client + serveur, bornes dérivées de `PRODUCT`, `CHECKOUT_MAX_BYTES` | non |
| `src/lib/shop/stripe.ts` | **le seul** import du SDK Stripe : `createCheckoutSession()`, `verifyWebhookEvent()` | non |
| `src/lib/shop/errors.ts` | erreurs typées, dans leur propre fichier pour que les tests mockent `stripe.ts` sans casser les `instanceof` | non |
| `src/lib/shop/emails.ts` | Resend + gabarits **purs** exportés (testables sans réseau) | non |
| `src/lib/shop/jsonld.ts` | JSON-LD produit, dérivé de `PRODUCT` | non |
| `src/app/api/checkout/route.ts` · `src/app/api/stripe-webhook/route.ts` | adaptateurs HTTP minces | oui, et eux seuls |

Nommage : c'est un **dossier module par domaine**, pas la convention `src/lib/<feature>-schema.ts`.
Hors commerce, une petite feature sans tiers à isoler reste à plat (`src/lib/contact-schema.ts`).
**Aucun `src/features/`.**

Les quatre décisions structurantes, déjà prises et appliquées (détail dans l'ADR-001) :

1. **Stripe Checkout en redirection pleine page** — pas d'Elements, pas d'embed. Aucun script
   Stripe sur notre domaine → **zéro ajout CSP**, zéro cookie tiers chez nous. Le mode embarqué a
   été **écarté**, pas différé : le rouvrir voudrait dire rouvrir l'ADR.
2. **`payment_method_types` délibérément non fixé** (le commentaire de `stripe.ts` le dit) :
   **activer un moyen de paiement est un réglage de dashboard, pas du code.**
3. **Aucune persistance.** Le webhook **ne fait que notifier** : deux emails, aucune commande à
   conserver. Il n'y a donc ni schéma, ni migration, ni sauvegarde, ni `stripe-event-store` à
   écrire — et il ne faut pas en introduire.
4. **Idempotence en mémoire** : `Set` borné à `PROCESSED_MAX = 1000` IDs d'événements. En serverless
   multi-instance, borne **par instance** : le doublon inter-instances reste possible et **accepté**
   — pire cas, un email de confirmation en double, jamais une double commande. Même compromis
   assumé pour le rate-limit. **Ne pas remplacer par un stockage externe.**

**Idempotence sortante** : `createCheckoutSession()` ne passe **pas** de clé d'idempotence. Un
double-clic ou un retry réseau peut créer deux sessions Checkout ; une session non payée **expire
d'elle-même après 24 heures** (fait Stripe vérifié) et ne génère aucun `checkout.session.completed`,
donc aucun email. Imprécision connue et bornée, pas un incident. La clé (UUID v4 ou combinaison
stable, ≤ 255 caractères, **jamais de donnée sensible dedans** ; Stripe rejoue statut **et** corps de
la première requête, y compris une 500 ; purge après ≥ 24 h) devient obligatoire dès qu'un POST
sortant a un effet financier — ce n'est pas le cas ici.

**Faits webhook vérifiés le 05/08/2026 contre `docs.stripe.com/webhooks`** : corps **brut**
obligatoire · HMAC SHA-256 · comparaison à temps constant · tout schéma de signature autre que `v1`
ignoré · jusqu'à 2 secrets actifs pendant 24 h lors d'une rotation · **2xx rapide** avant toute
logique lourde · dédupliquer par ID d'événement · **l'ordre des événements n'est pas garanti** ·
s'abonner **uniquement** aux types nécessaires · **exempter la route de toute protection CSRF** ·
traitement asynchrone **si le volume l'exige** (à moins de 10 commandes/jour, l'envoi synchrone est
le bon choix : c'est lui qui rend le 500 utile). Tout fait Stripe hors de ce bloc s'écrit
*(à vérifier contre docs.stripe.com)*.

**Ce qu'on n'ajoute pas sur cette route** : aucun rate-limit par IP (il ferait tomber des
tentatives légitimes de Stripe — la signature est le contrôle d'accès).

## 3. Ce qui reste

Aucune tâche de code. Une seule tâche ouverte, et elle n'est pas technique :

- [ ] **T5 de [`./boutique.md`](./boutique.md)** — parcours de bout en bout en mode test : carte
      test + PayPal test, montants exacts, annulation, webhook rejoué (idempotence vérifiée),
      emails reçus. **Bloqué en attente des clés Stripe test et du compte Resend (Logan).**
      La procédure exacte pour le débloquer (compte, clés, CLI, cartes de test, checklist du
      parcours) est écrite dans
      [`../architecture/BRANCHEMENT-STRIPE.md`](../architecture/BRANCHEMENT-STRIPE.md) ; les cinq
      variables attendues sont versionnées dans [`../../.env.example`](../../.env.example).

Hors paiement, et bloquant la mise en ligne : domaine à trancher (`site-config.ts` porte
`alure-peche.fr` en **PROVISOIRE**) · libellés réels des 3 coloris + visuels (LOT 3) · identité
vendeur dans `src/lib/legal-config.ts` (pages légales `noindex` tant qu'elle manque) · passage en
mode **LIVE** au LOT 4.

## 4. Vérification

- **Tests** (vitest) — **backend uniquement, aucun test de composant ni de page** (règle du
  propriétaire). **48 tests verts** : `src/lib/shop/shop.test.ts` (16), `src/lib/shop/emails.test.ts`
  (6), `src/app/api/checkout/route.test.ts` (8), `src/app/api/stripe-webhook/route.test.ts` (12),
  `src/app/api/contact/route.test.ts` (6). Les SDK Stripe et Resend sont **mockés** : aucun appel
  réseau en test. Cadrage : `web-backend`, `web-tests`.

  | Contrat du §1 | Où c'est prouvé |
  |---|---|
  | Prix serveur, jamais celui du client | `shop.test.ts` (`totalCents`, schéma) + `checkout/route.test.ts` |
  | 400 / 413 / 429 / 500 / 503 sur checkout | `checkout/route.test.ts` |
  | Signature absente / invalide → 400, zéro email | `stripe-webhook/route.test.ts` |
  | Rejeu du même `event.id` → un seul envoi | `stripe-webhook/route.test.ts` |
  | Échec d'envoi → 500 **sans** marquer l'événement traité | `stripe-webhook/route.test.ts` |
  | Type d'événement non traité → 200 immédiat | `stripe-webhook/route.test.ts` |
  | Session terminée mais **non payée** → 200, zéro email | `stripe-webhook/route.test.ts` |
  | Paiement différé abouti (`async_payment_succeeded`) → emails | `stripe-webhook/route.test.ts` |
  | Délai 10-20 j ré-affiché, vouvoiement, échappement HTML | `emails.test.ts` |

  Trou connu, **non comblé** : `src/lib/shop/stripe.ts` n'a aucun test direct (il est mocké
  partout) — `returnBaseUrl()` n'est donc couvert par rien. Recensé dans `web-tests` §12 (R3).

- **Gate** : `web-quality-gate` — `npx tsc --noEmit`, `npx eslint .` (jamais `next lint`),
  `npm run test`, `npm run build`, puis navigateur réel (console sans erreur ni blocage CSP,
  375 px + desktop, parcours clavier jusqu'au bouton « Acheter »).
- **Vérification manuelle non automatisable** : le parcours T5 en mode test, webhook reçu via la
  CLI Stripe, puis rejeu manuel d'un événement depuis le dashboard — rappel vérifié : un renvoi
  manuel **n'annule pas** les nouvelles tentatives automatiques. *(Commandes exactes de la CLI :
  à vérifier contre docs.stripe.com le jour du test — elles évoluent.)*
- **Audits concernés** (`web-audit`) : **sécurité** (2 routes API, secrets, webhook, aucune donnée
  client en log) · **RGPD** (Stripe et Resend sous-traitants, déclarés dans `/confidentialite`) ·
  **SEO** (`/merci` noindex et hors sitemap) · **a11y** (sélecteur coloris au clavier, erreurs
  annoncées via `role="alert"`).
