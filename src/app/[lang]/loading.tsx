import { AlureLoader } from '@/components/ui/AlureLoader'

/**
 * PROTOTYPE — l'attente de navigation, côté langues préfixées. `loading.tsx`
 * ne reçoit pas les params de route : impossible de choisir le dictionnaire
 * exact ici — l'anglais fait libellé neutre pour les quatre langues.
 */
export default function Loading() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <AlureLoader label="Loading." />
    </main>
  )
}
