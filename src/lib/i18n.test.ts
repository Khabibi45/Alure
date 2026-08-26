// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  LOCALES,
  TRANSLATED_PATHS,
  hasTranslation,
  localePath,
  localePathOrHome,
} from '@/lib/i18n/paths'
import { formatLength } from '@/lib/shop/product'

/**
 * Le filet qui rend le multilingue SÛR.
 *
 * Règle Alure n°6 (CLAUDE.md) : le site n'existe qu'en français et en anglais, et
 * **tout texte visible modifié est porté en anglais dans le MÊME commit**. Un oubli
 * ne casse rien à la compilation — il produit une page à moitié traduite. Ces tests
 * transforment l'oubli en gate rouge.
 *
 * Le français fait foi : c'est lui la référence, l'anglais s'y compare.
 *
 * L'angle mort que ces tests couvrent depuis le 2026-08-25 : ils ne connaissaient
 * que `docs/i18n/`, jamais `LOCALES`. On pouvait donc ajouter un fichier de langue
 * sans l'inscrire dans le code (dictionnaire mort embarqué dans le bundle), ou
 * retirer une langue de `LOCALES` en laissant sa source (même effet). Les deux
 * moitiés du changement doivent désormais partir ensemble.
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
  it('ne sert QUE le français et l’anglais', () => {
    expect(
      LANGUAGES,
      'le périmètre est français + anglais (CLAUDE.md, règle Alure n°6) — ajouter ou retirer une langue est une décision du propriétaire, pas un effet de bord : elle touche LOCALES, le sitemap, les hreflang, le sélecteur et les redirections'
    ).toEqual(['en'])
  })

  it('a exactement les mêmes langues dans docs/i18n/ et dans LOCALES', () => {
    const sources = [...LANGUAGES, 'fr'].sort()
    expect(
      sources,
      'LOCALES ne correspond pas aux fichiers de docs/i18n/ — les deux moitiés du changement doivent partir ensemble, sinon un dictionnaire mort part en production ou une langue déclarée n’a aucun texte'
    ).toEqual([...LOCALES].sort())
  })

  it('n’a pas de clé LANG.* orpheline', () => {
    // Toutes les clés `LANG.*` ne sont pas des codes de langue : certaines
    // habillent le sélecteur lui-même. Elles sont listées ici NOMMÉMENT, pour
    // qu'en ajouter une soit un geste conscient — et non un moyen d'échapper
    // au contrôle de correspondance avec `LOCALES`.
    const NON_CODES = new Set(['LANG.LABEL', 'LANG.NO_TRANSLATION'])
    const declared = reference.keys
      .filter((k) => k.startsWith('LANG.') && !NON_CODES.has(k))
      .map((k) => k.slice('LANG.'.length).toLowerCase())
      .sort()
    expect(
      declared,
      'clé LANG.XX orpheline ou manquante — le sélecteur (src/lib/i18n/chrome.ts) ne lit que LANG.<code> pour les LOCALES'
    ).toEqual([...LOCALES].sort())
  })

  it('TRANSLATED_PATHS correspond aux routes réellement présentes sous src/app/[lang]/', () => {
    // Le sélecteur de langue et les hreflang se fient à cette liste. Si une
    // route traduite est ajoutée sans être inscrite ici, le sélecteur enverra
    // à l'accueil une page qui existait ; si une entrée reste ici après la
    // suppression de sa route, il enverra sur « Page introuvable » — c'est
    // exactement le bug qui touchait 11 pages sur 13.
    const LANG_DIR = join(process.cwd(), 'src', 'app', '[lang]')
    const routes = readdirSync(LANG_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('['))
      .map((entry) => `/${entry.name}`)
    // L'accueil est le `page.tsx` posé à la racine de `[lang]`.
    const found = ['/', ...routes].sort()
    expect(
      found,
      'TRANSLATED_PATHS ne correspond plus aux routes de src/app/[lang]/ — le sélecteur de langue enverrait vers une page introuvable, ou vers l’accueil alors que la page existe'
    ).toEqual([...TRANSLATED_PATHS].sort())
  })

  it('conduit chaque page traduite vers sa version dans la langue visée', () => {
    for (const path of TRANSLATED_PATHS) {
      expect(hasTranslation(path)).toBe(true)
      expect(localePathOrHome('en', path)).toBe(localePath('en', path))
    }
  })

  it('replie sur l’accueil — jamais sur une page introuvable — pour un chemin non traduit', () => {
    // Les routes de travail du hero n'existent qu'en français, volontairement.
    for (const path of ['/hero-scroll', '/hero-video', '/nimporte-quoi']) {
      expect(hasTranslation(path)).toBe(false)
      expect(localePathOrHome('en', path)).toBe('/en')
      expect(localePathOrHome('fr', path)).toBe('/')
    }
  })

  it('donne à chaque langue servie sa convention décimale', () => {
    for (const locale of LOCALES) {
      expect(
        formatLength(locale),
        `${locale} : locale sans convention décimale — formatLength rendrait un nombre mal ponctué`
      ).toMatch(/^6[.,]5 cm$/)
    }
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
    // `>=` et non `===`, comme pour la marque juste au-dessus : l'anglais doit
    // CONSERVER la mention française telle quelle — il a le droit de la répéter
    // là où il l'accompagne d'une glose. Ce qui est interdit, c'est de la
    // traduire ou de la perdre, et `>=` l'attrape.
    expect(
      countOf(raw, 'art. 293 B du CGI'),
      `${code}.md : la mention « art. 293 B du CGI » ne se traduit pas et ne se perd pas`
    ).toBeGreaterThanOrEqual(countOf(referenceRaw, 'art. 293 B du CGI'))
  })

  it.each(LANGUAGES)('%s.md n’affiche aucune devise autre que l’euro', (code) => {
    const raw = readFileSync(join(I18N_DIR, `${code}.md`), 'utf8')
    expect(raw).not.toMatch(/[$£¥]|USD|GBP|CHF/)
  })
})
