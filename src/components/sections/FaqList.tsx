import { Plus, Minus } from 'lucide-react'
import type { FaqItem } from '@/lib/faq'

/**
 * L'accordéon FAQ (charte V.02 §8.11) — natif `<details>`, accessible sans JS.
 * Icône plus → minus en fondu croisé, jamais de rotation de chevron (interdit
 * fondation). Partagé entre la page française et les pages traduites.
 */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="mt-8">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-border">
          <summary className="rounded-row flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-1 py-4 font-bold transition-colors marker:hidden hover:bg-white/4 [&::-webkit-details-marker]:hidden">
            {item.question}
            {/* Fondu croisé plus/minus (0.14s) — pas de rotation. */}
            <span aria-hidden className="relative size-5 shrink-0 text-muted-foreground">
              <Plus
                className="absolute inset-0 size-5 opacity-100 transition-opacity duration-[var(--dur-micro)] group-open:opacity-0"
                strokeWidth={1.75}
              />
              <Minus
                className="absolute inset-0 size-5 opacity-0 transition-opacity duration-[var(--dur-micro)] group-open:opacity-100"
                strokeWidth={1.75}
              />
            </span>
          </summary>
          <p className="prose-legal px-1 pb-5 text-[0.9375rem]">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
