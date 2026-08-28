import Link from 'next/link'
import Image from 'next/image'
import { getDictionary, t, localePath, DEFAULT_LOCALE, type Locale } from '@/lib/i18n'

/**
 * Footer commun (charte V.02 §8.16) : la seule zone d'interface où vit le
 * lock-up complet (wordmark + flèche — territoires étanches §2). Le wordmark
 * reste du texte tant que son SVG n'est pas vectorisé (charte §13.3).
 *
 * Server Component : il lit lui-même le dictionnaire de sa langue — rien ne
 * part dans le bundle client. Les pages légales restent en FRANÇAIS quelle que
 * soit la langue (elles seules engagent — docs/i18n/README.md §2) : les autres
 * langues l'annoncent via `LEGAL.TRANSLATION_DISCLAIMER`.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const fr = locale === DEFAULT_LOCALE

  const siteLinks = [
    { href: localePath(locale, '/'), label: t(dict, 'NAV.HOME') },
    // Les pages non traduites (produit, suivi, à-propos) mènent à leur version
    // FRANÇAISE — un lien qui marche vaut mieux qu'un 404 poli. À localiser au
    // fur et à mesure des traductions de pages.
    { href: localePath(locale, '/leurre'), label: t(dict, 'NAV.PRODUCT') },
    { href: localePath(locale, '/nos-projets'), label: t(dict, 'NAV.PROJECTS') },
    { href: localePath(locale, '/a-propos'), label: t(dict, 'NAV.ABOUT') },
    { href: localePath(locale, '/faq'), label: t(dict, 'NAV.FAQ') },
    { href: localePath(locale, '/suivi'), label: t(dict, 'NAV.TRACKING_LONG') },
    { href: localePath(locale, '/contact'), label: t(dict, 'NAV.CONTACT') },
  ]

  const legalLinks = [
    { href: localePath(locale, '/mentions-legales'), label: t(dict, 'LEGAL.NOTICE_TITLE') },
    { href: localePath(locale, '/cgv'), label: t(dict, 'LEGAL.TERMS_TITLE') },
    { href: localePath(locale, '/retractation'), label: t(dict, 'LEGAL.WITHDRAWAL_TITLE') },
    { href: localePath(locale, '/confidentialite'), label: t(dict, 'LEGAL.PRIVACY_TITLE') },
  ]

  return (
    <footer className="mx-auto mt-16 max-w-5xl px-5 pb-10 md:mt-24 md:pb-16">
      {/* En desktop le footer prend de l'ampleur (demande du 2026-08-09) :
          lock-up agrandi à gauche, navigations à droite, respirations doublées. */}
      <div className="border-t border-border pt-10 md:pt-14">
        <div className="md:flex md:items-start md:justify-between md:gap-12">
          {/* Lock-up : flèche 1,40 × la largeur du wordmark, centrée (charte §10).
              Largeur EXPLICITE : un `w-[140%]` dans un parent `w-fit` se résout
              contre le bloc englobant (toute la page) — la flèche devenait géante
              et faisait défiler la page latéralement. */}
          <div className="flex w-fit flex-col items-center gap-2 md:gap-3">
            <span className="font-display text-2xl font-bold tracking-[0.03em] md:text-4xl">
              ALURE.
            </span>
            <Image
              src="/logo/alure-fleche-1.svg"
              alt=""
              width={140}
              height={22}
              className="w-36 md:w-56"
            />
          </div>

          <div className="md:text-right">
            <nav aria-label="Pages du site" className="mt-8 md:mt-0">
              <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[0.8125rem] font-bold text-prose-foreground md:justify-end md:gap-x-8 md:text-[0.9375rem]">
                {siteLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-[var(--dur-micro)] hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Liens légaux" className="mt-4 md:mt-5">
              <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[0.8125rem] text-muted-foreground md:justify-end md:gap-x-8">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-[var(--dur-micro)] hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {!fr && (
              <p className="px-hint mt-3 md:text-right">
                {t(dict, 'LEGAL.TRANSLATION_DISCLAIMER')}
              </p>
            )}
          </div>
        </div>
        <p className="px-hint mt-6 md:mt-10">{t(dict, 'NAV.FOOTER_LEGAL_LINE')}</p>
      </div>
    </footer>
  )
}
