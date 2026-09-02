import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PRODUCT, formatSpecs } from '@/lib/shop/product'
import { getDictionary, t as translate } from '@/lib/i18n'

/**
 * Cette page recopiait ses textes en dur, en double du dictionnaire que
 * `/en/a-propos` utilisait déjà. Les deux ont divergé au passage du
 * dropshipping au stock français : la version française gardait « des délais
 * annoncés avant l'achat » comme seul argument, là où l'argument est devenu
 * « nos leurres sont en France et nous les expédions nous-mêmes ». Une seule
 * source, désormais.
 */
const dict = getDictionary('fr')

export const metadata: Metadata = {
  title: translate(dict, 'NAV.ABOUT'),
  description: translate(dict, 'ABOUT.DESCRIPTION'),
}

/**
 * La page « qui on est ». Chaque affirmation est vérifiable (règle n°6) : pas
 * de storytelling inventé, pas d'équipe fantôme — la transparence EST l'argument
 * (VISION.md : « la transparence est une condition d'achat, pas un bonus »).
 * Les visuels sont nos rendus 3D, comme partout (règle Alure n°3).
 */
export default function AProposPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-10 pb-4 md:pt-14">
      <h1 className="font-display text-3xl leading-tight font-bold text-balance md:text-4xl">
        {translate(dict, 'ABOUT.H1')}
      </h1>

      <div className="relative mt-8 aspect-[1200/568] overflow-hidden rounded-card">
        <Image
          src="/produit/marque-lac.webp"
          alt={translate(dict, 'ABOUT.HERO_ALT')}
          fill
          priority
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>{translate(dict, 'ABOUT.INTRO', { specs: formatSpecs() })}</p>
        <p>
          {translate(dict, 'ABOUT.RANGE', {
            nbColoris: String(PRODUCT.colorways.length),
            coloris: PRODUCT.colorways.map((c) => c.label).join(', '),
          })}{' '}
          {translate(dict, 'ABOUT.COLLECTOR_RULE', { collector: PRODUCT.collector.label })}
        </p>
      </div>

      <h2 className="font-display mt-12 text-xl font-bold md:text-2xl">
        {translate(dict, 'ABOUT.VISUALS_TITLE')}
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>{translate(dict, 'ABOUT.VISUALS_BODY')}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PRODUCT.colorways.map((c) => (
          <figure key={c.id} className="m-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Image
                src={c.image}
                alt={translate(dict, 'ABOUT.COLORWAY_ALT', { coloris: c.label })}
                fill
                sizes="(min-width: 768px) 15rem, 33vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-center text-[0.8125rem] text-muted-foreground">
              {c.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <h2 className="font-display mt-12 text-xl font-bold md:text-2xl">
        {translate(dict, 'ABOUT.TRANSPARENCY_TITLE')}
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>
          {translate(dict, 'ABOUT.TRANSPARENCY_BODY', {
            delai: translate(dict, 'PRODUCT.DELAY_VALUE'),
          })}
        </p>
      </div>

      {/* Le format suit l'image : le 3:2 garde à la fois la tête du poisson et la
        palette du leurre, là où le panoramique précédent coupait les deux. */}
      <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-card">
        <Image
          src="/produit/prise-vert.webp"
          alt={translate(dict, 'ABOUT.SCENE_ALT')}
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 mb-8">
        <Link href="/leurre" className="px-btn px-btn--primary px-btn--lg">
          {translate(dict, 'HOME.CTA')}
        </Link>
      </div>
    </main>
  )
}
