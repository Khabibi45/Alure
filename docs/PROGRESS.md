# Journal — Alure

> Le journal vivant : le plus récent **en haut**. L'agent écrit ici à la fin de chaque session qui
> change l'état du produit (date + ce qui a changé + fichiers clés). C'est la trace de reprise.

## 2026-09-02 — La scène de pêche sur « À propos », et une décision produit à instruire

### L'image sous « D'où part votre leurre »

Remplacée (consigne Camil) par la scène qui montre un sandre, le leurre vert dans la gueule :
`public/produit/prise-vert.webp`, 1200×800, 44 Ko. Le cadre passe du panoramique 1200/568 au 3:2 —
le panoramique coupait à la fois la tête du poisson et la palette. L'ancien `marque-scene.webp`
(rendu 3D de l'articulé, coloris « Orange feu » qui n'existe plus au catalogue) est supprimé.

**Et ce qu'il a fallu corriger avec.** Le paragraphe juste au-dessus, `ABOUT.VISUALS_BODY`,
affirmait : « Toutes les images du site sont nos rendus 3D du leurre réel […] pas de photo
d'ambiance empruntée ». Le fichier fourni, `fish_leurre_vert_souple.jpg`, est l'ancien
`Gemini_Generated_Image_as1czias1czias1c.jpg` renommé — mêmes octets, mêmes dimensions, même
horodatage. C'est une image de synthèse.

Poser cette image sous cette phrase-là, sur la section qui s'appelle « Ce que vous voyez est ce que
nous vendons », en aurait fait un mensonge à l'endroit exact où le site promet le contraire. Le
texte dit maintenant ce qui est : les visuels des leurres viennent de nous, et **la scène qui
montre un poisson est une image de synthèse — nous n'affichons pas de prise réelle tant que nous
n'en avons pas de nous**. L'`alt` le dit aussi, dans les deux langues.

`ABOUT.COLORWAY_ALT` parlait encore de « rendu 3D dans son décor » alors que les vignettes sont
désormais les photos de studio : corrigé.

### Les cinq blocs de « Ce qu'il y a dans le leurre », compactés

Consigne Camil : « réduits à fond, le plus possible ». Le gros plan passe d'une image de 40 % de
large à une vignette de 96 px posée à gauche du texte, et les cinq cartes tiennent sur deux rangs
(2 colonnes à partir de 640 px, 3 à partir de 1024) au lieu de cinq pleines largeurs. La section
se lit d'un coup d'œil au lieu de se dérouler. Le fichier servi reste le 640×480 : c'est `sizes`
qui annonce la taille réelle, et le navigateur prend la variante — jamais plus lourde que
nécessaire.

### ⚠️ À INSTRUIRE — « le leurre noir n'est plus collector »

Camil l'a signalé le 2026-09-02. **Rien n'a été changé dans le code** : c'est une décision
commerciale, pas une retouche, et elle touche large. Aujourd'hui le site affirme partout le
contraire, y compris dans un document qui engage :

- **`docs/i18n/fr.md` / `en.md`** — `ABOUT.COLLECTOR_RULE`, `PRODUCT.COLLECTOR_LOCKED` et
  `_EARNED`, `OFFER.COLLECTION_DETAIL`, `PROGRESS.STEP_COLLECTOR`, `FAQ.A_BULK`,
  `PROJECTS.DONE_BODY`, `CART.GIFT_A11Y` : « le Pirate ne s'achète pas, il se choisit comme 4e
  leurre offert ».
- **`LEGAL.TERMS_S2_BODY` (les CGV)** — décrit l'offre « 3 achetés, le 4e offert » et le coloris
  collector remis gracieusement. Modifier une offre décrite aux CGV n'est pas un travail de copie.
- **Le code** — `PRODUCT.collector` (`src/lib/shop/product.ts`), le champ `cadeau` du checkout
  (`src/app/api/checkout/route.ts` + son schéma partagé), `COLLECTOR_LURE_MODEL` et
  `SELLABLE_LURE_MODELS` (`src/lib/lure-models.ts`), le sélecteur de 4e leurre de `BuyBox`,
  `OfferPanel`, `OfferProgress`, le carrousel de l'accueil. Vingt-cinq fichiers le mentionnent.

Deux lectures possibles, et elles ne mènent pas au même travail : soit le noir devient un **4e
coloris vendable** (l'offre groupée passe à quatre coloris au choix, plus de collector), soit
l'offre « 3 achetés, le 4e offert » **disparaît avec lui**. La question est posée à Camil ; tant
qu'elle n'est pas tranchée, le site continue d'annoncer une règle qui n'est plus vraie.

**Fichiers clés** : `public/produit/prise-vert.webp` · `src/app/(fr)/a-propos/page.tsx` ·
`src/app/[lang]/a-propos/page.tsx` · `docs/i18n/{fr,en}.md`

## 2026-09-01 (fin de journée) — Le corps bouge un peu plus, et le leurre dit enfin ce qu'il contient

Deux consignes de Camil, dans la foulée de la mise en ligne de LOT11.

### « Fais bouger légèrement plus le corps du leurre »

Les trois amplitudes d'ENSEMBLE du carrousel de l'accueil (celles qui font osciller le leurre
entier, à ne pas confondre avec la flexion du brin et de la palette) sont relevées d'un tiers dans
`src/lib/three/swim.config.ts` : lacet 3,4° → **4,6°**, roulis 1,4° → **2,0°**, bercement 0,6 % →
**0,85 %** de la longueur. La palette reste la vedette — le lacet du corps vaut toujours moins du
cinquième de son balayage, la borne que `src/lib/lure-models.test.ts` fait respecter. Le
commentaire du fichier disait « moins du septième » : il disait la vérité de l'ancien réglage, il
dit maintenant celle du test.

### La description du leurre : cinq faits, pas des arguments

Jusqu'ici la page produit ne décrivait pas le leurre — la page française portait même en tête la
réserve « pas de section Caractéristiques tant que les specs ne sont pas vérifiées sur
l'échantillon reçu » (règle n°6). L'échantillon est là, Camil a relevé ce qu'il contient : gros
yeux pour la visibilité, paillettes, **barrette d'aluminium** à l'intérieur pour un effet cuillère,
queue **articulée et striée** pour la vibration, et palette **en patte de canard** — celle qui
change la nage et qui les a décidés.

Nouveau Server Component `src/components/sections/leurre/LureDetails.tsx`, **partagé** par les deux
pages produit : c'est ce qui empêche la description d'exister en deux exemplaires qui dérivent. Il
s'insère entre le visuel et l'offre — on regarde le leurre, on voit son prix, on comprend comment
il est fait, puis on choisit. Douze clés dans `docs/i18n/fr.md` **et** `docs/i18n/en.md` dans le
même commit, `npm run i18n` régénéré (358 clés).

Aucun chiffre, aucun avis, aucune promesse de prise : uniquement ce que la pièce contient.

### Les photos remplacent les rendus de l'articulé

Le catalogue portait depuis le 2026-08-09 un avertissement dans son propre code : « les images
`/produit/*.webp` sont encore celles du leurre articulé, elles montrent un autre produit ». C'est
réglé. Camil a fourni quatre photos de shooting (même plan, même ardoise mouillée, un leurre par
coloris) et quatre planches « toutes vues » sur fond blanc.

Ce qui en sort, tout en WebP dimensionné, jamais une source publiée :

- **4 photos principales** 1200×900 (57 à 72 Ko). Elles ouvrent la colonne visuelle de la page
  produit, AU-DESSUS de la 3D : une photo dit ce qu'on reçoit, la 3D dit comment c'est fait.
- **20 gros plans** 640×480 (4 à 16 Ko) — cinq par leurre, un par bloc de la description :
  l'œil, les paillettes, le corps translucide où se devine la barrette, la queue striée, et la
  palette vue de face. Ils **suivent le coloris choisi** dans l'îlot d'achat : c'est la même
  sélection que la visionneuse 3D, jamais un second état qui dériverait.

Le **Pirate** a lui aussi sa photo : sa pastille de 4e leurre offert montrait une tête de mort —
une icône, pas le produit. On ne choisit pas son leurre sur un pictogramme.

Le lien entre un coloris et ses six fichiers passe par un `photoSlug` unique, et
`src/lib/shop/lure-details.test.ts` va chercher les **vingt-quatre fichiers sur le disque**. C'est
le genre de panne qui ne fait aucun bruit : un `next/image` sans source ne lève rien, ne casse pas
le build, et laisse un trou dans la page en production.

Les trois anciens `.webp` de l'articulé sont supprimés.

**Fichiers clés** : `src/lib/three/swim.config.ts` · `src/lib/shop/lure-details.ts` ·
`src/lib/shop/product.ts` · `src/components/sections/leurre/{LureDetails,ColorwayPhoto,BuyBox}.tsx`
· `src/lib/i18n/leurre-strings.ts` · `src/app/(fr)/leurre/page.tsx` ·
`src/app/[lang]/leurre/page.tsx` · `docs/i18n/{fr,en}.md` · `public/produit/`

**Reste ouvert** : le titre et la meta-description de la page produit annoncent encore un « leurre
articulé 2 sections » (`PRODUCT.TITLE`, `PRODUCT.DESCRIPTION`, `META.DESCRIPTION`, `ABOUT.DESCRIPTION`).
C'est le vocabulaire de l'ancien produit ; il contredit la description qu'on vient d'écrire.

## 2026-09-01 — Les leurres souples (branche `leurres-souples`) : deux bugs de fond trouvés en route

Consigne Camil : remplacer les modèles 3D par quatre leurres souples fournis (bleu, rouge, vert,
noir), sur une branche. Puis, après un premier essai : « réduis la taille du leurre de 3 à 5 fois »
et « pourquoi le rendu du glb n'est pas celui que j'avais ».

Les deux remarques avaient **la même cause**, et ce n'était pas celle qu'on croyait.

### Le moteur supposait l'axe long au lieu de le mesurer

`normalizeGeometry` prenait X pour l'axe long du leurre. C'était vrai des exports de l'articulé, et
c'était écrit comme un contrat (`swim.config.ts`). Les leurres souples sortent orientés sur **Z** :
0,34 × 0,40 × 1,90.

Deux conséquences, invisibles séparément mais évidentes ensemble. Le moteur normalisait la taille
sur la **largeur** : le modèle était agrandi **5,9 fois** — exactement le facteur de 3 à 5 que Camil
avait mesuré à l'œil. Et la charnière de nage, qui pivote autour d'un X, pliait le leurre **en
travers** au lieu du long. D'où un rendu qui ne ressemblait à rien.

Le moteur mesure désormais l'axe dominant et fait pivoter la géométrie une fois pour toutes. Le
contrat « X est l'axe long » devient vrai **par construction** au lieu d'être supposé.

### Le script détruisait les cartes de données

Le matériau est **entièrement métallique** (`metallicFactor: 1`) : tout son rendu vient des reflets,
pilotés par la carte de normales. Or `optimize-glb.mjs` compressait TOUTES les images comme des
photos — qualité 82, chrominance moyennée par blocs de 2×2. Une carte de normales encode un vecteur
par pixel : la sous-échantillonner corrompt la donnée. Elle tombait de **7,2 Mo à 16 Ko**.

Le script distingue maintenant les cartes de **données** (normales, metallic/roughness, occlusion)
des cartes de **couleur** : double résolution, qualité 95, chrominance intacte. La normale passe à
**476 Ko**.

### Le poids, et la décimation

Les modèles fournis pèsent 48 à 63 Mo pour **1,1 million de triangles** — cinq à huit fois les
précédents, et 240 Mo qui seraient entrés définitivement dans git. Le script sait désormais **décimer
hors ligne**, à la compilation, via `meshoptimizer` (déjà présent). Aucun impact CSP : le navigateur
reçoit un GLB ordinaire. Réglage actuel : 35 % des triangles conservés, soit 383 000 et ~12 Mo pièce.
**Le taux reste à valider à l'œil par Camil** — c'est un arbitrage entre finesse et poids, pas une
vérité technique.

### Les « fils » entre la tête et la queue — le double remap

Camil : « la texture est horrible, comme si des fils reliaient la tête et la queue du leurre ». La
description était littérale : le maillage publié contenait **74 145 arêtes** traversant la carte UV
et **61 166** traversant le modèle en 3D. La source, elle, n'en a aucune (arête maximale 0,005 pour
un leurre long de 1,9).

`MeshoptSimplifier.compactMesh` cache **deux pièges**, et j'étais tombé dans les deux :

1. Il retourne un COUPLE `[remap, nombre de sommets gardés]`. Le prendre pour le remap seul produit
   des attributs vides et un leurre **invisible**, sans la moindre erreur au chargement.
2. Il **remappe le tableau d'indices SUR PLACE** — la dernière ligne de son helper `reorder` fait
   `indices[i] = remap[indices[i]]`. Le tableau qui en ressort est donc déjà final. Réappliquer
   `remap` derrière, comme je le faisais, calcule `remap[remap[i]]` : des triangles qui relient des
   sommets sans rapport, d'un bout à l'autre du modèle. À l'écran, des fils tendus.

Rien de tout ça ne lève d'erreur : le fichier reste un GLB valide, il s'affiche, il est simplement
faux. C'est exactement la dégradation silencieuse que le principe n°1 interdit — d'où le
**diagnostic chiffré** plutôt qu'un jugement à l'œil : on mesure la plus longue arête, avant et
après, et on exige zéro.

Au passage, la simplification tient désormais compte des **UV et des normales**
(`simplifyWithAttributes`) et non plus des seules positions : le simplificateur refuse de fondre
deux sommets qui divergent dans la texture, ce qui protège les coutures de la carte UV.

Après correction, sur les quatre leurres : **0 arête étirée**, UV maximale 0,021 à 0,028.

### Un leurre témoin, le temps de trancher — puis retiré

Pour juger à l'œil ce qui restait imputable à la compression, le carrousel a porté un cinquième
modèle : le fichier livré par Meshy **copié tel quel**, sans décimation ni recompression, hors du
commerce et affiché sous son propre nom. Il pesait 65 Mo à lui seul.

La comparaison faite, **il a été retiré** (consigne Camil) : le fichier, son entrée dans
`LURE_MODELS`, et le drapeau `debug` qui n'avait plus d'usage. Rien de mort ne reste : `public/`
part dans git, et un modèle de diagnostic qui traîne finit par être servi en production.

Vérifié au passage, ce qui clôt une hypothèse : le GLB d'origine ne contient **ni squelette ni
animation** (`skins: 0`, `animations: 0`). Aucun fichier d'animation ne « tue » la nage — elle vient
entièrement de notre shader.

### Le moteur animait le NEZ du poisson

C'est la découverte de la journée, et elle explique pourquoi trois réglages successifs ont tous
paru faux.

Le moteur tenait pour acquis que la tête sortait du côté `axisMin`. C'était vrai des exports de
l'articulé. **Les leurres souples sortent de Meshy dans l'autre sens** : tête en `axisMax`, palette
en `axisMin`. Toute la nage s'appliquait donc au museau.

C'est la MÊME erreur que l'axe long, à quinze jours d'écart : une convention d'export prise pour
une loi. D'où `src/lib/three/lure-anatomy.ts` — la géométrie répond elle-même à la question. On
découpe le corps en tranches et on cherche la **section la plus fine** : sur tout leurre en forme de
poisson, ce point est le pédoncule, et le pédoncule est du côté de la queue. Mesuré sur les cinq
fichiers servis, à l'identique : fraction 0,164. Le critère naïf « le bout le plus épais est la
tête » se serait trompé — sur ces modèles la palette est 19 % plus large que le corps.

**Vérifié indépendamment** avant d'écrire une ligne : quatre analyses séparées (géométrie, texture,
forme fonctionnelle, puis une tentative de réfutation) concluent toutes tête en `axisMax`, en
confiance forte. L'analyse de texture a trouvé **les deux yeux** dans la carte de couleur — deux
amas sombres symétriques à la fraction 0,86 — et l'agent de réfutation a rejoué `rotateY(π/2)`
contre le three.js installé pour chercher une erreur de signe. Il n'y en avait pas.

### La nage refaite : seule la charnière bouge

Consigne Camil : « la seule animation doit se faire depuis la charnière entre le paddle et le corps
du leurre, la partie la plus fine et striée doit s'onduler à peine, la nage doit être linéaire et le
paddle seulement doit bouger avec la charnière. »

**Les fractions du réglage ne sont plus choisies, elles sont mesurées.** Le découpage en tranches
donne l'anatomie, comptée depuis la tête : corps jusqu'à 0,74 ; brin fin et strié de 0,74 à 0,89
(section minimale à 0,836, seize fois moindre que les épaules ; **sept gorges annulaires** relevées,
ce sont les stries) ; palette au-delà. D'où `stemStartRatio = 0.74` et `hingeRatio = 0.89`.

Tout le mouvement tient dans une rampe `t = clamp((x − pivot) / (charnière − pivot), 0, 1)`, et les
trois zones tombent d'elles-mêmes, sans un seul branchement : `t = 0` sur le corps (immobile), `t`
croissant sur le brin (il plie d'autant moins qu'on est près du corps), `t = 1` sur la palette —
même angle, même pivot, donc **rotation rigide exacte** : la palette ne se déforme jamais, par
construction. Le dénominateur est signé, ce qui absorbe l'orientation du modèle.

La nage est linéaire au sens propre : lacet et tangage partagent le même `sin(ωt)`, donc leur
rapport est constant et la palette parcourt un segment de droite. Un seul `sin()` dans le shader —
c'est ce qui interdit l'ellipse.

Le corps, lui, garde un mouvement d'ENSEMBLE volontairement discret — 3,4° de lacet, 1,4° de roulis,
un bercement de 0,6 % de la longueur (consigne : « fais légèrement bouger le corps du leurre
aussi »). Le mot qui compte est « légèrement », et c'est ce que le test garde : les trois amplitudes
doivent être non nulles **et** rester sous le cinquième du balayage de la palette. Au-delà, on ne
verrait plus une palette battre, mais un leurre se tortiller.

### La page produit ne nage plus du tout

Consigne : « quand on est sur la page du leurre pour l'acheter ou qu'on va d'un coloris à l'autre,
aucune animation du leurre ne doit être visible — juste le gauche-droite, dessus-dessous, et pouvoir
le bouger dans tous les sens. »

Nouvelle option `still` sur `createLureStage`, posée par `ColorwayViewer`. Elle coupe tout : flexion
de queue, lacet, roulis, bercement. Le leurre n'obéit plus qu'aux vues nommées et à la souris.
Le raisonnement est écrit à côté de l'option — on vient sur cette page pour comparer deux coloris et
détailler une forme, et un mouvement permanent empêche exactement ces deux gestes. Sur l'accueil, au
contraire, la nage reste l'argument.

### L'erreur Stripe devient une consigne

La clé expirée remontait en trace complète à chaque rendu de page, dans l'overlay de développement.
Une clé refusée est un problème de **configuration**, pas un incident : nouvelle erreur typée
`PaymentKeyRejectedError`, reconnue à la NATURE de l'erreur Stripe (`type`) et non par `instanceof`
— un `instanceof` casse dès que le module est simulé, et transformait un test de panne en erreur de
test. Le bandeau et la campagne affichent maintenant une phrase et la marche à suivre ; toute autre
panne garde sa trace entière.

**Gate** : tsc ✅ eslint ✅ vitest 223 passés (+31 sautés) ✅ build ✅.

**Reste ouvert** : les photos produit `/produit/*.webp` montrent encore l'articulé ; tout le site le
décrit comme un « articulé deux sections » ; et les AMPLITUDES de nage restent à juger à l'œil — les
fractions, elles, sont mesurées.

Fichiers : `src/components/sections/home/lure-stage.ts`, `scripts/optimize-glb.mjs`,
`src/lib/lure-models.ts`, `src/lib/shop/product.ts`, `src/lib/three/swim.config.ts`,
`src/lib/shop/errors.ts`, `src/lib/shop/stripe.ts`, `src/components/sections/OrdersBanner.tsx`,
`public/models/` (4 remplacés, 4 retirés).

## 2026-08-28 — La page « Nos projets » a enfin un contenu

Consigne Camil : « complète la page Nos projets ».

**Elle était littéralement vide** : 333 caractères servis, uniquement l'en-tête et le pied de page.
Elle ne rendait qu'un bloc, la campagne de précommande, et ce bloc se masque tant que la date
d'expédition n'est pas configurée. C'est le cas aujourd'hui.

**La contrainte qui a commandé l'écriture** : le contenu devait tenir debout dans les DEUX états.
La frontière retenue est juridique autant qu'éditoriale — annoncer « on vise 100 commandes »
n'engage à rien, c'est un but qu'on peut dire librement ; **vendre une précommande engage à une
date** (art. L216-1). Le nouveau contenu ne parle donc que de faits présents et d'un objectif
déclaré ; le bloc de campagne garde le monopole du compteur, de la date, du remboursement et de
l'invitation à payer. La campagne peut s'allumer ou s'éteindre sans rendre la page incohérente.

Trois structures ont été écrites puis départagées. La gagnante — « état des lieux, ce qui a
changé, ce qui manque » — a été **réduite de cinq blocs à trois** par l'arbitrage : deux
doublonnaient la page « À propos » (les rendus 3D, l'enveloppe matelassée) ou empiétaient sur la
campagne, qui explique déjà pourquoi cent. C'est la coupe qui a le plus servi le texte.

Le résultat, en trois blocs : **« Ce qui est déjà là »** (le leurre fait, les coloris, les rendus
3D qu'on manipule du doigt), **« Le stock est rentré en France »** (avec l'ancien délai de 10 à 20
jours nommé, parce que le dire rend le nouveau crédible), **« La série et la boîte »** (ce qui
manque, au conditionnel, sans décrire une boîte qui n'existe pas).

Le corps vit dans un composant partagé par les deux langues : pas de version française qui dérive
de sa traduction, comme c'était arrivé à `/suivi` et `/a-propos`.

**Gate** : tsc ✅ eslint ✅ vitest 223 passés (+31 sautés) ✅ build ✅. Vérifié en navigateur :
1 607 caractères en français, 1 755 en anglais, quatre titres, le bouton produit, et aucun
placeholder resté sans valeur.

## 2026-08-28 — Fin du dropshipping : stock en France, 3 à 5 jours ouvrés, et la page « Nos projets »

Consigne Camil : « pour tout ce qui est textuel change pour Livraison 3-5 jours ouvrés, note qu'on
change de méthode : on ne fait plus de dropshipping mais on utilise maintenant des enveloppes
noires à bulles pour expédier les produits depuis la France. Fais apparaître l'onglet Nos projets. »

Trois questions posées avant d'écrire une ligne, parce que la réponse changeait tout : le délai est
vrai **dès maintenant** (le stock est en France), la page « À propos » est **réécrite** avec
l'expédition française comme argument, et « Nos projets » accueille **la campagne des 100**.

### Le délai, partout

Le chiffre a une source unique (`PRODUCT.deliveryDelay` et sa traduction `PRODUCT.DELAY_VALUE`),
mais huit endroits l'avaient recopié à la main. Tous alignés : page produit, FAQ, suivi de commande,
emails, gabarits `docs/emails/`, CGV, documentation produit, charte graphique, ADR paiements.

**Ce que le changement rendait faux, et que personne n'aurait vu tout de suite** : la page de suivi
promettait encore « un numéro de suivi **international** », une activation « en 2 à 4 jours » et un
recours « au-delà de **30 jours** ouvrés ». Trois promesses absurdes avec un colis parti de France
sous cinq jours. Le bandeau de la page produit annonçait « expédié depuis notre fournisseur en
Chine ». La notification vendeur disait « à commander chez le fournisseur » — il n'y a plus rien à
commander, il y a un colis à préparer.

**Deux pages françaises recopiaient tout leur texte en dur**, en double du dictionnaire que leurs
jumelles anglaises utilisaient déjà : `/suivi` et `/a-propos`. C'est par là que la divergence
serait revenue. Elles sont branchées sur la source unique. Le cliquet anti-texte-en-dur ne les
voyait pas : il ne surveille que `src/app/[lang]/` et `src/components/sections/`.

### La page « Nos projets »

La campagne des 100 quitte l'accueil pour `/nos-projets` et `/en/nos-projets`, avec son entrée de
menu dans les deux langues. L'accueil garde le **bandeau d'objectif**, qui affiche le compteur réel
et renvoie vers la page — il était écrit depuis deux semaines et n'était branché nulle part.

La page hérite des gardes de la campagne : sans date d'expédition configurée, sans compteur Stripe
lisible ou une fois l'objectif atteint, elle ne rend rien. C'est assumé — mieux vaut une page vide
qu'une précommande qui promet sans date.

### La page « À propos » réécrite

Son argument central était la transparence sur le dropshipping : « on expédie depuis notre
fournisseur, on vous le dit franchement ». Devenu faux. Le nouvel angle, sorti d'un concours à deux
plumes : le fait d'abord, le geste ensuite, la comparaison jamais. « Un seul leurre, stocké en
France », puis l'enveloppe matelassée noire déposée à la poste. La page ne mentionne à aucun moment
les colis qu'elle n'est pas — c'était le piège, l'auto-défense préventive étant l'une des cinq
tournures interdites par la charte de ton.

Une phrase garde le mot « fournisseur », et c'est volontaire : « pas de visuel fournisseur
retouché » parle des IMAGES. Le fabricant existe toujours, seul le dropshipping s'arrête.

**Gate** : tsc ✅ eslint ✅ vitest 222 passés (+31 sautés) ✅ build ✅. Vérifié en navigateur :
`/nos-projets` et `/en/nos-projets` répondent, le menu compte six entrées dans les deux langues, et
plus aucune des six pages testées ne porte l'ancien délai, la Chine ou le fournisseur.

**Reste ouvert** : la règle n°1 de `CLAUDE.md` a été réécrite, mais cinq jours annoncés et manqués
se remarquent bien plus vite que vingt — le délai est désormais une promesse tenue par nous, plus
une contrainte subie.

## 2026-08-28 — Le leurre se tourne à la main sur la page produit ; l'angle de vue remonte sur l'accueil

Deux consignes Camil : « mets le droite/gauche pour bouger les leurres 3D en haut des leurres 3D »,
puis « sur la page produit on doit pouvoir bouger les différents leurres 3D à la souris, les
visualiser sous tous les angles comme on veut ».

### L'angle de vue remonte au-dessus du leurre (accueil)

Le sélecteur des six angles orientait le leurre depuis le BAS de l'écran, collé aux commandes
d'achat : deux gestes de nature différente au même endroit. Il agit désormais depuis la bande
haute, au-dessus de l'objet qu'il modifie, et la bande basse redevient ce qu'elle doit être — le
panier et les chemins vers la caisse.

### La rotation libre (page produit)

Le leurre se tourne à la main sur 360° en lacet et un quart de tour en tangage. Trois découvertes
ont simplifié le travail, toutes vérifiées dans le code avant d'écrire une ligne :

- **L'ordre d'Euler du moteur donnait DÉJÀ le bon comportement.** En ordre XYZ, la composition
  fait pivoter le leurre sur sa propre verticale puis basculer autour de l'horizontale de l'écran
  — le « tourne-disque » qu'on attend d'un objet qu'on manipule. Passer en `YXZ`, réflexe fréquent,
  aurait fait dériver l'axe de bascule avec le lacet et rendu la manipulation imprévisible dès un
  quart de tour.
- **Les six vues nommées sont exactement les points remarquables de l'espace de rotation.**
  « Dessus » et « Dessous » sont précisément les bornes du tangage. Le geste atteint donc ce que
  les boutons atteignent, et la barre des six vues sert de commande grossière, de chemin clavier
  et de retour à un angle nommé — sans inventer un bouton « recentrer » de plus.
- **La pose et la nage vivent sur deux nœuds distincts** depuis l'origine. Le geste écrit sur la
  pose, la nage continue par-dessus : il n'y a rien à suspendre, et le leurre ne se fige jamais.

Décisions notables :

- **Sensibilité normalisée par la largeur du cadre**, pas en degrés par pixel : « balayer toute la
  largeur fait un demi-tour » reste vrai sur un téléphone de 335 px comme sur un grand écran.
- **Aucune inertie.** L'objet nage déjà en permanence ; un élan posé par-dessus ne se lit pas comme
  de l'élan, il se lit comme un site qui rame.
- **Suivi 1:1 pendant le geste**, amorti seulement hors geste. Un amortissement, même court, fait
  traîner l'objet derrière le doigt.
- **`touch-pan-y`**, comme le carrousel : le cadre est un carré pleine largeur, capter les deux axes
  au doigt confisquerait le défilement de la page sur son plus gros élément. Le tangage reste
  accessible au doigt par les six vues.
- **Clavier complet** : les flèches tournent par pas de 15°, Origine revient à la vue de départ.
  La région vocale n'annonce que les angles NOMMÉS — la suivre pendant un glissé transformerait le
  lecteur d'écran en machine à parler.
- **Aucun état React dans le chemin du geste** : pointeur, dernier point et taille du cadre vivent
  dans des refs. Le moteur est le seul détenteur des angles, pour que le composant et lui ne
  dérivent jamais.
- L'angle courant est une **union discriminée** : soit une vue nommée, soit « libre ». Après un
  glissé, aucun bouton n'est enfoncé — le contrôle n'affirme jamais un angle qui n'est pas affiché.

**Zéro diff sur le carrousel de l'accueil** : le moteur est partagé, seule la page produit câble
les nouvelles méthodes. `ColorwayViewer` sort au passage de la liste de dette des textes en dur.

**Gate** : tsc ✅ eslint ✅ vitest 220 passés (+31 sautés) ✅ build ✅. Vérifié en navigateur sur
`/leurre` et `/en/leurre` : cadre focusable, curseur de saisie, défilement vertical préservé, les
six angles traduits, l'indice de manipulation présent.

## 2026-08-26 — La parité FR/EN devient automatique ; la campagne de précommande des 100

Deux consignes Camil : « standardise pour que tout ce qui est fait sur FR soit bien visible et
traduit en anglais sur EN », puis « dire qu'il nous faut 100 commandes pour lancer une vraie ligne
de production, investissez sur nous en précommandant ».

### Le cliquet qui rend la parité automatique

`src/lib/i18n/no-hardcoded-text.test.ts` — le filet qui manquait. Les deux autres garantissaient
des dictionnaires complets et à jour, mais ne voyaient **rien** si le texte était écrit directement
dans le JSX : c'est exactement comme ça que `/en` a pu servir un hero, un formulaire et une page
produit entièrement français avec des dictionnaires parfaits.

- Il interdit **tout littéral visible**, pas « le français » : détecter une langue demanderait une
  heuristique, donc des faux positifs sur « Truite arc-en-ciel » (français par décision). Une
  chaîne anglaise en dur serait tout aussi fausse côté français.
- **18 fichiers de dette sont listés NOMMÉMENT**, pas exclus par un motif. C'est ce qui fait le
  cliquet : la règle s'applique dès maintenant à tout le reste et à tout fichier neuf. On ne peut
  plus en ajouter, seulement en retirer. Un test vérifie en plus que chaque ligne de dette
  correspond à un fichier existant.
- Il a immédiatement attrapé **le bandeau d'objectif** puis **ma propre section de campagne** —
  les deux ont été corrigés avant d'être livrés. C'est le comportement attendu.

### La campagne de précommande

**Une décision juridique a été tranchée avant d'écrire une ligne.** Camil voulait une vraie
précommande (payer maintenant, recevoir le leurre signé plus tard) mais un engagement « au
conditionnel ». Les deux sont incompatibles : l'article L216-1 du code de la consommation impose
une **date d'expédition**, et à défaut la loi applique 30 jours, après quoi l'acheteur peut
annuler et exiger son remboursement. « Quand on aura 100 commandes » n'est pas une date.

- `src/lib/shop/precommande.ts` traite donc la date comme une donnée **obligatoire**, sur le
  modèle de `legal-config.ts` : tant que `PRECOMMANDE_SHIP_BY` vaut son gabarit « À COMPLÉTER »,
  `PRECOMMANDE_ACTIVE` est faux, **la campagne ne s'affiche nulle part**, et rien n'est encaissé
  sur une promesse sans date. Le site retombe sur la vente normale, qui est complète.
- La section a **trois gardes**, chacune faisant disparaître le bloc plutôt que de le dégrader :
  pas de date configurée, Stripe injoignable (pas de « 0 » par défaut — le compteur est
  l'argument, sans chiffre vrai il n'y a plus de preuve), objectif déjà atteint.
- **L'histoire** est sortie d'un concours à trois plumes (l'aveu, l'atelier ouvert, le pacte) et
  d'un jury. Le pacte gagne l'architecture — un pêcheur méfiant à 22 h ne demande pas d'où vient
  la marque, il demande ce qu'il advient de son argent. Titre greffé de l'atelier :
  **« Le leurre existe. La série, non. »** La date et le remboursement sont au centre de la page,
  pas en note de bas de page. Zéro tiret cadratin, zéro emoji, zéro donnée fabriquée.
- Le contenu de la boîte premium reste **au conditionnel**, et le texte le dit explicitement :
  « Tant que l'atelier n'a rien confirmé, nous n'annonçons ni matériau ni contenu. »
- **Le bandeau d'objectif est rebranché** et traduit. Un test vérifie que la campagne et le
  bandeau visent le **même** chiffre : sinon le site annoncerait deux objectifs différents sur la
  même page.
- 23 clés ajoutées dans les deux langues (331 au total).

**Gate** : tsc ✅ eslint ✅ vitest 214 passés (+31 sautés) ✅ build ✅.

**Ce qui bloque la publication de la campagne** : la date limite d'expédition, à choisir en
comptant la production, l'acheminement et une marge. Une date manquée est un remboursement de
droit, et une série de remboursements gèle un compte Stripe. Restent aussi à écrire : les CGV de
la précommande (le régime diffère de la vente normale) et le gabarit d'email de remboursement si
l'objectif n'est pas atteint.

## 2026-08-26 — Le site entier existe en anglais : 11 routes `/en`, tunnel de paiement compris

Consigne Camil : « quand le mode anglais passe, tout le site ne doit être accessible plus qu'en
anglais. Fais les routes /en. Si le mode anglais est activé, alors toutes les routes ont /en aussi. »

L'anglais passe de **2 pages sur 13** à **11 pages sur 11** (les deux routes de travail du hero
restent françaises, volontairement).

- **Les 9 routes créées** sous `src/app/[lang]/` : `/en/leurre`, `/en/contact`, `/en/suivi`,
  `/en/a-propos`, `/en/merci`, `/en/cgv`, `/en/mentions-legales`, `/en/confidentialite`,
  `/en/retractation`. Chacune vérifiée en navigateur : HTTP 200, `lang="en"`, titre anglais.
- **142 clés de dictionnaire ajoutées** dans les deux langues (296 → 308 au total). Les pages
  légales portent en tête le rappel que **la version française fait foi** — la clé
  `LEGAL.TRANSLATION_DISCLAIMER` existait sans être lue.
- **Les deux îlots clients qui restaient français sont traduits** : le formulaire de contact
  (« Votre message », « Envoyer ma demande ») et toute la page produit (BuyBox, OfferPanel,
  OfferProgress, ColorwayViewer, PaymentMethods). Ils suivent le patron du carrousel : le serveur
  prépare les chaînes (`contactStrings`, `leurreStrings`), le client les reçoit en props — aucun
  `'use client'` n'importe de dictionnaire, donc rien n'alourdit le bundle.
- **Le schéma zod du contact devient une fabrique** (`createContactSchema(messages?)`) : les
  RÈGLES restent uniques et partagées client/serveur, seuls les messages varient. `contactSchema`
  garde sa signature, donc la route API et ses tests sont inchangés.
- **Le tunnel de paiement suit enfin la langue.** Nouveau champ `langue` dans le schéma de
  checkout, validé par zod comme tout le reste : il décide de la langue de la **page Stripe**
  (`locale` n'est plus figé sur `'fr'`) et des **URL de retour** (`/en/merci`, `/en/leurre`).
  Optionnel et replié sur le français : un onglet ouvert avant la mise à jour paie encore.
- **Une seule source de vérité pour « quelles pages existent dans quelle langue »** :
  `TRANSLATED_PATHS` dans `paths.ts`. Le sitemap gardait sa propre copie et aurait continué
  d'annoncer 2 pages sur 11 ; il en dérive désormais, et exclut `/merci` et les pages légales
  **dans les deux langues**. Menu et pied de page passent tous leurs liens par `localePath`.
- **La mention « livraison France » s'affiche enfin**, au-dessus du bouton d'achat, sur les DEUX
  versions de la page produit. Elle n'était nulle part. Sur le français aussi : le checkout
  n'accepte que le code pays `FR`, ce qui exclut la Belgique, la Suisse et les DOM-TOM — un
  francophone n'a pas plus de raison qu'un anglophone de le deviner.
- **Vérifié en navigateur** : les 11 routes anglaises sans un mot de français ; les 11 routes
  françaises intactes ; les prix au bon format de chaque côté (10 montants `21,99 €` sur
  `/leurre`, 10 montants `€21.99` sur `/en/leurre`).
- **Gate** : tsc ✅ eslint ✅ vitest 182 passés (+31 sautés) ✅ build ✅, depuis Windows.
- **Reste ouvert** : l'email de confirmation part toujours en français (décision assumée, à
  rouvrir maintenant qu'on vend en anglais) ; le soft 404 de `/en/<inconnu>` (HTTP 200 au lieu de
  404) ; la page 404 anglaise qui ramène à l'accueil français ; et la description du JSON-LD
  produit, française sur les deux versions.

## 2026-08-25 — Audit complet de la version anglaise : 69 failles, les 6 plus visibles corrigées

Signalement Camil : « tous les onglets ne sont pas forcément disponibles, la page contact est en
not found, certains mots comme Truite ne sont pas traduits et deviennent Troot. » Les trois
symptômes ont été **reproduits sur le serveur réel** avant d'auditer.

Audit à cinq lentilles (navigation, français résiduel, traduction automatique, SEO, parcours
d'achat) : **69 failles**, dont 11 bloquantes. Verdict : **la version anglaise n'est pas publiable
en l'état.**

**Corrigé (vérifié en navigateur, HTML servi) :**

- **Le sélecteur de langue fabriquait des pages introuvables sur 11 des 13 pages.** Il construisait
  `/en/<chemin courant>` sans jamais vérifier que la page existe en anglais : passer en anglais
  depuis `/contact` menait à « Page introuvable ». C'est exactement ce que Camil a vu. Nouvelle
  source unique `TRANSLATED_PATHS` dans `paths.ts` (les routes réellement présentes sous
  `src/app/[lang]/`), et `localePathOrHome()` qui replie sur l'accueil de la langue **en le
  disant** (clé `LANG.NO_TRANSLATION`, en `title`) plutôt que de mener à un mur. Deux tests le
  verrouillent, dont un qui compare la liste aux dossiers réels de `src/app/[lang]/`.
- **« Truite » devenait « Trout ».** Ce n'est pas le site qui traduit mal, c'est le navigateur :
  aucun `translate="no"` n'existait dans tout le projet, et les noms propres du produit sont
  français dans les deux langues **par décision** (ils doivent correspondre au reçu Stripe et à
  l'email). Chrome les traduisait donc à l'écran, et l'acheteur recevait un article dont il n'avait
  jamais vu le nom. 11 emplacements protégés (carrousel, fiche, BuyBox).
- **Le délai de livraison s'affichait en français dans une phrase anglaise** : « Delivery 10 à 20
  jours ouvrés, shipping included. » `PRODUCT.deliveryDelay` est une chaîne française en dur, alors
  que sa traduction `PRODUCT.DELAY_VALUE` existait depuis toujours sans être lue par le carrousel.
- **Les montants étaient ponctués à la française sur la page anglaise** : « 21,99 € » au lieu de
  « €21.99 ». `formatEuros()` prend désormais la langue en paramètre (français par défaut, pour que
  les emails, le reçu Stripe et les pages légales restent inchangés). La FAQ anglaise était touchée
  par le même défaut.
- **Un acheteur anglophone n'avait AUCUN lien vers le suivi de commande.** Le menu anglais avait 3
  entrées contre 5 en français, alors que les libellés anglais (`NAV.ABOUT`, `NAV.TRACKING`)
  existaient déjà. Menu et pied de page passent à 5 entrées dans les deux langues.

**Non corrigé, et ce sont des décisions produit** : la page produit, le paiement Stripe
(`locale: 'fr'` figé) et l'email de confirmation restent français ; 11 URL `/en/*` répondent
HTTP 200 en affichant « page introuvable » (soft 404) ; la page 404 anglaise ramène à l'accueil
français ; et `SHIPPING_NOTICE` n'est toujours affichée nulle part.

**Gate** : tsc ✅ eslint ✅ vitest 181 passés (+31 sautés) ✅ build ✅, depuis Windows.

Fichiers : `src/lib/i18n/paths.ts`, `chrome.ts`, `src/components/sections/LangSwitcher.tsx`,
`SiteHeader.tsx`, `SiteFooter.tsx`, `src/lib/shop/product.ts`, `src/lib/faq.ts`,
`src/components/sections/home/LureCarousel.tsx`, `carousel-strings.ts`,
`src/components/sections/leurre/BuyBox.tsx`, `src/lib/i18n.test.ts`, `docs/i18n/{fr,en}.md`.

## 2026-08-25 — Le panier du carrousel 3D, livré ; et le hero cesse d'être français sur `/en`

Deux consignes Camil, traitées ensemble parce qu'elles se rejoignaient : « mets en place un
affichage concret pour pouvoir ajouter, retirer du panier et avoir un vrai panier à cliquer et à
consulter », et « pour le mode anglais et français, tout ne se traduit pas ».

**Le constat qui liait les deux, mesuré par un audit à quatre lentilles (72 constats)** : le
composant `LureCarousel` ne recevait **aucune prop**. Étant `'use client'`, il ne pouvait pas lire
le dictionnaire — donc TOUT le hero, boutons d'achat compris, était condamné au français, y compris
sur `/en`. C'était la cause racine, pas un oubli de traduction.

- **Le panier est un ENSEMBLE de coloris distincts**, plus un compteur à doublons
  (`collection-selection.ts` réécrit). Un coloris y est ou n'y est pas. La raison est une question
  d'honnêteté, pas d'ergonomie : l'offre groupée expédie « les 3 coloris » par construction, donc
  composer trois fois Truite arc-en-ciel et lire « 3 achetés, votre 4e est offert » promettait un
  colis qui n'existe pas. `toggleColorway` est désormais l'unique mutation, et un état illégal
  (doublon, 4e coloris) est **irreprésentable** au lieu d'être surveillé.
- **La rangée des 4 cases** remplace les puces de navigation : les 3 coloris payés + le 4e offert,
  chacun avec son nom, son prix ou son état. Elle navigue ET montre le colis. Les deux sorties
  (« Commander les 4 leurres », « Commander … seul ») ne disparaissent plus **dans aucun état** —
  c'était le défaut le plus grave : à 2 leurres au panier, plus **aucun** bouton ne menait au
  paiement.
- **Corrigé aussi** : l'auto-avance qui faisait disparaître le leurre qu'on venait d'ajouter ;
  « Acheter » qui achetait `selection[0]` et non le leurre affiché ; le retrait impossible au
  clavier ; et le panier jamais vidé après paiement (`ClearCartOnThanks` sur `/merci`).
- **Le hero parle enfin la langue de sa page.** 21 clés `CART.*` créées en FR **et** EN, plus le
  branchement de clés qui existaient depuis toujours sans être lues : `HOME.PREV`, `HOME.NEXT`,
  `HOME.LOADING`, `HOME.NO_WEBGL`, `HOME.MODEL_FAILED`, `HOME.VIEWS_LABEL`, les 6 angles de vue et
  leurs descriptions, `HOME.MODEL_ALT`. Une clé `HOME.FRAMES_FAILED` ajoutée. 165 clés par langue.
- **Le mécanisme** : `carouselStrings(locale)` prépare tout côté serveur (`chrome.ts`) et le passe
  en props ; `fill()` (nouveau module pur) remplit les `{placeholders}` côté client sans embarquer
  un seul dictionnaire dans le bundle. C'est le patron à réutiliser pour tout composant client.
- **Vérifié en navigateur réel**, serveur dev Windows, HTML servi : `/` rend « Ajouter »,
  « Commander les 4 », « Vider le panier », « coloris sur » ; `/en` rend « Add », « Order all 4 »,
  « Empty the cart », « colours of ». **Zéro occurrence de « Chargement » sur `/en`** (il en
  restait deux, dans deux chargeurs distincts de `HeroScroll`).
- **Gate** : tsc ✅ eslint ✅ vitest 179 passés (+31 sautés) ✅ build ✅, tout depuis Windows.
- **Reste ouvert** (spec `docs/specs/carrousel-achat.md`, T7 et T8) : `inert` sur le hero pendant
  le fondu (les boutons restent focusables alors qu'ils sont invisibles), et la fermeture de
  l'offre groupée en rupture de stock, côté UI **et** côté `/api/checkout`, qui ne valide
  aujourd'hui que le coloris décoratif et jamais les trois leurres réellement facturés.

Fichiers : `src/lib/shop/collection-selection.ts` (réécrit) et son test, `src/lib/shop/product.ts`
(`shortLabel`), `src/components/sections/home/LureCarousel.tsx`, `carousel-strings.ts` (nouveau),
`ClearCartOnThanks.tsx` (nouveau), `Hero.tsx`, `HeroScroll.tsx`, `use-collection-selection.ts`,
`src/lib/i18n/fill.ts` (nouveau), `chrome.ts`, `index.ts`, `docs/i18n/{fr,en}.md`.

## 2026-08-25 — Deux langues au lieu de cinq ; la parité anglaise devient une règle tenue par les tests

Consigne Camil : « mets à jour le mode Français et Anglais, c'est les deux seules langues dans
lesquelles le site doit être disponible […] dès que quelque chose est mis à jour textuellement,
tout doit être mis à jour sur le mode anglais, donc oblige ça dans les règles de projet. »

- **Espagnol, allemand et néerlandais retirés.** `docs/i18n/{es,de,nl}.md` supprimés,
  `LOCALES = ['fr', 'en']`, dictionnaires régénérés (143 clés par langue, contre 146 : les clés
  `LANG.ES/DE/NL` du sélecteur n'avaient plus d'objet). **Ordre non négociable, et c'est ce qui a
  rendu le changement sûr** : supprimer les sources → `npm run i18n` → *puis* réduire `LOCALES`.
  Dans ce sens, un résidu devient une erreur TypeScript ; dans l'autre, tout reste vert et trois
  dictionnaires morts partent en production sans un mot.
- **Mesuré après coup** : sitemap 14 → **8** entrées, `hreflang` 6 → **3** balises
  (`fr`, `en`, `x-default`), routes bâties `/en` et `/en/faq` seulement.
- **Redirections posées** (`next.config.ts`) : `/es`, `/de`, `/nl` et leurs sous-chemins → `/`.
  En **307, pas en 308** : un 308 se met en cache sans expiration, et une langue qui reviendrait
  un jour serait inatteignable pour ceux qui l'ont vu. Destination = la racine française, pas
  l'anglais : un visiteur venu de `/de/faq` n'a pas demandé l'anglais, et l'accueil porte le
  sélecteur. Ces URL n'ont jamais existé en production (le domaine n'est pas acheté) **mais
  répondaient 200 sur la préversion publique `alure-beta.vercel.app`, sans `X-Robots-Tag`** —
  vérifié ce jour, d'où la redirection plutôt qu'un 404.
- **`NUMBER_LOCALES` typée `Record<Locale, string>`** (`product.ts`) et son repli `?? 'fr-FR'`
  supprimé : c'était la seule duplication de la liste des langues hors du module i18n, et le repli
  aurait rendu « 6,5 » ponctué en français pour toute langue ajoutée, sans rien signaler.
  Ajouter une langue casse désormais le build, et c'est le but.
- **La règle est gravée et exécutable.** `CLAUDE.md` reçoit la **règle Alure n°6** (deux langues ;
  tout texte visible part dans `fr.md`, `en.md` et le dictionnaire régénéré **dans le même
  commit** ; aucune chaîne en dur dans un composant servi sous `/[lang]`). La règle n°1 reçoit la
  mention « livraison France, dite aussi en anglais ». `src/lib/i18n.test.ts` est durci :
  il ne connaissait que `docs/i18n/` et **jamais `LOCALES`** — on pouvait donc ajouter un fichier
  de langue sans l'inscrire dans le code, ou l'inverse. Quatre assertions ajoutées : périmètre
  exact, correspondance sources ↔ `LOCALES`, absence de clé `LANG.*` orpheline, convention
  décimale pour chaque langue servie.
- **Vérifié depuis Windows** : tsc ✅ eslint ✅ vitest 162 passés (+31 sautés) ✅ build ✅.
  Les 15 tests en moins sont les cas par langue des trois langues retirées.
- **Reste ouvert, et c'est la dette la plus gênante** : `SHIPPING_NOTICE.TITLE/BODY` existent dans
  les deux dictionnaires et **ne sont affichées nulle part**. Or c'est la contrepartie explicite de
  la version anglaise (`docs/i18n/README.md` §0) : sans elle, un visiteur anglophone n'a aucune
  raison de deviner qu'on ne livre qu'en France, et il le découvre au refus d'adresse, après avoir
  payé. Voir aussi : la FAQ anglaise renvoie vers `/leurre`, page française, et les boutons du
  carrousel 3D sont en français en dur y compris sur `/en`.

Fichiers : `src/lib/i18n/paths.ts`, `src/lib/i18n/index.ts`, `src/lib/i18n/dictionaries.gen.ts`,
`src/lib/i18n.test.ts`, `src/lib/shop/product.ts`, `next.config.ts`, `docs/i18n/` (3 fichiers
supprimés, README réécrit), `CLAUDE.md`, `docs/ROADMAP.md`.

## 2026-08-25 — Le carrousel 3D repensé pour l'achat : la spec

Consigne Camil : rendre la zone du carrousel « le plus explicite possible à l'achat » — voir
combien de leurres, lesquels, en ajouter et en retirer vite.

Brainstorm mené en orchestration multi-agents (5 lentilles de diagnostic, 3 directions
concurrentes, 3 juges, une synthèse) : **60 constats**, dont 13 bloquants ou majeurs, tous ancrés
fichier:ligne. La spec est dans **`docs/specs/carrousel-achat.md`** (statut `brouillon`, à valider).

Les cinq défauts qui justifient le chantier, vérifiés dans `LureCarousel.tsx` :

1. **À 2 leurres au panier, plus AUCUN bouton ne mène au paiement** (`:451-456`) — le visiteur
   conclut que le site est cassé.
2. **« Acheter · 21,99 € » n'achète pas le leurre affiché** (`:454-455`) mais `selection[0]`,
   pendant que le nom du leurre à l'écran est imprimé juste au-dessus.
3. **Le panier ne montre jamais son contenu** : `selection` n'est jamais parcourue.
4. **Retirer un leurre est impossible au clavier** : le seul chemin passe par un geste pointeur.
5. **Le clic « Ajouter » fait pivoter le carrousel** vers un autre leurre, sans aucune confirmation.

Plus deux défauts de portée : **le panier n'est jamais vidé après paiement** (le hero réaffiche
« Commander les 4 » à quelqu'un qui vient de payer), et les boutons **restent focusables pendant
le fondu** du hero (`pointer-events: none` ne retire pas de l'ordre de tabulation).

Décision de fond proposée, et elle demande l'arbitrage de Camil : **le panier devient un ensemble
de coloris DISTINCTS**. Aujourd'hui les doublons sont permis et testés, alors que l'offre groupée
expédie « les 3 coloris » : composer trois fois Truite, payer 65,97 € et recevoir trois coloris
différents, c'est le litige type. Corollaire assumé : une rupture de stock **ferme** l'offre
groupée.

## 2026-08-25 — Régression d'environnement réparée : un `node_modules` ne sert qu'UN système

Signalée par Camil : `Build Error — Cannot find module '../lightningcss.win32-x64-msvc.node'` à la
compilation de `src/app/globals.css`, donc sur toutes les pages.

**Cause : le `npm install` lancé depuis WSL le 2026-08-21.** Le projet vit sur `/mnt/d`, visible
des deux systèmes, mais `node_modules` non : Next (SWC), Tailwind (oxide), lightningcss, rolldown
et sharp embarquent des binaires `.node` par plateforme, en dépendances optionnelles. `npm install`
n'installe que ceux de la plateforme courante **et supprime les autres**. Les cinq paquets
`*-win32-x64-msvc` avaient donc disparu. `--no-save` n'y change rien : il protège `package.json` et
`package-lock.json`, pas les binaires.

- **Réparé** : `npm install` relancé **depuis Windows** (les 5 paquets win32 rétablis, lockfile
  inchangé), puis `.next` purgé — ses chunks compilés gardaient les chemins Linux.
- **Vérifié depuis Windows**, c'est-à-dire dans l'environnement réel : `require('lightningcss')` et
  `require('@tailwindcss/postcss')` OK, `npm run build` vert (toutes les routes rendues),
  `npm run test` 177 passés + 31 sautés.
- **Règle posée** (`docs/standards/WEB-REFERENCE.md`) : on choisit UN système et toutes les
  commandes `npm` en partent. Contrepartie assumée : `npm run test` et `npm run dev` se lancent
  désormais **depuis Windows**, plus depuis WSL.

Fichiers : `docs/standards/WEB-REFERENCE.md`, `node_modules/` (non versionné).

## 2026-08-21 — Campagne de recette du parcours d'achat ; les 9 gabarits d'email ; 3 blocages de mise en ligne trouvés

Consigne Camil : « fais des tests de tout ce qu'il est possible de faire sur le site, payer un
leurre, deux, 3, vérifier le reçu, générer les envois de mail avec Resend […] génère un fichier
.md pour chaque mail à envoyer ».

**Précision d'offre** : il n'existe pas d'achat « 2 leurres » ni « 3 leurres ». Le site vend
**deux** paliers — un leurre à 21,99 €, ou « 3 achetés, le 4e offert » à 65,97 €. La campagne
teste donc ces deux-là, avec les 3 coloris et les 4 choix de 4e leurre offert.

- **Campagne de recette** (`src/test/campagne-paiement.test.ts`) : 31 cas en conditions réelles —
  signature Stripe vérifiée cryptographiquement (HMAC local : corps falsifié, secret étranger,
  horodatage rejoué → tous refusés), 6 branches du webhook, 5 achats payés avec **envois Resend
  réels**, idempotence par rejeu, 8 cas d'erreur de `/api/checkout`, rate-limit (429 à la 11e
  requête, confirmé). **Gardée derrière `CAMPAGNE_REELLE=1`** — sans ça `npm run test` la saute,
  car elle envoie de vrais emails. Se relance avec
  `CAMPAGNE_REELLE=1 npx vitest run src/test/campagne-paiement.test.ts`.
- **Reçu vérifié ligne à ligne** : solo → 1 × 21,99 € ; collection → 3 × 21,99 € **plus** le 4e
  offert en ligne à 0,00 € portant son libellé choisi. L'invariant « somme des lignes =
  `totalCents()` » tient pour les 4 choix de cadeau. Le collector Pirate n'entre dans aucun
  montant.
- **Les 9 gabarits d'email** (`docs/emails/`) : 3 automatiques (confirmation, notification
  vendeur, formulaire de contact) et 6 à envoyer à la main (expédition/suivi, retard, coloris
  épuisé, rétractation, remboursement, paiement non abouti). Chacun donne l'objet, le corps prêt
  à copier, les variables, et ce que l'email ne doit jamais dire.
- **Trois blocages de mise en ligne** (aucun n'est un bug de code) :
  1. `STRIPE_SECRET_KEY` est une clé **restreinte et expirée** (`rkcs_test_…`, issue du connecteur
     MCP). Toute création de session échoue en 500. Le paiement est à l'arrêt tant qu'une vraie
     `sk_test_…` n'est pas remise.
  2. **Resend n'a aucun domaine vérifié** : depuis `onboarding@resend.dev`, l'API refuse en 403
     tout destinataire autre que `alure.pounio@gmail.com`. En l'état, **aucun client réel ne
     recevrait sa confirmation** — le webhook partirait en 500 et Stripe re-livrerait en boucle.
  3. `src/lib/legal-config.ts` porte encore ses `À COMPLÉTER` (adresse du siège, email de contact,
     adresse de retour). Ces valeurs sont **affichées telles quelles** sur `/retractation`,
     `/cgv` et `/mentions-legales`.
- **Corrigé en passant** : `ORDER_NOTIFICATIONS_EMAIL` était **vide** dans `.env.local` — la
  notification vendeur échouait, donc le webhook renvoyait 500 après avoir envoyé la confirmation
  client, et Stripe re-livrant, le client recevait des confirmations en double. Renseignée.
  `next.config.ts` reçoit `turbopack: { root: process.cwd() }` : un `package-lock.json` traîne
  dans `D:\Claude_PROJETS`, Turbopack en déduisait une racine hors dépôt et `next dev` mourait sur
  « IO error … lockfile ». Enfin, `@rolldown/binding-linux-x64-gnu` installé en `--no-save` pour
  faire démarrer vitest sous WSL — **ce dernier geste a cassé le build Windows, cf. entrée du
  2026-08-25.**
- **Vérifié** : tsc ✅ eslint ✅ vitest 177 passés (+31 sautés) ✅ build ✅.
- Reste ouvert : rejouer la campagne avec une clé Stripe valide pour couvrir ce que la clé morte
  interdit — vraie session, paiement 4242, événement signé par Stripe, marqueur d'idempotence posé
  sur le PaymentIntent. Et **écrire l'email d'expédition**, aujourd'hui promis au client par la
  confirmation mais envoyé par personne.

Fichiers : `src/test/campagne-paiement.test.ts` (nouveau), `docs/emails/` (10 fichiers, nouveau),
`next.config.ts`, `.env.local` (non versionné), `docs/ROADMAP.md`.

## 2026-08-20 — La frise disparaît ; deux boutons (« Ajouter au panier » + « Acheter ») sur les leurres 3D

Consigne Camil : « supprime la frise dans la page d'accueil, fais un bouton ajouter au panier
ainsi que Acheter, visible directement depuis la page des leurres 3D ».

- **Frise supprimée** : `CollectionStrip.tsx` effacé, plus aucun rail de points sous le header.
  La spec `docs/specs/frise-collection.md` passe au statut `retirée` (historique conservé). Le
  panier-compteur (`use-collection-selection`, `collection-selection.ts`, `freebiesUnlocked` et
  ses tests) reste intact — seule la REPRÉSENTATION disparaît.
- **`SmartCartButton` → `CartActions`** (`LureCarousel.tsx`) : les DEUX boutons toujours
  visibles sous les leurres 3D, plus une ligne de statut (aria-live) qui reprend le message de
  la frise. États : coloris achetable → « Ajouter au panier » (ajoute + avance l'entonnoir,
  inchangé) + « Acheter · 21,99 € » (ghost) ; à 0 « Acheter » vend le leurre AFFICHÉ, à 1 celui
  du panier ; à 2 il disparaît (il n'existe pas d'offre à 2 leurres — la ligne pousse le 3e) ;
  à 3 CTA unique « Commander les 4 · 65,97 € » ; Pirate/épuisé → « Offert dès 3 achetés —
  choisir ». Montants et seuils toujours dérivés d'`OFFERS` — rien en dur.
- **Vérifié** : tsc ✅ eslint ✅ vitest 177 ✅ build ✅ + parcours réel (playwright-core + Chrome
  local) : frise absente, 2 boutons à 0/1, 1 seul à 2, « Commander les 4 » à 3, clic →
  `/leurre?offre=collection&coloris=…` avec le sélecteur du 4e offert, mobile 375 px sans
  chevauchement. ⚠️ Incident d'environnement en cours de session : le serveur dev hérité
  (PID 29132) a saturé la mémoire (postcss crashé, GET / en 500 permanent) — tué, cache
  `.next/dev` purgé, serveur relancé. Rien à voir avec le code.
- Reste ouvert (ROADMAP Phase 2.5) : l'i18n de ces boutons (FR en dur, comme avant).

Fichiers : `src/components/sections/home/LureCarousel.tsx` (CartActions),
`src/components/sections/home/CollectionStrip.tsx` (supprimé), `docs/specs/frise-collection.md`,
`docs/ROADMAP.md`.

## 2026-08-17 — Roadmap technique de mise en ligne : Cloudflare (domaine + DNS) × Vercel

Décision Camil : le nom de domaine s'achète et se gère chez **Cloudflare** (registrar + DNS),
l'hébergement reste sur **Vercel**. `docs/ROADMAP.md` réécrite en conséquence :

- Nouvelle **Phase 2.5 (reste applicatif)** : réconciliation des branches (`lot9-conversion`
  poussée, `lot8-splash-carrousel` locale), sort du compteur débranché, i18n de la nouvelle
  offre sur l'accueil (frise/bouton en FR dur), visuel produit du Pirate, tests E2E paiement à
  rejouer (le parcours a changé : 65,97 €, champ `cadeau`).
- **LOT 4 détaillé en 3 volets** : (a) domaine & DNS — Cloudflare en DNS-only (nuage gris,
  proxy OFF : Vercel est déjà le CDN/TLS, on n'empile pas), apex A `76.76.21.21` / `www` CNAME
  `cname.vercel-dns.com`, SPF/DKIM Resend + DMARC dans la zone, Email Routing pour
  `contact@` ; (b) paiement/emails prod — 4 variables d'env Vercel, webhook Stripe abonné aux
  3 événements, PayPal au dashboard, achat réel de bout en bout, identité vendeur
  (`legal-config.ts`, lève le noindex des pages légales) ; (c) qualité — 6 audits, Lighthouse
  mobile ≥ 90, OG, Search Console, Vercel Analytics (CSP dans le même commit si script).
- La décision DA « domaine » passe à moitié tranchée : l'INFRA est décidée, le NOM reste à
  choisir parmi les candidats vérifiés libres (alure-peche.fr…).

Fichiers : `docs/ROADMAP.md` (Phase 2.5 + LOT 4 réécrits), ce journal.

Consignes Camil du jour : supprimer le bloc « OFFERT » du Pirate, supprimer le bandeau
« Objectif de lancement », et refondre l'offre : « 3 leurres achetés, le 4e offert au choix ».

- **L'OFFRE CHANGE DE BARÈME** (pas qu'un discours cette fois) : palier 2 = **65,97 €**
  (3 × 21,99 €) pour 4 leurres, et l'acheteur **choisit son 4e offert** — un coloris (même en
  double) ou le Pirate. Domaine : `Offer.{paidCount:3, giftCount:1}` (le booléen `collector`
  disparaît), `GIFT_CHOICE_IDS`/`giftLabel`/`giftOrderableError`, `collector.id = 'pirate'`.
  `savingsCents('collection')` retombe à 0 : l'avantage est le CADEAU, pas une remise — la
  ligne « Vous économisez » disparaît d'elle-même (jamais une fausse économie). Prix par
  leurre : « moins de 17,00 € » (arrondi supérieur, comme avant).
- **Le choix du cadeau voyage jusqu'au bout** : champ `cadeau` au schéma partagé (obligatoire
  en offre groupée — superRefine ; l'objet nu reste exposé pour `parsePreselection`), garde
  de disponibilité dans /api/checkout (`giftOrderableError`), métadonnée Stripe, ligne de
  reçu nommée (« 4e offert — Pirate » à 0,00 €, invariant somme=total testé), relu par le
  webhook pour l'email (`offerSummary(offre, coloris, cadeau)`). Sélecteur dans la BuyBox :
  3 vignettes coloris + tuile Pirate (icône Skull, fond sombre), défaut = Pirate ;
  `cadeau` dans le contexte coloris, envoyé au submit.
- **Frise & bouton unique recalés** : 3 jalons « achetés » + le jalon cadeau (au choix) ;
  résolution 1 → solo, 3 → offre complète — il n'existe PAS d'offre à 2 leurres : à 2, le
  bouton pousse le 3e (« Encore 1 — le 4e sera offert »), et le solo direct n'est proposé
  qu'à exactement 1 (lien secondaire sous « Ajouter »). CTA final « Commander les 4 ·
  65,97 € ». Vérifié au vrai clic : 0 → +1 → +2 → +3 → /leurre présélectionné avec le
  sélecteur du cadeau.
- **Supprimé** : le bloc « OFFERT » du collector (le Pirate se montre nu — la frise et le
  bouton racontent l'offre) et le bandeau « Objectif de lancement » (retiré de l'accueil et
  de /leurre). ⚠️ L'infrastructure du compteur (OrdersBanner.tsx, orders-count.ts,
  milestones.ts, revalidation webhook — no-op) reste en place, DÉBRANCHÉE : à re-brancher ou
  à supprimer selon la décision de Camil au moment des commits.
- **Copies réalignées partout** : OfferPanel, OfferProgress (4 étapes), fiche 3D du Pirate,
  CGV (« un quatrième leurre, au choix de l'acheteur… remis gracieusement »), à-propos,
  métadonnées /leurre, FAQ, et les **5 dictionnaires** (`npm run i18n` relancé).
- **Gate** : tsc ✅ eslint ✅ **vitest 177 ✅** (les montants en dur du test — garde-fou voulu —
  revus : 6597, « 65,97 », économies nulles, seuils à 3, `cadeau` requis) build ✅ + captures
  réelles (entonnoir 3 clics, Pirate sans panneau, /leurre avec sélecteur du cadeau).

## 2026-08-13 — LOT 9 (suite) : l'offre devient « 2 achetés, 2 offerts », frise en points

Consigne Camil : « fais une frise avec des points, beaucoup plus fine et beaucoup plus
grande ; on revoit l'offre avec 2 achetés 2 offerts, chaque leurre est servi individuellement ».

- **L'offre reformulée « 2 achetés, 2 offerts »** — le BARÈME ne bouge pas d'un centime
  (43,98 € = 2 × 21,99 €), c'est le discours qui change : chaque leurre se vend À L'UNITÉ
  (21,99 €), et dès 2 achetés le 3e coloris + le Pirate sont OFFERTS. Conséquence forte :
  le Pirate se débloque désormais « dès 2 leurres achetés » (plus « les 3 réunis ») — mis à
  jour PARTOUT : `product.ts` (label d'offre, `paidCount`, tagline, `offerSummary`,
  `checkoutLines` — le reçu Stripe affiche maintenant 2 × l'unité + 2 lignes offertes à
  0,00 €, invariant somme=total testé), `OfferProgress` (3 étapes réécrites), `BuyBox`,
  `OfferPanel`, overlay + fiche du collector (carrousel, `lure-models.ts`), CGV, à-propos,
  métadonnées /leurre, et les **5 dictionnaires** (`docs/i18n/*.md`, 14 clés par langue,
  `npm run i18n` relancé). `freebiesUnlocked()` (seuil dérivé de `paidCount`, jamais un
  chiffre local) remplace `isCollectionComplete()`.
- **Frise en POINTS, fine et large** (itération Camil) : `CollectionStrip` redessinée — une
  seule rangée pill (`rounded-full`, ~40 px de haut, jusqu'à 52 rem de large) : 3 points
  ronds (vrais rendus des coloris) reliés par un trait, le point Pirate (cadenas → check au
  déblocage, dès 2 au panier le coloris manquant s'allume aussi « offert »), message d'une
  ligne, CTA « Les 4 leurres · 43,98 € ». Mobile : rail sur sa ligne, message dessous.
- **Le panier devient un COMPTEUR** (itération Camil : « un leurre quelconque à chaque fois
  suffit ») : plus de suivi par coloris — n'importe quel leurre ajouté (même deux fois le
  même) fait avancer la frise ; à 1 le solo garde le coloris du 1er ajout, à 2 c'est l'offre
  complète quoi qu'il arrive. `sanitizeSelection` garde les doublons et borne à `paidCount` ;
  le hook expose `add`/`removeOne` (fini le toggle). Jalons de la frise NEUTRES : « 1 », « 2 »
  (checks), cadeau (3ᵉ coloris), Pirate — plus aucune vignette de coloris spécifique.
- **Frise remontée** (`top-16`/`md:top-18`, juste sous le header) ; **panneau « Offert » du
  Pirate retiré au premier clic** sur le leurre (state `collectorIntroSeen` — le clic suivant
  ouvre la fiche) ; **contrôles du bas compactés** : variante `.px-seg--sm` du segmented
  (globals.css), flèches `!h-8`, bouton en taille `md`, interlignes resserrés.
- **Le bouton unique de l'entonnoir** (itération Camil : « un bouton, beaucoup d'actions ») :
  `SmartCartButton` dans le carrousel — toujours visible, UN état par moment, jamais deux
  choix : leurre affiché pas pris → « Ajouter · 21,99 € » (ajoute, allume la frise, AVANCE
  tout seul vers le coloris suivant, puis saute sur le Pirate au 2e ajout) ; panier non vide
  → « Commander · 21,99 € » / « Commander les 4 · 43,98 € » (→ /leurre présélectionné) ;
  Pirate verrouillé panier vide → « Offert dès 2 achetés — choisir ». Le CTA sort de la
  frise (elle devient pure statut, encore plus fine) ; le retrait reste dans la fiche.
  L'encart collector passe cadenas → check avec le texte vrai dès le déblocage.
  Entonnoir complet vérifié au vrai clic : 2 clics = tout allumé + « Commander les 4 ».
- **Vérifié** : tsc ✅ eslint ✅ vitest 174 ✅ build ✅ + captures réelles desktop/mobile via
  **playwright-core + Chrome local** (voie fiable du journal — le daemon browse gstack
  restait instable) : frise fine et large, fiche + « Ajouter au panier » SOUS la frise au
  vrai clic, zéro chevauchement, console propre.

## 2026-08-12 — LOT 9 (branche `lot9-conversion`) : Pirate, frise panier, bandeau objectif, offre pleine largeur

Contexte de branches : `main` a été ramené à l'état déployé sur Vercel (bb00028) ; le travail
splash/carrousel vit sur `lot8-splash-carrousel` ; ce lot vit sur `lot9-conversion` (créée
depuis main), qui reprend par cherry-pick le logo de chargement de lot8 (SplashScreen +
AlureLoader) et l'étend au carrousel 3D (progression réelle des modèles, `onProgress` dans
`lure-stage.ts`).

- **Le collector s'appelle « Pirate »** (décision Camil). Une ligne changée
  (`PRODUCT.collector.label`) — le nom se propage : site, reçus Stripe, emails, dictionnaires
  (placeholder `{collector}`), plus la description 3D (`lure-models.ts`) et l'overlay du
  carrousel.
- **Frise « collection » + panier de sélection** (spec `frise-collection.md`, livrée) : au-dessus
  des leurres 3D du hero, 4 jalons (3 coloris + Pirate cadenassé), synchronisée avec le
  carrousel. Bouton « Ajouter au panier » après les specs de la fiche (`LureSpecs` footer) —
  la frise s'allume aussitôt. La sélection résout TOUJOURS vers une offre réelle : 1 → solo,
  2+ → collection (2 solos = le prix des 3, on l'affiche, on ne le vend pas). Persistance
  sessionStorage via `useSyncExternalStore` (`use-collection-selection.ts`) — la nouvelle règle
  ESLint `react-hooks/set-state-in-effect` interdit l'hydratation par `setState` dans un effet,
  et c'est le bon outil. CTA → `/leurre?offre=…&coloris=…`, présélection validée par le schéma
  partagé (`parsePreselection`, coloris épuisé écarté) ; la page passe en rendu dynamique
  (searchParams serveur, choix assumé vs Suspense client qui viderait la page).
- **Bandeau « objectif de lancement »** (spec `bandeau-objectif-commandes.md`, livrée) : compteur
  RÉEL de commandes payées lu chez Stripe (`countPaidOrders()` dans `stripe.ts`, sessions
  `complete` non-`unpaid`), cache taggé `orders-count` (`unstable_cache`, 1 h de fraîcheur max),
  invalidé par le webhook après chaque commande traitée (`revalidateOrdersCount()` — Next 16 :
  `revalidateTag(tag, 'max')`, le profil est obligatoire). Échelle 5→10→30→50→100→250→500→1000
  (`milestones.ts`). Stripe injoignable → bandeau absent + log, jamais un chiffre faux. Affiché
  accueil (sous le hero, ISR 1 h) + tête de /leurre. Vérifié en vrai : il affiche « 1 commande
  sur un objectif de 5 » — la session de test payée de l'audit du 10/08.
- **Page de vente pleine largeur** (consigne Camil) : `BuyBox` scindée — prix + coloris restent
  en colonne, le reste (« Votre offre », progression, Acheter, moyens de paiement, réassurance)
  passe en pleine largeur (`OfferPanel.tsx`). L'état de paiement est partagé par
  `checkout-context.tsx` (statut unique, un seul `submit`) ; réassurance en 3 colonnes desktop.
- **Itération Camil (midi)** : frise compactée (pastilles 32 px, CTA dans la rangée, texte xs)
  et — surtout — frise + fiche technique déplacées dans la MÊME colonne de flux
  (`top-20`, `flex-col`) : la fiche s'ouvre SOUS la frise, le chevauchement est impossible
  par construction. L'overlay collector descend de 80 px (`pt-40`) pour la même raison.
  Vérifié en capture 375 px : frise, fiche complète avec « Ajouter au panier », contrôles du
  bas — rien ne se touche.
- **Gate** : tsc ✅ eslint ✅ vitest 172 ✅ (18 nouveaux : résolution panier, présélection,
  paliers, comptage, revalidation webhook) build ✅. Navigateur : accueil + /leurre vérifiés
  (SSR + captures desktop/375px, console propre) ; le clic fiche→bouton n'a pas pu être simulé
  en headless (WebGL trop lent), à vérifier à l'œil.
- **Dette notée** : bandeau et frise en français uniquement (comme le carrousel) — à porter dans
  les dictionnaires si les pages [lang] doivent les montrer. Un remboursement ne décrémente pas
  le compteur (formulation « commandes passées » choisie pour rester vraie).

Fichiers clés : `src/lib/shop/{product,milestones,orders-count,collection-selection,checkout-schema,stripe}.ts`,
`src/components/sections/home/{CollectionStrip,use-collection-selection,LureCarousel,LureSpecs,lure-stage}.tsx|ts`,
`src/components/sections/leurre/{OfferPanel,checkout-context,BuyBox,colorway-context}.tsx`,
`src/components/sections/OrdersBanner.tsx`, `src/app/(fr)/{page,leurre/page}.tsx`,
`src/app/api/stripe-webhook/route.ts`, specs `docs/specs/{frise-collection,bandeau-objectif-commandes}.md`.

## 2026-08-09 (soir) — Leurres 3D ×2 sur téléphone, captures refaites, filigrane retiré

- **Filigrane du générateur retiré** (demande Camil : « je veux plus le logo gemini en bas à
  droite »). L'étoile ✦ statique (~x1160 y600) n'existait QUE dans la boucle du décor
  (`backdrop.mp4`) et dans `marque-scene.webp` — `hero.mp4` vérifié propre sur 4 instants,
  les captures produit le rognent hors cadre. Vidéo : `delogo` ciblé ajouté au pipeline
  (`hero-mobile.mjs` partie 2, avant la rustine leurre et le flou) → `backdrop-clean.mp4` et
  son poster régénérés propres. Image : texture de feuillage clonée par-dessus (sharp),
  bords fondus. Vérifié au navigateur 16:9 : plus d'étoile derrière les leurres.

- **Leurre 3D deux fois plus grand en portrait** (demande Camil) : `PORTRAIT_ZOOM = 2` dans
  `lure-stage.ts` — la caméra s'approche (jamais l'échelle du modèle, la nage est une fraction
  de la longueur du corps). Le leurre passe de ~40 % à ~81 % de la largeur d'écran, tient
  entier, les voisins sortent du cadre. Le viewer produit (`aspect-square`, ratio 1) n'est
  pas concerné par la branche `aspect < 1`.
- **Captures produit régénérées** (`public/produit/leurre-{truite,perche,orange}.webp`) :
  elles montraient l'ancien décor net (rustine visible) et l'ancien coloris orange. Refaites
  en pose neutre garantie — Chrome piloté par `playwright-core`
  (`scratchpad/capture-lures.mjs`) avec émulation native `prefers-reduced-motion`
  (swimTime figé à 0 → leurre droit, décor au poster bokeh), capture ×2 retina sur
  `/hero-video`, recadrage 4:3 → 700×525 WebP. Le daemon browse de gstack crashait (OOM,
  ~1 Go de bitmaps de la séquence) — playwright-core + Chrome local est la voie fiable.
- Servies comme vignettes 56px du sélecteur de coloris (`BuyBox`) ; le visuel principal de
  la page produit reste le viewer 3D live.

## 2026-08-09 (après-midi) — Le hero téléphone refait : plein écran, recadrage central

Demande Camil : « revoit complètement le format de la vidéo sur le responsive téléphone »
puis « le scroll to trigger doit être en full screen, standardise tout ».

- **Fini le letterbox flouté** : `hero-mobile.mp4` est désormais un RECADRAGE CENTRAL 9:16
  plein cadre (540×960, 1,6 Mo au lieu de 3,0). Vérifié à la planche contact : l'action est
  centrée sur toute la durée — le sujet reste dans le cadre. L'ancien montage (bande 16:9
  nette + remplissage flouté, affiché en `object-contain`) morcelait l'écran en rubans.
  `scripts/hero-mobile.mjs` (partie 1) + commentaires `src/lib/hero-variant.ts`.
- **`object-cover` partout** : vidéo d'ouverture, séquence canvas au scroll — même cadrage
  dans toutes les orientations, plus aucun saut visuel au relais vidéo → scroll.
  `HeroScroll.tsx`, `HeroVideo.tsx`, `use-portrait.ts` (le hook ne sert plus qu'au choix de
  source et à la caméra 3D).
- **Hero plein écran dès le premier pixel (accueil, mobile ET desktop)** : sur l'accueil le
  header devient une SURCOUCHE `fixed` — transparente en haut de page (liens en blanc via
  `tone="overlay"` du `LangSwitcher` et le style des items), effacée quand on défile vers le
  bas (la scène règne seule), rappelée sur fond plein en remontant (seuils 4px/96px). Les
  autres pages gardent le `sticky` classique. Un voile dégradé (`h-44`,
  `from-background/70`) posé en haut du hero garde le chrome lisible sur les plans clairs.
  Le lock-up descend à `top-[21svh]` sur téléphone (le header y fait trois lignes).
  `SiteHeader.tsx`, `LangSwitcher.tsx`, `HeroBrand.tsx`.
- Vérifié au viewport réel 375×812 et desktop : plein écran aux trois moments (ouverture,
  séquence, relais 3D), console propre, FAQ inchangée.
- **Le décor derrière les leurres 3D passe en profondeur de champ** (demande Camil : « un
  carré flou super visible derrière les leurres, surtout sur téléphone »). La rustine qui
  efface le leurre filmé de la boucle (`backdrop-clean.mp4`) restait un rectangle visible —
  criant en portrait où `object-cover` zoome dessus. Le cadre entier passe en `gblur` sigma 8
  APRÈS la rustine (jugé sur prototypes 6/12) : rustine indétectable, leurres 3D nets sur
  fond bokeh, et la boucle tombe à 0,9 Mo. Poster régénéré assorti.
  `scripts/hero-mobile.mjs` (partie 2), vérifié en 375×812 et desktop.
- **Modèle 3D « Orange feu » remplacé** (nouvel export Camil, `assets/3d models/leurre_orange.glb`)
  et redérivé par `npm run models` : 26,9 Mo → 8,2 Mo servi. La nage s'applique génériquement à
  tout modèle chargé (`lure-stage.ts`) — vérifié au navigateur : le nouveau coloris s'affiche et
  bat de la charnière. Gate complet vert (tsc, eslint, 154 tests, build).

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
