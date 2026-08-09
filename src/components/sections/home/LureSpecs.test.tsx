import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { LureSpecs, CHAR_MS, START_MS } from './LureSpecs'
import { LURE_MODELS } from '@/lib/lure-models'
import { formatSpecs, lineupSummary } from '@/lib/shop/product'

/**
 * Le filet de la fiche tapée au clavier.
 *
 * Le test central est celui de la RÉGRESSION vécue : l'animation repartait de
 * zéro à chaque rendu (l'effet dépendait de la référence du tableau de lignes,
 * recréée à chaque rendu par le composant), donc le panneau restait vide pour
 * toujours. « La fiche finit par s'écrire en entier » est exactement ce qui
 * était cassé.
 */

const MODEL = LURE_MODELS[0]

/** Les lignes attendues — le contrat d'affichage de la fiche. */
const EXPECTED_LINES = [formatSpecs(), lineupSummary(), ...MODEL.lines]

/** jsdom n'a pas `matchMedia` : on le fournit, figé sur `matches`. */
function stubMatchMedia(matches: boolean) {
  const list: MediaQueryList = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }
  window.matchMedia = () => list
}

/** Le texte de chaque ligne visible (le curseur est un span sans texte). */
function visibleLines(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('li')).map((li) => li.textContent ?? '')
}

describe('LureSpecs — la fiche tapée au clavier', () => {
  beforeEach(() => {
    stubMatchMedia(false)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('tape la fiche caractère par caractère, et va JUSQU’AU BOUT (la régression)', () => {
    const { container } = render(<LureSpecs model={MODEL} onClose={() => undefined} />)

    // Avant le départ : toutes les lignes existent, aucune n'est écrite.
    expect(visibleLines(container)).toEqual(EXPECTED_LINES.map(() => ''))

    // En cours de frappe : la première ligne est écrite jusqu'au 5e caractère,
    // pas remise à zéro. Chaque caractère tapé provoque un rendu — c'est ce
    // rendu qui relançait l'animation en boucle avant le correctif.
    act(() => vi.advanceTimersByTime(START_MS + CHAR_MS * 5))
    expect(visibleLines(container)[0]).toBe(EXPECTED_LINES[0].slice(0, 5))

    // Et la fiche finit ENTIÈRE — avant le correctif, elle restait vide.
    act(() => vi.advanceTimersByTime(60_000))
    expect(visibleLines(container)).toEqual(EXPECTED_LINES)
  })

  it('re-tape la fiche du nouveau leurre quand on change de modèle, fiche ouverte', () => {
    const { container, rerender } = render(<LureSpecs model={MODEL} onClose={() => undefined} />)
    act(() => vi.advanceTimersByTime(60_000))
    expect(visibleLines(container)).toEqual(EXPECTED_LINES)

    const other = LURE_MODELS[1]
    rerender(<LureSpecs model={other} onClose={() => undefined} />)
    act(() => vi.advanceTimersByTime(60_000))
    expect(visibleLines(container)).toEqual([formatSpecs(), lineupSummary(), ...other.lines])
  })

  it('donne le texte complet aux lecteurs d’écran sans attendre l’animation', () => {
    render(<LureSpecs model={MODEL} onClose={() => undefined} />)
    // Aucune avance du temps : le texte intégral est déjà dans le DOM.
    expect(screen.getByText(EXPECTED_LINES.join(' '))).toBeInTheDocument()
  })

  it('affiche tout d’un coup quand le visiteur préfère le mouvement réduit', () => {
    stubMatchMedia(true)
    const { container } = render(<LureSpecs model={MODEL} onClose={() => undefined} />)
    // Aucune avance du temps : pas d'animation à attendre.
    expect(visibleLines(container)).toEqual(EXPECTED_LINES)
  })

  it('se ferme à la touche Échap', () => {
    const onClose = vi.fn()
    render(<LureSpecs model={MODEL} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('se ferme au bouton de fermeture', () => {
    const onClose = vi.fn()
    render(<LureSpecs model={MODEL} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fermer la fiche' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
