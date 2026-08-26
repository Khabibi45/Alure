# Roadmap — Alure

> Le parcours **idée → mise en ligne → post-lancement**, par phase et par lot.
> `[ ]` à faire · `[~]` en cours · `[x]` fait. Objectif : mise en ligne en jours, pas en semaines.
>
> Compagnons : **`docs/ROADMAP-SEO.md`** (le plan pour être premier) et
> **`docs/QUESTIONS.md`** (tout ce qui attend une réponse du propriétaire — c'est LE goulot).

## Phase 0 — Cadrage (une fois)
- [x] Produit cadré (`VISION.md`, `PRODUCT.md`) via `web-product` — direction artistique alignée
      sur la charte graphique V.01 (`assets/charte graphique/`)
- [x] `CLAUDE.md` sans `{{…}}` restant · `site-config.ts` rempli (domaine provisoire)
- [x] Base verte (`web-onboarding`) : tsc + eslint + test + build passent (148 tests verts au
      2026-08-08)

## Décisions DA
- [x] **Logo** : flèche n°1 blanche (celle des affiches proto) — tranché le 2026-08-05
- [x] **Typographie** : Glacial Indifference seule (SIL OFL) ; Colette et Horizon écartées
      (licence webfont non vérifiable) — tranché le 2026-08-05
- [x] **Charte V.02 + design system livrée** (`docs/product/CHARTE-GRAPHIQUE-V02.md` + version
      visuelle `.html` + SVG logo) et **intégrée** : tokens fusionnés, composants réalignés,
      favicon + OG générés depuis la flèche. Restes (charte §13) : vectoriser le wordmark SVG
      (fonttools/Inkscape — avant tout usage print/externe), lisser la flèche en Bézier
      (cosmétique), valider `--color-accent-soft` à l'œil.
- [~] **Domaine** : infrastructure TRANCHÉE le 2026-08-17 (décision Camil) — **registrar + DNS
      chez Cloudflare, hébergement Vercel inchangé**. Reste à trancher le NOM (candidats
      vérifiés libres : alure-peche.fr, alure.fish, alurefishing.com, alure-fishing.fr,
      alure-leurres.fr, alure.store — alure.fr est pris) puis à l'acheter (bloque LOT 4)
- [ ] **Couleur d'accent** : la charte n'en définit aucune, le CTA est blanc. À rouvrir seulement
      si la conversion le demande.

## Phase 1 — LOT 1 · Fondations (avant la première vraie page)
- [x] Tokens `@theme` posés dans `globals.css` (4 couleurs de la charte + 2 dérivés AA)
- [x] Glacial Indifference Regular + Bold en local (`src/fonts/`, licence OFL jointe) via
      `next/font/local` → `--font-glacial`
- [x] `layout.tsx` : fonte, metadata + OG par défaut, grain fondation, header (wordmark ALURE. +
      nav avec marqueur actif) / footer (liens légaux + contact)
- [x] CSP : AUCUN ajout nécessaire — Stripe en redirection (zéro script tiers), Resend côté
      serveur. À revoir seulement si un embed/analytics arrive (LOT 4)
- [x] Pages légales v1 (mentions, CGV, rétractation, confidentialité) accessibles depuis le
      footer — identité vendeur « À COMPLÉTER » dans `src/lib/legal-config.ts` : pages noindex +
      hors sitemap tant que non remplies (bloquant mise en ligne)
- [~] Formulaire de contact branché (schéma partagé → route → Resend, page `/contact`) — le test
      d'envoi réel attend le compte Resend (avec T5)
- [x] OG image par défaut (1200×630, 65 Ko, vraie fonte) dans `public/`
- [x] CI verte sur GitHub : job de déploiement SSH du gabarit retiré (Vercel déploie via Git)
- [x] Accueil intérimaire sobre (la vraie landing = LOT 3)

## Phase 2 — Pages & contenu (une spec par lot : `web-spec` → `web-feature` → gate)

### LOT 2 · Boutique (le chemin de l'argent d'abord)
- [x] Spec `docs/specs/boutique.md` validée (prix 21,99 € port inclus, PayPal via Stripe
      Checkout, 3 coloris, quantité 1-5)
- [x] `src/lib/shop/` : données produit + session Stripe Checkout (PayPal via dashboard Stripe)
- [x] Page `/leurre` : galerie (emplacements LOT 3), coloris, quantité, délais visibles à 375px,
      barre d'achat collante mobile + `/merci` (noindex)
- [x] Webhook Stripe (signature, idempotence) → emails Resend (confirmation + notification)
- [x] Pages `/suivi` + `/faq` (JSON-LD FAQPage)
- [~] Test de bout en bout mode test Stripe/PayPal — **en attente des clés Stripe/Resend (Logan)**
- [x] Libellés coloris réels + visuels produit (2026-08-09) : « Truite arc-en-ciel / Perche /
      Orange feu » (robes vérifiées sur nos rendus 3D — jamais « brochet », cf. VISION), pastilles
      images dans la BuyBox (`public/produit/`), un seul nommage public (`lureDisplayName`)
- [ ] ⚠️ Avant mise en ligne : expéditeur email sur le vrai domaine (LOT 4), visuel du collector
      noir à capturer (le seul coloris sans image produit)

### LOT 3 · Landing narrative (la pièce maîtresse)
- [ ] Logo tranché → export SVG (wordmark + flèche), favicon, OG image
- [ ] Pipeline visuels : rendus 3D / images & vidéos IA (Veo/Kling) d'après
      `assets/photos leurre pour 3d/reference-fournisseur/` — la charte ne contient AUCUN visuel
      produit, tout est à créer. Validation des assets AVANT la spec fine des scènes
- [ ] Spec `docs/specs/landing.md` : scènes du scroll narratif (articulation → nage → coloris →
      hameçons → achat), comportement reduced-motion, budget perf
- [x] **Première scène du scroll narratif livrée** (2026-08-07) : séquence d'images au scroll
      (`npm run frames` → 302 images WebP, ~5,5 Mo, 30 fps) puis fondu sur le carrousel 3D des
      coloris.
      **Sans gsap ni lenis** : `position: sticky` en CSS suffit et évite le bug de `pin` documenté
      dans `WEB-REFERENCE.md`. Les deux libs restent donc hors bundle — à ne rajouter que si une
      scène ultérieure l'exige vraiment. Détail : `docs/PROGRESS.md`.
- [x] **Le hero est devenu l'hybride `cine`** (2026-08-08) : vidéo d'ouverture sans watermark
      (frames régénérées depuis `hero.mp4` propre) + lock-up ALURE. sur l'intro + scroll
      réversible + articulation 3D rigide fidèle au produit PVC. Reste ⚠️ `seg3` (le lancer) à
      produire si on veut la traversée complète — le montage actuel saute ce plan.
- [x] Navigation complète (header 5 entrées + footer 2 niveaux) et page `/a-propos` avec nos
      visuels (2026-08-09)
- [ ] Les scènes suivantes de la landing (articulation → hameçons → achat), CTA vers `/leurre`
      — spec `docs/specs/landing.md` à écrire d'abord
- [ ] États vides/erreur soignés partout ; sitemap/robots à jour à chaque page

## Phase 2.5 — LOT 9/10 · Reste applicatif (avant la mise en ligne)

> État au 2026-08-17 : `main` = la prod Vercel actuelle ; le travail récent vit sur
> `lot9-conversion` (poussée) et `lot8-splash-carrousel` (locale). À réconcilier AVANT le LOT 4.

- [ ] **Réconcilier les branches** : décider du sort de `lot8-splash-carrousel` (titre carrousel,
      geste de flick, gravure 3D — le splash/loader est déjà repris dans lot9), fusionner
      `lot9-conversion` → `main` après validation visuelle de Camil sur la préversion Vercel
- [x] **Compteur de commandes rebranché** (2026-08-26) : il sert d'objectif à la campagne de
      précommande, traduit dans les deux langues, et un test interdit que le bandeau et la
      campagne annoncent deux chiffres différents
- [ ] **BLOQUANT — la date limite d'expédition de la précommande** (`PRECOMMANDE_SHIP_BY` dans
      `src/lib/shop/precommande.ts`). Tant qu'elle n'est pas renseignée, la campagne ne s'affiche
      nulle part : c'est voulu. Une précommande sans date est illégale (art. L216-1), et à défaut
      la loi impose 30 jours. La date doit tenir MÊME si l'objectif est atteint au dernier moment
- [ ] **Les CGV de la précommande** : le régime diffère de la vente normale (paiement avant
      production, remboursement si l'objectif n'est pas atteint ou si la date n'est pas tenue).
      Les textes de la campagne l'annoncent déjà — les CGV doivent le confirmer
- [ ] **Le gabarit d'email « précommande remboursée »** (`docs/emails/`) : à écrire avant la
      première précommande, pas après
- [ ] **Résorber la dette de textes en dur** : 18 fichiers listés dans
      `src/lib/i18n/no-hardcoded-text.test.ts`. Le cliquet empêche d'en ajouter ; retirer une
      ligne de cette liste est la définition de « ce fichier est fait »
- [x] **i18n du carrousel de l'accueil** (2026-08-25) : le hero ne recevait aucune prop et était
      donc condamné au français, y compris sur `/en`. `carouselStrings(locale)` prépare désormais
      tous ses textes côté serveur ; 21 clés `CART.*` créées et une douzaine de clés `HOME.*`
      enfin branchées. Vérifié sur le HTML servi des deux langues
- [ ] **Visuel produit du Pirate** : seul modèle sans image dans `public/produit/` — nécessaire
      pour la tuile du sélecteur de cadeau (aujourd'hui icône) et tout usage hors 3D
- [x] **Périmètre linguistique ramené à français + anglais** (2026-08-25) : es/de/nl retirés,
      `LOCALES` réduit, sitemap 14 → 8 entrées, redirections 307 posées, règle Alure n°6 gravée
      dans `CLAUDE.md` et tenue par `src/lib/i18n.test.ts`
- [ ] **Afficher `SHIPPING_NOTICE` au-dessus du bouton d'achat** — les clés existent dans les deux
      dictionnaires et ne sont lues par aucun composant. C'est la contrepartie explicite de la
      version anglaise (`docs/i18n/README.md` §0) : sans elle, un visiteur anglophone découvre au
      refus d'adresse, **après avoir payé**, qu'on ne livre qu'en France. Dette la plus gênante du
      dossier i18n
- [x] **Le site entier existe en anglais** (2026-08-26) : 11 routes `/en`, les deux îlots clients
      traduits, la page Stripe et les URL de retour suivent la langue de l'achat, et la mention
      « livraison France » s'affiche au-dessus du bouton d'achat dans les deux langues
- [ ] **L'email de confirmation part en français** quelle que soit la langue d'achat
      (`src/lib/shop/emails.ts`). C'était une décision assumée tant qu'on ne vendait qu'en
      français — à rouvrir maintenant que le tunnel anglais est complet
- [ ] **La description du JSON-LD produit est française sur les deux versions**
      (`src/lib/shop/jsonld.ts`) et son `offers.url` est figé sur `/leurre` : à passer en
      `productJsonLd(locale)`
- [x] **Carrousel 3D explicite à l'achat** (2026-08-25) — rangée de 4 cases, ajout/retrait en un
      geste, sorties vers la caisse dans tous les états, panier vidé après paiement, et hero
      entièrement traduit. Spec `docs/specs/carrousel-achat.md`
- [ ] **Carrousel — les deux tâches restantes** : `inert` sur le hero pendant le fondu (les boutons
      restent focusables alors qu'ils sont invisibles), et la fermeture de l'offre groupée en
      rupture de stock — côté UI **et** côté `/api/checkout`, qui ne valide aujourd'hui que le
      coloris décoratif et jamais les trois leurres réellement facturés
- [ ] **Le tunnel de paiement reste français pour un anglophone** : `stripe.ts` fige
      `locale: 'fr'` sur la page Stripe, et `success_url`/`cancel_url` pointent vers `/merci` et
      `/leurre`, qui n'existent qu'en français
- [x] **Le sélecteur de langue ne fabrique plus d'URL vers le vide** (2026-08-26) :
      `TRANSLATED_PATHS` est la source unique des pages qui existent dans les deux langues, et le
      repli sur l'accueil est annoncé au lieu d'être subi. Menu et pied de page passent à 5 entrées
      dans les deux langues — un acheteur anglophone avait perdu l'accès au suivi de commande
- [ ] **`/en/<n'importe quoi>` répond HTTP 200 en affichant « page introuvable »** (soft 404) :
      `src/app/[lang]/[...rest]/page.tsx` appelle `notFound()`, ce qui rend la page mais pas le
      statut. Mesuré sur un build de production
- [ ] **La page 404 anglaise ramène à l'accueil FRANÇAIS** (`src/app/[lang]/not-found.tsx` pointe
      sur `/`) et son texte est bilingue en dur, alors que les clés `STATES.NOT_FOUND_*` existent
      dans les deux langues sans être lues
- [ ] **Protéger les noms propres de la traduction automatique partout** : fait sur le carrousel,
      la fiche et la BuyBox (11 emplacements). Restent `OfferPanel`, `OfferProgress` et
      `ColorwayViewer`. Sans `translate="no"`, le navigateur traduit « Truite arc-en-ciel » à
      l'écran alors que le reçu Stripe et l'email gardent le nom français
- [x] **Tests E2E paiement rejoués** (2026-08-21) : campagne `src/test/campagne-paiement.test.ts`,
      31 cas — solo + groupée, les 4 choix de 4e offert, reçu ligne à ligne, signature webhook,
      idempotence, rate-limit, et envois Resend réels. Lancer avec `CAMPAGNE_REELLE=1`
- [ ] **Rejouer la campagne avec une clé Stripe de test valide** : la clé de `.env.local` est une
      clé restreinte **expirée** (`rkcs_test_…`, issue du connecteur MCP). Restent non couverts —
      création d'une vraie session, paiement carte `4242 4242 4242 4242`, événement signé par
      Stripe, et pose du marqueur d'idempotence sur le PaymentIntent
- [ ] **Écrire l'email d'expédition** (`docs/emails/04-expedition-suivi.md`) : la confirmation
      promet au client « dès l'expédition, vous recevrez le numéro de suivi par email », et aucun
      code ne l'envoie. À la main pour l'instant, le gabarit est prêt
- [ ] **Compléter `src/lib/legal-config.ts`** : adresse du siège, email de contact et adresse de
      retour valent encore `À COMPLÉTER` et s'affichent tels quels sur `/retractation`, `/cgv` et
      `/mentions-legales`. Bloquant pour l'ouverture au public
- [ ] Landing : scènes restantes (`docs/specs/landing.md` à écrire) + `seg3` (le lancer) si la
      traversée complète est voulue — inchangé, cf. LOT 3

## Phase 3 — LOT 4 · Mise en ligne (domaine Cloudflare + hébergement Vercel)

> Décision d'infrastructure (2026-08-17, Camil) : **nom de domaine acheté et géré chez
> Cloudflare (registrar + DNS), hébergement inchangé sur Vercel.** Doctrine : Cloudflare ne
> fait QUE le DNS (proxy désactivé — nuage gris). Vercel est déjà le CDN/TLS : empiler le
> proxy Cloudflare devant Vercel ajoute des pannes possibles (boucles de redirection si le
> mode SSL n'est pas Full Strict, cache double) sans gain pour un site déjà statique/edge.
> À rouvrir seulement si un besoin WAF/anti-bot réel apparaît.

### 4.a — Domaine & DNS (Cloudflare)
- [ ] Nom tranché par Camil, achat chez **Cloudflare Registrar** (prix coûtant) — si le TLD
      choisi n'y est pas vendable (vérifier pour `.fr`), acheter chez un registrar français
      (OVH/Gandi) et **déléguer les serveurs de noms à Cloudflare** (plan Free suffit)
- [ ] Zone DNS chez Cloudflare, enregistrements donnés par Vercel au moment d'ajouter le
      domaine au projet : apex `A 76.76.21.21` (ou CNAME aplati vers `cname.vercel-dns.com` —
      Cloudflare sait aplatir à l'apex), `www` `CNAME cname.vercel-dns.com` — **proxy OFF
      (DNS only)** sur ces deux entrées
- [ ] Domaine ajouté au projet Vercel (apex + www, redirection www → apex côté Vercel),
      HTTPS vérifié, l'URL `*.vercel.app` redirige vers le domaine
- [ ] `src/lib/site-config.ts` : `SITE.url` = domaine réel (UN fichier — metadata, sitemap,
      robots, JSON-LD, URLs de retour Stripe suivent tout seuls) + retirer le TODO
- [ ] **Emails sortants (Resend)** : domaine d'envoi vérifié — enregistrements SPF/DKIM
      fournis par Resend posés dans la zone Cloudflare, + TXT DMARC (`p=none` pour commencer) ;
      expéditeur `commande@<domaine>` dans `emails.ts`
      > **Bloquant absolu, mesuré le 2026-08-21.** Sans domaine vérifié, l'expéditeur reste
      > `onboarding@resend.dev` et l'API Resend refuse en **403** tout destinataire autre que
      > l'adresse propriétaire du compte (`alure.pounio@gmail.com`). Traduction : le jour de
      > l'ouverture, **chaque client paierait sans jamais recevoir sa confirmation**, le webhook
      > répondrait 500 et Stripe re-livrerait en boucle. Cette case se coche AVANT la première
      > vente, pas après.
- [ ] **Emails entrants** : Cloudflare Email Routing (gratuit) — `contact@<domaine>` →
      boîte réelle de Camil ; l'adresse alimente mentions légales + reply-to
- [ ] CSP/headers : AUCUN changement attendu (Cloudflare DNS-only n'injecte rien) — vérifier
      quand même les en-têtes en préversion sur le domaine final

### 4.b — Paiement & emails en production
- [ ] Vercel (env production) : `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET`,
      `RESEND_API_KEY`, `ORDER_NOTIFICATIONS_EMAIL`
- [ ] Dashboard Stripe : endpoint webhook `https://<domaine>/api/stripe-webhook` abonné à
      `checkout.session.completed` + `async_payment_succeeded` + `async_payment_failed`
      (le secret va dans Vercel) ; PayPal activé dans Settings → Payment methods
- [ ] Passage en mode LIVE + **un achat réel de bout en bout** : paiement (solo puis offre
      groupée avec cadeau) → reçu Stripe correct (« 4e offert — … » à 0,00 €) → emails reçus →
      remboursement test → vérifier qu'aucun email doublon ne part (idempotence)
- [ ] Identité vendeur réelle dans `src/lib/legal-config.ts` (lève le noindex des pages
      légales — bloquant)

### 4.c — Qualité, SEO, mesure
- [ ] **Les 6 audits verts** (`web-audit`) sur le domaine final — sécurité ✅ (2026-08-08 puis
      2026-08-10, 0 bloquant) ; perf, SEO, a11y, RGPD, qualité de code à passer
- [ ] Lighthouse mobile ≥ 90 sur l'accueil et `/leurre` (attention au poids 3D/vidéo du hero)
- [ ] OG validés (debuggers Facebook/LinkedIn) sur les pages partagées
- [ ] Search Console : propriété (via TXT Cloudflare) + sitemap soumis
- [ ] Vercel Analytics branché (sans cookie) → CSP mise à jour DANS LE MÊME COMMIT si un
      script s'ajoute + politique de confidentialité ajustée

## Phase 4 — Post-lancement
- [ ] Suivi Search Console (indexation, erreurs) à J+7
- [ ] Collecte de vraies preuves : avis clients réels, photos de prises → alors seulement,
      section « preuves » sur la landing (règle n°6)
- [ ] Packs multi-coloris si la demande existe
- [ ] Itérations conversion selon données Vercel Analytics / retours réels
- [ ] Si volume durable > capacité manuelle : cadrer la migration headless Shopify + DSers
      (la logique `src/lib/shop/` est le point de greffe)
- [ ] Re-passer `web-audit` après tout ajout de service tiers
