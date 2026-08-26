# Spec — Le carrousel 3D, rendu explicite à l'achat

Statut : `livrée en partie` — le panier est en place (2026-08-25). Restent T7 et T8, cf. §3.
Date : 2026-08-25

> Consigne Camil : « il faut absolument que l'endroit du carrousel de leurre 3D soit le plus
> explicite possible à l'achat, qu'on puisse ajouter, savoir quel coloris on a ajouté au panier,
> combien de leurres on est, qu'on puisse rapidement en enlever un ou en ajouter, que tout soit
> possible et compréhensible au possible, pousser à l'achat au max. »

Cette spec sort d'un diagnostic à cinq lentilles du code livré (60 constats, dont 13 bloquants ou
majeurs ancrés fichier:ligne), de trois directions de conception concurrentes et d'un jury à trois
critères. La direction retenue est **« le panier ouvert : les quatre cases du colis »**.

---

## 1. Exigences

### 1.1 Le problème, mesuré sur le code actuel

Cinq défauts bloquants, chacun vérifié dans `src/components/sections/home/LureCarousel.tsx` :

| # | Défaut | Preuve | Ce que le visiteur subit |
|---|---|---|---|
| 1 | **À 2 leurres au panier, plus aucun bouton ne mène au paiement.** | `:451-456` — `buyColorway` vaut `undefined` dès `count === 2`, donc le `<Link>` de `:486-494` n'est pas rendu. | Il conclut que le site est cassé. |
| 2 | **« Acheter · 21,99 € » n'achète pas le leurre affiché.** | `:454-455` — dès `count === 1`, le lien cible `selection[0]`, alors que le nom du leurre affiché est imprimé juste au-dessus (`:380-382`). | Il paie un coloris qu'il ne regardait pas. |
| 3 | **Le panier ne montre jamais son contenu.** | `selection` n'est jamais parcourue : seuls `.length`, `.includes()` et `resolveOffer()` la consultent. `grep -rn 'selection\.map' src/` ne rend rien. | Il ne sait ni combien, ni lesquels. |
| 4 | **Retirer un leurre est impossible au clavier.** | `removeOne` n'est câblé que dans le pied de `LureSpecs`, ouvert uniquement par `endDrag` quand `movedRef.current < CLICK_SLOP` (`:222`) — un geste POINTEUR. `onKeyDown` (`:225-233`) ne gère que les flèches. | Au clavier, il ne peut pas se corriger. |
| 5 | **Le clic « Ajouter » fait disparaître le leurre ajouté.** | `addAndAdvance` (`:175-188`) ajoute puis pivote le carrousel dans le même geste. Aucun toast, aucun badge, aucune coche. | Il ne sait pas si son clic a marché. |

Deux défauts majeurs de portée plus large :

- **Le panier n'est jamais vidé après paiement.** `SELECTION_STORAGE_KEY` n'est jamais effacée
  (aucun `removeItem` dans `src/app/` ni `src/components/`), et le sessionStorage survit à
  l'aller-retour vers `checkout.stripe.com` dans le même onglet. Au retour sur l'accueil, le hero
  réaffiche « Commander les 4 · 65,97 € » à quelqu'un qui vient de payer.
- **Les boutons restent focusables quand ils sont invisibles.** `HeroScroll.tsx:319-323` applique
  `pointerEvents: 'none'` pendant le fondu, sans `inert` ni `aria-hidden` : `pointer-events` ne
  retire pas de l'ordre de tabulation.

### 1.2 Critères d'acceptation (observables)

- [ ] Étant donné n'importe quel état (0, 1, 2, 3 coloris, Pirate affiché, coloris épuisé, panier
      restauré, WebGL absent), quand j'arrive sur la bande basse, alors **au moins un chemin vers
      la caisse est visible sans défilement**.
- [ ] Étant donné un panier à 2 coloris, quand je lis la bande, alors le montant de l'offre et un
      lien de commande sont visibles, et une phrase dit qu'il n'existe pas de tarif pour 2 leurres.
- [ ] Étant donné un leurre affiché, quand je clique « Commander … seul », alors la page produit
      s'ouvre **sur ce coloris-là**, jamais sur un autre.
- [ ] Étant donné un clic sur « Ajouter », quand l'ajout est pris en compte, alors **le carrousel
      ne bouge pas** et la case du coloris passe visiblement à « au panier ».
- [ ] Étant donné le clavier seul, quand je parcours la bande, alors je peux ajouter, retirer,
      vider, ouvrir la fiche et atteindre les deux sorties, sans souris.
- [ ] Étant donné un lecteur d'écran, quand le panier change, alors une région `aria-live="polite"`
      **nomme** le contenu (« 2 coloris sur 3 : Truite arc-en-ciel, Perche »), jamais un simple
      compte.
- [ ] Étant donné un retour de paiement, quand je reviens sur l'accueil, alors le panier est vide.
- [ ] Étant donné `prefers-reduced-motion: reduce`, quand j'ajoute un coloris, alors la case change
      d'état **sans animation**.
- [ ] Étant donné un écran de 375 px, quand la bande s'affiche, alors les 4 cases tiennent sur une
      ligne, chaque cible fait au moins 44 px, et rien ne chevauche le leurre.

### 1.3 Hors-scope

- La page produit `/leurre` et son tunnel de paiement : inchangés. **Le hero compose et montre ;
  c'est `/leurre` qui encaisse.**
- Aucun appel à `/api/checkout` depuis le hero.
- Aucune nouvelle offre. Deux paliers, et deux seulement : 21,99 € / 65,97 €.

---

## 2. Design

### 2.1 La décision de fond : le panier devient un ENSEMBLE, pas un compteur

> **Règle retenue : le panier contient des coloris DISTINCTS. Un coloris y est, ou n'y est pas.
> Jamais deux fois le même, jamais plus de trois.**

C'est l'inverse exact du code actuel, qui autorise, teste et verrouille les doublons
(`collection-selection.ts:20-31`, et `collection-selection.test.ts:47` fige
`resolveOffer([C1, C1, C1])?.offre === 'collection'`).

**Pourquoi il faut changer.** L'offre groupée a un contenu fixe : `colorwayCount:
PRODUCT.colorways.length` (`product.ts:158`), et `offerSummary` écrit dans l'email client **et**
dans la notification fournisseur « 3 achetés — les 3 coloris + le 4e offert » (`product.ts:256`).
Aujourd'hui un visiteur peut composer trois fois Truite arc-en-ciel, lire « 3 achetés — votre 4e
leurre est offert », payer 65,97 €, et recevoir Truite + Perche + Orange feu. L'écart se découvre
à l'ouverture du colis, donc en litige — avec un email qui le contredit par écrit, et sans base de
données pour reconstituer quoi que ce soit. C'est le motif exact qui gèle un compte Stripe.

**La permission qu'on supprime était la permission de mentir sur le contenu du colis.** Le désir
d'un coloris en double n'est pas nié : il est déplacé là où il est vrai — le 4e leurre offert, qui
se choisit et peut être un doublon (`GIFT_CHOICE_IDS` le permet déjà, `BuyBox.tsx:104-171` le rend
déjà).

**Le gain structurel est gratuit.** Si les 3 payés *sont* les 3 du catalogue, la cardinalité
devient une propriété du domaine : plus de `.slice(0, paidCount)` à la relecture, plus de plafond
à faire respecter au runtime, plus de troncature silencieuse. L'état illégal devient
irreprésentable au lieu d'être surveillé.

**La conséquence assumée, et elle appartient à Camil.** Un coloris en `available: false` rend le
forfait « les 3 coloris » inexpédiable : **l'offre groupée se ferme, et on le dit**. Aujourd'hui
`/api/checkout` ne valide que le coloris décoratif (`route.ts:73`) et jamais les trois leurres
réellement facturés — le site encaisserait 65,97 € en promettant un colis qu'il ne peut pas
composer. C'est la décision la plus coûteuse commercialement de ce document. L'alternative est
d'encaisser à découvert.

### 2.2 L'anatomie de la bande basse

Tout flotte en `absolute` par-dessus le canvas, **jamais dans le flux** : le calage 3D/vidéo
(`LureCarousel.tsx:107`, offsets `691/1280` et `382/720`) tient au fait que le canvas 3D et le
canvas d'images partagent exactement le même rectangle. Tout élément qui réserve de la place
casse le fondu.

De bas en haut :

| Élément | Hauteur | Rôle |
|---|---|---|
| Ligne fixe prix + livraison | ~10 px, `muted` | Le prix unitaire et le délai, présents dans **tous** les états (règle Alure n°1). |
| Rangée des sorties | 44 px, liens texte | `Fiche du leurre` · `Commander <affiché> seul` · `Vider le panier` |
| Ligne d'état | 2 lignes max, `aria-live="polite"` | **Nomme** le contenu du panier. Montée dès le premier rendu, jamais démontée. |
| Rangée d'actions | 44 px, 2 emplacements fixes | Gauche (ghost) : `Ajouter/Retirer <affiché>`. Droite (primaire) : `Commander les 4 leurres`. |
| Rangée des 4 cases | ~69 px, cibles ≥ 44 px | **Le colis.** Navigation + état. Jamais une mutation. |

Les 4 cases remplacent les puces de navigation actuelles : elles naviguent **et** montrent l'état.
Le `SegmentedControl` des angles de vue descend dans la fiche du leurre — il n'a rien à faire dans
la zone d'achat.

### 2.3 Les états, maquettes à l'appui

**Panier vide, Truite affichée — l'écran d'arrivée**

```
  ╔════════╗┌────────┐┌────────┐┌────────┐
  ║ TRUITE ║│ PERCHE ││ ORANGE ││  4e    │
  ║ 21,99 €║│ 21,99 €││ 21,99 €││ offert │
  ╚════════╝└────────┘└────────┘└────────┘

  [ Ajouter Truite ] [ Commander les 4 leurres ]

  Les 3 coloris, et le 4e leurre offert : 65,97 €.

  Fiche du leurre · Commander Truite seul
  21,99 € le leurre. Livraison 10 à 20 jours ouvrés.
```

La rangée vide se lit « 21,99 € · 21,99 € · 21,99 € · offert » : la facture affichée avant le
premier clic, sans prix barré ni valeur de référence gonflée. Aucun geste n'est nécessaire pour
comprendre l'offre.

**1 au panier — le carrousel n'a pas bougé**

```
  ╔════════╗┌────────┐┌────────┐┌────────┐
  ║ TRUITE ║│ PERCHE ││ ORANGE ││  4e    │
  ║✓au pan.║│ 21,99 €││ 21,99 €││ offert │
  ╚════════╝└────────┘└────────┘└────────┘

  [ Retirer Truite ] [ Commander les 4 leurres ]

  1 coloris sur 3 : Truite arc-en-ciel.

  Fiche · Commander Truite seul · Vider le panier
```

**L'auto-avance est supprimée** (défaut n°5). Deux confirmations simultanées : la case se remplit,
et l'objet reste sous les yeux. Le bouton gauche, même élément DOM, passe de « Ajouter » à
« Retirer ».

**2 au panier — l'état qui n'a aucun chemin aujourd'hui**

```
  ┌────────┐╔════════╗┌────────┐┌────────┐
  │ TRUITE ││ PERCHE ║│ ORANGE ││  4e    │
  │✓au pan.││✓au pan.║│ 21,99 €││ offert │
  └────────┘╚════════╝└────────┘└────────┘

  [ Retirer Perche ] [ Commander les 4 leurres ]

  2 coloris sur 3 : Truite arc-en-ciel, Perche.
  Il n'y a pas de tarif pour 2 leurres.

  Fiche · Commander Perche seul · Vider le panier
```

La phrase **dit** l'absence d'offre au lieu de la faire subir, et les deux sorties restent
intactes.

**3 au panier — l'offre est composée**

```
  ┌────────┐┌────────┐╔════════╗┌─────────┐
  │ TRUITE ││ PERCHE ││ ORANGE ║│   4e    │
  │✓au pan.││✓au pan.││✓au pan.║│à choisir│
  └────────┘└────────┘╚════════╝└─────────┘

  [ Retirer Orange ] [ Commander les 4 leurres ]

  3 coloris sur 3. Vous choisirez votre 4e leurre,
  offert.
```

La 4e case passe de `offert` à `à choisir` et sort de son état grisé : la récompense tombe là où
le regard est déjà. Le lien mène à `/leurre?offre=collection#offert`, l'ancre visant le fieldset
« Votre 4e leurre, offert » qui existe déjà (`BuyBox.tsx:104-171`).

**Pirate affiché, panier vide** — la 4e case est active, l'action gauche devient
`Commander les 4 leurres` (aujourd'hui : aucun chemin d'achat, `colorwayId: null` en
`lure-models.ts:92` fait retomber sur un bouton qui déplace seulement le carrousel).

**Coloris épuisé** — la case porte `épuisé`, la 4e case porte `suspendu`, l'action droite
disparaît, et la ligne d'état dit pourquoi. Les autres coloris restent commandables à l'unité.

**WebGL absent ou modèle en échec** — la bande reste entière : les cases perdent leur rôle de
navigation mais gardent leur rôle d'état, et les deux sorties fonctionnent. Un `role="status"`
explique la panne.

### 2.4 Toutes les micro-copies, dans les deux langues

> Règle Alure n°6 : tout texte visible s'écrit dans `docs/i18n/fr.md` **et** `docs/i18n/en.md`,
> dans le même commit. Les clés ci-dessous sont à créer dans les deux fichiers.

| Clé | Français | English |
|---|---|---|
| `CART.BOX_UNTAKEN` | `21,99 €` | `21,99 €` |
| `CART.BOX_TAKEN` | `au panier` | `in cart` |
| `CART.BOX_SOLD_OUT` | `épuisé` | `sold out` |
| `CART.BOX_GIFT` | `4e` | `4th` |
| `CART.BOX_GIFT_FREE` | `offert` | `free` |
| `CART.BOX_GIFT_CHOOSE` | `à choisir` | `your pick` |
| `CART.BOX_GIFT_PAUSED` | `suspendu` | `paused` |
| `CART.ADD` | `Ajouter {coloris}` | `Add {coloris}` |
| `CART.REMOVE` | `Retirer {coloris}` | `Remove {coloris}` |
| `CART.ORDER_FOUR` | `Commander les 4 leurres` | `Order all 4 lures` |
| `CART.ORDER_SOLO` | `Commander {coloris} seul` | `Order {coloris} on its own` |
| `CART.CLEAR` | `Vider le panier` | `Empty the cart` |
| `CART.SHEET` | `Fiche du leurre` | `Lure details` |
| `CART.STATE_EMPTY` | `Les 3 coloris, et le 4e leurre offert : {total}.` | `All 3 colours, plus a free 4th lure: {total}.` |
| `CART.STATE_ONE` | `1 coloris sur 3 : {liste}.` | `1 colour of 3: {liste}.` |
| `CART.STATE_TWO` | `2 coloris sur 3 : {liste}. Il n'y a pas de tarif pour 2 leurres.` | `2 colours of 3: {liste}. There is no price for 2 lures.` |
| `CART.STATE_THREE` | `3 coloris sur 3. Vous choisirez votre 4e leurre, offert.` | `3 colours of 3. You will pick your free 4th lure.` |
| `CART.STATE_CLEARED` | `Panier vide.` | `Cart empty.` |
| `CART.STATE_SOLD_OUT` | `{coloris} est épuisé. L'offre des 4 leurres est suspendue. Les autres coloris restent commandables à l'unité.` | `{coloris} is sold out. The 4-lure offer is paused. The other colours can still be ordered individually.` |
| `CART.FOOTNOTE` | `{prix} le leurre. Livraison {delai}, port inclus.` | `{prix} per lure. Delivery {delai}, shipping included.` |
| `CART.A11Y_BOX` | `{coloris}, {etat}, afficher ce leurre` | `{coloris}, {etat}, show this lure` |

**Trois règles de système, non négociables :**

1. **Seul un bouton qui déclenche le prélèvement porte un montant.** Aucun bouton du hero
   n'encaisse, donc aucun ne porte de chiffre. Le montant vit dans la ligne d'état et la ligne
   fixe — donc visible en permanence, y compris à 2 coloris où il disparaît aujourd'hui. C'est ce
   qui rend impossible la répétition du défaut n°2.
2. **WCAG 2.5.3, « Label in Name »** : le texte visible est toujours **contenu** dans le nom
   accessible, jamais remplacé. C'est le correctif de `:475`, où l'`aria-label` « Ajouter Truite
   arc-en-ciel au panier — 21,99 € » remplace le texte visible « Ajouter au panier » : la commande
   vocale n'atteint pas la cible aujourd'hui. Nouveau champ `shortLabel` dans `PRODUCT.colorways`,
   avec la contrainte écrite dans son commentaire : **`shortLabel` doit être un préfixe de
   `label`** (Truite ⊂ Truite arc-en-ciel, Perche = Perche, Orange ⊂ Orange feu).
3. **Les noms propres restent en français dans les deux langues** : `PRODUCT.name`, les libellés
   de coloris et « Pirate ». Le nom vu à l'achat doit être celui du reçu Stripe et de l'email
   (`docs/i18n/README.md` §2).

**Contrôle de charte** (`docs/standards/UI-COPY.md`, les 5 tournures interdites) : aucune
micro-copie ne porte d'argument de vente ; aucune métaphore ; la mention TVA n'entre pas dans le
hero (elle vit à son endroit canonique, `/leurre`) ; aucun slogan symétrique ; **zéro tiret
cadratin** dans l'ensemble des chaînes ci-dessus.

### 2.5 Les gestes

| Geste | Nombre | Retour visuel |
|---|---|---|
| Ajouter le coloris affiché | 1 | La case passe à `✓ au panier`, `.px-pop` une fois. **Le carrousel ne bouge pas.** |
| Ajouter un coloris non affiché | 2 (case, puis action) | Idem, précédé du pivot vers ce leurre. |
| Retirer le coloris affiché | 1 | La case revient à `21,99 €`, la ligne d'état se réécrit. |
| Vider le panier | 1 | Les 3 cases repassent à `21,99 €`, `Panier vide.` annoncé, focus déplacé sur l'action gauche. |
| Acheter en solo | **2 clics jusqu'à Stripe** | Le lien nomme toujours le leurre à l'écran. |
| Commander la collection | **2 clics jusqu'à Stripe**, contre 5 aujourd'hui | Le lien est là dès la première seconde, dans tous les états. |

### 2.6 Accessibilité, mobile, mouvement

- **Clavier** : les 4 cases forment un `radiogroup` (flèches pour naviguer, comme aujourd'hui les
  puces), puis Tab atteint l'action gauche, l'action droite, et les sorties. Ajouter, retirer,
  vider et ouvrir la fiche sont **tous** atteignables sans souris — correctif du défaut n°4.
- **Lecteur d'écran** : une seule région `aria-live="polite"`, montée au premier rendu et jamais
  démontée (une région montée en même temps que son contenu n'est pas annoncée). Elle nomme les
  coloris, jamais un simple compte.
- **Fondu du hero** : `HeroScroll.tsx` doit poser `inert` sur le conteneur quand il est
  transparent. `pointer-events: none` ne retire pas de l'ordre de tabulation.
- **375 px** : 4 cases sur une ligne, ~80 px chacune, cibles ≥ 44 px de haut. La rangée d'actions
  passe en pleine largeur sur deux lignes si nécessaire, l'action droite toujours en premier.
- **`prefers-reduced-motion: reduce`** : `.px-pop` ne joue pas, la case change d'état
  instantanément. Le pivot du carrousel suit le réglage déjà en place (`stage.setReducedMotion`).

---

## 3. Tâches (tranches verticales)

- [x] **T1 — Le domaine.** Dans `src/lib/shop/` : passer la sélection à un ensemble de coloris
      distincts (`sanitizeSelection` dédoublonne et borne à `colorwayCount`), ajouter `shortLabel`
      à `PRODUCT.colorways`, exposer l'état d'une case et la phrase d'état. Mettre à jour
      `collection-selection.test.ts:47`, qui fige aujourd'hui le comportement inverse.
      **Aucune logique dans le composant.**
- [x] **T2 — Le vidage après paiement.** Effacer `SELECTION_STORAGE_KEY` à l'arrivée sur `/merci`.
- [x] **T3 — Les clés i18n.** Créer les clés `CART.*` du §2.4 dans `docs/i18n/fr.md` **et**
      `en.md`, préparer les chaînes côté serveur (`src/lib/i18n/chrome.ts`) et les passer en props
      au composant client.
- [x] **T4 — La rangée des 4 cases**, en remplacement des puces de navigation.
- [x] **T5 — Les rangées d'actions et de sorties**, la ligne d'état `aria-live`, la ligne fixe.
      Suppression de `addAndAdvance`.
- [x] **T6 — L'ouverture de la fiche au clavier**, et le `SegmentedControl` déplacé dedans.
- [ ] **T7 — `inert`** sur le conteneur du hero pendant le fondu (`HeroScroll.tsx`).
- [ ] **T8 — La rupture de stock** : fermeture de l'offre groupée, côté UI **et** côté
      `/api/checkout`, qui doit valider les trois leurres facturés et non le seul coloris
      décoratif.

---

## 4. Vérification

- **Tests vitest** (backend et logique pure uniquement, cf. `web-tests`) : dédoublonnage et borne
  de `sanitizeSelection` ; `shortLabel` préfixe de `label` pour chaque coloris ; parité des clés
  `CART.*` entre `fr.md` et `en.md` ; refus par `/api/checkout` d'une offre groupée dont un
  coloris est épuisé.
- **Gate** : `web-quality-gate` — `npx tsc --noEmit`, `npx eslint .`, `npm run test`,
  `npm run build`, **lancés depuis Windows** (cf. `docs/standards/WEB-REFERENCE.md`, piège
  WSL × Windows).
- **Navigateur réel** : les 8 états du §2.3 à 375 px et en desktop ; parcours clavier complet ;
  `prefers-reduced-motion` activé ; retour de paiement avec panier non vide.
- **Audits concernés** : accessibilité (le gros du risque), et SEO seulement si des ancres sont
  ajoutées à `/leurre`.

---

## 5. Ce qu'on ne fait pas, et pourquoi

- **Pas de quantité libre ni de curseur.** L'offre est binaire (`offre-collection.md` §1) : un
  choix binaire se décide, une liste de prix se calcule.
- **Pas de mini-panier flottant façon e-commerce classique.** Il masquerait le leurre, qui est le
  seul argument de vente de cette page.
- **Pas de paiement depuis le hero.** Un `/api/checkout` déclenché depuis un canvas plein cadre
  multiplie les états d'erreur à afficher là où il n'y a pas de place. `/leurre` encaisse.
- **Pas d'urgence fabriquée, ni compteur de stock, ni « X personnes regardent »** : anti-scope
  explicite de `docs/product/VISION.md`, et la cible se méfie déjà du dropshipping.

## 6. Risques restants

- **La fermeture de l'offre groupée en cas de rupture** est un vrai coût commercial. Elle se
  vérifie en passant un coloris à `available: false` et en constatant que rien, ni dans l'UI ni
  dans l'API, ne permet plus d'encaisser 65,97 €.
- **La bande basse s'alourdit** : cinq rangées au lieu de trois. À surveiller à 375 px en paysage,
  où la hauteur utile s'effondre — la rangée des sorties peut passer dans la fiche si besoin.
- **Le `radiogroup` des cases cohabite avec le glissé horizontal du canvas.** À tester au doigt sur
  un vrai téléphone, pas seulement en émulation.
