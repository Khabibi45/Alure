# Journal — Alure

> Le journal vivant : le plus récent **en haut**. L'agent écrit ici à la fin de chaque session qui
> change l'état du produit (date + ce qui a changé + fichiers clés). C'est la trace de reprise.

## 2026-08-09 (midi) — Le site est sur GitHub et en pré-prod Vercel

Le dépôt et la mise en ligne de pré-production sont branchés (demande Camil, en
attendant l'achat du nom de domaine) :

- **GitHub** : commit initial `26bc577` poussé sur `https://github.com/Khabibi45/Alure.git`
  (branche `main`, 637 fichiers). `.env.local` bien ignoré — seuls `.env.example` et les
  assets utiles sont versionnés.
- **Vercel** : projet `alure` (compte `khabibi45`), déployé en production sur
  **https://alure-beta.vercel.app**. `STRIPE_SECRET_KEY` (clé restreinte TEST) posée en
  variable « Sensitive » (Production + Preview). Vérifié : accueil 200 + titre correct,
  `/de/faq` 200.
- **Correctif requis par Vercel** : `next.config.ts` — `output: 'standalone'` (Docker)
  casse le packaging Vercel (`ENOENT next-server.js.nft.json`) ; rendu conditionnel
  (`process.env.VERCEL ? undefined : 'standalone'`).
- **Reste à faire** : déclarer l'endpoint webhook Stripe du dashboard vers
  `https://alure-beta.vercel.app/api/stripe-webhook` et poser son `whsec_…` dans Vercel
  (le secret local vient de `stripe listen`, invalide en prod — la clé restreinte
  `rkcs_` ne permet pas de le créer par API) ; configurer Resend
  (`RESEND_API_KEY`, `ORDER_NOTIFICATIONS_EMAIL`) quand le domaine email sera prêt.

## 2026-08-09 (matin) — Le multilingue est en ligne, le footer prend de l'ampleur

La décision commerciale du multilingue est tombée (Camil) : le socle prévu par
`docs/i18n/README.md` est branché.

- **4 langues servies** : `/en`, `/es`, `/de`, `/nl` — accueil et FAQ COMPLETS (contenus,
  metadata, JSON-LD FAQPage dans la langue), `<html lang>` correct par langue (structure « deux
  layouts racines » App Router : le français reste à la racine, groupe `(fr)` ; les autres sous
  `[lang]`, `dynamicParams=false`, attrape-tout 404 des deux côtés).
- **La chaîne de production** : `docs/i18n/*.md` restent LA source (le français fait foi) →
  `npm run i18n` génère `src/lib/i18n/dictionaries.gen.ts` (146 clés × 5 langues) → un test de
  FRAÎCHEUR (`gen.test.ts`) rend l'oubli de régénération impossible, en plus du test de parité
  existant. Piège consigné dans le générateur : en regex JS, `.` ne matche pas `\r` — les
  fichiers CRLF font échouer `(.*)$` (découpage sur `\r?\n` obligatoire).
- **Synchro des dictionnaires** (agent) : clés périmées corrigées (quantité → offre), renommages
  (`EMAIL.CONFIRM_QTY`→`CONFIRM_OFFER`, `CONTACT.NAME`→`ORDER_NUMBER`), nouvelles clés (vue
  Derrière, réassurance produit, SHIPPING_NOTICE.TITLE, NAV.HOME/ABOUT/TRACKING_LONG,
  PRODUCT.DELAY_VALUE — la valeur LOCALISÉE du délai) ; CONTACT réaligné sur le wording réel du
  formulaire (le code fait foi).
- **Le sélecteur de langue** (README §4 à la lettre) : bouton code-langue dans le header, liste
  des 5 noms chacun DANS SA LANGUE, pas de drapeaux, garde la page courante, cookie strictement
  nécessaire, aucune redirection automatique. Préparé côté serveur (`chrome.ts`) : le client
  n'embarque AUCUN dictionnaire.
- **SEO multilingue** : `hreflang` réciproques + `x-default` sur le français (vérifiés sur le
  HTML servi), canonical par langue, sitemap avec une entrée par langue et ses alternates.
- **La FAQ française elle-même** migre sur la source unique multilingue (`src/lib/faq.ts`) —
  `faq-content.ts` supprimé ; au passage sa réponse « quelle que soit la quantité » (périmée)
  devient « quelle que soit l'offre choisie ». `formatLength/Weight/Specs` prennent la locale
  (6,5 cm ↔ 6.5 cm).
- **Choix assumé de v1** : `/leurre`, `/contact`, `/suivi`, `/a-propos` ne sont PAS encore
  traduits — leurs liens dans les langues mènent aux pages FRANÇAISES (un lien qui marche vaut
  mieux qu'un 404), les pages légales restent en français par principe (§2) avec l'avertissement
  traduit au footer. Le reste-à-faire détaillé : `docs/QUESTIONS.md` §6 bis.
- **Footer agrandi en desktop** (demande) : lock-up passé à text-4xl + flèche w-56 à gauche,
  navigations alignées à droite, respirations doublées.
- **Vérifié** : gate vert (tsc 0, eslint 0, **154 tests**, build : `/en /es /de /nl` + FAQ en
  SSG) ; HTML servi contrôlé sur /de/faq (lang, hreflang ×6, contenu réellement allemand) et /en
  (h1 anglais). ⚠️ Le serveur dev doit être RELANCÉ après cette restructuration de `src/app/`.

## 2026-08-09 (suite) — Format téléphone, cadrages, et la fin du leurre fantôme

Retours de Camil sur le site en l'état, tous traités :

- **Le site ne défile plus latéralement.** Deux coupables : la flèche filigrane du hero
  (`w-[150%]` jamais rognée — réglé par `overflow-x-clip`, qui rogne SANS casser le
  `position: sticky`, contrairement à `hidden`) et la flèche du footer (`w-[140%]` dans un parent
  `w-fit` se résout contre TOUTE la page — largeur explicite désormais, ratio charte §10).
- **La vidéo du hero a sa vraie version téléphone** (`npm run video:mobile` →
  `hero-mobile.mp4`, 9:16) : la bande 16:9 d'origine reste ENTIÈRE et nette au centre, le haut et
  le bas sont remplis par l'image floutée — l'action n'est jamais rognée, là où l'`object-cover`
  d'avant n'en montrait qu'un tiers. Servie quand l'écran est en portrait (`useIsPortrait`),
  bascule par remontage de l'élément vidéo (`key`), séquence au scroll en `object-contain` en
  portrait pour la même raison.
- **Les leurres 3D tiennent à l'écran en portrait** : sous 1:1, la caméra cale la LARGEUR
  (3e régime de `resize()`) — le leurre entier occupe la même part de l'écran que la bande vidéo,
  fini le leurre coupé aux bords sur téléphone.
- **Le leurre filmé fantôme est mort.** Le décor derrière la 3D le contenait DEUX fois : la
  boucle `backdrop.mp4` l'a au centre du cadre (visible dès que la vue 3D amincit la silhouette),
  et son repli statique était la dernière image de la séquence, leurre compris. Réglé :
  `backdrop-clean.mp4` (leurre effacé par deux anneaux de flou — `delogo` laissait une grille) +
  `backdrop-poster.webp` extrait du décor NETTOYÉ. Piège ffmpeg consigné dans le script : un flux
  de `filter_complex` ne se consomme qu'une fois (`split` obligatoire).
- **Le lock-up d'intro : plus grand, plus sombre** (demande) : bleu nuit de la marque
  (`text-background`) + halo clair, tailles montées (`text-5xl/6xl`, flèche w-64/w-80).
- **Captures produit reprises sur décor propre** : truite et orange régénérées sans fantôme.
  Perche : la capture propre a résisté au daemon de capture (instances froides) — l'image actuelle
  reste correcte, à reprendre avec le collector (noté dans QUESTIONS.md §6).
- **Vérifié** : gate vert (tsc 0, eslint 0, 148 tests, build OK) ; mobile 375px contrôlé en
  capture (bande nette + flous, logo sombre lisible, header 2 lignes).

## 2026-08-09 — Le site se remplit : coloris vrais, images produit, À propos, nav, roadmaps

Le grand lot « remplir le site » demandé par Camil, après inventaire complet (2 sous-agents :
état des lieux 5 sections ancré fichier:ligne + correction de 9 contradictions doc↔code).

- **Les coloris deviennent VRAIS** : « Truite arc-en-ciel / Perche / Orange feu » — les robes
  lues sur nos rendus 3D, pas inventées. « Brochet » est volontairement écarté (VISION.md : le
  brochet n'est revendiqué nulle part ; la robe verte mouchetée est une livrée de perche). Fini
  les « Coloris 1 (provisoire) » : le blocage de mise en ligne saute. `Colorway.image` pointe le
  visuel de chaque coloris, `lureDisplayName()` devient LE nommage public (le `workingName` des
  fichiers ne sort plus à l'écran), et les champs morts `quantityMin/Max` disparaissent.
- **Les visuels produit sont NOS rendus 3D** (règle n°3 : zéro image fournisseur) : captures de
  la scène du hero par coloris → WebP recadrés (`public/produit/`, ~20 Ko pièce) ; pastilles
  images dans la BuyBox (plus de creux numérotés) ; 2 visuels de marque (lock-up sur le splash
  du lac, scène 3D) pour À propos. Manque : le collector noir (GLB 10,6 Mo, capture en attente).
- **BuyBox honnête et rebranchée sur le shop** : ligne de prix PAR palier (`priceTagline` — le
  solo n'affiche plus l'argument de la collection), libellés d'offre dans `OFFERS`, délai de la
  barre collante dérivé de la source unique (`deliveryShort()` — « 10-20 jours » réécrit à la
  main est mort), résumé de gamme `lineupSummary()` (la fiche 3D disait « 4 coloris » sans dire
  que le 4e ne se vend pas).
- **Navigation complète** : header 5 entrées (Le leurre, À propos, FAQ, Suivi, Contact) qui
  passe en 2 lignes sur mobile sans burger ; footer 2 niveaux (pages du site + légal). Accueil :
  titre SEO absolu « leurre articulé 2 sections pour black-bass et perche » ; 404 titrée.
- **Page `/a-propos`** : la transparence comme argument, chaque phrase vérifiable (règle n°6),
  nos visuels, CTA vers `/leurre`. Sitemap + header/footer à jour.
- **Lock-up ALURE. + flèche sur la vidéo d'intro** (`HeroBrand`) — dérogation charte §8.16
  demandée par le propriétaire, consignée dans le composant ; ratio flèche/wordmark §10 en
  largeurs explicites ; se dissout avec la vidéo, la 3D reste vierge.
- **CGV durcies** : + Disponibilité (indisponibilité → échange ou remboursement, seule
  obligation), Usage du produit (hameçons, responsabilité), renvoi Données personnelles.
  Les 4 pages légales sont complètes — SEULE l'identité (`legal-config.ts`) reste en
  « À COMPLÉTER » (cf. QUESTIONS.md §1) et tient les pages hors index.
- **Ménage** : gsap + lenis désinstallés (sticky a gagné, documenté), `SmoothScrollProvider`
  supprimé, SVG du starter Next purgés, commentaire périmé du layout corrigé. Gardés pour la
  suite de la landing : framer-motion, AnimatedSection, PageRelay, Stat, Card.
- **Contradictions doc↔code corrigées** (agent) : PRODUCT.md (langues, gsap→sticky, offre),
  hero-3d.md (3 variantes, 302 frames), UI-COPY (vouvoiement tranché), boutique.md (encadré
  « partiellement remplacée »), ADR-002 créée (offre deux paliers), TODO(kit) purgés.
- **Trois documents de pilotage** : `docs/ROADMAP-SEO.md` (plan agressif : longue traîne →
  autorité → requêtes reines ; white-hat strict), `docs/QUESTIONS.md` (10 blocs — identité
  légale, domaine, email, Stripe/Resend, Vercel, produit, contenu, vidéo, rangement, divers),
  `docs/ROADMAP.md` remise au réel.
- **Vérifié** : gate vert (tsc 0, eslint 0, **148 tests**, build 22 pages) ; responsive contrôlé
  en captures 375/768/1280 sur `/`, `/leurre`, `/a-propos` (header 2 lignes, pastilles, barre
  collante, images) ; console sans erreur. Dev : http://localhost:3000.

## 2026-08-09 — La doc rejoint le code : les contradictions doc ↔ code de l'audit corrigées

Suite de l'audit du 2026-08-08 : partout où un document contredisait le code livré, **le code
fait foi** et le document a été aligné. Aucune valeur de code changée (deux commentaires réécrits).

- `docs/product/PRODUCT.md` : français seul **en ligne** (traductions en/es/de/nl prêtes dans
  `docs/i18n/`, décision commerciale en attente) · scroll narratif livré en `position: sticky`
  natif, gsap/lenis hors bundle · `/leurre` = offre à deux paliers, plus « quantité 1 à 5 ».
- `docs/specs/hero-3d.md` § bascule : **trois** mises en scène (`cine` EN LIGNE, `scroll`,
  `video`), `HERO_VARIANT = 'cine'` · routes de comparaison `noindex` et volontairement absentes
  de `robots.ts` (audit sécurité du 08) · vérité disque des assets : **302 images WebP, ~5,5 Mo,
  30 fps** + mp4 de 2,3 Mo (idem `docs/ROADMAP.md`).
- `docs/standards/UI-COPY.md` : placeholder tranché → **vouvoiement**.
- `docs/specs/boutique.md` : encadré « partiellement remplacée » en tête —
  `offre-collection.md` fait foi sur l'offre, la spec reste la référence du cadre.
- **`docs/adr/002-offre-deux-paliers.md` (nouveau)** : Solo 21,99 € / Collection 43,98 €
  consignée ; l'ADR-001 (Stripe Checkout) reste valable telle quelle.
- `docs/ROADMAP.md` : base verte cochée (148 tests re-vérifiés par `vitest run`).
- Commentaires alignés, zéro code changé : `next.config.ts` (listes CSP vides **par choix**,
  plus un TODO) · `src/app/api/contact/route.test.ts` (`deliver()` EST branché sur Resend — le
  503 testé est l'échec bruyant voulu sans clés d'environnement).

Laissé tel quel, à dessein : les entrées historiques de ce journal (elles disent ce qui était
vrai à leur date) ; le pointeur « § Basculer entre les deux hero » du commentaire de
`src/lib/hero-variant.ts` (hors périmètre de la passe — un mot à reformuler à l'occasion).

## 2026-08-08 (nuit) — Audit de sécurité pré-mise en ligne : 0 bloquant, et les correctifs livrés

Audit du domaine sécurité (checklist `web-audit`, 2 sous-agents + contrôles déterministes) avant
le premier déploiement Vercel. **Verdict : zéro bloquant.** Constats sains vérifiés : headers/CSP
complets et collant exactement aux usages (aucun tiers), secrets serveur uniquement (`.env.local`
jamais dans l'historique — vérifié par pickaxe sur les formats `sk_`, `whsec_`, `re_`, `fal_`),
`npm audit` prod+dev à 0, un seul `dangerouslySetInnerHTML` (JSON-LD échappé), aucun
`searchParams` donc aucun open redirect, montants checkout 100 % serveur, webhook signé sur corps
brut. Les points relevés ont été corrigés dans la foulée :

- **Idempotence DURABLE du webhook** (le vrai sujet) : le Set en mémoire ne couvrait qu'une
  instance serverless — une re-livraison Stripe sur une autre lambda renvoyait les deux emails
  (risque de double commande fournisseur). Le marqueur vit désormais chez Stripe (métadonnées du
  PaymentIntent, clé `alure_emails_commande`), lu AVANT l'envoi, posé APRÈS. Sémantique d'échec :
  marqueur illisible → 500 (re-livraison), pose échouée après envoi → 200 loggé fort. 7 tests.
- **Plafond de taille sur le webhook** (128 Ko, avant vérification de signature) → 413.
- **`orderNumber` sans `\r\n`/tab** (il part dans le SUJET de l'email de contact) — regex zod + test.
- **`server-only`** sur `stripe.ts` et `emails.ts` : un import client accidentel casse au build
  (stub vitest : `src/test/server-only-stub.ts`, alias dans `vitest.config.ts`).
- **CSP durcie** : `object-src 'none'`.
- **Garde d'URL** dans `BuyBox` : on ne navigue que vers `https://checkout.stripe.com/`.
- **`returnBaseUrl` dev** : test par `URL.hostname` (`startsWith('http://localhost')` acceptait
  `localhost.evil.com`).
- **robots.txt ne liste plus `/hero-video` ni `/hero-scroll`** : un disallow est une carte
  publique ET il empêchait les robots de voir le `noindex` des pages (qui les tient hors index).
- **Vérifié contre la doc Vercel (2025-12) prise sur pièce** : `x-forwarded-for` est RÉÉCRIT par
  la plateforme (« do not forward external IPs … to prevent IP spoofing ») — l'IP du rate-limit
  est infalsifiable sur Vercel ; la limite par instance reste une borne souple documentée.

**Reste à trancher avant l'encaissement réel (pas un correctif code)** : le domaine
`alure-peche.fr` (`site-config.ts`) est PROVISOIRE et non acheté — c'est la base des
`success_url`/`cancel_url` Stripe et du sitemap. Gate : tsc 0, eslint 0, **148 tests**, build OK.
Domaines non audités cette nuit (à passer avant/à la mise en ligne) : performance, SEO, a11y,
RGPD, qualité de code — l'audit ne certifie que la sécurité.

## 2026-08-08 — La vidéo prend le hero, la fiche se tape au clavier, le texte s'efface

- **(soir) L'animation 3D devient l'ARTICULATION RIGIDE du vrai leurre** — consigne produit :
  le leurre est en PVC, deux pièces dures (tête+buste+hameçon avant / corps+finition+hameçon+queue)
  reliées par une charnière, et RIEN d'autre ne bouge. L'onde sinusoïdale qui parcourait le corps
  (et faisait battre la queue) était une fiction : remplacée par une rotation rigide de la pièce
  arrière autour d'un axe vertical planté à la charnière (`step()` dans le shader, coupure franche
  aux broches — mesurée à 47 % de la longueur totale, caudale comprise). Bénéfices de la rotation :
  longueur d'arc préservée exactement, normales exactes (plus de différences finies). Et UN SEUL
  preset (`LURE_SWIM`) remplace les trois « personnalités » jerkbait/crankbait/softbait : quatre
  coloris du même moule ne peuvent pas nager différemment. Vérifié en navigateur : la cassure se
  fait à la ligne des broches sur les trois leurres visibles, aucune ondulation, caudale solidaire.
  Fichiers : `src/lib/three/{swim.config,swim.shader,swim-material}.ts`, `lure-stage.ts`,
  `lure-models.ts` (le champ `preset` disparaît), `LureCarousel.tsx`, `ColorwayViewer.tsx`.
- **(soir) L'accueil devient l'hybride `cine`** : la vidéo se joue au chargement PAR-DESSUS la
  séquence au défilement, puis dépose le visiteur en bas de la section — remonter rejoue la
  traversée à rebours, redescendre ramène à la 3D, recharger la page rejoue la vidéo (la
  restauration de défilement est désactivée le temps du composant). Défiler pendant la vidéo la
  congédie sans déplacer le visiteur ; lecture refusée = séquence au défilement, sans simulacre.
  Implémenté comme un mode `intro` de `HeroScroll` (pas un 4e composant) ; machine à états
  verrouillée par 5 tests (`HeroScroll.test.tsx`) ; vérifié en navigateur : scrub réversible
  (3D en bas, séquence au milieu), rechargement → haut + vidéo. Gate : **140 tests**.
- **(soir) Le fondu vidéo → 3D retravaillé** : amorcé 0,6 s AVANT la fin (`timeupdate`, `ended`
  en filet) et porté à 2,4 s — la bascule ne se lit plus comme une coupe, le mouvement du leurre
  filmé se prolonge dans la nage 3D. Constantes partagées (`HERO_FADE_MS`, `HERO_FADE_LEAD_S`).
- **(soir) La fiche passe en fond transparent sans flou** (`bg-background/35`, plus de
  `backdrop-blur`) — la scène reste nette derrière le texte tapé.
- **Le hero passe en variante vidéo** (`HERO_VARIANT = 'video'`, remplacée le soir par `cine`) : la vidéo sans watermark
  (`public/hero-video/hero.mp4`, ~9 s) se joue seule puis se fond sur le carrousel 3D, devant un
  décor sous-marin en boucle (`backdrop.mp4`) doté d'un repli statique quand l'autoplay est
  refusé ou en mouvement réduit (`HeroBackdrop.tsx`). Les deux mises en scène restent comparables
  sur `/hero-video` et `/hero-scroll` (hors sitemap et robots), commutables en un mot dans
  `src/lib/hero-variant.ts` — et `hero-variant.test.ts` garde les assets des DEUX variantes
  vivants, pas seulement de celle en ligne. La séquence d'images est regénérée depuis la vidéo
  sans watermark : 302 images WebP à 30 fps.
- **La fiche au clic sur le leurre 3D réparée** — le bug : l'effet de la machine à écrire
  (`LureSpecs.tsx`) dépendait de la RÉFÉRENCE du tableau de lignes, recréée à chaque rendu ; or
  chaque caractère tapé provoque un rendu → l'effet se relançait en boucle toutes les 120 ms et
  le panneau restait vide pour toujours. L'effet dépend désormais du CONTENU (`lines.join('\n')`)
  — le bug ne peut pas revenir, même si un appelant repasse un tableau instable. Six tests
  (`LureSpecs.test.tsx`, minuteurs simulés) verrouillent : frappe progressive jusqu'au bout,
  re-frappe au changement de leurre fiche ouverte, texte intégral immédiat en `sr-only`,
  mouvement réduit tout d'un coup, fermeture Échap et bouton.
- **Plus aucun texte visible sur le hero** : le `<h1>` passe en `sr-only` (le SEO et les lecteurs
  d'écran gardent le titre de la page), le CTA « Voir le leurre » et le voile dégradé — qui
  n'existait que pour la lisibilité de ce texte — sont retirés des deux variantes.
- **Vérification** : gate vert (tsc 0, eslint 0, **134 tests**, build OK). Navigateur réel :
  clic → fiche ouverte, frappe progressive constatée à t+1 s puis t+3 s, console sans erreur ;
  HTML servi vérifié (h1 `sr-only` seul, ni CTA ni voile). À savoir : tant que le fondu n'a pas
  rendu la 3D interactive, `pointer-events` bloque le clic sur le leurre — c'est voulu.

Fichiers : `src/components/sections/home/{Hero,HeroVideo,HeroScroll,HeroBackdrop,LureSpecs,LureSpecs.test}.tsx`,
`src/lib/hero-variant.ts`, `src/lib/hero-variant.test.ts`, `src/app/{hero-video,hero-scroll}/`,
`src/app/robots.ts`, `public/hero-video/`, `scripts/{extract-frames,seamless-loop}.mjs`.

## 2026-08-07 — Le hero au scroll : la séquence d'images, puis le fondu sur la 3D

- **`npm run frames`** découpe `seg5-k5-k6` et `seg6-k6-k7` en séquence servie au navigateur :
  **121 images, 1280×720, WebP q72, 12 fps, 2,3 Mo** dans `public/hero-frames/`. Deux pièges
  payés et consignés dans le script : `-f image2` est **obligatoire** (sans lui le muxer libwebp
  produit UN webp animé au lieu d'une séquence), et la première image de chaque segment suivant
  est **supprimée** — elle reprend la keyframe sur laquelle le précédent s'est terminé, donc la
  séquence bégaierait à chaque jonction. Un `manifest.json` porte le compte : aucun nombre
  d'images n'est écrit en dur côté React, sinon il dériverait au premier re-découpage.
- **`HeroScroll.tsx`** — la séquence est dessinée sur un canvas dont l'avancement suit le scroll,
  puis se fond sur le carrousel 3D. Trois choix assumés :
  - **`position: sticky` en CSS, pas le `pin` de ScrollTrigger.** `WEB-REFERENCE.md` documente un
    bug déjà payé sur ce pin (section en `fixed; width:0` au chargement, contenu invisible jusqu'au
    premier resize). Sticky est natif et mesuré par le navigateur. Conséquence : **gsap et lenis
    restent hors du bundle** de la page, et `SmoothScrollProvider` n'a pas eu à être monté.
  - **Une séquence d'images, pas la vidéo scrubbée** : `video.currentTime` piloté au scroll saute
    sur mobile, le décodeur ne cherche qu'aux images-clés.
  - **Le dessin vit dans une boucle rAF**, pas dans l'écouteur de scroll, et ne repeint que si
    l'image a changé.
- **Le texte du hero est rendu côté serveur et posé en surimpression** : c'est le LCP, il est
  lisible avant qu'une seule image de séquence n'arrive. Voile dégradé de la charte §6 derrière.
- **`prefers-reduced-motion`** : ni séquence ni fondu — dernière image affichée, 3D immédiatement
  présente. Le fondu est **dérivé** (`blendValue`) et non stocké : un état qui vaut toujours la
  même chose n'a pas à être dans `useState`.
- **Leurres 3D deux fois plus gros** dans le hero, via une option `zoom` de la scène. On rapproche
  la **caméra** plutôt que d'agrandir la géométrie : l'amplitude de nage est une *fraction de la
  longueur du corps*, donc changer l'échelle du modèle changerait aussi l'ondulation. Le cadre
  passe en `max-w-4xl` 16:9. La page produit garde sa taille — à décider si on l'aligne.
- **`npm run montage`** (assemblage des segments) livré avant : il refuse de mentir sur ce qu'il
  produit. Il vérifie la continuité des raccords via les sidecars et **nomme le fichier**
  `montage-V3-INCOMPLET-manque-seg3.mp4` quand un plan manque. ffmpeg arrive en binaire statique
  (`ffmpeg-static`, devDependency) — même logique que `sharp` pour les `.glb`.

**Deux défauts connus, non masqués :**
1. **Le losange ✦ de Gemini est incrusté dans les frames** (bas-droite). Les segments V3 ont été
   générés le 06/08 à 18 h 22, les keyframes sans watermark poussées à 18 h 27 — cinq minutes trop
   tard. Le cacher derrière un dégradé serait pire que de le signaler. **Régénérer les segments
   depuis `1.png`…`8.png`, puis un seul `npm run frames` remet la séquence à jour.**
2. **`seg3` (k3 → k4) manque** — le lancer lui-même. Le montage saute entre l'armé et le vol.

**Vérification** : gate vert (tsc 0, eslint 0, 122 tests). Navigateur : le **scrub est vérifié**
(captures à trois positions, séquence qui avance, texte lisible sur le voile). **Le fondu final et
le zoom ×2 ne sont PAS vérifiés à l'écran** — la session de navigateur automatisé décrochait en
boucle sur la fin. À regarder à la main : le fondu commence à ~78 % de la section, se termine vers
1780 px de scroll.

Fichiers : `scripts/extract-frames.mjs`, `scripts/montage-video.mjs`, `src/lib/hero-frames.ts`,
`src/components/sections/home/{HeroScroll,Hero,LureCarousel,lure-stage}.tsx|ts`,
`public/hero-frames/`, `package.json`, `.gitignore`.

## 2026-08-06 — Fiche de production vidéo : modèle, coût, ordre de génération
Keyframes dé-watermarkées et vérifiées : **1920×1080, ratio 16:9 exact sur les huit**, renommées
`1.png`…`8.png`. Le recadrage n'a rien cassé.

- **Contrainte qui filtre le marché : le *first frame + last frame*.** Toute l'architecture du
  film repose dessus ; un modèle qui n'accepte que l'image de départ invente la fin. Vérifié en
  août 2026 : Veo 3.1 (endpoint dédié `first-last-frame-to-video`, **8 s** rendues, 0,20 $/s sans
  audio), Kling 3.0 (10 s, 0,084 $/s Standard), Seedance 2.0 et Luma Ray le proposent.
- **Le film est muet, donc ne jamais payer l'audio** : chez Veo il fait passer la seconde de
  0,20 $ à 0,40 $. C'est le seul vrai piège de facturation.
- **Le budget ne mérite pas d'être optimisé** : 7 segments × 4 prises = ≈ 24 $ en Kling Standard
  contre ≈ 45 $ en Veo. Vingt dollars d'écart pour le film entier — on choisit sur la qualité.
  Recommandation : **fal.ai en paiement à l'usage** (pas d'abonnement, endpoints dédiés, et
  possibilité de lancer le même couple d'images sur deux modèles pour comparer).
- **Méthode : acheter la décision avant le film.** Lancer le segment 02 seul en Kling et en Veo
  (~2,50 $), trancher, puis s'y tenir pour que le grain reste d'une seule main.
- **Les 7 segments classés par difficulté**, avec la parade pour le plus dur : au segment 02
  l'eau passe d'un sillage plein gaz à un miroir, ce qui est physiquement impossible en deux
  secondes — garder les **46 dernières** images des 8–10 s rendues, là où l'eau s'est calmée.
  Le segment 07 est le plus sûr (`k7` et `k8` ne diffèrent que par l'arrivée du bass) : c'est
  le bon premier essai pour valider la chaîne.
- **Incohérence corrigée dans la spec, introduite la veille par l'agent** : le prompt de `k5`
  exigeait un leurre « pas plus gros que dans l'image précédente », alors que la keyframe réelle
  le montre plus gros — la caméra se rapproche pendant le vol. Le prompt décrit désormais ce qui
  est réellement à l'écran.
- **Astuce anti-hallucination consignée** : si un segment dérive, raccourcir le prompt au seul
  paragraphe `SHOT`. Avec deux keyframes fournies, le décor est déjà fixé par les images et le
  bloc INVARIANTS devient du bruit qui pousse à réinventer.

## 2026-08-06 — Revue de la série V3 : le sens de vol du leurre, dernier défaut avant les vidéos
Les 8 keyframes V3 (`assets/keyframe pour video scroll trigger/V3/`) corrigent l'essentiel de la
revue V2 : **16:9 partout**, **le fil présent et noué au nez** sur toutes les images concernées,
eau redevenue froide sous la surface, matière du leurre enfin photographique, lanceur sur le pont
arrière et bateau à l'arrêt à l'armé, marquage du hors-bord quasi éliminé. La série est bonne.

- **Défaut restant, invisible à l'œil non averti : le leurre vole à l'envers.** Vérifié en zoomant
  sur `k4` et `k5` — le nez pointe vers la ligne au lieu de pointer dans le sens du déplacement.
  Physiquement, un leurre lancé vole **nez en avant**, le fil se dévidant derrière lui depuis
  l'œillet du nez. Deux images sur huit, mais c'est le genre d'erreur qu'un pêcheur voit
  immédiatement — et Veo l'amplifierait en l'animant.
- **Corrigé dans les prompts** : la règle du sens de vol passe dans le bloc INVARIANTS
  (« flies NOSE-FIRST… the lure never flies tail-first and its nose never points back toward the
  line »), `k4`/`k5` la répètent, et l'échelle de `k3` est réancrée sur un repère visible dans le
  cadre (« plus petit que la main gantée, la taille d'une boîte d'allumettes ») plutôt que sur
  une mesure abstraite que le modèle ignore.
- **DEUX DÉFAUTS SONT ACCEPTÉS EN L'ÉTAT** — décision de Logan après plusieurs reprises
  infructueuses, consignée pour qu'on ne la redécouvre pas comme une régression :
  - `k3` : le leurre y lit comme un objet de ~40 cm. Le modèle refuse de le rapetisser à cette
    distance. Atténuation gratuite : le segment 03 l'éloigne, donc il rétrécit à l'écran.
  - `k4` et `k5` : le leurre vole nez vers la ligne. `k5` a été regénérée — l'échelle et la
    composition s'améliorent nettement, **la direction non**. Accepté parce que les deux images
    sont désormais **cohérentes entre elles** : Veo n'a pas à retourner le leurre en cours de
    vol, donc le vrai risque (un morphing à mi-trajectoire) est écarté.
- **Les prompts sont donc en avance sur les images** sur ces deux points précis : ils sont justes
  pour une éventuelle V4, ils ne décrivent pas la V3 telle qu'elle est. C'est écrit noir sur
  blanc dans le storyboard pour que la doc ne mente pas.
- `k9` renommée `k8` par Logan : la renumérotation de la v0.8 est appliquée aux fichiers.
- Reste à faire à la main : recadrer le losange ✦, présent sur les 8 images.

## 2026-08-06 — Spec vidéo v0.8 : revue de la série V2, fusion 02–03, la prise en charge, la ligne
Revue image par image des 9 keyframes générées. **L'ambiance est acquise** (aube froide, brume,
eau d'acier, trois silhouettes) — c'était le problème n°1 de départ, il est réglé. Le reste
corrige la structure et des défauts techniques.

- **La chaîne passe de 9 à 8 keyframes, le film de 8 à 7 segments.** L'ancienne `k3` disparaît :
  elle et `k4` partageaient exactement le même cadre, seul un bras bougeait entre les deux —
  Veo devait meubler dix secondes avec ça. Les segments 02 et 03 fusionnent en un seul
  (`k2 → k3`, 46 images) qui contient la traversée du bateau, son arrêt ET l'armé : de la
  matière pour un vrai plan. Total inchangé : 240 images, 10 s.
- **La fin du film change de nature — décision de Logan.** On ne coupe plus sur la traque : le
  bass sort du massif d'algues et **prend le leurre en gueule**. « strike, bite, mouth closing »
  sortent des negative prompts (ils interdisaient exactement le sujet du plan) ; restent exclus
  le sang, l'hameçon planté, les mains, l'épuisette — on montre la prise en charge, jamais la
  capture. Le principe n°5 de `video/README.md` était l'inverse : réécrit.
- **La ligne devient un invariant.** Aucune image générée ne montrait de fil. Elle est désormais
  décrite dans le bloc INVARIANTS et dans chaque plan concerné : nouée à l'**œillet chromé du
  nez** (jamais à un hameçon, jamais à la queue), et sa direction suit la physique — elle
  **file derrière** le leurre en vol (elle se dévide du moulinet) et **part devant, tendue**,
  sous l'eau à la récupération, où elle est ce qui tracte. Écrire « toujours devant » aurait
  rendu le plan de vol faux.
- **Six images à regénérer, deux à garder.** Tableau de correspondance ancien → nouveau dans le
  storyboard. `k1` et l'ancienne `k9` (à renommer `k8`) sont validées. Les six autres corrigent :
  lancer depuis un bateau en marche (`k2`), format carré 1:1 (`k3`, `k4`), échelle du leurre
  (`k4`), réapparition du bateau et équipage debout (`k5`), eau turquoise tropicale (`k6`),
  leurre qui lit comme une incrustation 3D sans ligne (`k7`).
- **Trois pièges de génération consignés** : le ratio 16:9 **ne se règle pas dans le prompt**
  (trois images sont sorties carrées malgré la consigne — le régler dans l'outil) ; le losange ✦
  du générateur apparaît sur toutes les images et aucun negative ne l'empêche de façon fiable
  (le recadrer à la main, sinon c'est une marque à l'écran) ; les logos du bateau passent au
  travers (écusson sur le capot du hors-bord, logos sur les sièges — vérifiés sur `k2`).
- Alignés au passage : `spec-technique.md`, `video/README.md`, le générateur du `.md`.

## 2026-08-06 (soir) — L'offre Collection : deux paliers, une récompense, une progression

Le barème dégressif de l'après-midi est **remplacé**. Spec : `docs/specs/offre-collection.md`
(`panier-bareme-degressif.md` est périmé).

- **Deux paliers, pas cinq** : **Un leurre 21,99 €** · **La collection 43,98 €** (les 3 coloris,
  soit exactement 2 × le prix d'un — « un leurre acheté, les 2 autres pour le prix d'un ») **+ le
  Noir collector offert**. Un choix binaire se décide ; une liste de cinq prix se calcule.
- **`quantite` a disparu du domaine.** On ne prend plus *n* fois le même leurre, on prend un
  coloris ou la collection. Le schéma est `{ coloris, offre }`. Un champ qui ne veut plus rien
  dire finit par être mal interprété — mieux vaut le supprimer que le laisser traîner.
- **La progression en 3 points** (`OfferProgress.tsx`) : votre premier leurre → les 2 autres pour
  le prix d'un → le Noir collector. Barre qui se remplit **une seule fois** (fondation §6),
  cadenas sur ce qui n'est pas acquis. **Aucune urgence fabriquée** : pas de minuteur, pas de
  « plus que X en stock », pas de compteur inventé — rien de tout ça ne serait vrai.
- **Un chiffre faux attrapé par mon propre garde-fou** : 43,98 € / 4 leurres = **10,995 €**, pas
  11,00 €. `perLureCents()` refuse de répondre quand la division n'est pas exacte, et le test a
  fait échouer le gate. L'annonce est donc « **moins de 11,00 € le leurre** » — vrai et
  vérifiable. La spec portait le chiffre faux, elle est corrigée.
- **Le collector part chez Stripe comme une ligne à 0,00 € nommée « offert »** : l'acheteur voit
  ce qu'il reçoit, et le total ne bouge pas. Invariant testé : la somme des lignes = `totalCents`.
- **Moyens de paiement affichés avant le clic** : Carte bancaire · PayPal, avec la mention
  « Paiement sur Stripe — vos coordonnées bancaires ne passent jamais par ce site ». **La carte
  reste active** : l'inquiétude de Camil (« les gens rentrent leur carte chez nous ») ne
  s'applique pas ici — le Checkout est en redirection pleine page, la carte est saisie sur
  `checkout.stripe.com` et ne touche ni notre serveur, ni nos logs, ni notre domaine (ADR-001).
  **À FAIRE (Camil)** : activer PayPal dans le dashboard Stripe — c'est un réglage, pas du code.
- **La flèche en filigrane derrière le hero**, opacité 0.06 comme l'impose la charte §2 (territoire
  de marque de la landing). **SVG inline** (`AlureArrow.tsx`) et non `next/image` : ce dernier
  refuse les SVG sans `dangerouslyAllowSVG`, un réglage qui ouvrirait l'optimiseur à tous les SVG
  distants pour un seul fichier local. Inline = zéro requête, zéro CLS, couleur héritée.
- **Les 5 langues régénérées** sur le nouveau modèle : 136 clés chacune, mêmes clés, même ordre,
  mêmes placeholders — vérifié par `src/lib/i18n.test.ts`, qui est ce qui rend la règle
  « tout texte va dans les 5 langues » mécanique plutôt que déclarative.
- **Gate** : tsc 0 · eslint 0 · **122 tests** · build OK · pages vérifiées au navigateur.

## 2026-08-06 (soir) — La chaîne de génération des rushes vidéo (fal.ai · Seedance 2.0)

`npm run video` fabrique les 8 rushes du hero en image-to-video, **en lisant les prompts depuis
`docs/specs/video/prompts-plans.md`** au lieu de les recopier. Doc : `docs/specs/video/generation-fal.md`.

- **Le script lit la spec, il ne la duplique pas.** `scripts/video/plans.mjs` parse les 8 plans,
  leurs prompts vidéo, leurs negative prompts, le tableau de substitution du témoin gris et les
  deux alias d'images (`p04-in` = `p03-out`, `p06-in` = `p05-out`). Corriger la spec suffit ;
  il n'y a pas de troisième exemplaire des prompts qui dérive.
- **Le témoin gris est appliqué, et vérifié.** Sur les plans 05 à 08, la description du leurre est
  remplacée par le volume gris mat. Si la chaîne du tableau ne se retrouve plus mot pour mot dans
  le prompt, **le script refuse de générer** au lieu d'envoyer la description complète du leurre au
  moteur. C'est le critère d'acceptation n°3 rendu mécanique.
- **`--dry-run` fonctionne sans clé API** : toute la chaîne (parsing, substitution, images
  résolues, prompt final) se vérifie avant de dépenser quoi que ce soit. Vérifié sur P07.
- **Chaque rush a un sidecar `.json`** — prompt exact, seed, `requestId`, images sources, réglages.
  Les `.mp4` sont git-ignorés (lourds, refabricables) ; les `.json` sont versionnés.
- **Seedance ≠ Kling/Veo, et c'est écrit** : `end_image_url` natif (excellent pour la méthode
  entrée/sortie de la spec), mais **aucun champ `negative_prompt`** — les exclusions sont repliées
  en fin de prompt positif, avec `--no-negatives` pour comparer si un plan dérive. Et si on passe à
  Seedance, on y passe pour les 8 plans : mélanger les moteurs casserait le raccord de lumière.
- **`FAL_KEY` est locale, pas une variable du site** : lue uniquement par le script via
  `node --env-file-if-exists=.env.local`, `@fal-ai/client` en `devDependencies`. Rien ne monte
  dans Vercel, rien n'entre dans le bundle.

**Bloquant amont** : les 14 images d'entrée/sortie (`assets/hero/frames/`) n'existent pas encore.
Le script les liste plan par plan et s'arrête — il ne devine rien.

Fichiers : `scripts/generate-video.mjs`, `scripts/video/plans.mjs`,
`docs/specs/video/generation-fal.md`, `.env.example`, `.gitignore`, `package.json`.

## 2026-08-06 — On peut payer pour de vrai, barème dégressif, collector, 5 langues
Grosse session. Le fil conducteur : **rendre répétable ce qui va se répéter** — changer un prix,
ajouter un leurre, ajouter une langue.

### Le paiement fonctionne, de bout en bout
- **Clés de test obtenues sans compte** : `stripe sandbox create` (CLI Stripe). Le secret est une
  **clé restreinte** `rkcs_test_` — la recommandation Stripe, pas une clé secrète complète.
  ⚠️ **Le bac à sable EXPIRE LE 2026-08-13** : `stripe sandbox claim` pour le garder.
- **Vérifié en vrai** : `POST /api/checkout` crée une session, la page Stripe affiche le bon
  montant et le bon détail, et le **webhook répond 200 à un événement réellement signé**
  (`stripe listen` + `stripe trigger`), en loggant exactement ce que le runbook prédisait pour
  un événement synthétique sans métadonnées.
- **Non vérifié** : la saisie de carte elle-même — les champs sont dans une iframe Stripe
  protégée par hcaptcha, je ne force pas ça. Et **Resend n'est pas configuré**, donc l'email de
  confirmation ne part pas encore (le webhook répondrait 500 et Stripe re-livrerait — le
  comportement voulu).
- **Confirmation inattendue du correctif `payment_status`** : le bac à sable a activé d'office
  **Bancontact, MB WAY, Satispay, EPS**. Des moyens non-carte, dont certains à notification
  différée, sont donc actifs par défaut — exactement le scénario contre lequel la garde
  ajoutée ce matin protège.

### Barème dégressif — 25 € le premier, 13 € chaque suivant
- Spec : `docs/specs/panier-bareme-degressif.md`. Totaux : 25 / 38 / 51 / 64 / 77 €.
- **`unitAmountCents` a disparu**, volontairement : avec un barème dégressif, un « prix
  unitaire » n'existe plus, et le garder inviterait à écrire `prix × quantité` — un montant
  faux **en silence**. Reste `PRODUCT.pricing` + `totalCents()` + `savingsCents()` +
  `checkoutLines()`.
- **Deux lignes chez Stripe** dès 2 leurres : la remise se **lit** sur la page de paiement au
  lieu d'être noyée dans un total. Vérifié à l'écran : « 25,00 € · Qté 1 » puis
  « leurre supplémentaire · Qté 2 · 13,00 € chacun ».
- **Aucun prix unitaire moyen affiché** : 77/5 tombe juste, mais c'est une coïncidence de ces
  deux nombres. On affiche la règle et l'économie, exactes par construction.
- **Trou de test comblé** : `src/lib/shop/stripe.test.ts` — `stripe.ts` n'avait aucun test
  direct alors que c'est là que les montants partent. 11 tests, dont l'invariant « la somme des
  lignes envoyées à Stripe vaut `totalCents` » à toutes les quantités.

### Le leurre fait 6,5 cm pour 6,5 g
- Confirmé par Camil ; le journal et `prompts-plans.md` le portaient encore en « à mesurer ».
- Source unique `PRODUCT.specs` → page produit, hero, FAQ (nouvelle question), description de la
  ligne Stripe, JSON-LD (`size` + `weight`). **Aucun chiffre réécrit à la main.**

### Sélecteur de vues + 4ᵉ leurre + collector
- **Cinq vues** sur l'accueil (droite, gauche, dessus, dessous, devant), rotations exactes
  dérivées du contrat d'orientation, **interpolées en quaternion** (en angles d'Euler, le leurre
  passerait par des orientations absurdes entre deux vues). Vérifié à l'écran.
- **`leurre_noir.glb` ajouté** : 4ᵉ leurre du carrousel. C'est le **collector**, offert à partir
  de 3 leurres achetés — il ne se vend pas, **il n'entre dans aucun calcul de montant**. Sur la
  page produit il apparaît dans le sélecteur avec un **cadenas** et le message
  « Achetez-en 3 pour bénéficier du leurre collector », qui devient « offert avec votre
  commande » dès 3.
- **La page produit montre le leurre 3D du coloris sélectionné** : le coloris et la quantité
  vivent désormais dans un contexte partagé par la galerie et l'îlot d'achat. Même scène que le
  hero, en mode `solo`.
- **⚠️ Hypothèse à confirmer** : j'ai lié coloris-1 → Truite, coloris-2 → Brochet,
  coloris-3 → Orange, dans l'ordre du registre. Personne ne m'a dit quel `.glb` correspond à
  quel coloris — c'était nécessaire pour afficher le bon leurre. À valider.

### Standardisation — ce qui est maintenant impossible à rater
- **Changer un prix** : deux nombres dans `PRODUCT.pricing`, plus les 5 totaux attendus du test
  (écrits en dur exprès : le gate devient rouge et force à regarder les nouveaux montants). La
  **CI refuse un montant en euros écrit en dur dans un `.tsx`**.
- **Ajouter un leurre** : déposer le `.glb`, `npm run models` (traite tout le dossier), une
  entrée dans `LURE_MODELS`. `src/lib/lure-models.test.ts` rattrape les trois oublis possibles :
  fichier déclaré mais absent, `.glb` compressé jamais enregistré, preset inexistant. Et
  **chaque coloris doit avoir exactement un modèle 3D**.
- **Ajouter/modifier un texte** : `src/lib/i18n.test.ts` exige que les 5 langues aient
  **exactement les mêmes clés, dans le même ordre, avec les mêmes placeholders**. Un `{montant}`
  traduit ou disparu — le défaut qui ne se verrait qu'en production, chez le client — fait
  échouer le gate.
- Aucune de ces mécaniques ne connaît le chiffre 3 ni le chiffre 4 : carrousel, pastilles,
  préchargement et sélecteur s'adaptent au nombre d'entrées.

### Multilingue — 5 langues, 121 clés chacune
- `docs/i18n/` : `README.md` (le standard), `fr.md` (la référence), puis `en`, `es`, `de`, `nl`.
  Tout le texte visible du site : nav, hero, page produit, barème, FAQ, suivi, merci, contact,
  légal, emails, états d'erreur, sélecteur de langue.
- **Adapté, pas traduit** : vouvoiement partout (usted, Sie, u), même honnêteté sur le délai,
  mêmes interdits (aucun point d'exclamation commercial, aucun superlatif, aucun avis inventé).
- **Ne se traduisent jamais** : « Alure », « art. 293 B du CGI » (expliqué entre parenthèses,
  jamais remplacé), les pages légales (une traduction n'a aucune valeur juridique — un
  avertissement le dit), et la devise reste l'euro.
- **Le front est spécifié, pas implémenté** : routing `/en`, `/es`… sélecteur sans drapeaux
  (un drapeau désigne un pays, pas une langue), noms de langue dans leur propre langue, la page
  courante est conservée au changement, aucune redirection automatique, `hreflang` réciproques
  et un sitemap par langue.
- **🚩 BLOCAGE COMMERCIAL écrit en tête du README** : le site **ne livre qu'en France**.
  Publier une version allemande d'une boutique qui refuse l'adresse de livraison au paiement
  fait venir des gens pour rien et génère des litiges — or les litiges gèlent Stripe. Trois
  issues possibles, à trancher explicitement. Tant que ce n'est pas fait, chaque langue porte
  un encadré `SHIPPING_NOTICE` qui dit la vérité.

### État du gate
`tsc` 0 · `eslint` 0 · **123 tests** (48 → 123) · `next build` OK · vérification navigateur
réelle sur l'accueil et la page produit, zéro erreur console.

**Reste ouvert** : livraison hors France (bloque le multilingue) · frais de port (Camil vérifie)
· mapping coloris ↔ modèle 3D à confirmer · Resend à configurer · relecture native des 4 langues.

## 2026-08-06 — Les leurres nagent sur place
- **Nage procédurale par vertex shader**, à partir du kit déposé par Camil dans `files/`.
  Aucun des trois `.glb` ne contient d'animation (0 clip) : il n'y a rien à *jouer*, la nage est
  **générée**. Le seul rig disponible (armature auto-générée de la truite) se ramifie en six
  branches au lieu d'une colonne — inexploitable, il est purgé au chargement.
- **Le kit a été PORTÉ, pas installé.** Il est écrit pour `@react-three/fiber` + `drei` que ce
  site n'utilise pas, et son `<Environment preset>` télécharge un HDR depuis un **CDN tiers** —
  interdit par la CSP et la règle n°10. Le cœur (shader, patch matériau, presets) est du three
  pur : il vit maintenant dans `src/lib/three/`. Zéro dépendance ajoutée.
- **Deux étages, et c'est leur battement qui fait la nage** : l'onde qui parcourt le corps (GPU,
  shader) + roulis/lacet/oscillation du corps entier (CPU, 4 floats par leurre et par frame), à
  des fréquences **non commensurables** pour qu'aucune boucle ne se perçoive. Un seul étage
  donnerait soit un poisson scotché dans l'air, soit un objet qu'on secoue.
- **Dérogation actée à la fondation §6**, qui interdit « toute animation en boucle » : demandée
  explicitement par Camil, bornée à cette scène 3D. Aucune autre animation du site ne boucle, et
  **`prefers-reduced-motion` fige tout** — le temps de nage cesse simplement d'avancer.
- **Trois pièges du kit traités**, chacun avec un symptôme précis : `emissiveFactor: [1,1,1]` +
  texture émissive sur les trois exports (leurre auto-éclairé, PBR écrasé, rendu plat) →
  `emissiveIntensity = 0` · `doubleSided` (fill rate doublé pour des faces jamais visibles) →
  `FrontSide` · cache de programmes de three (l'ondulation disparaît de façon non déterministe)
  → `customProgramCacheKey`.
- **`files/` exclu de `tsconfig` et d'ESLint** : le dossier référence R3F et une arborescence
  `src/three/` qui n'est pas la nôtre, il faisait échouer le gate. C'est une source de référence,
  pas du code du site — même traitement qu'`assets/`.
- **Vérifié par capture de deux frames successives** : le corps a roulé et la queue changé
  d'angle entre les deux. Gate vert (tsc, eslint, 48 tests, build).
- **Nouvelle piste de compression consignée** (spec §3) : le `brochet.opt.glb` du kit fait
  **1,22 Mo** grâce à `EXT_meshopt_compression` — mais son décodeur instancie du **wasm**, donc
  `'wasm-unsafe-eval'` en CSP. La route `KHR_mesh_quantization` + `EXT_texture_webp`, elle, est
  gérée nativement par three **sans wasm ni changement de CSP** : à essayer en premier.
- Fichiers : `src/lib/three/{swim.config,swim.shader,swim-material}.ts`,
  `src/components/sections/home/lure-stage.ts`, `src/lib/lure-models.ts`, `eslint.config.mjs`,
  `tsconfig.json`, `docs/specs/hero-3d.md`.

## 2026-08-06 — Hero 3D : les trois leurres en carrousel infini sur l'accueil
- **L'accueil intérimaire est remplacé par un vrai hero** : les trois modèles Blender affichés en
  3D, un au centre, ses voisins qui dépassent du cadre, et le passage de l'un à l'autre **en
  boucle**. Glissé horizontal, molette horizontale, flèches du clavier, boutons et pastilles.
  Spec complète : `docs/specs/hero-3d.md`.
- **Le piège qui a coûté le plus de temps, et qui ne se voyait pas** : les leurres s'affichaient
  **tout blancs**. Ce n'était pas l'éclairage — c'est la **CSP** qui bloquait. GLTFLoader extrait
  les textures embarquées du `.glb` en URL `blob:` puis les récupère par `fetch`, or
  `connect-src` valait `'self'` seul. Les textures ne chargeaient jamais et l'erreur ne sortait
  que dans la console. `blob:` ajouté à `connect-src` dans `next.config.ts` — exactement le cas
  que la règle n°4 vise. Ce n'est pas une ouverture vers un tiers : le blob naît de notre page,
  à partir d'un fichier déjà servi par notre domaine.
- **75 Mo de GLB ne pouvaient pas entrer dans `public/`** (les 3 exports pèsent ~25 Mo pièce, dont
  ~20 Mo de JPEG 4K). `scripts/optimize-glb.mjs` les recompresse : textures en 1024 px,
  tangentes retirées quand elles existent, binaire reconstruit et réaligné.
  **71,6 Mo → 15,5 Mo (−80 %)**, validé fichier par fichier (bornes des bufferViews, alignement
  4 octets, images relues par sharp).
- **Aucune rotation automatique, aucune animation en boucle** — fondation §6. Le leurre ne tourne
  jamais tout seul ; le seul mouvement est le passage d'un leurre à l'autre, amorti sur exactement
  `--dur-page` (τ = 0,14 s, donc 3τ = 0,42 s). Et le hero **ne capture jamais le scroll vertical**
  de la page.
- **Le `<Marker>` a quitté l'accueil** : la landing est territoire de marque, le surligneur y est
  interdit (charte V.02 §2). C'était déjà noté « à respecter au LOT 3 ».
- **Rien d'inventé sur les coloris** : les libellés affichés sont les **noms de travail** des
  fichiers (Truite, Brochet, Orange), pas des noms de vente. `product.ts` reste la seule source
  commerciale et ses trois coloris sont toujours provisoires — `colorwayId` vaut `null` tant que
  la correspondance modèle ↔ coloris n'est pas tranchée.
- **Dette chiffrée, écrite, non silencieuse** (spec §3) : la géométrie n'est pas compressée
  (~4 Mo/modèle — Draco/meshopt exigeraient `'wasm-unsafe-eval'` en CSP, décision à prendre à
  part) ; `leurre-truite.glb` transporte un squelette inutile (~2,3 Mo, zéro animation) ; les
  `.glb` bruts de `brochet` et `orange` (46 Mo) ne sont **pas** suivis par git.
- Dépendances ajoutées : `three` 0.185.1, `@types/three` (dev), `sharp` (dev, compression).
- **Gate vert** + vérification navigateur réelle 1280 px et 375 px : zéro erreur console, aucun
  scroll horizontal, tour complet du carrousel vérifié.
- Fichiers : `src/components/sections/home/{Hero,LureCarousel}.tsx`, `lure-stage.ts`,
  `src/lib/lure-models.ts`, `src/app/page.tsx`, `next.config.ts`, `scripts/optimize-glb.mjs`,
  `public/models/*.glb`, `docs/specs/hero-3d.md`.

## 2026-08-06 — Configuration Stripe, et un webhook qui confondait « terminé » et « payé »
- **Le trou principal n'était pas du code mais de la configuration** : aucun fichier du dépôt ne
  disait quelles variables d'environnement le site attend. C'est comblé. **Mais l'audit de
  l'intégration a trouvé un vrai défaut, corrigé dans la foulée** (ci-dessous).

### Le défaut corrigé — `checkout.session.completed` ne veut pas dire « payé »
- **Le webhook envoyait « Votre commande est confirmée — Total payé : X € » sans jamais lire
  `payment_status`.** Or cet événement signifie « le client a terminé le tunnel », pas « l'argent
  est encaissé » : un moyen à **notification différée** le livre avec `payment_status: 'unpaid'`,
  et seul `checkout.session.async_payment_succeeded` tranche, parfois des jours plus tard.
- **Pourquoi c'était grave ici précisément** : l'architecture assume que « activer un moyen de
  paiement = un réglage de dashboard, aucun code » (`payment_method_types` non fixé, ADR-001).
  Cette promesse était **fausse** : le jour où un moyen différé serait activé au dashboard, le site
  aurait annoncé un paiement encaissé qui pouvait encore échouer, et la notification interne aurait
  déclenché une expédition à perte. Sans BDD, aucun rattrapage possible.
- **Correction** (`src/app/api/stripe-webhook/route.ts`) : garde `payment_status !== 'unpaid'` avant
  tout envoi (le test officiel de la doc Stripe) ; `async_payment_succeeded` traité dans la **même**
  branche que `completed` ; `async_payment_failed` accusé en 200 avec un log — aucun email n'étant
  parti, il n'y a rien à rétracter. **4 tests ajoutés** ; l'endpoint doit désormais être abonné à
  **trois** types, ce qui est reporté dans `PAIEMENTS.md`, la spec du socle et le runbook.
- Vérifié contre `docs.stripe.com/checkout/fulfillment` le 06/08/2026 — la doctrine officielle dit
  littéralement de traiter dès que `payment_status != 'unpaid'` et d'écouter les deux événements.

### La configuration
- **Le code de checkout n'a pas bougé** — il était déjà livré et testé (LOT 2, T1-T4).
- **`.env.local`** (git-ignoré) est créé et prêt à remplir : les 5 variables, chacune avec le
  fichier:ligne qui la lit et ce qui se passe si elle manque. **`.env.example`** (versionné,
  sans aucune valeur) est le modèle — le `.gitignore` a reçu `!.env.example` pour l'exempter
  de la règle `.env*`.
- **La clé publiable Stripe ne sert à rien ici, et c'est écrit noir sur blanc** dans les deux
  fichiers env. Une clé publiable ne fait tourner que Stripe.js dans le navigateur ; l'ADR-001
  a retenu la redirection pleine page, donc aucun script Stripe ne s'exécute sur notre domaine.
  Celle transmise par Camil est conservée en commentaire dans `.env.local` pour ne pas la perdre.
  Elle ne redeviendrait nécessaire qu'avec un checkout embarqué — ce qui rouvrirait l'ADR-001.
- **`docs/architecture/BRANCHEMENT-STRIPE.md`** — le runbook qui débloque **T5** : compte et clé
  test, Resend, CLI Stripe (`stripe listen --events checkout.session.completed --forward-to
  localhost:3000/api/stripe-webhook`, dont le secret `whsec_` **change à chaque lancement**),
  les 4 cartes de test, la checklist du parcours, l'activation des moyens de paiement au
  dashboard, et le passage en production. **Commandes, cartes et politique de re-livraison
  vérifiées contre `docs.stripe.com` le 06/08/2026** — rien écrit de mémoire.
- **Piège consigné** : `stripe trigger checkout.session.completed` ne prouve rien sur les emails.
  L'événement synthétique n'a ni `customer_details.email` ni nos `metadata`, donc
  `toOrderSummary()` renvoie `null` et la route répond 200 `{ skipped: true }`. Seul un vrai
  achat avec carte de test teste le parcours.
- **Recommandation Stripe reportée** : clé **restreinte** (`rk_`) limitée à « Checkout Sessions :
  écriture » plutôt qu'une clé secrète — ce site n'émet qu'un seul appel API. Obligatoire au
  passage en live, optionnel en test.
- **Filet CI** : `.github/workflows/ci.yml` refuse désormais un fichier suivi contenant une clé
  Stripe (`sk_`/`rk_`/`whsec_` avec une vraie longueur — la doc peut écrire « sk_test_… » sans
  faire échouer la CI) ou un fichier `.env` autre que `.env.example`. Motif vérifié localement :
  détecte une vraie clé, zéro faux positif sur la doc.
- **Plugin Stripe installé** (`stripe@claude-plugins-official`) et serveur MCP `https://mcp.stripe.com`
  enregistré. Il reste **à authentifier par Camil** (`/mcp` dans Claude Code) — sans quoi
  `stripe_implementation_planner` n'est pas disponible.
- **Gate complet vert** après `npm install` (le dépôt était sans `node_modules`) : `tsc --noEmit`
  0 erreur · `eslint .` 0 erreur · **48 tests** (44 + 4) · `next build` OK, les 3 routes API bien
  rendues dynamiques. SDK `stripe` 22.4.0, version d'API épinglée `2026-07-29.dahlia` — la plus
  récente. **Vérification navigateur non faite** : elle demande les vraies clés (T5).
- Fichiers : `.env.local` (non commité), `.env.example`, `.gitignore`,
  `docs/architecture/BRANCHEMENT-STRIPE.md`, `docs/architecture/PAIEMENTS.md`,
  `docs/specs/paiement-socle-checkout.md`, `docs/specs/boutique.md`, `.github/workflows/ci.yml`,
  `src/app/api/stripe-webhook/route.ts` + `route.test.ts`, et le compte de tests remis à jour dans
  l'ADR-001 et les specs paiement.

## 2026-08-06 — Spec vidéo : audit de cohérence des 22 prompts, 9 défauts corrigés
Relecture ligne à ligne des 14 prompts d'image et des 8 prompts vidéo. Ce qui ne collait pas :
- **Une personne disparaissait entre deux plans.** `p01-out` décrivait 3 personnes à bord (2 à la
  console + 1 sur le pont arrière) là où `p02-in`, `p02-out` et le prompt vidéo P02 en comptent
  **4**. Corrigé : 2 assis + 1 pont avant + 1 pont arrière partout.
- **Le brochet arrivait du mauvais côté.** `p07-in` place les herbiers **à droite**, mais
  `p07-out` ouvrait la pénombre **à gauche** et `p08-in` faisait sortir le poisson **à gauche** —
  alors que `p08-out` le pose **à droite**, derrière le leurre. Le sillage de micro-bulles part
  vers la droite : « derrière », c'est la droite. Tout ramené à droite, raccords français compris.
- **Un axe au lieu de deux.** `p03-out` disait `same joint` et le prompt vidéo P07
  `around the metal joint` — les photos finales montrent **deux** axes métalliques.
- **L'œil du brochet** était `pale` dans `p08-in` et `yellow` dans `p08-out` et P08.
- **Le témoin gris changeait de forme** : `elongated object` au plan 05, `two-part object` aux
  plans 07-08. C'est le même volume dans les quatre plans.
- **Le pêcheur perdait son coupe-vent** à la coupe P02 → P03 : `p03-in` et les prompts vidéo P03
  et P04 ne décrivaient que « technical long-sleeve fishing clothing ». Le coupe-vent olive est
  nommé partout où il est visible.
- **Le pont flottait** entre `dark casting decks` (ancrage) et `carpeted casting deck` (P02, P03).
  Une seule formule : `dark carpeted`.
- **Les instructions de substitution des plans 05 à 08 étaient périmées** : elles citaient
  `a small jointed swimbait in a trout finish`, chaîne qui n'existe plus depuis le passage à
  6,5 cm. Remplacées par un tableau des **chaînes exactes, plan par plan**.
- **La zone sûre 9:16 n'était dans aucun prompt** alors qu'un test d'acceptation la vérifie : elle
  entre dans le bloc d'ancrage.
- Plus un doublon (`beer branding` deux fois dans le negative P02).

Deux points volontairement laissés tels quels, notés ici pour ne pas les re-signaler : `p01-in`
exclut `people visible` alors que `p01-out` montre quatre personnes (c'est l'altitude qui change,
pas l'équipage) ; et le lanceur est debout sur le **pont arrière** — sur un bass boat on pêche
plutôt du pont avant, mais c'est la mise en scène décidée au plan 02 et elle est tenue partout.

## 2026-08-06 — Spec vidéo : le leurre fait 6,5 cm, et il doit se lire petit
- **6,5 cm écrit dans les 12 prompts** qui montrent le leurre (ancrage, `p03-in`, `p03-out`,
  témoins gris des plans 05 à 08, prompts vidéo P03 à P08).
- **Le chiffre seul ne suffit pas** : un modèle génératif ne sait pas ce que valent 6,5 cm. Chaque
  prompt porte donc une comparaison qu'il rend bien — `matchbox-sized`,
  `it disappears inside a closed hand` — et le plan 08 fait porter l'échelle par le brochet
  (`more than ten times its length`). C'est le contraste qui fait lire « petit », pas la mention
  métrique.
- **La fiche technique reste bloquée sur « à mesurer »** tant qu'on ne sait pas d'où vient le
  chiffre : mesuré au pied à coulisse → la ligne « Longueur » peut s'écrire ; repris de la fiche
  fournisseur → il reste une échelle de génération et rien ne s'affiche (VISION : aucune spec
  inventée). Question posée dans `prompts-plans.md`.
## 2026-08-06 — Le poisson du hero devient un black-bass, et le site cesse de promettre du brochet
**Décision produit, pas seulement vidéo.** Le leurre fait 6,5 cm : c'est un leurre de black-bass
et de perche, pas un leurre à brochet (où l'on part sur 10-20 cm). La cible sait reconnaître un
leurre sous-dimensionné — mieux vaut le dire juste que ratisser large.

- **P08 « Le brochet » devient P08 « Le bass ».** Le poisson du plan final est désormais un
  **très gros black-bass d'environ 50 cm** : corps haut et épais d'épaules, dos vert olive, flanc
  bronze barré d'une bande sombre déchiquetée, grande gueule fermée, dorsale épineuse puis molle,
  œil sombre cerclé de bronze. Prompts `k9` et vidéo P08 réécrits, plus l'intention, les
  raccords et la note de production.
- **L'échelle est corrigée, et c'est le vrai gain.** Le brochet « dépassait le mètre, tête = 3×
  le leurre » — un leurre de 6,5 cm derrière un brochet d'un mètre, un pêcheur averti tique. Un
  bass de 50 cm dont **la tête fait plus de deux fois le leurre** est juste, et le leurre y lit
  comme une bouchée. Bonus de cohérence : le bateau du film est un **bass boat** — tout le film
  parle enfin de la même pêche.
- **Le brochet devient une exclusion.** `pike, northern pike, long duckbill snout, muskellunge`
  ajoutés aux negative prompts de P07 et P08 ; `small bass, bass the same size as the lure`
  remplacent leurs équivalents brochet. Vérifié dans le navigateur : « pike » n'apparaît **que**
  dans les sections NEGATIVE, jamais dans une description de plan.
- **Fausse promesse retirée du site public.** La page d'accueil annonçait « Brochet, perche,
  black-bass » et la **description SEO** (`site-config.ts`, donc `<meta name="description">` et
  l'OG de toutes les pages) reprenait le brochet. C'était une affirmation produit fausse sur un
  site public — règle n°6. Corrigé en « Black-bass, perche » / « pour la pêche du black-bass et
  de la perche ». Aucun test n'assertait sur l'espèce ; gate repassé vert (tsc 0, eslint 0,
  44 tests, build OK) et rendu vérifié sur le serveur dev.
- **La décision est écrite dans `VISION.md`** (section Proposition de valeur) pour qu'elle ne se
  reperde pas : espèces visées = black-bass et perche, brochet revendiqué nulle part. La
  description de l'audience (« les pêcheurs de carnassiers ») reste inchangée : elle décrit qui
  ils sont, pas ce que le leurre promet.
- Fichiers alignés au passage : `spec-technique.md`, `video/README.md`,
  `BRIEF-DESIGN-SYSTEM.md`, et le générateur du `.md` (sinon le brochet revenait à la prochaine
  régénération).
- Les entrées de journal ci-dessous ne sont **pas** réécrites : elles datent d'avant la décision
  et disent ce qui était vrai à ce moment-là. C'est le rôle d'un journal.

## 2026-08-06 — Spec vidéo v0.7 : « balaclava » faisait refuser Veo 3 — vocabulaire corrigé
- **Refus constaté en production** sur le segment 01 : Veo 3 répond « I can't generate that
  video » — pas une erreur technique, un **refus de politique de contenu**. Cause : trois
  personnes en noir au **visage entièrement couvert par une cagoule** (`balaclava`) déclenchent
  le filtre « groupe masqué ». Les keyframes k1/k2, elles, étaient déjà générées et bonnes : le
  blocage est propre à la génération vidéo, plus stricte que la génération d'image.
- **Corrigé sans toucher au look** : la tenue s'écrit désormais `a plain black technical neck
  gaiter pulled up over the nose and mouth against the cold, a plain black cap pulled low, dark
  polarised sunglasses, the hood of a matte charcoal shell jacket up`. Silhouette identique à
  l'écran — visage couvert du nez au menton, yeux derrière les polarisantes, tête sous
  casquette + capuche — mais vocabulaire de pêche banal. **Ne jamais réintroduire « balaclava »
  ni « cagoule » dans un prompt** : bandeau d'avertissement ajouté dans la notice équipage.
- **Deuxième piège, plus sournois : un negative prompt n'est pas un espace neutre.** Les termes
  `exposed skin`, `bare hands`, `bare head`, `shirtless` y étaient — un classifieur ne lit pas
  la négation et ces mots pèsent comme s'ils étaient demandés. Retirés du negative commun et
  des negatives de plan, remplacés par `face turned toward the camera, uncovered face`. La liste
  a été resserrée au passage (les variantes de coques et de vêtements en trop diluaient).
- **Bug corrigé au passage** : le bloc INVARIANTS affirmait « the lure is exactly the swimbait
  shown in the attached reference photos » même sur les segments 01 et 02, où aucune photo de
  leurre n'est jointe — le modèle cherchait une pièce jointe inexistante. La phrase du leurre
  est maintenant **conditionnelle** : elle n'apparaît que dans les blocs où les 3 photos
  accompagnent vraiment le prompt.
- La question ouverte n°3 (« le look cagoule à valider ») passe de « À vérifier » à **Résolu**,
  avec la leçon générale consignée : ce qu'on écrit dans un negative prompt est lu.

## 2026-08-06 — Spec vidéo v0.6 : blocs autonomes + le vrai leurre par 3 rendus de référence
- **Vérifié : aucun modèle vidéo ne lit un fichier GLB** (Veo, Kling, Runway — images seulement).
  Le plus proche = les « ingredients » de Veo 3.1, jusqu'à 3 images de référence d'un objet.
  **Blender sort donc du chemin nominal** : on rend 3 vues de `leurre_truite.glb` une fois pour
  toutes (visionneuse GLB dans le navigateur, aucun logiciel 3D à apprendre) et on les joint à
  CHAQUE prompt d'image et de vidéo. Le compositing n'est plus qu'un repli de dernier recours
  sur P07–P08.
- **Les 3 vues sont figées, et calées sur les fichiers qui existent vraiment** : **A**
  `droite.png` (profil droit strict — la vue maîtresse : silhouette, bande magenta, articulation,
  triples) · **B** `face.png` (de face — le volume et la largeur du corps, ce qui empêche le
  modèle d'aplatir le leurre) · **C** `dessus.png` (l'épaisseur vue de haut et la position de
  l'articulation — sans elle la nage en S n'est pas crédible). Le dossier n'a **pas** de vue
  trois-quarts : `face.png` porte la même information, la spec le dit au lieu de demander un
  fichier inexistant. Des rendus du `.glb` restent une alternative valable.
- **⚠ Le losange ✦ des photos doit être recadré avant de joindre** — vérifié à l'œil sur
  `droite.png`. Une signature présente dans une référence se recopie dans l'image générée : ce
  serait une marque à l'écran (charte §7). Avertissement remonté en bandeau dans les deux docs.
- **Le témoin blanc est retiré.** Il n'existait que comme cible de tracking pour le compositing ;
  sans compositing il créerait un conflit (keyframe blanche + références colorées = le moteur
  devrait repeindre l'objet en cours de plan). Le vrai leurre est désormais dans les keyframes ET
  dans les références — ce qui sécurise surtout `k9`, le poster.
- **Un plan = UN copié-collé.** Chaque bloc est autonome : INVARIANTS (condensés) + SHOT +
  ATTACHED IMAGES (le mode d'emploi des pièces jointes, écrit pour le modèle) + NEGATIVE PROMPT
  complet. Plus de negative séparé, plus d'ancrage à coller en plus : 17 blocs, 17 boutons
  « Copier le bloc entier », 0 `pre.neg` résiduel. Un bandeau « À joindre avant d'envoyer » dit
  au-dessus de chaque bloc quels fichiers attacher.
- **Bug rattrapé à la vérification** : le negative commun contenait encore `coloured lure,
  eyes on the lure, hooks on the lure` — écrit pour l'ère du témoin blanc, ça aurait interdit le
  vrai produit. Remplacé par `different lure, restyled lure, changed lure colours, three hooks,
  single-piece lure…`.
- **`prompts-plans.md` est maintenant généré depuis les données du storyboard** (script de
  synchro dans le scratchpad de session) : les blocs des deux fichiers sont identiques mot pour
  mot, plus de dérive possible entre la vue de travail et la source canonique.
- L'échelle reste tenue **par les mots, pas par les rendus** : trois images d'un objet isolé ne
  disent rien de sa taille — les 6,5 cm sont ancrés contre un repère présent dans chaque plan.

## 2026-08-06 — Spec vidéo v0.5 : plan-séquence, aube froide, équipage cagoulé, témoin blanc 6,5 cm
- **Refonte complète du storyboard après test en génération de la v0.4** (constat : look
  « golden hour stock » sans signature, équipage variable, visages lisibles, leurre géant façon
  fusée au p05, paires IN/OUT quasi identiques qui forçaient Veo à halluciner). Fichiers :
  `docs/specs/video/prompts-plans.md` (source canonique) + `storyboard-scroll.html`
  (vue resynchronisée, vérifiée navigateur — rendu OK, console propre).
- **Le hero devient UN plan-séquence de 10 s, zéro cut** — décision de Logan : sur une piste de
  scrub, une coupe se sent sous le doigt. 8 segments d'une seule traversée de caméra ; chaque
  prompt vidéo impose « one continuous take », chaque negative exclut `cut, scene change`.
  Le p04 fouette vers le haut et part à la poursuite du leurre au lieu de couper.
- **Chaîne de 9 keyframes (`k1`…`k9`) au lieu de 14 images** : la fin du segment *n* EST le début
  du segment *n+1* (fichier partagé) → faux raccord impossible par construction. `k1` = image
  mère (seule générée à froid), `k9` = poster/reduced-motion. Le brochet n'existe qu'en `k9` :
  il entre PENDANT le segment 08.
- **Ambiance verrouillée : aube froide + brume** (choix Logan parmi 3 options) — avant le lever
  du soleil, eau noire vitreuse, brume dans chaque cadre, une seule lueur ambre pâle derrière la
  crête gauche. Le p05 « Les nuages » devient « La brume » : le leurre traverse la brume, plus
  les nuages (échelle absurde pour 6,5 cm).
- **Équipage fixe : exactement 3, uniforme identique** (choix Logan) — cagoule noire, casquette
  par-dessus, lunettes polarisantes, shell anthracite sans logo, gants noirs, zéro peau visible.
  Un seul bateau martelé partout (`NO OTHER BOAT` + negatives). Canette du p02 supprimée → la
  question loi Évin tombe. Nouvelle question ouverte : valider le look cagoule sur `k2`/`k3`
  (risque de dérive « braquage »).
- **Témoin blanc mat 6,5 cm dans TOUTES les images générées** — plus jamais de photo du leurre
  jointe à une génération d'image. Échelle ancrée contre des repères (anneau de scion, gerbe
  d'impact, tête du brochet ×3). Leurre réel uniquement via `leurre_truite.glb` : compositing
  Blender obligatoire P07–P08 (le témoin sert de cible de tracking), images de référence
  Veo 3.1 P03–P06. Veo ne lit pas de GLB (vérifié — images seulement).
- **Moteur unique : Veo 3** en first→last frame (Kling sorti du pipeline). Veo rend ~10 s quoi
  qu'il arrive : chaque paire de keyframes décrit un vrai déplacement, retiming au montage.
  Bonus rushes : ~80 s pour les réseaux.

## 2026-08-06 — Spec vidéo : « Avec photo du leurre » + photos finales Truite
- **Deux images sur quatorze se génèrent avec la photo du leurre jointe** : `p03-in` et
  `p03-out`, les deux seules où c'est le modèle qui dessine le leurre. Un **bandeau
  « AVEC PHOTO DU LEURRE »** (jaune, en tête du bloc) le dit dans le storyboard ; un tableau
  « quand joindre la photo » couvre les quatorze images. Les plans 05 à 08 portent la mention
  inverse : **sans photo — témoin gris**, sinon on réintroduit le leurre inventé qu'on cherche
  à éviter.
- **Fichiers à joindre** : `assets/photos leurre pour 3d/photo finales leurre truite/droite.png`
  + `dessus.png` (nouveau dossier de 6 vues propres déposé par Camil). **Recadrer le losange ✦
  en bas à droite avant de joindre** — une signature présente dans une référence se recopie dans
  l'image générée, et ce serait une marque à l'écran.
- **Description du leurre corrigée sur ces photos** : le dos n'est pas « jaune pâle » mais
  **jaune-olive**, avec **deux petites dorsales olive**, **deux axes métalliques** à
  l'articulation, une **caudale translucide fourchue**, un œil noir cerclé d'argent et un anneau
  de tête chromé. Reporté dans l'ancrage, `p03-in`, les prompts vidéo P03 et P07, et la fiche
  coloris. La modélisation Blender part désormais de ce dossier.

## 2026-08-06 — Spec vidéo : le bateau devient un bass boat
- **Le bateau du hero n'est plus une vedette blanche** mais un **bass boat noir métallisé** —
  long, bas sur l'eau, ponts de lancer plats et larges, sièges sur colonne, console basse à
  écrans, gros hors-bord noir sur platine, moteur d'étrave replié. Références déposées dans
  `assets/references-bateau/` (3 fichiers, fournis par Camil).
- **`photobateausportfinal.png` est la référence principale** : c'est le plan 01 déjà cadré
  (bateau de dos à pleine vitesse, sillage en V, bande de brume sur l'eau devant les crêtes,
  soleil derrière la crête gauche). `p01-out`, le prompt vidéo P01 et le bloc d'ancrage ont été
  réécrits dessus — la brume sur l'eau entre dans l'ancrage, elle tient P01 et P02.
- Reporté dans **9 prompts** : ancrage commun, `p01-in`, `p01-out`, `p02-in`, `p02-out`,
  `p03-in`, et les prompts vidéo P01, P02, P03, P04. Le pêcheur est désormais **debout et libre
  sur le pont arrière plat**, ce qui rend l'armé et le lancer lisibles en une seconde — c'est le
  gain réel du changement, au-delà du style.
- **Nouveau risque, nouveaux negative prompts** : ces bateaux sont couverts d'adhésifs de marque
  (coque, hors-bord, écrans) et la charte §7 refuse tout élément de marque tierce. Décalques,
  stickers de sponsor et logos d'électronique sont maintenant exclus explicitement, plus les
  types de coque parasites (runabout blanc, ponton, cabin cruiser, franc-bord haut).
- **À bord : des pêcheurs pros, hommes et femmes, jamais un visage.** Tenue de **pêche du bass en
  eau douce** — jersey de tournoi manches longues ou hoodie léger, casquette ou bob, lunettes
  polarisantes, chaussures de pont. **Pas de panoplie de mer** : waders, bottes de wading, ciré,
  salopette de quart, gilet de mouche et matériel offshore sont exclus nommément (un modèle
  habille un pêcheur en marin dès qu'on le laisse faire) ;
  chaque personnage est une silhouette en contre-jour ou vu strictement de dos ou trois quarts
  arrière. La règle est écrite dans les 11 prompts concernés **et** doublée dans chaque negative
  (`face turned toward the camera`, `front-facing portrait`, `bare head, no cap`,
  `sponsor patches`). C'est le critère « aucun visage reconnaissable » rendu opérationnel — et ce
  qui évite un droit à l'image sur un film de marque.
- **Aucune marque, nulle part, sur rien** — coque, hors-bord, écrans, vêtements, casquettes,
  lunettes, canne, moulinet, canette. La consigne est en capitales dans le bloc d'ancrage
  (`ABSOLUTELY NO BRANDING ANYWHERE IN THE FRAME`) et reprise dans les 14 negative prompts. La
  canette du plan 02 est décrite « unmarked matte, no label, no printing ».
- Le lanceur des plans 02 à 04 est **une seule et même personne** (homme, casquette noire unie,
  polarisantes, coupe-vent olive), toujours de dos. Le passer en femme = un mot dans quatre
  prompts, à décider avant génération.
- Fichiers : `prompts-plans.md`, `storyboard-scroll.html` (+ encadrés « Le bateau » et « Les
  pêcheurs »), `README.md`, `assets/references-bateau/`.

## 2026-08-05 — Spec vidéo v0.4 : les images d'entrée/sortie des 8 plans
- **Chaque plan porte désormais trois prompts** : image d'entrée, image de sortie, prompt vidéo.
  Seize emplacements, **14 fichiers à produire** — `p04-in` = `p03-out` et `p06-in` = `p05-out`
  sont le même fichier (continuités pures). Les images d'entrée se génèrent **en pièce jointe de
  la sortie du plan précédent** : c'est le seul mécanisme qui tient les huit raccords.
- **Le leurre a été redécrit d'après les photos fournisseur.** « small jointed swimbait »
  produisait un glide bait allongé qui n'est pas le nôtre : corps court et très ventru,
  articulation à agrafes métalliques apparentes, caudale souple translucide, gros œil noir.
  Corrigé dans les prompts vidéo P03, P04, P07 et dans les 14 prompts d'image.
- **Contradiction levée sur les plans 05–08** : le critère interdit un leurre inventé, mais les
  prompts en demandaient un. Route retenue — **témoin gris mat** dans les images, remplacé au
  compositing par le rendu Blender ; substitution exacte donnée pour le prompt vidéo. À valider
  sur une génération d'essai du plan 07 (Kling peut déformer un objet sans texture).
- **Deux contraintes de cadre ajoutées** aux prompts, elles n'y étaient pas : tiers haut libre sur
  P01–P02 (lock-up), bande basse homogène sur P07–P08 (beat 2), et zone sûre 9:16 centrée partout
  — c'est le test d'acceptation n°5. Nouveau test n°11 : valider les 14 images avant toute
  génération vidéo.
- **`p08-out` identifiée comme l'image critique** : c'est aussi le poster et l'image fixe du mode
  animations réduites — la seule à finir au niveau publication.
- Fichiers : `docs/specs/video/prompts-plans.md` (source canonique, réécrite),
  `storyboard-scroll.html` (tableau `PLANS` + rendu + 4 encadrés de méthode), `README.md`,
  `spec-technique.md`. Vérification : script du storyboard exécuté hors navigateur (rendu des
  8 cartes sans valeur `undefined`) + captures Chrome headless de la page.

## 2026-08-05 — Charte V.02 reçue et intégrée
- **Le livrable design est arrivé** (`docs/product/CHARTE-GRAPHIQUE-V02.md`, 635 lignes + version
  visuelle HTML + 3 SVG logo) pendant le LOT 1 — détecté avant commit, lu en entier, intégré.
- **Tokens fusionnés** dans `globals.css` : nouveaux rôles `prose-foreground`, `danger-text`
  (le rouge #e5484d échouait en texte sur surface, 3,7:1 — réservé au non-texte), `success`,
  `info`, `ring` (focus 2px offset 3px), `scrim` + `--gradient-scrim`. `accent-soft` résolu
  #384257.
- **Composants réalignés sur la charte §8** : BuyBox (prix = total avec `.px-pop` + sous-ligne
  unité, bandeau délai en slot serveur ENTRE prix et bouton, coloris en radios natifs avec
  pastilles + anneaux, stepper −/+ , CTA « Acheter », erreurs en danger-text, barre collante
  safe-area) · FAQ (plus/minus en fondu croisé — le chevron pivotant était interdit ; réponses
  en prose) · formulaire contact (h-48px, anneaux d'erreur, icônes circle-alert,
  aria-describedby, succès sans promesse de délai — le « 24 h » retiré, charte §13.8) · header
  (nav CAPITALES, ombre après 24px de scroll, ordre Le leurre·Suivi·FAQ) · footer (lock-up
  wordmark + flèche — seule zone d'interface où la flèche est admise, §2) · pages légales
  (prose #d5dbe6, interligne 1.75, 40rem) · titres H1 en capitales spec §4.
- **Territoires flèche/surligneur actés** (§2) : header sans flèche, surligneur jamais sur la
  landing — à respecter au LOT 3.
- **Favicon** (icon.png 512 + apple-icon 180, flèche sur Black Pearl, marge 18 %) et **OG image**
  refaite au gabarit §10 (lock-up seul, sans tagline) — générés au canvas avec la vraie fonte.
- Reste de la charte : vectoriser le wordmark SVG avant usage externe (§13.3) ; valider
  `accent-soft` à l'œil (§13.4). Le fichier `globals.charte-v02.css` livré a été fusionné puis
  supprimé, le LISEZ-MOI de dépose aussi (contenu acté ici). Zips d'assets git-ignorés.
- Gate complet vert (tsc, eslint, 44 tests, build) + vérification navigateur 375px/desktop.

## 2026-08-05 — LOT 1 · Fondations livrées
- **Typo réelle** : Glacial Indifference Regular+Bold self-hostée (`src/fonts/` + licence OFL,
  `next/font/local`, variable `--font-glacial`) — vérifiée au navigateur (le « a » géométrique).
- **Layout commun** : header (wordmark « ALURE. » texte + nav Le leurre/FAQ/Suivi avec
  `.px-marker-block` sur l'item actif), footer légal + contact, grain fondation sur la racine.
- **4 pages légales** (mentions, CGV, rétractation, confidentialité) : contenu réel rédigé,
  identité vendeur centralisée dans `src/lib/legal-config.ts` avec des « À COMPLÉTER »
  explicites. Tant qu'un champ manque : pages noindex (metadata) + robots disallow + hors
  sitemap, via le drapeau `LEGAL_COMPLETE`. ⚠️ Il faut aussi s'inscrire auprès d'un médiateur
  de la consommation (obligatoire e-commerce FR) et le reporter dans legal-config.
- **Contact** : schéma minimisé RGPD (email + message + n° commande optionnel — champ nom
  supprimé), `deliver()` branché sur Resend (reply-to = visiteur), page `/contact` avec
  react-hook-form + états distincts. Vérifié au navigateur : validation client → 503 honnête
  tant que Resend n'est pas configuré.
- **OG image** 1200×630 générée avec la vraie fonte (canvas navigateur), 65 Ko.
- **Accueil intérimaire** sobre (titre + prix + CTA vers /leurre) — l'ancien texte « Squelette
  prêt » du kit n'est plus visible. La vraie landing reste LOT 3.
- **CI réparée** : le job « Deploy SSH » du gabarit kit échouait à chaque push (secrets VPS
  inexistants — on déploie sur Vercel). Job retiré, la CI lint/tsc/test/build reste le garde-fou.
- **CSP** : aucun ajout nécessaire (Stripe en redirection pleine page, Resend côté serveur) —
  décision documentée dans la ROADMAP.
- **En attente Logan** : données légales réelles (nom, SIREN, adresse, email, adresse de retour,
  médiateur) → `src/lib/legal-config.ts` ; comptes Stripe/Resend (T5).
- ⚠️ Engagement écrit supplémentaire à relire : « réponse sous 24 h ouvrées » (page /contact).

## 2026-08-05 — LOT 2 · Boutique : T1 à T4 livrées (T5 en attente des comptes)
- **Spec validée** (`docs/specs/boutique.md`) : 21,99 € port inclus, PayPal via Stripe Checkout
  (une seule intégration, redirection pleine page → zéro script Stripe, zéro ajout CSP),
  3 coloris, quantité 1-5, pas de BDD (source de vérité = dashboard Stripe).
- **Module `src/lib/shop/`** : `product.ts` (prix en centimes, coloris avec dispo, délai),
  `checkout-schema.ts` (zod partagé), `stripe.ts` (session Checkout + vérif signature webhook),
  `emails.ts` (gabarits purs testés : confirmation client + notification interne, délai
  ré-affiché), `errors.ts` (erreurs typées).
- **Routes** : `POST /api/checkout` (gardes du kit : taille, JSON sûr, zod, rate-limit ; 503
  bruyant sans clé — vérifié au curl) · `POST /api/stripe-webhook` (signature obligatoire,
  idempotence par ID d'événement, échec d'email → 500 pour re-livraison Stripe).
- **Pages** : `/leurre` (délai 10-20 j visible sans scroller à 375px — critère de spec vérifié
  au navigateur ; barre d'achat collante mobile avec écho d'erreur ; piège min-w-0/grid corrigé),
  `/merci` (noindex + robots), `/faq` (source unique contenu + JSON-LD FAQPage, `<details>`
  natif), `/suivi` (4 étapes honnêtes). Sitemap à jour.
- **Gate** : tsc, eslint, 44 tests, build verts ; parcours navigateur vérifié 375px + desktop.
- **En attente Logan** : clés Stripe test + compte Resend pour T5 (bout en bout), puis passage
  en mode live au LOT 4. ⚠️ Engagements écrits dans la FAQ/suivi à relire : préparation
  « 1 à 2 jours ouvrés », geste « renvoi ou remboursement » au-delà de 30 jours ouvrés.
- Détail des choix : `docs/specs/boutique.md` (notes T1-T4).

## 2026-08-05 — Décisions DA + brief design system
- **Logo tranché** : la flèche n°1 de la charte (planche 8), version blanche — celle déjà
  appliquée aux 14 affiches proto.
- **Typographie tranchée** : **Glacial Indifference seule** pour tout le site (SIL OFL,
  self-hostée). Colette et Horizon écartées définitivement — licence webfont non vérifiable sur
  un site marchand. Conséquence : la famille n'a que Regular et Bold, donc la hiérarchie se fait
  par taille/casse/interlettrage. `globals.css` pointe désormais `--font-glacial` (posée par
  `next/font/local` en LOT 1) sur `--font-sans` ET `--font-display`.
- **Brief de charte V.02 écrit** → `docs/product/BRIEF-DESIGN-SYSTEM.md`, à donner à un Claude
  « design ». Il commande le design system complet (tokens, échelle typo, composants e-commerce
  avec états, règles logo + SVG, contrastes calculés).
  Deux points durs y sont posés explicitement, parce qu'ils casseraient le build sinon :
  1. **flèche vs surligneur** — la fondation Pastel impose un geste manuscrit (le surligneur),
     la marque en a déjà un (la flèche) ; le designer doit trancher leur cohabitation ;
  2. **texte blanc sur photo** — toute la DA repose sur des photos de coucher de soleil ; il faut
     un système de voiles/zones sûres garantissant 4,5:1, pas un réglage au cas par cas.
- Domaine : toujours en attente (comparaison des prix en cours).

## 2026-08-05 — Produit cadré (web-product)
- **Vision & produit écrits** : e-commerce mono-produit (leurre articulé 2 sections, dropshipping
  AliExpress fulfillment manuel), cible pêcheurs carnassiers FR 18-45 venant d'Insta/TikTok,
  conversion = achat Stripe/PayPal (~15-25 €). Anti-scope : pas de BDD, comptes, CMS, Shopify v1.
  → `docs/product/VISION.md`, `docs/product/PRODUCT.md`
- **DA alignée sur la charte graphique V.01** (`assets/charte graphique/`, 34 planches lues) :
  thème sombre unique, les 4 couleurs de la charte reprises telles quelles — Black Pearl #071128
  (fond), Mirage #20293e (surface), Oxford Blue #394153 (bordure), White (texte + CTA).
  ⚠️ La charte **ne définit aucune couleur d'accent** : le CTA est blanc sur bleu. Deux rôles
  non couverts (`muted`, `muted-foreground`) sont dérivés des 4 valeurs, pas inventés —
  muted-foreground éclairci pour passer AA (Oxford Blue brut = 1,8:1, illisible).
  Tokens posés → `src/app/globals.css`. Vouvoiement, scroll gsap+lenis réservé à la landing.
  - *Correction en cours de session* : une première DA « heure dorée » (fond #14202e, accent
    orange #f2933f, Montserrat+Inter) avait été déduite du seul moodboard, avant que le dossier
    `assets/charte graphique/` ne soit déposé. Elle était fausse sur la palette ET les polices —
    remplacée. La charte fait foi.
- **Fontes — contrainte durable** : la charte demande Colette (titres), Glacial Indifference
  (corps), Horizon (chiffres). Seule **Glacial Indifference est self-hostable sans risque**
  (SIL OFL, Hanken Design Co.). Colette et Horizon sont des polices Canva à licence webfont non
  vérifiée (homonymes multiples ; versions gratuites d'Horizon en usage personnel seulement).
  Rien n'est câblé dans `globals.css` tant que ce n'est pas tranché — pas de police sous licence
  incertaine sur un site marchand.
- **La charte est une ébauche V.01 avec des questions ouvertes** : logo non tranché (12 variantes,
  le designer recommande la n°1), logo blanc vs noir non tranché, aucune règle d'usage du logo,
  aucune échelle typographique, **aucun visuel produit**, aucune maquette web, aucun texte de
  marque. Tout le copy et tous les visuels du site sont à créer. → listé dans `ROADMAP.md`
- **Photos de référence extraites** : 6 images produit uniques sorties des 2 pages AliExpress
  sauvegardées → `assets/photos leurre pour 3d/reference-fournisseur/`. Les dumps de pages
  fournisseur (26 Mo de JS/CSS/trackers tiers, droits AliExpress) sont git-ignorés.
- **Décisions** : Vercel Analytics (sans cookie) ; emails transactionnels Resend ; logique
  commande isolée dans `src/lib/shop/` (condition de migration Shopify future).
- **Domaine NON tranché** (reporté par Logan). Vérifié le 2026-08-05 : alure.fr PRIS ;
  libres : alure-peche.fr, alure.fish, alurefishing.com, alure-fishing.fr, alure-leurres.fr,
  alure.store. `src/lib/site-config.ts` porte alure-peche.fr en PROVISOIRE (TODO explicite) —
  à trancher avant mise en ligne (bloquant Phase 3).
- **Règles permanentes Alure ajoutées à `CLAUDE.md`** : délais 10-20 j affichés honnêtement
  partout, logique commande dans `src/lib/shop/`, aucune image fournisseur publiée (+ coloris
  Pikachu exclu), pas de BDD v1, TVA non applicable art. 293 B.
- **Roadmap en lots** : LOT 1 fondations → LOT 2 boutique (chemin de l'argent) → LOT 3 landing
  narrative → LOT 4 mise en ligne. → `docs/ROADMAP.md`
- Prochaine étape : spec de la landing (`web-spec`) — et pipeline visuels 3D/IA en parallèle.

## 2026-08-05 — Initialisation depuis web-dev-kit
- Kit posé sur le projet (CLAUDE.md, skills, docs, hooks, plomberie starter).
