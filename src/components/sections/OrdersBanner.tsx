import Link from 'next/link'
import { getDictionary, t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/paths'
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
 *
 * Ses textes viennent du dictionnaire depuis le 2026-08-26 : il s'affiche aussi
 * sur `/en`, où il était le dernier bloc français du site (règle Alure n°6).
 */
export async function OrdersBanner({ locale, href }: { locale: Locale; href?: string }) {
  let count: number
  try {
    count = await getOrdersCount()
  } catch (error) {
    console.error('OrdersBanner : comptage Stripe indisponible — bandeau masqué.', error)
    return null
  }

  const dict = getDictionary(locale)
  const target = nextMilestone(count)
  const orders =
    count === 1
      ? t(dict, 'BANNER.ORDERS_ONE')
      : t(dict, 'BANNER.ORDERS_MANY', { compte: String(count) })

  const message =
    target === null
      ? t(dict, 'BANNER.DONE', { commandes: orders })
      : count === 0
        ? t(dict, 'BANNER.EMPTY', { objectif: String(target) })
        : t(dict, 'BANNER.PROGRESS', { commandes: orders, objectif: String(target) })

  const inner = (
    <>
      <p className="min-w-0 text-[0.9375rem] leading-relaxed">
        <span className="text-label text-muted-foreground mr-3 uppercase">
          {t(dict, 'BANNER.LABEL')}
        </span>
        {message}
      </p>

      {target !== null && (
        <p className="flex shrink-0 items-center gap-3">
          {/* La jauge dit la même chose que le texte — décorative pour l'a11y. */}
          <span aria-hidden className="bg-muted block h-1.5 w-36 overflow-hidden rounded-full">
            <span
              className="bg-success block h-full rounded-full"
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
    <section aria-label={t(dict, 'BANNER.ARIA')} className="mx-auto max-w-5xl px-5">
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
