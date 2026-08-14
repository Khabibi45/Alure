# Français — la référence

> **C'est la source.** Les autres langues en dérivent et suivent exactement ces clés, dans cet
> ordre. Toute modification de texte se fait ici d'abord. Standard :
> [`./README.md`](./README.md).
>
> Les valeurs entre `{ }` sont injectées par le code (montants, délais, quantités) — elles ne se
> traduisent pas, elles se placent. Le montant est **toujours** formaté par `formatEuros()` :
> jamais un chiffre écrit à la main.

## 0. SHIPPING_NOTICE

> À afficher tant que la livraison est France seule (cf. README §0). En français, c'est déjà
> l'état de fait — la mention est donc implicite sur le site actuel.

- `SHIPPING_NOTICE.TITLE` — Livraison France uniquement
- `SHIPPING_NOTICE.BODY` — Nous expédions uniquement en France métropolitaine.

## 1. META

- `META.BRAND` — Alure
- `META.TAGLINE` — Le leurre articulé deux sections, pensé pour les carnassiers
- `META.DESCRIPTION` — Alure, le leurre articulé deux sections à la nage ultra-réaliste pour la pêche du black-bass et de la perche.
- `META.LANG` — fr
- `META.LOCALE` — fr_FR
- `META.LANG_NAME` — Français

## 2. NAV

- `NAV.HOME` — Accueil
- `NAV.PRODUCT` — Le leurre
- `NAV.ABOUT` — À propos
- `NAV.TRACKING` — Suivi
- `NAV.TRACKING_LONG` — Suivi de commande
- `NAV.FAQ` — FAQ
- `NAV.CONTACT` — Contact
- `NAV.LEGAL` — Mentions légales
- `NAV.TERMS` — CGV
- `NAV.WITHDRAWAL` — Rétractation
- `NAV.PRIVACY` — Confidentialité
- `NAV.FOOTER_LEGAL_LINE` — Alure — micro-entreprise. TVA non applicable, art. 293 B du CGI.

## 3. HOME

- `HOME.H1` — Le leurre articulé deux sections, pensé pour les carnassiers
- `HOME.SUBTITLE` — Black-bass, perche. {longueur} · {poids}. {prixSolo} le leurre — 3 achetés, le 4e offert, livraison incluse ({delai}).
- `HOME.CTA` — Voir le leurre

### Carrousel 3D

- `HOME.CAROUSEL_LABEL` — Les coloris du leurre Alure en 3D
- `HOME.CAROUSEL_ROLE` — carrousel
- `HOME.PREV` — Leurre précédent
- `HOME.NEXT` — Leurre suivant
- `HOME.SHOW_LURE` — Afficher le leurre {nom}
- `HOME.LOADING` — Chargement du leurre…
- `HOME.NO_WEBGL` — Votre navigateur n'affiche pas la 3D. Les photos du leurre sont sur la page produit.
- `HOME.MODEL_FAILED` — Le modèle 3D n'a pas pu se charger. Les photos du leurre sont sur la page produit.

### Sélecteur de vues

- `HOME.VIEWS_LABEL` — Angle de vue du leurre
- `HOME.VIEW_RIGHT` — Droite
- `HOME.VIEW_LEFT` — Gauche
- `HOME.VIEW_TOP` — Dessus
- `HOME.VIEW_BOTTOM` — Dessous
- `HOME.VIEW_FRONT` — Devant
- `HOME.VIEW_BACK` — Derrière
- `HOME.VIEW_RIGHT_DESC` — flanc droit
- `HOME.VIEW_LEFT_DESC` — flanc gauche
- `HOME.VIEW_TOP_DESC` — vu de dessus, le dos
- `HOME.VIEW_BOTTOM_DESC` — vu de dessous, le ventre et les hameçons
- `HOME.VIEW_FRONT_DESC` — de face, tête vers vous
- `HOME.VIEW_BACK_DESC` — de dos, caudale vers vous
- `HOME.MODEL_ALT` — Le leurre Alure en vue 3D, modèle {nom}. Il nage sur place. Vue : {vue}.

## 4. PRODUCT — page /leurre

- `PRODUCT.TITLE` — Leurre articulé 2 sections — {prixSolo} port inclus
- `PRODUCT.DESCRIPTION` — Le leurre Alure : articulé deux sections, pensé pour les carnassiers. {prixSolo} le leurre à l'unité — et 3 achetés, le 4e offert au choix (jusqu'au coloris collector) : 4 leurres pour {prixCollection}. Livraison incluse ({delai}), paiement carte ou PayPal, rétractation 14 jours.
- `PRODUCT.SPECS` — {longueur} · {poids}
- `PRODUCT.COLORWAY_LABEL` — Coloris :
- `PRODUCT.SOLD_OUT` — Épuisé
- `PRODUCT.DELIVERY_BANNER` — Livraison {delai}
- `PRODUCT.DELAY_VALUE` — 10 à 20 jours ouvrés
- `PRODUCT.BUY` — Acheter
- `PRODUCT.BUY_LOADING` — Redirection vers le paiement…
- `PRODUCT.BUY_LOADING_SHORT` — Redirection…
- `PRODUCT.PAYMENT_HINT` — Paiement par carte ou PayPal, via Stripe.
- `OFFER.SOLO_TITLE` — Un leurre
- `OFFER.SOLO_DETAIL` — Le coloris {coloris}, à l'unité.
- `OFFER.COLLECTION_TITLE` — 3 achetés, le 4e offert
- `OFFER.COLLECTION_DETAIL` — Les {nbColoris} coloris + le 4e offert au choix — jusqu'au {collector}.
- `OFFER.PER_LURE_EXACT` — Soit {montant} le leurre.
- `OFFER.PER_LURE_AT_MOST` — Soit moins de {montant} le leurre.
- `OFFER.LEGEND` — Votre offre
- `OFFER.RULE` — 3 leurres achetés, le 4e offert au choix
- `PROGRESS.STEP_FIRST` — Votre premier leurre
- `PROGRESS.STEP_OTHERS` — Les 2e et 3e leurres
- `PROGRESS.STEP_OTHERS_DONE` — +{montant} chacun — et le 4e est offert
- `PROGRESS.STEP_COLLECTOR` — Le 4e — offert, au choix (jusqu'au {collector})
- `PROGRESS.COLLECTOR_DONE` — à choisir dans votre commande
- `PROGRESS.COLLECTOR_TODO` — offert dès 3 leurres achetés
- `PAYMENT.CARD` — Carte bancaire
- `PAYMENT.PAYPAL` — PayPal
- `PAYMENT.SAFETY` — Paiement sur Stripe — vos coordonnées bancaires ne passent jamais par ce site.
- `PRODUCT.COLLECTOR_LOCKED` — Le {collector} se choisit comme 4e leurre offert, dès 3 achetés.
- `PRODUCT.COLLECTOR_EARNED` — Le {collector} est offert avec votre commande.
- `PRODUCT.VIEWER_NO_WEBGL` — Votre navigateur n'affiche pas la 3D. La description ci-contre détaille le leurre.
- `PRODUCT.COLLECTOR_ALT` — Le leurre collector Alure en vue 3D, modèle {nom}, à choisir comme 4e leurre offert dès 3 achetés. Il nage sur place.
- `PRODUCT.REASSURANCE_RETURN` — Rétractation 14 jours
- `PRODUCT.REASSURANCE_PAYMENT` — Paiement par Stripe ou PayPal
- `PRODUCT.REASSURANCE_TRACKING` — Suivi de commande par email

## 5. PRICING

- `PRICING.RULE` — 3 leurres achetés, le 4e offert au choix
- `PRICING.TAX_LINE` — port inclus · TVA non applicable, art. 293 B du CGI.
- `PRICING.SAVINGS` — Vous économisez {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — Quels sont les délais de livraison ?
- `FAQ.A_DELIVERY_TIME` — Comptez {delai} après votre commande. Nous expédions depuis notre fournisseur, ce qui explique ce délai et le prix du leurre. Le délai est annoncé avant l'achat et rappelé dans votre email de confirmation.
- `FAQ.Q_SHIPPING_COST` — Combien coûte la livraison ?
- `FAQ.A_SHIPPING_COST` — Rien : la livraison en France est incluse dans le prix affiché, quelle que soit l’offre choisie.
- `FAQ.Q_BULK` — Le prix baisse-t-il si j'en prends plusieurs ?
- `FAQ.A_BULK` — Oui. Chaque leurre se commande à l'unité, à {prixSolo}. Dès 3 leurres achetés ({prixCollection}), le 4e est offert — au choix : un coloris en double ou le {collector}. Le total s'affiche avant le paiement, livraison comprise.
- `FAQ.Q_SIZE` — Quelle taille et quel poids fait le leurre ?
- `FAQ.A_SIZE` — {longueur} pour {poids}. C'est un format compact : il passe au lancer léger et se pêche aussi bien en linéaire qu'en animation.
- `FAQ.Q_TRACK` — Comment suivre ma commande ?
- `FAQ.A_TRACK` — Dès l'expédition, vous recevez par email un numéro de suivi international. La page Suivi de commande détaille chaque étape, de la confirmation à la livraison.
- `FAQ.Q_RETURN` — Puis-je changer d'avis après réception ?
- `FAQ.A_RETURN` — Oui. Vous disposez de 14 jours après réception pour vous rétracter, sans justification. Renvoyez le leurre non utilisé dans son emballage, et nous vous remboursons intégralement à réception. Les frais de renvoi restent à votre charge.
- `FAQ.Q_LOST` — Que se passe-t-il si mon colis n'arrive pas ?
- `FAQ.A_LOST` — Si votre commande n'est pas livrée sous 30 jours ouvrés, contactez-nous en répondant à votre email de confirmation : nous renvoyons un leurre ou nous vous remboursons, à votre choix.
- `FAQ.Q_PAYMENT` — Quels moyens de paiement acceptez-vous ?
- `FAQ.A_PAYMENT` — Carte bancaire et PayPal. Le paiement passe par Stripe, qui le chiffre de bout en bout : votre numéro de carte ne transite jamais par notre site.
- `FAQ.Q_WHO` — Qui est Alure ?
- `FAQ.A_WHO` — Une micro-entreprise française tenue par des pêcheurs de carnassiers. Nous vendons un seul leurre, que nous avons choisi, plutôt qu'un catalogue entier.

## 7. TRACKING — page /suivi

- `TRACKING.TITLE` — Suivi de commande
- `TRACKING.INTRO` — Dès l'expédition, vous recevez un numéro de suivi international par email. Voici ce que chaque étape veut dire.

## 8. THANKS — page /merci

- `THANKS.TITLE` — Merci pour votre commande
- `THANKS.BODY` — Si votre paiement a été validé, vous recevez un email de confirmation dans les prochaines minutes. C'est lui qui fait foi.
- `THANKS.CTA` — Retour à l'accueil

## 9. CONTACT

- `CONTACT.TITLE` — Nous écrire
- `CONTACT.ORDER_NUMBER` — Numéro de commande (facultatif)
- `CONTACT.EMAIL` — Votre email
- `CONTACT.MESSAGE` — Votre message
- `CONTACT.SUBMIT` — Envoyer ma demande
- `CONTACT.SENDING` — Envoi en cours…
- `CONTACT.SUCCESS` — Votre message est parti. Nous répondons à l’adresse indiquée.
- `CONTACT.ERROR` — Votre message n’est pas parti. Réessayez dans un instant.

## 10. LEGAL

- `LEGAL.NOTICE_TITLE` — Mentions légales
- `LEGAL.TERMS_TITLE` — Conditions générales de vente
- `LEGAL.WITHDRAWAL_TITLE` — Droit de rétractation
- `LEGAL.PRIVACY_TITLE` — Politique de confidentialité
- `LEGAL.TRANSLATION_DISCLAIMER` — *(sans objet en français — la version française est la version contractuelle)*

## 11. EMAILS

### Confirmation client

- `EMAIL.CONFIRM_SUBJECT` — Votre commande Alure est confirmée
- `EMAIL.CONFIRM_GREETING` — Bonjour,
- `EMAIL.CONFIRM_LEAD` — Votre commande est confirmée — merci de votre confiance.
- `EMAIL.CONFIRM_RECAP` — Récapitulatif :
- `EMAIL.CONFIRM_COLORWAY` — Coloris : {coloris}
- `EMAIL.CONFIRM_OFFER` — Offre : {offre}
- `EMAIL.CONFIRM_TOTAL` — Total payé : {montant} (port inclus — TVA non applicable, art. 293 B du CGI)
- `EMAIL.CONFIRM_DELIVERY` — Livraison : {delai}, comme annoncé avant votre achat.
- `EMAIL.CONFIRM_TRACKING` — Dès l'expédition, vous recevrez le numéro de suivi par email.
- `EMAIL.CONFIRM_WITHDRAWAL` — Vous disposez d'un droit de rétractation de 14 jours après réception.

### Notification interne (jamais traduite — elle est lue par Camil)

- `EMAIL.INTERNAL_SUBJECT` — Commande à traiter — {resume}

## 12. STATES

- `STATES.LOADING` — Chargement…
- `STATES.FORM_INVALID` — Choisissez un coloris et une offre.
- `STATES.PAYMENT_FAILED` — Le paiement n'a pas pu démarrer. Réessayez dans un instant.
- `STATES.PAYMENT_UNAVAILABLE` — Le paiement est momentanément indisponible. Réessayez plus tard.
- `STATES.PAYMENT_BAD_RESPONSE` — Réponse de paiement invalide. Réessayez dans un instant.
- `STATES.PAYMENT_OFFLINE` — Le paiement n'a pas pu démarrer (connexion interrompue). Réessayez.
- `STATES.RATE_LIMITED` — Trop de tentatives. Réessayez dans une minute.
- `STATES.NOT_FOUND_TITLE` — Page introuvable
- `STATES.NOT_FOUND_BODY` — Cette page n'existe pas ou n'existe plus.
- `STATES.NOT_FOUND_CTA` — Retour à l'accueil

## 13. LANG_SWITCHER

- `LANG.LABEL` — Changer de langue — actuellement Français
- `LANG.FR` — Français
- `LANG.EN` — English
- `LANG.ES` — Español
- `LANG.DE` — Deutsch
- `LANG.NL` — Nederlands
