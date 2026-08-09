interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Injection Schema.org propre. Seul usage légitime de dangerouslySetInnerHTML
 * du kit : contenu maîtrisé (nos schémas), avec échappement de `<` pour
 * neutraliser toute fermeture de balise dans une valeur.
 */
export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
