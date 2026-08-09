// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { DICTIONARIES } from './dictionaries.gen'

/**
 * Le filet de FRAÎCHEUR du généré : `dictionaries.gen.ts` doit être le reflet
 * exact de `docs/i18n/*.md`. Modifier un texte sans relancer `npm run i18n`
 * publierait l'ancien texte en silence — ce test transforme l'oubli en gate rouge.
 */

const I18N_DIR = join(process.cwd(), 'docs', 'i18n')
const KEY_LINE = /^- `([A-Z][A-Z0-9_.]*)` — (.*)$/

function parseLanguage(code: string): Record<string, string> {
  const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
  const entries: Record<string, string> = {}
  // `\r?\n` : mêmes fins de ligne mixtes que le générateur (CRLF possibles).
  for (const line of raw.split(/\r?\n/)) {
    const match = KEY_LINE.exec(line)
    if (match) entries[match[1]] = match[2].trim()
  }
  return entries
}

describe('i18n — le généré est le reflet exact des sources', () => {
  const codes = readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => f.replace('.md', ''))

  it('couvre exactement les langues présentes dans docs/i18n/', () => {
    expect(Object.keys(DICTIONARIES).sort()).toEqual(codes.sort())
  })

  it.each(codes)('%s : dictionnaire généré identique au fichier source', (code) => {
    expect(
      DICTIONARIES[code as keyof typeof DICTIONARIES],
      `désynchronisé — lance \`npm run i18n\``
    ).toEqual(parseLanguage(code))
  })
})
