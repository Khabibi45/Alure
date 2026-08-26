import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { ContactForm } from '@/components/sections/contact/ContactForm'
import { contactStrings } from '@/lib/i18n/contact-strings'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Une question sur le leurre, votre commande ou un retour ? Écrivez-nous, nous répondons à l’adresse indiquée.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
        Nous <Marker>écrire</Marker>
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Question sur le leurre, une commande, un retour : envoyez votre message, nous vous répondons
        par email.
      </p>
      <div className="mt-8">
        <ContactForm strings={contactStrings('fr')} />
      </div>
    </main>
  )
}
