# English — adapted from the French

> **The French version is the authoritative one.** This file derives from
> [`./fr.md`](./fr.md) and follows exactly the same keys, in the same order. Any change of
> wording is made there first, then carried over here. Standard:
> [`./README.md`](./README.md).
>
> Values inside `{ }` are injected by the code (amounts, lead times, quantities) — they are never
> translated, only placed. Amounts are **always** formatted by `formatEuros()` and always shown in
> euros: never a figure written by hand, never a converted currency.

## 0. SHIPPING_NOTICE

> To be shown for as long as delivery is France-only (see README §0). It matters more here than in
> French: someone reading the site in English has no reason to assume the shop ships to a single
> country. This line belongs above the buy button, not in the FAQ.

- `SHIPPING_NOTICE.TITLE` — Delivery to mainland France only
- `SHIPPING_NOTICE.BODY` — We ship to mainland France only.

## 1. META

- `META.BRAND` — Alure
- `META.TAGLINE` — The two-section jointed swimbait, made for predatory fish
- `META.DESCRIPTION` — Alure, the two-section jointed swimbait with an ultra-realistic swimming action, for black bass and perch.
- `META.LANG` — en
- `META.LOCALE` — en_GB
- `META.LANG_NAME` — English

## 2. NAV

- `NAV.HOME` — Home
- `NAV.PRODUCT` — The lure
- `NAV.ABOUT` — About
- `NAV.TRACKING` — Tracking
- `NAV.TRACKING_LONG` — Order tracking
- `NAV.FAQ` — FAQ
- `NAV.CONTACT` — Contact
- `NAV.LEGAL` — Legal notice
- `NAV.TERMS` — Terms of sale
- `NAV.WITHDRAWAL` — Right of withdrawal
- `NAV.PRIVACY` — Privacy
- `NAV.FOOTER_LEGAL_LINE` — Alure — French micro-entreprise. TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).

## 3. HOME

- `HOME.H1` — The two-section jointed swimbait, made for predatory fish
- `HOME.SUBTITLE` — Black bass, perch. {longueur} · {poids}. {prixSolo} for one lure — buy 3, get a 4th free, delivery included ({delai}).
- `HOME.CTA` — See the lure

### 3D carousel

- `HOME.CAROUSEL_LABEL` — The colourways of the Alure lure in 3D
- `HOME.CAROUSEL_ROLE` — carousel
- `HOME.PREV` — Previous lure
- `HOME.NEXT` — Next lure
- `HOME.SHOW_LURE` — Show the {nom} lure
- `HOME.LOADING` — Loading the lure…
- `HOME.NO_WEBGL` — Your browser does not display 3D. Photos of the lure are on the product page.
- `HOME.MODEL_FAILED` — The 3D model could not load. Photos of the lure are on the product page.

### View selector

- `HOME.VIEWS_LABEL` — Viewing angle of the lure
- `HOME.VIEW_RIGHT` — Right
- `HOME.VIEW_LEFT` — Left
- `HOME.VIEW_TOP` — Top
- `HOME.VIEW_BOTTOM` — Underside
- `HOME.VIEW_FRONT` — Front
- `HOME.VIEW_BACK` — Rear
- `HOME.VIEW_RIGHT_DESC` — right flank
- `HOME.VIEW_LEFT_DESC` — left flank
- `HOME.VIEW_TOP_DESC` — seen from above, the back
- `HOME.VIEW_BOTTOM_DESC` — seen from below, the belly and the hooks
- `HOME.VIEW_FRONT_DESC` — head-on, nose towards you
- `HOME.VIEW_BACK_DESC` — from behind, tail fin towards you
- `HOME.MODEL_ALT` — The Alure lure in 3D, {nom} model. It swims on the spot. View: {vue}.

## 4. PRODUCT — /leurre page

- `PRODUCT.TITLE` — Two-section jointed swimbait — {prixSolo}, delivery included
- `PRODUCT.DESCRIPTION` — The Alure lure: two sections, jointed, made for predatory fish. {prixSolo} per lure, sold individually — buy 3 and pick a 4th free (up to the collector colourway): 4 lures for {prixCollection}. Delivery included ({delai}), card or PayPal, 14-day right of withdrawal.
- `PRODUCT.SPECS` — {longueur} · {poids}
- `PRODUCT.COLORWAY_LABEL` — Colourway:
- `PRODUCT.SOLD_OUT` — Out of stock
- `PRODUCT.DELIVERY_BANNER` — Delivery {delai}
- `PRODUCT.DELAY_VALUE` — 10 to 20 working days
- `PRODUCT.BUY` — Buy
- `PRODUCT.BUY_LOADING` — Redirecting to payment…
- `PRODUCT.BUY_LOADING_SHORT` — Redirecting…
- `PRODUCT.PAYMENT_HINT` — Payment by card or PayPal, through Stripe.
- `OFFER.SOLO_TITLE` — One lure
- `OFFER.SOLO_DETAIL` — The {coloris} colourway, on its own.
- `OFFER.COLLECTION_TITLE` — Buy 3, get a 4th free
- `OFFER.COLLECTION_DETAIL` — All {nbColoris} colourways + a 4th of your choice — up to the {collector}.
- `OFFER.PER_LURE_EXACT` — That works out at {montant} a lure.
- `OFFER.PER_LURE_AT_MOST` — That works out at under {montant} a lure.
- `OFFER.LEGEND` — Your offer
- `OFFER.RULE` — Buy 3 lures, pick a 4th free
- `PROGRESS.STEP_FIRST` — Your first lure
- `PROGRESS.STEP_OTHERS` — Your 2nd and 3rd lures
- `PROGRESS.STEP_OTHERS_DONE` — +{montant} each — and the 4th is free
- `PROGRESS.STEP_COLLECTOR` — The 4th — free, your choice (up to the {collector})
- `PROGRESS.COLLECTOR_DONE` — pick it with your order
- `PROGRESS.COLLECTOR_TODO` — free once 3 lures are bought
- `PAYMENT.CARD` — Card
- `PAYMENT.PAYPAL` — PayPal
- `PAYMENT.SAFETY` — Payment is taken on Stripe — your card details never pass through this site.
- `PRODUCT.COLLECTOR_LOCKED` — The {collector} can be picked as your free 4th lure once you buy 3.
- `PRODUCT.COLLECTOR_EARNED` — The {collector} comes free with your order.
- `PRODUCT.VIEWER_NO_WEBGL` — Your browser does not display 3D. The description alongside covers the lure in detail.
- `PRODUCT.COLLECTOR_ALT` — The Alure collector lure in 3D, {nom} model, available as the free 4th lure once 3 are bought. It swims on the spot.
- `PRODUCT.REASSURANCE_RETURN` — 14-day right of withdrawal
- `PRODUCT.REASSURANCE_PAYMENT` — Payment by Stripe or PayPal
- `PRODUCT.REASSURANCE_TRACKING` — Order tracking by email

## 5. PRICING

- `PRICING.RULE` — Buy 3 lures, pick a 4th free
- `PRICING.TAX_LINE` — delivery included · TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `PRICING.SAVINGS` — You save {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — How long does delivery take?
- `FAQ.A_DELIVERY_TIME` — Allow {delai} from your order. We ship from our supplier, which explains both this lead time and the price of the lure. The lead time is stated before you buy and repeated in your confirmation email.
- `FAQ.Q_SHIPPING_COST` — How much does delivery cost?
- `FAQ.A_SHIPPING_COST` — Nothing: delivery within France is included in the price shown, whichever offer you choose.
- `FAQ.Q_BULK` — Does the price come down if I take several?
- `FAQ.A_BULK` — Yes. Each lure is sold individually at {prixSolo}. Buy 3 ({prixCollection}) and the 4th is free — your choice: a duplicate colourway or the {collector}. The total is shown before payment, delivery included.
- `FAQ.Q_SIZE` — What size and weight is the lure?
- `FAQ.A_SIZE` — {longueur} for {poids}. It is a compact format: it casts on light tackle and fishes just as well on a straight retrieve as on a worked one.
- `FAQ.Q_TRACK` — How do I follow my order?
- `FAQ.A_TRACK` — As soon as it ships, you receive an international tracking number by email. The Tracking page explains each stage, from confirmation to delivery.
- `FAQ.Q_RETURN` — Can I change my mind after it arrives?
- `FAQ.A_RETURN` — Yes. You have 14 days from delivery to withdraw, without giving a reason. Send the unused lure back in its packaging and we refund you in full once we receive it. Return postage is at your expense.
- `FAQ.Q_LOST` — What happens if my parcel does not arrive?
- `FAQ.A_LOST` — If your order has not been delivered within 30 working days, reply to your confirmation email to reach us: we send another lure or refund you, whichever you prefer.
- `FAQ.Q_PAYMENT` — Which payment methods do you accept?
- `FAQ.A_PAYMENT` — Card and PayPal. Payment goes through Stripe, which encrypts it end to end: your card number never passes through our site.
- `FAQ.Q_WHO` — Who is Alure?
- `FAQ.A_WHO` — A French micro-entreprise run by predator anglers. We sell one lure, the one we chose, rather than a whole catalogue.

## 7. TRACKING — /suivi page

- `TRACKING.TITLE` — Order tracking
- `TRACKING.INTRO` — As soon as your order ships, you receive an international tracking number by email. Here is what each stage means.

## 8. THANKS — /merci page

- `THANKS.TITLE` — Thank you for your order
- `THANKS.BODY` — If your payment went through, you will receive a confirmation email within the next few minutes. That email is the record.
- `THANKS.CTA` — Back to the home page

## 9. CONTACT

- `CONTACT.TITLE` — Write to us
- `CONTACT.ORDER_NUMBER` — Order number (optional)
- `CONTACT.EMAIL` — Your email
- `CONTACT.MESSAGE` — Your message
- `CONTACT.SUBMIT` — Send my request
- `CONTACT.SENDING` — Sending…
- `CONTACT.SUCCESS` — Your message has been sent. We reply to the address you provided.
- `CONTACT.ERROR` — Your message was not sent. Please try again in a moment.

## 10. LEGAL

- `LEGAL.NOTICE_TITLE` — Legal notice
- `LEGAL.TERMS_TITLE` — Terms and conditions of sale
- `LEGAL.WITHDRAWAL_TITLE` — Right of withdrawal
- `LEGAL.PRIVACY_TITLE` — Privacy policy
- `LEGAL.TRANSLATION_DISCLAIMER` — The legal notice and the terms of sale are binding in their French version only. This English rendering is provided for information, has no contractual value, and cannot be relied upon in a dispute.

## 11. EMAILS

### Customer confirmation

- `EMAIL.CONFIRM_SUBJECT` — Your Alure order is confirmed
- `EMAIL.CONFIRM_GREETING` — Hello,
- `EMAIL.CONFIRM_LEAD` — Your order is confirmed — thank you for your custom.
- `EMAIL.CONFIRM_RECAP` — Summary:
- `EMAIL.CONFIRM_COLORWAY` — Colourway: {coloris}
- `EMAIL.CONFIRM_OFFER` — Offer: {offre}
- `EMAIL.CONFIRM_TOTAL` — Total paid: {montant} (delivery included — TVA non applicable, art. 293 B du CGI, the French small-business VAT exemption)
- `EMAIL.CONFIRM_DELIVERY` — Delivery: {delai}, as stated before you bought.
- `EMAIL.CONFIRM_TRACKING` — As soon as your order ships, you will receive the tracking number by email.
- `EMAIL.CONFIRM_WITHDRAWAL` — You have a 14-day right of withdrawal from delivery.

### Internal notification (never translated — it is read by Camil)

- `EMAIL.INTERNAL_SUBJECT` — Commande à traiter — {resume}

## 12. STATES

- `STATES.LOADING` — Loading…
- `STATES.FORM_INVALID` — Choose a colourway and an offer.
- `STATES.PAYMENT_FAILED` — Payment could not start. Try again in a moment.
- `STATES.PAYMENT_UNAVAILABLE` — Payment is unavailable for the moment. Try again later.
- `STATES.PAYMENT_BAD_RESPONSE` — Invalid payment response. Try again in a moment.
- `STATES.PAYMENT_OFFLINE` — Payment could not start (connection lost). Try again.
- `STATES.RATE_LIMITED` — Too many attempts. Try again in a minute.
- `STATES.NOT_FOUND_TITLE` — Page not found
- `STATES.NOT_FOUND_BODY` — This page does not exist, or no longer exists.
- `STATES.NOT_FOUND_CTA` — Back to the home page

## 13. LANG_SWITCHER

- `LANG.LABEL` — Change language — currently English
- `LANG.FR` — Français
- `LANG.EN` — English
- `LANG.ES` — Español
- `LANG.DE` — Deutsch
- `LANG.NL` — Nederlands
