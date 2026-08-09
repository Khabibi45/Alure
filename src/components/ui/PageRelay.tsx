'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_SOFT, RELAY_DELAY, SHIFT } from '@/lib/motion'

interface PageRelayProps {
  children: ReactNode
  /**
   * Les routes DANS L'ORDRE de la nav (ex. ['/', '/stats', '/agenda', '/reglages']).
   * Détermine le sens du mouvement : aller vers une route plus bas dans la liste
   * → le contenu sort vers le haut et arrive par le bas ; plus haut → inverse.
   * Route absente de la liste : le sens « descente » est utilisé par défaut.
   */
  order?: readonly string[]
  className?: string
}

const variants = {
  enter: (direction: number) => ({ opacity: 0, y: SHIFT.enter * direction }),
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.page, ease: EASE_OUT_SOFT, delay: RELAY_DELAY },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: -SHIFT.exit * direction,
    transition: { duration: DURATION.micro, ease: EASE_OUT_SOFT },
  }),
}

function routeIndex(order: readonly string[], pathname: string): number {
  return order.findIndex((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * La transition de page fondation Pastel — le « relais directionnel »
 * (FONDATION-PASTEL.md §6). Le décor (nav, header) ne bouge pas ; le contenu
 * sortant s'efface en 0.14s pendant que l'entrant démarre à +0.09s et glisse
 * 16px verticalement dans le sens du déplacement dans la nav. Les <Marker> de
 * la page se tracent en dernier (delay 0.3s) car la page remonte à chaque route.
 *
 * Usage : dans un layout CLIENT persistant (ou un composant client du layout),
 * envelopper {children} : <PageRelay order={NAV_ROUTES}>{children}</PageRelay>.
 *
 * ⚠️ Pièges éprouvés — ne pas « simplifier » : le séquentiel strict clignote
 * (écran vide), le fondu croisé symétrique superpose les textes. Le relais
 * asymétrique (mode popLayout + delay d'entrée) est LA version validée.
 */
export function PageRelay({ children, order = [], className }: PageRelayProps) {
  const pathname = usePathname()
  // Pattern React « ajuster l'état pendant le rendu » (et non des refs, interdites
  // en rendu par react-hooks/refs) : mémorise la route précédente pour en déduire
  // le sens du relais au moment même du changement de route.
  const [previousPathname, setPreviousPathname] = useState(pathname)
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()

  if (previousPathname !== pathname) {
    const from = routeIndex(order, previousPathname)
    const to = routeIndex(order, pathname)
    setDirection(from === -1 || to === -1 || to >= from ? 1 : -1)
    setPreviousPathname(pathname)
  }

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={pathname}
        className={className}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
