/**
 * La séquence d'images du hero, décrite par `public/hero-frames/manifest.json`
 * — écrit par `npm run frames`.
 *
 * Le nombre d'images n'est PAS en dur ici : re-découper les segments avec un
 * autre réglage changerait le compte, et un chiffre figé côté React ferait
 * afficher des images manquantes ou en oublier la fin, sans rien signaler.
 */

export const HERO_FRAMES_DIR = '/hero-frames'

export type HeroFramesManifest = {
  count: number
  width: number
  fps: number
  segments: { segment: string; frames: number }[]
}

/** Chemin d'une image, 1-indexée comme le manifeste. */
export function heroFrameUrl(index: number): string {
  return `${HERO_FRAMES_DIR}/${String(index).padStart(4, '0')}.webp`
}

export async function loadHeroFramesManifest(signal?: AbortSignal): Promise<HeroFramesManifest> {
  const response = await fetch(`${HERO_FRAMES_DIR}/manifest.json`, { signal })
  // Échec bruyant : sans manifeste, la section ne devine pas un nombre d'images.
  if (!response.ok) {
    throw new Error(`Manifeste des images du hero introuvable (${response.status}).`)
  }
  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as HeroFramesManifest).count !== 'number' ||
    (data as HeroFramesManifest).count < 1
  ) {
    throw new Error('Manifeste des images du hero illisible.')
  }
  return data as HeroFramesManifest
}
