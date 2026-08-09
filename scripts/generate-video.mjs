/**
 * Génère les rushes du hero en image-to-video (fal.ai · Seedance 2.0), à partir
 * des prompts de `docs/specs/video/prompts-plans.md`.
 *
 *   npm run video -- --dry-run          → montre ce qui serait envoyé, n'appelle rien
 *   npm run video -- P07                → génère le plan 07
 *   npm run video -- P07 --takes=3      → 3 essais du plan 07
 *   npm run video                       → tous les plans dont les 2 images existent
 *
 * Options : --resolution=480p|720p|1080p|4k · --duration=auto|4…15 · --audio
 *           --no-negatives · --frames=<dossier> · --out=<dossier>
 *
 * La méthode de la spec — « on ne demande jamais un plan à un moteur vidéo sans
 * lui donner son point de départ ET son point d'arrivée » — est exactement ce
 * que fait ce script : `p0X-in` part en `image_url`, `p0X-out` en `end_image_url`.
 *
 * Ce qu'il ne fait PAS : le dérushage (garder les 20 à 40 images qui portent
 * l'action), l'incrustation du leurre 3D des plans 05 à 08, et le montage. Il
 * produit les rushes de 5 s, rien de plus — cf. `docs/specs/video/README.md` §5.
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fal } from '@fal-ai/client'
import { loadPlans, SPEC_PATH } from './video/plans.mjs'

const MODEL = 'bytedance/seedance-2.0/image-to-video'
const FRAMES_DIR = 'assets/hero/frames'
const OUTPUT_DIR = 'assets/hero/rushes'

/** Plafond documenté par fal pour une image d'entrée. */
const MAX_IMAGE_BYTES = 30 * 1024 * 1024
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }

// La doc fal du 2026-08-06 (soir) plafonne l'endpoint à 720p — la version du
// matin annonçait 1080p/4k. On suit la plus restrictive : un enum invalide
// fait rejeter la requête.
const RESOLUTIONS = ['480p', '720p']
const DURATIONS = ['auto', ...Array.from({ length: 12 }, (_, i) => String(i + 4))]

const DEFAULTS = {
  // La spec génère 5 s par plan et n'en garde qu'une : « aucun modèle ne produit
  // un clip d'une seconde », et les rushes complets donnent le film réseaux.
  duration: '5',
  // Le plafond actuel de l'endpoint. Les images du hero sont extraites du rush.
  resolution: '720p',
  // 16:9 cadré, action dans la zone sûre 9:16 centrée (spec, décision n°12).
  aspectRatio: '16:9',
  // Décision n°6 de la spec : « Le film est muet, partout » (`-an` à l'encodage).
  audio: false,
}

function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith('--'))
  const value = (name, fallback) => {
    const hit = flags.find((f) => f.startsWith(`--${name}=`))
    return hit ? hit.slice(name.length + 3) : fallback
  }
  const known = new Set(['takes', 'resolution', 'duration', 'frames', 'out'])
  const booleans = new Set(['dry-run', 'audio', 'no-negatives'])
  for (const flag of flags) {
    const name = flag.slice(2).split('=')[0]
    if (!known.has(name) && !booleans.has(name)) {
      throw new Error(`Option inconnue : ${flag}`)
    }
  }

  const options = {
    plans: argv.filter((a) => !a.startsWith('--')).map((a) => a.toUpperCase()),
    takes: Number(value('takes', '1')),
    resolution: value('resolution', DEFAULTS.resolution),
    duration: value('duration', DEFAULTS.duration),
    framesDir: value('frames', FRAMES_DIR),
    outputDir: value('out', OUTPUT_DIR),
    dryRun: flags.includes('--dry-run'),
    audio: flags.includes('--audio') ? true : DEFAULTS.audio,
    negatives: !flags.includes('--no-negatives'),
  }

  if (!RESOLUTIONS.includes(options.resolution)) {
    throw new Error(`--resolution : « ${options.resolution} » inconnue. Attendu : ${RESOLUTIONS.join(', ')}.`)
  }
  if (!DURATIONS.includes(options.duration)) {
    throw new Error(`--duration : « ${options.duration} » hors bornes. Attendu : ${DURATIONS.join(', ')}.`)
  }
  if (!Number.isInteger(options.takes) || options.takes < 1) {
    throw new Error(`--takes : « ${value('takes', '1')} » n'est pas un entier positif.`)
  }
  for (const id of options.plans) {
    if (!/^P0[1-8]$/.test(id)) throw new Error(`Plan inconnu : « ${id} ». Attendu P01 à P08.`)
  }
  return options
}

/**
 * Seedance 2.0 n'expose pas de champ `negative_prompt` — son schéma d'entrée
 * n'en a pas. Les exclusions de la spec (marques, visages, waders, HDR…) sont
 * donc repliées en fin de prompt positif. C'est la seule voie disponible, et
 * c'est déjà le parti pris du bloc d'ancrage de la spec, qui écrit ses
 * interdits en toutes lettres. `--no-negatives` les retire si un plan dérive.
 */
function composePrompt(plan, { negatives }) {
  if (!negatives) return plan.prompt
  return `${plan.prompt}\n\nAvoid entirely: ${plan.negative}.`
}

async function readFrame(framesDir, name) {
  for (const ext of Object.keys(IMAGE_TYPES)) {
    const path = join(framesDir, name + ext)
    try {
      const info = await stat(path)
      if (info.size > MAX_IMAGE_BYTES) {
        throw new Error(
          `${path} pèse ${(info.size / 1048576).toFixed(1)} Mo — fal plafonne à 30 Mo par image.`
        )
      }
      return { path, bytes: await readFile(path), type: IMAGE_TYPES[ext] }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return null
}

/** `p07-take1.mp4`, `p07-take2.mp4`… — on n'écrase jamais un rush existant. */
async function nextTake(outputDir, id) {
  const slug = id.toLowerCase()
  let entries = []
  try {
    entries = await readdir(outputDir)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const taken = entries
    .map((f) => f.match(new RegExp(`^${slug}-take(\\d+)\\.mp4$`)))
    .filter(Boolean)
    .map((m) => Number(m[1]))
  return Math.max(0, ...taken) + 1
}

async function generate(plan, frames, options) {
  const prompt = composePrompt(plan, options)
  const [inFile, outFile] = frames

  console.log(`\n${plan.id} — ${plan.title}  (${plan.frames ?? '?'} images retenues au montage)`)
  console.log(`   entrée  ${inFile.path}`)
  console.log(`   sortie  ${outFile.path}`)
  if (plan.standInApplied) console.log('   témoin gris substitué au leurre dans le prompt')

  if (options.dryRun) {
    console.log(`   ── prompt envoyé (${prompt.length} caractères) ──`)
    console.log(prompt.replace(/^/gm, '   '))
    return
  }

  const [imageUrl, endImageUrl] = await Promise.all(
    [inFile, outFile].map((f) =>
      fal.storage.upload(new File([f.bytes], basename(f.path), { type: f.type }))
    )
  )

  const input = {
    prompt,
    image_url: imageUrl,
    end_image_url: endImageUrl,
    resolution: options.resolution,
    duration: options.duration,
    aspect_ratio: DEFAULTS.aspectRatio,
    generate_audio: options.audio,
  }

  for (let take = 0; take < options.takes; take += 1) {
    const number = await nextTake(options.outputDir, plan.id)
    process.stdout.write(`   essai ${number} — génération…`)

    const result = await fal.subscribe(MODEL, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') process.stdout.write('.')
      },
    })

    const url = result.data?.video?.url
    if (!url) {
      throw new Error(
        `${plan.id} : fal a répondu sans URL de vidéo (requête ${result.requestId}). ` +
          'Rien n’a été écrit — relance ce plan seul pour voir la réponse complète.'
      )
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`${plan.id} : téléchargement du rush impossible (HTTP ${response.status} sur ${url}).`)
    }
    const video = Buffer.from(await response.arrayBuffer())
    const target = join(options.outputDir, `${plan.id.toLowerCase()}-take${number}.mp4`)
    await writeFile(target, video)

    // Le sidecar est la provenance du rush : sans lui, on ne sait plus dans un
    // mois quel prompt a produit quel fichier, ni comment le refaire à l'identique.
    await writeFile(
      target.replace(/\.mp4$/, '.json'),
      JSON.stringify(
        {
          plan: plan.id,
          title: plan.title,
          model: MODEL,
          spec: SPEC_PATH,
          engineInSpec: plan.engine,
          standInApplied: plan.standInApplied,
          sourceFrames: { in: inFile.path, out: outFile.path },
          input,
          requestId: result.requestId,
          seed: result.data?.seed ?? null,
          generatedAt: new Date().toISOString(),
        },
        null,
        2
      ) + '\n'
    )
    console.log(` ${target}  (${(video.length / 1048576).toFixed(1)} Mo, seed ${result.data?.seed ?? '—'})`)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const all = await loadPlans()
  const wanted = options.plans.length ? all.filter((p) => options.plans.includes(p.id)) : all

  if (!options.dryRun && !process.env.FAL_KEY) {
    throw new Error(
      'FAL_KEY absente. Colle ta clé fal.ai dans `.env.local` (ligne `FAL_KEY=`), ' +
        'puis relance. `npm run video -- --dry-run` fonctionne sans clé.'
    )
  }

  // Les 14 images d'entrée/sortie se fabriquent avant (Nano Banana, cf. spec).
  // Un plan sans ses deux images ne se génère pas : on le dit, on ne le devine pas.
  const ready = []
  const missing = []
  for (const plan of wanted) {
    const frames = await Promise.all([
      readFrame(options.framesDir, plan.inFrame),
      readFrame(options.framesDir, plan.outFrame),
    ])
    if (frames.every(Boolean)) ready.push({ plan, frames })
    else {
      missing.push({
        plan,
        absent: [plan.inFrame, plan.outFrame].filter((_, i) => !frames[i]),
      })
    }
  }

  if (missing.length) {
    console.log(`\nImages manquantes dans ${options.framesDir}/ :`)
    for (const m of missing) console.log(`   ${m.plan.id} — ${m.absent.join(', ')}`)
    console.log('   Elles se fabriquent avant la vidéo (Nano Banana), cf. ' + SPEC_PATH)
  }

  if (!ready.length) {
    throw new Error(
      `Aucun plan générable : aucune paire d'images trouvée dans ${options.framesDir}/. ` +
        'Formats acceptés : ' + Object.keys(IMAGE_TYPES).join(', ') + '.'
    )
  }

  if (!options.dryRun) await mkdir(options.outputDir, { recursive: true })

  console.log(
    `\n${ready.length} plan(s) · ${options.duration === 'auto' ? 'durée auto' : options.duration + ' s'} · ` +
      `${options.resolution} · son ${options.audio ? 'activé' : 'coupé'}` +
      `${options.dryRun ? ' · DRY RUN, aucun appel API' : ` · ${options.takes} essai(s) par plan`}`
  )

  for (const { plan, frames } of ready) await generate(plan, frames, options)

  if (!options.dryRun) {
    console.log(`\nRushes dans ${options.outputDir}/. Prochaine étape : le dérushage (spec §5).`)
  }
}

main().catch((error) => {
  console.error('\n' + error.message)
  process.exit(1)
})
