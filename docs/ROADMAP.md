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
- [ ] **Domaine** à trancher et acheter — comparaison des prix en cours (bloque LOT 4)
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

## Phase 3 — LOT 4 · Mise en ligne
- [~] **Préproduction Vercel** en cours (2026-08-09) : MCP Vercel enregistré, EN ATTENTE de
      l'authentification du propriétaire (`/mcp` → vercel) ; déploiement prévu en PRÉVERSION
      (noindex automatique) tant que le domaine n'est pas acheté
- [ ] **Domaine tranché + acheté** (candidats libres vérifiés : alure-peche.fr… — alure.fr est
      PRIS, registre AFNIC consulté le 2026-08-08) → `site-config.ts` + emails Resend mis à jour
- [~] **Les 6 audits verts** (`web-audit`) + Lighthouse mobile ≥ 90 sur landing et `/leurre`
      — sécurité : ✅ passé le 2026-08-08 (0 bloquant, correctifs livrés) ; les 5 autres domaines
      restent à passer
- [ ] Déploiement Vercel + domaine + HTTPS + redirections www/apex
- [ ] Passage Stripe/PayPal en mode LIVE + **un achat réel testé de bout en bout**
      (paiement → email → remboursement test)
- [ ] OG validés (debuggers Facebook/LinkedIn) sur les pages partagées
- [ ] Search Console : propriété + sitemap soumis
- [ ] Vercel Analytics branché + CSP + politique de confidentialité à jour

## Phase 4 — Post-lancement
- [ ] Suivi Search Console (indexation, erreurs) à J+7
- [ ] Collecte de vraies preuves : avis clients réels, photos de prises → alors seulement,
      section « preuves » sur la landing (règle n°6)
- [ ] Packs multi-coloris si la demande existe
- [ ] Itérations conversion selon données Vercel Analytics / retours réels
- [ ] Si volume durable > capacité manuelle : cadrer la migration headless Shopify + DSers
      (la logique `src/lib/shop/` est le point de greffe)
- [ ] Re-passer `web-audit` après tout ajout de service tiers
