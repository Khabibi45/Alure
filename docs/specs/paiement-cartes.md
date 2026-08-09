# Spec — Paiement par carte

Statut : `brouillon`
Date : 2026-08-05
Socle : `docs/specs/boutique.md` (LOT 2, T1 à T4 **livrées**). Cette spec ne le réimplémente pas.

## 0. État réel au 2026-08-05

**Le paiement par carte est LIVRÉ** — il fonctionne dès que les clés Stripe sont posées. Relu
fichier par fichier :

| Élément | État |
|---|---|
| `src/lib/shop/stripe.ts` — `checkout.sessions.create`, `mode: 'payment'`, `locale: 'fr'`, retours sur `SITE.url`, livraison FR uniquement | livré |
| `POST /api/checkout` — rate-limit 10/min/IP, plafond de taille (413), JSON sûr, zod, `orderableError`, réponse `{ url }`, 503 sans clé | livré |
| `POST /api/stripe-webhook` — signature obligatoire sur corps brut, idempotence, 500 si l'email échoue | livré |
| Montant recalculé serveur (`PRODUCT.unitAmountCents`) — le client n'envoie que `{ coloris, quantite }` | livré |
| CSP | **aucun ajout** — redirection pleine page, zéro script Stripe sur notre domaine |

**Aucune ligne de code n'est à écrire ici.** `payment_method_types` n'est délibérément pas fixé
(commentaire explicite dans `stripe.ts`) : les moyens de paiement se pilotent depuis le **dashboard
Stripe**. Cette spec est donc une liste de vérifications et une recette en mode test. **Reste à
faire** : la part carte de **T5 de `boutique.md`**, bloquée en attente des clés Stripe test (Logan).

## 1. Exigences

- **Problème / valeur** : la carte est le moyen universel (fait vérifié le 05/08/2026 : « Cartes :
  universel » dans la table de prise en charge Stripe) — le chemin par défaut de tout acheteur qui
  n'utilise ni PayPal ni portefeuille. Rien à construire, tout à vérifier avant le mode live.
- **Critères d'acceptation** (observables, en mode test) :
  - [ ] Carte de test acceptée → retour `/merci`, emails reçus (client + support), montant exact
        (quantité × 21,99 €), coloris exact.
  - [ ] Carte de test refusée → le client **reste sur la page Stripe**, qui affiche la cause en
        français (`locale: 'fr'`) et lui permet de réessayer. Notre site n'affiche rien : il n'a pas
        la main (voir §2).
  - [ ] Annulation depuis la page Stripe → retour `/leurre` (`cancel_url`), page fonctionnelle, sans
        message d'erreur parasite.
  - [ ] Les erreurs **qui nous appartiennent** (avant la redirection) restent distinctes et
        actionnables sous le bouton « Acheter » : coloris épuisé, quantité invalide, 429 rate-limit,
        503 paiement non configuré, connexion interrompue. Jamais un « Erreur » seul.
  - [ ] Aucun blocage CSP dans la console de `/leurre`, aucun domaine tiers chargé, aucun log serveur
        contenant une donnée de carte, un email ou une adresse client.
- **Hors-scope** : PayPal, portefeuilles, SEPA, fractionné (specs dédiées) · interface interne de
  remboursement · logos de réseaux (Visa, Mastercard, CB), conditions d'usage de marque non
  vérifiées → rien à l'écran (règle n°6).

## 2. Design

- **Ce qui est chez nous, ce qui est chez Stripe** — c'est LE point de cette spec :

  | Moment | Où ça se passe | Ce qu'on affiche |
  |---|---|---|
  | Coloris / quantité | `/leurre`, îlot `BuyBox` | prix total, délai 10-20 j, erreurs de validation |
  | Création de session | `POST /api/checkout` | erreur typée (400/413/429/500/503) sous le bouton |
  | Saisie de carte, 3-D Secure, refus | **page Stripe** | rien — nous n'avons ni le formulaire ni le code de refus |
  | Succès | `/merci` (noindex) | message générique + délai ; la confirmation fait foi par email |
  | Annulation | `/leurre` (`cancel_url`) | page normale |

  Conséquence : **on ne spécifie aucune UI de refus bancaire.** Une table `decline_code` → message
  serait du code mort — la redirection pleine page ne nous rend jamais ce code. Les messages de refus
  sont ceux de Stripe, en français.
- **États** : ceux déjà livrés dans `BuyBox`, en union discriminée — `idle` / `loading` (bouton
  désactivé, `aria-busy`) / `error` (`role="alert"`, message du serveur, sélection conservée).
- **SEO / images / animations / responsive** : rien de neuf. `/merci` reste `noindex` et hors sitemap
  (livré) ; la page de paiement est celle de Stripe.
- **Tiers** : Stripe, en redirection. **Zéro ajout CSP, zéro cookie tiers sur notre domaine** — les
  tableaux vides de `next.config.ts` sont corrects, pas une dette. RGPD : email et adresse collectés
  par Stripe pour l'exécution du contrat, déjà déclaré dans `/confidentialite`.

### À vérifier ou à décider

- **CB (Cartes Bancaires)** : le schéma domestique français existe chez Stripe ; son activation
  exacte et son comportement en Checkout sont **à vérifier contre docs.stripe.com**.
- **SCA / 3-D Secure** : l'authentification forte est déclenchée et affichée par **la page Stripe** ;
  nous n'écrivons aucun code 3DS et n'en écrirons pas. Périmètre exact (pays, montants, exemptions)
  **à vérifier contre docs.stripe.com** — aucune affirmation juridique ici.
- **Capture** : session créée en `mode: 'payment'` sans demander de capture différée → comportement
  par défaut de Stripe (**modalités exactes à vérifier contre docs.stripe.com**). Différer n'aurait
  de sens que si l'expédition était incertaine ; elle ne l'est pas. **Ne pas ouvrir ce chantier.**
- **Remboursement** : **depuis le dashboard Stripe, à la main.** Sous 10 commandes/jour, un endpoint
  interne serait une surface d'attaque pour zéro gain (s'il existait, il devrait porter une clé
  d'idempotence — fait vérifié). Décision : dashboard seul.
- **Retour d'annulation** : `cancel_url` renvoie sur `/leurre` **sans paramètre**, et l'îlot remonte
  sur ses valeurs par défaut (premier coloris disponible, quantité 1) — la sélection n'est donc
  **pas** conservée, contrairement à un critère de `boutique.md`. À constater au T5 puis **à
  trancher** : accepter (produit unique, coût nul) ou passer la sélection en paramètre.

## 3. Tâches

Aucune tâche d'implémentation — tout est conditionné aux clés Stripe test (Logan).

- [ ] **T1 — Vérification documentaire** : CB, déclenchement 3DS, capture par défaut, remboursement.
      Reporter les faits **datés** dans `docs/standards/WEB-REFERENCE.md`, remplacer les
      « à vérifier » ci-dessus.
- [ ] **T2 — Dashboard** : constater les schémas de cartes actifs sur le compte, activer CB si T1 le
      justifie. Aucun commit.
- [ ] **T3 — Recette carte en mode test** (part carte de T5) : paiement accepté → `/merci` + emails +
      montant exact · carte refusée → **consigner** le comportement réel de la page Stripe ·
      annulation → retour `/leurre` · remboursement test depuis le dashboard. Rappel : une Checkout
      Session expire après 24 h (fait vérifié) — un lien mis de côté ne se rouvre pas le lendemain.
- [ ] **T4 — Trancher le retour d'annulation** et corriger le critère de `boutique.md`.

## 4. Vérification

- **Tests** (vitest) — **backend uniquement, aucun test de composant** (règle du propriétaire). Le
  socle est **déjà couvert** par `src/app/api/checkout/route.test.ts` (400 / 413 / 429 / 500 / 503 et
  session créée) et `src/app/api/stripe-webhook/route.test.ts` (signature valide, invalide, absente ;
  doublon → un seul envoi ; échec d'envoi → 500 sans marquer l'événement traité). **Cette spec
  n'ajoute aucun test** : elle n'ajoute aucun code, et on ne fabrique pas un test de façade.
- **Gate** : `web-quality-gate` (tsc / eslint / vitest / build) + navigateur réel 375 px et desktop,
  console sans erreur ni blocage CSP, parcours clavier jusqu'au bouton « Acheter ».
- **Audits concernés** : sécurité (routes API, secrets, zéro donnée client en log) · RGPD (Stripe
  sous-traitant, déjà dans `/confidentialite`) · a11y (erreurs annoncées via `role="alert"`).
