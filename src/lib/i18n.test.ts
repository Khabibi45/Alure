// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Le filet qui rend le multilingue SÛR.
 *
 * Règle posée le 2026-08-06 : toute modification de texte du site doit être portée
 * dans TOUTES les langues. Un oubli ne casse rien à la compilation — il produit une
 * page moitié traduite, ou pire, une phrase manquante chez un visiteur étranger.
 * Ces tests transforment l'oubli en gate rouge.
 *
 * Le français fait foi : c'est lui la référence, les autres s'y comparent.
 */

const I18N_DIR = join(process.cwd(), 'docs', 'i18n')
const KEY_LINE = /^- `([A-Z][A-Z0-9_.]*)`/
const PLACEHOLDER = /\{[a-zA-Z]+\}/g

function readLanguage(code: string): { keys: string[]; placeholders: Map<string, string[]> } {
  const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
  const keys: string[] = []
  const placeholders = new Map<string, string[]>()
  for (const line of raw.split('\n')) {
    const match = KEY_LINE.exec(line)
    if (!match) continue
    const key = match[1]
    keys.push(key)
    placeholders.set(key, (line.match(PLACEHOLDER) ?? []).sort())
  }
  return { keys, placeholders }
}

const LANGUAGES = readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .map((f) => f.replace('.md', ''))
  .filter((code) => code !== 'fr')

const reference = readLanguage('fr')

describe('i18n — le français fait foi', () => {
  it('déclare au moins une langue traduite', () => {
    expect(LANGUAGES.length).toBeGreaterThan(0)
  })

  it('n’a aucune clé en double dans la référence', () => {
    expect(new Set(reference.keys).size).toBe(reference.keys.length)
  })

  it.each(LANGUAGES)('%s.md a exactement les mêmes clés que fr.md', (code) => {
    const lang = readLanguage(code)
    const missing = reference.keys.filter((k) => !lang.keys.includes(k))
    const extra = lang.keys.filter((k) => !reference.keys.includes(k))
    expect(missing, `clés absentes de ${code}.md — un texte resterait vide`).toEqual([])
    expect(extra, `clés inconnues dans ${code}.md — elles ne seront jamais affichées`).toEqual([])
  })

  it.each(LANGUAGES)('%s.md garde les clés dans le même ordre', (code) => {
    expect(readLanguage(code).keys).toEqual(reference.keys)
  })

  it.each(LANGUAGES)('%s.md conserve tous les placeholders, à l’identique', (code) => {
    // Le défaut le plus grave : un {montant} traduit ou disparu afficherait une
    // phrase sans son prix. Il ne se verrait qu'en production, chez le client.
    const lang = readLanguage(code)
    for (const key of reference.keys) {
      expect(lang.placeholders.get(key), `${code}.md → ${key} : placeholders altérés`).toEqual(
        reference.placeholders.get(key)
      )
    }
  })

  it.each(LANGUAGES)('%s.md ne traduit ni la marque ni la mention légale française', (code) => {
    const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
    const referenceRaw = readFileSync(join(I18N_DIR, 'fr.md'), 'utf8')
    const countOf = (text: string, needle: string) => text.split(needle).length - 1
    expect(countOf(raw, 'Alure')).toBeGreaterThanOrEqual(countOf(referenceRaw, 'Alure'))
    expect(countOf(raw, 'art. 293 B du CGI')).toBe(countOf(referenceRaw, 'art. 293 B du CGI'))
  })

  it.each(LANGUAGES)('%s.md n’affiche aucune devise autre que l’euro', (code) => {
    const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
    expect(raw).not.toMatch(/[$£¥]|USD|GBP|CHF/)
  })
})
