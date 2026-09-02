import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  LURE_DETAIL_IDS,
  PHOTOGRAPHED_LURES,
  lureDetailPhotoSrc,
  lurePhotoSrc,
} from './lure-details'

/**
 * Le filet des VINGT-QUATRE fichiers d'images de la page produit (quatre leurres
 * × une photo principale + cinq gros plans).
 *
 * Il vaut la peine d'exister parce que l'échec, sans lui, est SILENCIEUX : un
 * `next/image` dont la source n'existe pas ne lève rien, ne casse pas le build
 * et ne colore pas la console — il laisse un trou dans la page, en production.
 * C'est exactement la « dégradation silencieuse » que le principe n°1 interdit.
 *
 * Il tient aussi le lien entre le slug et le chemin : renommer un fichier sans
 * toucher au catalogue, ou l'inverse, sort ici en rouge.
 */
const PUBLIC_DIR = join(process.cwd(), 'public')

const publicPath = (src: string) => join(PUBLIC_DIR, src)

describe('les photos des leurres', () => {
  it('couvre les trois coloris vendus et le collector', () => {
    expect(PHOTOGRAPHED_LURES.map((l) => l.photoSlug)).toEqual(['bleu', 'rouge', 'vert', 'pirate'])
  })

  it.each(PHOTOGRAPHED_LURES.map((l) => [l.photoSlug, l] as const))(
    '%s : la photo principale du catalogue suit le slug et existe',
    (_slug, lure) => {
      expect(lure.image).toBe(lurePhotoSrc(lure.photoSlug))
      expect(existsSync(publicPath(lure.image))).toBe(true)
    }
  )

  it.each(
    PHOTOGRAPHED_LURES.flatMap((lure) =>
      LURE_DETAIL_IDS.map(
        (detail) => [`${lure.photoSlug}-${detail}`, lure.photoSlug, detail] as const
      )
    )
  )('%s : le gros plan existe', (_name, slug, detail) => {
    expect(existsSync(publicPath(lureDetailPhotoSrc(slug, detail)))).toBe(true)
  })
})
