'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlureLoader } from '@/components/ui/AlureLoader'
import { HeroBackdrop } from './HeroBackdrop'
import { HERO_FADE_LEAD_S, HERO_FADE_MS } from './HeroVideo'
import { useIsPortrait } from './use-portrait'
import { HERO_VIDEO, HERO_VIDEO_MOBILE } from '@/lib/hero-variant'
import { heroFrameUrl, loadHeroFramesManifest, type HeroFramesManifest } from '@/lib/hero-frames'

/**
 * Le hero au scroll : une séquence d'images dessinée sur un canvas, dont
 * l'avancement suit le défilement — puis un fondu vers le carrousel 3D.
 *
 * Trois décisions d'implémentation, et leur pourquoi :
 *
 * 1. **`position: sticky` en CSS, pas le `pin` de ScrollTrigger.** Le projet a
 *    déjà payé le bug documenté dans WEB-REFERENCE : une section pinnée par GSAP
 *    peut passer en `position:fixed; width:0` au chargement, le contenu disparaît
 *    jusqu'au premier resize. `sticky` est natif, mesuré par le navigateur, et
 *    n'a pas ce problème. gsap et lenis restent hors du bundle de cette page.
 *
 * 2. **Une séquence d'images, pas la vidéo scrubbée.** `video.currentTime` piloté
 *    au scroll saute sur mobile : le décodeur ne cherche qu'aux images-clés. Une
 *    image par frame se dessine sans à-coup.
 *
 * 3. **Le dessin est fait dans une boucle rAF, pas dans l'écouteur de scroll.**
 *    L'écouteur ne fait qu'enregistrer une position ; la boucle ne redessine que
 *    si l'image a changé. Sans ça, on repeint plusieurs fois par frame pour rien.
 *
 * `prefers-reduced-motion` : aucune séquence, aucun fondu — la dernière image
 * s'affiche directement et le carrousel 3D est immédiatement là. En mode
 * `intro`, la vidéo d'ouverture n'est pas montée non plus : rien ne se joue seul.
 *
 * Le mode `intro` (variante `cine`) ajoute l'ouverture vidéo par-dessus cette
 * mécanique — voir `HeroScrollProps.intro`. La séquence au défilement reste LE
 * moteur ; la vidéo n'est qu'un rideau de lancement qui se dissout dessus.
 */

/** Hauteur de défilement de la section, en multiples de l'écran. */
const SCROLL_HEIGHT_VH = 320
/** Part du défilement consacrée à la séquence d'images. */
const SEQUENCE_END = 0.72
/**
 * Début du fondu vers la 3D. L'écart avec `SEQUENCE_END` est un TEMPS DE PAUSE
 * sur la dernière image : sans lui, le fondu démarre à l'instant même où la
 * dernière image s'affiche, et le leurre 3D commence à apparaître alors que le
 * leurre filmé n'a pas fini d'arriver — on voit les deux quelques images durant.
 */
const FADE_START = 0.82

type Status = 'loading' | 'ready' | 'failed'

/**
 * Le cycle de vie de l'ouverture vidéo (mode `intro`) :
 * `playing` → elle se joue par-dessus la scène ; `leaving` → elle se dissout
 * (fondu `HERO_FADE_MS`) ; `done` → elle est retirée du DOM, le défilement règne.
 */
type IntroPhase = 'playing' | 'leaving' | 'done'

type HeroScrollProps = {
  /** Le carrousel 3D, révélé par le fondu en fin de séquence. */
  children: React.ReactNode
  /** Le titre `sr-only` de la page — aucun texte visible sur la scène. */
  overlay: React.ReactNode
  /**
   * Le libellé du chargeur, dans la langue servie. En prop et non en dur : ce
   * composant est `'use client'` et s'affiche aussi sur `/en`, où « Chargement. »
   * était le dernier mot français visible du hero (règle Alure n°6).
   */
  loadingLabel: string
  /** Le message d'échec de la séquence d'images, dans la langue servie. */
  framesFailedLabel: string
  /**
   * `true` = l'hybride `cine` : la vidéo se joue d'abord PAR-DESSUS la scène,
   * puis dépose le visiteur en bas de la section — là où le carrousel 3D est
   * révélé. Remonter fait alors défiler la séquence à rebours, redescendre
   * ramène à la 3D, et recharger la page rejoue la vidéo (la restauration de
   * défilement est désactivée le temps de ce composant). Un défilement pendant
   * la vidéo = le visiteur prend la main, l'ouverture s'efface sans le déplacer.
   */
  intro?: boolean
}

export function HeroScroll({
  children,
  overlay,
  intro = false,
  loadingLabel,
  framesFailedLabel,
}: HeroScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const progressRef = useRef(0)
  const drawnRef = useRef(-1)

  const [status, setStatus] = useState<Status>('loading')
  const [manifest, setManifest] = useState<HeroFramesManifest | null>(null)
  const [loaded, setLoaded] = useState(0)
  /** Part du fondu déjà franchie : 0 = séquence seule, 1 = 3D seule. */
  const [blend, setBlend] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  /** Portrait = vidéo téléphone (recadrage central 9:16, plein cadre). */
  const portrait = useIsPortrait()
  const introSrc = portrait ? HERO_VIDEO_MOBILE : HERO_VIDEO

  const introVideoRef = useRef<HTMLVideoElement | null>(null)
  const introLeftRef = useRef(false)
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [introPhase, setIntroPhase] = useState<IntroPhase>(intro ? 'playing' : 'done')

  /**
   * Quitter l'ouverture — une seule fois, quel que soit le déclencheur.
   * `jumpToEnd` : fin normale de la vidéo → on dépose le visiteur en bas de la
   * section, SOUS la vidéo encore opaque, pour que le saut de défilement soit
   * invisible ; la dissolution révèle la 3D déjà en place. Sans saut (lecture
   * refusée, erreur, visiteur qui défile) : il garde sa position, la séquence
   * au défilement est déjà sous ses doigts.
   */
  const leaveIntro = useCallback((jumpToEnd: boolean) => {
    if (introLeftRef.current) return
    introLeftRef.current = true
    if (jumpToEnd) {
      const section = sectionRef.current
      if (section) {
        window.scrollTo({
          top: section.offsetTop + section.offsetHeight - window.innerHeight,
          behavior: 'instant',
        })
      }
    }
    setIntroPhase('leaving')
    introTimerRef.current = setTimeout(() => setIntroPhase('done'), HERO_FADE_MS)
  }, [])

  useEffect(
    () => () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
    },
    []
  )

  // Recharger la page = revoir la vidéo. Le navigateur restaurerait sinon la
  // position de défilement, et l'ouverture se jouerait hors écran.
  useEffect(() => {
    if (!intro) return
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    return () => {
      history.scrollRestoration = previous
    }
  }, [intro])

  // Défiler pendant la vidéo, c'est demander la main : l'ouverture s'efface et
  // le visiteur se retrouve exactement là où il a défilé, séquence sous le doigt.
  useEffect(() => {
    if (!intro || reducedMotion || introPhase !== 'playing') return
    const onScroll = () => {
      if (window.scrollY > 24) leaveIntro(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [intro, reducedMotion, introPhase, leaveIntro])

  // `introSrc` dans les dépendances : changer d'orientation REMONTE l'élément
  // vidéo (key) — sans ça, la nouvelle vidéo resterait en pause.
  useEffect(() => {
    if (!intro || reducedMotion || introPhase !== 'playing') return
    const video = introVideoRef.current
    if (!video) return
    // Lecture refusée (économie de données, réglage navigateur) : pas de
    // simulacre — le hero est simplement la séquence au défilement.
    video.play().catch(() => leaveIntro(false))
  }, [intro, reducedMotion, introPhase, leaveIntro, introSrc])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Chargement du manifeste puis des images. La première image est attendue pour
  // pouvoir peindre tout de suite ; les autres arrivent en arrière-plan.
  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    loadHeroFramesManifest(controller.signal)
      .then((data) => {
        if (cancelled) return
        setManifest(data)
        const images: HTMLImageElement[] = []
        let done = 0
        for (let i = 1; i <= data.count; i += 1) {
          const image = new Image()
          image.decoding = 'async'
          image.src = heroFrameUrl(i)
          image.onload = () => {
            done += 1
            if (!cancelled) setLoaded(done)
            if (i === 1 && !cancelled) setStatus('ready')
          }
          image.onerror = () => {
            if (!cancelled) setStatus('failed')
          }
          images.push(image)
        }
        framesRef.current = images
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        // Échec bruyant : la section affiche un vrai message, pas un cadre noir.
        console.error('Hero au scroll : séquence d’images indisponible.', error)
        setStatus('failed')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current
    const image = framesRef.current[index]
    if (!canvas || !image || !image.complete || image.naturalWidth === 0) return
    const context = canvas.getContext('2d')
    if (!context) return
    if (canvas.width !== image.naturalWidth) {
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
    }
    context.drawImage(image, 0, 0)
    drawnRef.current = index
  }, [])

  // Scroll → progression → image. L'écouteur n'enregistre qu'un nombre ; c'est la
  // boucle rAF qui décide de redessiner, et seulement si l'image a changé.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !manifest) return

    let frame = 0
    let running = true

    const measure = () => {
      const rect = section.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      if (distance <= 0) {
        progressRef.current = 0
        return
      }
      progressRef.current = Math.min(1, Math.max(0, -rect.top / distance))
    }

    const tick = () => {
      if (!running) return
      frame = requestAnimationFrame(tick)
      const progress = progressRef.current
      const sequence = Math.min(1, progress / SEQUENCE_END)
      const index = Math.min(manifest.count - 1, Math.round(sequence * (manifest.count - 1)))
      if (index !== drawnRef.current) draw(index)

      const fade = progress <= FADE_START ? 0 : (progress - FADE_START) / (1 - FADE_START)
      setBlend((current) => (Math.abs(current - fade) > 0.01 ? fade : current))
    }

    measure()
    if (reducedMotion) {
      // Pas de séquence : la dernière image est peinte une fois, et le fondu est
      // DÉRIVÉ à 1 au rendu (cf. `blendValue`) plutôt que poussé dans l'état —
      // un état qui vaut toujours la même chose n'a pas à être stocké.
      draw(manifest.count - 1)
      return
    }

    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    tick()

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [manifest, reducedMotion, draw])

  /** En mouvement réduit, la 3D est là d'emblée : le fondu vaut 1, toujours. */
  const blendValue = reducedMotion ? 1 : blend

  return (
    <section
      ref={sectionRef}
      style={{ height: reducedMotion ? undefined : `${SCROLL_HEIGHT_VH}vh` }}
      className="relative"
      aria-label="Le leurre en action"
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
        {/* Le décor derrière la 3D : boucle sous-marine, sous tout le reste. */}
        <HeroBackdrop alive={blendValue > 0} />

        {/* La séquence. aria-hidden : c'est une illustration, le texte porte le sens.
            `cover` dans TOUTES les orientations : l'action est centrée dans les
            images (même cadrage que la vidéo téléphone) — le plein cadre prime
            sur les bords du décor. */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ opacity: 1 - blendValue }}
          className="absolute inset-0 size-full object-cover"
        />

        {status === 'failed' && (
          <p className="absolute inset-x-0 top-8 px-6 text-center text-sm text-muted-foreground">
            {framesFailedLabel}
          </p>
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-foreground">
            <AlureLoader progress={manifest ? loaded / manifest.count : null} label={loadingLabel} />
          </div>
        )}

        {/* Le carrousel 3D, révélé par le fondu. `pointer-events` désactivés tant
            qu'il est transparent, sinon il capterait les gestes par-dessus rien. */}
        <div
          style={{ opacity: blendValue, pointerEvents: blendValue > 0.5 ? 'auto' : 'none' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </div>

        {/* L'ouverture vidéo du mode `cine`, PAR-DESSUS toute la scène. Elle ne
            capte aucun clic ni défilement (`pointer-events-none`) : la page vit
            dessous, la vidéo n'est qu'un rideau qui se dissout. Retirée du DOM
            une fois `done` — pas d'élément vidéo fantôme qui garde un décodeur. */}
        {intro && !reducedMotion && introPhase !== 'done' && (
          <>
            <video
              ref={introVideoRef}
              // `key` : changer d'orientation change la SOURCE — remonter
              // l'élément est le seul rechargement fiable d'un <video>.
              key={introSrc}
              // `muted` + `playsInline` : la condition de la lecture automatique
              // sur mobile ; la vidéo n'a de toute façon aucune piste audio.
              muted
              playsInline
              preload="auto"
              poster={heroFrameUrl(1)}
              aria-hidden="true"
              // Même amorce anticipée que `HeroVideo` : le fondu part pendant que
              // le leurre filmé bouge encore, `ended` reste en filet.
              onTimeUpdate={(event) => {
                const video = event.currentTarget
                if (video.duration - video.currentTime <= HERO_FADE_LEAD_S) leaveIntro(true)
              }}
              onEnded={() => leaveIntro(true)}
              onError={() => leaveIntro(false)}
              style={{
                opacity: introPhase === 'playing' ? 1 : 0,
                transition: `opacity ${HERO_FADE_MS}ms var(--ease-out-soft)`,
              }}
              className="pointer-events-none absolute inset-0 z-20 size-full object-cover"
            >
              <source src={introSrc} type="video/mp4" />
            </video>
            {/* PROTOTYPE — à la place du lock-up FIXE : le logo-chargement qui
                se dessine à la progression RÉELLE de la séquence (elle se
                télécharge pendant la vidéo). Solidaire de la vidéo : même
                fondu, même sortie. Couleur et halo du lock-up d'origine. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-[21svh] z-30 flex justify-center sm:top-[14svh]"
              style={{
                opacity: introPhase === 'playing' ? 1 : 0,
                transition: `opacity ${HERO_FADE_MS}ms var(--ease-out-soft)`,
              }}
            >
              <AlureLoader
                progress={manifest ? loaded / manifest.count : null}
                // Chargement accompli → le logo redevient le lock-up : ALURE.
                label={manifest && loaded >= manifest.count ? 'Alure.' : loadingLabel}
                showPercent={!manifest || loaded < manifest.count}
                className="text-background drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]"
                arrowClassName="w-64 sm:w-80"
              />
            </div>
          </>
        )}

        {/* Le voile sous le header en surcouche (accueil plein écran) : le
            chrome reste lisible sur les plans clairs de la vidéo. Au-dessus de
            l'ouverture vidéo (z-20), sous le header (z-50). */}
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
