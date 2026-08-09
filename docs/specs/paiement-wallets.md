# Spec — Portefeuilles : Apple Pay, Google Pay, Link

Statut : `brouillon`
Date : 2026-08-05
Socle : `docs/specs/boutique.md` (LOT 2, T1 à T4 **livrées**). Aucune ligne de code à écrire ici.

## 0. État réel au 2026-08-05

- **Link est déjà là.** Fourni d'office avec Stripe Checkout, zéro intégration (fait vérifié le
  05/08/2026). Il s'affiche sur la page de paiement sans qu'on fasse quoi que ce soit.
- **Apple Pay et Google Pay sont un réglage de dashboard.** `src/lib/shop/stripe.ts` ne fixe
  **délibérément pas** `payment_method_types` — le commentaire du fichier le dit. Activer un
  portefeuille ne touche ni le code, ni la CSP, ni un composant.
- **Redirection pleine page** : les boutons sont rendus sur le domaine de Stripe, pas sur le nôtre.
  Aucun script tiers chez nous, aucun fichier à servir depuis `public/` (vérifié : `public/` ne
  contient aucun fichier de vérification).
- **`/leurre` ne promet rien de dépendant de l'appareil** : la seule mention est « Paiement par carte
  ou PayPal, via Stripe » (`BuyBox`, liste de réassurance, FAQ, CGV). Zéro occurrence d'« Apple Pay »
  ou « Google Pay » dans `src/` ou `public/` — vérifié au grep. C'est l'état correct, à préserver.

**Reste à faire** : activer au dashboard, puis constater sur appareil réel pendant **T5 de
`boutique.md`** (bloqué en attente des clés Stripe test).

## 1. Exigences

- **Problème / valeur** : sur mobile, saisir un numéro de carte est le principal point d'abandon.
  Apple Pay, Google Pay et Link le suppriment (biométrie ou compte déjà connu), sur un trafic venu
  d'Instagram et TikTok donc quasi exclusivement mobile. Meilleur rapport valeur/effort du projet
  pour une raison simple : **l'effort est nul**. Aucun gain de conversion n'est chiffré ici — il
  n'existera que dans nos propres mesures (règle n°6).
- **Critères d'acceptation** (observables) :
  - [ ] Sur iPhone/Safari avec une carte dans Wallet, la page de paiement Stripe propose Apple Pay ;
        un paiement en mode test produit le même `checkout.session.completed` signé et les mêmes
        emails qu'une carte.
  - [ ] Sur Chrome avec un compte Google porteur d'une carte, idem avec Google Pay.
  - [ ] Sur un appareil sans portefeuille (contrôle négatif) : **rien ne s'affiche, aucune erreur**,
        la carte reste disponible. L'absence de bouton est un état normal, pas une panne.
  - [ ] **`/leurre` ne promet aucun moyen dépendant de l'appareil** : zéro logo, zéro mention
        « Apple Pay » / « Google Pay » en dur dans le JSX ou le contenu, zéro asset dans `public/`.
        Un grep du dépôt hors `docs/` ne renvoie rien. *(Règle n°6 : annoncer un bouton qui peut ne
        pas s'afficher chez le visiteur, c'est une donnée fabriquée.)*
  - [ ] Montant, coloris et collecte d'adresse FR identiques quel que soit le portefeuille (montant
        recalculé serveur, webhook inchangé), et **aucun ajout** dans `SCRIPT_EXTRA` / `FRAME_EXTRA` /
        `CONNECT_EXTRA` de `next.config.ts` — s'il en fallait un, c'est qu'on aurait changé de mode
        d'intégration.
- **Hors-scope** : détection JS de disponibilité du portefeuille côté client (du JS tiers avant le
  clic, pour rien) · bouton de paiement express sur `/leurre` (ce serait Elements : CSP, scripts,
  vérification de domaine — un autre projet) · les autres moyens de paiement.

## 2. Design

- **Contenu réel** : « Paiement par carte ou PayPal, via Stripe » reste vrai sur tous les appareils.
  Pour évoquer les portefeuilles, la seule formulation honnête est générique — du type « les moyens
  de paiement disponibles s'affichent à l'étape de paiement » : toute liste nominative devient fausse
  dès qu'un visiteur ouvre le site sur un appareil non compatible. **Par défaut : ne rien ajouter.**
- **Sections / composants** : **aucun**. Pas de `WalletButtons`, pas d'îlot client supplémentaire.
- **États** : « aucun portefeuille disponible » = état normal, silencieux. Le seul vrai risque est
  une **dégradation silencieuse d'exploitation** : un portefeuille non activé au dashboard ne produit
  aucune erreur, juste un bouton absent — il ne se détecte **que** par la recette sur appareil réel
  (T3), non automatisable.
- **SEO / images / animations / responsive** : sans objet, aucun asset ajouté — la page de paiement
  est celle de Stripe.
- **Tiers** : Stripe seul, en redirection. Zéro ajout CSP, zéro cookie tiers sur notre domaine. RGPD :
  Stripe est déjà déclaré sous-traitant dans `/confidentialite`, les portefeuilles n'ajoutent aucun
  traitement chez nous.

### À vérifier contre docs.stripe.com

- **Vérification de domaine Apple Pay** : elle est exigée pour afficher un bouton Apple Pay sur
  **notre** domaine (mode Elements). En redirection pleine page, le bouton vit sur le domaine de
  Stripe — la question ne se pose donc *a priori* pas de la même façon. **À vérifier avant
  d'annoncer quoi que ce soit** : c'est exactement le détail où une affirmation fausse coûte une
  fonctionnalité invisible en production.
- **Éligibilité** : Apple Pay et Google Pay couvrent « la plupart des devises », les pays dépendant
  d'Apple et de Google (fait vérifié). Notre cas — EUR, entreprise FR, clients FR — est le cas
  nominal, mais les conditions exactes du compte se lisent **au dashboard**, pas de mémoire.
- **Procédure de test** : comment tester Apple Pay et Google Pay en mode test (carte réelle du
  Wallet ? carte de test ?) — à vérifier avant la recette.

## 3. Tâches

- [ ] **T1 — Lecture** : docs.stripe.com sur la vérification de domaine (cas page hébergée),
      l'éligibilité et la procédure de test. Reporter les faits **datés** dans
      `docs/standards/WEB-REFERENCE.md`, remplacer les « à vérifier » ci-dessus.
- [ ] **T2 — Dashboard** : constater ce que Checkout active d'office (Link), activer Apple Pay et
      Google Pay si T1 ne révèle aucun prérequis manquant. Aucun commit.
- [ ] **T3 — Recette sur appareil réel** (avec T5 de `boutique.md`) : iPhone/Safari, Android ou
      Chrome, plus un contrôle négatif sans portefeuille. Résultat consigné dans `docs/PROGRESS.md`.
- [ ] **T4 — Garde-fou de contenu** : grep du dépôt hors `docs/` sur « Apple Pay » / « Google Pay »
      → zéro occurrence, et ajouter cette vérification à la checklist de mise en ligne.

## 4. Vérification

- **Tests** (vitest) — **backend uniquement, aucun test de composant** (règle du propriétaire). Cette
  spec n'introduit aucun code : le socle est déjà couvert par `src/app/api/checkout/route.test.ts` et
  `src/app/api/stripe-webhook/route.test.ts` (48 tests verts au total). Un portefeuille emprunte
  exactement le même chemin serveur qu'une carte. **Zéro test à ajouter** — on ne fabrique pas un
  test de façade pour cocher une case.
- **Non automatisable, et c'est la partie qui compte** : Apple Pay ne se teste pas en CI. Appareil
  réel obligatoire.
- **Gate** : `web-quality-gate` (tsc / eslint / vitest / build) + navigateur réel 375 px et desktop,
  console sans erreur ni blocage CSP.
- **Audits concernés** : sécurité (aucun ajout CSP à justifier) · RGPD (Stripe déjà déclaré) ·
  contenu (règle n°6 : aucune promesse d'un moyen qui peut ne pas s'afficher).
