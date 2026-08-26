/**
 * L'injection des `{placeholders}`, isolée du reste du multilingue.
 *
 * Séparée de `index.ts` pour une raison précise : les composants CLIENT
 * reçoivent des gabarits déjà choisis par le serveur (« {compte} coloris sur
 * {max} : {liste}. ») dont les valeurs ne sont connues qu'au clic. Ils ont donc
 * besoin de cette fonction — mais surtout pas des dictionnaires, qui
 * partiraient entiers dans le bundle navigateur (règle Alure n°6).
 *
 * Échec bruyant, comme `t()` : un placeholder sans valeur JETTE. Jamais un
 * texte à trou affiché au visiteur.
 */
export function fill(template: string, params?: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (_, name: string) => {
    const value = params?.[name]
    if (value === undefined) {
      throw new Error(`i18n : placeholder {${name}} non fourni pour « ${template} ».`)
    }
    return value
  })
}
