# Génération des rushes — fal.ai · Seedance 2.0

> Comment on fabrique les 8 rushes du hero. Les **prompts** ne sont pas ici : ils vivent dans
> `prompts-plans.md`, qui reste leur source canonique. Ce document décrit l'outil qui les lit.

## En un coup d'œil

```bash
npm run video -- --dry-run          # montre ce qui partirait, n'appelle rien, ne coûte rien
npm run video -- P07                # génère le plan 07
npm run video -- P07 --takes=3      # 3 essais du même plan
npm run video                       # tous les plans dont les 2 images existent
```

Options : `--resolution=480p|720p|1080p|4k` · `--duration=auto|4…15` · `--audio`
`--no-negatives` · `--frames=<dossier>` · `--out=<dossier>`

| | |
|---|---|
| Entrées | `assets/hero/frames/p0X-in.png` et `p0X-out.png` (PNG, JPEG ou WebP, ≤ 30 Mo) |
| Sorties | `assets/hero/rushes/p0X-takeN.mp4` + un sidecar `.json` de provenance |
| Clé | `FAL_KEY` dans `.env.local` — **jamais** dans Vercel (voir plus bas) |
| Code | `scripts/generate-video.mjs`, parseur de spec dans `scripts/video/plans.mjs` |

## Pourquoi ce script existe

Trois choses qu'on ne veut pas faire à la main, parce qu'elles se ratent en silence :

1. **Recopier les prompts.** La spec dit d'elle-même qu'elle est la source canonique, et le
   storyboard HTML en est déjà une vue dérivée. Un troisième exemplaire dans un script dériverait
   au premier ajustement — et on paierait une génération sur un prompt périmé sans le voir. Le
   script **lit `prompts-plans.md`** ; corriger la spec suffit.

2. **Oublier le témoin gris.** Le critère d'acceptation n°3 (« aucun leurre inventé par un modèle
   génératif n'apparaît ») tient à une substitution de chaîne dans les prompts des plans 05 à 08.
   Le script l'applique — et **refuse de générer** si la chaîne du tableau de substitution ne se
   retrouve plus mot pour mot dans le prompt vidéo. C'est le cas où la spec et son tableau ont
   dérivé l'un par rapport à l'autre : générer enverrait la description complète du leurre au
   moteur. Mieux vaut s'arrêter.

3. **Perdre la provenance.** Chaque rush est accompagné d'un `.json` : prompt exact envoyé, seed,
   `requestId`, images sources, réglages. Sans lui, on ne sait plus dans un mois quel prompt a
   produit quel fichier. Les `.mp4` sont git-ignorés (lourds, refabricables) ; **les `.json` sont
   versionnés**.

## Ce que Seedance change par rapport à la spec

La spec v0.4 prévoit **Kling 2.5 et Veo 3**. Seedance 2.0 est un troisième moteur, et il n'est pas
équivalent sur trois points :

- **`end_image_url` est natif.** C'est le point qui joue en sa faveur : la méthode de la spec —
  « on ne demande jamais un plan à un moteur vidéo sans lui donner son point de départ **et** son
  point d'arrivée » — devient un paramètre d'API au lieu d'une contorsion. Les 8 raccords se
  jouent là.
- **Il n'y a pas de champ `negative_prompt`.** Le schéma d'entrée n'en a pas. Les exclusions de la
  spec (marques, visages lisibles, waders, HDR…) sont donc **repliées en fin de prompt positif**,
  sous la forme `Avoid entirely: …`. C'est la seule voie disponible, et c'est déjà le parti pris du
  bloc d'ancrage, qui écrit ses interdits en toutes lettres. **Conséquence à surveiller** : nommer
  ce qu'on refuse peut, sur certains moteurs, le faire apparaître. Si un plan dérive exactement sur
  un terme de la liste, `--no-negatives` le retire pour comparer.
- **Le rendu ne sera pas celui de Kling ni de Veo.** Les 8 plans doivent se raccorder entre eux
  (critère n°2 : aucune rupture de lumière entre deux plans consécutifs). Mélanger les moteurs plan
  par plan est le meilleur moyen de casser ce raccord. Si on passe à Seedance, **on y passe pour
  les 8 plans**, ou on assume de tester le raccord aux jointures P04→P05 et P06→P07.

## Les réglages par défaut, et d'où ils viennent

| Réglage | Défaut | Pourquoi |
|---|---|---|
| `duration` | `5` s | Décision n°9 : on génère 5 s par plan, on en garde une — et les rushes complets donnent le film réseaux sans une génération de plus. |
| `resolution` | `1080p` | Les images du hero sont **extraites** du rush. On paie la définition une fois. |
| `aspect_ratio` | `16:9` | Décision n°12, action dans la zone sûre 9:16 centrée. |
| `generate_audio` | `false` | Décision n°6 : « Le film est muet, partout ». Le coût est le même avec ou sans, mais un rush muet est un fichier de moins à nettoyer. |
| `bitrate_mode` | `high` | On extrait des images fixes : le débit le plus haut limite les artefacts sur l'eau et les bulles, là où ils se voient le plus. |

## La clé — où elle vit, et où elle ne va pas

`FAL_KEY` se colle dans **`.env.local`** (git-ignoré). Elle est lue par `npm run video` via
`node --env-file-if-exists`, et par **rien d'autre** : aucune route API, aucun composant, aucun
build du site ne la touche.

**Elle n'a rien à faire dans Vercel.** C'est de l'outillage de production d'assets, qui tourne sur
le poste qui fabrique les images — pas une dépendance du site. `@fal-ai/client` est en
`devDependencies` pour la même raison : il ne part pas dans le bundle.

Sans clé, `npm run video` s'arrête en le disant. `--dry-run` continue de fonctionner sans elle —
c'est ce qui permet de vérifier toute la chaîne, prompts compris, avant de dépenser un centime.

## L'ordre de fabrication

Ce script n'est que l'étape 2 sur 4. Il ne peut rien produire tant que l'étape 1 n'est pas faite.

1. **Les 14 images** d'entrée/sortie (Nano Banana), dans l'ordre, chacune chaînée sur la
   précédente → `assets/hero/frames/`. C'est là que se gagnent les raccords.
2. **Les 8 rushes de 5 s** ← *ce script*.
3. **L'incrustation du leurre 3D** dans les plans 05 à 08 (Blender), sur le témoin gris.
4. **Le dérushage et le montage** : garder les 20 à 40 images qui portent l'action, encoder
   (`spec-technique.md`).

`p04-in` et `p06-in` n'existent pas comme fichiers : ce sont `p03-out` et `p05-out` réutilisés tels
quels (coupes en continuité pure). Le script résout ces deux alias en lisant la spec — il n'y a
rien à dupliquer sur le disque.

## À vérifier à la première génération

La question ouverte n°6 de `prompts-plans.md` demande **un essai du plan 07 avant de lancer les
quatre plans à témoin** : le risque est que le moteur traite un volume gris sans texture comme un
défaut et le déforme. Si ça arrive, on repasse en plaque nue et le leurre 3D est animé
clé-à-clé — une demi-journée de Blender en plus.

Un détail lié : la substitution ne remplace que la **description** du leurre. Les mentions
ultérieures (`the lure turns nose-first`, `macro clarity on the lure`) restent dans le prompt,
telles que la spec les a écrites. À regarder sur cet essai : si Seedance rhabille le témoin gris à
cause de ces mentions, elles se retirent dans la spec, pas dans le script.
