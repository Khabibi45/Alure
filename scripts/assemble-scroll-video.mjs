/**
 * Assemble les 7 segments générés par `generate-scroll-video.mjs` en une seule
 * vidéo continue : `assets/video scroll trigger/V3/hero-scroll-v3.mp4`.
 *
 *   npm run video:scroll:assemble
 *
 * Deux passes possibles, dans cet ordre :
 *   1. concat en copie de flux (sans ré-encodage — les 7 segments sortent du
 *      même endpoint avec les mêmes réglages, leurs flux sont homogènes) ;
 *   2. si la copie échoue, ré-encodage H.264 CRF 18 — plus lent, mais fiable.
 *
 * Le fichier produit est un MASTER de travail, pas le fichier servi au site :
 * l'encodage final du hero (budget ≤ 1 Mo, variantes mobiles) reste celui de
 * `docs/specs/video/spec-technique.md`.
 */
import { access, writeFile, unlink } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const run = promisify(execFile)

const DIR = 'assets/video scroll trigger/V3'
const SEGMENTS = [
  'seg1-k1-k2.mp4',
  'seg2-k2-k3.mp4',
  'seg3-k3-k4.mp4',
  'seg4-k4-k5.mp4',
  'seg5-k5-k6.mp4',
  'seg6-k6-k7.mp4',
  'seg7-k7-k8.mp4',
]
const OUTPUT = join(DIR, 'hero-scroll-v3.mp4')

async function main() {
  if (!ffmpegPath) throw new Error('ffmpeg-static ne fournit pas de binaire sur cette plateforme.')

  const missing = []
  for (const name of SEGMENTS) {
    try {
      await access(join(DIR, name))
    } catch {
      missing.push(name)
    }
  }
  if (missing.length) {
    throw new Error(
      `Segments manquants dans ${DIR}/ : ${missing.join(', ')}.\n` +
        'Ils se (re)génèrent avec : npm run video:scroll -- <numéros>'
    )
  }

  // Le démuxeur concat lit une liste de fichiers ; les chemins Windows y passent
  // en absolu avec des slashs avant, et les quotes simples sont celles du format.
  const list = SEGMENTS.map(
    (name) => `file '${resolve(DIR, name).replace(/\\/g, '/')}'`
  ).join('\n')
  const listPath = join(DIR, 'concat-list.txt')
  await writeFile(listPath, list + '\n')

  const base = ['-y', '-f', 'concat', '-safe', '0', '-i', listPath]
  try {
    await run(ffmpegPath, [...base, '-c', 'copy', '-an', OUTPUT])
    console.log(`${OUTPUT} — assemblé en copie de flux (aucune perte).`)
  } catch {
    console.log('Copie de flux impossible (flux hétérogènes) → ré-encodage CRF 18…')
    await run(ffmpegPath, [
      ...base,
      '-c:v', 'libx264',
      '-crf', '18',
      '-preset', 'slow',
      '-pix_fmt', 'yuv420p',
      '-an',
      OUTPUT,
    ])
    console.log(`${OUTPUT} — ré-encodé (H.264 CRF 18, muet).`)
  } finally {
    await unlink(listPath)
  }

  // `ffmpeg -i` sans sortie termine en erreur et écrit ses infos sur stderr :
  // on récupère l'objet rejeté pour lire la durée, c'est le comportement normal.
  const probe = await run(ffmpegPath, ['-i', OUTPUT], { encoding: 'utf8' }).catch((e) => e)
  const duration = String(probe.stderr ?? '').match(/Duration: ([\d:.]+)/)?.[1]
  if (duration) console.log(`Durée totale : ${duration}`)
}

main().catch((error) => {
  console.error('\n' + error.message)
  process.exit(1)
})
