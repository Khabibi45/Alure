'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_SOFT, SHIFT } from '@/lib/motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
}

const directionMap: Record<string, { x?: number; y?: number }> = {
  up: { y: SHIFT.enter },
  down: { y: -SHIFT.enter },
  left: { x: -SHIFT.enter },
  right: { x: SHIFT.enter },
  none: {},
}

/**
 * Primitive de reveal au scroll — LA façon par défaut d'animer une section.
 * Conforme fondation Pastel (§6) : translation 16px, 0.42s, ease-out-soft,
 * une seule fois. Le stagger d'une page se limite à 3 groupes (≤ 150ms d'écart
 * total via `delay`) — jamais un delay par élément. Respecte
 * prefers-reduced-motion (affichage direct, pas une animation « plus lente »).
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
}) => {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = directionMap[direction]
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: DURATION.page,
        delay,
        ease: EASE_OUT_SOFT,
      }}
    >
      {children}
    </motion.div>
  )
}
