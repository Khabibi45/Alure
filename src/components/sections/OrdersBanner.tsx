import Link from 'next/link'
import { nextMilestone } from '@/lib/shop/milestones'
import { getOrdersCount } from '@/lib/shop/orders-count'

/**
 * Le bandeau « objectif de lancement » (spec `bandeau-objectif-commandes.md`) :
 * un compteur RÉEL de commandes payées, lu chez Stripe et mis en cache jusqu'à
 * la prochaine commande (le webhook invalide le tag). La seule pression est un
 * chiffre vrai — pas de minuteur, pas de stock inventé, pas de « X personnes
 * regardent » (règle n°6 + spec offre-collection §2).
 *
 * Stripe injoignable → bandeau ABSENT et erreur loguée côté serveur : jamais un
 * chiffre faux, jamais un « 0 » par défaut (règle n°5). La jauge est statique
 * (rendue remplie côté serveur) : rien à animer, rien à réduire.
 */
export async function OrdersBanner({ href }: { href?: string }) {
  let count: number
  try {
    count = await getOrdersCount()
  } catch (error) {
    console.error('OrdersBanner : comptage Stripe indisponible — bandeau masqué.', error)
    return null
  }

  const target = nextMilestone(count)
  const orders = count === 1 ? '1 commande' : `${count} commandes`

  const message =
    target === null
      ? `${orders} passées. Merci d'être là.`
      : count === 0
        ? `Alure se lance. Soyez la première commande — l'objectif : ${target}.`
        : `${orders} sur un objectif de ${target}. Faites partie des premiers.`

  const inner = (
    <>
      <p className="min-w-0 text-[0.9375rem] leading-relaxed">
        <span className="text-label mr-3 text-muted-foreground uppercase">Objectif lancement</span>
        {message}
      </p>

      {target !== null && (
        <p className="flex shrink-0 items-center gap-3">
          {/* La jauge dit la même chose que le texte — décorative pour l'a11y. */}
          <span aria-hidden className="block h-1.5 w-36 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-success"
              style={{ width: `${Math.round((count / target) * 100)}%` }}
            />
          </span>
          <span aria-hidden className="text-sm font-bold tabular-nums">
            {count}/{target}
          </span>
        </p>
      )}
    </>
  )

  const surface =
    'flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between'

  return (
    <section aria-label="Objectif de lancement" className="mx-auto max-w-5xl px-5">
      {href ? (
        <Link
          href={href}
          className={`${surface} transition-shadow duration-[var(--dur-micro)] hover:shadow-[0_0_0_2px_var(--color-ring)]`}
        >
          {inner}
        </Link>
      ) : (
        <div className={surface}>{inner}</div>
      )}
    </section>
  )
}
