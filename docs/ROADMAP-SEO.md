# Roadmap SEO — Alure : viser la première place

> Objectif assumé du propriétaire (2026-08-09) : **être premier** sur les requêtes qui vendent ce
> leurre. Ce plan est agressif sur le TRAVAIL, jamais sur les règles : zéro cloaking, zéro achat
> de liens, zéro contenu généré en masse — un site pénalisé par Google est un site mort, et la
> pénalité est la seule chose qu'on ne peut pas rattraper en travaillant.

## 0. Le terrain de jeu (lucide avant d'être ambitieux)

- **Requêtes reines** (fortes, concurrentielles — Decathlon, Pêcheur.com, Amazon en face) :
  `leurre articulé`, `leurre swimbait`, `leurre black bass`, `leurre perche`.
- **Requêtes de conquête réalistes en premier** (longue traîne d'intention d'achat) :
  `leurre articulé 2 sections`, `swimbait perche 6 cm`, `leurre articulé black bass`,
  `petit swimbait perche`, `leurre nage réaliste perche`, `jointed swimbait france`.
- **Requête de marque** : `alure leurre` — doit être gagnée dès l'indexation (c'est le minimum
  vital, et le baromètre de la notoriété qui vient des réseaux).
- La stratégie : **gagner la longue traîne d'abord** (mois 1-3), l'utiliser pour construire
  l'autorité, puis remonter sur les requêtes reines (mois 4-12). Personne ne prend « leurre
  articulé » à Decathlon avec un site de 8 pages — on le prend avec le meilleur contenu spécialisé
  de France plus des preuves réelles.

## 1. Fondations techniques — TERMINÉ à maintenir vert

- [x] Metadata uniques par page, OG, sitemap, robots cohérents (règle n°9 depuis le jour 1).
- [x] JSON-LD : Organization, WebSite, Product (`/leurre`), FAQPage (`/faq`).
- [x] Fonts self-hosted, images WebP dimensionnées, zéro script tiers → un TTFB/LCP que les
      concurrents sous Shopify ne peuvent PAS égaler. C'est notre avantage structurel : le garder.
- [x] `title` de l'accueil porteur de la requête (« leurre articulé 2 sections… bass et perche »).
- [ ] **Lighthouse mobile ≥ 90 partout** mesuré et consigné avant la mise en ligne (gate LOT 4) ;
      budget : LCP < 2 s en 4G, CLS < 0,05. Le hero vidéo est le point à surveiller (poster
      immédiat, vidéo en lazy).
- [ ] Search Console dès le domaine acheté : propriété, sitemap soumis, suivi hebdo.
- [ ] `hreflang` prêt à activer le jour où la décision i18n tombe (les traductions existent déjà
      dans `docs/i18n/` — un multiplicateur SEO dormant).

## 2. Sémantique on-page (semaine de la mise en ligne)

- [ ] **Une page = une requête cible**, écrite dans le H1 et le premier paragraphe :
  - `/` → « leurre articulé 2 sections » (bass/perche)
  - `/leurre` → « swimbait perche/black-bass 6,5 cm » + le nom de chaque coloris dans le corps
  - `/a-propos` → marque + confiance (« qui vend », « boutique française »)
  - `/faq` → les questions RÉELLES tapées dans Google (« quelle canne pour un swimbait léger »,
    « comment animer un leurre articulé ») — chaque réponse est déjà du JSON-LD FAQPage.
- [ ] Enrichir `/leurre` : section specs complète (longueur, poids, nombre de sections, hameçons,
      profondeur de nage — les VRAIES valeurs), section « comment l'animer » descriptive. Les
      moteurs classent des pages qui répondent ; la nôtre doit être la fiche la plus complète du
      marché sur CE leurre.
- [ ] `Product` JSON-LD : ajouter `offers` par coloris + disponibilité ; les avis (`aggregateRating`)
      n'y entreront QUE réels (règle n°6 — un faux rating est aussi un motif de pénalité).
- [ ] Maillage interne systématique : hero → `/leurre` ; À propos → `/leurre` ; FAQ ↔ `/leurre` ;
      footer complet (fait le 2026-08-09).

## 3. Le contenu qui fait gagner (mois 1-3) — DÉCISION À PRENDRE

⚠️ VISION.md dit « pas de blog en v1 ». Pour être premier, il FAUDRA du contenu — c'est le
levier n°1 restant. **Question posée dans `docs/QUESTIONS.md`** : débloquer un espace
`/guides` (4-8 pages piliers, pas un « blog » au fil de l'eau) :

- [ ] « Pêcher la perche au swimbait : la saison, la canne, l'animation » (cible : `swimbait perche`)
- [ ] « Comment animer un leurre articulé (et pourquoi 2 sections suffisent) »
- [ ] « Petits swimbaits pour le black-bass : ce qui marche en France »
- [ ] « Choisir la taille de son leurre : pourquoi 6,5 cm pour la perche »
- Chaque guide : 1 200-2 000 mots UTILES, écrits en pêcheur, nos rendus/vidéos en illustration,
  un seul CTA sobre vers `/leurre`. Un guide médiocre n'est pas publié (il diluerait le site).

## 4. Autorité & liens (mois 1-6) — le nerf de la guerre

- [ ] **Réseaux d'abord** (déjà dans le plan produit) : Instagram/TikTok de la nage réelle.
      Chaque profil pointe le site (`sameAs` JSON-LD à remplir dans `site-config.ts`).
- [ ] **YouTube** : la vidéo du hero + tests réels au bord de l'eau = requêtes « leurre articulé
      test » captées là où Google met de la vidéo en première page.
- [ ] **Communautés pêche FR** (Forum-Pêche, Achigan.net, groupes FB carnassiers) : présence
      HONNÊTE (le fondateur qui montre son produit, répond, assume) — jamais de spam de liens.
- [ ] **Presse/blogs spécialisés** : envoyer le produit à 3-5 testeurs/youtubeurs pêche français
      (un vrai test, même critique, vaut mieux qu'un placement) → liens naturels durables.
- [ ] **Google Merchant Center** (flux Shopping gratuit) dès le domaine live : la fiche produit
      dans l'onglet Shopping sans payer d'ads — souvent au-dessus des résultats organiques.
- [ ] Annuaires qui comptent (pages jaunes du web pêche, société.com une fois le SIREN public) —
      et RIEN d'autre : les fermes de liens sont un poison.

## 5. Preuves réelles (dès les premières ventes) — le multiplicateur

- [ ] Avis clients RÉELS (collecte par email post-livraison) → affichage + `aggregateRating`.
- [ ] Photos de prises réelles (UGC) → section « en action » sur la landing (règle n°6 : elle
      n'existe pas tant qu'on n'a rien de vrai à montrer).
- [ ] Ces preuves nourrissent TOUT : CTR en SERP (étoiles), conversion, contenu social.

## 6. Mesure & cadence

- Recherche console **hebdo** : impressions/clics/position par requête cible, pages
  crawlées/exclues. Objectifs séquencés : marque en n°1 (mois 1) → 3 requêtes longue traîne en
  top 10 (mois 3) → 1 requête reine en top 10 (mois 6-12).
- Chaque nouvelle page passe par le rituel existant : metadata + sitemap + maillage + gate.
- Re-passer l'audit SEO (`web-audit`) après chaque lot de contenu.

> **Ce qu'on refuse, même pour être premier** : acheter des liens, générer 50 pages IA, gonfler
> un `aggregateRating`, cloaker, dupliquer du contenu concurrent. Le site joue la seule carte
> imbattable à long terme : être réellement la meilleure réponse.
