import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site-config'
import { LEGAL_COMPLETE } from '@/lib/legal-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Toute page « pas prête » ou hors index s'ajoute ici ET se retire du sitemap.
      // /merci : page de retour paiement Stripe, sans valeur d'index (+ noindex metadata).
      // Pages légales : bloquées tant que legal-config.ts contient des « À COMPLÉTER ».
      // /hero-video et /hero-scroll (routes de travail) ne sont PAS listées ici,
      // et c'est voulu (audit sécurité 2026-08-08) : un disallow est une CARTE
      // publique des chemins, et il empêcherait les robots de VOIR le
      // `noindex` que ces pages portent — c'est lui qui les tient hors index.
      // À supprimer du site avec leurs routes une fois la variante tranchée.
      disallow: [
        '/api/',
        '/merci',
        ...(LEGAL_COMPLETE
          ? []
          : ['/mentions-legales', '/cgv', '/retractation', '/confidentialite']),
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
