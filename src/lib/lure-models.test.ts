// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  LURE_MODELS,
  SELLABLE_LURE_MODELS,
  COLLECTOR_LURE_MODEL,
  wrapIndex,
} from './lure-models'
import { PRODUCT, collectorIncluded, totalCents } from './shop/product'
import { LURE_SWIM } from './three/swim.config'
import { LURE_VIEWS, DEFAULT_LURE_VIEW, getLureView } from './three/lure-views'

/**
 * Le filet qui rend l'ajout d'un leurre SÛR.
 *
 * Ajouter un leurre, c'est trois gestes : déposer le .glb dans `assets/3d models/`,
 * lancer `npm run models`, ajouter une entrée dans `LURE_MODELS`. Chacun peut être
 * oublié, et aucun ne casse à la compilation — le symptôme serait un carrousel qui
 * affiche un trou en production. Ces tests transforment chaque oubli en échec de gate.
 */

const PUBLIC_MODELS = join(process.cwd(), 'public', 'models')

describe('LURE_MODELS — le registre des leurres du hero', () => {
  it('n’est pas vide (le carrousel a besoin d’au moins un leurre)', () => {
    expect(LURE_MODELS.length).toBeGreaterThan(0)
  })

  it('a des identifiants uniques', () => {
    const ids = LURE_MODELS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pointe vers des fichiers qui existent vraiment dans public/models', () => {
    for (const model of LURE_MODELS) {
      expect(model.src.startsWith('/models/')).toBe(true)
      const file = join(process.cwd(), 'public', model.src.replace(/^\//, ''))
      expect(existsSync(file), `${model.src} est déclaré mais absent — lance \`npm run models\``).toBe(
        true
      )
    }
  })

  it('ne laisse aucun modèle compressé orphelin dans public/models', () => {
    // L'oubli symétrique : le .glb a été traité mais jamais enregistré, donc jamais
    // affiché. On préfère un gate rouge à un fichier de plusieurs Mo servi pour rien.
    const onDisk = readdirSync(PUBLIC_MODELS).filter((f) => f.endsWith('.glb'))
    const registered = new Set(LURE_MODELS.map((m) => m.src.replace('/models/', '')))
    const orphans = onDisk.filter((f) => !registered.has(f))
    expect(orphans, `à enregistrer dans LURE_MODELS : ${orphans.join(', ')}`).toEqual([])
  })

  it('partage UN réglage de nage plausible — même moule, même battement', () => {
    // La charnière est STRICTEMENT à l'intérieur du corps : à 0 ou 1, une des deux
    // pièces n'existerait plus et l'articulation deviendrait une rotation du tout.
    expect(LURE_SWIM.hingeRatio).toBeGreaterThan(0)
    expect(LURE_SWIM.hingeRatio).toBeLessThan(1)
    // Un débattement nul serait un leurre mort ; au-delà d'un radian, une pièce
    // arrière qui bat à plus de 57° traverserait visiblement la pièce avant.
    expect(LURE_SWIM.hingeAmplitude).toBeGreaterThan(0)
    expect(LURE_SWIM.hingeAmplitude).toBeLessThanOrEqual(1)
    expect(LURE_SWIM.speed).toBeGreaterThan(0)
  })

  it('donne à chaque leurre un nom affichable et une description parlée', () => {
    for (const model of LURE_MODELS) {
      expect(model.workingName.trim().length).toBeGreaterThan(0)
      expect(model.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('associe chaque modèle vendable à un coloris qui existe au catalogue', () => {
    const catalogue = PRODUCT.colorways.map((c) => c.id)
    for (const model of SELLABLE_LURE_MODELS) {
      expect(model.colorwayId).not.toBeNull()
      expect(catalogue, `${model.id} pointe vers un coloris inconnu`).toContain(model.colorwayId)
    }
  })

  it('donne à chaque coloris du catalogue exactement un modèle 3D', () => {
    // L'invariant qui rend l'ajout d'un coloris sûr : sans lui, la page produit
    // afficherait le mauvais leurre — ou aucun — pour un coloris nouvellement ajouté.
    for (const colorway of PRODUCT.colorways) {
      const matching = SELLABLE_LURE_MODELS.filter((m) => m.colorwayId === colorway.id)
      expect(matching, `le coloris ${colorway.id} n’a pas exactement un modèle 3D`).toHaveLength(1)
    }
    expect(SELLABLE_LURE_MODELS).toHaveLength(PRODUCT.colorways.length)
  })

  it('ne rattache le collector à aucun coloris — il ne se vend pas', () => {
    expect(COLLECTOR_LURE_MODEL).not.toBeNull()
    expect(COLLECTOR_LURE_MODEL?.colorwayId).toBeNull()
    expect(SELLABLE_LURE_MODELS.some((m) => m.collector)).toBe(false)
  })

  it('ne débloque le collector qu’avec la collection', () => {
    expect(collectorIncluded('solo')).toBe(false)
    expect(collectorIncluded('collection')).toBe(true)
  })

  it('n’ajoute jamais le collector au montant payé', () => {
    // Il est OFFERT : le total de la collection reste deux fois le prix d'un leurre,
    // quel que soit le nombre d'objets réellement expédiés.
    expect(totalCents('collection')).toBe(PRODUCT.pricing.soloCents * 2)
  })
})

describe('wrapIndex — la boucle infinie du carrousel', () => {
  it('ramène tout entier, même très négatif, sur un index réel', () => {
    const count = LURE_MODELS.length
    for (const value of [-7, -1, 0, 1, count, count * 3 + 2, 1000]) {
      const index = wrapIndex(value)
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(count)
    }
  })

  it('avance d’un cran à chaque pas, sans saut au passage du dernier au premier', () => {
    const count = LURE_MODELS.length
    for (let i = 0; i < count * 2; i += 1) {
      const from = wrapIndex(i)
      const to = wrapIndex(i + 1)
      expect(to).toBe((from + 1) % count)
    }
  })
})

describe('LURE_VIEWS — les angles de vue', () => {
  it('a des identifiants uniques et des libellés non vides', () => {
    const ids = LURE_VIEWS.map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const view of LURE_VIEWS) {
      expect(view.label.trim().length).toBeGreaterThan(0)
      expect(view.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('a une vue par défaut qui existe', () => {
    expect(() => getLureView(DEFAULT_LURE_VIEW)).not.toThrow()
  })

  it('échoue bruyamment sur une vue inconnue', () => {
    // @ts-expect-error — on force un id hors union pour vérifier le garde-fou runtime.
    expect(() => getLureView('face-cachée')).toThrow(/inconnue/i)
  })

  it('donne trois angles réellement distincts', () => {
    const signatures = LURE_VIEWS.map((v) => v.rotation.join(','))
    expect(new Set(signatures).size).toBe(LURE_VIEWS.length)
  })
})
