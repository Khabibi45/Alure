# Spec — Panier & barème dégressif

> ## ⚠️ SPEC PÉRIMÉE
>
> Le barème dégressif décrit ici (25 € le premier, 13 € chaque suivant) a été **remplacé le
> 2026-08-06** par l'offre à deux paliers : **[`./offre-collection.md`](./offre-collection.md)**.
> Ce fichier est conservé pour la trace de la décision, **il ne décrit plus le code**.

Statut : `PÉRIMÉ` · Date : 2026-08-06
Spec de référence sur le tunnel : [`./boutique.md`](./boutique.md) · socle technique :
[`./paiement-socle-checkout.md`](./paiement-socle-checkout.md) · doctrine :
[`../architecture/PAIEMENTS.md`](../architecture/PAIEMENTS.md).

## 1. Exigences (le quoi & le pourquoi)

- **Problème / valeur** : le site vend un leurre à prix unique. Un acheteur de leurres en achète
  rarement un seul — il veut plusieurs coloris pour couvrir plusieurs situations de pêche. Un
  barème dégressif transforme un panier à 25 € en panier à 38 ou 51 € sans coût d'acquisition
  supplémentaire. C'est le levier de panier moyen le moins cher à mettre en place.

- **Le barème, tranché** : **le 1ᵉʳ leurre à 25 €, chaque leurre suivant à 13 €.** Une seule
  phrase à annoncer, valable de 1 à 5.

  | Quantité | Total | Économie vs 25 € l'unité |
  |---|---|---|
  | 1 | **25,00 €** | — |
  | 2 | **38,00 €** | 12,00 € |
  | 3 | **51,00 €** | 24,00 € |
  | 4 | **64,00 €** | 36,00 € |
  | 5 | **77,00 €** | 48,00 € (−38 %) |

- **Critères d'acceptation** (observables) :
  - [ ] `totalCents(q)` vaut exactement 2500, 3800, 5100, 6400, 7700 pour q = 1…5.
  - [ ] `totalCents` **lève** hors des bornes `quantityMin`/`quantityMax` et sur un non-entier —
        jamais un montant approché.
  - [ ] L'îlot d'achat affiche le **total** du panier, la règle (« 25 € le premier, 13 € chaque
        suivant ») et, dès 2 leurres, l'**économie réalisée** — un montant exact, jamais arrondi.
  - [ ] La page de paiement Stripe montre **deux lignes** quand q > 1 : 1 × 25 € et (q−1) × 13 €.
        L'acheteur voit la remise appliquée, il ne la découvre pas dans un total opaque.
  - [ ] Le montant vient **toujours** du serveur. Le client n'envoie que `{ coloris, quantite }`.
  - [ ] Le total de l'email de confirmation est **égal au centime** au montant encaissé par Stripe.
  - [ ] Aucune page n'affiche plus « 21,99 € » ni « X € l'unité » comme s'il existait un prix
        unitaire unique — il n'en existe plus.

- **Hors-scope** : panier multi-produits, panier multi-coloris dans une même commande (une
  commande = **un** coloris × une quantité — la BuyBox actuelle), codes promo, seuils de
  livraison offerte, quantités > 5, persistance du panier entre deux visites.

## 2. Design (le comment, avant le code)

- **Contenu réel** : le barème vient de Camil (2026-08-06). Aucun chiffre inventé, aucune
  « valeur barrée » fictive : l'économie affichée est calculée contre le prix du 1ᵉʳ leurre
  (25 €), qui est un prix réellement pratiqué — pas un prix de référence gonflé (règle n°6, et
  un prix barré fictif est une pratique commerciale trompeuse).

- **Le modèle, et pourquoi il rend l'erreur impossible** (`web-illegal-states`,
  `web-anti-magic-string`) :

  `PRODUCT.unitAmountCents` **disparaît**. Le garder serait la source d'erreur n°1 : un
  « prix unitaire » n'existe plus, et tout code qui ferait `unitAmountCents × quantité`
  produirait un montant faux **en silence**. À la place :

  ```
  PRODUCT.pricing = { firstUnitCents: 2500, additionalUnitCents: 1300 }
  ```

  Toujours des **centimes entiers** (l'euro flottant produit des erreurs d'arrondi), et une
  seule fonction pour calculer un montant : `totalCents(q)`.

  | Fonction | Rôle | Garde-fou |
  |---|---|---|
  | `totalCents(q)` | **L'unique** endroit où un montant se calcule | lève hors bornes / non entier |
  | `savingsCents(q)` | Économie vs `firstUnitCents × q` | 0 pour q = 1, jamais négatif |
  | `checkoutLines(q)` | Les lignes envoyées à Stripe | leur somme **est** `totalCents(q)` |
  | `formatEuros(cents)` | Affichage only | ne calcule rien |

  **Pas de « prix unitaire moyen » affiché.** 77 € / 5 = 15,40 € tombe juste ici, mais c'est une
  coïncidence de ces deux nombres : au premier changement de barème, un `Math.round` afficherait
  un prix unitaire qui, remultiplié, ne redonne pas le total. On affiche la **règle** et
  l'**économie**, tous deux exacts par construction.

- **Stripe** : `line_items` passe de une à **deux** lignes (`checkoutLines`), la seconde absente
  quand q = 1. C'est ce qui rend la remise lisible sur la page hébergée. Le webhook ne change
  pas : il lit `amount_total`, donc le total encaissé — jamais un montant recalculé.

- **États** : inchangés (l'îlot d'achat a déjà loading / erreur / 503). Le changement de quantité
  recalcule le total côté client **pour l'affichage seulement** ; la vérité reste serveur.

- **SEO** : `metadata` de `/leurre` et JSON-LD `Product` portent le prix. `offers.price` = **25,00**
  (le prix pour un exemplaire, ce que paie un acheteur qui en prend un). Pas d'`AggregateOffer` :
  il annoncerait un `lowPrice` de 15,40 € qu'on ne peut pas payer à l'unité.

- **Images / animations / tiers / responsive** : aucun changement. Aucun service tiers ajouté,
  donc **aucune CSP à toucher**, aucun impact RGPD.

- **Textes à reprendre** (ils affirment tous un prix unitaire qui n'existe plus) :
  `/leurre` (metadata + BuyBox), `/faq`, `/cgv`, hero de l'accueil, emails.

## 3. Tâches (tranches verticales)

- [ ] **T1 — Le calcul.** `PRODUCT.pricing`, `totalCents`, `savingsCents`, `checkoutLines` dans
      `src/lib/shop/product.ts` + tests exhaustifs de 1 à 5 et des bornes.
- [ ] **T2 — Stripe.** `createCheckoutSession` consomme `checkoutLines` ; test que la somme des
      lignes égale `totalCents`.
- [ ] **T3 — Affichage.** BuyBox (total, règle, économie), hero, `/leurre`, FAQ, CGV, JSON-LD.
- [ ] **T4 — Emails.** Vérifier que le récapitulatif reste exact (il lit `amount_total`).

## 4. Vérification

- **Tests** (vitest, backend uniquement) mappés aux critères :
  - `shop.test.ts` : les 5 totaux exacts · bornes qui lèvent · `savingsCents` · **la somme de
    `checkoutLines(q)` égale `totalCents(q)` pour tout q** (l'invariant qui empêche un écart
    entre ce qu'on affiche et ce qu'on encaisse).
  - `checkout/route.test.ts` : le montant ne vient jamais du corps de la requête.
- **Gate** : `web-quality-gate` complet + navigateur réel 375 px / desktop.
- **Audits** : SEO (prix dans metadata et JSON-LD cohérents avec l'affichage).

## 5. Recette — changer les prix

Un geste voué à se répéter, donc standardisé. **Trois lignes à toucher, jamais plus.**

1. `src/lib/shop/product.ts` → `PRODUCT.pricing.firstUnitCents` et `additionalUnitCents`,
   **en centimes entiers**. C'est la seule définition de prix du dépôt.
2. `src/lib/shop/shop.test.ts` → les cinq totaux attendus (`2500, 3800, 5100, 6400, 7700`) et
   les deux économies. **Ils sont écrits en dur exprès** : le gate devient rouge tant qu'on ne
   les a pas mis à jour, ce qui force à regarder les nouveaux montants un par un au lieu de
   laisser une formule se valider toute seule.
3. Rien d'autre. Tous les affichages (hero, `/leurre`, FAQ, CGV, BuyBox, JSON-LD, Stripe,
   emails) dérivent de ces deux nombres.

**Ce qui empêche la dérive**, en plus des tests :
- il n'existe **pas** de `unitAmountCents` : rien à multiplier naïvement par une quantité ;
- la CI **refuse un montant en euros écrit en dur dans un `.tsx`** — les composants doivent
  passer par `formatEuros()` ;
- le test « la somme des lignes vaut `totalCents` » interdit l'écart entre le montant affiché
  et le montant encaissé, quel que soit le barème.

**Changer la forme du barème** (paliers, remise en pourcentage…) ne touche que `totalCents()`,
`savingsCents()` et `checkoutLines()` — les trois vivent côte à côte dans `product.ts`, et
`checkoutLines()` est ce qui rend n'importe quelle forme lisible sur la page Stripe.

## 6. La question ouverte — la livraison

Le site annonce aujourd'hui **« port inclus », France uniquement** (`allowed_countries: ['FR']`).
C'est vrai et ça le reste avec ce barème : rien n'a été ajouté au prix.

**Camil doit vérifier le coût réel d'expédition** (2026-08-06 : « en fonction des régions et des
pays ça va leur revenir beaucoup plus cher »). Deux issues, et une seule règle :

1. **Le port reste inclus** → rien à changer, les textes actuels restent vrais.
2. **Des frais de port apparaissent** → ils doivent être **affichés avant l'achat** partout
   (page produit, FAQ, récapitulatif checkout) et passés à Stripe en `shipping_options`, pas
   ajoutés en silence au total. C'est la règle Alure n°1 : un montant découvert au paiement est
   ce qui déclenche les litiges, et les litiges gèlent Stripe.

Ouvrir la livraison hors France est un **autre** sujet (hors-scope de `boutique.md`) : il
rouvrirait `allowed_countries`, la TVA/OSS et les délais annoncés. Ne pas le traiter en passant.
