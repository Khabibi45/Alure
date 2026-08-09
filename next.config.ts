import type { NextConfig } from 'next'

// Domaines tiers autorisés par la CSP. Vides PAR CHOIX : aucun service tiers
// aujourd'hui — Stripe est en redirection pleine page, Resend vit côté serveur
// (cf. docs/adr/001-paiements-stripe.md). Tout tiers ajouté (analytics, embed
// vidéo…) s'ajoute ici DANS LE MÊME COMMIT que son code, sinon il casse
// silencieusement en prod. Exemple :
//   const CONNECT_EXTRA = ['https://plausible.io']
const CONNECT_EXTRA: string[] = []
const SCRIPT_EXTRA: string[] = []
const FRAME_EXTRA: string[] = []

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Build autonome pour Docker : l'image finale lance `node server.js`,
  // sans réinstaller TypeScript pour lire ce fichier. Désactivé sur Vercel
  // (qui définit VERCEL=1) : la plateforme fait son propre packaging et le
  // mode standalone y casse le build (ENOENT next-server.js.nft.json).
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    // Aucune image distante, par choix : tous les visuels sont servis par
    // notre domaine. Un hôte ne s'ajouterait ici qu'avec le service qui l'exige.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-inline' requis par les scripts d'hydratation inline de
              // Next.js en rendu statique ; le retirer imposerait un nonce et
              // donc le rendu dynamique de tout le site. 'unsafe-eval' est
              // absent en PRODUCTION (non requis) ; en dev seulement, React
              // l'exige pour ses outils de debug — sans lui, une erreur
              // console parasite apparaît sur chaque page.
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}${SCRIPT_EXTRA.length ? ' ' + SCRIPT_EXTRA.join(' ') : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob:",
              // `blob:` est requis par le hero 3D : GLTFLoader extrait les
              // textures embarquées du .glb en URL blob: puis les récupère par
              // fetch. Sans ça, les modèles s'affichent en blanc, sans texture,
              // et l'erreur ne sort que dans la console. Ce n'est pas une
              // ouverture vers un tiers : un blob: est créé par notre propre
              // page, depuis un fichier déjà servi par notre domaine.
              `connect-src 'self' blob:${CONNECT_EXTRA.length ? ' ' + CONNECT_EXTRA.join(' ') : ''}`,
              `frame-src 'self'${FRAME_EXTRA.length ? ' ' + FRAME_EXTRA.join(' ') : ''}`,
              "frame-ancestors 'none'",
              // Aucun <object>/<embed> sur ce site : on le grave, plutôt que de
              // laisser default-src 'self' autoriser un embed same-origin.
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async redirects() {
    // Toute URL renommée/supprimée reçoit ici son 301 (règle n°9).
    return []
  },
}

export default nextConfig
