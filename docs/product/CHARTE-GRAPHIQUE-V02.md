# Alure — Charte graphique V.02 & design system

> Spécification exécutable. Public : agents de développement. Toute valeur est exacte (hex, rem,
> ms, ratio) ; toute règle est vérifiable. Sources : charte V.01 (planches 2, 8, 21–34),
> `docs/standards/FONDATION-PASTEL.md` (couche 1, invariante), `docs/product/PRODUCT.md`
> (cadrage 2026-08-05), photos `assets/photos leurre pour 3d/reference-fournisseur/`.
> Ce document définit la **couche 2** : elle remplit la fondation, elle ne la contredit jamais.
> Livrables associés : `Charte Alure V02.dc.html` (la même charte en document visuel, composants
> rendus en vrai), `logo/alure-fleche-1.svg`, `logo/alure-fleche-1-noir.svg`,
> `logo/alure-wordmark.svg`.

Sommaire : 1. Principes · 2. Arbitrage flèche/surligneur · 3. Tokens · 4. Typographie ·
5. Espacement & grille · 6. Texte sur photo · 7. Traitement des photos · 8. Composants ·
9. Landing narrative · 10. Logo · 11. Contrastes calculés · 12. À faire / à ne pas faire ·
13. Non tranché.

---

## 1. Les principes de la direction artistique

1. **La couleur chaude vient des photos, jamais de l'UI.** L'habillage est bleu (#071128 →
   #394153) et blanc, sans exception. Aucun orange, ambre ou cyan dans un composant.
2. **Si c'est blanc et plein, ça se lit ou ça se clique.** Le blanc plein (#ffffff) est réservé
   au texte principal et au CTA. Tout aplat blanc non textuel est un bouton.
3. **La hiérarchie est tonale.** Quatre niveaux de bleu empilés (#071128 fond → #141d31 creux →
   #20293e surface → #394153 séparateur). Jamais de bordure décorative (fondation §2).
4. **Deux graisses seulement.** La hiérarchie typographique se construit par la taille, la casse
   (capitales + interlettrage large pour les niveaux hauts) et l'interlettrage — jamais par une
   graisse intermédiaire (§4).
5. **Le texte ne touche jamais une photo nue.** Tout texte posé sur photo est posé sur un voile
   (§6). Aucune exception, aucun réglage au cas par cas.
6. **La transparence est l'argument de vente.** Délai 3 à 5 jours ouvrés à côté du prix, TVA art. 293 B
   sous le prix, faits vérifiables uniquement. Aucune preuve sociale inventée, jamais.
7. **Deux gestes manuscrits, deux territoires étanches.** La flèche appartient à la marque,
   le surligneur à l'interface (§2). Jamais les deux dans le même viewport.
8. **Le calme est la signature.** 3 durées, 2 courbes, pas de boucle, pas de rotation — donc pas
   de spinner : l'attente se dit avec des mots (§8.14).

---

## 2. L'arbitrage flèche / surligneur — TRANCHÉ

**Décision : coexistence à territoires étanches et nommés.** La flèche n'est pas abandonnée
(c'est la signature de la marque), le surligneur n'est pas abandonné (c'est la signature
fonctionnelle de la fondation, et une flèche ne peut pas marquer un item de nav actif sans
devenir un pictogramme directionnel absurde). Ils ne jouent jamais le même rôle ni ne partagent
un écran.

| | La flèche (marque) | Le surligneur (interface) |
|---|---|---|
| Nature | Geste de lancer, dessiné, blanc | Trait de marqueur `--color-accent-soft`, penché |
| Vit dans | Lock-up logo (hero landing, footer, favicon, image sociale), filigrane décoratif (opacité ≤ 0.06, cf. planche 33), imagerie/réseaux sociaux | Ses 3 emplacements fondation : titre de page, UN mot/chiffre héros, item de nav actif (`.px-marker-block`) |
| Interdit de | Toute fonction d'UI : puce, indicateur, bouton, lien, séparateur, curseur | Toute photo, tout visuel de marque, la landing narrative |

**Règles d'étanchéité (vérifiables) :**
1. **Jamais les deux gestes dans le même viewport.** Pour le garantir : le header des pages
   d'interface (`/leurre`, `/suivi`, `/faq`, légal) porte le **wordmark seul, sans flèche** ;
   le lock-up complet (avec flèche) vit uniquement dans le hero de la landing et le footer.
2. **La landing narrative est territoire de marque** : flèche autorisée (hero, filigrane),
   surligneur interdit sur toutes ses scènes (le texte y vit sur photo — un marqueur sur voile
   photo est illisible et hors fondation).
3. **Les pages d'interface sont territoire fondation** : surligneur à ses 3 emplacements
   (via `<Marker>` / `.px-marker-block`, jamais recodé), flèche absente hors footer.
4. Le footer est la seule zone mixte tolérée : lock-up en bas, aucune nav active surlignée
   dans le footer.

Ceci n'est **pas** une dérogation à la fondation : le surligneur garde ses 3 emplacements
exclusifs. La seule restriction ajoutée est son absence de la landing, couverte par la règle
fondation existante « jamais par-dessus une photo » (appliquée au grain, étendue ici au geste).

---

## 3. Tokens — bloc `@theme` prêt à coller

Couche 2 uniquement (les tokens couche 1 — rayons, ombres, motion, text-stat/label — sont déjà
dans `globals.css` et ne bougent pas). Tout nouveau token est nommé par son **rôle**.

```css
@theme {
  /* ── Les 4 couleurs de la charte V.01 (planche 2), telles quelles */
  --color-background: #071128;           /* Black Pearl — fond de page */
  --color-foreground: #ffffff;           /* White — texte principal */
  --color-surface: #20293e;              /* Mirage — surface posée sur le fond */
  --color-border: #394153;               /* Oxford Blue — séparateur 1 px UNIQUEMENT (1,8:1 : jamais en texte) */

  /* ── Dérivés validés (aucune teinte inventée) */
  --color-muted: #141d31;                /* zones en creux : fonds d'input, skeleton, segmented */
  --color-muted-foreground: #9aa7bd;     /* texte secondaire — validé : 7,7:1 sur fond, 6,0:1 sur surface (§11) */
  --color-prose-foreground: #d5dbe6;     /* texte de lecture longue (légal, FAQ ouverte) : 13,5:1, fatigue réduite vs blanc pur */

  /* ── Action : blanc sur bleu, comme le logo (aucun accent — décision charte) */
  --color-primary: #ffffff;
  --color-primary-foreground: #071128;
  --color-accent: #ffffff;
  --color-accent-foreground: #071128;
  --color-accent-soft: #384257;          /* surligneur = color-mix(in oklab, white 24%, #071128) résolu.
                                            Proche d'Oxford Blue : cohérent charte. Blanc dessus : 10,1:1 */

  /* ── États système (rôles absents de la charte, dérivés en oklch à luminance homogène
        L ≈ 0.70–0.77, chroma ≈ 0.11–0.13, pour ≥ 4,5:1 sur fond ET surface) */
  --color-danger: #e5484d;               /* rouge charte existant — NON-TEXTE uniquement (anneau d'erreur,
                                            icône) : 3,7:1 sur surface, sous le seuil texte de 4,5:1 */
  --color-danger-text: #f56b6f;          /* texte d'erreur : 6,4:1 fond / 5,0:1 surface */
  --color-success: #4cc38a;              /* commande confirmée : 8,5:1 fond / 6,5:1 surface */
  --color-info: #8fb8e8;                 /* information (délai de livraison) : 9,1:1 fond / 7,0:1 surface */

  /* ── Focus & photo */
  --color-ring: #ffffff;                 /* anneau de focus : outline 2px, offset 3px, partout */
  --color-scrim: rgb(7 17 40 / 0.64);    /* voile plein sous texte sur photo — garantit ≥ 5,7:1 pire cas (§6) */
}
```

Hors `@theme` (valeur utilitaire, pas un utilitaire Tailwind) :

```css
:root {
  /* Voile dégradé pour bas de photo — le texte ne vit que dans la zone où l'opacité ≥ 0.64 (§6) */
  --gradient-scrim: linear-gradient(180deg,
    rgb(7 17 40 / 0) 0%,
    rgb(7 17 40 / 0.64) 45%,
    rgb(7 17 40 / 0.92) 100%);
}
```

**Focus clavier (global, jamais neutralisé) :** `outline: 2px solid var(--color-ring);
outline-offset: 3px;`. L'offset de 3 px laisse le fond apparaître entre l'élément et l'anneau :
l'anneau blanc reste visible même autour du CTA blanc. Sur champ en erreur, l'anneau de focus
blanc **remplace** l'anneau d'erreur rouge pendant le focus (jamais deux anneaux superposés).

---

## 4. Typographie

**Glacial Indifference, seule, self-hostée via `next/font` (SIL OFL).** Deux graisses : 400 et
700. Mapping fondation (qui référence 500/600) : **600 → 700, 500 → 400**. Aucune police mono
nulle part dans l'UI ; chiffres en `font-variant-numeric: tabular-nums` dès qu'ils s'alignent ou
changent (prix, quantité, compteur galerie).

Référence mobile : 375 px. Bascule desktop : ≥ 1024 px (les valeurs tablette 768–1023 = valeurs
desktop, sauf display = intermédiaire libre par interpolation `clamp()` autorisée).

| Usage | Mobile | Desktop | Interligne | Interlettrage | Casse | Graisse |
|---|---|---|---|---|---|---|
| Display (scènes landing) | 2.5rem | 4rem | 1.05 | 0.01em | CAPITALES | 700 |
| H1 — titre de page | 1.75rem | 2.5rem | 1.1 | 0.02em | CAPITALES | 700 |
| H2 — section | 1.375rem | 1.75rem | 1.2 | 0 | Phrase | 700 |
| H3 — sous-section / carte | 1.125rem | 1.25rem | 1.3 | 0 | Phrase | 700 |
| Corps | 1rem | 1rem | 1.6 | 0 | Phrase | 400 |
| Corps long (légal, FAQ) | 1rem | 1rem | 1.75 | 0 | Phrase | 400, `--color-prose-foreground` |
| Petit texte / mentions | 0.8125rem | 0.8125rem | 1.5 | 0.01em | Phrase | 400 |
| Label sur-titre (`text-label`) | 0.625rem | 0.625rem | 1.4 | 0.15em | CAPITALES | 700, `--color-muted-foreground` |
| Prix / chiffre clé (`text-stat`) | 1.8rem | 1.8rem | 1.15 | −0.025em | — | 700, tabular. **Plafond 2rem** |
| Valeur dans une liste | 1rem | 1rem | 1.5 | 0 | — | 700, tabular |
| Unité accolée à un chiffre | 0.8125rem | 0.8125rem | 1.5 | 0 | — | 400, `--color-muted-foreground` |
| Bouton | 0.9375rem | 0.9375rem | 1 | 0.02em | Phrase | 700 |
| Nav header | 0.8125rem | 0.8125rem | 1 | 0.08em | CAPITALES | 700 |

Règles :
- **La casse est le 3ᵉ axe de hiérarchie** : capitales + interlettrage positif = niveaux
  display/H1/labels/nav ; casse de phrase + interlettrage nul = tout le reste. Jamais de
  capitales sur plus de 2 lignes.
- Longueur de ligne : corps ≤ 65ch ; corps long ≤ 60ch. `text-wrap: balance` sur les titres,
  `text-wrap: pretty` sur les paragraphes.
- Liens : `a { color: #ffffff; text-decoration: underline; text-underline-offset: 3px;
  text-decoration-thickness: 1px; }` — `a:hover { color: #9aa7bd; }` (0.14s ease-out-soft).
  Jamais de lien bleu navigateur.
- Pas d'italique (la famille n'en fournit pas de vraie ; l'oblique synthétique est interdite).
  L'emphase dans un paragraphe = 700.

---

## 5. Espacement & grille

**Échelle d'espacement** (base 4 px) : `0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 2.5 / 3 / 4 /
6 / 8 rem`. Aucune valeur hors échelle. Repères : padding de carte **1.25rem** (fondation),
gap interne de composant 0.75rem, gap entre cartes 1rem (mobile) / 1.5rem (desktop), respiration
de section 4rem (mobile) / 7rem (desktop).

| | Mobile (référence 375) | Desktop (≥ 1024) |
|---|---|---|
| Marges de page | 1.25rem (20 px) | 3rem, conteneur max 70rem (1120 px) centré |
| Grille | 1 colonne, gap 1rem | 12 colonnes, gouttière 1.5rem |
| Page produit | pile : galerie → panneau | galerie 7 col / panneau d'achat 5 col, gap 3rem |
| Cibles tactiles | **≥ 44 px partout** (tout le site est contexte marketing/mobile — la densité 36 px de la fondation ne s'applique nulle part ici) | idem |

Breakpoints : 768 (tablette, hérite du desktop sauf grille produit qui reste en pile jusqu'à
1024) · 1024 (desktop).

---

## 6. Le système de lisibilité du texte sur photo

Principe unique, systémique : **le texte blanc ne rencontre jamais un pixel de photo sans voile
Black Pearl entre les deux.** Il n'existe donc aucune « règle de mesure au cas par cas » à
appliquer en intégration : le voile est structurel, pas conditionnel.

**Pourquoi 0.64 :** le pire cas absolu est une zone de photo blanche pure (luminance relative
1.0). Un voile `rgb(7 17 40 / 0.64)` composé sur du blanc pur donne un fond de luminance 0.134,
soit un contraste **5,7:1** avec le texte blanc — au-dessus du seuil AA 4,5:1 avec marge pour la
compression AVIF et l'anticrénelage. Toute photo réelle (plus sombre) donne davantage. La
garantie est donc **mathématique, pas éditoriale**.

**Les deux voiles autorisés — aucun autre :**
1. **Voile plein** `--color-scrim` (`rgb(7 17 40 / 0.64)`) : recouvre toute la photo. Usage :
   photo d'ambiance en fond de section entière (texte librement placé).
2. **Voile dégradé** `--gradient-scrim` (0 % en haut → 0.64 à 45 % → 0.92 en bas) : préserve le
   haut de la photo. **Le texte ne vit que dans les 55 % inférieurs du dégradé** (là où
   l'opacité ≥ 0.64). Usage : hero, scènes de la landing.

**Zones sûres de placement :**
- Mobile (375 × 667 minimum) : marges latérales 1.25rem ; bande de texte = 40 % inférieurs du
  viewport, moins 5.5rem réservés en bas (UI navigateur / barre collante éventuelle).
- Desktop : texte dans le tiers inférieur, ou colonne gauche/droite de 5 colonnes max posée sur
  la zone voilée.
- Le sujet photographique (silhouette) ne passe jamais sous le bloc de texte (§7 — c'est un
  critère de recadrage, pas un compromis de lisibilité).

**Règle de décision (le seul « si » du système) :** si la composition exige du texte **hors**
d'une zone voilée (ex. légende au centre d'un ciel), la réponse est non — on déplace le texte
dans la zone voilée, ou on bascule en **mode bandeau** : la photo s'arrête, le texte se pose
sous elle sur un aplat `--color-background`. Une photo trop claire pour supporter le dégradé
sans dénaturer son haut (ciel brûlé) est refusée ou recadrée (§7) — jamais compensée par un
voile plus opaque ad hoc.

**Interdits :** ombre portée sur texte comme substitut de voile · `backdrop-filter: blur` ·
opacités de voile improvisées (0.64 et le dégradé défini, rien d'autre) · texte
`--color-muted-foreground` sur photo (le secondaire sur photo passe en blanc, taille petit
texte) · grain par-dessus une photo (fondation §5).

---

## 7. Traitement des photos

- **Sources autorisées** : rendus 3D du leurre et images/vidéos générées d'après
  `reference-fournisseur/` — jamais les photos fournisseur brutes (droits + packaging
  « Bite Times » visible). Le coloris jaune type Pikachu est exclu (contrefaçon).
- **Cadrage** : silhouette dans le tiers central horizontal ; ligne d'horizon sur le tiers haut
  ou bas, jamais au centre ; la zone de texte prévue (§6) tombe sur eau ou ciel homogène.
- **Accepté** : crépuscule, contre-jour, silhouettes, eau calme, dégradés chauds naturels.
- **Refusé** : lumière de midi, flash, HDR sursaturé, ciels brûlés sans zone sombre exploitable,
  visages reconnaissables, tout élément de marque tierce.
- **Formats d'export** : AVIF (qualité ≈ 50) + fallback WebP ; largeurs 750 / 1080 / 1920 /
  2560 ; hero mobile 9:16 (1080 × 1920), scènes desktop 16:9 (2560 × 1440), galerie produit
  1:1 et 4:5. `loading="lazy"` sauf hero (`priority`).
- Les rendus produit (galerie) se font sur fond uni sombre de la gamme (entre #071128 et
  #20293e) — pas de fond blanc e-commerce, pas d'ombre dure.

---

## 8. Composants

Constantes transversales : contrôles = **pilule**, hauteur **2.75rem (44 px)** ; cartes
`radius 1rem`, padding `1.25rem`, `--shadow-card` ; éléments imbriqués `radius 0.75rem` ;
hover de surface = `--shadow-card-hover` + `translateY(-3px)` (0.28s ease-out-soft) ; press
bouton = `scale(0.97)` 0.14s ; focus = anneau §3. Icônes : **Lucide** (licence ISC, trait
cohérent), taille 1.25rem (20 px), `stroke-width` 1.75, couleur du texte qu'elles accompagnent.
Le pack de 704 icônes de la charte V.01 n'est pas retenu (lien raccourci, licence invérifiable).

### 8.1 Bouton d'achat (principal)

- **Anatomie** : pilule, h 2.75rem, padding-inline 1.5rem, fond `--color-primary` (#ffffff),
  texte `--color-primary-foreground` (#071128) 0.9375rem/700, tracking 0.02em. Libellé :
  « Acheter » (page produit), « Payer » (jamais « C'est parti ! »).
- Repos : `--shadow-lifted`. Survol : `--shadow-card-hover`, fond inchangé (le blanc ne
  s'éclaircit pas), 0.28s ease-out-soft. Press : scale(0.97) 0.14s. Focus : anneau §3.
- **Désactivé** : fond #20293e, texte #9aa7bd, aucune ombre, `cursor: not-allowed`. Jamais
  d'opacité sur le blanc (fantôme illisible sur photo).
- **Chargement** (redirection checkout) : bouton désactivé, largeur verrouillée
  (`min-inline-size` mesurée avant le swap), libellé → « Redirection vers le paiement… ».
  **Pas de spinner** (rotation + boucle interdites, fondation §6) : le texte EST l'indicateur.
- **Erreur** (création de session échouée) : le bouton revient au repos ; message sous le bouton,
  0.8125rem `--color-danger-text` : « Le paiement n'a pas pu démarrer (connexion interrompue).
  Réessayez, ou écrivez-nous : contact@… »

### 8.2 Bouton secondaire (ghost)

Pilule, h 2.75rem, padding-inline 1.5rem, fond transparent, texte #ffffff 0.9375rem/700.
Pas de bordure (hiérarchie par tons). Survol : fond `rgb(255 255 255 / 0.08)` 0.14s. Press,
focus, désactivé (texte #9aa7bd) : comme 8.1. Usage : « Retour à l'accueil », « Voir la FAQ ».

### 8.3 Lien

Style §4 (souligné blanc, hover #9aa7bd). Dans une phrase uniquement ; jamais en substitut de
bouton pour une action. Zone cliquable ≥ 44 px de haut quand le lien est isolé
(padding-block compensatoire).

### 8.4 Galerie produit

- **Mobile — balayage** : piste `scroll-snap-type: x mandatory`, vues 100 % de large, ratio 4:5,
  `snap-align: center`, radius 1rem. Compteur « 2/6 » en surimpression bas-droite : pilule
  `--color-scrim`, texte blanc 0.8125rem tabular, padding 0.25rem 0.75rem. Points de
  pagination sous la piste : 6 px, gap 0.5rem, actif #ffffff, inactif `rgb(255 255 255 / 0.32)`.
- **Desktop** : image principale 1:1 radius 1rem + colonne de vignettes 72 px (radius 0.75rem,
  gap 0.75rem) à gauche. Vignette active : anneau 2px #ffffff offset 2px ; survol : anneau
  2px #394153 ; focus : anneau §3. Le clic remplace l'image principale en fondu 0.28s.
- **Chargement** : bloc `--color-muted` statique aux dimensions finales (pas de pulse — boucle
  interdite) ; l'image arrive en fondu 0.28s ease-out-soft.
- **Erreur image** : bloc `--color-muted`, icône `image-off` #9aa7bd 1.5rem centrée, texte
  0.8125rem #9aa7bd : « L'image n'a pas chargé. Rechargez la page. »

### 8.5 Sélecteur de coloris — le choix central

- **Anatomie** : `role="radiogroup"` légendé « Coloris : {Nom} » (label 0.9375rem #9aa7bd,
  nom 0.9375rem/700 #ffffff, mis à jour à la sélection). Options en ligne, wrap, gap 0.75rem.
  Chaque option : zone tactile 44 × 44 px centrée sur une **pastille ronde 32 px** = photo/rendu
  du coloris recadré (jamais un aplat de couleur inventé : le coloris d'un leurre est un motif).
- Repos : pastille nue. Survol : anneau 2px #394153 offset 2px. **Sélectionné** : anneau 2px
  #ffffff offset 2px (+ nom dans le label). Focus clavier : anneau §3 (blanc, offset 3px) ;
  navigation aux flèches. Press : scale(0.97) 0.14s.
- **Désactivé (épuisé)** : pastille opacité 0.35, non focusable en sélection, mention
  « Épuisé » 0.8125rem #9aa7bd sous la pastille. Pas de compte à rebours, pas de « plus que 2 ! ».
- Changement de coloris → la galerie affiche la vue correspondante (fondu 0.28s).

### 8.6 Sélecteur de quantité

- Pilule creuse : fond `--color-muted`, h 2.75rem. Trois cellules : bouton « − » 44 × 44,
  valeur (largeur 2.5rem, centrée, 1rem/700 tabular, blanc), bouton « + » 44 × 44. Icônes
  `minus`/`plus` 1.25rem #ffffff.
- Survol bouton : fond `rgb(255 255 255 / 0.08)` (rayon hérité pilule). Press : scale(0.97).
  Focus : anneau §3 sur le bouton individuel. Changement de valeur : la valeur rejoue `.px-pop`
  (7 px, 0.28s).
- Bornes : min 1 (« − » désactivé : icône #9aa7bd, opacité 0.35, `aria-disabled`), max = valeur
  de `src/lib/shop/` (défaut 10 — cf. §13). `aria-live="polite"` sur la valeur.

### 8.7 Affichage du prix

- Prix : `text-stat` — 1.8rem/700, tracking −0.025em, tabular, #ffffff. Format français :
  « 19,90 € » (espace insécable avant €). *(valeur d'exemple)*
- **Mention TVA, toujours accolée** : ligne suivante, 0.8125rem #9aa7bd :
  « TVA non applicable, art. 293 B du CGI. » Jamais tronquée, jamais en infobulle, jamais
  séparée du prix par un autre élément.
- Quantité > 1 : le prix affiché devient le **total** (rejoue `.px-pop`), sous-ligne 0.8125rem
  #9aa7bd : « soit 19,90 € l'unité ».
- Le prix peut être le « chiffre héros » surligné de la page produit (un seul par écran).

### 8.8 Le bandeau de délai de livraison — élément de confiance

- **Placement non négociable** : page produit, **entre le prix et le bouton d'achat** (ordre
  DOM et ordre visuel) — impossible d'acheter sans être passé dessus. Répété : FAQ (première
  question) et email de confirmation. Jamais en accordéon, jamais sous la ligne de flottaison
  du panneau d'achat desktop, jamais en note de bas de page.
- **Anatomie** : carte `--color-surface`, radius 1rem, padding 1.25rem, `--shadow-card`.
  Rangée : icône `truck` 1.5rem `--color-info` + colonne texte gap 0.25rem :
  - Titre 1rem/700 #ffffff : « Livraison 3 à 5 jours ouvrés »
  - Corps 0.9375rem #9aa7bd : « Votre leurre est expédié depuis notre fournisseur en Chine.
    Vous recevez un numéro de suivi par email dès l'envoi. »
- Statique : aucun état hover/collapse. C'est une information mise en avant, pas un composant
  interactif. Rappel court dans la barre collante (§8.9).

### 8.9 Barre d'achat collante (mobile)

- **Déclenchement** : apparaît quand le bouton d'achat principal sort du viewport
  (IntersectionObserver, threshold 0) ; entre en `translateY(100 % → 0)` 0.28s ease-out-soft ;
  sort en 0.14s ease-in-brisk quand le CTA principal redevient visible.
- **Anatomie** : barre fixe bas, fond `--color-surface`, ombre haute
  `0 -10px 26px -14px rgb(2 6 16 / 0.45)`, padding 0.75rem 1.25rem +
  `env(safe-area-inset-bottom)`. Gauche (colonne) : prix 1.125rem/700 tabular blanc ;
  dessous « Livraison 3 à 5 jours ouvrés » 0.75rem #9aa7bd. Droite : bouton « Acheter » (spec 8.1,
  h 2.75rem, padding-inline 1.5rem).
- États du bouton : identiques à 8.1 (chargement compris). Desktop (≥ 1024) : pas de barre —
  le panneau d'achat est visible en permanence (colonne collante `top: 6rem` autorisée).

### 8.10 Bandeau de réassurance — faits vérifiables uniquement

- **Trois faits, aucun autre** : « Rétractation 14 jours » · « Paiement par Stripe ou PayPal » ·
  « Suivi de commande par email ». (Le délai a son bandeau dédié §8.8.) Interdits : étoiles,
  avis, compteurs, « vu dans », badges « 100 % sécurisé ».
- Desktop : 3 colonnes gap 1.5rem, centré. Chaque item : icône 1.25rem #9aa7bd
  (`undo-2`, `credit-card`, `mail`) + texte 0.9375rem #ffffff.
- Mobile : liste verticale, lignes h ≥ 3.5rem, **séparateur 1px `--color-border`** entre les
  lignes (la seule bordure autorisée). Stripe/PayPal cités en texte, pas en logos.
- Placement : sous le panneau d'achat (produit) et avant le footer (landing).

### 8.11 Accordéon (FAQ)

- Liste d'items radius 0.75rem, séparateur 1px `--color-border` entre items.
- **Détente (summary)** : min-h 3.5rem, padding 1rem 0.25rem, question 1rem/700 #ffffff,
  icône droite `plus` → `minus` en **fondu croisé 0.14s — jamais de rotation de chevron**
  (interdit fondation).
- Survol : fond `rgb(255 255 255 / 0.04)`. Focus : anneau §3. Ouverture : hauteur animée
  0.28s ease-out-soft ; fermeture 0.28s ease-in-brisk. Plusieurs items ouverts autorisés.
- **Contenu ouvert** : 0.9375rem `--color-prose-foreground`, interligne 1.65,
  padding 0 0.25rem 1.25rem. Liens style §4.

### 8.12 Champs de formulaire & validation

- **Label** : au-dessus, 0.8125rem/700 #ffffff, margin-bottom 0.5rem. Champ requis : pas
  d'astérisque si tout le formulaire est requis ; sinon « (facultatif) » 400 #9aa7bd sur les
  champs optionnels.
- **Champ texte/email** : pilule, h 3rem (48 px), fond `--color-muted`, **pas de bordure**,
  padding-inline 1.25rem, texte 1rem #ffffff. Placeholder #9aa7bd (6,9:1) réservé à un exemple
  de format (« ALR-2026-0042 »), jamais au rôle du champ.
- **Textarea** : radius 0.75rem, min-h 7.5rem, padding 1rem 1.25rem.
- Focus : anneau §3. Désactivé : opacité 0.5, `cursor: not-allowed`.
- **Erreur** : anneau permanent `outline: 2px solid var(--color-danger)` (non-texte : 4,8:1
  sur fond) ; message sous le champ, 0.8125rem `--color-danger-text`, icône `circle-alert`
  1rem, margin-top 0.5rem, lié par `aria-describedby`. Copy = cause + geste (UI-COPY) :
  « Cet email est incomplet (il manque le @). Corrigez-le : c'est là que part le suivi. »
- **Moment de validation** : à la soumission, puis au blur des champs déjà signalés. Jamais
  pendant la première frappe.
- **Envoi** : bouton « Envoyer ma demande » → chargement type 8.1 (« Envoi en cours… »).
  **Succès** : le formulaire est remplacé par une carte surface : icône `check` 1.5rem
  `--color-success` + « Votre message est parti. Nous répondons à l'adresse indiquée. »
  **Échec** : formulaire intact + message `--color-danger-text` : « Votre message n'est pas
  parti (connexion interrompue). Réessayez, ou écrivez-nous directement : contact@… »

### 8.13 Page 404

Fond `--color-background`, pas de photo. Bloc centré (max 28rem, padding 6rem 1.25rem) :
H1 « Page introuvable » (surligneur de titre autorisé — page d'interface), corps 1rem
`--color-prose-foreground` : « Cette page n'existe pas (ou plus). » Actions (rangée gap 0.75rem) :
bouton secondaire « Retour à l'accueil » + lien « Nous contacter ». Rien d'autre.

### 8.14 États chargement / vide / erreur — visuellement distincts

| État | Signature visuelle | Règles |
|---|---|---|
| **Chargement** | Blocs creux `--color-muted` statiques aux dimensions finales. Aucune icône. | Pas de spinner, pas de pulse (rotation/boucle interdites). Au-delà de 800 ms : phrase d'état 0.9375rem #9aa7bd (« Chargement du suivi… »). Le contenu arrive en fondu + translateY 16 px, 0.42s ease-out-soft. |
| **Vide** | Icône trait 1.5rem #9aa7bd + phrase 1rem #ffffff + action. Fond transparent (pas de carte). | Dire ce qui se passe et où aller, sans coaching : « Entrez le numéro de suivi reçu par email. Vous ne le trouvez pas ? Vérifiez vos indésirables, ou contactez-nous. » |
| **Erreur** | Icône `circle-alert` 1.5rem `--color-danger` + message 1rem `--color-danger-text` + **action de sortie** (bouton secondaire ou lien). | Cause + geste, toujours : « Le suivi n'a pas répondu (service indisponible). Réessayez dans quelques minutes. » |

Lecture rapide : creux muet = ça arrive · gris informatif = rien à montrer · rouge + geste = ça
a cassé.

### 8.15 Typographie des pages légales

Longs textes blancs sur bleu nuit = fatigue : traitement dédié, assumé.
- Conteneur max 40rem centré (≈ 60ch), padding-top 4rem (mobile) / 6rem (desktop).
- Corps 1rem, interligne **1.75**, couleur **`--color-prose-foreground` #d5dbe6** (13,5:1 —
  contraste volontairement réduit vs blanc pur 18,7:1, largement au-dessus de AA).
- H1 de page : spec §4 (surligneur de titre). H2 : 1.25rem/700 #ffffff, margin-top 2.5rem.
  Paragraphes espacés 1rem ; listes à puces simples ; tableaux remplacés par des listes.
- `text-align: left` (jamais justifié), pas de coupure de mots. Liens §4. Fond
  `--color-background`, aucune photo, aucune carte : une seule colonne de lecture.
- Le fond du texte légal ne se réécrit pas pour le style (UI-COPY).

### 8.16 Header & navigation (chrome commun)

- Barre h 4rem (mobile) / 4.5rem (desktop), fond `--color-background`, sans bordure basse ;
  après 24 px de scroll : `--shadow-lifted` (0.28s).
- Gauche : **wordmark seul** « ALURE. » (h 1.25rem, lien accueil) — jamais le lock-up avec
  flèche (§2). Droite : nav « Le leurre · Suivi · FAQ » (style nav §4, zone cliquable 44 px).
- **Item actif : `.px-marker-block`** (le 3ᵉ emplacement du surligneur). Survol : texte
  #9aa7bd → #ffffff 0.14s. Pas de menu burger : 3 items tiennent sur 375 px.
- Footer : lock-up complet (flèche), liens légaux 0.8125rem #9aa7bd, mention
  « Micro-entreprise — TVA non applicable, art. 293 B du CGI », contact. Séparateurs 1px
  autorisés entre groupes de liens (listes).

---

## 9. La landing narrative — grammaire des scènes

**Six scènes** (raisonnable : 5 à 7 ; au-delà, l'attention meurt avant le CTA) :

| # | Scène | Média | Pin/scrub |
|---|---|---|---|
| S1 | Hero — lock-up + silhouette crépuscule | Photo plein écran, `--gradient-scrim` | Non (statique + reveal) |
| S2 | Le leurre — présentation | Rendu 3D grand format | Pin 180vh, 3 textes relais |
| S3 | L'articulation — 2 sections | Séquence d'images (scrub) | Pin 220vh |
| S4 | La nage | Vidéo pilotée par le scroll (scrub — **pas de boucle autonome**) | Pin 200vh |
| S5 | Les coloris | Pastilles + rendus | Non (reveals) |
| S6 | Confiance + CTA final | Aplat `--color-background` : bandeau délai (8.8) + réassurance (8.10) + « Voir le leurre » | Non |

**Composition d'une scène** — une scène = **une idée**, et au plus :
1 label sur-titre + 1 titre display ≤ 2 lignes + 1 paragraphe ≤ 3 lignes (corps, blanc).
Texte dans les zones sûres §6 (mobile : bande basse voilée, marges 1.25rem, 5.5rem libres en
bas ; desktop : tiers inférieur ou colonne latérale ≤ 5 col). Surligneur interdit (§2) ; la
flèche n'apparaît qu'en S1 (lock-up) et éventuel filigrane ≤ 0.06 d'opacité.

**Entrées/sorties du texte** (liées au scroll — exemptées du plafond 500 ms, mais mappées) :
- Entrée : opacity 0 → 1 + translateY 16 px → 0, sur la progression **[0.10 – 0.25]** de la
  scène ; sortie inverse sur **[0.78 – 0.92]** (−16 px). Jamais de texte qui traverse l'écran.
- Médias : scale 1.04 → 1 ou déplacement ≤ 40 px sur toute la scène. Pas de rotation, pas de
  parallaxe multi-couches.
- Cascade : **max 3 groupes** par scène (label → titre → corps), 150 ms d'écart total.
- Deux scènes épinglées ne se suivent jamais sans une section fluide entre elles (S5 respire
  entre S4 et S6). Une scène épinglée = 150 – 220vh de piste.

**Mode animations réduites (`prefers-reduced-motion`) — scène par scène :**

| # | Devient |
|---|---|
| S1 | Section statique : photo + voile + lock-up + texte, tout visible (aucune opacité initiale à 0) |
| S2 | Rendu 3D fixe (image finale) + les 3 blocs de texte **empilés** à la suite |
| S3 | Une seule image : la frame finale de la séquence (leurre articulé ouvert) + texte |
| S4 | Poster de la vidéo + contrôles natifs (lecture manuelle autorisée — c'est un choix de l'utilisateur, pas une boucle) |
| S5 | Déjà statique : reveals supprimés, tout visible |
| S6 | Déjà statique |

Pin désactivé, scroll natif, `gsap`/`lenis` non initialisés (pas seulement « pausés »). La page
reste **complète, lisible, achetable** : même contenu, même ordre, mêmes CTA. Test d'acceptation :
landing parcourue avec reduced-motion = aucun contenu manquant, aucun espace vide.

---

## 10. Le logo

**Composants** : wordmark « ALURE. » (capitales + point, blanc) ; flèche manuscrite n°1
(planche 8) ; lock-up = wordmark au-dessus, flèche dessous **débordant à droite**.

**Construction du lock-up** — valeurs relevées au pixel sur la planche 8 (wordmark 699 × 132 px,
flèche 981 × 157 px). Unité **X** = hauteur de capitale du wordmark ; unité **L** = largeur du
wordmark :
- Largeur de la flèche = **1,40 L**.
- Débord gauche **0,21 L** · débord droit **0,19 L** — la flèche est *centrée* sur le wordmark et
  déborde des deux côtés ; c'est la pointe qui est à droite. (Correction de la formulation V.01
  « débordant à droite », qui décrit la pointe, pas le cadrage.)
- Écart ligne de base du wordmark → haut de la flèche = **0,39 X**. Hauteur de flèche = **1,19 X**.

**Règles :**
- **Zone de protection** : 0.5x sur les quatre côtés du lock-up complet (flèche incluse).
  Rien n'y entre : ni texte, ni bord d'écran, ni autre logo.
- **Tailles minimales** (numérique) : lock-up 96 px de large · wordmark seul 72 px ·
  flèche seule 24 px. En dessous : utiliser la flèche seule.
- **Versions autorisées** : blanc (défaut, sur `--color-background` ou photo voilée §6) ;
  noir #071128 sur fond clair (print, factures — usage hors site). Rien d'autre : jamais en
  Oxford Blue, jamais en dégradé, jamais en couleur photo.
- **Usages interdits** : rotation ou inclinaison ; ombre portée ; contour ; étirement ;
  wordmark sans son point ; flèche redessinée, inversée ou utilisée comme élément d'UI (§2) ;
  lock-up sur photo non voilée ; flèche multipliée à opacité > 0.06 (le filigrane planche 33
  reste ≤ 0.06).
- **Favicon** : flèche seule, blanche, sur #071128 — 32/180 (apple-touch)/512 px, marge interne
  18 % du canevas.
- **Image de partage social (1200 × 630)** : fond #071128 plein OU photo + voile plein
  `--color-scrim` ; lock-up blanc centré, largeur 480 px (40 %) ; marges minimales 80 px ;
  aucun autre texte.

**SVG livrés** (tracés propres, couleur par défaut blanche) :
- `logo/alure-fleche-1.svg` — **flèche n°1 vectorisée depuis la planche 8** : masque binaire
  (seuil de luminance 205), contours suivis puis simplifiés (Douglas-Peucker, tolérance 1,5 px),
  2 tracés fermés (silhouette + le vide du triangle), `fill-rule="evenodd"`, viewBox
  `0 0 981 157`, 940 octets. Fidèle au dessin d'origine, pas une réinterprétation.
- `logo/alure-fleche-1-noir.svg` — même tracé en #071128, pour fond clair (print, factures).
- `logo/alure-wordmark.svg` — **wordmark redessiné en Glacial Indifference Bold** : la licence
  de Colette (police des affiches V.01) est invérifiable, elle ne couvre donc pas l'usage logo —
  c'est dit, et c'est définitif. Le fichier contient du texte SVG : **convertir en tracés**
  (fonttools / Inkscape « Objet → Chemin ») avant tout usage en production ; un logo n'est
  jamais du texte vivant. Interlettrage du wordmark : 0.03em.

---

## 11. Tableau des contrastes — ratios calculés (WCAG 2.1)

Calculés sur luminance relative sRGB, arrondis à 0,1. AA : 4,5:1 texte courant · 3:1 texte
large (≥ 24 px ou 18,7 px gras) et non-texte.

| Paire (texte / fond) | Ratio | Verdict |
|---|---|---|
| #ffffff / #071128 fond | **18,7:1** | AAA |
| #ffffff / #20293e surface | **14,5:1** | AAA |
| #ffffff / #141d31 creux | **16,8:1** | AAA |
| #071128 / #ffffff (texte du CTA) | **18,7:1** | AAA |
| #9aa7bd / #071128 | **7,7:1** | AAA — texte secondaire validé |
| #9aa7bd / #20293e | **6,0:1** | AA (courant) |
| #9aa7bd / #141d31 | **6,9:1** | AA (courant) |
| #d5dbe6 prose / #071128 | **13,5:1** | AAA — légal |
| #f56b6f danger-text / #071128 | **6,4:1** | AA |
| #f56b6f / #20293e | **5,0:1** | AA |
| #f56b6f / #141d31 | **5,8:1** | AA |
| #e5484d danger / #071128 | **4,8:1** | passe en texte sur fond, MAIS **3,7:1 sur surface → réservé au non-texte** (anneaux, icônes : ≥ 3:1 partout — 4,3:1 sur creux) |
| #4cc38a succès / #071128 | **8,5:1** | AA |
| #4cc38a / #20293e | **6,5:1** | AA |
| #8fb8e8 info / #071128 | **9,1:1** | AAA |
| #8fb8e8 / #20293e | **7,0:1** | AA |
| #ffffff / voile 0.64 sur photo **blanche pure (pire cas)** | **5,7:1** | AA garanti — toute photo réelle fait mieux |
| #ffffff / #384257 surligneur (texte posé dessus) | **10,1:1** | AAA |
| Anneau focus #ffffff / #071128 | **18,7:1** | non-texte ≥ 3:1 ✓ |
| #394153 Oxford Blue / #071128 | **1,8:1** | **décoratif uniquement** (séparateurs) — jamais en texte |

Verdict sur le rouge existant, demandé par le brief : `#e5484d` tient sur le fond de page
(4,8:1) mais échoue sur surface (3,7:1). Il est conservé pour le **non-texte** (anneau d'erreur,
icône) ; tout **texte** d'erreur passe en `#f56b6f` (§3), qui tient partout.

---

## 12. À faire / à ne pas faire

**À faire**
- CTA : pilule blanche « Acheter », texte #071128 — le blanc du logo est l'accent du site.
- Le bandeau « Livraison 3 à 5 jours ouvrés » entre le prix et le bouton d'achat, carte
  surface, icône info — mis en avant, pas caché.
- « TVA non applicable, art. 293 B du CGI. » en 0.8125rem directement sous le prix.
- Titre de la page suivi : « Suivi de commande » avec surligneur `<Marker>` ; nav « Suivi »
  active en `.px-marker-block`.
- Hero landing : photo silhouette + `--gradient-scrim`, lock-up complet, texte dans la bande
  basse voilée.
- Bouton de contact : « Envoyer ma demande ». Erreur : « Votre message n'est pas parti
  (connexion interrompue). Réessayez, ou écrivez-nous directement : contact@… »
- Attente checkout : libellé « Redirection vers le paiement… », largeur verrouillée.

**À ne pas faire**
- ❌ Un bouton orange/cyan « pour faire ressortir le CTA » — la charte n'a pas d'accent, point.
- ❌ « 2 347 pêcheurs conquis », étoiles, faux stock (« plus que 3 ! »), compte à rebours,
  « vu dans » — aucune donnée fabriquée, jamais.
- ❌ Spinner rotatif ou skeleton qui pulse — rotation et boucles sont interdites ; l'attente
  s'écrit en mots.
- ❌ Bordure 1 px autour d'une carte ou d'un champ « pour la définir » — la hiérarchie est
  tonale ; la seule bordure légale est le séparateur de liste.
- ❌ Oxford Blue #394153 en couleur de texte (1,8:1 — illisible).
- ❌ Texte blanc posé sur ciel clair sans voile ; ombre portée en guise de lisibilité.
- ❌ Emoji en icône (🎣 dans un titre) ; icônes hors Lucide ; chevron d'accordéon qui pivote.
- ❌ « C'est parti ! », « Génial ! 🎉 », superlatifs creux — un bouton dit ce qu'il fait,
  au vouvoiement.
- ❌ Le surligneur sur une scène photo de la landing ; la flèche en puce de liste (§2).
- ❌ Prix ou chiffre > 2rem ; police mono où que ce soit dans l'UI.

---

## 13. Ce que je n'ai pas tranché

1. **La couleur d'accent** — volontairement non introduite (décision charte). À rouvrir
   uniquement si les données de conversion du CTA blanc l'exigent ; ce serait une décision de
   cadrage, pas de style.
2. **Le nettoyage final du tracé.** La flèche est vectorisée depuis la planche 8 en polygones
   (tolérance 1,5 px, 101 points). Un passage en courbes de Bézier lissées dans Illustrator la
   rendrait marginalement plus légère et plus douce à très grande échelle : cosmétique, pas
   bloquant — le fichier est utilisable en production tel quel.
3. **La vectorisation du wordmark.** Le SVG livré contient du texte Glacial Indifference Bold ;
   la conversion en tracés (fonttools/Inkscape) est une étape de build à exécuter une fois.
   L'interlettrage 0.03em est à valider à l'œil sur le rendu vectorisé.
4. **La valeur finale de `--color-accent-soft`.** #384257 (= mix 24 %) est calculé, pas encore
   vu sous du vrai texte à l'écran. À ajuster entre 20 % et 28 % au premier rendu (fondation §3 :
   « à ajuster à l'œil ») ; le blanc dessus tient de 9:1 à 11:1 sur cette plage.
5. **Quantité maximale par commande** (défaut proposé : 10). Dépend de la logique
   d'approvisionnement — à fixer dans `src/lib/shop/`, pas dans le design system.
6. **Noms et nombre des coloris.** Le sélecteur (§8.5) est spécifié pour N options ; les noms
   français des coloris restent à écrire quand les rendus 3D existeront (le jaune type Pikachu
   est exclu d'office).
7. **Le domaine** (alure-peche.fr, alure.fish, …) — décision produit reportée ; impacte
   uniquement l'adresse de contact citée dans les messages d'erreur (« contact@… » à compléter).
8. **Le délai de réponse au support.** Le message de succès du formulaire ne promet aucun délai
   (« Nous répondons à l'adresse indiquée. ») tant qu'un engagement réel (24 h ? 48 h ?) n'est
   pas pris par le gérant.
9. **L'image sociale 1200 × 630 définitive** — le gabarit est spécifié (§10) ; le choix
   photo plein vs fond uni attend les premiers rendus 3D.
