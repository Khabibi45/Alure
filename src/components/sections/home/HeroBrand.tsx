import { AlureArrow } from '@/components/ui/AlureArrow'

/**
 * Le lock-up complet (wordmark + flèche, proportions du footer : flèche 1,40 ×
 * la largeur du wordmark, charte §10) posé SUR la vidéo d'ouverture du hero.
 *
 * Dérogation explicite à la charte §8.16 (« le lock-up complet ne vit qu'au
 * footer ») — demandée par le propriétaire le 2026-08-08, bornée à la vidéo
 * d'ouverture : le lock-up apparaît avec elle et disparaît avec elle. Il ne
 * survit pas au fondu — la scène 3D reste vierge de tout texte.
 *
 * `aria-hidden` : purement décoratif, le nom du site est déjà porté par le
 * header et le `<h1>` de la page.
 */
export function HeroBrand() {
  return (
    // `top` plus bas sur téléphone : le header en surcouche s'y étale sur trois
    // lignes — le lock-up respire dessous, sans toucher le splash au centre.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[21svh] z-30 flex justify-center sm:top-[14svh]"
    >
      {/* Couleur SOMBRE (demande du 2026-08-09) : le bleu nuit de la marque sur
          les plans clairs du lac ; le halo clair le garde lisible quand la
          caméra plonge. Tailles montées d'un cran à la même demande. */}
      <div className="flex w-fit flex-col items-center gap-2">
        <span className="font-display text-5xl font-bold tracking-[0.03em] text-background drop-shadow-[0_0_16px_rgba(255,255,255,0.35)] sm:text-6xl">
          ALURE.
        </span>
        {/* Largeurs EXPLICITES au ratio charte §10 (flèche ≈ 1,40 × le wordmark) :
            un `w-[140%]` se résoudrait contre le bloc englobant plein écran, pas
            contre le wordmark — la flèche avalerait le mobile. */}
        <AlureArrow className="w-64 text-background drop-shadow-[0_0_16px_rgba(255,255,255,0.35)] sm:w-80" />
      </div>
    </div>
  )
}
