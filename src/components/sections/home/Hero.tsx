import { AlureArrow } from '@/components/ui/AlureArrow'
import { HeroScroll } from './HeroScroll'
import { HeroVideo } from './HeroVideo'
import { LureCarousel } from './LureCarousel'
import type { HeroVariant } from '@/lib/hero-variant'

/**
 * Le hero de l'accueil : la séquence au scroll (le leurre qui traverse la
 * surface, puis nage), qui se fond sur le carrousel 3D des coloris.
 *
 * L'image se suffit : AUCUN texte n'est posé dessus. Le titre de la page
 * existe quand même — en `sr-only` — parce qu'une page sans `<h1>` est une
 * page muette pour le SEO et les lecteurs d'écran.
 *
 * Pas de `<Marker>` : la landing est territoire de marque, le surligneur y est
 * interdit (charte V.02 §2). La flèche, elle, y est chez elle — en filigrane.
 */
/** Le titre du hero — réel pour les machines, invisible à l'écran. */
function HeroCopy({ title }: { title: string }) {
  return <h1 className="sr-only">{title}</h1>
}

/**
 * `cine` : la vidéo se joue au chargement, puis rend la main au défilement
 * (l'accueil). `scroll` : la séquence pilotée au défilement seule. `video` :
 * la vidéo qui se joue seule. Tout le reste — titre, filigrane, carrousel 3D,
 * calage — est commun.
 */
export function Hero({
  variant = 'cine',
  title,
}: {
  variant?: HeroVariant
  /** Le `<h1>` sr-only de la page — vient du dictionnaire de la langue servie. */
  title: string
}) {
  return (
    // `overflow-x-clip` : la flèche filigrane dépasse VOLONTAIREMENT du cadre —
    // sans rognage, c'est elle qui créait un défilement latéral de toute la
    // page. `clip` (pas `hidden`) : il rogne sans créer de conteneur de scroll,
    // donc le `position: sticky` du hero continue de fonctionner.
    <div className="relative overflow-x-clip">
      {/* La flèche en filigrane, plafonnée à 0.06 par la charte §2. */}
      <AlureArrow className="pointer-events-none absolute inset-x-0 top-[38svh] z-0 w-[150%] max-w-none -translate-x-[18%] -translate-y-1/2 text-foreground opacity-[0.06] select-none md:w-[110%] md:-translate-x-[5%]" />

      {variant === 'video' ? (
        <HeroVideo overlay={<HeroCopy title={title} />}>
          <LureCarousel />
        </HeroVideo>
      ) : (
        <HeroScroll intro={variant === 'cine'} overlay={<HeroCopy title={title} />}>
          <LureCarousel />
        </HeroScroll>
      )}
    </div>
  )
}
