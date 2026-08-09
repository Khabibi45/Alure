# Questions au propriétaire — tout ce qui attend TA réponse

> Écrit le 2026-08-09. Ce fichier est LE goulot d'étranglement du projet : chaque bloc liste ce
> qui est bloqué, ce qu'il faut répondre, et où la réponse s'applique. Réponds directement ici ou
> en session — je répercute partout (une réponse = un seul endroit à modifier, c'est déjà câblé).

---

## 1. 🔴 Identité légale (bloque : indexation des pages légales, Stripe live, mise en ligne réelle)

Les 6 champs de `src/lib/legal-config.ts` sont en « À COMPLÉTER ». Tant qu'ils le sont, les 4
pages légales restent volontairement noindex/hors sitemap, et l'encaissement réel est interdit.

| Champ | Question |
|---|---|
| `vendorName` | Nom et prénom du micro-entrepreneur (toi, ou Logan ?) |
| `siren` | Le SIREN — micro-entreprise créée ? Si non : guichet unique INPI (gratuit, ~1-2 sem.) |
| `address` | Adresse du siège (ton domicile) — elle sera PUBLIQUE sur les mentions légales |
| `contactEmail` | L'email public de contact (idéalement sur le futur domaine, cf. bloc 2) |
| `returnAddress` | Adresse de retour des colis (rétractation) — même adresse ? |
| `mediator` | Médiateur de la consommation : il faut S'INSCRIRE chez un médiateur agréé (obligatoire, art. L612-1 c. conso — ex. CM2C, Médiation de la consommation & patrimoine ; ~aucun coût tant que zéro litige). Lequel ? |

## 2. 🔴 Domaine définitif (bloque : URLs de retour Stripe, email pro, SEO, mise en ligne)

- `alure.fr` est **PRIS** (vérifié registre AFNIC 2026-08-08 : enregistré depuis 2012, Gandi,
  jusqu'en 2027). Racheter = négociation privée, budget inconnu. On oublie ?
- `alure-peche.fr` est **LIBRE** (vérifié). Autres candidats notés libres au cadrage :
  `alure.fish`, `alurefishing.com`, `alure-fishing.fr`, `alure-leurres.fr`, `alure.store`.
- **Question : quel domaine j'achète-nous ?** (Je peux vérifier n'importe quel autre nom en
  quelques secondes.) Recommandation : `alure-peche.fr` chez OVH ou Infomaniak **avec l'email
  inclus** (bloc 3) — ~7-12 €/an.
- Dès la réponse : `site-config.ts` + Vercel + Resend + Search Console s'alignent.

## 3. 🟠 Email professionnel (bloque : expéditeur des emails de commande, contact public)

Décidé ensemble le 2026-08-08 : boîte sur NOTRE domaine (pas de @gmail).
- **Question A** : registrar avec email inclus (OVH/Infomaniak — reco, quasi gratuit) ou
  Google Workspace (~6 €/mois/boîte) ?
- **Question B** : quelles adresses ? Reco minimale : `contact@` (public + légal) et
  `commandes@` (expéditeur Resend). Les deux peuvent arriver dans la même boîte.

## 4. 🟠 Passage en réel des paiements (bloque : encaisser)

- Compte Stripe : à créer (mode test d'abord — AUCUN SIRET requis pour tester).
- **Question : tu crées le compte Stripe maintenant pour les tests ?** Il me faut ensuite
  `STRIPE_SECRET_KEY` (test) + `STRIPE_WEBHOOK_SECRET` dans Vercel/`.env.local` pour le test de
  bout en bout (ROADMAP LOT 2). Le passage LIVE attendra le SIREN (KYC Stripe).
- Compte Resend : idem, à créer (gratuit) → `RESEND_API_KEY`, `ORDER_NOTIFICATIONS_EMAIL`.

## 5. 🟠 Vercel (bloque : la préprod que tu as validée)

- Le MCP Vercel est enregistré côté projet ; il attend **ton authentification** : dans Claude
  Code, tape `/mcp` → `vercel` → « Authenticate » (compte Vercel Hobby gratuit OK pour la
  préprod). Dis-moi quand c'est fait, je déploie en préversion dans la foulée.
- Pour le LANCEMENT commercial : les CGU du plan Hobby excluent l'usage commercial → passage
  au plan Pro (~20 $/mois) à prévoir au moment du go-live. OK ?

## 6. 🟡 Produit — les derniers faits qui manquent

- **Noms des coloris posés le 2026-08-09** (d'après les robes réelles des rendus 3D) :
  « Truite arc-en-ciel » / « Perche » / « Orange feu » + « Noir collector ». **Tu valides ?**
  (« Brochet » a été volontairement écarté : VISION.md interdit de revendiquer le brochet, et la
  robe verte mouchetée est une livrée de perche.)
- **Une ligne d'argument PAR coloris** (TODO(Camil) dans `lure-models.ts`) : quand l'utiliser,
  dans quelles eaux ? Ces phrases sont des affirmations commerciales — elles ne s'écrivent que
  dictées par toi. (Ex. attendu : « Eaux claires, ciel couvert » pour la perche.)
- **Specs à compléter pour la fiche `/leurre` la plus riche du marché (SEO §2)** : profondeur de
  nage, densité (coulant/suspending/flottant ?), taille et nombre des hameçons, présence d'une
  bille sonore ? Je n'écris QUE ce que tu me confirmes.
- **Visuel du collector noir** : c'est le seul sans image produit (son GLB de 10,6 Mo dépasse la
  fenêtre de capture de mon outil actuel). Deux options : je réessaie plus longuement, ou on
  l'optimise d'abord (`npm run models` le réduirait comme les autres). Préférence ?
- **Prix : une contradiction à trancher.** Le commentaire historique de `product.ts` dit « le
  premier à 25 €, chaque suivant à 13 € » mais le code vend 21,99 € / collection 43,98 €
  (= 2 × 21,99). Le CODE fait foi aujourd'hui. **21,99 € / 43,98 € est bien ta décision finale ?**

## 6 bis. 🟠 Multilingue — activé le 2026-08-09, ce qui reste à traduire

Le socle est EN LIGNE : `/en`, `/es`, `/de`, `/nl` (accueil + FAQ complets, sélecteur de langue,
`hreflang`, sitemap par langue, cookie de préférence strictement nécessaire). Reste, par ordre
d'importance — chaque bloc est une passe de traduction + branchement :

- [ ] **`/leurre` (l'îlot d'achat)** — les clés existent (OFFER.*, PROGRESS.*, PAYMENT.*,
      PRODUCT.*) ; il faut brancher BuyBox/OfferProgress/PaymentMethods/ColorwayViewer sur les
      dictionnaires + l'encadré SHIPPING_NOTICE au-dessus du bouton d'achat. D'ici là, les liens
      « produit » des langues mènent à la page française (choix assumé : un lien qui marche).
- [ ] **`/contact`** — brancher ContactForm + traduire les messages du schéma zod partagé.
- [ ] **`/suivi`** — ajouter les clés des 4 étapes (TRACKING.STEP*) dans les 5 fichiers.
- [ ] **Fiche 3D + encadré collector** — les lignes descriptives des robes (`lure-models.ts`) et
      le panneau « Offert » n'ont pas de clés ; à créer et adapter.
- [ ] **`/a-propos`** — page entière à adapter (pas une traduction mot à mot).
- [ ] **Emails transactionnels** dans la langue de la commande (clés EMAIL.* prêtes ; stocker la
      langue dans les metadata Stripe au checkout).
- [ ] **Relecture par des locuteurs natifs** (README i18n §5) — les fichiers sont une base
      soignée, personne ici n'est traducteur.
- ⚠️ Rappel README §0 : tant que la livraison reste France seule, chaque langue doit AFFICHER
      « nous n'expédions qu'en France » au-dessus du bouton d'achat — c'est le sens de
      SHIPPING_NOTICE, à poser avec la traduction de `/leurre`.

## 7. 🟡 Contenu & SEO (cf. `docs/ROADMAP-SEO.md`)

- **Débloquer `/guides` ?** VISION dit « pas de blog en v1 » ; pour viser la 1re place, 4-8
  guides piliers sont le levier n°1. Feu vert pour l'espace `/guides` (après la mise en ligne) ?
- **Réseaux sociaux** : les comptes Instagram/TikTok existent-ils ? Les URLs vont dans
  `site-config.ts` (`socialLinks`, JSON-LD `sameAs`).
- **Envoi produit à des testeurs** (§4 de la roadmap SEO) : d'accord pour sacrifier 3-5 leurres ?

## 8. 🟡 Vidéo du hero

- La vidéo actuelle (9 s, sans watermark) **saute le plan du lancer** (`seg3`, k3 → k4, jamais
  généré). Elle te convient telle quelle, ou je relance une génération du seg3 (~2-3 € via
  fal.ai, clé `FAL_KEY` déjà en place) pour la traversée complète ?
- Les sections suivantes de la landing (articulation → hameçons → achat) attendent leur spec —
  on la cadre quand tu veux.

## 9. 🟢 Rangement (aucune urgence, je peux le faire sur un mot de toi)

- `files/` à la racine (prototypes R3F + `brochet.opt.glb`, jamais importés par `src/`) :
  j'archive dans `assets/references-code/` ou je supprime ?
- `docs/product/charte-graphique-v02.html` (4,7 Mo, doublon visuel de la charte .md) : on le
  sort du dépôt (il alourdit chaque clone) vers `assets/` ?
- `Dockerfile`/`docker-compose.yml`/`nginx.conf` rangés dans `docs/specs/video/` : infra de
  l'outillage vidéo — je les déplace vers `scripts/` ?
- Composants du kit encore inutilisés (`AnimatedSection`, `PageRelay`, `Stat`, `Card`,
  framer-motion) : je les GARDE pour les prochaines sections de la landing (c'est le standard du
  kit). gsap/lenis, eux, sont retirés (décision sticky documentée). OK ?
- L'ancien nom de travail `leurre-brochet.glb` (fichier du coloris Perche) : je peux renommer le
  fichier + les références pour finir d'effacer « brochet » du projet. Utile ou cosmétique ?

## 10. 🟢 Divers

- **`/suivi`** promet un numéro de suivi par email : quel sera le processus réel côté fournisseur
  (AliExpress standard shipping ? autre) — pour que la page dise exactement ce qui se passera.
- **OG image** (1200×630) : générique aujourd'hui (flèche + wordmark). On la refait avec un rendu
  produit quand les visuels te plaisent ?
- **Analytics** : Vercel Analytics (sans cookie) est prévu au LOT 4 — confirmation qu'on ne veut
  RIEN d'autre (pas de GA4, pas de Meta pixel) ? La politique de confidentialité actuelle promet
  « pas de cookies de suivi » — tout tracker ajouté la ferait mentir.
