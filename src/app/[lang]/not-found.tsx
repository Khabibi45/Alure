import Link from 'next/link'

/**
 * 404 des langues sous préfixe. Next ne transmet PAS les params aux
 * `not-found` : impossible de savoir ici quelle langue était demandée — le
 * message est donc bilingue français/anglais, sobre et honnête.
 */
export default function LangNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Page introuvable · Page not found</h1>
      <p className="text-muted-foreground">
        Cette page n'existe pas ou n'existe plus. · This page does not exist, or no longer does.
      </p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Retour à l'accueil · Back to home
      </Link>
    </main>
  )
}
