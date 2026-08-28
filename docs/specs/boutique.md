# Spec — LOT 2 · Boutique (page produit, checkout, suivi, FAQ)

> ## ⚠️ SPEC PARTIELLEMENT REMPLACÉE
>
> Le périmètre « quantité 1 à 5 » décrit ici a été **remplacé le 2026-08-06** par l'offre à
> deux paliers (Solo 21,99 € / Collection 43,98 € + collector offert) :
> **[`./offre-collection.md`](./offre-collection.md)** (validée) **fait foi sur l'offre**.
> Cette spec reste la référence des LOTs et du cadre (tunnel, pages, webhook, garde-fous).

Statut : `en cours` (validée par Logan le 2026-08-05)
Date : 2026-08-05

## 1. Exigences (le quoi & le pourquoi)

- **Problème / valeur** : c'est le chemin de l'argent. Un visiteur convaincu par la landing doit
  pouvoir choisir un coloris, payer par carte ou PayPal, et recevoir une confirmation honnête —
  sans compte, sans friction, sans surprise (délais et prix annoncés avant le paiement).
- **Décisions produit (Logan, 2026-08-05)** : prix **21,99 €** port offert (TVA non applicable,
  art. 293 B du CGI) · **PayPal via Stripe Checkout** (une seule intégration ; à re-vérifier
  contre la doc Stripe à l'implémentation) · **3 coloris** au lancement · quantité 1 à 5.
- **Critères d'acceptation** (observables) :
  - [ ] Sur `/leurre`, le visiteur voit : prix 21,99 € port inclus, mention TVA, sélecteur des
        3 coloris (nom + visuel), quantité 1-5, **délai 3 à 5 jours ouvrés visible SANS scroller
        sur mobile 375 px**, et le récap des garanties factuelles (rétractation 14 j, paiement
        Stripe/PayPal).
  - [ ] Un coloris marqué indisponible dans les données produit est visible mais non
        sélectionnable, avec la mention « Épuisé ».
  - [ ] Cliquer « Commander » avec un coloris et une quantité valides redirige vers une page
        Stripe Checkout affichant le bon montant (quantité × 21,99 €) et le bon coloris.
  - [ ] Une requête de checkout avec coloris inconnu, quantité hors 1-5, ou payload malformé
        reçoit un JSON d'erreur typé (400) — jamais de session créée.
  - [ ] Paiement test réussi → redirection vers `/merci` qui ré-affiche le délai 3 à 5 jours ouvrés ;
        paiement annulé → retour `/leurre` avec sélection intacte.
  - [ ] `checkout.session.completed` (signature Stripe valide) déclenche : email de confirmation
        au client (récap commande + délai 10-20 j + lien rétractation) et notification à la boîte
        support. Signature invalide → 400, aucun email.
  - [ ] Si l'envoi d'email échoue, le webhook répond 500 (Stripe re-livrera) et loggue l'ID de
        session — jamais d'échec silencieux.
  - [ ] `/suivi` explique les 4 étapes réelles (confirmation → préparation → expédition avec n°
        de suivi par email → livraison 10-20 j) ; `/faq` répond aux questions délais, retours,
        rétractation, paiement, « qui sommes-nous » — sans une seule donnée inventée.
- **Hors-scope** : comptes clients, BDD, codes promo, packs multi-coloris (v2), avis clients,
  suivi colis en ligne (le n° de suivi arrive par email), multi-devise, livraison hors France.

## 2. Design (le comment, avant le code)

- **Contenu réel** :
  - Prix, quantités, délais : décidés (ci-dessus). Specs techniques du leurre : à extraire de la
    fiche fournisseur (longueur, poids, profondeur de nage) — **vérifiées sur l'échantillon reçu
    avant mise en ligne** (règle : specs réelles, pas recopiées aveuglément).
  - **Noms des 3 coloris + visuels produit : dépendance LOT 3** (pipeline rendus 3D/IA). Le code
    se construit avec 3 emplacements et des images de développement ; **le gate interdit la mise
    en ligne tant que les visuels et noms réels ne sont pas en place.**
  - Textes FAQ/suivi : à écrire au vouvoiement (charte UI-COPY), validés par Logan.
- **Sections / composants** :
  - `src/lib/shop/` — LE module isolé (règle Alure n°2) : `product.ts` (données produit :
    coloris, prix en **centimes**, disponibilité — source de vérité unique), `checkout-schema.ts`
    (zod partagé client/serveur : coloris ∈ liste, quantité 1-5), `stripe.ts` (création de
    session Checkout ; PayPal activé dans les moyens de paiement).
  - Routes : `POST /api/checkout` (mêmes gardes que la route contact : taille, JSON sûr, zod,
    rate-limit) → répond `{ url }` vers Stripe, et l'îlot client navigue dessus (le 303 envisagé
    ici ne fonctionne pas : un `fetch` ne suit pas une redirection cross-origin — voir la note
    d'implémentation de T2) · `POST /api/stripe-webhook` (vérification de signature sur corps brut,
    idempotence par ID d'événement).
  - Pages : `/leurre` (Server Component ; îlot client pour sélecteur coloris/quantité),
    `/merci`, `/suivi`, `/faq` (accordéon du kit).
  - Emails (Resend, module `src/lib/shop/emails.ts`) : confirmation client + notification
    support. ⚠️ Domaine d'envoi : en attente de l'achat du domaine — dev/test avec l'expéditeur
    de test Resend, bascule à l'achat (tâche listée en LOT 4).
- **États** : sélecteur → état sélectionné/indisponible ; bouton Commander → repos / chargement
  (désactivé pendant la création de session) / erreur (message sous le bouton, sélection
  conservée) ; `/merci` sans session valide → contenu générique honnête (pas de détails commande).
- **SEO** : `/leurre` = title/description uniques + **JSON-LD `Product`** (nom, prix 21,99 EUR,
  disponibilité) ; `/faq` = **JSON-LD `FAQPage`** ; `/merci` = `noindex` + exclu du sitemap ;
  `/suivi`, `/faq` au sitemap.
- **Images** : galerie produit (dépendance LOT 3) — WebP/AVIF via `scripts/optimize-images.sh`,
  `next/image` avec `sizes` mobile-first. Aucune photo fournisseur.
- **Animations** : sobres (framer, tokens motion) : apparition des sections, retour visuel à la
  sélection de coloris. Aucun gsap ici. `prefers-reduced-motion` : tout reste fonctionnel statique.
- **Tiers** : **Stripe Checkout en redirection pleine page** → aucun script Stripe sur le site,
  donc **zéro ajout CSP** (à re-vérifier au gate : la page ne doit charger aucun domaine tiers).
  Resend = appel serveur sortant (pas de CSP). RGPD : email/adresse collectés par Stripe pour
  l'exécution du contrat → à documenter dans la politique de confidentialité (tâche 6).
  Secrets : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` — serveur uniquement,
  `.env.local` git-ignoré, jamais de `NEXT_PUBLIC_*`.
- **Responsive** : 375 px d'abord. Mobile : galerie en balayage horizontal, **barre d'achat
  collante en bas** (prix + Commander) dès que le CTA principal sort du viewport. Desktop :
  galerie à gauche, panneau d'achat à droite.
- **Décisions notables** : pas de BDD (source de vérité = dashboard Stripe) ; montants en
  centimes partout ; PayPal via Stripe (pas de SDK séparé) ; redirection plutôt qu'embed Stripe
  (simplicité + zéro CSP + zéro cookie tiers sur notre domaine).

## 3. Tâches (tranches verticales)

- [x] **T1 — Module shop + checkout** : `src/lib/shop/` (product, schéma, stripe) + `POST
      /api/checkout` + tests (schéma, montants, refus coloris/quantité invalides). Vérifié au
      curl : 503 sans clé (échec bruyant), 400 + issues sur invalide.
- [x] **T2 — Page `/leurre`** : sections + îlot sélecteur + barre collante mobile + états +
      metadata/JSON-LD/sitemap + `/merci` (noindex). Visuels de développement.
      Note d'implémentation : la route répond `{ url }` (l'îlot navigue) plutôt qu'un 303 —
      un fetch ne peut pas suivre une redirection cross-origin vers Stripe.
- [x] **T3 — Webhook + emails** : `POST /api/stripe-webhook` (signature, idempotence) +
      `emails.ts` (2 gabarits au vouvoiement, délai ré-affiché) + tests (signature invalide,
      échec d'envoi → 500, retry après échec ré-envoie).
- [x] **T4 — `/suivi` + `/faq`** : contenus rédigés + accordéon natif `<details>` + JSON-LD
      FAQPage + sitemap. (L'« accordéon du kit » annoncé n'existait pas — le natif est plus
      accessible et sans JS.)
- [ ] **T5 — Bout en bout mode test** : parcours complet carte test + PayPal test → emails reçus,
      montants exacts, annulation, webhook rejoué (idempotence vérifiée).
      **Bloqué en attente** : clés Stripe test + compte Resend (Logan).

## 4. Vérification

- **Tests** (vitest, **backend uniquement**) : schéma checkout (bornes, coloris) · calcul des
  montants en centimes · route checkout (400 sur invalide, `{ url }` sur valide — Stripe mocké ;
  cf. note T2) · webhook (signature invalide → 400 ; événement dupliqué → un seul envoi ; échec
  Resend → 500 ; session terminée mais **non payée** → 200 sans email ; paiement différé abouti →
  emails). **48 tests verts au 2026-08-06.**
- **Gate** : `web-quality-gate` complet + parcours navigateur réel 375 px et desktop, clavier
  seul jusqu'au paiement.
- **Audits concernés** : sécurité (2 routes API, secrets, webhook) · SEO (Product, FAQPage,
  noindex `/merci`) · RGPD (politique de confidentialité mise à jour — données de commande,
  Stripe et Resend comme sous-traitants) · a11y (sélecteur coloris au clavier, annonces d'état).
