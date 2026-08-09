import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Droit de rétractation',
  description: `Comment exercer votre droit de rétractation de 14 jours sur une commande ${SITE.name}.`,
  robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
}

export default function RetractationPage() {
  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        Droit de <Marker>rétractation</Marker>
      </h1>

      <p className="mt-6">
        Vous disposez de <strong>14 jours après réception</strong> de votre commande pour changer
        d'avis, sans justification (art. L221-18 du code de la consommation).
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Comment faire</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-5">
        <li>
          Prévenez-nous avant la fin du délai de 14 jours : par email à {LEGAL.contactEmail}, en
          répondant à votre email de confirmation, ou avec le formulaire ci-dessous.
        </li>
        <li>
          Renvoyez le leurre non utilisé, dans son emballage, sous 14 jours à :{' '}
          {LEGAL.returnAddress}. Les frais de renvoi restent à votre charge.
        </li>
        <li>
          Nous vous remboursons intégralement (prix payé, livraison incluse) sous 14 jours après
          réception du retour, par le moyen de paiement d'origine.
        </li>
      </ol>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">
        Formulaire type de rétractation
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        À recopier dans un email si vous souhaitez l'utiliser (il n'est pas obligatoire) :
      </p>
      <blockquote className="mt-4 rounded-row bg-surface p-5 text-sm">
        À l'attention de {LEGAL.vendorName} ({LEGAL.contactEmail}) : je vous notifie par la présente
        ma rétractation du contrat portant sur la vente du bien ci-dessous.
        <br />— Commandé le : … / reçu le : …
        <br />— Numéro de commande : …
        <br />— Nom et adresse du consommateur : …
        <br />— Date : …
      </blockquote>
    </main>
  )
}
