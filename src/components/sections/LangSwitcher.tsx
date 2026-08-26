'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { hasTranslation, localePathOrHome, splitLocalePath, type Locale } from '@/lib/i18n/paths'

/**
 * Le sélecteur de langue (docs/i18n/README.md §4) : un bouton portant le code
 * de la langue courante, qui ouvre la liste des deux. Pas de drapeaux (un
 * drapeau désigne un pays, pas une langue) ; chaque nom s'écrit DANS SA LANGUE.
 * Le changement garde la page courante QUAND elle existe dans la langue visée.
 * Sinon il conduit à l'accueil de cette langue, et le dit (`noTranslationNote`)
 * plutôt que de mener à une page « introuvable » — ce qui arrivait sur 11 des
 * 13 pages du site. Le choix se retient dans un cookie strictement nécessaire
 * (préférence d'affichage — pas un traceur).
 */

const LANG_COOKIE = 'alure-lang'
/** Un an — une préférence d'affichage, pas une session. */
const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export type LangOption = { code: Locale; label: string }

export function LangSwitcher({
  buttonLabel,
  options,
  noTranslationNote,
  tone = 'default',
}: {
  /** « Changer de langue — actuellement Français » (aria, dans la langue courante). */
  buttonLabel: string
  options: readonly LangOption[]
  /** Ce qu'on dit quand la page courante n'existe pas dans la langue visée. */
  noTranslationNote: string
  /** `overlay` : posé sur le hero transparent — le gris `muted` s'y noierait. */
  tone?: 'default' | 'overlay'
}) {
  const pathname = usePathname()
  const { locale: current, path } = splitLocalePath(pathname)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Clic hors du menu ou Échap : il se referme — comportement attendu d'un popover.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-11 items-center gap-1 px-2.5 text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-[var(--dur-micro)] hover:text-foreground ${
          tone === 'overlay' ? 'text-foreground/90' : 'text-muted-foreground'
        }`}
      >
        {current.toUpperCase()}
        <span aria-hidden className="text-[0.625rem]">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={buttonLabel}
          className="rounded-card bg-surface shadow-lifted absolute right-0 z-50 mt-1 min-w-36 py-2"
        >
          {options.map((option) => {
            const active = option.code === current
            return (
              <li key={option.code}>
                <Link
                  href={localePathOrHome(option.code, path)}
                  title={hasTranslation(path) ? undefined : noTranslationNote}
                  lang={option.code}
                  hrefLang={option.code}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => {
                    document.cookie = `${LANG_COOKIE}=${option.code}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`
                    setOpen(false)
                  }}
                  className={`block px-4 py-2 text-[0.875rem] transition-colors duration-[var(--dur-micro)] ${
                    active
                      ? 'text-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
