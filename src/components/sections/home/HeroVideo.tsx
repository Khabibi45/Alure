'use client'

import { useEffect, useRef, useState } from 'react'
import { HeroBackdrop } from './HeroBackdrop'
import { HeroBrand } from './HeroBrand'
import { useIsPortrait } from './use-portrait'
import { HERO_LAST_FRAME, HERO_VIDEO, HERO_VIDEO_MOBILE } from '@/lib/hero-variant'

/**
 * Variante du hero : la vidéo se joue seule, puis se fond sur le carrousel 3D.
 *
 * C'est la même mise en scène que `HeroScroll`, sans le scroll — le récit se
 * déroule tout seul et passe la main à la 3D à la dernière image.
 *
 * Ce que cette version gagne : un seul fichier (5,5 Mo) au lieu de 241 images,
 * et un rendu au temps réel voulu par le montage. Ce qu'elle perd : le visiteur
 * ne contrôle rien, et la lecture démarre avant qu'il ait décidé de regarder.
 *
 * `prefers-reduced-motion` : aucune lecture automatique. Le poster s'affiche et
 * la 3D est immédiatement présente — comme dans la version au scroll.
 */

/** Fondu long : c'est un relais entre deux images du MÊME leurre au même endroit,
 *  pas un changement d'écran. Court, ça se lit comme une coupe. Les deux couches
 *  se croisent EN MÊME TEMPS — les décaler ferait disparaître le leurre entre les
 *  deux, alors que le décor, lui, reste parfaitement fixe. */
export const HERO_FADE_MS = 2400
/**
 * Le fondu s'amorce un peu AVANT la fin de la vidéo. Attendre `ended` figeait
 * l'image puis basculait — un arrêt net suivi d'un échange, ce qui se lisait
 * comme une coupe malgré le fondu. Amorcé pendant que la vidéo bouge encore,
 * le mouvement du leurre filmé se prolonge dans la nage du leurre 3D.
 *
 * Une demi-seconde, pas plus : sur ces dernières images le leurre filmé est
 * déjà quasi posé à sa position finale (celle sur laquelle la 3D est calée) —
 * plus tôt, on verrait deux leurres à des positions différentes.
 */
export const HERO_FADE_LEAD_S = 0.6

export function HeroVideo({
  children,
  overlay,
}: {
  children: React.ReactNode
  overlay: React.ReactNode
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  /** Portrait = vidéo téléphone (recadrage central 9:16, plein cadre). */
  const portrait = useIsPortrait()
  const videoSrc = portrait ? HERO_VIDEO_MOBILE : HERO_VIDEO

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // `videoSrc` dans les dépendances : changer d'orientation remonte l'élément
  // vidéo (key) — la lecture doit repartir sur le nouvel élément.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reducedMotion) {
      video.pause()
      return
    }
    // La lecture automatique peut être refusée (économie de données, réglage
    // navigateur). On ne fait pas semblant que ça marche : on passe à la 3D.
    video.play().catch(() => setDone(true))
  }, [reducedMotion, videoSrc])

  const blend = reducedMotion || done ? 1 : 0

  return (
    <section className="relative" aria-label="Le leurre en action">
      <div className="relative flex h-svh flex-col items-center justify-center overflow-hidden">
        {/* Le décor derrière la 3D : boucle sous-marine, sous tout le reste. */}
        <HeroBackdrop alive={blend > 0} />

        <video
          ref={videoRef}
          // `key` : changer d'orientation change la SOURCE — remonter
          // l'élément est le seul rechargement fiable d'un <video>.
          key={videoSrc}
          // `muted` + `playsInline` sont la condition de la lecture automatique
          // sur mobile ; les segments n'ont de toute façon aucune piste audio.
          muted
          playsInline
          preload="auto"
          poster={HERO_LAST_FRAME}
          aria-hidden="true"
          // L'amorce anticipée du fondu. `timeupdate` bat ~4 fois par seconde :
          // assez fin pour une avance de 0,6 s. `ended` reste en filet — si un
          // navigateur saute le dernier battement, la bascule a quand même lieu.
          onTimeUpdate={(event) => {
            const video = event.currentTarget
            if (video.duration - video.currentTime <= HERO_FADE_LEAD_S) setDone(true)
          }}
          onEnded={() => setDone(true)}
          onError={() => setFailed(true)}
          style={{
            opacity: 1 - blend,
            transition: `opacity ${HERO_FADE_MS}ms var(--ease-out-soft)`,
          }}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Le lock-up de marque, solidaire de la vidéo : même fondu, même sortie.
            Toujours monté — le démonter à blend=1 le ferait DISPARAÎTRE au début
            du fondu au lieu de se dissoudre avec la vidéo. */}
        <div
          aria-hidden
          style={{
            opacity: 1 - blend,
            transition: `opacity ${HERO_FADE_MS}ms var(--ease-out-soft)`,
          }}
        >
          <HeroBrand />
        </div>

        {failed && (
          <p className="absolute inset-x-0 top-8 px-6 text-center text-sm text-muted-foreground">
            La vidéo n’a pas pu se charger.
          </p>
        )}

        <div
          style={{
            opacity: blend,
            pointerEvents: blend > 0.5 ? 'auto' : 'none',
            transition: `opacity ${HERO_FADE_MS}ms var(--ease-out-soft)`,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </div>

        {/* Le voile sous le header en surcouche (accueil plein écran) : le
            chrome reste lisible sur les plans clairs de la vidéo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-44 bg-linear-to-b from-background/70 to-transparent"
        />

        {/* Le titre `sr-only` de la page : aucun texte visible sur la scène. */}
        {overlay}
      </div>
    </section>
  )
}
