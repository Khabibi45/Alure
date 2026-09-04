import Link from 'next/link'
import { getDictionary, t } from '@/lib/i18n'
import { localePath, type Locale } from '@/lib/i18n/paths'
import { getOrdersCount } from '@/lib/shop/orders-count'
import { PaymentKeyRejectedError } from '@/lib/shop/errors'
import { PRECOMMANDE_ACTIVE, PRECOMMANDE_GOAL, shipByLabel } from '@/lib/shop/precommande'
import { PACKS, SHIPPING, formatEuros } from '@/lib/shop/product'

/**
 * LA CAMPAGNE DE PRÉCOMMANDE — « il nous faut 100 commandes pour lancer une
 * vraie ligne de production » (décision Camil, 2026-08-26).
 *
 * Server Component : le compteur se lit chez Stripe au rendu, jamais dans le
 * navigateur. Trois gardes, dans cet ordre, et chacune fait DISPARAÎTRE la
 * section plutôt que de la dégrader :
 *
 * 1. **Pas de date limite d'expédition configurée → rien.** Une précommande
 *    sans date n'engage à rien et n'est pas légale (art. L216-1). Le site
 *    retombe sur la vente normale, qui est complète et honnête.
 * 2. **Stripe injoignable → rien.** Le compteur est l'argument central de la
 *    page : sans chiffre VRAI, la campagne n'a plus de preuve à montrer. On
 *    n'affiche pas « 0 » par défaut, on n'affiche pas « bientôt » — on se tait
 *    et on logue (règle n°5 : échec bruyant côté serveur, jamais un chiffre
 *    faux côté visiteur).
 * 3. **Objectif déjà atteint → rien.** Une campagne qui continue de réclamer
 *    des précommandes après avoir atteint son but ment sur ce qu'elle finance.
 *
 * Aucun levier fabriqué : pas de minuteur, pas de « plus que X places », pas de
 * témoignage. La seule pression est un chiffre réel et une date réelle.
 */
export async function PrecommandeSection({ locale }: { locale: Locale }) {
  if (!PRECOMMANDE_ACTIVE) return null

  let count: number
  try {
    count = await getOrdersCount()
  } catch (error) {
    if (error instanceof PaymentKeyRejectedError) {
      console.warn(`PrecommandeSection : campagne masquée. ${error.message}`)
    } else {
      console.error(
        'PrecommandeSection : comptage Stripe indisponible — campagne masquée plutôt qu’un compteur faux.',
        error
      )
    }
    return null
  }

  if (count >= PRECOMMANDE_GOAL) return null

  const dict = getDictionary(locale)
  const dateLimite = shipByLabel(locale)
  if (dateLimite === null) return null

  const params = {
    compte: String(count),
    objectif: String(PRECOMMANDE_GOAL),
    dateLimite,
    prixPack: formatEuros(PACKS.leurres.amountCents, locale),
    prixGoujons: formatEuros(PACKS.goujons.amountCents, locale),
    livraison: formatEuros(SHIPPING.amountCents, locale),
  }

  const blocs = [
    { titre: 'PRECOMMANDE.WHY_TITLE', corps: 'PRECOMMANDE.WHY_BODY' },
    { titre: 'PRECOMMANDE.BOX_TITLE', corps: 'PRECOMMANDE.BOX_BODY' },
    { titre: 'PRECOMMANDE.DATE_TITLE', corps: 'PRECOMMANDE.DATE_BODY' },
    { titre: 'PRECOMMANDE.REFUND_TITLE', corps: 'PRECOMMANDE.REFUND_BODY' },
  ] as const

  return (
    <section
      aria-label={t(dict, 'PRECOMMANDE.TITLE', params)}
      className="mx-auto max-w-3xl px-5 py-14 md:py-20"
    >
      <h2 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] text-balance uppercase md:text-[2.25rem]">
        {t(dict, 'PRECOMMANDE.TITLE', params)}
      </h2>

      <p className="mt-5 leading-relaxed">{t(dict, 'PRECOMMANDE.INTRO', params)}</p>

      {/* Le compteur : un chiffre vrai, et la phrase qui dit d'où il vient.
          La jauge répète l'information du texte — décorative pour l'a11y. */}
      <div className="rounded-card bg-surface shadow-card mt-8 p-5">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-[0.9375rem] font-bold">
            {t(dict, 'PRECOMMANDE.COUNTER', params)}
          </span>
          <span aria-hidden className="text-sm font-bold tabular-nums">
            {count}/{PRECOMMANDE_GOAL}
          </span>
        </p>
        <span aria-hidden className="bg-muted mt-3 block h-1.5 overflow-hidden rounded-full">
          <span
            className="bg-success block h-full rounded-full"
            style={{ width: `${Math.round((count / PRECOMMANDE_GOAL) * 100)}%` }}
          />
        </span>
        <p className="text-muted-foreground mt-3 text-[0.8125rem] leading-relaxed">
          {t(dict, 'PRECOMMANDE.COUNTER_NOTE', params)}
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {blocs.map((bloc) => (
          <div key={bloc.titre}>
            <h3 className="text-label uppercase">{t(dict, bloc.titre, params)}</h3>
            <p className="mt-2 leading-relaxed">{t(dict, bloc.corps, params)}</p>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-[0.9375rem] leading-relaxed">
        {t(dict, 'PRECOMMANDE.PRICE', params)}
      </p>

      <p className="mt-5">
        <Link href={localePath(locale, '/leurre')} className="px-btn px-btn--primary px-btn--lg">
          {t(dict, 'PRECOMMANDE.CTA', params)}
        </Link>
      </p>
      <p className="text-muted-foreground mt-3 text-[0.8125rem] leading-relaxed">
        {t(dict, 'PRECOMMANDE.CTA_NOTE', params)}
      </p>

      {/* Les conditions de la précommande, en toutes lettres et sur la même
          page que le bouton — pas dans une page annexe (règle Alure n°1). */}
      <p className="text-muted-foreground border-border mt-8 border-t pt-5 text-[0.75rem] leading-relaxed">
        {t(dict, 'PRECOMMANDE.LEGAL', params)}
      </p>
    </section>
  )
}
