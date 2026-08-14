# Spec — Bandeau « objectif de commandes » (compteur réel à paliers)

Statut : `livrée` — validée le 2026-08-12 (décisions Camil : framing « engagement maximal,
honnêteté et mise en confiance » → objectif de lancement à compteur réel ; placement
accueil + page produit).
Date : 2026-08-12

> Consigne de Camil : un bandeau qui presse à l'achat — objectif 5 commandes, puis 10, 30,
> 50, 100… — mis à jour à chaque achat réel sur le site.

## 1. Exigences (le quoi & le pourquoi)

- **Problème / valeur** : le site ne raconte aujourd'hui aucune traction. Un compteur de
  commandes **réel**, présenté comme un objectif de lancement à paliers, transforme chaque
  achat en événement public et donne une raison d'acheter *maintenant* (faire partie des
  premiers) — **sans fabriquer d'urgence**.
- **La ligne rouge (non négociable, déjà validée dans `offre-collection.md` §2)** : aucun
  minuteur, aucun faux stock, aucun « X personnes regardent ». Le seul levier de pression
  autorisé est un **chiffre vrai** : le nombre de commandes payées, lu chez Stripe. Un
  compteur inventé ou « arrondi » serait une pratique commerciale trompeuse (et la règle n°6
  l'interdit).
- **Critères d'acceptation** (observables) :
  - [ ] Étant donné N commandes payées chez Stripe, le bandeau affiche N et le prochain
        palier de l'échelle `5 → 10 → 30 → 50 → 100 → 250 → 500 → 1000`.
  - [ ] Quand un paiement aboutit (webhook `checkout.session.completed` traité), le compteur
        affiché au prochain rendu de page reflète la nouvelle valeur — sans redéploiement.
  - [ ] Quand un palier est atteint, le bandeau vise le palier suivant (5 atteint → « objectif
        10 »), sans intervention manuelle.
  - [ ] Si Stripe est injoignable ou répond une erreur : le bandeau **n'apparaît pas** et une
        erreur explicite est loguée. Jamais un chiffre faux, jamais un « 0 » par défaut.
  - [ ] Le clic sur le bandeau mène à la page produit `/leurre`.
- **Hors-scope** : décrément en cas de remboursement (volume faible, à documenter comme
  limite) ; mise à jour en direct sans rechargement (SSE/WebSocket = over-engineering v1) ;
  toute persistance locale (règle Alure n°4 : pas de BDD, Stripe est la source de vérité).

## 2. Design (le comment, avant le code)

- **Contenu réel** : le compte vient de l'API Stripe (paiements réussis). Les textes suivent
  la charte `UI-COPY.md`. **Framing à choisir par Camil** :
  - **A. Objectif de lancement (recommandé)** — « Objectif lancement : N commandes sur 5 » +
    une ligne d'invitation. Honnête même à 0–2 commandes : le petit chiffre devient un récit
    de marque naissante (« faites partie des premiers ») au lieu d'une preuve sociale inversée.
  - **B. Early-bird identitaire** — « Soyez l'une des 5 premières commandes ». Vrai et
    vérifiable, mais s'épuise après les premiers paliers.
  - **C. Paliers à contrepartie réelle** — « à 50 commandes, on lance le coloris n°4 ».
    Le plus puissant, mais exige un engagement **réellement tenu** ; sinon c'est un mensonge.
- **Sections / composants** :
  - `src/lib/shop/orders-count.ts` (server-only) : compte les paiements réussis via l'API
    Stripe (paginé), encapsulé dans `unstable_cache` avec le tag `orders-count`.
  - `src/lib/shop/milestones.ts` : l'échelle `ORDER_MILESTONES` (constante nommée,
    anti-magic-number) + `nextMilestone(count)`. Logique pure, testable.
  - Le webhook (`src/app/api/stripe-webhook/route.ts`) appelle `revalidateTag('orders-count')`
    après un `checkout.session.completed` traité → « mis à jour à chaque achat » sans BDD.
  - `src/components/ui/OrdersBanner.tsx` (Server Component) : le bandeau lui-même.
- **États** : contenu (N + palier) / **absent** (erreur Stripe → log serveur, pas de rendu) /
  pas d'état loading visible (rendu serveur). Pas de skeleton pour un bandeau.
- **Placement (à trancher)** : bandeau fin au-dessus ou sous le header sur l'accueil seul, ou
  sur tout le site. Recommandation : accueil + page produit, discret (une ligne).
- **SEO** : aucun impact (pas de page nouvelle). Le bandeau est du contenu dynamique honnête.
- **Animations** : au plus un remplissage de jauge **une seule fois** (fondation §6, 0,55 s) ;
  `prefers-reduced-motion` → jauge affichée remplie, aucun compteur qui « tourne ».
- **Tiers** : aucun nouveau (Stripe est déjà là, appels côté serveur uniquement — zéro CSP).
- **Responsive** : une ligne à 375 px (chiffre + objectif), la même enrichie sur desktop.
- **Limite documentée** : un remboursement ne décrémente pas le compteur v1. Le chiffre reste
  « commandes passées », formulation choisie pour rester vraie.

## 3. Tâches (tranches verticales)

- [x] T1 — `milestones.ts` (échelle + `nextMilestone`) + tests vitest.
- [x] T2 — comptage `countPaidOrders()` dans `stripe.ts` (module d'isolation Stripe, règle
      Alure n°2) + cache taggé dans `orders-count.ts` + tests avec client Stripe mocké.
- [x] T3 — `revalidateOrdersCount()` dans le webhook (après idempotence, jamais avant) +
      test. Next 16 : `revalidateTag(tag, 'max')` — le profil est obligatoire ;
      l'expiration immédiate (`updateTag`) est réservée aux Server Actions.
- [x] T4 — `OrdersBanner` (Server Component, sections/) sur l'accueil (sous le hero, lien
      vers /leurre) et en tête de /leurre.

## 4. Vérification

- **Tests** : échelle de paliers (bornes : 0, 4, 5, 99, 1000+) ; comptage avec pagination
  simulée ; erreur Stripe → le module lève, le bandeau ne rend rien ; webhook → revalidation
  appelée exactement après le traitement réussi.
- **Gate** : `web-quality-gate` complet + vérification navigateur 375 px/desktop.
- **Audits concernés** : sécurité (le module ne logue aucune donnée client), a11y (contraste,
  lien focusable), qualité de code.
