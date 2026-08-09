import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Site à contenu français : les apostrophes droites dans le texte JSX sont
      // sûres et lisibles. Les échapper en &apos; nuirait à la maintenabilité.
      'react/no-unescaped-entities': 'off',
      // Convention : un paramètre/variable volontairement inutilisé se préfixe `_`.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  // `assets/` = sources de travail (charte, moodboard, photos de référence, pages fournisseur
  // sauvegardées), jamais du code du site. Sans ça, les dumps JS/CSS du fournisseur noient le
  // gate sous des dizaines de milliers de faux positifs.
  // `files/` = dépôt de référence du kit de nage (composants React Three Fiber non
  // installés, arborescence `src/three/` qui n'est pas la nôtre). Le moteur utile en a été
  // porté dans `src/lib/three/` ; le dossier reste comme source, pas comme code du site.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'assets/**', 'files/**']),
])

export default eslintConfig
