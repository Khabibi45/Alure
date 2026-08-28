import type { Metadata } from 'next'
import { PrecommandeSection } from '@/components/sections/PrecommandeSection'
import { getDictionary, t, hreflangAlternates } from '@/lib/i18n'

/**
 * « Nos projets » — la campagne des 100 précommandes, sur sa propre page
 * (décision Camil, 2026-08-28). Elle vivait en section sur l'accueil : un
 * récit de cette longueur y écrasait le produit, et il n'avait pas d'adresse
 * à partager.
 *
 * La page ne rend QUE la campagne. Quand celle-ci est inactive — pas de date
 * d'expédition configurée, compteur Stripe illisible, ou objectif atteint —
 * `PrecommandeSection` ne rend rien, et cette page se retrouve vide. C'est
 * assumé : mieux vaut une page sans contenu qu'une campagne qui promet sans
 * date. L'entrée de menu, elle, reste visible ; le jour où la campagne
 * s'arrête, c'est la page qu'on retire, pas un texte qu'on bricole.
 */
const dict = getDictionary('fr')

export const metadata: Metadata = {
  title: t(dict, 'NAV.PROJECTS'),
  description: t(dict, 'PRECOMMANDE.INTRO', {
    objectif: '100',
    prixSolo: '21,99 €',
  }).slice(0, 155),
  alternates: {
    canonical: '/nos-projets',
    languages: hreflangAlternates('/nos-projets').languages,
  },
}

export default function NosProjetsPage() {
  return (
    <main>
      <PrecommandeSection locale="fr" />
    </main>
  )
}
