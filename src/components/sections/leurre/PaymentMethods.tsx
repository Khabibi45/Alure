import { CreditCard, Lock } from 'lucide-react'
import type { LeurreStrings } from './leurre-strings'

/**
 * Les moyens de paiement, affichés AVANT le clic : l'acheteur doit savoir où il
 * va avant d'y aller. C'est la contrepartie de la redirection pleine page.
 *
 * Aucun logo de marque n'est dessiné ici : reproduire les logos Visa, Mastercard
 * ou PayPal impose de respecter leurs chartes d'usage, et un logo mal rendu fait
 * plus douteux que pas de logo du tout. Les noms suffisent, et ils sont lisibles
 * par un lecteur d'écran.
 *
 * La carte reste proposée : avec le Checkout en redirection (ADR-001), le numéro
 * est saisi sur checkout.stripe.com et ne transite ni par notre serveur, ni par
 * nos logs, ni par notre domaine. Il n'y a donc rien à sécuriser de notre côté.
 *
 * PayPal n'apparaîtra sur la page Stripe qu'une fois activé dans le dashboard
 * (Réglages → Moyens de paiement) : c'est un réglage, pas du code — `stripe.ts`
 * ne fixe volontairement pas `payment_method_types`.
 */
export function PaymentMethods({ strings }: { strings: LeurreStrings }) {
  return (
    <div className="mt-3">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {[
          { label: strings.paymentCard, icon: CreditCard },
          { label: strings.paymentPaypal, icon: null },
        ].map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="flex h-8 items-center gap-1.5 rounded-full bg-muted px-3 text-[0.8125rem] font-bold"
          >
            {Icon && <Icon className="size-4" strokeWidth={1.75} aria-hidden />}
            {label}
          </li>
        ))}
      </ul>
      <p className="px-hint mt-2 flex items-center justify-center gap-1.5 text-center">
        <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {strings.paymentSafety}
      </p>
    </div>
  )
}
