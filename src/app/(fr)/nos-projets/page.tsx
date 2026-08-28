import type { Metadata } from 'next'
import { ProjectsPage } from '@/components/sections/ProjectsPage'
import { getDictionary, t, hreflangAlternates } from '@/lib/i18n'
import { PRECOMMANDE_GOAL } from '@/lib/shop/precommande'

/**
 * « Nos projets » — où en est Alure, et ce qu'il reste à faire.
 *
 * Le corps vit dans `ProjectsPage`, partagé avec `/en/nos-projets` : une seule
 * mise en page pour les deux langues, donc pas de version française qui dérive
 * de sa traduction (c'est arrivé sur /suivi et /a-propos, qui recopiaient leur
 * texte en dur).
 */
const dict = getDictionary('fr')

export const metadata: Metadata = {
  title: t(dict, 'PROJECTS.TITLE'),
  description: t(dict, 'PROJECTS.DESCRIPTION', {
    delai: t(dict, 'PRODUCT.DELAY_VALUE'),
    objectif: String(PRECOMMANDE_GOAL),
  }),
  alternates: {
    canonical: '/nos-projets',
    languages: hreflangAlternates('/nos-projets').languages,
  },
}

export default function NosProjetsPage() {
  return (
    <main>
      <ProjectsPage locale="fr" />
    </main>
  )
}
