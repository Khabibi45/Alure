import { ORDER_MILESTONES } from './milestones'

/**
 * LA CAMPAGNE DE PRÉCOMMANDE — « il nous faut 100 commandes pour lancer une
 * vraie ligne de production » (décision Camil, 2026-08-26).
 *
 * ── CE QUI REND CETTE PAGE DIFFÉRENTE DE TOUT LE RESTE DU SITE ──
 *
 * Jusqu'ici le site vendait un produit expédié sous 10 à 20 jours. Une
 * PRÉCOMMANDE, c'est encaisser aujourd'hui pour livrer plus tard : la loi
 * française l'encadre bien plus strictement (art. L216-1 du code de la
 * consommation). Le vendeur doit indiquer **la date à laquelle il s'engage à
 * livrer** ; à défaut d'indication, il doit livrer sous **30 jours**, faute de
 * quoi l'acheteur peut résoudre le contrat et exiger son remboursement.
 *
 * « Quand on aura atteint 100 commandes » n'est PAS une date. C'est pourquoi ce
 * module traite `shipByDate` comme une donnée obligatoire, sur le modèle de
 * `legal-config.ts` : tant qu'elle n'est pas renseignée, `PRECOMMANDE_ACTIVE`
 * vaut `false`, la campagne ne s'affiche nulle part, et rien n'est encaissé sur
 * une promesse sans date. C'est la même doctrine que la règle Alure n°1 —
 * jamais un délai flou, jamais un délai atténué — appliquée à un engagement
 * autrement plus lourd, puisque l'argent part avant le produit.
 *
 * Le second engagement est le pendant du premier : **si l'objectif n'est pas
 * atteint, ou si la date ne peut pas être tenue, on rembourse intégralement.**
 * Il n'a pas besoin de configuration — il est inconditionnel, et les textes de
 * la campagne le disent.
 */

/**
 * Le nombre de commandes qui déclenche la ligne de production. Pris dans
 * l'échelle existante (`ORDER_MILESTONES`) plutôt que réécrit : le bandeau
 * d'objectif et la campagne doivent viser le MÊME chiffre, sinon le site
 * s'annonce deux objectifs différents sur deux écrans.
 */
export const PRECOMMANDE_GOAL = 100

/**
 * La date limite d'expédition, au format ISO `AAAA-MM-JJ`.
 *
 * À REMPLIR AVANT TOUTE PUBLICATION. Tant qu'elle vaut la valeur ci-dessous, la
 * campagne est inactive — le site continue de vendre normalement.
 *
 * Elle doit être une date qu'on peut tenir MÊME si l'objectif est atteint au
 * dernier moment : compter le délai de production, plus l'acheminement, plus la
 * marge. Une date manquée est un remboursement de droit, et une série de
 * remboursements gèle un compte Stripe.
 */
export const PRECOMMANDE_SHIP_BY = 'À COMPLÉTER : date limite d’expédition (AAAA-MM-JJ)'

/** Le motif d'une date ISO réelle — la garde qui distingue une vraie date du gabarit. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * La campagne peut-elle s'afficher ? Uniquement si la date limite est une vraie
 * date. Sinon on ne montre RIEN : pas de compteur d'objectif présenté comme une
 * précommande, pas d'appel à « investir ». Échec silencieux mais SÛR — le site
 * retombe simplement sur la vente normale, qui est complète et honnête.
 */
export const PRECOMMANDE_ACTIVE = ISO_DATE.test(PRECOMMANDE_SHIP_BY)

/**
 * La date limite formatée pour l'affichage, dans la langue servie — `null` tant
 * que la campagne est inactive. On ne rend JAMAIS le gabarit « À COMPLÉTER » au
 * visiteur : une date d'expédition illisible vaut une date absente.
 */
export function shipByLabel(locale: string): string | null {
  if (!PRECOMMANDE_ACTIVE) return null
  const [year, month, day] = PRECOMMANDE_SHIP_BY.split('-').map(Number)
  // Mois indexé à 0, et midi UTC : à minuit, un décalage horaire fait reculer
  // la date d'un jour dans les fuseaux à l'ouest — la date affichée doit être
  // exactement celle sur laquelle on s'engage.
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(
    locale === 'en' ? 'en-GB' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

/**
 * L'objectif de la campagne appartient-il bien à l'échelle des paliers ? Si le
 * bandeau vise 50 pendant que la campagne annonce 100, le visiteur lit deux
 * promesses contradictoires sur la même page. Vérifié par un test.
 */
export function goalIsMilestone(): boolean {
  return (ORDER_MILESTONES as readonly number[]).includes(PRECOMMANDE_GOAL)
}
