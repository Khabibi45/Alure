/**
 * Génère la vidéo du hero scroll-trigger depuis les keyframes de
 * `assets/keyframe pour video scroll trigger/V3/` (fal.ai · Seedance 2.0).
 *
 * 8 keyframes → 7 segments chaînés : k(n) part en `image_url`, k(n+1) en
 * `end_image_url`. Chaque image est à la fois la fin d'un segment et le début
 * du suivant — c'est ce chaînage qui garantit des raccords parfaits au montage,
 * puisque deux segments consécutifs partagent littéralement la même frame.
 *
 *   npm run video:scroll -- --dry-run     → montre ce qui serait envoyé, n'appelle rien
 *   npm run video:scroll                  → génère les 7 segments
 *   npm run video:scroll -- 3 5           → régénère seulement les segments 3 et 5
 *
 * Sorties : `assets/video scroll trigger/V3/segN-kX-kY.mp4` + un sidecar `.json`
 * par segment (prompt exact, seed, requestId — la provenance du rush).
 *
 * Contraintes de l'endpoint (doc fal du 2026-08-06) : résolution max **720p**,
 * pas de champ `negative_prompt` (les exclusions sont repliées en fin de
 * prompt), pas de `bitrate_mode`.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fal } from '@fal-ai/client'

const MODEL = 'bytedance/seedance-2.0/image-to-video'
const FRAMES_DIR = 'assets/keyframe pour video scroll trigger/V3'
const OUTPUT_DIR = 'assets/video scroll trigger/V3'

/**
 * Le tronc commun de chaque prompt : la lumière, le lieu, le rendu. Les
 * keyframes portent déjà tout ça — le répéter au moteur évite qu'il dérive
 * entre la frame de départ et la frame d'arrivée.
 */
const STYLE =
  'Photoreal cinematic footage, dawn on a misty alpine lake, cold blue light, ' +
  'a pale amber band low on the horizon, a long bank of low fog lying on the water, ' +
  'filmic contrast, fine natural grain, real time, no slow motion, 24 fps look.'

/**
 * Les interdits, repliés en fin de prompt positif : Seedance n'a pas de champ
 * `negative_prompt`. Le leurre est déjà dessiné dans les keyframes — le risque
 * n'est pas qu'il soit inventé, mais qu'il se déforme entre deux frames.
 */
const AVOID =
  'Avoid entirely: text, captions, watermark, logo, brand name, extra fish, ' +
  'extra boats, birds, morphing lure, changing lure colour, extra hooks, ' +
  'duplicated lure, readable human face, cartoon look, HDR oversaturation.'

/**
 * Le leurre tel qu'il apparaît dans les keyframes — rappelé dans les segments
 * où il est à l'écran, pour que le moteur le garde identique d'un bout à l'autre.
 */
const LURE =
  'a small two-section jointed swimbait (olive-yellow back, soft pink flank band, ' +
  'pearl-white belly, translucent forked tail, two exposed metal pin joints, ' +
  'two dark treble hooks)'

/** Les 7 segments. `action` décrit le mouvement entre la frame in et la frame out. */
const SEGMENTS = [
  {
    from: 'k1',
    to: 'k2',
    title: 'Le lac — descente sur le bateau',
    action:
      'Aerial drone shot descending fast toward a single black bass boat cutting across ' +
      'the calm lake, its white wake trailing behind. The drone dives and closes in from ' +
      'behind and above, dropping until it flies just above the churning wake at deck ' +
      'height, ending framed on the back of the boat: two anglers seated at the console, ' +
      'one standing at the bow holding a spinning rod, all seen strictly from behind as ' +
      'dark silhouettes, mountains and the fog bank ahead.',
  },
  {
    from: 'k2',
    to: 'k3',
    title: "À bord — l'armé",
    action:
      'The boat glides to a stop, its wake fading, the water turning to glass. The ' +
      'standing angler, seen strictly from behind, sweeps his spinning rod back and up ' +
      `to load a cast: the blank bends into a deep curve and the line swings ${LURE} ` +
      'up into the air above and left of the boat, hanging at the top of the backswing. ' +
      'Camera holds steady behind the boat, slight forward drift, no cut.',
  },
  {
    from: 'k3',
    to: 'k4',
    title: 'Le lancer — départ au ras de l’eau',
    action:
      `The cast fires: the rod whips forward and ${LURE} launches out over the lake. ` +
      'The camera leaves the boat and chases the lure in one continuous move, skimming ' +
      'fast just above the glassy surface, the water streaking past below with motion ' +
      'blur, the thin fishing line trailing behind the flying lure in a long arc, the ' +
      'fog bank and sunrise glow ahead, no cut.',
  },
  {
    from: 'k4',
    to: 'k5',
    title: 'Le vol — au plus près du leurre',
    action:
      `Continuous low chase over the water: the camera closes alongside ${LURE} as it ` +
      'flies through drifting mist, ending in close-up on the lure in mid-air, treble ' +
      'hooks hanging, the taut line running back to the right of frame, pale sunrise ' +
      'glow on the left, mirror-calm water below, the lure just beginning to drop, no cut.',
  },
  {
    from: 'k5',
    to: 'k6',
    title: "L'impact — la caméra passe sous l'eau",
    action:
      'The lure drops and pierces the mirror surface, and the camera plunges through ' +
      'with it in one continuous move: from below, a compact splash crown blooms against ' +
      'the bright rippling ceiling of the surface, a column of white bubbles trails the ' +
      `lure as ${LURE} dives nose-down into cold blue-green water, the thin line angling ` +
      'up toward the surface, light rays bending through, no cut.',
  },
  {
    from: 'k6',
    to: 'k7',
    title: 'La nage — le profil',
    action:
      `${LURE} levels off at depth and starts to swim: it turns nose-first and settles ` +
      'into a steady S-shaped swimming action, the rear section kicking around the metal ' +
      'pin joints while the head holds its line, shedding micro-bubbles. The camera ' +
      'settles into a tracking profile shot at lure height, matching its speed, sharp ' +
      'sunlight shafts falling from the surface, a dark weed wall sliding past in the ' +
      'background gloom, fine particles drifting.',
  },
  {
    from: 'k7',
    to: 'k8',
    title: "L'attaque — le black-bass",
    action:
      'From the dark weeds behind, a huge largemouth bass surges forward and strikes: ' +
      'it closes on the swimming lure head-on with its mouth wide open, gill plates ' +
      'flaring, water swirling off its flanks, dwarfing the small lure. The camera holds ' +
      'the profile framing as the bass fills the right of frame, natural largemouth bass ' +
      'anatomy, dark olive scales, sunlight shafts above, no cut.',
  },
]

const INPUT_DEFAULTS = {
  // Plafond de l'endpoint : 720p. C'est la définition des rushes, pas celle
  // servie au site — l'encodage final (spec-technique.md) repart de là.
  resolution: '720p',
  // 5 s par segment : assez pour que le mouvement s'installe, assez court pour
  // que le moteur ne dérive pas loin des deux keyframes qui le bornent.
  duration: '5',
  // Les keyframes font 2752×1536 (~1.79:1) : `auto` cale le cadre sur l'image
  // au lieu de recadrer vers 16:9 strict.
  aspect_ratio: 'auto',
  // Le hero est muet par décision (spec vidéo, décision n°6).
  generate_audio: false,
}

function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith('--'))
  for (const flag of flags) {
    if (flag !== '--dry-run') throw new Error(`Option inconnue : ${flag}`)
  }
  const numbers = argv.filter((a) => !a.startsWith('--')).map((a) => Number(a))
  for (const n of numbers) {
    if (!Number.isInteger(n) || n < 1 || n > SEGMENTS.length) {
      throw new Error(`Segment inconnu : « ${n} ». Attendu : 1 à ${SEGMENTS.length}.`)
    }
  }
  return { dryRun: flags.includes('--dry-run'), only: numbers }
}

async function uploadFrames(needed) {
  const urls = new Map()
  for (const name of needed) {
    const path = join(FRAMES_DIR, `${name}.png`)
    const bytes = await readFile(path) // ENOENT = échec bruyant, c'est voulu
    process.stdout.write(`   upload ${name}.png (${(bytes.length / 1048576).toFixed(1)} Mo)…`)
    urls.set(name, await fal.storage.upload(new File([bytes], `${name}.png`, { type: 'image/png' })))
    console.log(' ok')
  }
  return urls
}

async function generate(segment, index, urls) {
  const prompt = `${STYLE}\n\n${segment.action}\n\n${AVOID}`
  const slug = `seg${index}-${segment.from}-${segment.to}`

  const input = {
    ...INPUT_DEFAULTS,
    prompt,
    image_url: urls.get(segment.from),
    end_image_url: urls.get(segment.to),
  }

  process.stdout.write(`   génération…`)
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
      `${slug} : fal a répondu sans URL de vidéo (requête ${result.requestId}). ` +
        'Relance ce segment seul pour voir la réponse complète.'
    )
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${slug} : téléchargement impossible (HTTP ${response.status}).`)
  }
  const video = Buffer.from(await response.arrayBuffer())
  const target = join(OUTPUT_DIR, `${slug}.mp4`)
  await writeFile(target, video)
  await writeFile(
    join(OUTPUT_DIR, `${slug}.json`),
    JSON.stringify(
      {
        segment: index,
        title: segment.title,
        model: MODEL,
        sourceFrames: {
          in: join(FRAMES_DIR, `${segment.from}.png`),
          out: join(FRAMES_DIR, `${segment.to}.png`),
        },
        input: { ...input, image_url: '(upload fal)', end_image_url: '(upload fal)' },
        prompt,
        requestId: result.requestId,
        seed: result.data?.seed ?? null,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    ) + '\n'
  )
  console.log(` ${target} (${(video.length / 1048576).toFixed(1)} Mo, seed ${result.data?.seed ?? '—'})`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const wanted = options.only.length
    ? options.only.map((n) => ({ segment: SEGMENTS[n - 1], index: n }))
    : SEGMENTS.map((segment, i) => ({ segment, index: i + 1 }))

  console.log(
    `${wanted.length} segment(s) · ${INPUT_DEFAULTS.duration} s · ${INPUT_DEFAULTS.resolution} · ` +
      `son coupé${options.dryRun ? ' · DRY RUN, aucun appel API' : ''}`
  )

  if (options.dryRun) {
    for (const { segment, index } of wanted) {
      console.log(`\nSegment ${index} — ${segment.title}  (${segment.from} → ${segment.to})`)
      console.log(`${STYLE}\n\n${segment.action}\n\n${AVOID}`.replace(/^/gm, '   '))
    }
    return
  }

  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY absente de l’environnement — elle se colle dans `.env.local`.')
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  const needed = [...new Set(wanted.flatMap(({ segment }) => [segment.from, segment.to]))]
  console.log(`\nUpload des ${needed.length} keyframes vers le stockage fal :`)
  const urls = await uploadFrames(needed)

  // Séquentiel, et un échec n'emporte pas les segments déjà réussis : chaque
  // rush coûte de l'argent, on garde ce qui est bon et on liste ce qui a raté.
  const failures = []
  for (const { segment, index } of wanted) {
    console.log(`\nSegment ${index}/${SEGMENTS.length} — ${segment.title}  (${segment.from} → ${segment.to})`)
    try {
      await generate(segment, index, urls)
    } catch (error) {
      console.error(`   ÉCHEC : ${error.message}`)
      failures.push({ index, message: error.message })
    }
  }

  if (failures.length) {
    console.error(
      `\n${failures.length} segment(s) en échec : ${failures.map((f) => f.index).join(', ')}. ` +
        `Relance ciblée : npm run video:scroll -- ${failures.map((f) => f.index).join(' ')}`
    )
    process.exit(1)
  }
  console.log(`\nLes ${wanted.length} segments sont dans ${OUTPUT_DIR}/.`)
}

main().catch((error) => {
  console.error('\n' + error.message)
  process.exit(1)
})
