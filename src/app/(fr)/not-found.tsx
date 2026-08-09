import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Page introuvable' }

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground">
        Cette page n'existe pas (ou plus). Si vous avez suivi un lien depuis notre site, signalez-le
        nous.
      </p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Retour à l'accueil
      </Link>
    </main>
  )
}
