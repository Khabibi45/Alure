'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { formatSpecs, lineupSummary } from '@/lib/shop/product'
import { lureDisplayName, type LureModel } from '@/lib/lure-models'

/**
 * La fiche du leurre, tapée au clavier, révélée au clic sur le modèle 3D.
 *
 * Les lignes s'écrivent une par une, caractère par caractère. Deux garde-fous
 * pris dès le départ :
 *
 * - **`prefers-reduced-motion` affiche tout d'un coup.** Une machine à écrire est
 *   une animation, et une longue : la subir sans pouvoir l'arrêter est
 *   exactement ce que ce réglage évite.
 * - **Le texte complet est TOUJOURS dans le DOM**, en `sr-only`. Ce qui se tape
 *   n'est qu'un effet visuel : un lecteur d'écran lit la fiche entière tout de
 *   suite, il n'attend pas la fin de l'animation.
 */

/** Millisecondes par caractère. En dessous ça vibre, au-dessus ça traîne. */
export const CHAR_MS = 18
/** Pause entre deux lignes. */
export const LINE_MS = 260
/** Délai avant le premier caractère — le temps que le panneau se pose. */
export const START_MS = 120

/**
 * Tape `lines` caractère par caractère ; `enabled: false` rend tout d'un coup.
 *
 * L'effet dépend du CONTENU des lignes (`lines.join('\n')`), jamais de la
 * référence du tableau. C'est le cœur du correctif : l'appelant construit son
 * tableau à chaque rendu, et chaque caractère tapé PROVOQUE un rendu — dépendre
 * de la référence relançait donc l'effet en boucle, remise à zéro toutes les
 * `START_MS`, panneau à jamais vide. Les lignes ne contiennent pas de `\n`
 * (ce sont des phrases courtes), le séparateur est sans ambiguïté.
 */
function useTypewriter(lines: readonly string[], enabled: boolean) {
  const [typed, setTyped] = useState<string[]>([])
  const script = lines.join('\n')

  useEffect(() => {
    if (!enabled) return
    const scriptLines = script.split('\n')
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const typeLine = (lineIndex: number, charIndex: number) => {
      if (cancelled || lineIndex >= scriptLines.length) return
      const line = scriptLines[lineIndex]
      setTyped((current) => {
        const next = current.slice()
        next[lineIndex] = line.slice(0, charIndex)
        return next
      })
      if (charIndex < line.length) {
        timer = setTimeout(() => typeLine(lineIndex, charIndex + 1), CHAR_MS)
      } else {
        timer = setTimeout(() => typeLine(lineIndex + 1, 0), LINE_MS)
      }
    }

    // La remise à zéro (changement de leurre, fiche restée ouverte) passe par le
    // minuteur, pas par le corps de l'effet : un `setState` synchrone dans un
    // effet déclenche un rendu en cascade.
    timer = setTimeout(() => {
      setTyped([])
      typeLine(0, 0)
    }, START_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [script, enabled])

  // Mouvement réduit : le texte complet, DÉRIVÉ, sans passer par l'état.
  return enabled ? typed : lines.slice()
}

export function LureSpecs({
  model,
  onClose,
  footer,
}: {
  model: LureModel
  onClose: () => void
  /** L'action sous les specs (consigne Camil : « Ajouter au panier » après la fiche). */
  footer?: ReactNode
}) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Échap ferme : un panneau qui se ferme au clavier autant qu'à la souris.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Le résumé de gamme vient du module shop : « 4 coloris » (3 vendus + le
  // collector, sans le dire) était une arithmétique commerciale locale — et fausse.
  const lines = [formatSpecs(), lineupSummary(), ...model.lines]
  const typed = useTypewriter(lines, !reducedMotion)
  const finished =
    typed.length === lines.length && typed[lines.length - 1] === lines[lines.length - 1]

  return (
    <aside
      aria-label={`Fiche du leurre ${lureDisplayName(model)}`}
      className="pointer-events-auto w-[min(22rem,calc(100vw-2.5rem))] rounded-card bg-background/35 p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-label text-muted-foreground uppercase">{lureDisplayName(model)}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche"
          className="-m-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {/* Le texte complet, tout de suite, pour les lecteurs d'écran. */}
      <p className="sr-only">{lines.join(' ')}</p>

      <ul aria-hidden className="mt-3 space-y-1.5 font-display text-[0.9375rem] leading-relaxed">
        {lines.map((line, index) => (
          // La liste est statique pour un leurre donné : l'index est une clé sûre,
          // et deux lignes au libellé identique ne se percutent pas.
          <li key={index} className="text-prose-foreground">
            {typed[index] ?? ''}
            {!finished && typed[index] !== undefined && typed[index] !== line && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-foreground" />
            )}
          </li>
        ))}
      </ul>

      {footer && <div className="mt-4">{footer}</div>}
    </aside>
  )
}
