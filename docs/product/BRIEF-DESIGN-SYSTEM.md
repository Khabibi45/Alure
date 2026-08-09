# Brief — Charte graphique V.02 & design system Alure

> Prompt à donner tel quel à un Claude « design ». Écrit le 2026-08-05.
> Pièces à joindre au prompt : la charte V.01 (au moins les planches **2**, **8**, et 4-5 des
> affiches **21-34**), le fichier `docs/standards/FONDATION-PASTEL.md`, et 2-3 photos de
> `assets/photos leurre pour 3d/reference-fournisseur/`.

---

Tu es directeur artistique et designer de systèmes. Tu vas produire la **charte graphique V.02 et
le design system complet** de la marque **Alure**, sous une forme directement exploitable par des
agents de développement qui construiront le site sans toi.

Ton livrable n'est pas une présentation. C'est une **spécification**. Chaque décision doit être
donnée en valeur exacte (hex, rem, ms, ratio), jamais en adjectif. Si un développeur doit deviner,
tu as échoué.

## 1. Le contexte

Alure est une **boutique en ligne mono-produit** : un leurre de pêche articulé en deux sections,
pour la pêche du black-bass et de la perche. Micro-entreprise française, vente en
France, panier 15-25 €.

Les visiteurs arrivent **froids depuis Instagram et TikTok**, à ~90 % sur mobile, souvent le soir.
Ils connaissent la pêche : on leur parle en pêcheur, pas en marketeur. Ils se méfient des boutiques
dropshipping — la transparence est une condition d'achat, pas un bonus.

La conversion unique est **l'achat**. Le site compte 4 zones : une landing narrative (scroll animé
qui raconte le leurre), une page produit/achat, un suivi de commande + FAQ, et les pages légales.

Le ton est le **vouvoiement**, direct et précis, zéro superlatif creux.

## 2. Ce qui est déjà décidé — ne le rouvre pas

**Palette — les 4 couleurs de la charte V.01, telles quelles :**

| Nom charte | Hex | Rôle |
|---|---|---|
| Black Pearl | `#071128` | fond de page |
| Mirage | `#20293e` | surface posée sur le fond |
| Oxford Blue | `#394153` | bordures, séparateurs |
| White | `#ffffff` | texte principal **et** boutons d'action |

La charte **ne définit aucune couleur d'accent** : le bouton d'achat est blanc sur bleu, comme le
logo. N'invente pas un orange ou un cyan « pour faire ressortir le CTA ». Si tu penses qu'un accent
est indispensable à la conversion, argumente-le à part, en fin de document, sans l'intégrer au
système.

Deux rôles manquent à la charte et sont déjà dérivés (à valider, pas à remplacer par des teintes
inventées) : `#141d31` pour les zones en creux, `#9aa7bd` pour le texte secondaire — cette
seconde valeur est un Oxford Blue éclairci, car Oxford Blue brut sur le fond ne donne que 1,8:1,
donc illisible.

**Thème sombre unique.** Pas de mode clair, pas de bascule, y compris sur les pages légales.

**Typographie : Glacial Indifference, seule, pour tout le site** (licence SIL OFL, self-hostée).
La famille n'offre que **Regular et Bold**. C'est la contrainte centrale de ton travail
typographique : **la hiérarchie se construit par la taille, la casse et l'interlettrage — pas par
une pile de graisses.** Les polices Colette et Horizon de la charte V.01 sont écartées
définitivement (licence webfont non vérifiable) : ne les propose pas, même en alternative.

**Logo : la flèche n°1** (planche 8), celle déjà appliquée aux 14 affiches proto. Version blanche
par défaut. Le lock-up est : wordmark « ALURE. » au-dessus, flèche manuscrite dessous, débordant à
droite.

## 3. La contrainte d'architecture : deux couches

Le site est construit sur une fondation de studio, **invariante**, que ton design system doit
**remplir sans jamais la contredire**. Tu définis la couche 2 (couleur, typo, imagerie, ton) ; la
couche 1 t'est imposée :

- **Géométrie — trois rayons, aucun autre** : carte `1rem`, ligne/élément imbriqué `0.75rem`,
  contrôles (boutons, champs, sélecteurs) = **pilule**. Avatar rond.
- **Hiérarchie par les tons, jamais par les bordures.** Pas de bordure décorative sur les cartes,
  boutons ou champs. Seule exception : le séparateur 1 px entre les lignes d'une liste.
- **Ombres** : une seule ombre diffuse par surface ; au survol, ombre renforcée +
  `translateY(-3px)`. Jamais d'ombre dure ni d'ombre interne décorative.
- **Densité** : padding de carte `1.25rem` ; contrôles 36 px en interface dense, **44 px en
  contexte marketing et sur mobile** (cible tactile minimale).
- **Chiffres** : plafonnés à `2rem`, en chasse tabulaire. **Aucune police monospace nulle part
  dans l'interface.**
- **Motion — trois durées et deux courbes, rien d'autre** : `0.14s` (micro), `0.28s` (élément),
  `0.42s` (page) ; courbe d'arrivée `cubic-bezier(.22, 1, .36, 1)`, courbe de départ
  `cubic-bezier(.55, 0, .72, .35)`. Interdits : rotation, animation en boucle, durée > 500 ms,
  cascade généralisée (3 groupes maximum, 150 ms d'écart total).
- **Grain** : un bruit à opacité `0.02` sur la racine, jamais par-dessus une photo.
- **Le geste signature de la fondation est un surligneur** au marqueur, légèrement penché, posé
  sous la ligne de base, et cantonné à trois emplacements : le titre de page, **un seul** mot ou
  chiffre héros par écran, et l'item de navigation actif.

## 4. Le point que tu dois arbitrer explicitement

La fondation impose un geste manuscrit — **le surligneur**. La marque Alure en a déjà un — **la
flèche**. Deux gestes dessinés à la main dans la même interface, c'est un de trop : ça brouille la
signature au lieu de la renforcer.

Tranche, argumente, et écris la règle :
- soit la flèche **remplace** le surligneur pour Alure (dérogation assumée à la fondation, à
  documenter comme telle, avec le où/quand exact) ;
- soit les deux coexistent avec des territoires **étanches et nommés** (par exemple : la flèche
  appartient à la marque et au décor, le surligneur appartient à l'interface) ;
- soit le surligneur est simplement abandonné ici.

Ne laisse pas ce point implicite. C'est la première chose qu'un développeur va mal interpréter.

## 5. Le problème technique n°1 : le texte sur photo

Toute la direction artistique repose sur des **photographies de pêcheurs en silhouette au coucher
du soleil**, et tout le texte est blanc. Selon la photo, le blanc passe de parfaitement lisible à
illisible — c'est là que ce type de site s'effondre.

Tu dois livrer un **système de lisibilité**, pas un réglage au cas par cas : voiles et dégradés
définis en valeurs exactes, zones sûres de placement du texte, règle de décision (« si la zone sous
le texte dépasse telle luminance, alors… »), et le comportement en cas de photo trop claire. Ce
système doit garantir **4,5:1 minimum** pour tout texte courant, dans tous les cas.

## 6. Ce que le design system doit couvrir

**Fondamentaux**
- Les tokens de couleur complets, avec les rôles manquants que tu identifieras : anneau de focus,
  voile/scrim pour le texte sur photo, état de succès (commande confirmée), état d'information
  (le délai de livraison), état d'erreur. Le rouge d'erreur actuel est `#e5484d` — vérifie-le sur
  ce fond.
- L'échelle typographique complète : tailles, interlignes, interlettrages, casse, pour mobile
  **et** desktop. Référence mobile : 375 px de large.
- L'échelle d'espacement et la grille.
- Le traitement des photos : recadrages, voiles, formats, ce qu'on accepte et ce qu'on refuse.

**Composants — spécifie chacun avec tous ses états** (repos, survol, focus clavier, actif,
désactivé, chargement, erreur) :
- Boutons : achat (principal), secondaire, lien.
- Galerie produit : mobile (balayage) et desktop.
- **Sélecteur de coloris** — c'est le choix central du client. Pastilles, noms, état sélectionné.
- Sélecteur de quantité.
- Affichage du prix, incluant la mention « TVA non applicable, art. 293 B du CGI ».
- **Le bandeau de délai de livraison.** Le produit vient de Chine : 10 à 20 jours. Ce délai doit
  être **visible avant l'achat**, lisible, jamais minimisé ni relégué en bas de page. Traite-le
  comme un élément de confiance à mettre en avant, pas comme une contrainte à cacher. C'est un
  point non négociable : les litiges font geler les comptes de paiement.
- Barre d'achat collante sur mobile.
- Bandeau de réassurance — **uniquement des faits vérifiables** : rétractation 14 jours, paiement
  Stripe/PayPal, délai annoncé.
- Accordéon (FAQ), champs de formulaire et leurs messages de validation, page 404.
- Les états **chargement / vide / erreur**, visuellement distincts les uns des autres.
- La typographie des pages légales : de longs textes en blanc sur bleu nuit fatiguent l'œil.
  Traite ce cas sérieusement (largeur de ligne, interligne, contraste réduit assumé).

**La landing narrative**
Donne la grammaire des scènes du scroll animé (épinglage/défilement lié) : comment une scène est
composée, comment le texte entre et sort, les zones sûres sur mobile, le nombre de scènes
raisonnable. Les animations liées au défilement échappent à la limite des 500 ms — mais tout doit
**se dégrader en une page statique complète et lisible** quand le visiteur a demandé moins
d'animations. Précise ce que devient chaque scène dans ce mode.

**Le logo**
Livre les règles absentes de la V.01 : zone de protection, taille minimale, versions autorisées,
usages interdits, favicon, gabarit d'image de partage social (1200×630). Livre aussi **la flèche
n°1 et le wordmark en SVG propre** (tracés vectoriels, redessinés depuis l'affiche matricielle).
Le wordmark des affiches est dessiné en Colette : si sa licence ne couvre pas l'usage logo,
redessine-le en Glacial Indifference Bold et dis-le.

## 7. Les règles dures

1. **Aucune donnée fabriquée.** Ne conçois aucun composant qui exigerait d'inventer des données :
   pas d'avis clients, pas d'étoiles, pas de « 2 347 pêcheurs conquis », pas de compte à rebours,
   pas de fausse rareté de stock, pas de logos « vu dans ». La marque n'a aucune preuve sociale à
   ce jour. Le jour où de vrais avis existeront, on ajoutera le composant — pas avant.
2. **Accessibilité AA vérifiée, pas supposée.** Donne un tableau de contrastes avec les ratios
   **calculés** pour chaque paire texte/fond du système. Focus clavier visible partout.
3. **Mobile d'abord**, 375 px comme référence de conception, cibles tactiles ≥ 44 px.
4. **Jamais d'emoji en guise d'icône.** Les icônes viennent d'une bibliothèque au trait, cohérente.
5. Le site est en **français** ; tous les libellés que tu proposes le sont aussi, au vouvoiement.

## 8. Format de sortie exigé

Rends **un seul document Markdown**, structuré pour être lu par un agent, contenant :

1. Les **principes** de la direction artistique — 5 à 8 maximum, chacun actionnable.
2. Un **bloc de tokens prêt à coller**, au format CSS `@theme`, utilisant exactement ces noms :
   `--color-background`, `--color-foreground`, `--color-surface`, `--color-muted`,
   `--color-muted-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-accent`,
   `--color-accent-foreground`, `--color-accent-soft`, `--color-border`, `--color-danger`,
   plus tout token que tu ajoutes (nomme-le par son **rôle**, jamais par sa teinte).
3. L'**échelle typographique** en tableau : usage, taille mobile, taille desktop, interligne,
   interlettrage, casse, graisse.
4. La **spécification de chaque composant** : anatomie, valeurs exactes, tous les états, et le
   comportement responsive.
5. Le **tableau des contrastes** avec ratios calculés.
6. Les **règles du logo** + les SVG.
7. Une section **« à faire / à ne pas faire »** avec des exemples concrets tirés de ce site.
8. Une section **« ce que je n'ai pas tranché »** : ce qui reste à décider et pourquoi.

## 9. Critères d'acceptation

Ton livrable est accepté si, et seulement si :

- [ ] Un développeur peut coder n'importe quel composant listé **sans poser une seule question**.
- [ ] Aucune valeur n'est un adjectif ; tout est en hex, rem, ms ou ratio.
- [ ] Aucune règle ne contredit la couche 1 (rayons, ombres, densité, motion, chiffres, mono).
- [ ] L'arbitrage flèche/surligneur est tranché et écrit.
- [ ] Le système de texte sur photo garantit 4,5:1 dans tous les cas de figure.
- [ ] Chaque composant a ses états chargement, vide et erreur quand ils s'appliquent.
- [ ] Le délai de livraison 10-20 jours a un traitement visuel dédié et proéminent.
- [ ] Aucun composant proposé n'exige de données inventées.
- [ ] La hiérarchie typographique tient avec deux graisses seulement.
- [ ] Le mode « animations réduites » est spécifié scène par scène pour la landing.

Commence par me poser les questions qui te bloquent réellement, s'il y en a. Sinon, produis le
document.
