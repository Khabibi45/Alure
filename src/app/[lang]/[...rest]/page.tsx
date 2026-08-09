import { notFound } from 'next/navigation'

/**
 * Attrape-tout des langues : `/en/nimporte-quoi` → 404 de `[lang]`.
 * (Le pendant français est `src/app/(fr)/[...rest]/page.tsx`.)
 */
export default function LangCatchAll(): never {
  notFound()
}
