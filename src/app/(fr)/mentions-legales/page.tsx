import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: `Mentions légales du site ${SITE.name} : éditeur, hébergeur, propriété intellectuelle.`,
  // Indexable seulement quand les données réelles sont remplies (legal-config).
  robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
}

export default function MentionsLegalesPage() {
  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        Mentions <Marker>légales</Marker>
      </h1>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Éditeur du site</h2>
      <p className="mt-3">
        {SITE.name} est édité par {LEGAL.vendorName}, entrepreneur individuel (micro-entreprise),
        SIREN {LEGAL.siren}, dont le siège est situé {LEGAL.address}.
      </p>
      <p className="mt-3">
        Directeur de la publication : {LEGAL.vendorName}. Contact : {LEGAL.contactEmail}.
      </p>
      <p className="mt-3">TVA non applicable, art. 293 B du CGI.</p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Hébergement</h2>
      <p className="mt-3">Le site est hébergé par {LEGAL.host}.</p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Propriété intellectuelle</h2>
      <p className="mt-3">
        La marque {SITE.name}, le logo, les textes et les visuels de ce site sont la propriété de
        l'éditeur. Toute reproduction sans autorisation écrite est interdite.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">Signaler un contenu</h2>
      <p className="mt-3">
        Pour toute question ou signalement concernant le site, écrivez à {LEGAL.contactEmail}.
      </p>
    </main>
  )
}
