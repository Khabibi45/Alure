# Spec — PayPal (activation dans Stripe Checkout)

Statut : `brouillon`
Date : 2026-08-05
Dépend de : `docs/specs/boutique.md` (LOT 2, validée — T1 à T4 livrées) et de son socle
`docs/specs/paiement-socle-checkout.md`. **PayPal n'ajoute aucune brique technique à ce qui existe.**

## 0. État réel au 2026-08-05 — relu fichier par fichier dans le dépôt

| Élément | État |
|---|---|
| `src/lib/shop/stripe.ts` — session Checkout, `mode: 'payment'`, `locale: 'fr'`, redirection pleine page | **LIVRÉ** |
| `payment_method_types` dans le code | **délibérément non fixé.** Commentaire du fichier : « les moyens de paiement se pilotent depuis le dashboard Stripe (ne PAS fixer `payment_method_types` ici) » |
| `POST /api/checkout` et `POST /api/stripe-webhook` (gardes d'entrée, signature, idempotence, emails Resend) | **LIVRÉS + testés** (48 tests verts) |
| CSP | **aucun ajout** — zéro script Stripe sur notre domaine |
| PayPal proposé sur la page Checkout | **À FAIRE — un réglage de dashboard, pas une ligne de code** |
| PayPal déjà promis dans l'UI | **OUI, 5 endroits** (voir §1) — écart à refermer |

**Conséquence structurante** : ceci n'est pas une spec d'implémentation. Le code livré atteint déjà PayPal ; il reste (a) à l'activer, (b) à le vérifier, (c) à savoir ce qu'il change dans le parcours.

## 1. Exigences (le quoi & le pourquoi)

- **Problème / valeur** : le pêcheur français qui préfère payer depuis son compte PayPal plutôt que
  de saisir un numéro de carte sur une boutique qu'il découvre. **C'est la seule valeur réelle ici.**
  Faits vérifiés le 05/08/2026 contre docs.stripe.com : PayPal accepte l'**EUR** · la **France** est
  un pays d'entreprise supporté · les **clients sont acceptés dans le monde entier**.
- **La limite, dite honnêtement** : cette couverture mondiale n'apporte **rien** ici — le code fixe
  `allowed_countries: ['FR']` et « livraison hors France » est explicitement hors-scope de
  `boutique.md`. L'argument « PayPal pour les clients étrangers » ne vaudra que si la livraison s'ouvre.
- **Écart à refermer (urgent)** : le site **promet déjà** PayPal alors qu'il n'est pas activé —
  `BuyBox.tsx:203`, `src/app/leurre/page.tsx:11` et `:82`, `src/app/faq/faq-content.ts:35`,
  `src/app/cgv/page.tsx:42`. Une seule issue à choisir : **activer PayPal**, ou **retirer la promesse
  partout**. Annoncer un moyen de paiement absent de l'écran de paiement, c'est du litige — et les
  litiges gèlent les comptes (règle Alure n°1).
- **Critères d'acceptation** (observables) :
  - [ ] PayPal activé en **mode test** → la page Checkout l'affiche à côté de la carte, **sans
        aucune modification de `src/lib/shop/stripe.ts`**. Si un changement de code s'avérait
        nécessaire, l'hypothèse de cette spec serait fausse : s'arrêter et la rouvrir.
  - [ ] Paiement PayPal test réussi → `checkout.session.completed` → email client + notification
        support. Le webhook livré ne lit pas le moyen de paiement : rien à adapter.
  - [ ] Montant encaissé = quantité × 21,99 €, recalculé serveur depuis `PRODUCT.unitAmountCents`
        (le client n'envoie que `{ coloris, quantite }`) — identique en carte et en PayPal.
  - [ ] Retour PayPal → `/merci?session_id={CHECKOUT_SESSION_ID}` · abandon → `/leurre`. Client qui
        ne revient jamais : la session expire **seule après 24 h** (comportement natif Stripe,
        vérifié) — aucun email, aucun état à nettoyer chez nous.
  - [ ] **Remboursement et litige** PayPal via Stripe lus au dashboard **avant** le passage en live
        (*à vérifier contre docs.stripe.com — aucun délai ni pourcentage n'est écrit ici de mémoire*).
  - [ ] PayPal ajouté aux sous-traitants de `/confidentialite` (la page ne cite aujourd'hui que
        Stripe et Resend ; `PRODUCT.md` exige une mention pour chaque tiers).
- **Hors-scope** : SDK ou boutons PayPal maison (un seul tiers — décision `boutique.md`) · PayPal en
  abonnement ou fractionné · livraison hors France · toute persistance de commande (règle Alure n°4).

## 2. Design (le comment, avant le code)

- **Le parcours, tel qu'il sera** : le client quitte **déjà** notre site pour Stripe (redirection
  pleine page). Avec PayPal il part **un cran plus loin** — Stripe → PayPal → Stripe → `/merci`.
  Notre code ne voit ni ne pilote ce détour.
- **Le webhook reste la source de vérité, et c'est déjà le cas** : `/merci` n'affirme rien sur la
  base de l'URL, c'est `checkout.session.completed` signé qui déclenche les emails — un client qui
  paie et ferme l'onglet avant le retour est confirmé quand même. Rien à écrire pour ça.
- **Contenu, composants, états, images, animations, SEO, responsive** : **aucun.** Checkout affiche
  PayPal lui-même et rend ses propres pages ; les textes citant PayPal existent déjà et deviennent
  exacts une fois PayPal activé. Un éventuel logo PayPal de réassurance : WebP auto-hébergé (règle n°7).
- **Tiers / CSP** : **zéro ligne de CSP à toucher.** La sortie vers Stripe est une navigation
  top-level (`window.location.assign`, `BuyBox.tsx:76`), pas un `<form method="post">` :
  `form-action 'self'` n'est pas en cause. RGPD : la mention PayPal, ci-dessus.

## 3. Tâches (activation et vérification — jamais d'implémentation)

- [ ] **Décider** : activer PayPal, ou retirer la promesse des 5 fichiers listés en §1. Propriétaire.
- [ ] **Activer** PayPal au dashboard Stripe, en **mode test** d'abord. Prérequis exacts pour un
      compte français : *à vérifier contre docs.stripe.com*. Non-code → tracer dans `PROGRESS.md`.
- [ ] **Vérifier au dashboard avant le live** : remboursement (total et partiel), fenêtre et
      mécanique de litige, capture. *Tout est à lire sur place — ne rien écrire de mémoire.*
- [ ] **Tester de bout en bout** en mode test : se greffe sur **T5 de `boutique.md`**, pas un
      chantier séparé. Bloqué en attente des clés Stripe test (Logan).
- [ ] **Documenter** : PayPal dans les sous-traitants de `/confidentialite` + entrée `PROGRESS.md`.
- [ ] **Live** : réactiver PayPal en live au LOT 4 (l'activation test ne le fait pas), achat réel testé.

## 4. Vérification

- **Tests** (vitest, backend uniquement) : **aucun test nouveau.** Le moyen de paiement n'entre ni
  dans le schéma, ni dans le calcul de montant, ni dans le webhook — un test « PayPal » testerait
  le dashboard de Stripe.
- **Gate** : activer PayPal ne produit **aucun diff** à passer au gate — la preuve est le parcours
  test réel de T5. Retirer la promesse, si c'est le choix, touche du code → `web-quality-gate` complet.
- **Audits concernés** : RGPD (mention PayPal) uniquement. Sécurité et SEO : sans objet.
