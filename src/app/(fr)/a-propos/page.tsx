import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PRODUCT, formatSpecs } from '@/lib/shop/product'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Qui vend le leurre Alure : une micro-entreprise française de pêcheurs de carnassiers, un seul leurre articulé au catalogue, des visuels fidèles et des délais annoncés avant l’achat.',
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
        Un seul leurre, choisi par des pêcheurs
      </h1>

      <div className="relative mt-8 aspect-[1200/568] overflow-hidden rounded-card">
        <Image
          src="/produit/marque-lac.webp"
          alt="Éclaboussure à la surface d’un lac au lever du jour, sous le logo Alure."
          fill
          priority
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>
          Alure est une micro-entreprise française montée par des pêcheurs de carnassiers. Nous ne
          vendons pas un catalogue : nous vendons <strong>un</strong> leurre — un articulé deux
          sections de {formatSpecs()}, taillé pour le black-bass et la perche — parce que c'est
          celui que nous voulions avoir en boîte.
        </p>
        <p>
          Vous le trouvez ici en {PRODUCT.colorways.length} coloris, chacun nommé d'après sa robe —{' '}
          {PRODUCT.colorways.map((c) => c.label).join(', ')}. Le {PRODUCT.collector.label}, lui, ne
          s'achète pas : il se choisit comme 4e leurre offert, dès 3 achetés.
        </p>
      </div>

      <h2 className="font-display mt-12 text-xl font-bold md:text-2xl">
        Ce que vous voyez est ce que nous vendons
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>
          Toutes les images du site sont nos rendus 3D du leurre réel — le même modèle que vous
          manipulez dans la vitrine interactive de l'accueil. Pas de photo d'ambiance empruntée, pas
          de visuel fournisseur retouché : si un détail vous plaît à l'écran, il existe sur la
          pièce.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PRODUCT.colorways.map((c) => (
          <figure key={c.id} className="m-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Image
                src={c.image}
                alt={`Le leurre Alure, coloris ${c.label}, en rendu 3D dans son décor.`}
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
        La transparence avant l'achat, pas après
      </h2>
      <div className="mt-4 space-y-5 text-[0.9375rem] leading-relaxed text-prose-foreground">
        <p>
          Le délai de livraison — {PRODUCT.deliveryDelay} — est affiché avant que vous payiez,
          jamais découvert après. Le prix est port inclus. Vous disposez de 14 jours pour changer
          d'avis, comme la loi le prévoit. Et vous ne trouverez ici ni faux avis, ni fausse
          promotion, ni compteur d'urgence : tant que nous n'avons pas de vraies prises et de vrais
          retours clients à montrer, la page produit vend ce qui se vérifie — les cotes, la nage,
          l'articulation.
        </p>
      </div>

      <div className="relative mt-8 aspect-[1200/568] overflow-hidden rounded-card">
        <Image
          src="/produit/marque-scene.webp"
          alt="Le leurre Alure coloris Orange feu, en rendu 3D au-dessus des herbiers."
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 mb-8">
        <Link href="/leurre" className="px-btn px-btn--primary px-btn--lg">
          Voir le leurre
        </Link>
      </div>
    </main>
  )
}
