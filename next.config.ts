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
  // Racine du projet, fixée explicitement. Sans elle, Turbopack la DÉDUIT en
  // remontant les dossiers parents jusqu'au premier lockfile trouvé : il en
  // existe un hors du dépôt (D:\Claude_PROJETS), donc la racine partait dans un
  // dossier où le serveur n'a pas le droit d'écrire son lockfile — `next dev`
  // démarrait puis mourait sur « IO error … lockfile » (WSL, montage /mnt/d).
  // `npm run dev|build` s'exécute toujours depuis le dossier du package.json.
  turbopack: { root: process.cwd() },
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
    // Toute URL renommée/supprimée reçoit ici sa redirection (règle n°9).
    //
    // Espagnol, allemand et néerlandais retirés le 2026-08-25 (décision Camil :
    // le site n'existe qu'en français et en anglais). Ces trois préfixes n'ont
    // JAMAIS existé sur le domaine de production — il n'est pas encore acheté —
    // mais ils répondaient 200 sur la préversion publique, sans en-tête
    // `X-Robots-Tag` : des liens ont pu circuler. On les rattrape donc plutôt
    // que de les laisser tomber en 404.
    //
    // 307 et non 308 : `permanent: false`. Un 308 est mis en cache par le
    // navigateur SANS date d'expiration — si l'une de ces langues revenait un
    // jour, les visiteurs qui ont vu le 308 ne l'atteindraient plus jamais. La
    // permanence se gagne, elle ne se suppose pas.
    //
    // Destination : la racine française, pas l'anglais. Un visiteur venu d'un
    // lien `/de/faq` n'a pas demandé l'anglais ; l'accueil français porte le
    // sélecteur de langue et le laisse choisir (doctrine i18n : on propose,
    // on n'impose pas).
    return [
      { source: '/:locale(es|de|nl)', destination: '/', permanent: false },
      { source: '/:locale(es|de|nl)/:path*', destination: '/', permanent: false },
    ]
  },
}

export default nextConfig
