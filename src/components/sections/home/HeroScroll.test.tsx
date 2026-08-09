import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render } from '@testing-library/react'
import { HeroScroll } from './HeroScroll'
import { HERO_FADE_MS } from './HeroVideo'
import { HERO_VIDEO } from '@/lib/hero-variant'

/**
 * Le filet de l'ouverture vidéo du mode `cine` (prop `intro`).
 *
 * Ce qu'on verrouille, c'est la machine à états du relais vidéo → défilement :
 * fin de vidéo = dépose en bas de section ; lecture refusée = pas de saut ;
 * défilement du visiteur = il prend la main ; mouvement réduit = pas de vidéo.
 * Le rendu de la séquence (canvas, rAF) n'est pas testé ici — le manifeste est
 * volontairement en échec pour ne pas démarrer la boucle de dessin.
 */

vi.mock('./HeroBackdrop', () => ({ HeroBackdrop: () => null }))

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

/** LA vidéo d'ouverture — reconnaissable à sa source, `hero.mp4`. */
function introVideo(container: HTMLElement): HTMLVideoElement | null {
  return (
    Array.from(container.querySelectorAll('video')).find((video) =>
      video.innerHTML.includes(HERO_VIDEO)
    ) ?? null
  )
}

function renderHero(intro: boolean) {
  return render(
    <HeroScroll intro={intro} overlay={<h1 className="sr-only">Titre</h1>}>
      <div data-testid="scene-3d" />
    </HeroScroll>
  )
}

const scrollToMock = vi.fn()
let playImpl: () => Promise<void>

beforeEach(() => {
  stubMatchMedia(false)
  vi.useFakeTimers()
  playImpl = () => Promise.resolve()
  scrollToMock.mockReset()
  window.scrollTo = scrollToMock as unknown as typeof window.scrollTo
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  // jsdom n'implémente pas la lecture vidéo.
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: () => playImpl(),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: () => undefined,
  })
  // Manifeste en échec : la mécanique du défilement reste éteinte, l'intro non.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('test : pas de manifeste')))
  )
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('HeroScroll — l’ouverture vidéo du mode cine', () => {
  it('joue la vidéo, et la fin dépose le visiteur en bas de la section', async () => {
    const { container } = renderHero(true)
    await act(async () => {})

    const video = introVideo(container)
    expect(video).not.toBeNull()
    // Au chargement, la page est ramenée en haut (restauration manuelle).
    expect(scrollToMock).toHaveBeenCalledWith(0, 0)

    // Fin de la vidéo → saut instantané en bas de section, sous la vidéo opaque.
    await act(async () => {
      video?.dispatchEvent(new Event('ended'))
    })
    expect(scrollToMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'instant', top: expect.any(Number) })
    )
    // La vidéo se dissout puis quitte le DOM une fois le fondu joué.
    expect(video?.style.opacity).toBe('0')
    await act(async () => {
      vi.advanceTimersByTime(HERO_FADE_MS + 50)
    })
    expect(introVideo(container)).toBeNull()
  })

  it('lecture refusée : pas de simulacre, pas de saut — le défilement a la main', async () => {
    playImpl = () => Promise.reject(new Error('autoplay refusé'))
    const { container } = renderHero(true)
    await act(async () => {})

    const video = introVideo(container)
    expect(video?.style.opacity).toBe('0')
    // Un seul appel : la remise en haut du chargement. Aucun saut en bas.
    expect(scrollToMock).toHaveBeenCalledTimes(1)
    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })

  it('défiler pendant la vidéo = prendre la main, sans être déplacé', async () => {
    const { container } = renderHero(true)
    await act(async () => {})

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    await act(async () => {
      fireEvent.scroll(window)
    })

    expect(introVideo(container)?.style.opacity).toBe('0')
    // Toujours un seul appel (la remise en haut) : le visiteur n'a pas bougé.
    expect(scrollToMock).toHaveBeenCalledTimes(1)
  })

  it('en mouvement réduit, aucune vidéo d’ouverture ne se monte', async () => {
    stubMatchMedia(true)
    const { container } = renderHero(true)
    await act(async () => {})
    expect(introVideo(container)).toBeNull()
  })

  it('sans le mode intro, aucune vidéo d’ouverture', async () => {
    const { container } = renderHero(false)
    await act(async () => {})
    expect(introVideo(container)).toBeNull()
    // Et la position de défilement du visiteur n'est jamais touchée.
    expect(scrollToMock).not.toHaveBeenCalled()
  })
})
