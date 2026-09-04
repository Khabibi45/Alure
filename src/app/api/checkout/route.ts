import { NextRequest, NextResponse } from 'next/server'
import { checkoutSchema, CHECKOUT_MAX_BYTES } from '@/lib/shop/checkout-schema'
import { orderableError } from '@/lib/shop/product'
import { createCheckoutSession } from '@/lib/shop/stripe'
import { PaymentNotConfiguredError } from '@/lib/shop/errors'

// Rate-limiting en mémoire, même compromis que /api/contact (borne par instance
// serverless — suffisant contre l'abus naïf, Stripe a ses propres protections).
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const recent = (hits.get(ip) || []).filter((t) => t > windowStart)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT_MAX
}

/**
 * Crée une session Stripe Checkout depuis l'îlot d'achat de /leurre.
 * Réponse : { url } vers la page de paiement Stripe (le client navigue dessus),
 * ou un JSON d'erreur typé — jamais de session sur des données non validées.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength > CHECKOUT_MAX_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse.' }, { status: 413 })
    }
    const raw = await request.text()
    if (raw.length > CHECKOUT_MAX_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse.' }, { status: 413 })
    }

    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
    }

    const parsed = checkoutSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Commande invalide.', issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Au-delà de la forme : le pack doit exister ET être livrable. Le pack de
    // leurres contient une unité de CHAQUE coloris — un seul en rupture et il
    // n'est plus expédiable, on ne livre pas trois quarts d'un pack.
    const unorderable = orderableError(parsed.data.pack)
    if (unorderable) {
      return NextResponse.json({ error: unorderable }, { status: 400 })
    }

    const url = await createCheckoutSession(parsed.data, request.nextUrl.origin)
    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) {
      console.error('POST /api/checkout : paiement non configuré (STRIPE_SECRET_KEY absente).')
      return NextResponse.json(
        { error: 'Le paiement est momentanément indisponible. Réessayez plus tard.' },
        { status: 503 }
      )
    }
    // On logge SANS le payload (aucune donnée client dans les logs).
    console.error('POST /api/checkout : échec de création de session Stripe.', error)
    return NextResponse.json(
      { error: 'Le paiement est momentanément indisponible. Réessayez dans un instant.' },
      { status: 500 }
    )
  }
}
