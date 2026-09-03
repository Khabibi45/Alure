// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  LURE_MODELS,
  NEXT_LURE_MODEL,
  SELLABLE_LURE_MODELS,
  COLLECTOR_LURE_MODEL,
  wrapIndex,
} from './lure-models'
import { GIFT_CHOICE_IDS, PRODUCT, totalCents } from './shop/product'
import { LURE_SWIM, TARGET_LURE_LENGTH } from './three/swim.config'
import {
  LURE_VIEWS,
  DEFAULT_LURE_VIEW,
  ORBIT_KEY_STEP,
  ORBIT_MAX_PITCH,
  clampOrbitPitch,
  getLureView,
  orbitToEuler,
} from './three/lure-views'

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
      expect(
        existsSync(file),
        `${model.src} est déclaré mais absent — lance \`npm run models\``
      ).toBe(true)
    }
  })

  it('ne laisse aucun modèle compressé orphelin dans public/models', () => {
    // L'oubli symétrique : le .glb a été traité mais jamais enregistré, donc jamais
    // affiché. On préfère un gate rouge à un fichier de plusieurs Mo servi pour rien.
    const onDisk = readdirSync(PUBLIC_MODELS).filter((f) => f.endsWith('.glb'))
    // Les modèles servis HORS carrousel comptent aussi : le goujon de la section
    // « Prochaine sélection » n'est pas au catalogue, mais il est bien affiché.
    const registered = new Set([
      ...LURE_MODELS.map((m) => m.src.replace('/models/', '')),
      NEXT_LURE_MODEL.replace('/models/', ''),
    ])
    const orphans = onDisk.filter((f) => !registered.has(f))
    expect(orphans, `à enregistrer dans LURE_MODELS : ${orphans.join(', ')}`).toEqual([])
  })

  it('partage UN réglage de nage plausible — même moule, même battement', () => {
    // Les deux fractions sont STRICTEMENT à l'intérieur du corps et dans l'ordre.
    // Égales, le brin serait de longueur nulle — et son inverse, une division par
    // zéro qui propagerait des NaN à tous les sommets et ferait disparaître le
    // leurre. Inversées, la rampe partirait à l'envers.
    expect(LURE_SWIM.stemStartRatio).toBeGreaterThan(0)
    expect(LURE_SWIM.hingeRatio).toBeLessThan(1)
    expect(LURE_SWIM.stemStartRatio).toBeLessThan(LURE_SWIM.hingeRatio)
    // Un balayage nul serait un leurre mort ; au-delà d'un radian, une palette qui
    // part à plus de 57° reviendrait visiblement sur le corps.
    expect(LURE_SWIM.paddleYawAmplitude).toBeGreaterThan(0)
    expect(LURE_SWIM.paddleYawAmplitude).toBeLessThanOrEqual(1)
    expect(LURE_SWIM.paddlePitchAmplitude).toBeGreaterThanOrEqual(0)
    expect(LURE_SWIM.paddlePitchAmplitude).toBeLessThanOrEqual(1)
    expect(LURE_SWIM.speed).toBeGreaterThan(0)
  })

  it('fait bouger le corps, mais SANS jamais voler la vedette à la palette', () => {
    // Consigne du 2026-09-01 : « fais légèrement bouger le corps du leurre aussi ».
    // Le mot qui compte est « légèrement ». Roulis, lacet et bercement portent sur
    // le leurre ENTIER : laissés à monter, ils feraient disparaître la nage de la
    // palette derrière un tortillement d'ensemble. On exige donc les deux
    // moitiés de la consigne — non nul, et nettement plus petit.
    expect(LURE_SWIM.yawAmplitude).toBeGreaterThan(0)
    expect(LURE_SWIM.rollAmplitude).toBeGreaterThan(0)
    expect(LURE_SWIM.bobAmplitude).toBeGreaterThan(0)

    expect(LURE_SWIM.yawAmplitude).toBeLessThan(LURE_SWIM.paddleYawAmplitude / 5)
    expect(LURE_SWIM.rollAmplitude).toBeLessThan(LURE_SWIM.paddleYawAmplitude / 5)
    // Le bercement est une TRANSLATION, en unités de scène : on le compare à la
    // longueur du leurre, pas à un angle. 5 %, c'est déjà beaucoup.
    expect(LURE_SWIM.bobAmplitude).toBeLessThan(TARGET_LURE_LENGTH * 0.05)
  })

  it('garde la palette rigide : la rampe sature AVANT elle', () => {
    // Ce qui rend la palette rigide, c'est que sa rampe vaut 1 partout : tous ses
    // sommets tournent alors du même angle autour du même pivot, donc rotation
    // rigide exacte. Si la charnière était à 1, la rampe n'atteindrait son
    // maximum qu'au dernier sommet et la palette se déformerait.
    expect(LURE_SWIM.hingeRatio).toBeLessThan(1)
    // Et le brin doit rester une PORTION du leurre, pas la moitié : au-delà, ce
    // n'est plus « la partie la plus fine » qui plie, c'est tout l'arrière.
    expect(LURE_SWIM.hingeRatio - LURE_SWIM.stemStartRatio).toBeLessThan(0.3)
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

  it('le collector est un CHOIX de cadeau — jamais un article vendu', () => {
    expect(GIFT_CHOICE_IDS).toContain(PRODUCT.collector.id)
  })

  it('n’ajoute jamais le collector au montant payé', () => {
    // Le 4e est OFFERT : le total de l'offre reste trois fois le prix d'un
    // leurre, quel que soit le cadeau choisi.
    expect(totalCents('collection')).toBe(PRODUCT.pricing.soloCents * 3)
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

describe('la rotation libre du leurre (page produit)', () => {
  it('borne le tangage à un quart de tour, dans les deux sens', () => {
    expect(clampOrbitPitch(0)).toBe(0)
    expect(clampOrbitPitch(Math.PI)).toBe(ORBIT_MAX_PITCH)
    expect(clampOrbitPitch(-Math.PI)).toBe(-ORBIT_MAX_PITCH)
    expect(clampOrbitPitch(ORBIT_MAX_PITCH)).toBe(ORBIT_MAX_PITCH)
  })

  it('la borne du tangage est EXACTEMENT la vue « Dessus » et la vue « Dessous »', () => {
    // C'est ce qui fait que le geste atteint précisément ce que les boutons
    // atteignent : ni plus (le leurre ne se retourne jamais), ni moins.
    expect(getLureView('dessus').rotation[0]).toBe(ORBIT_MAX_PITCH)
    expect(getLureView('dessous').rotation[0]).toBe(-ORBIT_MAX_PITCH)
  })

  it('laisse le lacet libre : un leurre se regarde sur 360°', () => {
    const [, yaw] = orbitToEuler(4 * Math.PI, 0)
    expect(yaw).toBe(4 * Math.PI)
  })

  it('compose dans l’ordre attendu par three : tangage, lacet, roulis', () => {
    expect(orbitToEuler(0.3, 0.2, 0.1)).toEqual([0.2, 0.3, 0.1])
  })

  it('redonne chaque vue nommée à l’identique — le geste et les boutons partagent l’espace', () => {
    for (const view of LURE_VIEWS) {
      const [pitch, yaw, roll] = view.rotation
      expect(orbitToEuler(yaw, pitch, roll)).toEqual([pitch, yaw, roll])
    }
  })

  it('un pas clavier fait 24 appuis pour un tour complet', () => {
    expect((2 * Math.PI) / ORBIT_KEY_STEP).toBeCloseTo(24)
  })
})
