# ADR-002 — L'offre à deux paliers remplace la quantité 1 à 5

Date : 2026-08-06 · Statut : `acceptée`

## Contexte

La boutique vendait le leurre à prix unique (21,99 €) avec un sélecteur de quantité 1 à 5
(`docs/specs/boutique.md`), puis un barème dégressif a été spécifié (25 € le premier, 13 € chaque
suivant — `docs/specs/panier-bareme-degressif.md`). Constat : **un choix binaire se décide, cinq
prix se calculent** — un curseur de quantité oblige l'acheteur à arbitrer plusieurs fois, et un
dégressif crée des paliers dominés qu'il découvre après coup.

## Décision

L'offre tient en **deux paliers** :

- **Solo** — 1 coloris au choix : **21,99 €**.
- **Collection** — les 3 coloris + le **collector noir offert** : **43,98 €**, soit exactement
  **2 × solo**. Le collector ne se vend jamais à l'unité — c'est une récompense, pas une remise.

## Alternatives considérées

- **Quantité 1 à 5 à prix unique** (périmètre initial de `boutique.md`) — écartée : sept
  arbitrages pour l'acheteur, aucun levier de panier moyen.
- **Barème dégressif 25 € / 13 €** (`panier-bareme-degressif.md`, archivée) — écartée : les
  paliers intermédiaires sont presque toujours un mauvais calcul, et une remise se compare à la
  concurrence là où un objet inachetable ne se compare à rien.

## Conséquences

- **`quantite` disparaît du schéma checkout** : le client n'envoie que
  `{ coloris, offre: 'solo' | 'collection' }`. Un champ qui ne veut plus rien dire finirait mal
  interprété.
- **Les montants ne se calculent que côté serveur**, via `OFFERS` et `totalCents()`
  (`src/lib/shop/product.ts`) — l'unique endroit où un prix existe.
- La spec de référence de l'offre est **`docs/specs/offre-collection.md`** ; `boutique.md` reste
  la référence du cadre (tunnel, pages, webhook, garde-fous).
- **L'ADR-001 reste valable** : Stripe Checkout en redirection, sans BDD, ne bouge pas — seule la
  structure de l'offre change.
