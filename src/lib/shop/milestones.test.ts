import { describe, expect, it } from 'vitest'
import { ORDER_MILESTONES, nextMilestone } from './milestones'

describe('nextMilestone', () => {
  it('0 commande → premier palier', () => {
    expect(nextMilestone(0)).toBe(5)
  })

  it('sous un palier → ce palier ; palier atteint → le suivant', () => {
    expect(nextMilestone(4)).toBe(5)
    expect(nextMilestone(5)).toBe(10)
    expect(nextMilestone(29)).toBe(30)
    expect(nextMilestone(100)).toBe(250)
  })

  it('dernier palier atteint → null, on n’invente pas d’objectif', () => {
    expect(nextMilestone(1000)).toBeNull()
    expect(nextMilestone(5000)).toBeNull()
  })

  it('l’échelle est strictement croissante (un palier atteint ne redescend jamais)', () => {
    const sorted = [...ORDER_MILESTONES].sort((a, b) => a - b)
    expect([...ORDER_MILESTONES]).toEqual(sorted)
    expect(new Set(ORDER_MILESTONES).size).toBe(ORDER_MILESTONES.length)
  })
})
