import type { Metadata } from 'next'
import Link from 'next/link'
import { Marker } from '@/components/ui/Marker'
import { PRODUCT } from '@/lib/shop/product'

export const metadata: Metadata = {
  title: 'Merci pour votre commande',
  // Page de retour Stripe : jamais indexée (exclue du sitemap + robots).
  robots: { index: false, follow: false },
}

/**
 * Page de retour après paiement Stripe (spec T2). Sans vérification de session
 * côté page : le contenu reste générique et honnête — la CONFIRMATION fait foi
 * par email (envoyé par le webhook), pas par cette page.
 */
export default function MerciPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-bold text-balance md:text-4xl">
        <Marker>Merci</Marker> pour votre commande
      </h1>
      <p className="mt-6 leading-relaxed">
        Si votre paiement a été validé, vous recevrez un email de confirmation dans les prochaines
        minutes, avec le récapitulatif de votre commande.
      </p>
      <p className="mt-4 leading-relaxed">
        Votre leurre sera livré sous <strong>{PRODUCT.deliveryDelay}</strong> — le délai annoncé
        avant votre achat. Dès l'expédition, le numéro de suivi vous est envoyé par email.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Pas d'email sous 30 minutes ? Vérifiez vos courriers indésirables, puis écrivez-nous : on
        vous répond vite.
      </p>
      <p className="mt-10">
        <Link href="/" className="text-sm font-semibold underline underline-offset-4">
          Revenir à l'accueil
        </Link>
      </p>
    </main>
  )
}
