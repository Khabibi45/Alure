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
    /**
     * Part des triangles CONSERVÉS. 1 = aucune décimation (le défaut : on ne
     * touche pas à un maillage sans le demander). Les leurres souples sortent
     * à 1,1 million de triangles et se servent autour de 0.12.
     */
    simplify: flag('simplify', 1),
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

/* ─────────────────────── Décimation de la géométrie ─────────────────────── */

/**
 * Les leurres souples sortent de Blender à 1,1 million de triangles pièce, soit
 * 30 Mo une fois les textures réduites — cinq à huit fois les modèles précédents.
 * Le poids n'est plus dans les images mais dans les sommets, et 90 % du trafic
 * est mobile.
 *
 * On décime donc HORS LIGNE, à la compilation. C'est la seule voie qui ne touche
 * pas à la CSP : les formats compressés (Draco, meshopt) exigent un décodeur
 * chargé dans le navigateur, donc `wasm-unsafe-eval` — la décision que l'en-tête
 * de ce fichier refuse de prendre en douce. Ici, le navigateur reçoit un GLB
 * ordinaire, simplement plus léger.
 */
const COMPONENT = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
}
const ITEMS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }

/** Lit un accessor en tableau typé compact, en tenant compte de l'entrelacement. */
function readAccessor(json, bin, index) {
  const acc = json.accessors[index]
  const Ctor = COMPONENT[acc.componentType]
  const items = ITEMS[acc.type]
  const view = json.bufferViews[acc.bufferView]
  const base = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0)
  const out = new Ctor(acc.count * items)
  const stride = view.byteStride ?? items * Ctor.BYTES_PER_ELEMENT
  for (let i = 0; i < acc.count; i++) {
    const at = base + i * stride
    for (let c = 0; c < items; c++) {
      out[i * items + c] = new Ctor(
        bin.buffer,
        bin.byteOffset + at + c * Ctor.BYTES_PER_ELEMENT,
        1
      )[0]
    }
  }
  return { array: out, items, componentType: acc.componentType, type: acc.type }
}

/**
 * Prépare les UV et les normales pour le simplificateur, entrelacés en un seul
 * tableau de flottants comme il les attend.
 *
 * Les POIDS disent combien un écart d'attribut « coûte » face à un écart de
 * position. Ceux-ci ont été choisis en mesurant l'étirement des UV sur le leurre
 * bleu : les UV pèsent le plus (c'est la texture qui trahit une couture fondue),
 * les normales cinq fois moins (elles ne servent qu'à retenir le modelé).
 *
 * Renvoie `null` si un attribut manque ou n'est pas en flottants : mieux vaut
 * retomber sur la simplification par positions seules que nourrir le
 * simplificateur avec des entiers quantifiés lus comme des flottants.
 */
const POIDS_UV = 1
const POIDS_NORMALE = 0.2

function readSimplifyAttributes(json, bin, prim, vertexCount) {
  const uvIndex = prim.attributes.TEXCOORD_0
  const normalIndex = prim.attributes.NORMAL
  if (uvIndex === undefined || normalIndex === undefined) return null

  const uv = readAccessor(json, bin, uvIndex)
  const normal = readAccessor(json, bin, normalIndex)
  if (uv.componentType !== 5126 || normal.componentType !== 5126) return null
  if (uv.array.length / 2 !== vertexCount || normal.array.length / 3 !== vertexCount) return null

  const stride = 5
  const values = new Float32Array(vertexCount * stride)
  for (let i = 0; i < vertexCount; i++) {
    values[i * stride] = uv.array[i * 2]
    values[i * stride + 1] = uv.array[i * 2 + 1]
    values[i * stride + 2] = normal.array[i * 3]
    values[i * stride + 3] = normal.array[i * 3 + 1]
    values[i * stride + 4] = normal.array[i * 3 + 2]
  }
  return {
    values,
    stride,
    weights: [POIDS_UV, POIDS_UV, POIDS_NORMALE, POIDS_NORMALE, POIDS_NORMALE],
  }
}

/** Ajoute un tableau typé au GLB comme nouveau bufferView + accessor. */
function pushAccessor(json, rewritten, array, { items, componentType, type, target, min, max }) {
  const buffer = Buffer.from(array.buffer, array.byteOffset, array.byteLength)
  const viewIndex = json.bufferViews.length
  json.bufferViews.push({
    buffer: 0,
    byteOffset: 0,
    byteLength: buffer.length,
    ...(target ? { target } : {}),
  })
  rewritten.set(viewIndex, buffer)
  const accessorIndex = json.accessors.length
  json.accessors.push({
    bufferView: viewIndex,
    componentType,
    count: array.length / items,
    type,
    ...(min ? { min, max } : {}),
  })
  return accessorIndex
}

/**
 * Décime chaque primitive à `ratio` de ses triangles, puis COMPACTE : sans le
 * compactage, les sommets devenus inutiles resteraient dans le fichier et le
 * poids ne bougerait pas — c'est le tampon de sommets qui pèse, pas les indices.
 */
async function simplifyMeshes(json, bin, rewritten, ratio) {
  const { MeshoptSimplifier } = await import('meshoptimizer')
  await MeshoptSimplifier.ready
  const report = []

  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      if (prim.indices === undefined || prim.attributes?.POSITION === undefined) continue

      const idx = readAccessor(json, bin, prim.indices)
      const pos = readAccessor(json, bin, prim.attributes.POSITION)
      const before = idx.array.length / 3
      const target = Math.max(3, Math.floor(before * ratio) * 3)

      const indices = new Uint32Array(idx.array)
      const positions = new Float32Array(pos.array)

      // Le simplificateur ne regarde que les positions. Quand on lui donne AUSSI
      // les UV et les normales, il refuse de fondre deux sommets qui se
      // ressemblent en 3D mais divergent dans la texture — c'est ce qui protège
      // les coutures de la carte UV et le modelé de l'ombrage.
      const attrs = readSimplifyAttributes(json, bin, prim, pos.array.length / 3)
      // `LockBorder` garde les bords intacts : sans lui, la silhouette du leurre
      // se met à onduler là où le maillage s'ouvre.
      const [simplified] = attrs
        ? MeshoptSimplifier.simplifyWithAttributes(
            indices,
            positions,
            3,
            attrs.values,
            attrs.stride,
            attrs.weights,
            null,
            target,
            1e-2,
            ['LockBorder']
          )
        : MeshoptSimplifier.simplify(indices, positions, 3, target, 1e-2, ['LockBorder'])

      // Compactage : on ne garde que les sommets encore référencés.
      //
      // DEUX PIÈGES, tous deux traversés une fois :
      // 1. `compactMesh` retourne un COUPLE [remap, nombre de sommets gardés] —
      //    le prendre pour le remap seul produit des attributs vides et un
      //    leurre invisible, sans la moindre erreur au chargement.
      // 2. Il REMAPPE `simplified` SUR PLACE. Le tableau qui ressort est donc
      //    déjà le tampon d'indices final : réappliquer `remap` derrière donne
      //    `remap[remap[i]]`, et ces triangles-là relient des sommets au hasard
      //    d'un bout à l'autre du modèle — à l'écran, des fils tendus entre la
      //    tête et la queue. Le remap ne sert qu'à ranger les ATTRIBUTS.
      const [remap, kept] = MeshoptSimplifier.compactMesh(simplified)

      const nextAttributes = {}
      for (const [name, accessorIndex] of Object.entries(prim.attributes)) {
        const src = readAccessor(json, bin, accessorIndex)
        const Ctor = COMPONENT[src.componentType]
        const packed = new Ctor(kept * src.items)
        for (let i = 0; i < remap.length; i++) {
          const to = remap[i]
          if (to === 0xffffffff) continue
          for (let c = 0; c < src.items; c++)
            packed[to * src.items + c] = src.array[i * src.items + c]
        }
        const options = {
          items: src.items,
          componentType: src.componentType,
          type: src.type,
          target: 34962,
        }
        if (name === 'POSITION') {
          // La spec EXIGE min/max sur POSITION ; sans eux, three ne sait pas
          // calculer la boîte englobante et le calage du carrousel s'effondre.
          const min = [Infinity, Infinity, Infinity]
          const max = [-Infinity, -Infinity, -Infinity]
          for (let i = 0; i < packed.length; i += 3) {
            for (let c = 0; c < 3; c++) {
              if (packed[i + c] < min[c]) min[c] = packed[i + c]
              if (packed[i + c] > max[c]) max[c] = packed[i + c]
            }
          }
          options.min = min
          options.max = max
        }
        nextAttributes[name] = pushAccessor(json, rewritten, packed, options)
      }

      // `simplified` sort déjà remappé de `compactMesh` (cf. piège 2 ci-dessus) :
      // on le publie tel quel.
      prim.indices = pushAccessor(json, rewritten, simplified, {
        items: 1,
        componentType: 5125,
        type: 'SCALAR',
        target: 34963,
      })
      prim.attributes = nextAttributes

      report.push({ before, after: simplified.length / 3, verts: kept })
    }
  }
  return report
}

async function optimize(input, output, { max, quality, keepTangents, simplify }) {
  const original = await readFile(input)
  const { json, bin } = readGlb(original)

  const droppedTangents = keepTangents ? 0 : dropTangents(json)

  // 1) Rééchantillonnage des textures. C'est ici que se joue l'essentiel du poids.
  //
  //    ⚠️ TOUTES LES TEXTURES NE SONT PAS DES IMAGES. Une carte de normales
  //    encode un VECTEUR par pixel (RGB = XYZ), une carte metallic/roughness
  //    encode deux mesures dans le vert et le bleu. Les compresser comme une
  //    photo — qualité 82, chrominance moyennée par blocs de 2×2 — corrompt la
  //    donnée elle-même. Sur un matériau entièrement métallique, dont tout le
  //    rendu vient des reflets, ça se voit immédiatement : le leurre perd son
  //    relief et ne ressemble plus au fichier d'origine.
  //
  //    On classe donc chaque image par son RÔLE dans le matériau, et on
  //    ménage les cartes de données : pleine résolution conservée plus
  //    longtemps, qualité haute, aucun sous-échantillonnage.
  const dataImages = new Set()
  for (const material of json.materials ?? []) {
    const pbr = material.pbrMetallicRoughness ?? {}
    for (const slot of [
      material.normalTexture,
      material.occlusionTexture,
      pbr.metallicRoughnessTexture,
    ]) {
      if (slot?.index === undefined) continue
      const source = json.textures?.[slot.index]?.source
      if (source !== undefined) dataImages.add(source)
    }
  }
  const rewritten = new Map() // index de bufferView -> nouveau Buffer
  const textureReport = []
  for (const [index, image] of (json.images ?? []).entries()) {
    if (image.bufferView === undefined) continue
    const isData = dataImages.has(index)
    // Les cartes de données gardent deux fois la résolution des couleurs, et
    // une chrominance intacte : c'est là que vit le relief.
    const maxSide = isData ? max * 2 : max
    const jpegQuality = isData ? Math.max(quality, 95) : quality
    const view = json.bufferViews[image.bufferView]
    const source = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
    const meta = await sharp(source).metadata()
    const resized = await sharp(source)
      .resize({
        width: Math.min(meta.width, maxSide),
        height: Math.min(meta.height, maxSide),
        fit: 'inside',
      })
      .jpeg({
        quality: jpegQuality,
        mozjpeg: true,
        chromaSubsampling: isData ? '4:4:4' : '4:2:0',
      })
      .toBuffer()
    rewritten.set(image.bufferView, resized)
    image.mimeType = 'image/jpeg'
    textureReport.push({
      from: `${meta.width}×${meta.height} ${Math.round(source.length / 1024)} ko`,
      to: `${Math.min(meta.width, maxSide)}px ${Math.round(resized.length / 1024)} ko${isData ? ' [donnée, chrominance intacte]' : ''}`,
    })
  }

  // 2) Reconstruction du binaire : les offsets bougent dès qu'une image change
  //    de taille, donc on ré-émet chaque bufferView utilisé, dans l'ordre, en
  //    respectant l'alignement 4 octets exigé par la spec glTF.
  // 1 bis) Décimation, AVANT le recensement des vues : elle en crée de nouvelles
  //        et rend les anciennes orphelines, que `collectUsed` écartera.
  const simplifyReport = simplify < 1 ? await simplifyMeshes(json, bin, rewritten, simplify) : []

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
  for (const s of simplifyReport) {
    const pct = Math.round((1 - s.after / s.before) * 100)
    console.log(
      `   maillage ${s.before.toLocaleString('fr-FR')} → ${s.after.toLocaleString('fr-FR')} triangles (−${pct} %), ${s.verts.toLocaleString('fr-FR')} sommets`
    )
  }
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
