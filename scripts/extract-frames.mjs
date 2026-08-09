/**
 * Découpe les segments vidéo du hero en une séquence d'images servie au navigateur.
 *
 *   npm run frames
 *
 * Pourquoi une séquence d'images et pas la vidéo scrubbée : `video.currentTime`
 * piloté au scroll saute sur la plupart des navigateurs mobiles (le décodeur ne
 * cherche qu'aux images-clés). Une séquence d'images se dessine image par image,
 * sans à-coup — c'est la méthode des pages produit qui font ça bien.
 *
 * Réglages mesurés sur seg5 avant d'être figés :
 *   1280×720 · WebP q72 · 12 fps → ~20 Ko l'image, 61 images par segment de 5 s.
 *   Les deux segments tiennent en ~2,5 Mo, soit moins qu'un seul modèle 3D.
 *
 * La dernière image d'un segment et la première du suivant montrent la MÊME
 * keyframe (le raccord). On saute donc la première image de chaque segment sauf
 * le premier, sinon la séquence bégaie d'une image à chaque jonction.
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const run = promisify(execFile)

/**
 * LA source : la vidéo du hero elle-même, celle que sert la variante `video`.
 * Les deux variantes descendent donc du même fichier et ne peuvent pas
 * diverger — c'est ce que vérifie `hero-variant.test.ts`.
 */
const SRC_DIR = 'public/hero-video'
/** Les segments du hero, dans l'ordre de lecture. */
const SEGMENTS = ['hero']
const OUT_DIR = 'public/hero-frames'

const FPS = 30
const WIDTH = 1280
const QUALITY = 72

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const tmp = join(OUT_DIR, '.tmp')
  let index = 0
  const manifest = []

  for (const [position, name] of SEGMENTS.entries()) {
    const video = join(SRC_DIR, `${name}.mp4`)
    await rm(tmp, { recursive: true, force: true })
    await mkdir(tmp, { recursive: true })

    // `-f image2` est obligatoire : sans lui, le muxer libwebp produit UN webp
    // animé au lieu d'une séquence de fichiers.
    await run(
      ffmpegPath,
      [
        '-y', '-v', 'error',
        '-i', video,
        '-vf', `fps=${FPS},scale=${WIDTH}:-2`,
        '-c:v', 'libwebp', '-q:v', String(QUALITY),
        '-f', 'image2',
        join(tmp, 'f%04d.webp'),
      ],
      { maxBuffer: 1 << 24 }
    )

    const produced = (await readdir(tmp)).filter((f) => f.endsWith('.webp')).sort()
    // Jonction : la 1re image reprend la keyframe sur laquelle le segment
    // précédent s'est terminé. On la saute pour ne pas bégayer.
    const frames = position === 0 ? produced : produced.slice(1)

    for (const frame of frames) {
      index += 1
      await writeFile(
        join(OUT_DIR, `${String(index).padStart(4, '0')}.webp`),
        await readFile(join(tmp, frame))
      )
    }
    manifest.push({ segment: name, frames: frames.length, skippedDuplicate: position !== 0 })
    console.log(`  ${name} : ${produced.length} images → ${frames.length} retenues`)
  }

  await rm(tmp, { recursive: true, force: true })

  // Le manifeste est LA source du composant : il n'y a pas de nombre d'images
  // écrit en dur côté React, sinon il dériverait au premier re-découpage.
  await writeFile(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify(
      { count: index, width: WIDTH, fps: FPS, quality: QUALITY, pattern: '{n}.webp', segments: manifest },
      null,
      2
    ) + '\n'
  )

  console.log(`\n→ ${OUT_DIR} : ${index} images (manifest.json écrit)`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
