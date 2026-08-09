// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  HERO_LAST_FRAME,
  HERO_VARIANT,
  HERO_VARIANT_ASSETS,
  type HeroVariant,
} from './hero-variant'

/**
 * Le filet qui garde LES DEUX variantes du hero utilisables.
 *
 * L'intérêt d'avoir deux mises en scène disparaît le jour où l'une des deux ne
 * marche plus sans que personne ne s'en aperçoive — parce qu'elle n'est pas
 * celle qui est en ligne. Ces tests vérifient les assets des DEUX, pas seulement
 * de celle qui est active.
 */

const VARIANTS = Object.keys(HERO_VARIANT_ASSETS) as HeroVariant[]

describe('hero — les deux variantes restent utilisables', () => {
  it('la variante en ligne est une variante connue', () => {
    expect(VARIANTS).toContain(HERO_VARIANT)
  })

  it('déclare exactement les trois mises en scène', () => {
    expect(VARIANTS.sort()).toEqual(['cine', 'scroll', 'video'])
  })

  it.each(VARIANTS)('les assets de la variante « %s » existent tous', (variant) => {
    for (const asset of HERO_VARIANT_ASSETS[variant]) {
      const file = join(process.cwd(), asset)
      expect(
        existsSync(file),
        `${asset} manque — la variante « ${variant} » ne s'afficherait pas. ` +
          `Relance \`npm run frames\` (séquence) ou \`npm run montage\` (vidéo).`
      ).toBe(true)
    }
  })

  it('la séquence d’images annonce autant d’images qu’il en existe vraiment', () => {
    // Le manifeste est lu par le composant : s'il annonce plus d'images que le
    // dossier n'en contient, la fin de la séquence resterait figée en silence.
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), 'public/hero-frames/manifest.json'), 'utf8')
    ) as { count: number }
    expect(manifest.count).toBeGreaterThan(0)
    const last = String(manifest.count).padStart(4, '0')
    expect(
      existsSync(join(process.cwd(), `public/hero-frames/${last}.webp`)),
      `le manifeste annonce ${manifest.count} images mais ${last}.webp est absent`
    ).toBe(true)
    const beyond = String(manifest.count + 1).padStart(4, '0')
    expect(
      existsSync(join(process.cwd(), `public/hero-frames/${beyond}.webp`)),
      `${beyond}.webp existe mais n'est pas compté : le manifeste est périmé`
    ).toBe(false)
  })

  it('HERO_LAST_FRAME est bien la DERNIÈRE image de la séquence', () => {
    // Elle sert de poster, de décor derrière la 3D et d'image en mouvement
    // réduit. Si elle n'était pas la dernière, le décor changerait au moment du
    // fondu — exactement ce que ce montage cherche à éviter.
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), 'public/hero-frames/manifest.json'), 'utf8')
    ) as { count: number }
    expect(HERO_LAST_FRAME).toBe(`/hero-frames/${String(manifest.count).padStart(4, '0')}.webp`)
    expect(existsSync(join(process.cwd(), 'public', HERO_LAST_FRAME))).toBe(true)
  })
})
