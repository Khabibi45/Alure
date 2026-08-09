/**
 * Compresse un .glb pour le web : rééchantillonne ses textures et, au choix,
 * retire les tangentes (three les recalcule dans le shader).
 *
 * Pourquoi ce script existe : les exports Blender du leurre pèsent ~25 Mo pièce,
 * dont ~20 Mo de JPEG 4K. Un hero ne peut pas servir ça, et `public/` part dans
 * git — donc rien de brut n'y entre. Même esprit que la règle n°7 sur les
 * images : on traite AVANT d'intégrer.
 *
 *   npm run models                    → traite TOUT `assets/3d models/*.glb` vers `public/models/`
 *   node scripts/optimize-glb.mjs <entrée.glb> <sortie.glb> [--max=1024] [--quality=82] [--keep-tangents]
 *
 * Le mode sans argument est le mode normal : ajouter un leurre = déposer son .glb dans
 * `assets/3d models/`, lancer `npm run models`, puis ajouter une entrée dans
 * `src/lib/lure-models.ts`. Le nom de fichier `leurre_x.glb` devient `leurre-x.glb`.
 *
 * Ce qu'il ne fait PAS : compresser la géométrie (Draco/meshopt). Ça demande un
 * décodeur wasm servi depuis notre domaine et donc `wasm-unsafe-eval` dans la
 * CSP — décision à prendre à part, pas en douce. Cf. docs/specs/hero-3d.md.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import sharp from 'sharp'

/** Où vivent les exports Blender bruts, et où atterrissent les fichiers servis. */
const SOURCE_DIR = 'assets/3d models'
const OUTPUT_DIR = 'public/models'

const GLB_MAGIC = 0x46546c67 // 'glTF'
const CHUNK_JSON = 0x4e4f534a
const CHUNK_BIN = 0x004e4942

function parseOptions(rest) {
  const flag = (name, fallback) => {
    const hit = rest.find((a) => a.startsWith(`--${name}=`))
    return hit ? Number(hit.split('=')[1]) : fallback
  }
  return {
    max: flag('max', 1024),
    quality: flag('quality', 82),
    keepTangents: rest.includes('--keep-tangents'),
  }
}

/** `leurre_truite.glb` → `leurre-truite.glb` : un seul style de nom côté public. */
function publicName(sourceFile) {
  return basename(sourceFile).replace(/_/g, '-').toLowerCase()
}

/** Les couples (source, destination) à traiter, selon le mode d'appel. */
async function resolveJobs(argv) {
  const positional = argv.filter((a) => !a.startsWith('--'))
  if (positional.length >= 2) {
    return [{ input: positional[0], output: positional[1] }]
  }
  if (positional.length === 1) {
    throw new Error(
      'Il manque le fichier de sortie. Sans aucun argument, tout `' +
        SOURCE_DIR +
        '` est traité vers `' +
        OUTPUT_DIR +
        '`.'
    )
  }
  const entries = await readdir(SOURCE_DIR)
  const sources = entries.filter((f) => f.toLowerCase().endsWith('.glb')).sort()
  if (sources.length === 0) throw new Error(`Aucun .glb dans ${SOURCE_DIR}.`)
  await mkdir(OUTPUT_DIR, { recursive: true })
  return sources.map((file) => ({
    input: join(SOURCE_DIR, file),
    output: join(OUTPUT_DIR, publicName(file)),
  }))
}

function readGlb(buffer) {
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) throw new Error('Ce fichier n’est pas un .glb.')
  let offset = 12
  let json = null
  let bin = null
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset)
    const type = buffer.readUInt32LE(offset + 4)
    const body = buffer.subarray(offset + 8, offset + 8 + length)
    if (type === CHUNK_JSON) json = JSON.parse(body.toString('utf8'))
    else if (type === CHUNK_BIN) bin = body
    offset += 8 + length + ((4 - ((offset + 8 + length) % 4)) % 4)
  }
  if (!json || !bin) throw new Error('GLB sans chunk JSON ou BIN — cas non géré.')
  return { json, bin }
}

/** Retire les tangentes : three reconstruit la base TBN par dérivées d'écran. */
function dropTangents(json) {
  let dropped = 0
  for (const mesh of json.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      if (primitive.attributes?.TANGENT !== undefined) {
        delete primitive.attributes.TANGENT
        dropped += 1
      }
    }
  }
  return dropped
}

/**
 * Recense les accessors puis les bufferViews réellement atteignables, pour ne
 * pas recopier ce que `dropTangents` vient d'orpheliner.
 */
function collectUsed(json) {
  const accessors = new Set()
  const views = new Set()
  const markAccessor = (i) => {
    if (i !== undefined && i !== null) accessors.add(i)
  }
  for (const mesh of json.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      Object.values(primitive.attributes ?? {}).forEach(markAccessor)
      markAccessor(primitive.indices)
      for (const target of primitive.targets ?? []) Object.values(target).forEach(markAccessor)
    }
  }
  for (const animation of json.animations ?? []) {
    for (const sampler of animation.samplers ?? []) {
      markAccessor(sampler.input)
      markAccessor(sampler.output)
    }
  }
  for (const skin of json.skins ?? []) markAccessor(skin.inverseBindMatrices)

  for (const index of accessors) {
    const accessor = json.accessors[index]
    if (accessor.bufferView !== undefined) views.add(accessor.bufferView)
    if (accessor.sparse) {
      views.add(accessor.sparse.indices.bufferView)
      views.add(accessor.sparse.values.bufferView)
    }
  }
  for (const image of json.images ?? []) {
    if (image.bufferView !== undefined) views.add(image.bufferView)
  }
  return { accessors, views }
}

async function optimize(input, output, { max, quality, keepTangents }) {
  const original = await readFile(input)
  const { json, bin } = readGlb(original)

  const droppedTangents = keepTangents ? 0 : dropTangents(json)

  // 1) Rééchantillonnage des textures. C'est ici que se joue l'essentiel du poids.
  const rewritten = new Map() // index de bufferView -> nouveau Buffer
  const textureReport = []
  for (const image of json.images ?? []) {
    if (image.bufferView === undefined) continue
    const view = json.bufferViews[image.bufferView]
    const source = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
    const meta = await sharp(source).metadata()
    const resized = await sharp(source)
      .resize({ width: Math.min(meta.width, max), height: Math.min(meta.height, max), fit: 'inside' })
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .toBuffer()
    rewritten.set(image.bufferView, resized)
    image.mimeType = 'image/jpeg'
    textureReport.push({
      from: `${meta.width}×${meta.height} ${Math.round(source.length / 1024)} ko`,
      to: `${Math.min(meta.width, max)}px ${Math.round(resized.length / 1024)} ko`,
    })
  }

  // 2) Reconstruction du binaire : les offsets bougent dès qu'une image change
  //    de taille, donc on ré-émet chaque bufferView utilisé, dans l'ordre, en
  //    respectant l'alignement 4 octets exigé par la spec glTF.
  const { views: usedViews } = collectUsed(json)
  const keptViewIndexes = json.bufferViews
    .map((_, index) => index)
    .filter((index) => usedViews.has(index))
  const viewRemap = new Map(keptViewIndexes.map((oldIndex, newIndex) => [oldIndex, newIndex]))

  const chunks = []
  const nextBufferViews = []
  let cursor = 0
  for (const oldIndex of keptViewIndexes) {
    const view = json.bufferViews[oldIndex]
    const data =
      rewritten.get(oldIndex) ??
      bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
    const padding = (4 - (cursor % 4)) % 4
    if (padding) {
      chunks.push(Buffer.alloc(padding))
      cursor += padding
    }
    const next = { ...view, buffer: 0, byteOffset: cursor, byteLength: data.length }
    // byteStride ne vaut que pour les attributs de sommet ; le garder sur une
    // image produirait un GLB invalide.
    if (rewritten.has(oldIndex)) delete next.byteStride
    nextBufferViews.push(next)
    chunks.push(data)
    cursor += data.length
  }

  json.bufferViews = nextBufferViews
  for (const accessor of json.accessors ?? []) {
    if (accessor.bufferView !== undefined) accessor.bufferView = viewRemap.get(accessor.bufferView)
    if (accessor.sparse) {
      accessor.sparse.indices.bufferView = viewRemap.get(accessor.sparse.indices.bufferView)
      accessor.sparse.values.bufferView = viewRemap.get(accessor.sparse.values.bufferView)
    }
  }
  for (const image of json.images ?? []) {
    if (image.bufferView !== undefined) image.bufferView = viewRemap.get(image.bufferView)
  }

  const nextBin = Buffer.concat(chunks)
  json.buffers = [{ byteLength: nextBin.length }]

  // 3) Ré-emballage GLB : chaque chunk est aligné, le JSON complété d'espaces
  //    et le binaire de zéros (la spec l'impose, three refuse sinon).
  const jsonChunk = Buffer.from(JSON.stringify(json), 'utf8')
  const jsonPadded = Buffer.concat([
    jsonChunk,
    Buffer.alloc((4 - (jsonChunk.length % 4)) % 4, 0x20),
  ])
  const binPadded = Buffer.concat([nextBin, Buffer.alloc((4 - (nextBin.length % 4)) % 4, 0x00)])

  const header = Buffer.alloc(12)
  header.writeUInt32LE(GLB_MAGIC, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 8)
  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonPadded.length, 0)
  jsonHeader.writeUInt32LE(CHUNK_JSON, 4)
  const binHeader = Buffer.alloc(8)
  binHeader.writeUInt32LE(binPadded.length, 0)
  binHeader.writeUInt32LE(CHUNK_BIN, 4)

  const result = Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded])
  await writeFile(output, result)

  const mb = (n) => (n / 1048576).toFixed(2) + ' Mo'
  console.log(`${input} → ${output}`)
  for (const t of textureReport) console.log(`   texture ${t.from} → ${t.to}`)
  if (droppedTangents) console.log(`   tangentes retirées sur ${droppedTangents} primitive(s)`)
  console.log(
    `   ${mb(original.length)} → ${mb(result.length)} ` +
      `(−${Math.round((1 - result.length / original.length) * 100)} %)`
  )
  return { before: original.length, after: result.length }
}

async function main() {
  const argv = process.argv.slice(2)
  const options = parseOptions(argv.filter((a) => a.startsWith('--')))
  const jobs = await resolveJobs(argv)

  let before = 0
  let after = 0
  for (const job of jobs) {
    const result = await optimize(job.input, job.output, options)
    before += result.before
    after += result.after
  }

  if (jobs.length > 1) {
    const mb = (n) => (n / 1048576).toFixed(2) + ' Mo'
    console.log(
      `\n${jobs.length} modèles : ${mb(before)} → ${mb(after)} ` +
        `(−${Math.round((1 - after / before) * 100)} %)`
    )
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
