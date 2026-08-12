import { AlureLoader } from '@/components/ui/AlureLoader'

/**
 * PROTOTYPE — l'attente de navigation (App Router) : la flèche Alure qui se
 * dessine, à la place d'une page blanche, le temps que la route arrive.
 * Non mesurable par nature (le serveur ne dit pas où il en est) : le tracé
 * boucle. Les chargements MESURABLES (séquence, modèles 3D) passent leur
 * progression réelle au même composant.
 */
export default function Loading() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <AlureLoader />
    </main>
  )
}
