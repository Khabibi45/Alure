import { notFound } from 'next/navigation'

/**
 * Attrape-tout français : toute URL qui ne correspond ni à une page connue ni
 * à une langue déclarée retombe ici → 404 français. Nécessaire depuis la
 * structure « deux layouts racines » (le `not-found.tsx` global d'App Router
 * suppose un layout racine unique).
 */
export default function CatchAll(): never {
  notFound()
}
