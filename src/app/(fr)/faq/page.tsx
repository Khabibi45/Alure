import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { Marker } from '@/components/ui/Marker'
import { FaqList } from '@/components/sections/FaqList'
import { faqItems, faqJsonLd } from '@/lib/faq'
import { hreflangAlternates } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description:
    'Délais de livraison, retours, rétractation, paiement : les réponses aux questions sur votre commande Alure.',
  alternates: { canonical: '/faq', languages: hreflangAlternates('/faq').languages },
}

/**
 * FAQ (spec boutique.md T4 + charte V.02 §8.11). Le contenu vient de la source
 * unique multilingue (`src/lib/faq.ts` ← docs/i18n/fr.md) — la page et le
 * JSON-LD en dérivent ensemble.
 */
export default function FaqPage() {
  const items = faqItems('fr')
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <JsonLd data={faqJsonLd(items)} />
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance md:text-[2.5rem]">
        Questions <Marker>fréquentes</Marker>
      </h1>

      <FaqList items={items} />

      <p className="mt-10 text-sm text-muted-foreground">
        Une autre question sur votre commande ? Répondez à votre email de confirmation, nous vous
        lisons.
      </p>
      <p className="mt-6">
        <Link href="/leurre" className="text-sm font-bold underline underline-offset-[3px]">
          Voir le leurre
        </Link>
      </p>
    </main>
  )
}
