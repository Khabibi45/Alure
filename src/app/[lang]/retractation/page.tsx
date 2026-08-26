import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * Le droit de rétractation dans les langues sous préfixe — le pendant de
 * `src/app/(fr)/retractation/page.tsx`, étape par étape, dans le même ordre.
 *
 * C'est une TRADUCTION, pas une réécriture : la version française reste la
 * seule qui engage et la page le DIT en tête (`LEGAL.TRANSLATION_DISCLAIMER`,
 * doctrine `docs/i18n/README.md` §2). Le fond ne bouge pas d'un mot —
 * `UI-COPY.md` interdit de retoucher un texte contractuel « pour le style ».
 *
 * Le formulaire type reste un formulaire type : l'anglais le rend ligne par
 * ligne, avec les mêmes champs à remplir, pour qu'il reste recopiable dans un
 * email. Une seule clé par ligne, sinon la structure se perd à la traduction.
 *
 * L'identité du vendeur et l'adresse de retour viennent de
 * `src/lib/legal-config.ts` — LA source unique. Plusieurs champs y valent
 * encore « À COMPLÉTER » : on les affiche tels quels, et `LEGAL_COMPLETE` garde
 * la page hors index tant qu'ils n'ont pas les vraies données. Rien ne
 * s'invente ici.
 */

/** Le gabarit des titres de rubrique — un seul endroit, deux rubriques. */
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
    title: t(dict, 'LEGAL.WITHDRAWAL_TITLE'),
    description: t(dict, 'LEGAL.WITHDRAWAL_META_DESCRIPTION', { marque: SITE.name }),
    // Tant que `legal-config.ts` porte des « À COMPLÉTER », la page reste hors
    // index — exactement comme sa jumelle française.
    robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
    alternates: {
      canonical: localePath(lang, '/retractation'),
      languages: hreflangAlternates('/retractation').languages,
    },
  }
}

export default async function LangRetractationPage({
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
        {t(dict, 'LEGAL.WITHDRAWAL_H1_LEAD')}{' '}
        <Marker>{t(dict, 'LEGAL.WITHDRAWAL_H1_MARKED')}</Marker>
      </h1>

      {/* L'avertissement AVANT la procédure : personne ne doit suivre ces
          étapes en croyant lire la version qui fait foi. */}
      <div className="mt-6 rounded-row border border-border bg-surface p-5">
        <p className="text-sm text-foreground">{t(dict, 'LEGAL.TRANSLATION_DISCLAIMER')}</p>
      </div>

      {/* Le délai porte l'emphase, comme en français : c'est LE fait de la page.
          Trois fragments plutôt qu'un, parce qu'un `t()` rend du texte, jamais
          du JSX — et qu'on ne perd pas le gras d'un délai légal. */}
      <p className="mt-6">
        {t(dict, 'LEGAL.WITHDRAWAL_LEAD_BEFORE')}{' '}
        <strong>{t(dict, 'LEGAL.WITHDRAWAL_LEAD_DEADLINE')}</strong>{' '}
        {t(dict, 'LEGAL.WITHDRAWAL_LEAD_AFTER')}
      </p>

      <h2 className={H2}>{t(dict, 'LEGAL.WITHDRAWAL_HOW_TITLE')}</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-5">
        <li>{t(dict, 'LEGAL.WITHDRAWAL_STEP_NOTIFY', { email: LEGAL.contactEmail })}</li>
        <li>{t(dict, 'LEGAL.WITHDRAWAL_STEP_RETURN', { adresse: LEGAL.returnAddress })}</li>
        <li>{t(dict, 'LEGAL.WITHDRAWAL_STEP_REFUND')}</li>
      </ol>

      <h2 className={H2}>{t(dict, 'LEGAL.WITHDRAWAL_FORM_TITLE')}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{t(dict, 'LEGAL.WITHDRAWAL_FORM_INTRO')}</p>
      {/* Une ligne = une clé. Les « … » sont les champs que le client remplit :
          ils restent tels quels dans toutes les langues. */}
      <blockquote className="mt-4 rounded-row bg-surface p-5 text-sm">
        {t(dict, 'LEGAL.WITHDRAWAL_FORM_BODY', {
          vendeur: LEGAL.vendorName,
          email: LEGAL.contactEmail,
        })}
        <br />
        {t(dict, 'LEGAL.WITHDRAWAL_FORM_LINE_DATES')}
        <br />
        {t(dict, 'LEGAL.WITHDRAWAL_FORM_LINE_ORDER')}
        <br />
        {t(dict, 'LEGAL.WITHDRAWAL_FORM_LINE_CONSUMER')}
        <br />
        {t(dict, 'LEGAL.WITHDRAWAL_FORM_LINE_DATE')}
      </blockquote>
    </main>
  )
}
