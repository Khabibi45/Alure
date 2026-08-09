/**
 * Rend une vidéo bouclable sans coupure, en cousant le fondu DANS le fichier.
 *
 *   npm run loop -- --in=public/hero-video/backdrop.mp4 [--fade=0.8]
 *
 * Pourquoi côté fichier et pas côté lecteur : faire un fondu au moment de la
 * relance demanderait deux `<video>` décalés qui se croisent — deux décodeurs
 * qui tournent en permanence pour un simple décor. Ici le raccord est réglé une
 * fois pour toutes à la production, et la balise `loop` native suffit.
 *
 * Le principe : la QUEUE de la vidéo est fondue par-dessus sa TÊTE, et la queue
 * est ensuite retirée. Le résultat dure `durée − fondu`, et sa dernière image
 * enchaîne exactement sur sa première — puisque cette première image contient
 * déjà la fin.
 *
 * L'original est conservé en `.orig.mp4` : le fondu n'est pas réversible, et
 * relancer le script sur un fichier déjà traité le raccourcirait à chaque fois.
 */
import { rename, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const run = promisify(execFile)

function parseArgs(argv) {
  const flag = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
  const input = flag('in')
  if (!input) throw new Error('Usage : npm run loop -- --in=<fichier.mp4> [--fade=0.8]')
  return { input, fade: Number(flag('fade') ?? 0.8) }
}

async function probeDuration(file) {
  let output = ''
  try {
    await run(ffmpegPath, ['-i', file], { maxBuffer: 1 << 22 })
  } catch (error) {
    output = String(error.stderr ?? '')
  }
  const match = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(output)
  if (!match) throw new Error(`Durée illisible pour ${file}.`)
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
}

async function main() {
  const { input, fade } = parseArgs(process.argv.slice(2))
  const original = input.replace(/\.mp4$/, '.orig.mp4')

  // Si l'original existe déjà, c'est LUI la source : sans ça, un second appel
  // fondrait un fichier déjà fondu et raccourcirait la boucle à chaque fois.
  let source = input
  try {
    await access(original)
    source = original
    console.log(`Source : ${original} (l'original conservé d'un passage précédent)`)
  } catch {
    await rename(input, original)
    source = original
    console.log(`Original conservé → ${original}`)
  }

  const duration = await probeDuration(source)
  if (fade <= 0 || fade >= duration / 2) {
    throw new Error(`Fondu de ${fade}s impossible sur une vidéo de ${duration.toFixed(2)}s.`)
  }
  const keep = duration - fade

  // La queue [keep, durée] est fondue linéairement par-dessus la tête [0, fade],
  // puis on concatène le reste [fade, keep] tel quel.
  const filter = [
    `[0:v]trim=0:${fade},setpts=PTS-STARTPTS[head]`,
    `[0:v]trim=${keep}:${duration},setpts=PTS-STARTPTS[tail]`,
    `[0:v]trim=${fade}:${keep},setpts=PTS-STARTPTS[rest]`,
    `[tail][head]blend=all_expr='A*(1-T/${fade})+B*(T/${fade})'[mix]`,
    `[mix][rest]concat=n=2:v=1[out]`,
  ].join(';')

  await run(
    ffmpegPath,
    [
      '-y', '-v', 'error',
      '-i', source,
      '-filter_complex', filter,
      '-map', '[out]',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      input,
    ],
    { maxBuffer: 1 << 24 }
  )

  const finalDuration = await probeDuration(input)
  console.log(
    `→ ${input}\n   ${duration.toFixed(2)}s → ${finalDuration.toFixed(2)}s ` +
      `(fondu de ${fade}s cousu dans le fichier)`
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
