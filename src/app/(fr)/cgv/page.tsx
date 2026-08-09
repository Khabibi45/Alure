import type { Metadata } from 'next'
import { Marker } from '@/components/ui/Marker'
import { LEGAL, LEGAL_COMPLETE } from '@/lib/legal-config'
import { SITE } from '@/lib/site-config'
import { OFFERS, PRODUCT, formatEuros } from '@/lib/shop/product'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: `CGV de ${SITE.name} : prix, paiement, livraison, rétractation, garanties.`,
  robots: LEGAL_COMPLETE ? undefined : { index: false, follow: false },
}

/**
 * CGV micro-entreprise, vente B2C France. Texte volontairement lisible :
 * le fond juridique prime, le jargon inutile est banni (UI-COPY s'applique
 * aussi ici pour la clarté, jamais contre le fond).
 */
export default function CgvPage() {
  return (
    <main className="prose-legal mx-auto max-w-[40rem] px-5 pt-16 pb-12 md:pt-24">
      <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] uppercase text-balance text-foreground md:text-[2.5rem]">
        Conditions générales de <Marker>vente</Marker>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">En vigueur au 5 août 2026.</p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">1. Le vendeur</h2>
      <p className="mt-3">
        {LEGAL.vendorName}, entrepreneur individuel (micro-entreprise), SIREN {LEGAL.siren},{' '}
        {LEGAL.address}. Contact : {LEGAL.contactEmail}.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">2. Le produit et les prix</h2>
      <p className="mt-3">
        Le site vend le leurre de pêche {SITE.name} (leurre articulé deux sections), en plusieurs
        coloris. Le prix en vigueur est celui affiché au moment de la commande. À la date d'entrée
        en vigueur, deux offres coexistent : un leurre seul à{' '}
        {formatEuros(PRODUCT.pricing.soloCents)}, ou la collection des {PRODUCT.colorways.length}{' '}
        coloris à {formatEuros(OFFERS.collection.amountCents)}, avec laquelle un coloris collector
        est remis gracieusement et sans contrepartie. Livraison en France incluse. TVA non
        applicable, art. 293 B du CGI.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">3. Commande et paiement</h2>
      <p className="mt-3">
        La commande se règle en ligne par carte bancaire ou PayPal, via la plateforme de paiement
        Stripe. La vente est conclue à la confirmation du paiement, matérialisée par l'email de
        confirmation. Nous n'avons jamais accès à vos données de carte.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">4. Livraison</h2>
      <p className="mt-3">
        Livraison en France métropolitaine sous {PRODUCT.deliveryDelay}, ce délai étant annoncé
        avant l'achat. Un numéro de suivi est envoyé par email à l'expédition. Au-delà de 30 jours
        ouvrés sans livraison, vous pouvez demander un nouvel envoi ou le remboursement intégral.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">5. Droit de rétractation</h2>
      <p className="mt-3">
        Vous disposez de 14 jours après réception pour vous rétracter sans justification (art.
        L221-18 du code de la consommation). Les modalités et le formulaire figurent sur la page
        Rétractation. Le remboursement intervient sous 14 jours après réception du retour ; les
        frais de renvoi restent à votre charge.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">6. Garanties légales</h2>
      <p className="mt-3">
        Vous bénéficiez de la garantie légale de conformité (art. L217-3 et suivants du code de la
        consommation, 2 ans) et de la garantie des vices cachés (art. 1641 et suivants du code
        civil). Pour la mettre en œuvre, contactez {LEGAL.contactEmail}.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">
        7. Médiation de la consommation
      </h2>
      <p className="mt-3">
        En cas de litige non résolu avec notre service client, vous pouvez saisir gratuitement le
        médiateur de la consommation dont nous relevons : {LEGAL.mediator}. Vous pouvez aussi
        utiliser la plateforme européenne de règlement en ligne des litiges.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">8. Disponibilité</h2>
      <p className="mt-3">
        Nos offres valent dans la limite des stocks. Si un coloris commandé se révélait
        indisponible, nous vous en informons au plus vite et vous choisissez entre l'échange contre
        un coloris disponible et le remboursement intégral des sommes versées — c'est notre seule
        obligation dans ce cas.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">9. Usage du produit</h2>
      <p className="mt-3">
        Le leurre {SITE.name} est un article de pêche destiné à des adultes : il porte des hameçons
        très affûtés et ne doit pas être laissé à portée des enfants. Il s'utilise dans le respect
        de la réglementation de la pêche en vigueur. Notre responsabilité ne saurait être engagée en
        cas d'utilisation anormale ou détournée du produit, sans préjudice des garanties légales de
        l'article 6.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">10. Données personnelles</h2>
      <p className="mt-3">
        Les données collectées lors de la commande servent uniquement à la traiter et à la livrer.
        Le détail (finalités, durées, droits) figure dans notre politique de confidentialité.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-foreground">11. Droit applicable</h2>
      <p className="mt-3">Les présentes conditions sont soumises au droit français.</p>
    </main>
  )
}
