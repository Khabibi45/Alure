import Image from 'next/image'

/**
 * Ce que contient l'enveloppe, en fin de page « À propos » : l'enveloppe
 * matelassée, les quatre leurres, la carte — empilés à la verticale, reliés par
 * des « + », chacun sous sa légende (consigne Camil, 2026-09-02). L'addition dit
 * d'un coup d'œil ce qu'on reçoit ; les légendes disent ce qu'une image ne peut
 * pas dire — d'où part le colis, et ce qu'il y a d'écrit sur la carte.
 *
 * Écrite une fois et rendue par les DEUX pages « À propos » (racine française et
 * `/en`) : le bloc y était dupliqué, et une page qui montre le colis pendant que
 * l'autre montre autre chose, ça finit par arriver.
 *
 * ── DEUX CHOSES QUI NE SONT PAS DES DÉTAILS ──
 *
 * 1. **Les trois images gardent leur cadrage d'origine.** Deux sont en 3:2, la
 *    troisième en portrait. En colonne, chacune occupe toute la largeur et garde
 *    son format : rien n'est rogné, et la main qui tient les quatre leurres reste
 *    entière — elle ne survivrait pas à un cadrage commun.
 * 2. **Les « + » sont `aria-hidden`.** Ce sont des signes de mise en page ; ce
 *    que contient l'enveloppe est porté par les trois `alt` et par les légendes,
 *    qui, eux, se lisent au lecteur d'écran.
 */
export function AboutScene({
  envelopeAlt,
  envelopeCaption,
  luresAlt,
  luresCaption,
  cardAlt,
  cardCaption,
}: {
  envelopeAlt: string
  envelopeCaption: string
  luresAlt: string
  luresCaption: string
  cardAlt: string
  cardCaption: string
}) {
  const items = [
    {
      src: '/produit/enveloppe.webp',
      alt: envelopeAlt,
      caption: envelopeCaption,
      width: 1400,
      height: 933,
    },
    {
      src: '/produit/leurres-main.webp',
      alt: luresAlt,
      caption: luresCaption,
      width: 1171,
      height: 1343,
    },
    { src: '/produit/carte.webp', alt: cardAlt, caption: cardCaption, width: 1134, height: 756 },
  ]

  return (
    <div className="mt-8 flex flex-col items-center gap-6 md:gap-8">
      {items.map((item, index) => (
        <div key={item.src} className="contents">
          {index > 0 && (
            <span
              aria-hidden
              className="text-[2.5rem] leading-none font-bold text-muted-foreground md:text-[3rem]"
            >
              +
            </span>
          )}
          <figure className="m-0 w-full">
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="h-auto w-full rounded-card"
            />
            <figcaption className="mt-3 text-center text-[0.9375rem] leading-relaxed text-muted-foreground text-balance">
              {item.caption}
            </figcaption>
          </figure>
        </div>
      ))}
    </div>
  )
}
