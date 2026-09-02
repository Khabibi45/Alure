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
- `HOME.FRAMES_FAILED` — The sequence images could not load.

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
- `PRODUCT.DELAY_VALUE` — 3 to 5 working days
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

### Le panier du carrousel 3D (accueil)

- `CART.BOX_PRICE` — {prix}
- `CART.BOX_TAKEN` — in cart
- `CART.BOX_SOLD_OUT` — sold out
- `CART.BOX_GIFT` — 4th lure
- `CART.BOX_GIFT_FREE` — free
- `CART.BOX_GIFT_CHOOSE` — your pick
- `CART.BOX_GIFT_PAUSED` — paused
- `CART.BOX_A11Y` — {coloris}, {etat}, show this lure
- `CART.GIFT_A11Y` — Free 4th lure, show the {collector}
- `CART.ADD` — Add {coloris}
- `CART.REMOVE` — Remove {coloris}
- `CART.ORDER_COLLECTION` — Order all 4 lures
- `CART.ORDER_SOLO` — Order {coloris} on its own
- `CART.CLEAR` — Empty the cart
- `CART.SHEET` — Lure details
- `CART.STATE_EMPTY` — All 3 colours, plus a free 4th lure: {total}.
- `CART.STATE_ONE` — 1 colour of {max}: {liste}.
- `CART.STATE_SOME` — {compte} colours of {max}: {liste}. There is no price for 2 lures.
- `CART.STATE_FULL` — All {max} colours are in the cart. You will pick your free 4th lure.
- `CART.STATE_SOLD_OUT` — One colour is sold out. The 4-lure offer is paused. The others can still be ordered individually.
- `CART.FOOTNOTE` — {prix} per lure. Delivery {delai}, shipping included.
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

### The lure in detail (/leurre page)

- `PRODUCT.DETAILS_TITLE` — What's inside the lure
- `PRODUCT.DETAILS_INTRO` — Five build choices, and the reason for each one.
- `PRODUCT.DETAIL_EYES_TITLE` — Oversized eyes
- `PRODUCT.DETAIL_EYES_BODY` — Deliberately outsized: they show up from a distance, and they are the first thing you see of the lure.
- `PRODUCT.DETAIL_GLITTER_TITLE` — Glitter in the body
- `PRODUCT.DETAIL_GLITTER_BODY` — It catches what little light gets through and keeps the lure visible in stained water.
- `PRODUCT.DETAIL_BLADE_TITLE` — An aluminium strip
- `PRODUCT.DETAIL_BLADE_BODY` — Set inside the body: it throws off flashes with every movement, the way a spoon does.
- `PRODUCT.DETAIL_TAIL_TITLE` — A jointed, ribbed tail
- `PRODUCT.DETAIL_TAIL_BODY` — The ribs and the joint add vibration on every retrieve.
- `PRODUCT.DETAIL_PADDLE_TITLE` — A duck-foot paddle
- `PRODUCT.DETAIL_PADDLE_BODY` — It gives the lure an out-of-the-ordinary action, and you spot it at a glance. That is what sold us on it.
- `PRODUCT.PHOTO_ALT` — The Alure lure in {coloris}, resting on wet slate.
- `PRODUCT.DETAIL_EYES_ALT` — Close-up of the lure's oversized eye, {coloris} colourway.
- `PRODUCT.DETAIL_GLITTER_ALT` — Close-up of the glitter inside the body, {coloris} colourway.
- `PRODUCT.DETAIL_BLADE_ALT` — Close-up of the translucent body, {coloris} colourway: the strip shows through.
- `PRODUCT.DETAIL_TAIL_ALT` — Close-up of the jointed, ribbed tail, {coloris} colourway.
- `PRODUCT.DETAIL_PADDLE_ALT` — The duck-foot paddle seen head-on, {coloris} colourway.

## 5. PRICING

- `PRICING.RULE` — Buy 3 lures, pick a 4th free
- `PRICING.TAX_LINE` — delivery included · TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `PRICING.SAVINGS` — You save {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — How long does delivery take?
- `FAQ.A_DELIVERY_TIME` — Allow {delai} from your order. We hold the lures in France and ship them ourselves, in a black padded envelope. The lead time is stated before you buy and repeated in your confirmation email.
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
- `TRACKING.INTRO` — As soon as your order ships, you receive a tracking number by email. Here is what each stage means.

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
- `LANG.NO_TRANSLATION` — Page not available in this language: you will land on the home page.
- `LANG.FR` — Français
- `LANG.EN` — English

### CONTACT — routes anglaises (2026-08-26)

- `CONTACT.INTRO` — A question about the lure, an order, a return: send your message and we reply by email.
- `CONTACT.META_DESCRIPTION` — A question about the lure, your order or a return? Write to us. We reply to the address you provide.
- `CONTACT.ERROR_OFFLINE` — Your message was not sent (connection lost). Please try again.
- `CONTACT.HONEYPOT_LABEL` — Do not fill in
- `CONTACT.EMAIL_REQUIRED` — Your email is required
- `CONTACT.EMAIL_INVALID` — Invalid email
- `CONTACT.MESSAGE_REQUIRED` — Describe your request
- `CONTACT.ORDER_NUMBER_INVALID` — Invalid order number

### TRACKING — routes anglaises (2026-08-26)

- `TRACKING.TITLE_MARK` — Tracking
- `TRACKING.TITLE_REST` — your order
- `TRACKING.META_DESCRIPTION` — Where your Alure order stands: confirmation, preparation, shipping with a tracking number, delivery within {delai}.
- `TRACKING.LEAD` — No account to create: every stage is confirmed to you by email, at the address used for payment.
- `TRACKING.STEP_CONFIRMED_TITLE` — Order confirmed
- `TRACKING.STEP_CONFIRMED_BODY` — Right after your payment, you receive a confirmation email with the summary. No email within 30 minutes? Check your spam folder.
- `TRACKING.STEP_PREPARED_TITLE` — Preparation
- `TRACKING.STEP_PREPARED_BODY` — We pack your parcel within 1 working day, in a black padded envelope. Your colourway leaves exactly as you chose it.
- `TRACKING.STEP_SHIPPED_TITLE` — Shipping
- `TRACKING.STEP_SHIPPED_BODY` — You receive a tracking number by email. It can take a few hours to become active with the carrier: that is normal.
- `TRACKING.STEP_DELIVERED_TITLE` — Delivery
- `TRACKING.STEP_DELIVERED_BODY` — Your lure arrives within {delai} in total. If it has not been delivered after 10 working days, contact us: replacement or refund, whichever you prefer.
- `TRACKING.CONTACT` — For any question about your order, reply to your confirmation email: it comes straight to us.
- `TRACKING.FAQ_LINK` — Read the frequently asked questions

### THANKS — routes anglaises (2026-08-26)

- `THANKS.TITLE_MARK` — Thank you
- `THANKS.TITLE_REST` — for your order
- `THANKS.DELIVERY` — Your lure will be delivered within {delai}.
- `THANKS.DELIVERY_NOTE` — That is the delivery time announced before your purchase. As soon as your order ships, the tracking number is sent to you by email.
- `THANKS.NO_EMAIL` — No email after 30 minutes? Check your spam folder, then write to us. We reply quickly.

### LEGAL — routes anglaises (2026-08-26)

- `LEGAL.TERMS_H1_LEAD` — Terms and conditions of
- `LEGAL.TERMS_H1_MARKED` — sale
- `LEGAL.TERMS_META_DESCRIPTION` — {marque} terms of sale: prices, payment, delivery, right of withdrawal, guarantees.
- `LEGAL.TERMS_EFFECTIVE` — In force as of 5 August 2026.
- `LEGAL.TERMS_S1_TITLE` — 1. The seller
- `LEGAL.TERMS_S1_BODY` — {vendeur}, sole trader (French micro-entreprise), SIREN {siren}, {adresse}. Contact: {email}.
- `LEGAL.TERMS_S2_TITLE` — 2. The product and the prices
- `LEGAL.TERMS_S2_BODY` — The site sells the {marque} fishing lure (a jointed two-section lure) in several colourways, each lure being sold individually. The price that applies is the one displayed when the order is placed. On the date these terms take effect, two offers coexist: a single lure at {prixSolo}, or the “buy 3, get a 4th free” offer at {prixCollection} (that is, three lures at the unit price), under which a fourth lure, chosen by the buyer from the available colourways or the collector colourway, is given free of charge and without any consideration. Delivery within France included. TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `LEGAL.TERMS_S3_TITLE` — 3. Order and payment
- `LEGAL.TERMS_S3_BODY` — Orders are paid online by bank card or PayPal, through the Stripe payment platform. The sale is concluded when the payment is confirmed, which the confirmation email records. We never have access to your card details.
- `LEGAL.TERMS_S4_TITLE` — 4. Delivery
- `LEGAL.TERMS_S4_BODY` — Delivery to mainland France within {delai}, that timeframe being stated before the purchase. A tracking number is sent by email when the parcel ships. If more than 30 working days pass without delivery, you may ask for a new shipment or a full refund.
- `LEGAL.TERMS_S5_TITLE` — 5. Right of withdrawal
- `LEGAL.TERMS_S5_BODY` — You have 14 days from delivery to withdraw without giving a reason (art. L221-18 of the French Consumer Code). The procedure and the form are set out on the Right of withdrawal page. The refund is made within 14 days of our receiving the return; return postage remains at your expense.
- `LEGAL.TERMS_S6_TITLE` — 6. Legal guarantees
- `LEGAL.TERMS_S6_BODY` — You benefit from the legal guarantee of conformity (art. L217-3 et seq. of the French Consumer Code, 2 years) and from the guarantee against hidden defects (art. 1641 et seq. of the French Civil Code). To invoke it, contact {email}.
- `LEGAL.TERMS_S7_TITLE` — 7. Consumer mediation
- `LEGAL.TERMS_S7_BODY` — If a dispute is not settled with our customer service, you may refer the matter free of charge to the consumer mediator we come under: {mediateur}. You may also use the European online dispute resolution platform.
- `LEGAL.TERMS_S8_TITLE` — 8. Availability
- `LEGAL.TERMS_S8_BODY` — Our offers apply while stocks last. Should a colourway you ordered prove unavailable, we tell you as soon as possible and you choose between an exchange for an available colourway and a full refund of the sums paid — that is our only obligation in that case.
- `LEGAL.TERMS_S9_TITLE` — 9. Use of the product
- `LEGAL.TERMS_S9_BODY` — The {marque} lure is a fishing item intended for adults: it carries very sharp hooks and must be kept out of reach of children. It is to be used in compliance with the fishing regulations in force. We cannot be held liable for abnormal or improper use of the product, without prejudice to the legal guarantees in article 6.
- `LEGAL.TERMS_S10_TITLE` — 10. Personal data
- `LEGAL.TERMS_S10_BODY` — The data collected when you order is used only to process and deliver it. The details (purposes, retention periods, rights) are set out in our privacy policy.
- `LEGAL.TERMS_S11_TITLE` — 11. Governing law
- `LEGAL.TERMS_S11_BODY` — These terms are governed by French law.
- `LEGAL.NOTICE_META_DESCRIPTION` — Legal notice for the {marque} website: publisher, hosting provider, intellectual property.
- `LEGAL.NOTICE_H1_LEAD` — Legal
- `LEGAL.NOTICE_H1_MARKED` — notice
- `LEGAL.NOTICE_S1_TITLE` — Site publisher
- `LEGAL.NOTICE_S1_BODY` — {marque} is published by {vendeur}, a sole trader registered in France as a micro-entreprise, SIREN {siren}, whose registered office is at {adresse}.
- `LEGAL.NOTICE_S1_PUBLISHER` — Publication director: {vendeur}. Contact: {email}.
- `LEGAL.NOTICE_VAT` — TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `LEGAL.NOTICE_S2_TITLE` — Hosting
- `LEGAL.NOTICE_S2_BODY` — The site is hosted by {hebergeur}.
- `LEGAL.NOTICE_S3_TITLE` — Intellectual property
- `LEGAL.NOTICE_S3_BODY` — The {marque} trademark, the logo, and the text and images on this site belong to the publisher. Any reproduction without written permission is prohibited.
- `LEGAL.NOTICE_S4_TITLE` — Reporting content
- `LEGAL.NOTICE_S4_BODY` — For any question or report concerning this site, write to {email}.
- `LEGAL.PRIVACY_META_DESCRIPTION` — What data {marque} processes, why, for how long, and your rights.
- `LEGAL.PRIVACY_H1_LEAD` — Privacy
- `LEGAL.PRIVACY_H1_MARKED` — policy
- `LEGAL.PRIVACY_UPDATED` — Last updated: 5 August 2026.
- `LEGAL.PRIVACY_S1_TITLE` — Who processes your data
- `LEGAL.PRIVACY_S1_BODY` — {vendeur}, a French micro-entreprise (sole trader), {adresse} — contact: {email}.
- `LEGAL.PRIVACY_S2_TITLE` — What we collect, and why
- `LEGAL.PRIVACY_S2_ORDER_LABEL` — Order:
- `LEGAL.PRIVACY_S2_ORDER_BODY` — email address, name and delivery address, collected by our payment provider Stripe at the time of payment. Legal basis: performance of the sales contract. Your card details never pass through our site.
- `LEGAL.PRIVACY_S2_EMAILS_LABEL` — Order emails:
- `LEGAL.PRIVACY_S2_EMAILS_BODY` — your email address is used for the confirmation and the tracking number, sent through our provider Resend. Legal basis: performance of the contract.
- `LEGAL.PRIVACY_S2_CONTACT_LABEL` — Contact form:
- `LEGAL.PRIVACY_S2_CONTACT_BODY` — email address, message and, if you provide it, order number — only so that we can reply to you. Legal basis: our legitimate interest in handling your request.
- `LEGAL.PRIVACY_S2_NO_RESALE` — No data is sold, rented or used for advertising.
- `LEGAL.PRIVACY_S3_TITLE` — Cookies
- `LEGAL.PRIVACY_S3_BODY` — This site sets no tracking or advertising cookies. That is why you see no consent banner on it.
- `LEGAL.PRIVACY_S4_TITLE` — Our processors
- `LEGAL.PRIVACY_S4_STRIPE` — Stripe (payment) — data processed under its own policy.
- `LEGAL.PRIVACY_S4_RESEND` — Resend (sending the transactional emails).
- `LEGAL.PRIVACY_S4_VERCEL` — Vercel (site hosting).
- `LEGAL.PRIVACY_S5_TITLE` — How long we keep your data
- `LEGAL.PRIVACY_S5_BODY` — Order data is kept for as long as accounting and warranty obligations require. Messages sent through the contact form are deleted once the request is closed.
- `LEGAL.PRIVACY_S6_TITLE` — Your rights
- `LEGAL.PRIVACY_S6_BODY` — Access, rectification, erasure, objection, portability: write to {email}. You can also lodge a complaint with the CNIL, the French data protection authority (cnil.fr).
- `LEGAL.WITHDRAWAL_META_DESCRIPTION` — How to exercise your 14-day right of withdrawal on an {marque} order.
- `LEGAL.WITHDRAWAL_H1_LEAD` — Right of
- `LEGAL.WITHDRAWAL_H1_MARKED` — withdrawal
- `LEGAL.WITHDRAWAL_LEAD_BEFORE` — You have
- `LEGAL.WITHDRAWAL_LEAD_DEADLINE` — 14 days from delivery
- `LEGAL.WITHDRAWAL_LEAD_AFTER` — of your order to change your mind, with no reason to give (art. L221-18 of the French Consumer Code).
- `LEGAL.WITHDRAWAL_HOW_TITLE` — How to do it
- `LEGAL.WITHDRAWAL_STEP_NOTIFY` — Tell us before the 14-day period ends: by email at {email}, by replying to your confirmation email, or using the form below.
- `LEGAL.WITHDRAWAL_STEP_RETURN` — Send the lure back unused, in its packaging, within 14 days to: {adresse}. Return postage is at your expense.
- `LEGAL.WITHDRAWAL_STEP_REFUND` — We refund you in full (the price paid, delivery included) within 14 days of receiving the return, to your original payment method.
- `LEGAL.WITHDRAWAL_FORM_TITLE` — Model withdrawal form
- `LEGAL.WITHDRAWAL_FORM_INTRO` — Copy it into an email if you want to use it (it is not mandatory):
- `LEGAL.WITHDRAWAL_FORM_BODY` — To {vendeur} ({email}): I hereby give notice that I withdraw from my contract for the sale of the item below.
- `LEGAL.WITHDRAWAL_FORM_LINE_DATES` — — Ordered on: … / received on: …
- `LEGAL.WITHDRAWAL_FORM_LINE_ORDER` — — Order number: …
- `LEGAL.WITHDRAWAL_FORM_LINE_CONSUMER` — — Consumer's name and address: …
- `LEGAL.WITHDRAWAL_FORM_LINE_DATE` — — Date: …

### PRODUCT — routes anglaises (2026-08-26)

- `PRODUCT.H1_LEAD` — The
- `PRODUCT.H1_MARK` — jointed
- `PRODUCT.H1_TAIL` — two-section swimbait
- `PRODUCT.SECTION_VISUAL` — View of the lure
- `PRODUCT.DELIVERY_BANNER_BODY` — Your lure leaves from France, in a black padded envelope. You receive a tracking number by email as soon as it ships.
- `PRODUCT.GIFT_LABEL` — Your free 4th lure:
- `PRODUCT.GIFT_DUPLICATE_A11Y` — {coloris} — a duplicate, free
- `PRODUCT.GIFT_COLLECTOR_A11Y` — {collector} — the collector, free

### PROGRESS — routes anglaises (2026-08-26)

- `PROGRESS.STEP_SECOND` — The second
- `PROGRESS.STEP_THIRD` — The third
- `PROGRESS.LOCKED_A11Y` — — still locked

### ABOUT — routes anglaises (2026-08-26)

- `ABOUT.DESCRIPTION` — Who sells the Alure lure: a French micro-entreprise run by predator anglers. One jointed lure, stocked in France and shipped by us.
- `ABOUT.H1` — One lure, stocked in France
- `ABOUT.HERO_ALT` — A splash on the surface of a lake at daybreak, beneath the Alure logo.
- `ABOUT.INTRO` — Alure is a French micro-entreprise set up by predator anglers. We do not sell a catalogue: we sell one lure, a two-section jointed swimbait, {specs}, made for black bass and perch, because it is the one we wanted in our own box. We keep the lures here in France, and we pack every order ourselves.
- `ABOUT.RANGE` — You will find it here in {nbColoris} colourways, each named after its livery — {coloris}.
- `ABOUT.COLLECTOR_RULE` — The {collector} is not for sale: you pick it as your free 4th lure once you have bought 3.
- `ABOUT.VISUALS_TITLE` — What you see is what we sell
- `ABOUT.VISUALS_BODY` — Every image on this site is our own 3D render of the real lure — the same model you turn in the interactive viewer on the home page. No borrowed mood shot, no retouched supplier photo: if a detail catches your eye on screen, it is there on the lure itself.
- `ABOUT.COLORWAY_ALT` — The Alure lure, {coloris} colourway, as a 3D render in its setting.
- `ABOUT.TRANSPARENCY_TITLE` — Where your lure ships from
- `ABOUT.TRANSPARENCY_BODY` — Your lure ships from us, in a black padded envelope we take to the post office. Allow {delai} between your order and delivery. That lead time is shown before you pay, and repeated in your confirmation email. The price includes delivery. You have 14 days to change your mind, as French law provides.
- `ABOUT.SCENE_ALT` — The Alure lure in the Orange feu colourway, as a 3D render above the weed beds.

### Îlots clients traduits (2026-08-26)

- `CONTACT.ORDER_NUMBER_LABEL` — Order number
- `CONTACT.OPTIONAL` — (optional)
- `CONTACT.SUCCESS_TITLE` — Your message has been sent.
- `CONTACT.SUCCESS_DETAIL` — We reply to the address you provided.
- `CONTACT.ERROR_RATE_LIMIT` — Too many requests. Please try again in a minute.
- `CONTACT.ERROR_UNAVAILABLE` — The form is temporarily unavailable. Please try again later.
- `PRICING.TAGLINE_SOLO` — Delivery included · TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `PRICING.TAGLINE_COLLECTION` — Buy 3 lures, pick a 4th free · delivery included · TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption).
- `PROGRESS.COLLECTOR_PICK` — pick it above — it ships in your parcel
- `PRODUCT.VIEWER_ALT` — The Alure lure in 3D, {coloris} colourway. It swims on the spot.
- `STATES.COLORWAY_UNKNOWN` — That colourway does not exist.
- `STATES.COLORWAY_SOLD_OUT` — That colourway is sold out.

### PRECOMMANDE — la campagne des 100 (2026-08-26)

- `PRECOMMANDE.TITLE` — The lure exists. The run doesn't.
- `PRECOMMANDE.INTRO` — We don't have the money to start production. That's our only problem, so we'll say it first. The model is settled, the colourways are chosen, and you can buy this lure here for {prixSolo}. Alure is a French micro-entreprise run by anglers, and nobody is funding it for us. We need {objectif} pre-orders to make a run under our own name, signed, in a box of its own.
- `PRECOMMANDE.COUNTER` — {compte} towards a target of {objectif}
- `PRECOMMANDE.COUNTER_NOTE` — This counter reads our payments. It moves when an order is paid, and at no other time.
- `PRECOMMANDE.WHY_TITLE` — Why {objectif}
- `PRECOMMANDE.WHY_BODY` — No workshop will produce under our name for a handful of pieces. Below {objectif}, the cost per lure climbs until the price on this page stops holding. Your pre-orders pay for that first run, and nothing else.
- `PRECOMMANDE.BOX_TITLE` — What we want to send you
- `PRECOMMANDE.BOX_BODY` — Every lure is hand-signed before it ships. As for the box, we want it worth the money you put in, and we want the whole run in our hands before yours goes out, to keep the wait short. Until the workshop has confirmed anything, we name no material and no contents. You will see the finished box here before it reaches you.
- `PRECOMMANDE.DATE_TITLE` — The date
- `PRECOMMANDE.DATE_BODY` — A pre-order with no shipping date binds nobody. Ours has one: your order leaves by {dateLimite} at the latest. That date does not depend on the counter, and we will not push it back while we wait for orders.
- `PRECOMMANDE.REFUND_TITLE` — If we fall short
- `PRECOMMANDE.REFUND_BODY` — If the {objectif} orders are not reached, the run does not happen and you are refunded in full. If they are reached but shipping cannot meet {dateLimite}, you are refunded in full as well. The refund goes back to the payment method you used, without you having to ask.
- `PRECOMMANDE.PRICE` — {prixSolo} for one lure. {prixCollection} for three, with a fourth free. Delivery included. Same price as the shop: pre-ordering does not change it.
- `PRECOMMANDE.CTA` — Pre-order my lure
- `PRECOMMANDE.CTA_NOTE` — You pay today. It ships by {dateLimite} at the latest. Delivery to mainland France only.
- `PRECOMMANDE.LEGAL` — Pre-order: you are paying today for a lure we undertake to ship by {dateLimite} at the latest, under article L216-1 of the French consumer code. After that date you may cancel your order and be refunded in full to your original payment method, within 14 days. If the target of {objectif} orders is not reached, the run is called off and every pre-order is refunded on the same terms. 14-day right of withdrawal from the day the parcel arrives. Delivery to mainland France only. TVA non applicable, art. 293 B du CGI (the French small-business VAT exemption). The seller is identified in the legal notice.

### BANNER — bandeau d'objectif (2026-08-26)

- `BANNER.LABEL` — Launch target
- `BANNER.ARIA` — Launch target
- `BANNER.ORDERS_ONE` — 1 order
- `BANNER.ORDERS_MANY` — {compte} orders
- `BANNER.DONE` — {commandes} placed. Thank you for being here.
- `BANNER.EMPTY` — Alure is starting out. Be the first order; the target is {objectif}.
- `BANNER.PROGRESS` — {commandes} towards a target of {objectif}. Be among the first.

### PRODUCT — visionneuse orientable (2026-08-28)

- `PRODUCT.VIEWER_LABEL` — The lure in 3D, rotatable
- `PRODUCT.VIEWER_HINT` — Drag to turn the lure. With a keyboard: the arrow keys, and Home to reset.
- `PRODUCT.VIEWER_FREE` — Free angle.

### NAV — page Nos projets (2026-08-28)

- `NAV.PROJECTS` — Our projects

### PROJECTS — la page Nos projets (2026-08-28)

- `PROJECTS.TITLE` — Where Alure stands
- `PROJECTS.DESCRIPTION` — Where Alure stands: the lure exists, it is stocked in France and delivered in {delai}. A first signed run, in its own box, is still missing.
- `PROJECTS.INTRO` — This page says where the Alure project stands, and what is left to do. The lure exists, it is in stock, it ships from us. What does not exist yet is a run made under our own name.
- `PROJECTS.DONE_TITLE` — What is already here
- `PROJECTS.DONE_BODY` — The lure is made: a two-section jointed swimbait, {specs}, for black bass and perch. It comes in {nbColoris} colourways, {coloris}, plus the {collector}, which is never sold and comes as the free fourth lure. The images on this site are our own 3D renders of that piece, and on its page you turn it with your finger.
- `PROJECTS.STOCK_TITLE` — The stock is now in France
- `PROJECTS.STOCK_BODY` — The lures are with us, and we pack every order ourselves, in a black padded envelope. Your order reaches you in {delai}. Before that, they shipped from a supplier, and the wait ran from 10 to 20 days.
- `PROJECTS.SERIES_TITLE` — The run and the box
- `PROJECTS.SERIES_BODY` — What is missing is a first run under our own name: the same lure, signed, in a box of its own. That is the only difference from the one you order here today. Our target is {objectif} orders to pay for it, and every paid order counts towards that total.
- `PROJECTS.CTA` — See the lure
- `PROJECTS.CTA_NOTE` — {prixSolo} for one lure, or {prixCollection} for three with a fourth free. Delivery included, {delai}. Mainland France only.
