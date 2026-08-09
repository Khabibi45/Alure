# PAIEMENTS — doctrine de référence

> **Statut : doctrine — décrit le code livré au 2026-08-05, corrigé le 2026-08-06** (garde
> `payment_status` + événements de paiement différé sur le webhook). Ce document ne propose pas une
> cible : il explique le système de paiement **tel qu'il est bâti et testé** dans ce dépôt
> (LOT 2, T1-T4), puis comment l'exploiter sans le casser.
>
> Spec source : [`docs/specs/boutique.md`](../specs/boutique.md) (elle fait foi sur le périmètre) ·
> décision : [`docs/adr/001-paiements-stripe.md`](../adr/001-paiements-stripe.md) · extension des
> moyens : [`docs/specs/paiements-ROADMAP.md`](../specs/paiements-ROADMAP.md).
>
> **En cas de désaccord entre ce document et le code, le code a raison** — corrigez le document.

Marques : **LIVRÉ** (dans le dépôt, testé) · **À FAIRE** · **À DÉCIDER** (par Logan) ·
**À VÉRIFIER** (contre `docs.stripe.com` avant de l'affirmer). Les faits Stripe non marqués sont
vérifiés contre `docs.stripe.com` au **05/08/2026** ; aucun tarif, commission, délai de versement ou
règle juridique n'est écrit ici de mémoire.

Contexte commercial (déjà tranché, cf. `boutique.md`) : mono-produit, **21,99 € port inclus**,
TVA non applicable art. 293 B du CGI, 3 coloris, quantité 1 à 5, **livraison France uniquement**,
délai 10 à 20 jours ouvrés annoncé avant l'achat.

---

## Le système en une page

Le flux nominal réel, du clic à l'email. Tout est **LIVRÉ**.

1. **L'îlot d'achat** (`src/components/sections/leurre/BuyBox.tsx`, `'use client'`) valide la
   sélection avec `checkoutSchema` puis `POST /api/checkout` avec **`{ coloris, quantite }` et rien
   d'autre** — jamais un montant.
2. **`POST /api/checkout`** (`src/app/api/checkout/route.ts`) applique les gardes dans cet ordre :
   rate-limit 10 requêtes/minute par IP → plafond `CHECKOUT_MAX_BYTES` (1 000 octets, vérifié sur
   l'en-tête `content-length` **et** sur le corps réel) → `JSON.parse` sous try/catch →
   `checkoutSchema.safeParse` → **`orderableError()`**.
3. **`orderableError()`** (`src/lib/shop/product.ts`) est la garde métier au-delà de la forme : le
   coloris doit **exister** et être **disponible**. Un coloris épuisé s'arrête ici, en 400.
4. **`createCheckoutSession()`** (`src/lib/shop/stripe.ts`) crée la session Stripe :
   `mode: 'payment'`, `locale: 'fr'`, `shipping_address_collection.allowed_countries: ['FR']`,
   `metadata: { coloris, quantite }`. **Le montant vient de `PRODUCT.unitAmountCents`**, jamais du
   client. Les URLs de retour sont bâties sur `SITE.url` (jamais l'en-tête `Host`).
5. **La route répond `{ url }`**, et c'est l'îlot qui navigue (`window.location.assign`). Un `fetch`
   ne peut pas suivre une redirection cross-origin vers Stripe — c'est la note d'implémentation T2.
6. **Le client paie sur `checkout.stripe.com`**, page hébergée par Stripe, en **redirection pleine
   page**. À partir d'ici notre serveur n'a plus la main.
7. **Retour navigateur** : `/merci?session_id={CHECKOUT_SESSION_ID}` si succès, `/leurre` si
   annulation.
8. **`POST /api/stripe-webhook`** reçoit l'événement signé → `verifyWebhookEvent()` (corps brut +
   signature + secret) → garde **`payment_status !== 'unpaid'`** (« tunnel terminé » n'est pas
   « encaissé ») → `toOrderSummary()` → **`sendOrderEmails()`** (`src/lib/shop/emails.ts`,
   Resend) : confirmation client + notification support, délai 10-20 j ré-affiché dans les deux.
   Un paiement à notification différée repasse par cette même branche plus tard, via
   `checkout.session.async_payment_succeeded`.

### La page `/merci` n'est PAS une preuve de paiement

`success_url` porte bien `session_id`, mais **`src/app/merci/page.tsx` ne le lit pas** — c'est
délibéré. La page affiche un texte générique et honnête (« si votre paiement a été validé, vous
recevrez un email… »), elle ne **décide** aucun état. Trois raisons : l'utilisateur peut fermer
l'onglet, perdre le réseau ou **forger l'URL de succès** ; seul le **webhook signé** fait foi
(règle n°5 : jamais un faux succès) ; et sans BDD il n'y a de toute façon aucun état de commande à
afficher côté site. La confirmation, c'est l'email — la source de vérité, le **dashboard Stripe**.

---

## Les 5 décisions d'architecture et leur pourquoi

| # | Décision | Pourquoi | Conséquence concrète |
|---|---|---|---|
| 1 | **Redirection pleine page** vers la page hébergée Stripe — pas d'Elements, pas d'embed | Le plus petit périmètre possible : la carte n'approche jamais notre domaine | **Zéro script Stripe sur le site → zéro ajout CSP** (`CONNECT_EXTRA`/`SCRIPT_EXTRA`/`FRAME_EXTRA` de `next.config.ts` sont vides *par choix*), **zéro cookie tiers** sur notre domaine, donc rien à ajouter à une bannière de consentement |
| 2 | **PayPal via le dashboard Stripe**, pas de SDK PayPal séparé | Un second PSP = un second SDK, un second format de webhook, une seconde signature, une seconde réconciliation — pour un gain nul | `stripe.ts` **ne fixe volontairement pas `payment_method_types`** (le commentaire du fichier le dit). Activer un moyen = **un réglage de dashboard**, aucun code |
| 3 | **Pas de base de données** — source de vérité = dashboard Stripe | **Règle permanente Alure n°4** (`CLAUDE.md`) : pas de BDD ni de comptes en v1, pas de persistance « au cas où ». Volume attendu < 10 commandes/jour, traitées à la main | Le webhook **ne fait que notifier**. Il n'y a aucune commande à persister, donc aucun schéma, aucune migration, aucune sauvegarde à maintenir |
| 4 | **Idempotence des événements en mémoire** (`Set` borné à 1 000 IDs) | Suffisant pour ce que coûte un doublon **ici** | Compromis écrit dans le code : en serverless multi-instance la borne est **par instance**, le doublon inter-instances reste possible et **accepté** — pire cas : un email de confirmation en double, **pas** une double commande |
| 5 | **Montant recalculé côté serveur** | Un montant envoyé par le navigateur est un champ modifiable — c'est la faille n°1 d'un checkout | Le client n'envoie que `{ coloris, quantite }`. Le prix vient de `PRODUCT.unitAmountCents`. `totalCents()` est l'unique endroit où un montant se calcule |

Un invariant qui découle de tout ça et qu'on ne discute pas : **tout Stripe passe par
`src/lib/shop/`** (règle Alure n°2), `stripe.ts` étant le **seul** fichier qui importe le SDK en
valeur — vérifié : ailleurs, seule la route webhook en importe le **type** (`import type Stripe`,
effacé à la compilation). C'est le point de greffe d'une éventuelle migration Shopify. Et `src/lib/shop/` est un **dossier-module par
domaine** (`product.ts`, `checkout-schema.ts`, `stripe.ts`, `emails.ts`, `errors.ts`, `jsonld.ts`),
pas la convention `src/lib/<feature>-schema.ts` du kit.

---

## Le webhook, règle par règle

`src/app/api/stripe-webhook/route.ts` — ce que le code fait, et la bonne pratique Stripe
correspondante. Rien à réécrire ici : ce paragraphe explique le code existant.

| Ce que fait le code | La bonne pratique Stripe derrière |
|---|---|
| En-tête `stripe-signature` absent → **400** immédiat, avant toute lecture | La signature *est* le contrôle d'accès de l'endpoint. Sans elle, n'importe qui déclare une commande payée |
| Corps lu par **`await request.text()`**, jamais `request.json()` | La vérification exige la charge utile **brute** : le moindre parse/re-stringify casse le HMAC SHA-256 |
| `verifyWebhookEvent()` délègue à `constructEvent()` du SDK | Le SDK gère HMAC SHA-256, la comparaison à **temps constant** et l'ignorance de tout schéma autre que `v1` (attaque par repli). On ne le réimplémente pas |
| `StripeSignatureVerificationError` → **400**, réponse muette (« Signature invalide. ») | On ne dit jamais *pourquoi* une signature échoue |
| `STRIPE_WEBHOOK_SECRET` absent → **503** + log | Échec bruyant, jamais un faux 200 sur une config incomplète |
| Tout `event.type` hors des trois traités → **200 immédiat** | Un 2xx rapide avant toute logique lourde ; sans lui, Stripe re-livre l'événement en boucle |
| `payment_status === 'unpaid'` → **200 `{ pending: true }`**, aucun email | `checkout.session.completed` signifie « tunnel terminé », **pas** « encaissé ». Test officiel Stripe : traiter dès que `payment_status !== 'unpaid'` |
| `checkout.session.async_payment_succeeded` traité **comme** `completed` | C'est lui qui confirme un moyen à notification différée, parfois des jours plus tard |
| `checkout.session.async_payment_failed` → **200** + log | Aucun email de confirmation n'était parti (session `unpaid`) : rien à rétracter, mais l'échec doit se voir |
| Aucune logique qui dépende d'un prédécesseur | **L'ordre des événements n'est pas garanti** — on n'en dépend nulle part |
| `event.id` déjà vu → **200** `{ duplicate: true }`, aucun email | Gérer les doublons en mémorisant les IDs traités |
| Session sans données exploitables (`toOrderSummary()` → `null`) → **200** + log de **l'ID seul** | Re-livrer ne réparera pas des données manquantes. Et le log ne contient jamais le payload |
| Échec d'envoi d'email → **500 volontaire** | Stripe re-livrera. Une commande payée ne reste jamais silencieusement sans email |
| **Aucun rate-limit** sur cette route | Il ferait tomber des événements légitimes ; la signature suffit |
| Aucune protection CSRF | Une route webhook doit en être exemptée (les route handlers App Router n'en ajoutent pas) |

Détail à connaître : `toOrderSummary()` conserve l'**ID brut du coloris** si le libellé a disparu du
catalogue entre l'achat et le webhook — on préfère une information dégradée mais vraie à une
information perdue.

**À FAIRE au branchement (dashboard, pas code)** : abonner l'endpoint à **exactement trois types** —
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`. Moins que ça, et une commande payée par un moyen à
notification différée n'aurait jamais son email ; « tous les événements » ferait traiter du bruit
pour rien. Procédure : [`BRANCHEMENT-STRIPE.md`](./BRANCHEMENT-STRIPE.md).

**À VÉRIFIER le jour d'une rotation de secret** : deux secrets d'endpoint peuvent être actifs
jusqu'à 24 h. La façon exacte de couvrir cette fenêtre (bascule d'une variable d'environnement vs
essai de plusieurs secrets) est **à vérifier contre docs.stripe.com** à ce moment-là.

---

## Idempotence : les deux sens du mot

Deux mécanismes indépendants qu'on confond souvent. Ils vont dans des sens opposés.

**(a) La clé d'idempotence sur nos POST *vers* Stripe.**
Une clé (UUID v4 ou combinaison stable, **≤ 255 caractères**, **jamais de donnée sensible dedans**)
fait rejouer à Stripe **le même résultat** — code de statut *et* corps, y compris une 500 — pour une
même clé ; les clés sont purgées après ≥ 24 h.

> **Elle n'est pas utilisée aujourd'hui** sur `stripe.checkout.sessions.create()`. Concrètement :
> un double-clic ou un retry réseau peut créer **deux sessions Checkout**. Ce que ça coûte : rien
> tant que le client ne paie pas deux fois — une session non payée expire d'elle-même au bout de
> **24 heures**, et une session sans paiement ne génère aucun `checkout.session.completed`, donc
> aucun email et aucune commande. L'îlot d'achat désactive de son côté le bouton pendant la
> création. C'est une **imprécision connue et bornée**, pas un incident : à ajouter si un jour le
> bruit de sessions abandonnées gêne la lecture du dashboard. Ne pas refondre le module pour ça.

**(b) La déduplication des événements *reçus* de Stripe.**
Mécanisme inverse : Stripe peut livrer le même événement plusieurs fois (re-tentatives, renvoi
manuel depuis le dashboard — qui n'annule pas les tentatives automatiques). C'est **notre**
responsabilité. Ici : un `Set` en mémoire borné à 1 000 IDs, alimenté **après** l'envoi réussi des
emails (donc un échec ne marque rien comme traité et la re-livraison ré-essaie vraiment).

Pourquoi la borne par instance est acceptable **à ce volume** : le webhook ne fait que **notifier**.
Le pire scénario — deux instances Vercel recevant le même événement — coûte un email de confirmation
en double, jamais une double commande. Au volume attendu (< 10 commandes/jour), c'est sans commune
mesure avec le coût d'une dépendance permanente. **Ne pas remplacer par un stockage externe.** La
seule chose qui rouvrirait le sujet serait un webhook qui ferait autre chose que notifier
(déclencher une expédition, débiter, ouvrir un accès) — ce n'est ni le cas, ni dans la roadmap.

---

## Activer un moyen de paiement

**La procédure réelle.** Avec Checkout en redirection et `payment_method_types` délibérément non
fixé, activer un moyen de paiement est **un réglage dans le dashboard Stripe**. Aucun composant,
aucune route, aucune CSP, aucun commit — sauf si le moyen impose une mention légale visible.

1. **Décider** — passer le filtre de pertinence ci-dessous. Un moyen activé sans que ses règles
   soient comprises est une dette qui se paie au premier remboursement ou au premier litige.
2. **Activer** dans le dashboard Stripe, en mode test d'abord (chemin exact du menu : **À VÉRIFIER**
   contre docs.stripe.com, il bouge).
3. **Vérifier**, moyen par moyen : devise **EUR** · **pays des clients** vs notre livraison
   **France uniquement** · remboursement (total, partiel, délai) · capture (immédiate ou différée) ·
   synchrone ou **asynchrone** · litige / rétrofacturation · libellé, logo et mention légale
   éventuelle dans l'UI.
4. **Tester** en mode test de bout en bout, jusqu'à l'email reçu, puis **documenter** dans la spec
   du moyen — index : [`docs/specs/paiements-ROADMAP.md`](../specs/paiements-ROADMAP.md).

**Le filtre de pertinence — panier 21,99 €, France uniquement.**

| Moyen | Statut aujourd'hui | Déclencheur pour (r)ouvrir |
|---|---|---|
| **Cartes** (+ schéma domestique **CB** : activation exacte **À VÉRIFIER**) | Pertinent — le socle | — |
| **Apple Pay / Google Pay** | Pertinent — trafic Instagram/TikTok = mobile | — |
| **Link** (réseau Stripe) | Fourni **d'office** avec Checkout, zéro intégration | — |
| **PayPal** (EUR ✓, entreprise FR ✓, clients monde entier) | Pertinent — **déjà disponible, il suffit de l'activer** | — |
| **Klarna, Alma** (fractionné) | **Sans objet** : fractionner 21,99 € n'a aucun sens | Un panier moyen qui change d'ordre de grandeur (packs multi-coloris, 2ᵉ produit). Le seuil est **À DÉCIDER** par Logan sur données réelles — aucun chiffre supposé ici |
| **Prélèvement SEPA** (`sepa_debit`, asynchrone — jours) | **Sans objet** : introduirait un état « en attente » durable sur un achat unique à 21,99 € | Un modèle récurrent, ou du B2B avec facturation |
| **Moyens locaux européens** (Bancontact BE, iDEAL NL, EPS AT, P24 PL, MB WAY/Multibanco PT, MobilePay DK/FI) | **Sans objet** : ils ciblent des clients hors France, et `allowed_countries: ['FR']` | Ouverture de la livraison hors France (**hors-scope** explicite de `boutique.md`) **+** trafic mesuré depuis le pays concerné |
| **Virements** (`customer_balance`), **Alipay / WeChat Pay** | Sans objet — B2B / consommateurs chinois | Besoin réel documenté |
| **Afterpay / Clearpay** | **Impossible** : entreprises AU CA NZ GB US uniquement | Aucun — ne pas l'inscrire dans une phase |

---

## Sécurité

**LIVRÉ**

- **Secrets et config serveur uniquement** : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY` (secrets) + `RESEND_FROM`, `ORDER_NOTIFICATIONS_EMAIL` (config) — `.env.local`
  git-ignoré. **Jamais
  de `NEXT_PUBLIC_*` sur un secret** : ce préfixe est public par construction et part dans le bundle
  client (règle n°2). Le mode redirection n'a besoin d'**aucune** clé côté navigateur.
- **Montant serveur** : `PRODUCT.unitAmountCents` × quantité validée, en centimes entiers.
- **URLs de retour bâties sur `SITE.url`**, jamais sur l'en-tête `Host` — sinon open redirect
  après paiement. Exception explicite et bornée : en `NODE_ENV === 'development'`, l'origin local
  s'il commence par `http://localhost` (port variable en dev).
- **Signature vérifiée** sur chaque webhook, sur corps brut.
- **Rate-limit** 10/min par IP sur `/api/checkout` (borne par instance, assumée — Stripe a ses
  propres protections), plafond de taille, JSON gardé, zod, garde métier.
- **Logs sans donnée client** : ID de session, ID d'événement, message d'erreur. Jamais le payload,
  jamais l'email du client.
- **Périmètre carte nul** : la carte est saisie sur `checkout.stripe.com`, elle ne transite ni par
  notre serveur ni par nos logs. *(La formulation exacte du niveau de conformité PCI — type de SAQ,
  conditions — est **À VÉRIFIER** contre docs.stripe.com ; ne rien affirmer de mémoire.)*
- **Échec bruyant partout** : clé absente → 503 typé, jamais un faux succès.

**À surveiller** — toute bascule vers un embed **casserait la décision n°1** : domaines Stripe à
ajouter à la CSP **dans le même commit** (règle n°4, domaines exacts **À VÉRIFIER** ce jour-là),
`form-action 'self'` à revoir, question des cookies tiers rouverte. Même règle pour tout service
tiers ajouté (analytics à cookie, embed, widget d'avis) : CSP + politique de confidentialité dans le
même commit. Enfin, rate-limit et déduplication sont en mémoire donc bornés par instance sur
Vercel — assumé et écrit dans le code, ce n'est pas une dette silencieuse.

---

## RGPD et obligations FR

> **À faire valider — ceci n'est pas un avis juridique.** Les pages légales existent déjà
> (`/mentions-legales`, `/cgv`, `/retractation`, `/confidentialite`, contenu centralisé dans
> `src/lib/legal-config.ts`) : **ne pas les re-rédiger ici**. Elles restent `noindex` et hors sitemap
> tant que l'identité vendeur n'est pas remplie.

- **Sous-traitants à mentionner dans la politique de confidentialité** : **Stripe** (email, adresse
  de livraison, données de paiement, collectés pour l'exécution du contrat) et **Resend** (email du
  client pour la confirmation et le suivi). Registre des traitements correspondant : à faire valider.
- **Minimisation** : nous ne stockons rien. Le site n'envoie à Stripe que `{ coloris, quantite }` et
  ne relit en retour que ce dont l'email a besoin.
- **TVA non applicable, art. 293 B du CGI** — affichée sur le prix, dans la description de la ligne
  Stripe et dans l'email de confirmation. **Rétractation 14 jours** après réception, rappelée dans
  ce même email. À faire valider.
- **Médiateur de la consommation** : inscription obligatoire pour un e-commerce FR, à reporter dans
  `legal-config.ts`. **À FAIRE (Logan)** — déjà noté dans `PROGRESS.md`.
- **Cookies** : la redirection ne dépose **aucun** cookie tiers sur notre domaine et Vercel
  Analytics est sans cookie — pas de bannière requise **pour le paiement**.
- **Textes visibles** : chaque libellé, erreur et état d'attente suit `docs/standards/UI-COPY.md` —
  un tunnel de paiement est l'endroit où une formulation approximative coûte le plus cher.

---

## Tester

> **La procédure pas à pas — compte, clés, variables, CLI, parcours T5, dashboard, passage en
> production — vit dans [`BRANCHEMENT-STRIPE.md`](./BRANCHEMENT-STRIPE.md)** (runbook, commandes et
> cartes de test vérifiées contre `docs.stripe.com` le 06/08/2026). Le modèle des variables
> d'environnement est versionné dans [`.env.example`](../../.env.example). Ce paragraphe-ci n'en
> garde que les invariants.

La recette locale passe par la **CLI Stripe** : un environnement de test (clés de test) et le
transfert des événements vers **notre** chemin `/api/stripe-webhook` — pas `/webhook`.
**La méthode d'installation, le nom des commandes et leurs options sont *à vérifier contre
docs.stripe.com* au moment du test** : la CLI évolue, et une option de transfert mal choisie ne
délivre pas le bon type d'événement. Rien n'est gravé ici de mémoire.

- Les **numéros de cartes de test** se récupèrent sur `docs.stripe.com` — n'en écrire aucun de
  mémoire.
- L'écoute locale affiche un **secret d'endpoint local** : c'est lui qui va dans
  `STRIPE_WEBHOOK_SECRET` en dev, jamais celui de production.
- Les seuls événements auxquels l'endpoint doit être abonné sont **`checkout.session.completed`**,
  **`checkout.session.async_payment_succeeded`** et **`checkout.session.async_payment_failed`** :
  tout le reste reçoit un 200 immédiat et ne sert à rien.
- **Tests automatisés : backend uniquement.** 48 tests verts (vitest) — `src/lib/shop/shop.test.ts`,
  `src/lib/shop/emails.test.ts`, `src/app/api/checkout/route.test.ts`,
  `src/app/api/stripe-webhook/route.test.ts`, `src/app/api/contact/route.test.ts`. **Aucun test de
  composant, jamais** (règle du propriétaire). Relire ce qui est couvert avant d'ajouter.

**T5 — parcours de bout en bout en mode test : EN ATTENTE.** Carte test + PayPal test → emails
reçus, montants exacts, annulation, webhook rejoué (idempotence vérifiée). **Bloqué** par les clés
Stripe test et le compte Resend (Logan). C'est le **seul** « en attente » légitime de la tranche
paiement, avec le passage en mode **LIVE** au LOT 4.

---

## Ce que ce document ne couvre pas

Volontairement hors périmètre — ne pas dériver dessus sans décision explicite de Logan :
le **catalogue et les prix** (`src/lib/shop/product.ts` + `boutique.md`) · les **libellés réels des
3 coloris et les visuels** (LOT 3 — les libellés actuels sont marqués « provisoire » et le gate
interdit la mise en ligne tant qu'ils existent) · le **domaine**, non tranché, `site-config.ts`
portant `alure-peche.fr` en **PROVISOIRE** — il conditionne les URLs de retour et l'expéditeur
Resend (LOT 4) · l'**identité vendeur** (`src/lib/legal-config.ts`) et la rédaction des pages
légales · les **tarifs Stripe**, commissions et délais de versement (faits volatils, à lire sur
stripe.com au moment voulu, jamais gravés ici) · la **comptabilité**, la **facturation**, le
**back-office**, les **remboursements** et les **litiges** (traités à la main depuis le dashboard) ·
la **logistique** (commande fournisseur, expédition, envoi du numéro de suivi — manuels) · toute
**implémentation**, qui passe par `web-spec` → `web-feature` → `web-quality-gate`.
