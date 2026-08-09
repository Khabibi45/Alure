/**
 * Assemble les segments générés en un seul film, sans ré-encoder.
 *
 *   npm run montage                 → assets/video scroll trigger/V3
 *   npm run montage -- --src=".../V2"
 *   npm run montage -- --reencode   → force le ré-encodage (formats hétérogènes)
 *
 * Deux vérifications avant de coller quoi que ce soit, parce qu'un montage muet
 * qui saute est pire qu'une erreur :
 *
 *  1. LA CONTINUITÉ DES RACCORDS. Chaque segment porte dans son sidecar la
 *     keyframe d'entrée et celle de sortie. Le segment N doit finir sur l'image
 *     où le segment N+1 commence. Si ce n'est pas le cas, il manque un plan et
 *     le film sautera — le script le dit et le NOMME dans le fichier de sortie.
 *  2. L'HOMOGÉNÉITÉ DES FORMATS. La copie de flux exige la même résolution, le
 *     même codec et la même cadence. Sinon le script bascule en ré-encodage au
 *     lieu de produire un fichier illisible à la moitié.
 */
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises'
import { join, basename, resolve, dirname } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const run = promisify(execFile)

const DEFAULT_SRC = 'assets/video scroll trigger/V3'
const OUT_DIR = 'assets/video scroll trigger/montage'

function parseArgs(argv) {
  const flag = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  const only = flag('only')
  return {
    src: flag('src') ?? DEFAULT_SRC,
    reencode: argv.includes('--reencode'),
    /** Sous-ensemble de segments, par nom de fichier sans extension. */
    only: only ? only.split(',').map((s) => s.trim()).filter(Boolean) : null,
    /** Destination explicite (sinon `montage/` avec un nom déduit). */
    dest: flag('dest'),
  }
}

/** Un segment : son numéro, son fichier, ses keyframes d'entrée et de sortie. */
async function loadSegments(src) {
  const entries = await readdir(src)
  const sidecars = entries.filter((f) => f.endsWith('.json')).sort()
  const segments = []

  for (const file of sidecars) {
    const meta = JSON.parse(await readFile(join(src, file), 'utf8'))
    const video = file.replace(/\.json$/, '.mp4')
    if (!entries.includes(video)) {
      console.warn(`  ⚠ ${file} n'a pas de .mp4 — segment ignoré.`)
      continue
    }
    const frame = (p) => (p ? basename(String(p).replace(/\\/g, '/')) : null)
    segments.push({
      number: Number(meta.segment),
      title: meta.title ?? '(sans titre)',
      file: join(src, video),
      name: video,
      frameIn: frame(meta.sourceFrames?.in),
      frameOut: frame(meta.sourceFrames?.out),
    })
  }
  return segments.sort((a, b) => a.number - b.number)
}

/** Les ruptures de raccord : là où le film sautera. */
function findBreaks(segments) {
  const breaks = []
  for (let i = 0; i < segments.length - 1; i += 1) {
    const current = segments[i]
    const next = segments[i + 1]
    if (current.frameOut && next.frameIn && current.frameOut !== next.frameIn) {
      breaks.push({
        after: current.number,
        before: next.number,
        expected: current.frameOut,
        found: next.frameIn,
        missing: next.number - current.number - 1,
      })
    }
  }
  return breaks
}

/** Signature de format d'un fichier, lue dans la sortie de ffmpeg. */
async function probe(file) {
  let output = ''
  try {
    await run(ffmpegPath, ['-i', file], { maxBuffer: 1 << 22 })
  } catch (error) {
    // ffmpeg sort en erreur quand il n'a pas de destination : c'est le cas normal.
    output = String(error.stderr ?? '')
  }
  const stream = /Video:\s*(\w+).*?,\s*(\w+)\(?[^,]*\)?,\s*(\d+x\d+)[^,]*,.*?([\d.]+)\s*fps/s.exec(
    output
  )
  const duration = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(output)
  const seconds = duration
    ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3])
    : 0
  const hasAudio = /Stream #\d+:\d+.*: Audio:/.test(output)
  return {
    codec: stream?.[1] ?? '?',
    size: stream?.[3] ?? '?',
    fps: stream?.[4] ?? '?',
    seconds,
    hasAudio,
    signature: `${stream?.[1]}/${stream?.[3]}/${stream?.[4]}/${hasAudio}`,
  }
}

async function main() {
  const { src, reencode, only, dest } = parseArgs(process.argv.slice(2))
  console.log(`Source : ${src}\n`)

  let segments = await loadSegments(src)
  if (only) {
    const wanted = new Set(only)
    segments = segments.filter((s) => wanted.has(s.name.replace(/\.mp4$/, '')))
    const missing = only.filter((n) => !segments.some((s) => s.name.startsWith(n)))
    // Échec bruyant : un segment demandé et absent produirait un film plus court
    // que voulu, sans que personne ne s'en aperçoive.
    if (missing.length) throw new Error(`Segment(s) introuvable(s) : ${missing.join(', ')}`)
  }
  if (segments.length === 0) throw new Error(`Aucun segment exploitable dans ${src}.`)

  // 1) Formats
  const probes = []
  let total = 0
  for (const segment of segments) {
    const info = await probe(segment.file)
    probes.push(info)
    total += info.seconds
    console.log(
      `  ${String(segment.number).padStart(2)}. ${segment.name.padEnd(16)} ` +
        `${info.size} ${info.fps}fps ${info.seconds.toFixed(2)}s  ${segment.title}`
    )
  }

  const signatures = new Set(probes.map((p) => p.signature))
  const uniform = signatures.size === 1
  if (!uniform) {
    console.log(`\n  ⚠ Formats hétérogènes (${[...signatures].join(' · ')}) → ré-encodage.`)
  }

  // 2) Raccords
  const breaks = findBreaks(segments)
  const complete = breaks.length === 0
  if (!complete) {
    console.log('\n  ⚠ TROU(S) DANS LA CONTINUITÉ — le film sautera à ces endroits :')
    for (const gap of breaks) {
      console.log(
        `     entre le segment ${gap.after} et le ${gap.before} : ` +
          `le ${gap.after} finit sur ${gap.expected}, le ${gap.before} part de ${gap.found} ` +
          `(${gap.missing} segment(s) manquant(s))`
      )
    }
  }

  // 3) Montage
  const outDir = dest ? dirname(dest) : OUT_DIR
  await mkdir(outDir, { recursive: true })
  const version = basename(src)
  const stem = complete
    ? `montage-${version}`
    : `montage-${version}-INCOMPLET-manque-seg${breaks.map((b) => b.after + 1).join('-')}`
  const output = dest ?? join(OUT_DIR, `${stem}.mp4`)
  const listFile = join(outDir, '.concat.txt')

  // Chemins ABSOLUS : le démultiplexeur `concat` résout les chemins relatifs par
  // rapport au fichier de liste, pas au dossier courant — piège classique.
  await writeFile(
    listFile,
    segments
      .map((s) => `file '${resolve(s.file).replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
      .join('\n')
  )

  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listFile]
  if (reencode || !uniform) {
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p')
  } else {
    args.push('-c', 'copy')
  }
  args.push('-movflags', '+faststart', output)

  await run(ffmpegPath, args, { maxBuffer: 1 << 24 })
  await unlink(listFile)

  const final = await probe(output)
  console.log(`\n→ ${output}`)
  console.log(
    `   ${final.size} ${final.fps}fps · ${final.seconds.toFixed(2)}s ` +
      `(attendu ${total.toFixed(2)}s) · ${reencode || !uniform ? 'ré-encodé' : 'copie de flux, sans perte'}`
  )

  // Sidecar : ce que contient RÉELLEMENT ce fichier.
  await writeFile(
    `${output.replace(/\.mp4$/, '')}.json`,
    JSON.stringify(
      {
        source: src,
        complete,
        breaks,
        durationSeconds: Number(final.seconds.toFixed(2)),
        method: reencode || !uniform ? 'reencode' : 'stream-copy',
        segments: segments.map((s) => ({
          number: s.number,
          file: s.name,
          title: s.title,
          frameIn: s.frameIn,
          frameOut: s.frameOut,
        })),
      },
      null,
      2
    ) + '\n'
  )

  if (!complete) {
    console.log(
      `\n   Le nom du fichier porte la mention INCOMPLET : ce n'est pas le film final.\n` +
        `   Générez le(s) segment(s) manquant(s), puis relancez \`npm run montage\`.`
    )
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
