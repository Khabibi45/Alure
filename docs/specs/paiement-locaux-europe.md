# Spec — Moyens locaux européens (Bancontact, iDEAL, EPS, P24, MB WAY, Multibanco, MobilePay)

Statut : `brouillon` — **gelée, sans objet aujourd'hui**
Date : 2026-08-05

## 0. État réel au 2026-08-05

**Sans objet aujourd'hui** — et ce n'est même pas un arbitrage, c'est une conséquence.
`src/lib/shop/stripe.ts` pose `shipping_address_collection: { allowed_countries: ['FR'] }` : **on ne
livre qu'en France**, et `docs/specs/boutique.md` met « livraison hors France » en hors-scope. Or
**chacun** de ces moyens ne sert que des clients hors de France : ils ne peuvent servir personne.

Ce qui est **livré** (LOT 2) : Stripe Checkout en redirection pleine page. `src/lib/shop/stripe.ts`
**ne fixe volontairement pas** `payment_method_types` — en activer un serait **un réglage de
dashboard** ; le vrai coût est ailleurs, dans **l'ouverture de la livraison à l'international**.

## 1. Exigences

- **Pays des clients — vérifiés le 05/08/2026 contre docs.stripe.com.** C'est la seule colonne qui
  décide ici, et elle suffit. Les **devises** acceptées par chacun de ces moyens n'ont **pas** été
  vérifiées : elles ne changeraient rien à la conclusion, donc aucune n'est écrite de mémoire —
  *à vérifier contre docs.stripe.com* le jour où le sujet se rouvre.

  | Moyen | Pays clients (vérifié) | Devises | Sert un client français ? |
  |---|---|---|---|
  | Bancontact | **BE** | à vérifier | non |
  | iDEAL ( \| Wero) | **NL** | à vérifier | non |
  | EPS | **AT** | à vérifier | non |
  | P24 | **PL** | à vérifier | non |
  | MB WAY | **PT** | à vérifier | non |
  | Multibanco | **PT** | à vérifier | non |
  | MobilePay | **DK, FI** | à vérifier | non |

  Sept lignes, sept « non ». Tant que `allowed_countries` vaut `['FR']`, le débat est clos.
- **Hors sujet, pour mémoire** : **virements bancaires** (`customer_balance`, EUR GBP JPY MXN USD,
  UE incluse) — seulement si une clientèle **B2B** apparaissait, ce qui n'est pas le modèle ;
  **Alipay** et **WeChat Pay** — ils ciblent les consommateurs chinois.
- **Non vérifié, donc non affirmé** : la part réelle de chacun de ces moyens dans son pays. Aucun
  chiffre de part de marché ici, ni de mémoire ni « de notoriété publique » (règle n°6).
- **Critères d'acceptation** : aucun, rien n'est à livrer. Seul observable, celui du gel :
  - [x] `src/lib/shop/stripe.ts` limite la livraison à `['FR']` et ne nomme aucun moyen local.
- **Hors-scope** : tout, y compris toute persistance — `CLAUDE.md` règle Alure n°4 : pas de BDD.

## 2. Design

Aucun : pas de fichier, pas de composant, pas de route. **Tiers / CSP : aucun ajout** — ces moyens
redirigent vers les banques depuis la page Stripe hébergée, jamais depuis notre domaine ; la CSP vide
de `next.config.ts` reste juste. Aucun logo dans `public/` : ceux qui s'affichent viennent de Stripe.

## 3. Tâches

Aucune tâche ouverte. **Déclencheur de réouverture — un seul, net** :
- [ ] **La livraison s'ouvre à l'international** : `allowed_countries` de `src/lib/shop/stripe.ts`
      contient au moins un pays hors France, sur décision du propriétaire (port, délais, retours,
      TVA hors France — chantier bien plus lourd que le paiement).

Le jour venu, **on n'activerait pas tout** : seulement **le moyen dominant du pays réellement livré**,
choisi sur du **réel** — trafic mesuré ou demandes clients reçues, daté dans `docs/PROGRESS.md`.
Inventer une justification (« les Néerlandais paient tous en iDEAL ») = **donnée fabriquée** (n°6).

Séquence : (1) pays de livraison tranchés ; (2) mesure datée du pays concerné ; (3) vérifier contre
`docs.stripe.com` les règles du moyen — remboursement, capture, **synchrone ou asynchrone**, litiges
(un moyen asynchrone impose d'abord la leçon de `docs/specs/paiement-sepa.md` §2) ; (4) **activer
dans le dashboard Stripe** ; (5) tester en mode test sur **appareil réel** (application bancaire) ;
(6) revoir périodiquement — un moyen sans transaction se désactive.

## 4. Vérification

- **Tests** : aucun aujourd'hui, et probablement aucun demain — ces moyens ne produisent pas de code
  serveur : ils transitent par la session Checkout et le webhook déjà testés (48 tests verts). Un
  test ne se justifierait que si un **moyen asynchrone** ajoutait un mapping d'état. Règle du
  propriétaire : tests **backend uniquement**, jamais un test de façade pour cocher une case.
- **Gate** : sans objet, aucun code ne change aujourd'hui.
