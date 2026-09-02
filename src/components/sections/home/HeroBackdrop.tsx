'use client'

import { useEffect, useRef } from 'react'
import NextImage from 'next/image'
import {
  HERO_BACKDROP_ANIMATED,
  HERO_BACKDROP_VIDEO,
  HERO_BACKDROP_POSTER,
} from '@/lib/hero-variant'

/**
 * Le décor derrière le leurre 3D : une boucle sous-marine muette.
 *
 * Sous la vidéo, une image fixe du MÊME décor — SANS le leurre (extraite de la
 * boucle par `npm run video:mobile`). Elle sert de deux façons : elle occupe le
 * cadre le temps que la boucle se charge (jamais de trou noir), et elle reste
 * le décor si la lecture automatique est refusée ou si `prefers-reduced-motion`
 * est actif. JAMAIS la dernière image de la séquence ici : elle contient le
 * leurre filmé, qui apparaîtrait en double sous le leurre 3D.
 */
export function HeroBackdrop({ alive = true }: { alive?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Boucle coupée : il n'y a pas d'élément à piloter, et rien à écouter.
    if (!HERO_BACKDROP_ANIMATED) return
    const video = videoRef.current
    if (!video) return
    // Tant que la scène n'est pas rendue au décor, la boucle attend sur sa
    // première image. Sans ça elle tourne pendant tout le hero et, au moment du
    // fondu, elle se trouve à un instant quelconque de son cycle : le décor
    // changerait de plan en même temps que le leurre.
    if (!alive) {
      video.pause()
      return
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      if (query.matches) {
        video.pause()
        video.currentTime = 0
      } else {
        // Un refus de lecture automatique n'est pas une erreur : l'image fixe
        // en dessous fait le décor, il n'y a rien à signaler au visiteur.
        video.play().catch(() => {})
      }
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [alive])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <NextImage
        src={HERO_BACKDROP_POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {HERO_BACKDROP_ANIMATED && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          style={{ opacity: alive ? 1 : 0, transition: `opacity 1200ms var(--ease-out-soft)` }}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={HERO_BACKDROP_VIDEO} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
