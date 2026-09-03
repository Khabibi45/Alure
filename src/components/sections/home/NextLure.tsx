import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getDictionary, t } from '@/lib/i18n'
import { localePath, type Locale } from '@/lib/i18n/paths'
import { NextLureViewer } from './NextLureViewer'

/**
 * « Prochaine sélection » — le leurre suivant, montré sous le carrousel de
 * l'accueil (consigne Camil, 2026-09-03).
 *
 * ── CE QUI COMMANDE SON CONTENU ──
 *
 * C'est une section qui TEASE, donc celle où l'on est le plus tenté d'inventer.
 * Trois garde-fous, et ils sont dans le texte :
 *
 * 1. **Aucune date.** Ni « bientôt », ni saison, ni mois. Annoncer une date de
 *    disponibilité engage (art. L216-1 dès qu'un paiement est en jeu), et une
 *    date manquée se paie plus cher que l'attente elle-même. La section dit
 *    explicitement qu'il n'y en aura pas tant qu'on n'en sera pas sûr — c'est la
 *    même doctrine que le délai de livraison, jamais atténué.
 * 2. **Aucune caractéristique.** Pas de taille, pas de poids, pas de coloris :
 *    rien n'est mesuré sur cette pièce. Le seul argument affiché — la pêche de
 *    l'aspe — est celui dicté par Camil, pas déduit du modèle (`lure-models.ts`
 *    porte la même règle pour les leurres vendus).
 * 3. **Aucun bouton d'achat.** Il ne se vend pas. Le seul lien part vers « Nos
 *    projets », la page qui dit où en est la maison — pas vers la boutique.
 */
export function NextLure({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  return (
    <section
      aria-labelledby="next-lure-title"
      className="mx-auto max-w-5xl px-5 py-14 md:py-20 lg:py-24"
    >
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
        {/* Le visuel d'abord sur téléphone : c'est lui qui arrête le défilement. */}
        <div className="order-1 md:order-2">
          <div className="rounded-card bg-surface shadow-card overflow-hidden">
            <NextLureViewer
              loadingLabel={t(dict, 'HOME.LOADING')}
              description={t(dict, 'HOME.NEXT_ALT')}
            />
          </div>
        </div>

        <div className="order-2 md:order-1">
          <p className="text-[0.8125rem] font-bold tracking-[0.2em] text-info uppercase">
            {t(dict, 'HOME.NEXT_OVERLINE')}
          </p>
          <h2
            id="next-lure-title"
            className="mt-3 text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] text-balance uppercase md:text-[2.5rem]"
          >
            {t(dict, 'HOME.NEXT_TITLE')}
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-prose-foreground text-balance">
            {t(dict, 'HOME.NEXT_BODY')}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {t(dict, 'HOME.NEXT_STATUS')}
          </p>

          <Link
            href={localePath(locale, '/nos-projets')}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-bold transition-colors duration-[var(--dur-micro)] hover:text-info"
          >
            {t(dict, 'HOME.NEXT_LINK')}
            <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
