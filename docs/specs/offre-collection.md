# Spec — L'offre Collection (deux paliers, une récompense)

Statut : `validée` — barème conçu le 2026-08-06 sur la consigne de Camil (« un plan facile à
comprendre qui incite le plus possible à payer le plus, le leurre de base est à 21,99 € »).
Remplace `./panier-bareme-degressif.md`, qui est archivé.

> **Addendum 2026-08-13 (consigne Camil) — le discours devient « 2 ACHETÉS, 2 OFFERTS ».**
> (Remplacé le lendemain — conservé pour la trace.) Barème inchangé, reformulation seule.
>
> **Addendum 2026-08-14 (consigne Camil) — l'offre devient « 3 ACHETÉS, LE 4e OFFERT AU
> CHOIX », et le BARÈME change.** Palier 2 : 65,97 € = 3 × l'unité, pour 4 leurres — et
> l'acheteur **choisit** son 4e : un coloris (même en double) ou le collector. Nouveau champ
> `cadeau` dans le schéma de checkout (obligatoire en offre groupée, validé zod + dispo),
> transmis en métadonnée Stripe, affiché sur le reçu (`checkoutLines` : 3 × l'unité + le
> cadeau nommé à 0,00 €) et dans les emails (`offerSummary`). `savingsCents` retombe à 0 —
> l'avantage est le cadeau, pas une remise : on n'affiche plus d'« économie ». Le sélecteur
> du 4e offert vit dans la BuyBox (3 coloris + tuile Pirate), défaut = Pirate.
> Toutes les règles d'honnêteté du §1 et §2 restent en vigueur telles quelles.

## 1. Le barème, et le raisonnement derrière

**Deux paliers. Pas trois, pas cinq.**

| | Ce qu'on prend | Prix | Prix par leurre |
|---|---|---|---|
| **Palier 1 — Solo** | 1 coloris au choix | **21,99 €** | 21,99 € |
| **Palier 2 — Collection** | **les 3 coloris** + le **noir collector offert** | **43,98 €** | **moins de 11,00 €** |

43,98 € = **2 × 21,99 €**. C'est littéralement « un leurre acheté, puis les 2 autres pour le
prix d'un » — et le noir vient par-dessus, offert, parce que les 3 sont réunis.

**Pourquoi deux paliers et pas un curseur de quantité :**

1. **Un choix binaire se décide ; une liste de cinq prix se calcule.** Un curseur 1→5 oblige
   l'acheteur à arbitrer sept fois. Deux paliers posent une seule question : *un, ou tous ?*
2. **Le pas est court et le gain est énorme.** +21,99 € fait passer de 1 à **4** leurres. Le
   prix par leurre tombe de 21,99 € à 11,00 € — il est **divisé par deux**. C'est le seul
   chiffre qui compte pour décider, et c'est celui qu'on affiche.
3. **Aucune option dominée.** Avec un dégressif classique, prendre 2 est presque toujours un
   mauvais calcul que l'acheteur découvre après coup. Ici il n'y a pas de piège : les deux
   paliers sont tous les deux défendables.
4. **Le collector n'est pas une remise, c'est une récompense.** Une remise se compare à la
   concurrence ; un objet qu'on ne peut pas acheter ne se compare à rien. Il ne se vend jamais
   à l'unité — c'est ce qui lui donne sa valeur, et c'est ce qui rend le palier 2 désirable
   au-delà de son prix.

**Ce qu'on n'affiche pas** : aucun prix barré, aucune « valeur de 87,96 € » fictive. L'économie
annoncée se calcule contre un prix **réellement pratiqué** (21,99 € × 3 = 65,97 €, donc 21,99 €
d'économie sur les coloris, plus le collector). Un prix de référence gonflé est une pratique
commerciale trompeuse, pas une astuce de conversion.

## 2. La progression — le « système de jeu »

Affichée en permanence dans l'îlot d'achat, elle se lit d'un coup d'œil : **où j'en suis, ce
qu'il me manque, ce que ça débloque.**

```
  ●━━━━━━━━━━━━━━○──────────────○
  1 leurre       3 leurres      Collection complète
  21,99 €        43,98 €        + le noir collector
```

Trois points, dans cet ordre, chacun avec son état :

| Point | Atteint quand | Ce qu'il dit |
|---|---|---|
| **1. Votre premier leurre** | toujours (dès qu'un coloris est choisi) | le coloris choisi, 21,99 € |
| **2. Les 2 autres pour le prix d'un** | palier Collection | +21,99 €, et les 3 coloris sont à vous |
| **3. Le noir collector** | palier Collection | offert — il ne se vend pas |

**Règles d'honnêteté qui priment sur l'effet de jeu** (règle n°6, `UI-COPY.md`) :
- Un point non atteint dit **ce qu'il faut faire**, jamais « plus que X pour… » avec un compte
  à rebours inventé.
- **Aucune urgence fabriquée** : pas de minuteur, pas de « plus que 3 en stock », pas de
  « 47 personnes regardent ». Rien de tout ça n'est vrai.
- La barre de progression se remplit **une seule fois** (fondation §6 : jauges 0,55 s, depuis
  la gauche, jamais en boucle), et `prefers-reduced-motion` l'affiche directement remplie.
- Le collector affiche un **cadenas** tant qu'il n'est pas acquis, jamais un faux « épuisé ».

## 3. Ce que ça change dans le modèle

`quantite` **disparaît** du domaine. Elle n'a plus de sens : on n'achète plus *n* fois le même
leurre, on prend **un coloris** ou **la collection**. Un champ qui ne veut plus rien dire est un
champ qui finira par être mal interprété.

```
checkoutSchema : { coloris, offre: 'solo' | 'collection' }
```

| Fonction (`src/lib/shop/product.ts`) | Rôle |
|---|---|
| `OFFERS` | les deux paliers : identifiant, prix en centimes, ce qu'ils contiennent |
| `totalCents(offre)` | **l'unique** endroit où un montant se calcule |
| `savingsCents(offre)` | l'économie, contre 21,99 € × 3 — un prix réellement pratiqué |
| `perLureCents(offre)` | le prix par leurre, **collector compris** : c'est l'argument |
| `checkoutLines(offre, coloris)` | les lignes envoyées à Stripe |
| `collectorIncluded(offre)` | vrai pour `collection` uniquement |

**Invariant testé** : la somme des lignes envoyées à Stripe vaut `totalCents(offre)` pour les
deux paliers. C'est ce qui interdit l'écart entre le montant affiché et le montant encaissé.

**Le collector n'entre dans aucun montant.** Il apparaît sur la page Stripe comme une ligne à
**0,00 €** nommée « offert » : l'acheteur voit ce qu'il reçoit, et le total ne bouge pas.

## 4. Moyens de paiement — carte ET PayPal

**La carte reste active.** L'inquiétude « les gens rentrent leur carte chez nous » ne s'applique
pas à cette architecture : le Checkout est en **redirection pleine page**, la carte est saisie
sur `checkout.stripe.com`, elle ne transite ni par notre serveur, ni par nos logs, ni par notre
domaine (ADR-001, `PAIEMENTS.md` § Sécurité). Retirer la carte d'une boutique française coûterait
la majorité des conversions pour supprimer un risque qui n'existe pas ici.

**PayPal s'ajoute à côté**, et c'est un **réglage de dashboard**, pas du code : `stripe.ts` ne
fixe volontairement pas `payment_method_types` (dynamic payment methods, recommandation Stripe).
L'îlot d'achat affiche les deux moyens **avant** le clic, pour que l'acheteur sache où il va.

**À FAIRE (Camil)** : activer PayPal dans le dashboard Stripe → *Réglages → Moyens de paiement*.
Tant que ce n'est pas fait, la page de paiement ne le proposera pas — le site, lui, est prêt.

## 5. Tâches

- [x] T1 — `OFFERS`, `totalCents`, `savingsCents`, `perLureCents`, `checkoutLines`, tests.
- [x] T2 — `checkoutSchema` en `{ coloris, offre }` ; route API et webhook alignés.
- [x] T3 — L'îlot d'achat : les deux paliers, la progression en 3 points, les moyens de paiement.
- [x] T4 — Les 5 langues.

## 6. Vérification

- **Tests** : les deux totaux exacts · l'invariant somme des lignes = total · le collector à
  0,00 € et absent du montant · un `offre` inconnu rejeté en 400 · le montant ne vient jamais du
  corps de la requête.
- **Gate** complet + navigateur réel 375 px / desktop.
- **Non couvert par un test, et ça ne peut pas l'être** : que PayPal apparaisse réellement sur la
  page Stripe — ça dépend du dashboard.
