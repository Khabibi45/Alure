# Spec — Paiement fractionné (Klarna, Alma)

Statut : `brouillon` — **gelée, sans objet aujourd'hui**
Date : 2026-08-05

## 0. État réel au 2026-08-05

**Sans objet aujourd'hui.** Le panier vaut **21,99 € port inclus**, quantité 1 à 5
(`src/lib/shop/product.ts`) — **109,95 € au maximum**. Payer 21,99 € en trois fois n'a de sens ni
pour le client, ni pour nous. C'est la seule raison qui compte, et elle suffit.

Ce qui est **livré** (LOT 2, `docs/specs/boutique.md`) : Stripe Checkout en redirection pleine page,
`mode: 'payment'`. `src/lib/shop/stripe.ts` **ne fixe volontairement pas** `payment_method_types` —
les moyens se pilotent depuis le dashboard Stripe. Donc **activer Klarna ou Alma serait un réglage
de dashboard, pas un chantier de code** : zéro composant, zéro route, zéro CSP. Cette spec ne
spécifie aucun travail — elle consigne pourquoi, et à quelle condition on rouvrirait le sujet.

## 1. Exigences

- **Problème / valeur** : le fractionné lève un frein sur un panier élevé. Le nôtre ne l'est pas.
- **Faits vérifiés le 05/08/2026 contre docs.stripe.com** :

  | Moyen | Devises | Pays entreprise | Pays clients |
  |---|---|---|---|
  | Klarna | EUR + 12 autres | **FR incluse** | AU AT BE CA FI **FR** DE CH |
  | Alma | **EUR uniquement** | **FR** | **FR** |

  Les deux sont **disponibles** pour Alure (entreprise FR, clients FR, EUR) : c'est le **montant**,
  pas la disponibilité, qui les rend inutiles.
- **Non vérifié, donc non affirmé** : un éventuel **montant minimum**, la commission, le délai de
  versement, le porteur du risque d'impayé — *à vérifier contre docs.stripe.com*. Aucun chiffre ici.
- **Critères d'acceptation** : aucun, rien n'est à livrer. Seul observable, celui du gel :
  - [x] `src/lib/shop/stripe.ts` ne mentionne ni Klarna ni Alma — et n'a pas à le faire.
- **Hors-scope** : tout, y compris toute persistance — `CLAUDE.md` règle Alure n°4 : pas de BDD, la
  source de vérité des commandes reste Stripe.

## 2. Design

Aucun : pas de fichier, pas de composant, pas de route, pas d'image. **Tiers / CSP : aucun ajout** —
Klarna et Alma sont rendus par la page Stripe hébergée ; la CSP vide de `next.config.ts` reste juste.
Seul artefact qu'une réouverture produirait : **du texte visible**, l'obligation d'**information du
consommateur sur le crédit** (identité du prêteur, coût, échéancier). ⚠️ **À faire valider
juridiquement** — jamais rédigée par un agent, jamais illustrée par un échéancier fabriqué (règle n°6).

## 3. Tâches

Aucune tâche ouverte. **Déclencheur de réouverture**, à franchir avant toute action :
- [ ] Le **panier moyen constaté** franchit un seuil qui rend le fractionnement pertinent — ce qui
      suppose un catalogue autre que le mono-produit à 21,99 € : **packs multi-coloris** (Phase 4 de
      `docs/ROADMAP.md`, « si la demande existe ») ou un **2ᵉ produit** nettement plus cher.
- [ ] Le seuil est une **décision du propriétaire**, prise sur le panier réel — pas sur une
      intuition, pas sur un chiffre écrit ici.

Séquence le jour venu : (1) vérifier contre `docs.stripe.com` montant min/max, commission, versement,
remboursement partiel et effet sur l'échéancier, reporter ces valeurs **datées** ici ; (2) trancher
Klarna / Alma / les deux (Alma = clients FR seuls, Klarna = 8 pays) ; (3) **activer dans le dashboard
Stripe** — l'« implémentation » ne touche pas le dépôt ; (4) faire valider la mention crédit ;
(5) tester en mode test, consigner dans `docs/PROGRESS.md`.

## 4. Vérification

- **Tests** : aucun. Rien à tester tant que rien n'est activé, et un réglage de dashboard ne
  s'unit-teste pas. Règle du propriétaire : tests **backend uniquement**, jamais un test de façade.
- **Gate** : sans objet, aucun code ne change. Le jour venu : parcours réel en mode test, puis
  `web-quality-gate` si du code a bougé.
