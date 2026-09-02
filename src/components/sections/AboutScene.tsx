import Image from 'next/image'

/**
 * Ce que contient l'enveloppe, en fin de page « À propos » : l'enveloppe
 * matelassée, les quatre leurres, la carte — posés côte à côte et reliés par des
 * « + » (consigne Camil, 2026-09-02). L'addition dit d'un coup d'œil ce qu'on
 * reçoit, là où une phrase demanderait à être lue.
 *
 * Écrite une fois et rendue par les DEUX pages « À propos » (racine française et
 * `/en`) : le bloc y était dupliqué, et une page qui montre le colis pendant que
 * l'autre montre autre chose serait arrivée tôt ou tard.
 *
 * ── TROIS CHOSES QUI NE SONT PAS DES DÉTAILS ──
 *
 * 1. **Les trois images gardent leur cadrage d'origine.** Deux sont en 3:2, la
 *    troisième en portrait ; les aligner sur une HAUTEUR commune (`md:h-40`)
 *    plutôt que sur un format commun évite de recadrer — la main tenant les
 *    quatre leurres ne survivrait pas à un rognage en 3:2.
 * 2. **En dessous de `md`, l'addition se lit de haut en bas.** Trois images en
 *    ligne sur 375 px feraient 90 px chacune : on ne verrait plus ni les leurres
 *    ni le texte de la carte. La colonne garde des images lisibles, et les « + »
 *    restent entre elles.
 * 3. **Les « + » sont `aria-hidden`.** Ce sont des signes de mise en page ; ce
 *    que contient l'enveloppe est déjà porté par les trois `alt` et par la
 *    légende, qui, eux, se lisent au lecteur d'écran.
 */
export function AboutScene({
  envelopeAlt,
  luresAlt,
  cardAlt,
  caption,
}: {
  envelopeAlt: string
  luresAlt: string
  cardAlt: string
  caption: string
}) {
  const items = [
    { src: '/produit/enveloppe.webp', alt: envelopeAlt, width: 800, height: 533 },
    { src: '/produit/leurres-main.webp', alt: luresAlt, width: 700, height: 803 },
    { src: '/produit/carte.webp', alt: cardAlt, width: 800, height: 533 },
  ]

  return (
    <figure className="mt-8 mb-0">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
        {items.map((item, index) => (
          <div key={item.src} className="contents">
            {index > 0 && (
              <span
                aria-hidden
                className="text-[2rem] leading-none font-bold text-muted-foreground md:text-[2.5rem]"
              >
                +
              </span>
            )}
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 768px) 20rem, 20rem"
              className="h-auto w-full max-w-[20rem] rounded-card md:h-40 md:w-auto md:max-w-none"
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-5 text-center text-[0.9375rem] text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}
