/**
 * Produit les déclinaisons TÉLÉPHONE du hero, depuis les mêmes sources uniques :
 *
 * 1. `public/hero-video/hero-mobile.mp4` — la vidéo du lancer au format
 *    portrait 9:16 (540×960) : un RECADRAGE CENTRAL plein cadre de la bande
 *    16:9. L'action est centrée sur toute la durée (vérifié à la planche
 *    contact) : le sujet reste dans le cadre, seul du décor latéral part au
 *    rognage. L'ancien traitement « bande entière + remplissage flouté »
 *    morcelait l'écran du téléphone en rubans (flou / net / flou) — un
 *    recadrage assumé remplit l'écran comme un vrai format vertical.
 * 2. `public/hero-video/backdrop-clean.mp4` — la boucle du décor SANS le leurre
 *    filmé, en FLOU DE PROFONDEUR DE CHAMP. Deux problèmes, un traitement :
 *    la boucle d'origine (`backdrop.mp4`) contient le leurre, petit, au centre
 *    du cadre (sous le leurre 3D on voyait DEUX leurres), et la rustine de flou
 *    qui l'efface restait un RECTANGLE visible — criant en portrait, où le
 *    `object-cover` zoome pile dessus. Le décor entier passe donc en flou doux
 *    (`gblur`) APRÈS la rustine : du flou dans du flou, la rustine devient
 *    indétectable, et le leurre 3D net ressort devant un fond en bokeh — le
 *    langage photo produit standard.
 * 3. `public/hero-video/backdrop-poster.webp` — une image FIXE de ce décor
 *    NETTOYÉ : le repli du décor animé (autoplay refusé, mouvement réduit).
 *
 * Usage : `npm run video:mobile` (à relancer si `hero.mp4`/`backdrop.mp4` changent).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const HERO = 'public/hero-video/hero.mp4'
const BACKDROP = 'public/hero-video/backdrop.mp4'
const OUT_MOBILE = 'public/hero-video/hero-mobile.mp4'
const OUT_CLEAN = 'public/hero-video/backdrop-clean.mp4'
const OUT_POSTER = 'public/hero-video/backdrop-poster.webp'
const TMP_FRAME = 'public/hero-video/backdrop-frame.tmp.png'

/**
 * La boîte qui contient le leurre filmé dans la boucle (mesurée sur l'image à
 * 2,4 s : corps ~570→700 px, ~325→395 px), élargie de sa nage sur place.
 */
const LURE_BOX = { x: 545, y: 305, w: 185, h: 110 }

for (const src of [HERO, BACKDROP]) {
  if (!existsSync(src)) {
    console.error(`${src} manquant — relance \`npm run montage\` d'abord.`)
    process.exit(1)
  }
}

// ── 1. La vidéo portrait ────────────────────────────────────────────────────
// Recadrage central 9:16 (405×720 sur une source 720p), remonté en 540×960 :
// assez pour un écran de téléphone, et ~3× plus léger que l'ancien letterbox
// flouté en 1080×1920. `crop` avant `scale` : on n'agrandit que ce qu'on garde.
execFileSync(
  ffmpeg,
  // prettier-ignore
  [
    '-y', '-i', HERO,
    '-vf', 'crop=ih*9/16:ih,scale=540:960',
    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an',
    OUT_MOBILE,
  ],
  { stdio: 'inherit' }
)
console.log(`ok ${OUT_MOBILE}`)

// ── 2. La boucle du décor, débarrassée du leurre filmé ──────────────────────
// Pas de `delogo` : son interpolation laisse une grille visible sur une zone de
// cette taille. Deux anneaux de flou — large et doux puis serré et fort — font
// fondre le leurre dans l'eau ; puis le cadre ENTIER passe en profondeur de
// champ (`gblur`) pour noyer les bords de la rustine. Sigma 8 : jugé sur
// prototypes (6 = rustine encore devinable en mouvement, 12 = soupe sans
// texture) — les bulles et rais de lumière restent lisibles.
const outer = {
  x: LURE_BOX.x - 37,
  y: LURE_BOX.y - 25,
  w: LURE_BOX.w + 74,
  h: LURE_BOX.h + 50,
}
execFileSync(
  ffmpeg,
  // prettier-ignore
  [
    '-y', '-i', BACKDROP,
    '-filter_complex',
    // Chaque flux est consommé UNE fois : d'où les `split` (règle ffmpeg).
    `[0:v]split[base][forOuter];` +
      `[forOuter]crop=${outer.w}:${outer.h}:${outer.x}:${outer.y},avgblur=8[w];` +
      `[base][w]overlay=${outer.x}:${outer.y}[a];` +
      `[a]split[a1][a2];` +
      `[a2]crop=${LURE_BOX.w}:${LURE_BOX.h}:${LURE_BOX.x}:${LURE_BOX.y},avgblur=24[s];` +
      `[a1][s]overlay=${LURE_BOX.x}:${LURE_BOX.y},gblur=sigma=8`,
    '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an',
    OUT_CLEAN,
  ],
  { stdio: 'inherit' }
)
console.log(`ok ${OUT_CLEAN}`)

// ── 3. Le poster du décor nettoyé ───────────────────────────────────────────
// 2,4 s : au cœur de la boucle, aucun fondu de couture en cours.
execFileSync(ffmpeg, ['-y', '-ss', '2.4', '-i', OUT_CLEAN, '-frames:v', '1', TMP_FRAME], {
  stdio: 'inherit',
})
await sharp(TMP_FRAME).webp({ quality: 80 }).toFile(OUT_POSTER)
unlinkSync(TMP_FRAME)
console.log(`ok ${OUT_POSTER}`)
