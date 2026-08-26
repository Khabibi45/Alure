import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'
import { getDictionary, t, isLocale, localePath, hreflangAlternates } from '@/lib/i18n'

/**
 * La politique de confidentialité dans les langues sous préfixe.
 *
 * C'est une TRADUCTION de `src/app/(fr)/confidentialite/page.tsx`, section par
 * section, dans le même ordre : on ne réécrit pas un texte RGPD pour le style.
 * La version française reste la seule qui fasse foi et la page le DIT en tête
 * (`LEGAL.TRANSLATION_DISCLAIMER`, doctrine `docs/i18n/README.md` §2).
 *
 * Elle décrit ce que le site fait RÉELLEMENT — pas de cookies de suivi, pas de
 * bannière, paiement chez Stripe, emails chez Resend, hébergement Vercel. Les
 * noms des sous-traitants sont des raisons sociales : ils ne se traduisent pas.
 *
 * TODO(LOT4): au branchement de Vercel Analytics (mesure d'audience sans
 * cookie), la section « Cookies » doit être revue ICI et dans la page
 * française — les deux, sinon les versions divergent en silence.
 */

/** Le gabarit des titres de section — un seul endroit, six sections. */
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
    title: t(dict, 'LEGAL.PRIVACY_TITLE'),
    description: t(dict, 'LEGAL.PRIVACY_META_DESCRIPTION', { marque: SITE.name }),
    // Tant que `legal-config.ts` porte des « À COMPLÉTER », la page reste hors
    // index — exactement comme sa jumelle française.
    robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
    alternates: {
      canonical: localePath(lang, '/confidentialite'),
      languages: hreflangAlternates('/confidentialite').languages,
    },
  }
}

export default async function LangPrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'fr'
  const dict = getDictionary(locale)

  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        {t(dict, 'LEGAL.PRIVACY_H1_LEAD')} <Marker>{t(dict, 'LEGAL.PRIVACY_H1_MARKED')}</Marker>
      </h1>

      {/* L'avertissement AVANT le texte : personne ne doit lire ses droits ici
          en croyant lire la version qui engage. */}
      <div className="mt-6 rounded-row border border-border bg-surface p-5">
        <p className="text-sm text-foreground">{t(dict, 'LEGAL.TRANSLATION_DISCLAIMER')}</p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{t(dict, 'LEGAL.PRIVACY_UPDATED')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S1_TITLE')}</h2>
      <p className="mt-3">
        {t(dict, 'LEGAL.PRIVACY_S1_BODY', {
          vendeur: LEGAL.vendorName,
          adresse: LEGAL.address,
          email: LEGAL.contactEmail,
        })}
      </p>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S2_TITLE')}</h2>
      <ul className="mt-3 list-disc space-y-3 pl-5">
        <li>
          <strong>{t(dict, 'LEGAL.PRIVACY_S2_ORDER_LABEL')}</strong>{' '}
          {t(dict, 'LEGAL.PRIVACY_S2_ORDER_BODY')}
        </li>
        <li>
          <strong>{t(dict, 'LEGAL.PRIVACY_S2_EMAILS_LABEL')}</strong>{' '}
          {t(dict, 'LEGAL.PRIVACY_S2_EMAILS_BODY')}
        </li>
        <li>
          <strong>{t(dict, 'LEGAL.PRIVACY_S2_CONTACT_LABEL')}</strong>{' '}
          {t(dict, 'LEGAL.PRIVACY_S2_CONTACT_BODY')}
        </li>
      </ul>
      <p className="mt-3">{t(dict, 'LEGAL.PRIVACY_S2_NO_RESALE')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S3_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.PRIVACY_S3_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S4_TITLE')}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>{t(dict, 'LEGAL.PRIVACY_S4_STRIPE')}</li>
        <li>{t(dict, 'LEGAL.PRIVACY_S4_RESEND')}</li>
        <li>{t(dict, 'LEGAL.PRIVACY_S4_VERCEL')}</li>
      </ul>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S5_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.PRIVACY_S5_BODY')}</p>

      <h2 className={H2}>{t(dict, 'LEGAL.PRIVACY_S6_TITLE')}</h2>
      <p className="mt-3">{t(dict, 'LEGAL.PRIVACY_S6_BODY', { email: LEGAL.contactEmail })}</p>
    </main>
  )
}
