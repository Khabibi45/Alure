/**
 * LA décision : quelle mise en scène du hero est en ligne sur l'accueil.
 *
 * Les variantes sont maintenues et testées en permanence. Basculer de l'une à
 * l'autre = changer LE MOT ci-dessous, et rien d'autre. Aucun composant, aucun
 * asset, aucun import à toucher.
 *
 * | Variante  | Ce que le visiteur fait                              | Route de comparaison |
 * |-----------|------------------------------------------------------|----------------------|
 * | `cine`    | la vidéo se joue, PUIS il pilote au défilement       | `/` (l'accueil)      |
 * | `scroll`  | il pilote au défilement                              | `/hero-scroll`       |
 * | `video`   | il regarde, ça se joue                               | `/hero-video`        |
 *
 * `cine` est l'hybride des deux autres : au chargement la vidéo se joue et
 * dépose le visiteur sur le carrousel 3D ; remonter fait défiler la séquence à
 * rebours, redescendre ramène à la 3D ; recharger la page rejoue la vidéo.
 *
 * Les deux routes de comparaison affichent TOUJOURS leur variante, quelle que
 * soit la valeur ci-dessous : elles servent à trancher, pas à refléter la
 * décision. Elles sont `noindex` et hors sitemap.
 *
 * Recette complète : `docs/specs/hero-3d.md` § « Basculer entre les deux hero ».
 */

export type HeroVariant = 'cine' | 'scroll' | 'video'

export const HERO_VARIANT: HeroVariant = 'cine'

/**
 * LA vidéo du hero : le lancer, la plongée, la nage. Jouée seule (`video`),
 * ou en ouverture avant de rendre la main au défilement (`cine`).
 */
export const HERO_VIDEO = '/hero-video/hero.mp4'

/**
 * La MÊME vidéo au format téléphone : recadrage central 9:16 plein cadre
 * (l'action est centrée sur toute la durée — vérifié à la planche contact),
 * produite par `npm run video:mobile`. Servie quand l'écran est en portrait :
 * l'écran est REMPLI, sans bande floutée ni letterbox.
 */
export const HERO_VIDEO_MOBILE = '/hero-video/hero-mobile.mp4'

/**
 * Le décor sous-marin FIXE et SANS leurre (image extraite de la boucle) :
 * repli du décor animé quand l'autoplay est refusé ou en mouvement réduit.
 * Jamais la dernière image de la séquence : elle contient le leurre filmé, et
 * on le verrait en double sous le leurre 3D.
 */
export const HERO_BACKDROP_POSTER = '/hero-video/backdrop-poster.webp'

/**
 * La DERNIÈRE image de la séquence. Elle sert trois fois, et c'est voulu :
 * poster de la vidéo, décor fixe derrière le leurre 3D, et image affichée en
 * mouvement réduit. Comme le décor du fondu EST cette image, le passage à la 3D
 * ne change que le leurre — le lac, lui, ne bouge pas d'un pixel.
 *
 * Le numéro dépend du nombre d'images produites par `npm run frames` ; il est
 * vérifié contre le manifeste par `hero-variant.test.ts`.
 */
export const HERO_LAST_FRAME = '/hero-frames/0302.webp'

/**
 * Le fond ANIMÉ derrière le carrousel 3D : une boucle sous-marine, muette, qui
 * remplace l'image fixe. Le leurre 3D y nage donc dans un décor vivant plutôt
 * que collé sur une photo. Version NETTOYÉE (`npm run video:mobile`) : la
 * boucle d'origine contient le leurre filmé au centre — on le verrait en
 * double sous le leurre 3D dès que la vue amincit la silhouette.
 */
export const HERO_BACKDROP_VIDEO = '/hero-video/backdrop-clean.mp4'

/** Les assets dont chaque variante dépend — vérifiés par `hero-variant.test.ts`. */
export const HERO_VARIANT_ASSETS: Record<HeroVariant, readonly string[]> = {
  // L'hybride dépend de TOUT : la vidéo pour l'ouverture, la séquence pour le
  // défilement. C'est le prix de « revoir en remontant ».
  cine: [
    `public${HERO_VIDEO}`,
    `public${HERO_VIDEO_MOBILE}`,
    'public/hero-frames/manifest.json',
    `public${HERO_LAST_FRAME}`,
    `public${HERO_BACKDROP_VIDEO}`,
    `public${HERO_BACKDROP_POSTER}`,
  ],
  scroll: [
    'public/hero-frames/manifest.json',
    `public${HERO_LAST_FRAME}`,
    `public${HERO_BACKDROP_VIDEO}`,
    `public${HERO_BACKDROP_POSTER}`,
  ],
  video: [
    `public${HERO_VIDEO}`,
    `public${HERO_VIDEO_MOBILE}`,
    `public${HERO_LAST_FRAME}`,
    `public${HERO_BACKDROP_VIDEO}`,
    `public${HERO_BACKDROP_POSTER}`,
  ],
}
