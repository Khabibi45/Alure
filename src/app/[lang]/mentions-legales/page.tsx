import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * Les mentions légales dans les langues sous préfixe.
 *
 * Même contenu que la page française, rubrique par rubrique, dans le même
 * ordre : c'est une TRADUCTION, pas une réécriture. La version française reste
 * la seule qui engage et la page le DIT en tête (`LEGAL.TRANSLATION_DISCLAIMER`,
 * doctrine `docs/i18n/README.md` §2).
 *
 * Les identités du vendeur viennent toutes de `src/lib/legal-config.ts` — LA
 * source unique. Plusieurs champs y valent encore « À COMPLÉTER » : on les
 * affiche tels quels et `LEGAL_COMPLETE` garde la page hors index tant qu'ils
 * n'ont pas les vraies données. Rien ne s'invente ici.
 *
 * La mention de TVA ne se traduit pas (elle cite un article de loi français) :
 * le dictionnaire la reprend telle quelle, glosée entre parenthèses.
 */

/** Le gabarit des titres de rubrique — un seul endroit, quatre rubriques. */
const H2 = 'mt-10 text-[1.25rem] font-bold text-foreground'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    title: t(dict, 'LEGAL.NOTICE_TITLE'),
    description: t(dict, 'LEGAL.NOTICE_META_DESCRIPTION', { marque: SITE.name }),
    // Tant que `legal-config.ts` porte des « À COMPLÉTER », la page reste hors
    // index — exactement comme sa jumelle française.
    robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
    alternates: {
      canonical: localePath(lang, '/mentions-legales'),
      languages: hreflangAlternates('/mentions-legales').languages,
    },
  }
}

export default async function LangMentionsLegalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)

  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        {t(dict, 'LEGAL.NOTICE_H1_LEAD')} <Marker>{t(dict, 'LEGAL.NOTICE_H1_MARKED')}</Marker>
      </h1>

      {/* L'avertissement AVANT le contenu : personne ne doit lire l'identité du
          vendeur en croyant lire la version qui fait foi. */}
      <div className="mt-6 rounded-row border border-border bg-surface p-5">
        <p className="text-sm text-foreground">{t(dict, 'LEGAL.TRANSLATION_DISCLAIMER')}</p>
      </div>

      <h2 className={H2}>{t(dict, 'LEGAL.NOTICE_S1_TITLE')}</h2>
      <p className="mt-3">
        {t(dict, 'LEGAL.NOTICE_S1_BODY', {
          marque: SITE.name,
          vendeur: LEGAL.vendorName,
          siren: LEGAL.siren,
          adresse: LEGAL.address,
        })}
      </p>
      <p className="mt-3">
        {t(dict, 'LEGAL.NOTICE_S1_PUBLISHER', {
          vendeur: LEGAL.vendorName,
          email: LEGAL.contactEmail,
        })}
      </p>
      <p className="mt-3">{t(dict, 'LEGAL.NOTICE_VAT')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.NOTICE_S2_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.NOTICE_S2_BODY', { hebergeur: LEGAL.host })}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.NOTICE_S3_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.NOTICE_S3_BODY', { marque: SITE.name })}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.NOTICE_S4_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.NOTICE_S4_BODY', { email: LEGAL.contactEmail })}</p>
    </main>
  )
}
