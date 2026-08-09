# ADR-001 — Stripe seul, en Checkout redirigé, sans base de données

Date : 2026-08-05 · Statut : `acceptée`

## Contexte

Alure est une boutique **mono-produit** : un leurre articulé à **21,99 € port inclus** (TVA non
applicable, art. 293 B du CGI), 3 coloris, quantité 1 à 5, **livraison France uniquement**. Micro-
entreprise française, dropshipping AliExpress, commandes traitées **à la main**, volume attendu
< 10/jour. Le site est une application Next.js unique : le seul « back » est constitué des route
handlers de `src/app/api/**`, et le seul backend qui compte est **l'encaissement**.

Contraintes qui ont cadré la décision :

- **Une seule personne** développe et maintient. Chaque intégration supplémentaire est une dette
  permanente, pas un coût ponctuel.
- **Pas de base de données ni de comptes en v1** — règle permanente Alure n°4 : la source de vérité
  des commandes est le dashboard Stripe. Ce n'est pas un manque à combler, c'est le périmètre.
- Le kit impose l'échec bruyant, l'isolation de tout tiers fragile derrière un module unique, et
  une seule source de vérité par sujet.
- Les délais 10-20 jours ouvrés doivent être visibles **avant** le paiement (règle Alure n°1) : le
  tunnel doit les porter, pas les cacher.

Cette ADR **consigne une décision déjà appliquée** : le code correspondant est livré, testé
(48 tests verts) et committé au LOT 2 (`docs/specs/boutique.md`, T1 à T4). Elle existe pour qu'on
ne la re-débatte pas sans son contexte. La doctrine détaillée est dans
[`../architecture/PAIEMENTS.md`](../architecture/PAIEMENTS.md).

## Décision

Le site utilise **Stripe comme prestataire de paiement unique**, via l'API **Checkout Sessions** en
**redirection pleine page** vers la page hébergée par Stripe (`mode: 'payment'`, `locale: 'fr'`).

Le paquet complet décidé :

1. **Redirection, pas d'embed.** Aucun script Stripe ne s'exécute sur notre domaine → **zéro ajout
   à la CSP**, zéro cookie tiers chez nous. `CONNECT_EXTRA` / `SCRIPT_EXTRA` / `FRAME_EXTRA` de
   `next.config.ts` restent vides **par choix**.
2. **PayPal passe par Stripe Checkout**, activé depuis le **dashboard Stripe** — pas de SDK PayPal
   séparé. `src/lib/shop/stripe.ts` ne fixe **délibérément pas** `payment_method_types` : les
   moyens de paiement se pilotent au dashboard. Conséquence structurante : **activer un moyen de
   paiement est un réglage, pas une modification de code.**
3. **Aucune base de données.** Le webhook ne fait que **notifier par email** (Resend) ; il ne crée
   aucune commande à persister. Source de vérité = dashboard Stripe.
4. **Idempotence du webhook en mémoire** : un `Set` borné à 1000 IDs d'événements. En serverless
   multi-instance, la borne est **par instance** — le doublon inter-instances reste possible et
   **accepté** : le pire cas est un email de confirmation en double, jamais une double commande.
5. **Le webhook signé est la seule source de vérité** d'un paiement. La page de retour du
   navigateur affiche, elle ne décide pas.
6. **Le montant est recalculé côté serveur.** Le client n'envoie que `{ coloris, quantite }` ; le
   prix vient de `PRODUCT.unitAmountCents`. Un montant venant du navigateur n'est jamais cru.
7. **Tout l'accès Stripe est isolé dans `src/lib/shop/`** (règle Alure n°2) — `product.ts`,
   `checkout-schema.ts`, `stripe.ts`, `emails.ts`, `errors.ts`, `jsonld.ts`. Aucun appel Stripe
   ailleurs. C'est un **dossier module par domaine**, et c'est le **point de greffe** d'une
   éventuelle migration Shopify.
8. **Checkout Sessions plutôt que Payment Intents** : c'est l'API que Stripe recommande ; Payment
   Intents est une API bas niveau à éviter sauf besoin explicite (vérifié contre docs.stripe.com le
   05/08/2026).

## Alternatives considérées

- **Stripe Elements / Checkout embarqué** — écartée : aurait imposé des scripts tiers sur notre
  domaine, une CSP à étendre et des cookies tiers chez nous, pour un gain purement visuel sur
  **une seule page**. À ce volume, le coût de sécurité et de maintenance dépasse le bénéfice.
- **SDK PayPal séparé à côté de Stripe** — écartée : deux intégrations, deux formats de webhook,
  deux vérifications de signature, deux sources de vérité à réconcilier à la main, pour moins de
  10 commandes/jour. PayPal est déjà disponible **dans** Stripe pour une entreprise française
  encaissant en EUR (vérifié le 05/08/2026).
- **API Payment Intents (bas niveau)** — écartée : beaucoup plus de code à écrire et à maintenir
  pour reconstruire ce que Checkout fournit déjà (page de paiement, collecte d'adresse, reçus,
  gestion des moyens de paiement). À ne rouvrir que sur un besoin explicite et écrit.
- **Shopify dès la v1** — écartée : abonnement mensuel récurrent et perte de contrôle du rendu
  (toute la direction artistique du site) pour un catalogue d'**un seul produit**. La migration
  reste possible plus tard : `src/lib/shop/` est le point de greffe prévu pour ça.
- **Encaissement auto-hébergé** — écartée sans discussion : ferait entrer des données de carte dans
  notre périmètre, avec les obligations de conformité correspondantes.

## Conséquences

**Ce qui devient plus simple**

- **Activer un moyen de paiement = un réglage au dashboard Stripe.** Aucun code, aucun composant,
  aucune CSP à toucher. Une décision produit se teste en minutes.
- Un seul SDK, un seul format de webhook, une seule mécanique de signature, un seul environnement
  de test. Un seul module à relire en audit de sécurité.
- **Zéro script tiers sur nos pages** : la CSP reste stricte et la performance n'est pas grevée par
  un SDK de paiement chargé sur chaque visite.
- Un changement d'API Stripe ne touche que `src/lib/shop/stripe.ts`.
- La migration Shopify future se branche sur `src/lib/shop/` sans réécrire les pages.

**Ce qui devient plus rigide**

- **Dépendance à un prestataire unique** : une panne, une suspension de compte ou un changement de
  politique Stripe est une panne d'encaissement du site. C'est aussi pourquoi la règle des délais
  honnêtes est non négociable — les litiges font geler les comptes.
- **Tarification subie** : commissions et délais de versement ne sont pas gravés ici (faits
  volatils, à lire sur stripe.com au moment voulu). La marge de négociation à notre échelle est
  **inconnue, à ne pas supposer**.
- **Le tunnel de paiement porte l'identité visuelle de Stripe, pas la charte Alure.** C'est le prix
  assumé de la redirection : l'acheteur quitte notre univers au moment exact de la conversion.
- Les moyens disponibles sont ceux que Stripe propose pour notre pays et notre devise. Exemple
  vérifié : Afterpay/Clearpay est réservé aux entreprises AU CA NZ GB US — donc indisponible pour
  une entreprise française.
- La déduplication en mémoire suffit **parce que** le webhook se contente de notifier. Si un jour
  il déclenche une action coûteuse (expédition automatique, débit, ouverture d'accès), c'est cette
  ADR qu'il faut rouvrir en premier — pas ajouter un stockage en douce.

**Ce qu'il faudrait faire pour revenir dessus**

Réécrire `src/lib/shop/stripe.ts` et les deux route handlers (`api/checkout`, `api/stripe-webhook`),
reconstruire la vérification de signature et le mapping de statut du nouveau prestataire, refaire
les tests des deux routes, et — seulement si le nouveau mode charge des scripts tiers — étendre la
CSP dans le même commit. Le reste du site n'est pas concerné : c'est exactement ce que garantit
l'isolation derrière un module unique. Le coût de sortie est réel mais **borné**, à condition
qu'aucun appel Stripe ne fuie hors de `src/lib/shop/`.
