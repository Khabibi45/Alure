# Spec — Prélèvement SEPA (`sepa_debit`)

Statut : `brouillon` — **gelée, sans objet aujourd'hui**
Date : 2026-08-05

## 0. État réel au 2026-08-05

**Sans objet aujourd'hui.** Le prélèvement SEPA est **asynchrone** : la validation du client ne
prouve pas le règlement, qui peut être rejeté après coup. Pour un **achat unique de 21,99 €**
expédié en **dropshipping**, cela introduirait un état « en attente » **durable** et le risque
d'expédier avant confirmation — pour aucun bénéfice. C'est la raison de fond.

Ce qui est **livré** (LOT 2, `docs/specs/boutique.md`) : Stripe Checkout en redirection pleine page,
`mode: 'payment'`. `src/lib/shop/stripe.ts` **ne fixe volontairement pas** `payment_method_types` —
les moyens se pilotent depuis le dashboard Stripe. Activer `sepa_debit` serait donc **un réglage de
dashboard** : le coût n'est pas là, il est dans **tout ce qu'il faudrait changer autour** (§2).

## 1. Exigences

- **Faits vérifiés le 05/08/2026 contre docs.stripe.com** : `sepa_debit` — devise **EUR**,
  entreprise **UE** (FR éligible), clients **Europe**. C'est le **modèle d'achat** qui rend le moyen
  inadapté, pas la disponibilité.
- **Non vérifié, donc non affirmé** : délai de règlement, fenêtre de rejet, fenêtre de contestation,
  frais, commission — *à vérifier contre docs.stripe.com*. Aucune durée, aucun chiffre ici.
- **Critères d'acceptation** : aucun, rien n'est à livrer. Observables du gel :
  - [x] `src/lib/shop/stripe.ts` ne mentionne pas `sepa_debit` — et n'a pas à le faire.
  - [x] Le webhook n'a **aucun** état « en attente » à représenter : `checkout.session.completed`
        signé ⇒ envoi des deux emails, point final.
- **Hors-scope** : tout, et en particulier toute persistance — `CLAUDE.md` règle Alure n°4 : pas de
  BDD, source de vérité = Stripe.

## 2. La leçon de modélisation — la seule partie qui mérite de survivre

Aujourd'hui le modèle du paiement est **binaire** : `checkout.session.completed` signé = payé, et
`src/app/api/stripe-webhook/route.ts` n'a qu'à notifier. C'est exact **parce que** tous les moyens
actifs sont synchrones.

**Ouvrir SEPA rendrait ce modèle FAUX.** Un moyen asynchrone crée un état intermédiaire de premier
rang — « le client a validé, la banque n'a pas encore réglé » — et un **échec tardif** qui peut
arriver *après* qu'on ait considéré la commande comme payée, voire après expédition. Un booléen
payé / pas-payé ne peut pas représenter ça : il afficherait un faux succès (règle n°5). Il faudrait
alors, dans l'ordre :
1. **Modéliser en union discriminée** (skill `web-illegal-states`) : rendre l'état illégal « expédié
   alors que non réglé » **impossible à représenter**, pas « possible mais on fait attention ».
2. **Écouter les échecs tardifs** dans le webhook (types d'événements exacts *à vérifier contre
   docs.stripe.com*, en s'abonnant **uniquement** aux types nécessaires — bonne pratique vérifiée).
   Rappel vérifié : **l'ordre des événements n'est pas garanti**.
3. **Ne jamais déduire le succès de l'URL de retour** : `/merci` reste sans détail de commande.
4. Ne rien conserver du RIB : il ne transite ni par notre serveur, ni par nos logs.

Cette leçon vaut pour **tout** moyen asynchrone qu'on activerait un jour, pas seulement SEPA.

## 3. Tâches

Aucune tâche ouverte. **Déclencheur de réouverture** : un **modèle d'abonnement** ou des **montants
récurrents** — le seul cas où SEPA paie sa complexité. **Aucun des deux n'est prévu** :
`docs/product/PRODUCT.md` décrit un achat unique, mono-produit, sans compte client.

Séquence le jour venu : (1) vérifier délais et fenêtres réels contre `docs.stripe.com`, les reporter
**datés** ici ; (2) refaire le modèle d'état avec `web-illegal-states` **avant** toute activation ;
(3) activer dans le dashboard Stripe ; (4) tester en mode test le scénario **échec après
règlement**, celui qui casse tout ; (5) consigner dans `docs/PROGRESS.md`.

## 4. Vérification

- **Tests** : aucun aujourd'hui. Le jour venu, tests **backend uniquement** (règle du propriétaire),
  sur les transitions : « validé » ne devient jamais « payé » sans événement de confirmation ; un
  échec tardif ne revient jamais en arrière en silence ; même événement livré 2× ⇒ un seul effet.
- **Gate** : sans objet, aucun code ne change. **Tiers / CSP** : aucun ajout, ni aujourd'hui ni
  demain (page Stripe hébergée).
