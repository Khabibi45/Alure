/**
 * Lit les 8 plans du hero DEPUIS la spec — `docs/specs/video/prompts-plans.md`.
 *
 * Pourquoi un parseur plutôt qu'un tableau recopié : la spec dit d'elle-même
 * qu'elle est « la source canonique des prompts », et le storyboard HTML en est
 * déjà une vue dérivée. Un troisième exemplaire des prompts dans un script
 * dériverait au premier ajustement, et on générerait 4 € de vidéo sur un prompt
 * périmé sans le voir. Ici, corriger la spec suffit.
 *
 * Le parseur est volontairement intransigeant : il ne devine rien et jette dès
 * qu'une structure attendue manque. Un plan muet vaut mieux qu'un plan généré
 * avec un prompt tronqué.
 */
import { readFile } from 'node:fs/promises'

export const SPEC_PATH = 'docs/specs/video/prompts-plans.md'

/** Le nombre de plans est un invariant de la spec (8 plans / 240 images / 10 s). */
const EXPECTED_PLANS = 8

/**
 * Les plans où le leurre à l'écran doit être NOTRE rendu 3D, incrusté au
 * compositing. La spec impose d'y remplacer la description du leurre par un
 * témoin gris avant d'appeler le moteur : « un volume gris mat ne peut pas
 * inventer un coloris ni un troisième hameçon ».
 */
const STAND_IN_PLANS = new Set(['P05', 'P06', 'P07', 'P08'])

function section(markdown, id) {
  const match = markdown.match(new RegExp(`^## ${id} — (.+?)$([\\s\\S]*?)(?=^## |\\Z)`, 'm'))
  if (!match) throw new Error(`${SPEC_PATH} : section « ## ${id} » introuvable.`)
  return { title: match[1].trim(), body: match[2] }
}

function fencedAfter(body, heading, id) {
  const match = body.match(
    new RegExp(`\\*\\*${heading}\\*\\*\\s*\\n+\`\`\`text\\n([\\s\\S]*?)\\n\`\`\``)
  )
  if (!match) throw new Error(`${SPEC_PATH} : bloc « ${heading} » introuvable dans ${id}.`)
  const text = match[1].trim()
  if (!text) throw new Error(`${SPEC_PATH} : bloc « ${heading} » vide dans ${id}.`)
  return text
}

/** Le tableau de montage : `| P01 | Le lac | IA vidéo | Veo 3 | 34 | …` */
function montage(markdown) {
  const rows = new Map()
  const re = /^\|\s*(P0\d)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|/gm
  let row
  while ((row = re.exec(markdown)) !== null) {
    rows.set(row[1], { title: row[2], fabrication: row[3], engine: row[4], frames: Number(row[5]) })
  }
  return rows
}

/**
 * Le témoin gris : la phrase de remplacement, puis le tableau plan par plan des
 * chaînes à remplacer (`| P05 | \`a small 6.5 cm jointed fishing lure…\` |`).
 */
function standIn(markdown) {
  const replacement = markdown.match(/`(a matte grey featureless two-part stand-in object[^`]*)`/)
  if (!replacement) {
    throw new Error(
      `${SPEC_PATH} : la phrase du témoin gris est introuvable. Les plans ${[...STAND_IN_PLANS].join(', ')} ` +
        'ne peuvent pas être générés sans elle — un moteur à qui on décrit le leurre en invente un.'
    )
  }
  const targets = new Map()
  const re = /^\s*\|\s*(P0\d)\s*\|\s*`([^`]+)`\s*\|\s*$/gm
  let row
  while ((row = re.exec(markdown)) !== null) targets.set(row[1], row[2])
  return { replacement: replacement[1], targets }
}

/**
 * Les deux coupes qui réutilisent le même fichier — la spec les note en gras :
 * `| **\`p04-in\`** | **= \`p03-out\`, le même fichier** | …`
 */
function frameAliases(markdown) {
  const aliases = new Map()
  const re = /\|\s*\*\*`(p\d{2}-in)`\*\*\s*\|\s*\*\*=\s*`(p\d{2}-out)`/g
  let row
  while ((row = re.exec(markdown)) !== null) aliases.set(row[1], row[2])
  return aliases
}

/**
 * Applique la substitution du témoin gris et vérifie qu'elle a bien mordu.
 *
 * C'est le garde-fou du critère d'acceptation n°3 de la spec (« aucun leurre
 * inventé par un modèle génératif n'apparaît »). Si la chaîne du tableau ne se
 * retrouve plus mot pour mot dans le prompt — parce que l'un des deux a été
 * reformulé — on refuse de générer plutôt que d'envoyer la description complète
 * du leurre au moteur.
 */
function applyStandIn(id, prompt, { replacement, targets }) {
  if (!STAND_IN_PLANS.has(id)) return { prompt, standInApplied: false }

  const target = targets.get(id)
  if (!target) {
    throw new Error(
      `${SPEC_PATH} : ${id} est un plan à témoin gris mais n'a pas de ligne dans le tableau ` +
        'de substitution. Ajoute-la, ou retire le plan de STAND_IN_PLANS en connaissance de cause.'
    )
  }
  if (!prompt.includes(target)) {
    throw new Error(
      `${SPEC_PATH} : la chaîne à remplacer de ${id} ne se retrouve pas dans son prompt vidéo.\n` +
        `  attendue : « ${target} »\n` +
        "  La spec et son tableau de substitution ont dérivé l'un par rapport à l'autre. " +
        'Générer maintenant enverrait la description complète du leurre au moteur — ' +
        "et le hero montrerait un leurre qui n'existe pas."
    )
  }
  return { prompt: prompt.replace(target, replacement), standInApplied: true }
}

/**
 * @returns {Promise<Array<{id, title, engine, frames, fabrication, prompt, negative,
 *   standInApplied, inFrame, outFrame}>>}
 */
export async function loadPlans(specPath = SPEC_PATH) {
  const markdown = await readFile(specPath, 'utf8')
  const rows = montage(markdown)
  const substitution = standIn(markdown)
  const aliases = frameAliases(markdown)

  const plans = []
  for (let n = 1; n <= EXPECTED_PLANS; n += 1) {
    const id = `P0${n}`
    const { title, body } = section(markdown, id)
    const raw = fencedAfter(body, 'Prompt vidéo', id)
    const negative = fencedAfter(body, 'À exclure \\(negative prompt\\)', id)
    const { prompt, standInApplied } = applyStandIn(id, raw, substitution)

    const inName = `p0${n}-in`
    const outName = `p0${n}-out`
    plans.push({
      id,
      title,
      engine: rows.get(id)?.engine ?? 'inconnu',
      fabrication: rows.get(id)?.fabrication ?? 'inconnue',
      frames: rows.get(id)?.frames ?? null,
      prompt,
      negative,
      standInApplied,
      // `p04-in` et `p06-in` n'existent pas : ce sont les images de sortie des
      // plans précédents, réutilisées telles quelles (coupes en continuité pure).
      inFrame: aliases.get(inName) ?? inName,
      outFrame: outName,
    })
  }

  if (plans.length !== EXPECTED_PLANS) {
    throw new Error(`${SPEC_PATH} : ${plans.length} plans lus, ${EXPECTED_PLANS} attendus.`)
  }
  return plans
}
