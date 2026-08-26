import { Fragment, type ReactNode } from 'react'

/**
 * L'injection des `{placeholders}` quand une valeur n'est PAS du texte plat.
 *
 * `fill()` (src/lib/i18n/fill.ts) rend une chaîne : parfait pour un montant ou
 * un compte, impossible pour un NOM PROPRE. Or les noms du catalogue — les
 * coloris « Truite arc-en-ciel », « Perche », « Orange feu », le collector
 * « Pirate » — restent en français dans les deux langues : ce sont eux qui
 * figurent sur le reçu Stripe et dans l'email de confirmation. Un visiteur qui
 * laisse son navigateur traduire la page verrait sinon « Rainbow trout » à
 * l'écran et « Truite arc-en-ciel » sur son reçu.
 *
 * On coupe donc le gabarit AUTOUR de ses placeholders et on rend chaque valeur
 * comme un nœud : le nom propre arrive dans un `<span translate="no">`, et la
 * phrase qui l'entoure reste, elle, traduisible.
 *
 * Échec bruyant, comme `fill()` : un placeholder sans valeur JETTE — jamais un
 * texte à trou affiché au visiteur. Une valeur fournie sans placeholder
 * correspondant est en revanche ignorée : c'est ce qui permet de passer le même
 * jeu de paramètres aux deux paliers de l'offre, dont les gabarits diffèrent.
 */

/** Groupe CAPTURANT : `split` conserve alors les placeholders dans le résultat. */
const PLACEHOLDER = /(\{[a-zA-Z]+\})/

export function fillNodes(template: string, params: Record<string, ReactNode>): ReactNode {
  // Un seul groupe capturant ⇒ le découpage alterne toujours texte / placeholder :
  // les index PAIRS sont le texte, les IMPAIRS les `{noms}` à remplacer.
  return template.split(PLACEHOLDER).map((part, index) => {
    if (index % 2 === 0) return part
    const name = part.slice(1, -1)
    const value = params[name]
    if (value === undefined) {
      throw new Error(`i18n : placeholder {${name}} non fourni pour « ${template} ».`)
    }
    return <Fragment key={index}>{value}</Fragment>
  })
}
