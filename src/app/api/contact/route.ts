import { NextRequest, NextResponse } from 'next/server'
import { contactSchema, CONTACT_MAX_BYTES, type ContactInput } from '@/lib/contact-schema'

// Rate-limiting simple en mémoire : suffisant pour un process Node persistant
// (next start / Docker, une instance). En serverless multi-instance (Vercel),
// c'est une borne par instance — acceptable pour un formulaire de contact.
const RATE_LIMIT_MAX = 5
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
  // Nettoyage opportuniste pour borner la mémoire.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT_MAX
}

class DeliveryNotConfiguredError extends Error {}

/**
 * Livraison via Resend vers la boîte support (mêmes variables d'environnement
 * que les emails de commande : RESEND_API_KEY, RESEND_FROM,
 * ORDER_NOTIFICATIONS_EMAIL). Reply-To = l'email du visiteur : on répond
 * directement depuis la boîte. Sans configuration, la route répond 503 —
 * échec bruyant, JAMAIS un faux succès qui perdrait des demandes réelles.
 */
async function deliver(data: Omit<ContactInput, 'website'>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ORDER_NOTIFICATIONS_EMAIL
  if (!apiKey || !to) throw new DeliveryNotConfiguredError()

  const { Resend } = await import('resend')
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.RESEND_FROM || 'Alure <onboarding@resend.dev>',
    to,
    replyTo: data.email,
    subject: data.orderNumber ? `Contact (commande ${data.orderNumber})` : 'Contact depuis le site',
    text: [
      `De : ${data.email}`,
      data.orderNumber ? `Commande : ${data.orderNumber}` : null,
      '',
      data.message,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  })
  if (error) throw new Error(`Envoi du message de contact échoué : ${error.message}`)
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate-limiting par IP
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans une minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // 2. Plafond de taille du payload (en-tête + taille réelle)
    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength > CONTACT_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload trop volumineux.' }, { status: 413 })
    }
    const raw = await request.text()
    if (raw.length > CONTACT_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload trop volumineux.' }, { status: 413 })
    }

    // 3. Parsing JSON sûr
    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
    }

    // 4. Validation du schéma partagé (les clés inconnues sont retirées)
    const parsed = contactSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides.', issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // 5. Honeypot : rempli = bot → succès simulé, rien n'est traité
    const { website, ...data } = parsed.data
    if (website && website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    // 6. Livraison des seules données validées
    await deliver(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof DeliveryNotConfiguredError) {
      // On logge SANS le payload (pas de donnée personnelle dans les logs).
      console.error('POST /api/contact : livraison non configurée (voir deliver()).')
      return NextResponse.json(
        { error: 'Formulaire momentanément indisponible. Écrivez-nous directement par email.' },
        { status: 503 }
      )
    }
    console.error('POST /api/contact : échec de traitement.', error)
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 })
  }
}
