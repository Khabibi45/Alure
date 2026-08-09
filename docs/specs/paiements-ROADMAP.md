# Paiements — état livré & décisions d'activation

Statut : `à jour` · Date : 2026-08-05
Portée : quels moyens de paiement Alure active, pourquoi, et ce qu'il reste à vérifier.
Ce n'est **pas** une roadmap d'implémentation — le socle est écrit. Voir pourquoi §2.

## 1. État au 2026-08-05

**LIVRÉ** (LOT 2 · T1 à T4, gate vert, **48 tests** vitest) :

- `src/lib/shop/` — le module unique : `product.ts` (prix 2199 centimes, 3 coloris, délai),
  `checkout-schema.ts` (zod partagé client/serveur), `stripe.ts` (session Checkout + vérification
  de signature), `emails.ts` (Resend), `errors.ts`, `jsonld.ts`.
- `POST /api/checkout` — rate-limit 10/min par IP, plafond `CHECKOUT_MAX_BYTES` (header **et**
  corps réel) → 413, `JSON.parse` gardé → 400, `safeParse` → 400 + issues, `orderableError()`
  (coloris existant **et** disponible) → 400, puis création de session. Répond `{ url }` (un fetch
  ne peut pas suivre une redirection cross-origin). Sans `STRIPE_SECRET_KEY` → **503 bruyant**.
- `POST /api/stripe-webhook` — `stripe-signature` obligatoire (absent → 400), corps **brut** via
  `request.text()`, `constructEvent`, signature invalide → 400, secret absent → 503, tout événement
  ≠ `checkout.session.completed` → 200 immédiat, session inexploitable → 200 + log de l'ID seul,
  échec d'envoi d'email → **500 volontaire** pour que Stripe re-livre.
- **Montant recalculé côté serveur** : le client n'envoie que `{ coloris, quantite }`.
- **Idempotence** : `Set` en mémoire borné à 1000 IDs d'événements — borne **par instance**,
  doublon inter-instances accepté (au pire un email en double, jamais une double commande).
- **URLs de retour** : `SITE.url` en production, jamais l'en-tête `Host` (open redirect après
  paiement). `success_url` = `/merci?session_id={CHECKOUT_SESSION_ID}`, `cancel_url` = `/leurre`.
- **Pages** : `/leurre`, `/merci` (noindex), `/suivi`, `/faq`. **CSP : zéro ajout** — la redirection
  pleine page ne charge aucun script tiers sur notre domaine.
- **Tests backend uniquement** : `src/lib/shop/shop.test.ts`, `src/lib/shop/emails.test.ts`,
  `src/app/api/{checkout,stripe-webhook,contact}/route.test.ts`. Jamais de test de composant.

**RESTE À FAIRE côté code** — rien. Un seul point ouvert sur le socle, et il n'est pas technique :

- [ ] **T5 de [`./boutique.md`](./boutique.md)** — parcours de bout en bout en mode test (carte test
      + PayPal test, montants exacts, annulation, webhook rejoué). **Bloqué en attente des clés
      Stripe test et du compte Resend (Logan).**

Le reste des tâches de ce document sont des **activations au dashboard** et des **vérifications**
(§4), pas du développement.

À décider par ailleurs, hors paiement : domaine (`site-config.ts` porte `alure-peche.fr` en
PROVISOIRE), libellés réels des 3 coloris + visuels (LOT 3), identité vendeur dans
`src/lib/legal-config.ts`, passage en mode LIVE (LOT 4).

## 2. Le principe qui change tout

`src/lib/shop/stripe.ts` ne fixe **délibérément pas** `payment_method_types` — le commentaire du
fichier le dit : « les moyens de paiement se pilotent depuis le dashboard Stripe ».

> **Activer un moyen de paiement est un réglage de dashboard, pas du code.**
> Aucun composant à écrire, aucune CSP à toucher, aucun test à ajouter.

Il n'y a donc pas de « phases d'implémentation ». Il y a une **liste de décisions d'activation**,
chacune avec ses vérifications : devise · pays des clients · remboursement (total/partiel, délai) ·
capture (immédiate ou différée) · synchrone ou asynchrone · litige (qui tranche, sous quel délai) ·
libellé et mentions obligatoires éventuels · **test en mode test**.

## 3. Tous les moyens — le tableau unique

Filtre appliqué sans complaisance : **panier 21,99 € · France uniquement · achat unique**.
Légende : **✅** vérifié le 2026-08-05 contre `docs.stripe.com` · **❓** à vérifier avant d'affirmer.

| Moyen | Devise | Pays clients | Sync/async | Pertinent ? | Pourquoi | Spec |
|---|---|---|---|---|---|---|
| Cartes | universel ✅ | ❓ | synchrone ❓ | **Oui** | le moyen par défaut de la cible FR | [`paiement-cartes.md`](./paiement-cartes.md) |
| Cartes Bancaires (CB) | ❓ | FR ❓ | synchrone ❓ | **Oui**, activation ❓ | schéma domestique FR très répandu | [`paiement-cartes.md`](./paiement-cartes.md) |
| Apple Pay | plupart des devises ✅ | selon Apple ✅ | synchrone ❓ | **Oui** | trafic Instagram/TikTok = mobile | [`paiement-wallets.md`](./paiement-wallets.md) |
| Google Pay | plupart des devises ✅ | selon Google ✅ | synchrone ❓ | **Oui** | idem | [`paiement-wallets.md`](./paiement-wallets.md) |
| Link (réseau Stripe) | fourni d'office avec Checkout ✅ | ❓ | synchrone ❓ | **Oui** | zéro intégration, déjà là | [`paiement-wallets.md`](./paiement-wallets.md) |
| PayPal | EUR + 13 autres ✅ | monde entier ✅ | ❓ | **Oui** | décidé par Logan, dispo sans SDK | [`paiement-paypal.md`](./paiement-paypal.md) |
| Klarna | EUR + 12 autres ✅ | AU AT BE CA FI FR DE CH ✅ | ❓ | Non | fractionner 21,99 € n'a aucun sens | [`paiement-fractionne.md`](./paiement-fractionne.md) |
| Alma | EUR ✅ | FR ✅ | ❓ | Non | idem | [`paiement-fractionne.md`](./paiement-fractionne.md) |
| Prélèvement SEPA | EUR ✅ | Europe ✅ | **asynchrone, jours** ✅ | Non | état « en attente » durable pour un achat unique à 21,99 € | [`paiement-sepa.md`](./paiement-sepa.md) |
| Bancontact | ❓ | BE ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| iDEAL ( \| Wero) | ❓ | NL ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| EPS | ❓ | AT ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| P24 | ❓ | PL ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| MB WAY · Multibanco | ❓ | PT ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| MobilePay | ❓ | DK FI ✅ | ❓ | Non | clients hors France | [`paiement-locaux-europe.md`](./paiement-locaux-europe.md) |
| Virements (`customer_balance`) | EUR GBP JPY MXN USD ✅ | UE incluse (entreprise) ✅ · clients ❓ | ❓ | Non | usage B2B, sans objet à 21,99 € | — |
| Alipay · WeChat Pay | ❓ | consommateurs chinois ✅ | ❓ | Non | hors cible | — |
| **Afterpay / Clearpay** | — | — | — | **Indisponible** | entreprises **AU CA NZ GB US uniquement** ✅ — pas une entreprise FR | — |

## 4. Trois groupes

### (A) À activer maintenant — cartes · Apple Pay · Google Pay · Link · PayPal

Tous **déjà couverts par le socle livré**. Il ne reste que : l'activation au dashboard Stripe, la
checklist de vérification du §2, et le test en mode test (T5). Aucune ligne de code.

- [ ] Cartes activées + **CB** : mode d'activation exact à vérifier contre docs.stripe.com
- [ ] Apple Pay / Google Pay activés — vérifier le rendu réel sur mobile 375 px
- [ ] Link laissé actif (fourni d'office)
- [ ] PayPal activé au dashboard — vérifier remboursement et litige côté PayPal.
      ⚠️ **Écart à refermer en priorité** : le site **promet déjà** PayPal en 5 endroits
      (`BuyBox.tsx`, `leurre/page.tsx` ×2, `faq/faq-content.ts`, `cgv/page.tsx` — vérifié le
      2026-08-05). Soit on active, soit on retire la promesse : annoncer un moyen absent de l'écran
      de paiement, c'est du litige. Détail dans [`paiement-paypal.md`](./paiement-paypal.md) §1.
- [ ] Un passage en mode test par moyen avant la mise en LIVE (LOT 4)

### (B) Sans objet aujourd'hui — mais réévaluable

| Moyen | Déclencheur précis qui rouvrirait le sujet |
|---|---|
| Klarna · Alma (fractionné) | Un panier moyen qui change d'ordre de grandeur (packs multi-coloris, 2ᵉ produit nettement plus cher). **Le seuil est une décision du propriétaire, prise sur le panier réel constaté — aucun chiffre n'est supposé ici.** |
| Prélèvement SEPA | Un besoin d'encaissement récurrent ou de montants élevés — jamais pour un achat unique à 21,99 € |
| Bancontact, iDEAL, EPS, P24, MB WAY/Multibanco, MobilePay | **L'ouverture de la livraison hors France** (aujourd'hui `allowed_countries: ['FR']`, hors-scope explicite de `boutique.md`) **et** un trafic mesuré depuis le pays concerné |

Les specs correspondantes restent en place — elles documentent le « pourquoi non », pas un chantier.

### (C) Hors sujet

- **Alipay / WeChat Pay** — consommateurs chinois, hors cible et hors zone de livraison.
- **Afterpay / Clearpay** — techniquement **indisponible** pour une entreprise française. Ne pas le
  proposer dans l'UI, ne pas l'inscrire dans une liste d'attente.

## 5. Ce qu'il ne faut pas faire

- **Activer 12 moyens d'un coup.** Chacun a ses règles de remboursement, de capture et de litige.
  Un moyen activé sans que ces règles soient comprises se paie au premier litige, en production.
- **Coder un moyen de paiement en dur** (fixer `payment_method_types`, ajouter un SDK) au lieu de
  l'activer au dashboard. Ce serait sortir du choix de l'ADR-001 sans le rouvrir.
- **Faire confiance à la page de retour du navigateur.** L'onglet peut être fermé, l'URL forgée. La
  source de vérité est le **webhook signé** — `/merci` affiche, elle ne décide pas.
- **Introduire une base de données.** Règle permanente Alure n°4 : pas de BDD ni de comptes en v1,
  source de vérité = Stripe. Le webhook ne fait que notifier ; l'idempotence en mémoire est la
  bonne réponse à ce périmètre, pas un pis-aller.
- **Graver un fait volatil de mémoire** : commission, délai de versement, seuil, règle juridique,
  disponibilité pays. Tout ce qui n'est pas ✅ ci-dessus se vérifie contre `docs.stripe.com`.

## 6. Index

| Document | Rôle |
|---|---|
| [`./boutique.md`](./boutique.md) | La spec LOT 2 — le socle réellement livré (T1-T4) et T5 en attente |
| [`../adr/001-paiements-stripe.md`](../adr/001-paiements-stripe.md) | La décision : Stripe seul, Checkout redirigé, PayPal au dashboard, sans BDD |
| [`../architecture/PAIEMENTS.md`](../architecture/PAIEMENTS.md) | L'architecture du back paiement (flux, contrats, invariants) |
| [`./paiement-socle-checkout.md`](./paiement-socle-checkout.md) | Le contrat du socle **livré** (Checkout + webhook) et les vérifications à passer dessus |
| [`./paiement-cartes.md`](./paiement-cartes.md) · [`./paiement-wallets.md`](./paiement-wallets.md) · [`./paiement-paypal.md`](./paiement-paypal.md) | Groupe (A) — à activer |
| [`./paiement-fractionne.md`](./paiement-fractionne.md) · [`./paiement-sepa.md`](./paiement-sepa.md) · [`./paiement-locaux-europe.md`](./paiement-locaux-europe.md) | Groupe (B) — sans objet aujourd'hui |

Sources Stripe lues le 2026-08-05 : `payments/payment-methods/payment-method-support` ·
`payments/checkout-sessions-and-payment-intents-comparison` · `webhooks` · `api/idempotent_requests`.
