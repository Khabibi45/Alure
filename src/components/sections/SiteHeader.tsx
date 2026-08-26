'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LangSwitcher, type LangOption } from './LangSwitcher'
import { localePath, type Locale } from '@/lib/i18n/paths'
import type { NavItem } from '@/lib/i18n/chrome'

/**
 * Header commun (charte V.02 §8.16) : wordmark SEUL — jamais le lock-up avec
 * flèche ici (territoires étanches §2, le lock-up vit au footer et au hero
 * landing). Item actif = `.px-marker-block` (3ᵉ emplacement du surligneur).
 * Client pour l'état actif (usePathname) et l'ombre après 24px de scroll.
 *
 * Sur l'ACCUEIL, le header est une SURCOUCHE (`fixed`, fond transparent en
 * haut de page) : le hero occupe l'écran entier dès le premier pixel — mobile
 * comme desktop. Défiler vers le bas l'efface (la scène règne seule) ;
 * remonter le rappelle, sur fond plein. Le hero pose un voile dégradé sous le
 * chrome pour la lisibilité sur les plans clairs de la vidéo. Les autres pages
 * gardent le header `sticky` classique : il fait partie du flux, rien ne passe
 * dessous.
 *
 * Les libellés arrivent PRÉPARÉS du serveur (`@/lib/i18n/chrome`) : le client
 * n'embarque aucun dictionnaire.
 */
export function SiteHeader({
  locale,
  navItems,
  switcher,
}: {
  locale: Locale
  navItems: readonly NavItem[]
  switcher: { buttonLabel: string; options: readonly LangOption[]; noTranslationNote: string }
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  /** Accueil uniquement : `true` = le header s'est effacé (défilement vers le bas). */
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)
  const isHome = pathname === localePath(locale, '/')
  /** Surcouche transparente sur le hero : les liens passent au blanc plein —
   *  le gris `muted` se noie sur les plans clairs de la vidéo. */
  const overlay = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // Un seuil de 4px filtre le bruit du défilement ; sous 96px on ne cache
      // jamais — le header ne doit pas clignoter dès le premier geste.
      if (y > lastYRef.current + 4 && y > 96) setHidden(true)
      else if (y < lastYRef.current - 4) setHidden(false)
      lastYRef.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={
        isHome
          ? `fixed inset-x-0 top-0 z-50 duration-[var(--dur-element)] motion-safe:transition-[transform,background-color,box-shadow] ${
              hidden ? '-translate-y-full' : 'translate-y-0'
            } ${scrolled ? 'bg-background shadow-lifted' : 'bg-transparent'}`
          : `sticky top-0 z-50 bg-background transition-shadow duration-[var(--dur-element)] ${
              scrolled ? 'shadow-lifted' : ''
            }`
      }
    >
      {/* `min-h` + `flex-wrap` : la navigation passe sous le wordmark sur les
          petits écrans au lieu de déborder — sans menu burger. Le sélecteur de
          langue reste EN TÊTE de ligne : un visiteur qui ne comprend pas la
          page ne doit pas le chercher (README i18n §4). */}
      <div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-x-6 px-5 py-2 md:min-h-18 md:py-0">
        <Link
          href={localePath(locale, '/')}
          className="font-display text-xl font-bold tracking-[0.03em]"
        >
          ALURE.
        </Link>
        <div className="flex flex-wrap items-center">
          <nav aria-label="Navigation principale">
            <ul className="flex flex-wrap items-center">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`inline-flex min-h-11 items-center px-2.5 text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-[var(--dur-micro)] ${
                        active
                          ? 'px-marker-block text-foreground'
                          : overlay
                            ? 'text-foreground/90 hover:text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <LangSwitcher
            buttonLabel={switcher.buttonLabel}
            options={switcher.options}
            noTranslationNote={switcher.noTranslationNote}
            tone={overlay ? 'overlay' : 'default'}
          />
        </div>
      </div>
    </header>
  )
}
