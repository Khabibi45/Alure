# BRANCHEMENT STRIPE — la procédure, du compte vide à la première commande de test

> **Statut : runbook opérationnel.** Ce document ne décrit **aucun code à écrire** : le socle
> d'encaissement est livré et testé (48 tests verts). Il décrit la **configuration** — comptes,
> clés, variables d'environnement, dashboard, CLI — qui débloque la tâche **T5** de
> [`../specs/boutique.md`](../specs/boutique.md) : le parcours de bout en bout en mode test.
>
> Doctrine : [`PAIEMENTS.md`](./PAIEMENTS.md) · décision : [`../adr/001-paiements-stripe.md`](../adr/001-paiements-stripe.md)
> · contrat du socle : [`../specs/paiement-socle-checkout.md`](../specs/paiement-socle-checkout.md).
> **En cas de désaccord entre ce document et le code, le code a raison.**
>
> Les faits Stripe de ce document (commandes CLI, cartes de test, politique de re-livraison) ont été
> **vérifiés contre `docs.stripe.com` le 2026-08-06**. Ils bougent : les revérifier avant de s'y
> fier dans six mois. Rien n'y est écrit de mémoire.

---

## Ce que le site attend, exactement

Cinq variables, **toutes serveur**, dont trois secrets. Le modèle versionné est
[`.env.example`](../../.env.example) ; le fichier réel à remplir est **`.env.local`** (git-ignoré).

| Variable | Secret ? | Lue par | Si absente |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | **oui** | `src/lib/shop/stripe.ts:25` | `POST /api/checkout` → **503** + log. Elle porte plus loin qu'il n'y paraît : le client SDK est aussi instancié pour vérifier les signatures, donc sans elle le webhook tombe en **500** (et Stripe re-livre) |
| `STRIPE_WEBHOOK_SECRET` | **oui** | `src/lib/shop/stripe.ts:92` | `POST /api/stripe-webhook` → **503** + log |
| `RESEND_API_KEY` | **oui** | `src/lib/shop/emails.ts:82`, `/api/contact` | webhook → **500**, Stripe re-livre |
| `RESEND_FROM` | non | `src/lib/shop/emails.ts:88` | repli `Alure <onboarding@resend.dev>` |
| `ORDER_NOTIFICATIONS_EMAIL` | non | `src/lib/shop/emails.ts:113` | webhook → **500**, Stripe re-livre |

**Il n'y a pas de sixième variable, et surtout pas de clé publiable.** Une clé publiable
(`pk_…`) ne sert qu'à faire tourner **Stripe.js dans le navigateur** — Elements, Checkout embarqué.
L'ADR-001 a retenu Checkout en **redirection pleine page** : aucun script Stripe ne s'exécute sur
notre domaine, donc rien à charger, rien à authentifier côté client, et **zéro domaine Stripe à
ajouter à la CSP**. Une clé publiable posée dans `.env.local` ne serait lue par aucune ligne de code.
Elle redeviendrait nécessaire le jour d'une bascule vers un checkout embarqué — décision qui
rouvrirait l'ADR-001 **et** imposerait la mise à jour de la CSP dans le même commit (règle n°4).

---

## Étape 1 — le compte et la clé serveur (mode test)

1. Créer le compte sur [dashboard.stripe.com](https://dashboard.stripe.com) (ou, pour développer
   sans compte du tout, `stripe sandbox create --email …` — l'environnement expire au bout de
   7 jours et se transforme en vrai compte avec `stripe sandbox claim`).
2. **Vérifier que l'interrupteur « Mode test » est bien actif** avant de copier quoi que ce soit.
   Une clé `sk_live_` dans un `.env.local` de développement encaisse de vrais paiements.
3. Dashboard → **Développeurs → Clés API** → révéler la **clé secrète**. Elle ne s'affiche qu'une
   fois ; en cas de perte, on la régénère, on ne la récupère pas.
4. La coller dans `STRIPE_SECRET_KEY` de `.env.local`.

**Clé restreinte plutôt que clé secrète — la recommandation Stripe.** Ce site n'émet qu'**un seul**
appel à l'API Stripe : `checkout.sessions.create`. (La vérification de signature du webhook est un
HMAC calculé localement par le SDK : elle ne consomme aucune permission.) Une clé restreinte
(`rk_…`) limitée à **« Checkout Sessions : écriture »** suffit donc, et une fuite ne permettrait ni
de lire les clients, ni de rembourser, ni de virer les fonds. À faire au minimum pour le **mode
live** ; en test, la clé secrète simple est acceptable.

> **Où vivent les secrets.** En local : `.env.local`, git-ignoré, jamais commité. En production :
> Vercel → *Settings → Environment Variables*, en cochant **Sensitive** pour les trois secrets —
> la valeur devient alors en écriture seule et cesse d'apparaître dans l'interface et les logs.
> Un secret ne se met jamais dans le code, ni dans un commit, ni dans une capture d'écran.

---

## Étape 2 — Resend (les deux emails d'une commande payée)

Sans Resend, le webhook répond **500** sur chaque commande payée et Stripe re-livre l'événement :
c'est voulu (une commande payée ne reste jamais silencieusement sans email), mais ça rend le test
de bout en bout ininterprétable. À faire avant l'étape 4.

1. Compte sur [resend.com](https://resend.com) → **API Keys** → créer une clé (`re_…`) →
   `RESEND_API_KEY`.
2. `ORDER_NOTIFICATIONS_EMAIL` = l'adresse **que tu liras** pour commander chez le fournisseur.
3. `RESEND_FROM` : laisser **vide** tant qu'aucun domaine n'est vérifié chez Resend. Le repli
   `Alure <onboarding@resend.dev>` fonctionne pour le test — mais pas pour écrire à de vrais
   clients. Le domaine à vérifier dépend du domaine final, **non tranché** (`site-config.ts` porte
   `alure-peche.fr` en PROVISOIRE) : c'est un point du LOT 4.

---

## Étape 3 — la CLI Stripe et le webhook en local

Le webhook ne peut pas être testé sans elle : Stripe doit atteindre une URL, et `localhost` n'en est
pas une depuis l'extérieur. La CLI ouvre un tunnel et **signe** les événements qu'elle transfère.

```bash
npm install -g @stripe/cli
stripe login                     # code d'appairage + confirmation dans le navigateur
```

Puis, dans un terminal **dédié** qui reste ouvert pendant toute la session de test :

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
  --forward-to localhost:3000/api/stripe-webhook
```

Deux détails qui font perdre une heure quand on les rate :

- Le chemin est **`/api/stripe-webhook`**, pas `/webhook` : c'est celui de la route livrée.
- `--events` restreint le transfert aux **trois** types réellement traités. Tout le reste
  recevrait un 200 immédiat et polluerait la lecture.

**Pourquoi trois types et pas un.** `checkout.session.completed` signifie « le client a terminé le
tunnel », **pas** « l'argent est encaissé » — un moyen à notification différée le livre avec
`payment_status: 'unpaid'`, puis confirme (ou non) des jours plus tard via
`async_payment_succeeded` / `async_payment_failed`. La route lit donc `payment_status` et n'envoie
les emails que s'il vaut autre chose que `unpaid` ; sans les trois abonnements, une commande
réellement payée en différé ne recevrait **jamais** son email.

La commande imprime `Ready! Your webhook signing secret is 'whsec_…'`. **Ce secret-là** va dans
`STRIPE_WEBHOOK_SECRET` — pas celui du dashboard. Il **change à chaque nouveau `stripe listen`** :
le recoller dans `.env.local` puis **relancer `npm run dev`** (Next.js ne relit pas `.env.local` à
chaud). Trois terminaux au total : `stripe listen`, `npm run dev`, et un pour les commandes.

`stripe trigger checkout.session.completed` existe, mais **ne remplace pas le vrai parcours** :
l'événement synthétique n'a ni `customer_details.email` ni les `metadata` que notre session pose
(`coloris`, `quantite`). `toOrderSummary()` renverra `null`, la route répondra **200
`{ skipped: true }`** avec un log — comportement correct, mais qui ne prouve rien sur les emails.
C'est utile pour vérifier que la signature passe, rien de plus.

---

## Étape 4 — T5 : le parcours de bout en bout

Cartes de test **vérifiées le 2026-08-06** — date d'expiration future quelconque (`12/34`), CVC à
3 chiffres quelconque, code postal quelconque :

| Cas | Numéro |
|---|---|
| Paiement accepté | `4242 4242 4242 4242` |
| Refus générique | `4000 0000 0000 0002` |
| Provision insuffisante | `4000 0000 0000 9995` |
| Authentification 3D Secure requise | `4000 0025 0000 3155` |

Le parcours, dans l'ordre — chaque ligne est une observation, pas une intention :

- [ ] `/leurre` : choisir un coloris et une quantité, cliquer **Acheter** → redirection pleine page
      vers `checkout.stripe.com`.
- [ ] Sur la page Stripe : le libellé de la ligne est bien
      `Leurre Alure — articulé 2 sections · <coloris>`, la description mentionne la livraison
      incluse et « TVA non applicable, art. 293 B du CGI », le total est **21,99 € × quantité** et
      l'adresse de livraison n'accepte que la **France**.
- [ ] Payer avec `4242…` → retour sur **`/merci`**. La page est volontairement générique : elle ne
      lit même pas `session_id` et ne prouve aucun paiement (seul le webhook signé fait foi).
- [ ] Terminal `stripe listen` : `checkout.session.completed` transféré, réponse **200**.
- [ ] **Deux emails reçus** : la confirmation client (délai **3 à 5 jours ouvrés ouvrés** ré-affiché,
      rétractation 14 jours) et la notification interne « commande à traiter ».
- [ ] Montant de l'email = montant Stripe = `21,99 € × quantité`, au centime.
- [ ] **Annulation** : relancer un achat, quitter la page Stripe → retour sur `/leurre`, page
      normale, sans message parasite.
- [ ] **Refus** : `4000 0000 0000 0002` → Stripe affiche l'échec, aucun email n'est envoyé, aucune
      commande n'existe.
- [ ] **Idempotence** : dashboard → Développeurs → Événements → renvoyer manuellement le même
      `checkout.session.completed`. Attendu : **200 `{ duplicate: true }`** et **aucun second
      email**. *(Fait vérifié : un renvoi manuel n'annule pas les re-tentatives automatiques de
      Stripe, même s'il obtient un 2xx.)*
- [ ] **Sécurité, à faire une fois** : `curl -X POST http://localhost:3000/api/stripe-webhook -d '{}'`
      sans en-tête `Stripe-Signature` → **400**, et rien de traité.

Quand ces cases sont cochées, T5 est fait : le cocher dans `boutique.md` **et** dans
`paiement-socle-checkout.md`, et écrire l'entrée dans `PROGRESS.md`.

---

## Étape 5 — les moyens de paiement (dashboard, aucun code)

`src/lib/shop/stripe.ts` **ne fixe volontairement pas** `payment_method_types` — c'est la
recommandation officielle de Stripe (*dynamic payment methods*) et c'est ce qui rend le catalogue
pilotable depuis le dashboard. Activer un moyen = **un réglage**, jamais un commit.

Dashboard → *Réglages → Moyens de paiement*, en mode test d'abord. Pour ce panier (21,99 €, France
uniquement) : **cartes** (le socle), **Apple Pay / Google Pay** (le trafic Instagram/TikTok est
mobile), **Link** (fourni d'office), **PayPal** (déjà disponible — il suffit de l'activer).
Le filtre de pertinence complet, moyen par moyen, avec ce qui est **sans objet** et le déclencheur
qui le rouvrirait, est dans [`PAIEMENTS.md`](./PAIEMENTS.md#activer-un-moyen-de-paiement) : le lire
avant d'activer quoi que ce soit. Un moyen activé sans que ses règles de remboursement et de litige
soient comprises est une dette qui se paie au premier incident.

**Ce qui rend cette promesse vraie côté code** : la route webhook ne suppose plus qu'un paiement est
immédiat (elle lit `payment_status` et traite les événements différés). Activer un moyen à
notification différée est donc bien un réglage, pas un chantier — à condition que l'endpoint soit
abonné aux trois types de l'étape 6.

---

## Étape 6 — la production (LOT 4, pas avant)

Ne pas commencer cette étape tant que les bloqueurs du bas de page tiennent.

1. **Domaine tranché** et `SITE.url` mis à jour dans `src/lib/site-config.ts` — c'est lui qui bâtit
   `success_url` et `cancel_url` (jamais l'en-tête `Host`, qui serait un open redirect après
   paiement). Un domaine faux = un client renvoyé sur une page morte après avoir payé.
2. **Endpoint webhook** : dashboard → Développeurs → Webhooks → ajouter
   `https://<domaine>/api/stripe-webhook`, abonné à **exactement trois types** :
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`. Pas moins — sinon une commande payée par un moyen
   différé n'a jamais son email. Pas « tous les événements » non plus : ce serait du bruit sans fin.
3. Copier le **secret de signature de cet endpoint** (différent de celui de la CLI) dans la variable
   Vercel `STRIPE_WEBHOOK_SECRET` de l'environnement Production.
4. Les cinq variables dans Vercel, portée **Production**, les trois secrets cochés **Sensitive**.
   Prévoir des valeurs de test distinctes sur Preview : des clés séparées par environnement, c'est
   ce qui borne les dégâts d'une fuite.
5. **Bascule en mode live** : nouvelles clés (`sk_live_` / `rk_live_`), nouveau secret d'endpoint.
   Rejouer l'étape 4 en live avec un achat réel à 21,99 €, puis se rembourser depuis le dashboard.
6. **Re-livraison** — le comportement à connaître pour lire les incidents : en production, Stripe
   retente pendant **jusqu'à 3 jours** en backoff exponentiel ; en mode test, **3 fois en quelques
   heures**. C'est ce qui rend le 500 du webhook utile plutôt que dangereux.
7. **Rotation d'un secret** : deux secrets d'endpoint peuvent être actifs simultanément jusqu'à
   24 h. La façon exacte de couvrir cette fenêtre est **à vérifier contre `docs.stripe.com`** le
   jour où ça arrive.

---

## Ce qui reste bloquant avant d'encaisser un vrai euro

Aucun de ces points n'est du code — et aucun ne se contourne :

- **Libellés réels des 3 coloris** : `product.ts` porte encore « Coloris 1 (provisoire) », affiché
  tel quel sur la page de paiement Stripe et dans les emails. Le gate interdit la mise en ligne tant
  qu'ils existent (LOT 3).
- **Domaine non tranché** — voir étape 6, point 1.
- **Identité vendeur** dans `src/lib/legal-config.ts` : les pages légales restent `noindex` et hors
  sitemap tant qu'elle manque, et un e-commerce FR doit identifier son vendeur.
- **Médiateur de la consommation** : inscription obligatoire pour un e-commerce FR, à reporter dans
  `legal-config.ts`.
- **Stripe et Resend déclarés comme sous-traitants** dans `/confidentialite` (RGPD).
