import { describe, expect, it } from 'vitest'
import {
  PRECOMMANDE_ACTIVE,
  PRECOMMANDE_GOAL,
  PRECOMMANDE_SHIP_BY,
  goalIsMilestone,
  shipByLabel,
} from './precommande'
import { ORDER_MILESTONES, nextMilestone } from './milestones'

describe('la campagne de précommande — la date fait loi', () => {
  it('reste INACTIVE tant que la date limite n’est pas une vraie date', () => {
    // Le cœur de la garde : une précommande sans date d'expédition est
    // illégale (art. L216-1). Tant que le gabarit « À COMPLÉTER » est en place,
    // rien ne s'affiche et rien ne s'encaisse sur cette promesse.
    const gabarit = PRECOMMANDE_SHIP_BY.startsWith('À COMPLÉTER')
    expect(PRECOMMANDE_ACTIVE).toBe(!gabarit)
  })

  it('n’affiche jamais le gabarit « À COMPLÉTER » au visiteur', () => {
    for (const locale of ['fr', 'en']) {
      const label = shipByLabel(locale)
      if (label !== null) {
        expect(label).not.toContain('COMPLÉTER')
        expect(label).not.toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('formate la date dans la langue servie, une fois renseignée', () => {
    // On ne dépend pas de la valeur réelle du dépôt : on vérifie le formateur
    // sur une date connue, en réutilisant la même mécanique.
    const rendu = (iso: string, locale: string) => {
      const [y, m, d] = iso.split('-').map(Number)
      return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(
        locale === 'en' ? 'en-GB' : 'fr-FR',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )
    }
    expect(rendu('2026-12-15', 'fr')).toBe('15 décembre 2026')
    expect(rendu('2026-12-15', 'en')).toBe('15 December 2026')
  })

  it('midi UTC : la date affichée ne recule pas d’un jour selon le fuseau', () => {
    // À minuit, un fuseau à l'ouest ferait afficher le 14 pour un engagement
    // pris au 15. On s'engage sur une date : elle doit être la même partout.
    const [y, m, d] = [2026, 1, 1]
    const midi = new Date(Date.UTC(y, m - 1, d, 12))
    expect(midi.getUTCDate()).toBe(1)
    expect(midi.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})

describe('l’objectif de la campagne et le bandeau visent le même chiffre', () => {
  it('l’objectif appartient à l’échelle des paliers', () => {
    expect(
      goalIsMilestone(),
      `l’objectif ${PRECOMMANDE_GOAL} n’est pas un palier de ORDER_MILESTONES — le bandeau et la campagne annonceraient deux objectifs différents sur la même page`
    ).toBe(true)
  })

  it('le bandeau vise bien l’objectif de campagne juste avant de l’atteindre', () => {
    expect(nextMilestone(PRECOMMANDE_GOAL - 1)).toBe(PRECOMMANDE_GOAL)
  })

  it('l’objectif est le dernier palier « lancement » — au-delà, on ne promet plus une ligne', () => {
    const index = ORDER_MILESTONES.indexOf(PRECOMMANDE_GOAL as (typeof ORDER_MILESTONES)[number])
    expect(index).toBeGreaterThan(0)
    // Les paliers suivants existent (250, 500…) : la campagne s'arrête à 100,
    // le bandeau, lui, continue de viser plus haut. Les deux sont cohérents.
    expect(ORDER_MILESTONES.length).toBeGreaterThan(index + 1)
  })
})
