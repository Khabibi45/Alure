# FONDATION-PASTEL — la couche 1 du studio (invariante)

> **Standard durable, non négociable**, appliqué à TOUS les produits Pastel Studio construits avec
> ce kit. Validé en atelier le 2026-08-03 sur prototype interactif. La direction artistique de
> chaque site (palette, typos, imagerie, ton) est la **couche 2**, définie au cadrage
> (`web-product`) — elle vit **au-dessus** de cette fondation et ne la contredit jamais.

## 0. Pourquoi cette fondation existe

L'air « généré par IA » d'une interface, c'est l'**absence de décisions** : composants par défaut,
radius par défaut, Inter, fade-up staggeré sur tout. Deux personnes qui promptent la même idée
obtiennent la même app. Cette fondation est notre réponse : **~30 écarts délibérés et cohérents**
par rapport aux défauts, encodés en tokens, composants et règles — reconnaissables au *toucher*,
pas au logo.

Elle n'est jamais un blocage produit : si une règle entre en conflit avec l'accessibilité ou
l'usage réel, **l'accessibilité gagne**, et l'écart se documente ici (voir §10).

## 1. Les deux couches

| | Contenu | Où | Change |
|---|---|---|---|
| **Couche 1 — fondation** | géométrie, surfaces, geste surligneur, échelle, grain, motion | ce doc + tokens `globals.css` + composants `px-*` | jamais localement (voir §10) |
| **Couche 2 — DA du site** | palette (valeurs des tokens sémantiques), typos, imagerie, ton, mode sombre | `docs/product/PRODUCT.md` + valeurs dans `globals.css` | au cadrage, par site |

**Règle de traduction** : la fondation ne référence QUE des tokens sémantiques
(`--color-accent-soft`, `--color-surface`…), jamais une teinte. La couche 2 remplit les valeurs ;
le surligneur d'une app santé sera vert d'eau, celui d'une app cycle sera rose poudré — même geste.

## 2. Surfaces & géométrie (« Galet »)

La hiérarchie visuelle se fait **par tons, jamais par bordures**.

- **Fond de page** `--color-background` : légèrement teinté, **jamais blanc pur**. Surfaces posées
  dessus : `--color-surface`. Zones en creux (fond de segmented, jauges vides, sidebar) :
  `--color-muted`.
- **Bordures décoratives interdites** sur cartes, boutons, inputs. Seule exception : le
  **séparateur 1 px** `--color-border` entre les lignes d'une liste.
- **Radius — trois valeurs, aucune autre** : carte `--radius-card` (1rem), ligne/élément imbriqué
  `--radius-row` (0.75rem), contrôles (boutons, inputs, segmented, avatar) = **pill**
  (`rounded-full`). L'avatar est **rond**, jamais organique.
- **Ombres** : UNE ombre diffuse par surface, `--shadow-card` ; au survol `--shadow-card-hover`
  + `translateY(-3px)`. Jamais d'ombre dure, jamais d'ombre interne décorative.
- **Densité** : padding de carte 1.25rem ; contrôles h-9 (36 px) en UI dense, h-11 (44 px) en
  contexte marketing/mobile (cible tactile ≥ 44 px, règle a11y).

## 3. Le geste signature : le surligneur

Un trait de marqueur en `--color-accent-soft`, **toujours légèrement penché** (−1 à −2°,
skew ≈ −7°), aux coins irréguliers, posé **sous la ligne de base** du texte qu'il marque.

**Où il vit — liste exhaustive :**
1. le **titre de page** ;
2. **UN** chiffre ou mot héros par écran (pas deux) ;
3. l'**item de nav actif** (version bloc `.px-marker-block`).

Nulle part ailleurs. Implémentation : composant `<Marker>` / classes `.px-marker*` — **jamais
recodé à la main**. En couche 2, `--color-accent-soft` se dérive de l'accent du site :
`color-mix(in oklab, var(--color-accent) 18%, var(--color-background))` est le point de départ,
à ajuster à l'œil (le surligneur doit rester lisible SOUS du texte encre).

## 4. Échelle typographique & chiffres

La **famille** de police = couche 2 (via `next/font`, self-hosted). La fondation fixe les
**rapports et usages** :

- **Chiffre clé** : `text-stat` (1.8rem, lh 1.15, tracking −0.025em, graisse 600,
  `tabular-nums`). **Plafond absolu : 2rem** — au-delà, c'est le tic « dashboard IA ».
- **Label sur-titre** : `text-label` (0.625rem, uppercase, tracking 0.15em, graisse 600, muted).
- **Valeurs dans les listes** (« 24 min ») : graisse 600, couleur encre, `tabular-nums` —
  **jamais de police mono**. La mono est bannie de TOUTE l'UI (tic IA n°1) ; elle reste tolérée
  pour du vrai code affiché.
- Unité accolée à un chiffre : 0.8125rem, muted, graisse 500.
- Titres : hiérarchie par la **taille**, pas par la couleur ; `text-wrap: balance`.

## 5. Matière : le grain papier

Un bruit `feTurbulence` à **opacité 0.02** sur le conteneur racine de l'app — l'œil sent une
matière chaleureuse, il ne doit **jamais** identifier une texture (pas d'effet « feuille Canson »).
Classe `.px-grain` (le `::after` est `pointer-events:none`), fournie dans `globals.css` — la valeur
0.02 est LE dosage validé, ne pas « l'améliorer ». Jamais par-dessus une photo.

## 6. Motion — la doctrine complète

**Tokens — rien d'autre, jamais** : 3 durées `--dur-micro` 0.14s / `--dur-element` 0.28s /
`--dur-page` 0.42s ; 2 courbes `--ease-out-soft` cubic-bezier(.22,1,.36,1) (arrivées, hovers) et
`--ease-in-brisk` cubic-bezier(.55,0,.72,.35) (départs francs).

**La transition de page « relais directionnel »** (la signature — primitive `<PageRelay>`,
jamais recodée) :
- le décor (nav, header persistants) **ne bouge pas** ; seul le contenu transite ;
- le mouvement est **vertical, dans le sens du déplacement dans la nav** : on descend dans le
  menu → le contenu sortant part vers le haut, l'entrant arrive par le bas ; on monte → inverse ;
- **passage de relais asymétrique** : le sortant s'efface en 0.14s ; l'entrant démarre **+0.09s**
  et glisse 16 px en 0.42s ;
- le **surligneur se trace en dernier** (delay ≈ 0.3s, `.px-marker-draw`), comme un geste de la
  main après l'écriture.

> ⚠️ Deux pièges éprouvés en atelier, à ne JAMAIS réintroduire :
> le **séquentiel strict** (sortie finie avant l'entrée) → écran vide qui « clignote » ;
> le **fondu croisé symétrique** → textes sortant/entrant superposés lisibles.

**Le reste du motion :**
- changement de donnée : le chiffre « tombe en place » (7 px, 0.28s — `.px-pop`) ;
- jauges/barres : se déploient **une seule fois** (0.55s, depuis la gauche/le bas) ;
- press bouton : enfoncé 0.14s scale(.97), relâché 0.28s — le bouton répond avant de rebondir ;
- reveals au scroll : `AnimatedSection` (16 px, 0.42s, `once`).

**Interdits motion** : stagger généralisé (max **3 groupes**, ≤ 150 ms d'écart total), toute
rotation, toute animation en boucle, toute durée > 500 ms, deux animations simultanées sur un même
élément, toute animation qui retarde la lecture du contenu au-dessus de la ligne de flottaison.
`prefers-reduced-motion` reste garanti par le bloc global de `globals.css` + `useReducedMotion()`.

## 7. Les composants fondation (starter)

Fournis par le kit dans `src/components/ui/` + `src/lib/motion.ts`. **On les utilise, on ne les
contourne pas** ; un besoin non couvert = on ajoute le composant AU KIT (et on le répercute),
on ne bricole pas une variante locale.

| Composant | Rôle |
|---|---|
| `<Marker>` | le surligneur (inline, `draw` pour le tracé différé) |
| `<Button>` | pill, `primary` / `ghost`, press doctrine |
| `<Card>` | surface tonale, ombre diffuse, hover lift |
| `<Stat>` | label + chiffre (`hero` → surligné) + unité + hint |
| `<SegmentedControl>` | le segmented classique (fond creux, sélection surface) |
| `<PageRelay>` | la transition de page directionnelle |
| `<AnimatedSection>` | reveal au scroll conforme doctrine |
| `src/lib/motion.ts` | durées/courbes pour tout framer-motion custom |

## 8. Le mur des interdits (récapitulatif)

Police mono dans l'UI · bordures décoratives · ombres dures ou multiples · radius hors échelle ·
chiffres > 2rem · plus d'un surligneur héros par écran · surligneur hors de ses 3 emplacements ·
onglets « texte + point » · avatar non rond · rotations · animations en boucle · stagger
généralisé · durée > 500 ms · grain ≠ 0.02 ou par-dessus une photo · fond de page blanc pur ·
et tous les interdits anti « template IA » de `web-render` (emoji-icônes, dégradé violet,
3-cards-identiques…).

## 9. Checklist de conformité (avant `web-quality-gate`)

- [ ] Toute surface/ombre/radius vient des tokens fondation (aucune valeur ad hoc)
- [ ] Surligneur : titre + ≤ 1 héros + nav active, via `<Marker>`/`.px-marker-block` uniquement
- [ ] Chiffres : `text-stat` plafonné, `tabular-nums`, zéro mono dans l'UI
- [ ] Grain 0.02 posé sur la racine (et nulle part ailleurs)
- [ ] Navigation : `<PageRelay>` en place, sens vertical cohérent avec l'ordre de la nav
- [ ] Motion : uniquement les 3 durées / 2 courbes ; interdits respectés ; reduced-motion vérifié
- [ ] Couche 2 : `--color-accent-soft` dérivé de l'accent, lisibilité du texte sur surligneur AA

## 10. Évolution de la fondation

La fondation s'amende **dans le repo `web-dev-kit` d'abord** (ce fichier + tokens + composants),
puis se répercute aux projets — jamais l'inverse. Une dérogation locale exceptionnelle (ex. un
site événementiel qui casse volontairement la grille) se décide avec l'utilisateur et se note dans
`docs/product/PRODUCT.md` avec sa raison. Si tu découvres un nouveau « tic IA » qui trahit une
interface générée, ajoute-le au mur des interdits (ici) via le protocole de fin de session.
