'use client'

import Image from 'next/image'
import { useColorwaySelection } from './colorway-context'
import type { LeurreStrings } from './leurre-strings'

/**
 * « Ce qu'il y a dans le leurre » — les cinq partis pris de fabrication, tels
 * que le vendeur les décrit (consigne Camil du 2026-09-01 : gros yeux,
 * paillettes, barrette d'aluminium, queue articulée striée, palette en patte de
 * canard), chacun avec SON gros plan.
 *
 * Ces cinq faits sont des CARACTÉRISTIQUES VÉRIFIÉES sur l'échantillon reçu,
 * pas des arguments : c'est ce qui lève la réserve inscrite jusqu'ici en tête de
 * la page produit (« pas de section Caractéristiques tant que les specs ne sont
 * pas vérifiées sur l'échantillon », règle n°6). Aucun chiffre, aucun avis,
 * aucune promesse de résultat de pêche — et la photo montre chaque fois ce que
 * le texte affirme.
 *
 * ── POURQUOI UN ÎLOT CLIENT ──
 *
 * Les gros plans SUIVENT le coloris choisi dans l'îlot d'achat : changer de
 * coloris change les cinq photos. C'est la même sélection que la visionneuse 3D
 * (`useColorwaySelection`), donc la même source — deux états séparés finiraient
 * par montrer un œil bleu sous un leurre rouge.
 *
 * Ses textes ET ses photos arrivent tout préparés du serveur, indexés par
 * coloris (`strings.details`) : un composant `'use client'` ne peut pas lire un
 * dictionnaire sans l'embarquer entier dans le bundle (règle Alure n°6).
 */
export function LureDetails({ strings }: { strings: LeurreStrings }) {
  const { coloris } = useColorwaySelection()

  return (
    <section aria-labelledby="lure-details-title" className="mt-10 md:mt-14">
      <h2
        id="lure-details-title"
        className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] text-balance uppercase md:text-[2.25rem]"
      >
        {strings.detailsTitle}
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {strings.detailsIntro}
      </p>

      {/* Cinq cartes COMPACTES (consigne Camil 2026-09-02 : « réduites à fond »).
        Le gros plan tombe à une vignette de 96 px posée à gauche du texte, et
        les cinq tiennent sur deux rangs au lieu de cinq pleines largeurs : la
        section se lit d'un coup d'œil au lieu de se dérouler. Le fichier servi
        reste le 640×480 — `sizes` annonce la taille réelle, et c'est le
        navigateur qui prend la variante, jamais plus lourde que nécessaire. */}
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {strings.details.map((detail) => {
          // Le coloris vient d'un état client, donc d'une valeur qui pourrait ne
          // plus exister au catalogue. Pas de photo → pas de bloc muet : on
          // retombe sur le premier leurre photographié plutôt que d'afficher un
          // cadre vide (une image `next/image` sans source ne lève rien).
          const photo = detail.photos[coloris] ?? Object.values(detail.photos)[0]
          return (
            <li
              key={detail.id}
              className="rounded-card bg-surface shadow-card flex items-start gap-3 p-3"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={640}
                height={480}
                sizes="96px"
                className="rounded-row h-auto w-24 shrink-0"
              />
              <div className="min-w-0 space-y-0.5">
                <p className="text-[0.875rem] leading-tight font-bold">{detail.title}</p>
                <p className="text-[0.8125rem] leading-snug text-muted-foreground">{detail.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
