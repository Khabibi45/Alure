import 'server-only'
import { revalidateTag, unstable_cache } from 'next/cache'
import { countPaidOrders } from './stripe'

/**
 * Le compteur de commandes du bandeau d'objectif (spec
 * `bandeau-objectif-commandes.md`) — sans BDD (règle Alure n°4) : Stripe est la
 * source de vérité, ce module ne fait que compter et mettre en cache.
 *
 * Le cache tient jusqu'à la PROCHAINE commande : le webhook appelle
 * `revalidateOrdersCount()` après chaque paiement traité — « mis à jour à
 * chaque achat », sans polling. Un rafraîchissement périodique borne quand même
 * la dérive si une invalidation se perdait (webhook non re-livré, déploiement).
 *
 * Échec Stripe → l'erreur REMONTE telle quelle (échec bruyant, règle n°5) :
 * c'est l'appelant (le bandeau) qui décide — se masquer et loguer. Jamais un
 * zéro par défaut.
 */

/** Le tag de cache du compteur — invalidé par le webhook à chaque commande payée. */
export const ORDERS_COUNT_TAG = 'orders-count'

/** Fraîcheur maximale sans commande : une heure — le webhook fait le vrai travail. */
const ORDERS_COUNT_MAX_AGE_SECONDS = 3_600

export const getOrdersCount = unstable_cache(countPaidOrders, [ORDERS_COUNT_TAG], {
  tags: [ORDERS_COUNT_TAG],
  revalidate: ORDERS_COUNT_MAX_AGE_SECONDS,
})

/**
 * À appeler quand une commande vient d'être payée (webhook) : le bandeau se met
 * à jour. Le profil `'max'` (exigé par Next 16) donne du stale-while-revalidate :
 * l'entrée est marquée périmée et se recalcule au rendu suivant — exactement le
 * besoin ; `updateTag` (expiration immédiate) est réservé aux Server Actions.
 */
export function revalidateOrdersCount(): void {
  revalidateTag(ORDERS_COUNT_TAG, 'max')
}
