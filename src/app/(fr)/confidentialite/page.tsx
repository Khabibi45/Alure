import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: `Quelles données ${SITE.name} traite, pourquoi, combien de temps, et vos droits.`,
  robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
}

/**
 * Politique de confidentialité (RGPD). Écrite pour être VRAIE : elle décrit ce
 * que le site fait réellement — pas de cookies de suivi, pas de bannière,
 * paiement chez Stripe, emails chez Resend, hébergement Vercel.
 * TODO(LOT4): au branchement de Vercel Analytics (mesure d'audience sans
 * cookie), vérifier que la section « Mesure d'audience » correspond toujours.
 */
export default function ConfidentialitePage() {
  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        Politique de <Marker>confidentialité</Marker>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : 5 août 2026.</p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Qui traite vos données</h2>
      <p className="mt-3">
        {LEGAL.vendorName}, micro-entreprise, {LEGAL.address} — contact : {LEGAL.contactEmail}.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">
        Ce que nous collectons, et pourquoi
      </h2>
      <ul className="mt-3 list-disc space-y-3 pl-5">
        <li>
          <strong>Commande</strong> : email, nom et adresse de livraison, collectés par notre
          prestataire de paiement Stripe au moment du paiement. Base légale : l'exécution du contrat
          de vente. Vos données de carte ne transitent jamais par notre site.
        </li>
        <li>
          <strong>Emails de commande</strong> : votre email est utilisé pour la confirmation et le
          numéro de suivi, envoyés via notre prestataire Resend. Base légale : l'exécution du
          contrat.
        </li>
        <li>
          <strong>Formulaire de contact</strong> : email, message et, si vous le donnez, numéro de
          commande — uniquement pour vous répondre. Base légale : notre intérêt légitime à traiter
          votre demande.
        </li>
      </ul>
      <p className="mt-3">Aucune donnée n'est vendue, louée ou utilisée pour de la publicité.</p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Cookies</h2>
      <p className="mt-3">
        Ce site ne dépose aucun cookie de suivi ni de publicité. C'est pourquoi vous n'y voyez pas
        de bannière de consentement.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Nos sous-traitants</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Stripe (paiement) — données traitées selon sa propre politique.</li>
        <li>Resend (envoi des emails transactionnels).</li>
        <li>Vercel (hébergement du site).</li>
      </ul>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Durées de conservation</h2>
      <p className="mt-3">
        Les données de commande sont conservées le temps des obligations légales comptables et de
        garantie. Les messages du formulaire de contact sont supprimés une fois la demande close.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Vos droits</h2>
      <p className="mt-3">
        Accès, rectification, effacement, opposition, portabilité : écrivez à {LEGAL.contactEmail}.
        Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
    </main>
  )
}
