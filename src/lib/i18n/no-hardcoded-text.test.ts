// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/**
 * LE FILET QUI REND LA PARITÉ FR/EN AUTOMATIQUE.
 *
 * Règle Alure n°6 : aucune chaîne visible en dur dans un composant servi sous
 * `/en`. Les deux autres filets (`i18n.test.ts`, `gen.test.ts`) garantissent que
 * les dictionnaires sont complets et à jour — mais ils ne voient RIEN si un
 * développeur écrit son texte directement dans le JSX. C'est exactement ce qui
 * s'était produit : `/en` servait un hero, un formulaire de contact et une page
 * produit entièrement français, alors que les dictionnaires étaient parfaits.
 *
 * ── POURQUOI ON INTERDIT LE LITTÉRAL, ET PAS « LE FRANÇAIS » ──
 *
 * Détecter la langue d'une chaîne demanderait une heuristique, donc des faux
 * positifs sur « Truite arc-en-ciel » (français PAR DÉCISION, cf. règle n°6) et
 * des faux négatifs sur tout le reste. On interdit donc TOUT littéral visible,
 * quelle que soit sa langue : une chaîne anglaise en dur serait tout aussi
 * fausse sur la version française. La liste blanche ci-dessous devient alors la
 * documentation de ce qui est volontairement neutre.
 *
 * Ce test ne rend rien : il lit les fichiers. `docs/standards` interdit les
 * tests de composant, et on n'en a pas besoin ici.
 */

const RACINE = process.cwd()

/**
 * Les dossiers dont le contenu est servi en anglais. Tout composant qui y vit —
 * ou qu'ils importent — doit recevoir ses textes en props.
 */
const SURVEILLES = [join('src', 'app', '[lang]'), join('src', 'components', 'sections')]

/**
 * Ce qui a le droit de rester en dur, et pourquoi. Toute entrée ajoutée ici est
 * une DÉCISION : elle affirme que la chaîne est neutre (elle se lit pareil dans
 * les deux langues) ou qu'elle n'est pas du texte visible.
 */
const AUTORISES = new Set([
  'ALURE.', // le wordmark de la marque — jamais traduit
  ' · ', // séparateur typographique
  ', ', // jointure de listes
  ' ', // espace
  ': ',
  '. ',
  ' — ',
  'fr-FR',
  'en-GB',
  // Une requête média CSS : ce n'est pas du texte, et elle ne se traduit pas.
  '(prefers-reduced-motion: reduce)',
])

/** Les fichiers qui n'affichent rien : pas de texte visible à y chercher. */
const IGNORES = /\.(test|spec)\.tsx?$|-strings\.ts$|\.d\.ts$/

/**
 * LA DETTE CONNUE, ET LE CLIQUET.
 *
 * Ces fichiers portent encore du texte en dur au 2026-08-26. Ils sont listés
 * NOMMÉMENT, pas exclus par un motif : c'est ce qui fait le cliquet. La règle
 * s'applique immédiatement à tout le reste du site et à tout fichier nouveau —
 * on ne peut plus AJOUTER de dette, on ne peut qu'en retirer.
 *
 * Retirer une ligne de cette liste est la définition de « ce fichier est fait ».
 * En ajouter une demande une justification écrite dans la revue : par défaut,
 * la réponse est non.
 *
 * Certaines entrées sont des faux positifs à confirmer (fichiers de logique
 * dont les seules chaînes sont des messages d'erreur techniques) : les traiter
 * consiste alors à affiner `codeVisible()`, pas à traduire quoi que ce soit.
 */
const DETTE = new Set(
  [
    'src/app/[lang]/a-propos/page.tsx',
    'src/app/[lang]/layout.tsx',
    'src/components/sections/LangSwitcher.tsx',
    'src/components/sections/SiteFooter.tsx',
    'src/components/sections/SiteHeader.tsx',
    'src/components/sections/contact/ContactForm.tsx',
    'src/components/sections/home/HeroBackdrop.tsx',
    'src/components/sections/home/HeroScroll.tsx',
    'src/components/sections/home/HeroVideo.tsx',
    'src/components/sections/home/LureCarousel.tsx',
    'src/components/sections/home/LureSpecs.tsx',
    'src/components/sections/home/lure-stage.ts',
    'src/components/sections/home/use-portrait.ts',
    'src/components/sections/leurre/BuyBox.tsx',
    'src/components/sections/leurre/checkout-context.tsx',
    'src/components/sections/leurre/colorway-context.tsx',
    'src/components/sections/leurre/fill-nodes.tsx',
  ].map((p) => p.split('/').join(sep))
)

function fichiersDe(dossier: string): string[] {
  const absolu = join(RACINE, dossier)
  const out: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const chemin = join(dir, entry.name)
      if (entry.isDirectory()) walk(chemin)
      else if (/\.tsx?$/.test(entry.name) && !IGNORES.test(entry.name)) out.push(chemin)
    }
  }
  walk(absolu)
  return out
}

/**
 * Retire ce qui n'est pas du texte visible : commentaires, imports, valeurs de
 * `className`/`class` et de `sizes` (elles contiennent des espaces par nature),
 * et les chaînes passées à `t(dict, '…')` — ce sont des CLÉS, pas du texte.
 */
function codeVisible(source: string): string {
  return (
    source
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/.*$/gm, '$1 ')
      .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\s*$/gm, ' ')
      .replace(/className=\{?["'`][\s\S]*?["'`]\}?/g, ' ')
      .replace(/class=["'][^"']*["']/g, ' ')
      // `sizes` de next/image : une liste de conditions média et de largeurs
      // (« (min-width: 768px) 40vw, 100vw »). C'est du CSS, jamais du texte, et
      // ça ne se traduit pas — même raison que `(prefers-reduced-motion: reduce)`
      // dans la liste blanche.
      .replace(/sizes=\{?["'`][^"'`]*["'`]\}?/g, ' ')
      // Les logs serveur ne s'affichent jamais au visiteur : ils restent en
      // français, c'est la langue de l'équipe qui les lit.
      .replace(/console\.(?:error|warn|info|log)\([\s\S]*?\)/g, ' ')
      .replace(/\b(?:t|raw|fill)\(\s*[a-zA-Z]+\s*,\s*['"`][^'"`]*['"`]/g, ' ')
      .replace(/\b(?:t|raw)\(\s*dict\s*,\s*`[^`]*`/g, ' ')
  )
}

/** Un littéral « visible » : au moins un espace ET au moins deux lettres. */
const LITTERAL = /['"`]([^'"`\n]{4,})['"`]/g

function litterauxSuspects(source: string): string[] {
  const trouves: string[] = []
  let m: RegExpExecArray | null
  const visible = codeVisible(source)
  while ((m = LITTERAL.exec(visible)) !== null) {
    const valeur = m[1]
    if (AUTORISES.has(valeur)) continue
    // Il faut un espace ET des lettres : exclut les classes, les chemins, les
    // identifiants techniques et les valeurs CSS.
    if (!/\s/.test(valeur)) continue
    if (!/[A-Za-zÀ-ÿ]{2,}/.test(valeur)) continue
    // Valeurs techniques qui contiennent un espace sans être du texte.
    if (/^[\d.\s%a-z-]+$/.test(valeur) && !/[A-ZÀ-Ý]/.test(valeur)) continue
    if (valeur.includes('var(--')) continue
    // Un gabarit dont il ne reste, une fois les interpolations retirées, aucune
    // lettre : c'est une valeur calculée (`${…}%` pour une largeur CSS), pas une
    // phrase. Un gabarit qui garde du texte autour, lui, reste suspect.
    if (valeur.includes('${') && !/[A-Za-zÀ-ÿ]{2,}/.test(valeur.replace(/\$\{[^}]*\}/g, ''))) {
      continue
    }
    // Une liste de classes utilitaires : que des jetons minuscules, chiffres,
    // tirets, deux-points, crochets — et jamais de ponctuation de phrase.
    const jetons = valeur.trim().split(/\s+/)
    if (jetons.length >= 2 && jetons.every((j) => /^[a-z0-9:[\]_.,%/&#!-]+$/.test(j))) continue
    trouves.push(valeur)
  }
  return [...new Set(trouves)]
}

describe('parité FR/EN — aucun texte en dur dans ce qui est servi en anglais', () => {
  const fichiers = SURVEILLES.flatMap(fichiersDe)

  it('surveille bien un ensemble de fichiers non vide', () => {
    expect(fichiers.length).toBeGreaterThan(10)
  })

  it('la dette listée existe encore — sinon la ligne se retire', () => {
    for (const chemin of DETTE) {
      expect(
        fichiers.some((f) => relative(RACINE, f) === chemin),
        `${chemin} est inscrit dans DETTE mais n’existe plus — retire la ligne`
      ).toBe(true)
    }
  })

  it.each(
    fichiers.map((f) => [relative(RACINE, f), f] as const).filter(([nom]) => !DETTE.has(nom))
  )('%s ne contient aucune chaîne visible en dur', (nom, chemin) => {
    const suspects = litterauxSuspects(readFileSync(chemin, 'utf8'))
    expect(
      suspects,
      `${nom} — texte visible écrit en dur. Il s’affichera en français sur /en (CLAUDE.md, règle Alure n°6). ` +
        `Les chaînes se déclarent dans docs/i18n/fr.md ET en.md, se préparent côté serveur ` +
        `(src/lib/i18n/chrome.ts ou un module *-strings.ts) et arrivent en props. ` +
        `Si la chaîne est réellement neutre, ajoute-la à AUTORISES dans ce fichier, avec sa raison.`
    ).toEqual([])
  })
})
