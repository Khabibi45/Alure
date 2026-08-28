import Link from 'next/link'
import { PrecommandeSection } from '@/components/sections/PrecommandeSection'
import { getDictionary, t } from '@/lib/i18n'
import { localePath, type Locale } from '@/lib/i18n/paths'
import { PRECOMMANDE_GOAL } from '@/lib/shop/precommande'
import { OFFERS, PRODUCT, formatEuros, formatSpecs } from '@/lib/shop/product'

/**
 * « Nos projets » — le corps de la page, partagé par les deux langues.
 *
 * ── CE QUI COMMANDE SA STRUCTURE ──
 *
 * La page doit tenir debout DANS LES DEUX ÉTATS. Le bloc de campagne
 * (`PrecommandeSection`) se masque tant que la date d'expédition n'est pas
 * configurée — c'est le cas aujourd'hui, et la page était alors littéralement
 * vide : un en-tête, un pied de page, rien entre les deux.
 *
 * D'où le partage des rôles, qui est aussi une frontière juridique :
 *
 * - **Ce composant** ne parle que de faits présents et d'un BUT déclaré. Annoncer
 *   « on vise 100 commandes » n'engage à rien : c'est un objectif, on peut le
 *   dire librement. Aucun de ces textes n'invite à précommander, n'annonce de
 *   date, ni ne promet de remboursement.
 * - **`PrecommandeSection`** garde le monopole du compteur, de la date
 *   d'expédition, du remboursement et de l'invitation à payer. Vendre une
 *   précommande engage à une date (art. L216-1) : c'est pour ça que ce bloc-là,
 *   et lui seul, disparaît quand la date manque.
 *
 * Résultat : la campagne peut s'allumer et s'éteindre sans que la page devienne
 * incohérente, redondante ou mensongère.
 */
export function ProjectsPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  // Les valeurs viennent toutes de la source unique — aucun chiffre, aucun prix
  // et aucun délai n'est réécrit à la main dans un texte.
  const params = {
    objectif: String(PRECOMMANDE_GOAL),
    delai: t(dict, 'PRODUCT.DELAY_VALUE'),
    specs: formatSpecs(locale),
    nbColoris: String(PRODUCT.colorways.length),
    coloris: PRODUCT.colorways.map((c) => c.label).join(', '),
    collector: PRODUCT.collector.label,
    prixSolo: formatEuros(PRODUCT.pricing.soloCents, locale),
    prixCollection: formatEuros(OFFERS.collection.amountCents, locale),
  }

  /**
   * Trois blocs, et pas un de plus : état des lieux, ce qui a changé, ce qui
   * manque. Deux blocs de plus avaient été écrits puis coupés — ils
   * doublonnaient « À propos » (les rendus 3D, l'enveloppe matelassée) ou
   * empiétaient sur la campagne, qui explique déjà pourquoi cent.
   */
  const blocs = [
    { titre: 'PROJECTS.DONE_TITLE', corps: 'PROJECTS.DONE_BODY' },
    { titre: 'PROJECTS.STOCK_TITLE', corps: 'PROJECTS.STOCK_BODY' },
    { titre: 'PROJECTS.SERIES_TITLE', corps: 'PROJECTS.SERIES_BODY' },
  ] as const

  return (
    <>
      <section className="mx-auto max-w-3xl px-5 pt-10 md:pt-14">
        <h1 className="font-display text-3xl leading-tight font-bold text-balance md:text-4xl">
          {t(dict, 'PROJECTS.TITLE', params)}
        </h1>
        <p className="text-prose-foreground mt-6 text-[0.9375rem] leading-relaxed">
          {t(dict, 'PROJECTS.INTRO', params)}
        </p>

        <div className="mt-10 space-y-10">
          {blocs.map((bloc) => (
            <div key={bloc.titre}>
              <h2 className="font-display text-xl font-bold md:text-2xl">
                {t(dict, bloc.titre, params)}
              </h2>
              <p className="text-prose-foreground mt-3 text-[0.9375rem] leading-relaxed">
                {t(dict, bloc.corps, params)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* La campagne s'insère ICI, après l'objectif et avant l'appel à l'action :
          elle apporte le compteur réel et les conditions de la précommande. Quand
          elle est masquée, l'enchaînement objectif → bouton reste naturel. */}
      <PrecommandeSection locale={locale} />

      <section className="mx-auto max-w-3xl px-5 pt-10 pb-14 md:pb-20">
        <Link href={localePath(locale, '/leurre')} className="px-btn px-btn--primary px-btn--lg">
          {t(dict, 'PROJECTS.CTA', params)}
        </Link>
        <p className="text-muted-foreground mt-4 text-[0.8125rem] leading-relaxed">
          {t(dict, 'PROJECTS.CTA_NOTE', params)}
        </p>
      </section>
    </>
  )
}
