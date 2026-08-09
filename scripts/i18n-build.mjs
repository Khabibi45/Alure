/**
 * Génère `src/lib/i18n/dictionaries.gen.ts` depuis `docs/i18n/*.md`.
 *
 * Les fichiers Markdown restent LA source (un par langue, mêmes clés partout —
 * le standard est `docs/i18n/README.md`, le filet `src/lib/i18n.test.ts`).
 * On génère un module TypeScript plutôt que de lire `docs/` au runtime : le
 * bundle autonome de Vercel n'embarque pas `docs/`, et un fichier généré est
 * vérifiable par un test de fraîcheur (`src/lib/i18n/gen.test.ts`).
 *
 * Usage : `npm run i18n` — à relancer après toute modification de docs/i18n/.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const I18N_DIR = join(process.cwd(), 'docs', 'i18n')
const OUT_DIR = join(process.cwd(), 'src', 'lib', 'i18n')
const OUT = join(OUT_DIR, 'dictionaries.gen.ts')

/** La même grammaire que le test de parité : `- \`CLÉ\` — valeur`. */
const KEY_LINE = /^- `([A-Z][A-Z0-9_.]*)` — (.*)$/

function parseLanguage(code) {
  const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
  const entries = {}
  // `\r?\n` : certains fichiers sont en CRLF, et en regex JS `.` ne matche pas
  // `\r` — un split sur `\n` seul ferait échouer `(.*)$` sur chaque ligne.
  for (const line of raw.split(/\r?\n/)) {
    const match = KEY_LINE.exec(line)
    if (!match) continue
    if (entries[match[1]] !== undefined) {
      throw new Error(`${code}.md : clé en double « ${match[1]} »`)
    }
    entries[match[1]] = match[2].trim()
  }
  if (Object.keys(entries).length === 0) {
    throw new Error(`${code}.md : aucune clé lue — le format a changé ?`)
  }
  return entries
}

const codes = readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .map((f) => f.replace('.md', ''))
  .sort()

const dictionaries = {}
for (const code of codes) dictionaries[code] = parseLanguage(code)

// Échec bruyant dès la génération : une clé absente d'une langue ne doit pas
// attendre le runtime (le test de parité le garantit aussi, ceinture-bretelles).
const reference = Object.keys(dictionaries.fr)
for (const code of codes) {
  const keys = Object.keys(dictionaries[code])
  if (keys.length !== reference.length || reference.some((k) => !(k in dictionaries[code]))) {
    throw new Error(`${code}.md : clés désalignées avec fr.md — lance les tests i18n.`)
  }
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(
  OUT,
  `// GÉNÉRÉ par \`npm run i18n\` (scripts/i18n-build.mjs) — NE PAS ÉDITER À LA MAIN.
// Source de vérité : docs/i18n/*.md (le français fait foi).
// Fraîcheur garantie par src/lib/i18n/gen.test.ts.

export const DICTIONARIES = ${JSON.stringify(dictionaries, null, 2)} as const
`
)
console.log(`ok ${OUT} (${codes.join(', ')} — ${reference.length} clés)`)
