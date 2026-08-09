/**
 * Produit les déclinaisons TÉLÉPHONE du hero, depuis les mêmes sources uniques :
 *
 * 1. `public/hero-video/hero-mobile.mp4` — la vidéo du lancer au format
 *    portrait 9:16 (1080×1920). La bande 16:9 d'origine reste ENTIÈRE et nette
 *    au centre (rien de l'action n'est rogné — c'est toute la raison de cette
 *    déclinaison) ; le haut et le bas sont remplis par la même image agrandie
 *    et floutée, le traitement standard des formats verticaux.
 * 2. `public/hero-video/backdrop-clean.mp4` — la boucle du décor SANS le leurre
 *    filmé. La boucle d'origine (`backdrop.mp4`) contient le leurre, petit, au
 *    centre du cadre : sous le leurre 3D on voyait DEUX leurres dès que la vue
 *    3D (dessus, devant…) amincissait la silhouette. `delogo` efface la zone en
 *    la fondant dans l'eau environnante — la nuée de bulles rend l'emprunt
 *    invisible.
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
// [bg] : la source recadrée/zoomée en 1080×1920 puis floutée — le remplissage.
// [fg] : la source entière, nette, ramenée à 1080 de large, posée au centre.
execFileSync(
  ffmpeg,
  // prettier-ignore
  [
    '-y', '-i', HERO,
    '-filter_complex',
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=22:5[bg];' +
      '[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2',
    '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an',
    OUT_MOBILE,
  ],
  { stdio: 'inherit' }
)
console.log(`ok ${OUT_MOBILE}`)

// ── 2. La boucle du décor, débarrassée du leurre filmé ──────────────────────
// Pas de `delogo` : son interpolation laisse une grille visible sur une zone de
// cette taille. Deux anneaux de flou — large et doux puis serré et fort — font
// fondre le leurre dans l'eau, comme une zone hors focale.
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
      `[a1][s]overlay=${LURE_BOX.x}:${LURE_BOX.y}`,
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
