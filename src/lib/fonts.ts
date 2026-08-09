import localFont from 'next/font/local'

/**
 * Glacial Indifference (SIL OFL — fichiers + licence dans src/fonts/) : LA
 * police du site, seule décision typo tranchée (cf. PRODUCT.md). Self-hostée
 * par next/font, zéro fetch runtime (RGPD, règle n°10). Deux graisses
 * seulement : la hiérarchie se fait par taille, casse et interlettrage.
 *
 * Ici, dans `src/lib/`, parce que le site a DEUX layouts racines (français à
 * la racine, autres langues sous `[lang]`) qui portent le même habillage.
 */
export const glacial = localFont({
  src: [
    { path: '../fonts/GlacialIndifference-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/GlacialIndifference-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-glacial',
  display: 'swap',
})
