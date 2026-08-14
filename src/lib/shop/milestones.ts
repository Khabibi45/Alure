/**
 * L'échelle d'objectifs du bandeau de lancement (spec
 * `bandeau-objectif-commandes.md`) : des paliers de commandes RÉELLES, comptées
 * chez Stripe — jamais un chiffre inventé (règle n°6). Consigne Camil :
 * 5 → 10 → 30 → 50 → 100, puis on continue de viser plus haut.
 */
export const ORDER_MILESTONES = [5, 10, 30, 50, 100, 250, 500, 1000] as const

/**
 * Le prochain palier à viser pour `count` commandes — `null` une fois le
 * dernier palier atteint (le bandeau n'invente pas d'objectif au-delà).
 */
export function nextMilestone(count: number): number | null {
  return ORDER_MILESTONES.find((milestone) => count < milestone) ?? null
}
