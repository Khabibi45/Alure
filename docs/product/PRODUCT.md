# Produit — Alure

> Détail opérationnel de CE site. Rempli via `web-product` (cadrage du 2026-08-05).
> Complète/écrase les défauts du `CLAUDE.md`.

## Pages

- **v1** :
  - `/` — **landing narrative** (la pièce maîtresse) : scroll narratif qui raconte le leurre —
    articulation 2 sections, nage, coloris, hameçons triples — et pousse vers l'achat. Le hero
    au scroll est livré en `position: sticky` CSS natif ; gsap et lenis sont restés hors du
    bundle (piège `pin` documenté dans `docs/standards/WEB-REFERENCE.md`).
  - `/leurre` — **page produit / achat** : choix du coloris, offre à deux paliers (Solo 21,99 € /
    Collection 43,98 € + collector offert — cf. `docs/specs/offre-collection.md`), délais
    visibles, checkout Stripe + PayPal.
  - `/suivi` — suivi de commande (sans compte : explication + numéro de suivi reçu par email).
  - `/faq` — délais, retours, rétractation, paiement, qui sommes-nous.
  - Légal : `/mentions-legales`, `/cgv`, `/retractation`, `/confidentialite`.
- **v2 (plus tard)** : packs multi-coloris mis en avant, avis clients réels (une fois collectés),
  éventuel 2ᵉ produit, migration headless Shopify + DSers si volume.
- Langue(s) : **français seul en ligne aujourd'hui**. Les traductions en/es/de/nl sont prêtes
  dans `docs/i18n/` et attendent une décision commerciale — livraison hors France, délais, TVA
  (cf. `docs/i18n/README.md`).

## Conversion & commerce

- Conversion principale : **achat du leurre** — Stripe Checkout + PayPal. Panier ~15-25 €.
- **Toute la logique commande vit dans `src/lib/shop/`** (produit, prix, coloris, création de
  session checkout, webhooks). Un seul module à rebrancher si migration Shopify plus tard.
- **Stock détenu en France depuis le 2026-08-28** : les commandes sont préparées et expédiées
  par nos soins, en enveloppe matelassée noire (fin du dropshipping). La source de
  vérité des commandes v1 = le dashboard Stripe/PayPal, **pas de BDD**.
- Email transactionnel (confirmation de commande, envoi du numéro de suivi) : **Resend**,
  depuis le domaine du site. La confirmation ré-affiche le délai de 3 à 5 jours ouvrés.
- Formulaire de contact/support (minimisation RGPD) : email + message + n° de commande
  (optionnel). Livraison via Resend → boîte support. Configuré dans `src/app/api/contact/route.ts`.

## Direction artistique

**Source de vérité : `assets/charte graphique/charte graphique alure proto/` (34 planches, V.01).**
C'est une **ébauche** signée par un designer, pas une charte figée — voir « décisions non tranchées »
plus bas. Le moodboard `assets/moodboard marque/` (12 affiches A4) en est la déclinaison appliquée.

Ambiance : le pêcheur en silhouette dans l'eau calme au coucher du soleil. Bleu nuit, eau miroir,
horizon chaud. Contemplatif et premium, jamais techno-gadget. À noter : dans la charte, **toute la
couleur chaude vient de la photographie** — l'habillage graphique, lui, reste bleu et blanc.

- **Identité** : wordmark « ALURE. » (avec le point) en capitales grasses blanches ; **flèche
  manuscrite** dessous (le lancer) = le geste signature. Lock-up : wordmark au-dessus, flèche
  dessous débordant à droite. Déclinaison observée : flèche répétée en filigrane très faible
  opacité comme motif de fond (planche 33).
  **TRANCHÉ le 2026-08-05 : c'est la flèche n°1** (planche 8 de la charte), celle déjà appliquée
  aux 14 affiches proto. Version blanche par défaut. La version noire (affiches 21-22) reste à
  cadrer comme variante pour fond clair.
- **Thème sombre unique** (pas de mode clair, pas de toggle) — assumé sur tout le site, pages
  légales comprises.
- **Palette — les 4 couleurs de la charte (planche 2), telles quelles** :

  | Nom charte | Hex | Rôle sur le site |
  |---|---|---|
  | Black Pearl | `#071128` | `--color-background` |
  | Mirage | `#20293e` | `--color-surface` |
  | Oxford Blue | `#394153` | `--color-border` |
  | White | `#ffffff` | `--color-foreground` + `--color-primary` (CTA blanc sur bleu) |

  Deux rôles que la charte ne couvre pas sont **dérivés** de ces 4 valeurs (jamais inventés) :
  `--color-muted` (creux, entre Black Pearl et Mirage) et `--color-muted-foreground` (Oxford Blue
  éclairci pour atteindre AA sur le fond — Oxford Blue brut ne fait que 1,8:1, illisible en texte).
  ⚠️ **La charte ne définit aucune couleur d'accent.** Le CTA est donc blanc sur bleu. Ne pas
  introduire d'orange/cyan « pour faire ressortir le bouton » sans décision explicite (voir plus bas).
- **Typographie — TRANCHÉ le 2026-08-05 : Glacial Indifference seule**, pour tout le site
  (titres, corps, chiffres), self-hostée via `next/font`. Licence SIL OFL (Hanken Design Co.) :
  aucun risque sur un site marchand.
  *Colette* et *Horizon*, demandées par la charte, sont **écartées** : polices Canva à licence
  webfont non vérifiable (plusieurs fonderies homonymes ; versions gratuites d'Horizon en usage
  personnel uniquement). Ne pas les réintroduire.
  Conséquence de design : la famille n'offre que Regular et Bold. **La hiérarchie se construit
  par la taille, la casse et l'interlettrage — pas par une pile de graisses.**
  ⚠️ Le wordmark « ALURE. » des affiches est dessiné en Colette. Il doit être livré en **tracés
  vectorisés** (c'est un logo, pas du texte vivant) ; si la licence Colette ne couvre pas l'usage
  logo, le redessiner en Glacial Indifference Bold.
- Ton des textes : **vouvoiement**. Un passionné qui parle à des passionnés : direct, précis,
  zéro superlatif creux. Charte `docs/standards/UI-COPY.md` applicable partout.
  ⚠️ La charte ne contient **aucun texte de marque** (ni slogan, ni accroche) : tout le copy du
  site est à écrire, il n'y a rien à reprendre.
- Niveau d'animation : **scroll narratif sur la landing uniquement** — livré en
  `position: sticky` CSS natif, gsap et lenis restés hors du bundle (piège `pin` documenté dans
  `docs/standards/WEB-REFERENCE.md`) ; framer-motion (tokens `src/lib/motion.ts`) partout
  ailleurs. `prefers-reduced-motion` : la landing doit rester lisible et complète sans aucune
  animation.
- Imagerie : **nos propres visuels uniquement** (rendus 3D / images et vidéos IA type Veo/Kling,
  générés d'après `assets/photos leurre pour 3d/reference-fournisseur/`). Jamais les photos
  fournisseur brutes (droits + emballage « Bite Times » visible dessus). Coloris jaune imitant
  Pikachu exclu (contrefaçon — il est sur les photos de référence, ne pas le reprendre).

### Décisions DA — état au 2026-08-05

**Tranché :** logo = flèche n°1 blanche · typographie = Glacial Indifference seule ·
palette = les 4 couleurs de la charte, sans accent (CTA blanc).

**Encore ouvert :**
1. **Couleur d'accent** : aucune n'existe dans la charte. À rouvrir seulement si le CTA blanc
   ne convertit pas — décision guidée par les données, pas par le goût.
2. **Variante noire du logo** pour fond clair (facture PDF, impression) — à cadrer.

**À produire (la charte ne les fournit pas)** — c'est l'objet du brief
`docs/product/BRIEF-DESIGN-SYSTEM.md` : règles d'usage du logo (zone de protection, taille mini,
favicon), échelle typographique, système de lisibilité du texte sur photo, spécification des
composants e-commerce, et tous les visuels produit.

## Hébergement & services

- Hébergement : **Vercel**. Domaine : **non tranché** (décision reportée). Candidats vérifiés
  libres le 2026-08-05 : alure-peche.fr, alure.fish, alurefishing.com, alure-fishing.fr,
  alure-leurres.fr, alure.store (alure.fr est PRIS). ⚠️ À trancher + acheter avant la mise en
  ligne — `src/lib/site-config.ts` porte une valeur provisoire.
- Analytics : **Vercel Analytics** (sans cookie → pas de bannière de consentement pour ça).
- Services tiers prévus (chacun = CSP mise à jour dans le même commit + mention politique de
  confidentialité) : **Stripe Checkout**, **PayPal**, **Resend**, **Vercel Analytics**.

## Contraintes techniques & légales (surcharge de la stack par défaut)

- **Pas de BDD, pas de comptes utilisateurs en v1.** Source de vérité commandes = Stripe/PayPal.
- **Délai de livraison 3 à 5 jours ouvrés affiché HONNÊTEMENT avant l'achat** (page produit + FAQ +
  email de confirmation). Non négociable : les litiges font geler les comptes Stripe/PayPal.
- Micro-entreprise française : **TVA non applicable, art. 293 B du CGI** (à mentionner sur les
  prix/CGV). Rétractation 14 jours. Pages légales complètes dès la v1.
- gsap + lenis installés mais **hors du bundle** : le hero au scroll est livré en
  `position: sticky` CSS natif (piège `pin` : cf. `WEB-REFERENCE.md`). À n'importer que si une
  scène future l'exige vraiment.
