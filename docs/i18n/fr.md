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
- `HOME.FRAMES_FAILED` — Les images de la séquence n'ont pas pu se charger.

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
- `PRODUCT.DELAY_VALUE` — 3 à 5 jours ouvrés
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

### Le panier du carrousel 3D (accueil)

- `CART.BOX_PRICE` — {prix}
- `CART.BOX_TAKEN` — au panier
- `CART.BOX_SOLD_OUT` — épuisé
- `CART.BOX_GIFT` — 4e leurre
- `CART.BOX_GIFT_FREE` — offert
- `CART.BOX_GIFT_CHOOSE` — à choisir
- `CART.BOX_GIFT_PAUSED` — suspendu
- `CART.BOX_A11Y` — {coloris}, {etat}, afficher ce leurre
- `CART.GIFT_A11Y` — 4e leurre offert, afficher le {collector}
- `CART.ADD` — Ajouter {coloris}
- `CART.REMOVE` — Retirer {coloris}
- `CART.ORDER_COLLECTION` — Commander les 4 leurres
- `CART.ORDER_SOLO` — Commander {coloris} seul
- `CART.CLEAR` — Vider le panier
- `CART.SHEET` — Fiche du leurre
- `CART.STATE_EMPTY` — Les 3 coloris, et le 4e leurre offert : {total}.
- `CART.STATE_ONE` — 1 coloris sur {max} : {liste}.
- `CART.STATE_SOME` — {compte} coloris sur {max} : {liste}. Il n'existe pas de tarif pour 2 leurres.
- `CART.STATE_FULL` — Les {max} coloris sont au panier. Vous choisirez votre 4e leurre, offert.
- `CART.STATE_SOLD_OUT` — Un coloris est épuisé. L'offre des 4 leurres est suspendue. Les autres restent commandables à l'unité.
- `CART.FOOTNOTE` — {prix} le leurre. Livraison {delai}, port inclus.
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

### Le leurre en détail (page /leurre)

- `PRODUCT.DETAILS_TITLE` — Ce qu'il y a dans le leurre
- `PRODUCT.DETAILS_INTRO` — Cinq choix de fabrication, et la raison de chacun.
- `PRODUCT.DETAIL_EYES_TITLE` — De gros yeux
- `PRODUCT.DETAIL_EYES_BODY` — Volontairement surdimensionnés : ils se repèrent de loin, et c'est la première chose qu'on voit du leurre.
- `PRODUCT.DETAIL_GLITTER_TITLE` — Des paillettes dans le corps
- `PRODUCT.DETAIL_GLITTER_BODY` — Elles accrochent le peu de lumière qui passe et rendent le leurre visible dans l'eau teintée.
- `PRODUCT.DETAIL_BLADE_TITLE` — Une barrette d'aluminium
- `PRODUCT.DETAIL_BLADE_BODY` — Glissée à l'intérieur du corps : elle renvoie des éclats à chaque mouvement, comme le ferait une cuillère.
- `PRODUCT.DETAIL_TAIL_TITLE` — Une queue articulée et striée
- `PRODUCT.DETAIL_TAIL_BODY` — Les stries et l'articulation ajoutent de la vibration à chaque récupération.
- `PRODUCT.DETAIL_PADDLE_TITLE` — Une palette en patte de canard
- `PRODUCT.DETAIL_PADDLE_BODY` — Elle donne une nage qui sort de l'ordinaire, et se reconnaît au premier coup d'œil. C'est ce qui nous a décidés.
- `PRODUCT.PHOTO_ALT` — Le leurre Alure, coloris {coloris}, posé sur une ardoise mouillée.
- `PRODUCT.DETAIL_EYES_ALT` — Gros plan sur l'œil surdimensionné du leurre, coloris {coloris}.
- `PRODUCT.DETAIL_GLITTER_ALT` — Gros plan sur les paillettes du corps, coloris {coloris}.
- `PRODUCT.DETAIL_BLADE_ALT` — Gros plan sur le corps translucide, coloris {coloris} : la barrette se devine à l'intérieur.
- `PRODUCT.DETAIL_TAIL_ALT` — Gros plan sur la queue articulée et striée, coloris {coloris}.
- `PRODUCT.DETAIL_PADDLE_ALT` — La palette en patte de canard, vue de face, coloris {coloris}.

## 5. PRICING

- `PRICING.RULE` — 3 leurres achetés, le 4e offert au choix
- `PRICING.TAX_LINE` — port inclus · TVA non applicable, art. 293 B du CGI.
- `PRICING.SAVINGS` — Vous économisez {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — Quels sont les délais de livraison ?
- `FAQ.A_DELIVERY_TIME` — Comptez {delai} après votre commande. Nous stockons les leurres en France et les expédions nous-mêmes, en enveloppe matelassée noire. Le délai est annoncé avant l'achat et rappelé dans votre email de confirmation.
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
- `TRACKING.INTRO` — Dès l'expédition, vous recevez un numéro de suivi par email. Voici ce que chaque étape veut dire.

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
- `LANG.NO_TRANSLATION` — Page indisponible dans cette langue : vous arriverez sur l'accueil.
- `LANG.FR` — Français
- `LANG.EN` — English

### CONTACT — routes anglaises (2026-08-26)

- `CONTACT.INTRO` — Question sur le leurre, une commande, un retour : envoyez votre message, nous vous répondons par email.
- `CONTACT.META_DESCRIPTION` — Une question sur le leurre, votre commande ou un retour ? Écrivez-nous, nous répondons à l’adresse indiquée.
- `CONTACT.ERROR_OFFLINE` — Votre message n’est pas parti (connexion interrompue). Réessayez.
- `CONTACT.HONEYPOT_LABEL` — Ne pas remplir
- `CONTACT.EMAIL_REQUIRED` — Votre email est requis
- `CONTACT.EMAIL_INVALID` — Email invalide
- `CONTACT.MESSAGE_REQUIRED` — Décrivez votre demande
- `CONTACT.ORDER_NUMBER_INVALID` — Numéro de commande invalide

### TRACKING — routes anglaises (2026-08-26)

- `TRACKING.TITLE_MARK` — Suivi
- `TRACKING.TITLE_REST` — de commande
- `TRACKING.META_DESCRIPTION` — Où en est votre commande Alure : confirmation, préparation, expédition avec numéro de suivi, livraison sous {delai}.
- `TRACKING.LEAD` — Pas de compte à créer : chaque étape vous est confirmée par email, à l’adresse utilisée au paiement.
- `TRACKING.STEP_CONFIRMED_TITLE` — Commande confirmée
- `TRACKING.STEP_CONFIRMED_BODY` — Juste après votre paiement, vous recevez un email de confirmation avec le récapitulatif. Pas d’email sous 30 minutes ? Vérifiez vos courriers indésirables.
- `TRACKING.STEP_PREPARED_TITLE` — Préparation
- `TRACKING.STEP_PREPARED_BODY` — Nous préparons votre colis sous 1 jour ouvré, en enveloppe matelassée noire. Votre coloris part tel que vous l’avez choisi.
- `TRACKING.STEP_SHIPPED_TITLE` — Expédition
- `TRACKING.STEP_SHIPPED_BODY` — Vous recevez par email un numéro de suivi. Il peut mettre quelques heures à s’activer chez le transporteur : c’est normal.
- `TRACKING.STEP_DELIVERED_TITLE` — Livraison
- `TRACKING.STEP_DELIVERED_BODY` — Votre leurre arrive sous {delai} au total. Au-delà de 10 jours ouvrés sans livraison, contactez-nous : renvoi ou remboursement, à votre choix.
- `TRACKING.CONTACT` — Pour toute question sur votre commande, répondez à votre email de confirmation : il arrive directement chez nous.
- `TRACKING.FAQ_LINK` — Lire les questions fréquentes

### THANKS — routes anglaises (2026-08-26)

- `THANKS.TITLE_MARK` — Merci
- `THANKS.TITLE_REST` — pour votre commande
- `THANKS.DELIVERY` — Votre leurre sera livré sous {delai}.
- `THANKS.DELIVERY_NOTE` — C'est le délai annoncé avant votre achat. Dès l'expédition, le numéro de suivi vous est envoyé par email.
- `THANKS.NO_EMAIL` — Pas d'email sous 30 minutes ? Vérifiez vos courriers indésirables, puis écrivez-nous : on vous répond vite.

### LEGAL — routes anglaises (2026-08-26)

- `LEGAL.TERMS_H1_LEAD` — Conditions générales de
- `LEGAL.TERMS_H1_MARKED` — vente
- `LEGAL.TERMS_META_DESCRIPTION` — CGV de {marque} : prix, paiement, livraison, rétractation, garanties.
- `LEGAL.TERMS_EFFECTIVE` — En vigueur au 5 août 2026.
- `LEGAL.TERMS_S1_TITLE` — 1. Le vendeur
- `LEGAL.TERMS_S1_BODY` — {vendeur}, entrepreneur individuel (micro-entreprise), SIREN {siren}, {adresse}. Contact : {email}.
- `LEGAL.TERMS_S2_TITLE` — 2. Le produit et les prix
- `LEGAL.TERMS_S2_BODY` — Le site vend le leurre de pêche {marque} (leurre articulé deux sections), en plusieurs coloris, chaque leurre étant vendu à l'unité. Le prix en vigueur est celui affiché au moment de la commande. À la date d'entrée en vigueur, deux offres coexistent : un leurre seul à {prixSolo}, ou l'offre « 3 achetés, le 4e offert » à {prixCollection} (soit trois leurres au prix de l'unité), avec laquelle un quatrième leurre, au choix de l'acheteur parmi les coloris disponibles ou le coloris collector, est remis gracieusement et sans contrepartie. Livraison en France incluse. TVA non applicable, art. 293 B du CGI.
- `LEGAL.TERMS_S3_TITLE` — 3. Commande et paiement
- `LEGAL.TERMS_S3_BODY` — La commande se règle en ligne par carte bancaire ou PayPal, via la plateforme de paiement Stripe. La vente est conclue à la confirmation du paiement, matérialisée par l'email de confirmation. Nous n'avons jamais accès à vos données de carte.
- `LEGAL.TERMS_S4_TITLE` — 4. Livraison
- `LEGAL.TERMS_S4_BODY` — Livraison en France métropolitaine sous {delai}, ce délai étant annoncé avant l'achat. Un numéro de suivi est envoyé par email à l'expédition. Au-delà de 30 jours ouvrés sans livraison, vous pouvez demander un nouvel envoi ou le remboursement intégral.
- `LEGAL.TERMS_S5_TITLE` — 5. Droit de rétractation
- `LEGAL.TERMS_S5_BODY` — Vous disposez de 14 jours après réception pour vous rétracter sans justification (art. L221-18 du code de la consommation). Les modalités et le formulaire figurent sur la page Rétractation. Le remboursement intervient sous 14 jours après réception du retour ; les frais de renvoi restent à votre charge.
- `LEGAL.TERMS_S6_TITLE` — 6. Garanties légales
- `LEGAL.TERMS_S6_BODY` — Vous bénéficiez de la garantie légale de conformité (art. L217-3 et suivants du code de la consommation, 2 ans) et de la garantie des vices cachés (art. 1641 et suivants du code civil). Pour la mettre en œuvre, contactez {email}.
- `LEGAL.TERMS_S7_TITLE` — 7. Médiation de la consommation
- `LEGAL.TERMS_S7_BODY` — En cas de litige non résolu avec notre service client, vous pouvez saisir gratuitement le médiateur de la consommation dont nous relevons : {mediateur}. Vous pouvez aussi utiliser la plateforme européenne de règlement en ligne des litiges.
- `LEGAL.TERMS_S8_TITLE` — 8. Disponibilité
- `LEGAL.TERMS_S8_BODY` — Nos offres valent dans la limite des stocks. Si un coloris commandé se révélait indisponible, nous vous en informons au plus vite et vous choisissez entre l'échange contre un coloris disponible et le remboursement intégral des sommes versées — c'est notre seule obligation dans ce cas.
- `LEGAL.TERMS_S9_TITLE` — 9. Usage du produit
- `LEGAL.TERMS_S9_BODY` — Le leurre {marque} est un article de pêche destiné à des adultes : il porte des hameçons très affûtés et ne doit pas être laissé à portée des enfants. Il s'utilise dans le respect de la réglementation de la pêche en vigueur. Notre responsabilité ne saurait être engagée en cas d'utilisation anormale ou détournée du produit, sans préjudice des garanties légales de l'article 6.
- `LEGAL.TERMS_S10_TITLE` — 10. Données personnelles
- `LEGAL.TERMS_S10_BODY` — Les données collectées lors de la commande servent uniquement à la traiter et à la livrer. Le détail (finalités, durées, droits) figure dans notre politique de confidentialité.
- `LEGAL.TERMS_S11_TITLE` — 11. Droit applicable
- `LEGAL.TERMS_S11_BODY` — Les présentes conditions sont soumises au droit français.
- `LEGAL.NOTICE_META_DESCRIPTION` — Mentions légales du site {marque} : éditeur, hébergeur, propriété intellectuelle.
- `LEGAL.NOTICE_H1_LEAD` — Mentions
- `LEGAL.NOTICE_H1_MARKED` — légales
- `LEGAL.NOTICE_S1_TITLE` — Éditeur du site
- `LEGAL.NOTICE_S1_BODY` — {marque} est édité par {vendeur}, entrepreneur individuel (micro-entreprise), SIREN {siren}, dont le siège est situé {adresse}.
- `LEGAL.NOTICE_S1_PUBLISHER` — Directeur de la publication : {vendeur}. Contact : {email}.
- `LEGAL.NOTICE_VAT` — TVA non applicable, art. 293 B du CGI.
- `LEGAL.NOTICE_S2_TITLE` — Hébergement
- `LEGAL.NOTICE_S2_BODY` — Le site est hébergé par {hebergeur}.
- `LEGAL.NOTICE_S3_TITLE` — Propriété intellectuelle
- `LEGAL.NOTICE_S3_BODY` — La marque {marque}, le logo, les textes et les visuels de ce site sont la propriété de l'éditeur. Toute reproduction sans autorisation écrite est interdite.
- `LEGAL.NOTICE_S4_TITLE` — Signaler un contenu
- `LEGAL.NOTICE_S4_BODY` — Pour toute question ou signalement concernant le site, écrivez à {email}.
- `LEGAL.PRIVACY_META_DESCRIPTION` — Quelles données {marque} traite, pourquoi, combien de temps, et vos droits.
- `LEGAL.PRIVACY_H1_LEAD` — Politique de
- `LEGAL.PRIVACY_H1_MARKED` — confidentialité
- `LEGAL.PRIVACY_UPDATED` — Dernière mise à jour : 5 août 2026.
- `LEGAL.PRIVACY_S1_TITLE` — Qui traite vos données
- `LEGAL.PRIVACY_S1_BODY` — {vendeur}, micro-entreprise, {adresse} — contact : {email}.
- `LEGAL.PRIVACY_S2_TITLE` — Ce que nous collectons, et pourquoi
- `LEGAL.PRIVACY_S2_ORDER_LABEL` — Commande :
- `LEGAL.PRIVACY_S2_ORDER_BODY` — email, nom et adresse de livraison, collectés par notre prestataire de paiement Stripe au moment du paiement. Base légale : l'exécution du contrat de vente. Vos données de carte ne transitent jamais par notre site.
- `LEGAL.PRIVACY_S2_EMAILS_LABEL` — Emails de commande :
- `LEGAL.PRIVACY_S2_EMAILS_BODY` — votre email est utilisé pour la confirmation et le numéro de suivi, envoyés via notre prestataire Resend. Base légale : l'exécution du contrat.
- `LEGAL.PRIVACY_S2_CONTACT_LABEL` — Formulaire de contact :
- `LEGAL.PRIVACY_S2_CONTACT_BODY` — email, message et, si vous le donnez, numéro de commande — uniquement pour vous répondre. Base légale : notre intérêt légitime à traiter votre demande.
- `LEGAL.PRIVACY_S2_NO_RESALE` — Aucune donnée n'est vendue, louée ou utilisée pour de la publicité.
- `LEGAL.PRIVACY_S3_TITLE` — Cookies
- `LEGAL.PRIVACY_S3_BODY` — Ce site ne dépose aucun cookie de suivi ni de publicité. C'est pourquoi vous n'y voyez pas de bannière de consentement.
- `LEGAL.PRIVACY_S4_TITLE` — Nos sous-traitants
- `LEGAL.PRIVACY_S4_STRIPE` — Stripe (paiement) — données traitées selon sa propre politique.
- `LEGAL.PRIVACY_S4_RESEND` — Resend (envoi des emails transactionnels).
- `LEGAL.PRIVACY_S4_VERCEL` — Vercel (hébergement du site).
- `LEGAL.PRIVACY_S5_TITLE` — Durées de conservation
- `LEGAL.PRIVACY_S5_BODY` — Les données de commande sont conservées le temps des obligations légales comptables et de garantie. Les messages du formulaire de contact sont supprimés une fois la demande close.
- `LEGAL.PRIVACY_S6_TITLE` — Vos droits
- `LEGAL.PRIVACY_S6_BODY` — Accès, rectification, effacement, opposition, portabilité : écrivez à {email}. Vous pouvez aussi saisir la CNIL (cnil.fr).
- `LEGAL.WITHDRAWAL_META_DESCRIPTION` — Comment exercer votre droit de rétractation de 14 jours sur une commande {marque}.
- `LEGAL.WITHDRAWAL_H1_LEAD` — Droit de
- `LEGAL.WITHDRAWAL_H1_MARKED` — rétractation
- `LEGAL.WITHDRAWAL_LEAD_BEFORE` — Vous disposez de
- `LEGAL.WITHDRAWAL_LEAD_DEADLINE` — 14 jours après réception
- `LEGAL.WITHDRAWAL_LEAD_AFTER` — de votre commande pour changer d'avis, sans justification (art. L221-18 du code de la consommation).
- `LEGAL.WITHDRAWAL_HOW_TITLE` — Comment faire
- `LEGAL.WITHDRAWAL_STEP_NOTIFY` — Prévenez-nous avant la fin du délai de 14 jours : par email à {email}, en répondant à votre email de confirmation, ou avec le formulaire ci-dessous.
- `LEGAL.WITHDRAWAL_STEP_RETURN` — Renvoyez le leurre non utilisé, dans son emballage, sous 14 jours à : {adresse}. Les frais de renvoi restent à votre charge.
- `LEGAL.WITHDRAWAL_STEP_REFUND` — Nous vous remboursons intégralement (prix payé, livraison incluse) sous 14 jours après réception du retour, par le moyen de paiement d'origine.
- `LEGAL.WITHDRAWAL_FORM_TITLE` — Formulaire type de rétractation
- `LEGAL.WITHDRAWAL_FORM_INTRO` — À recopier dans un email si vous souhaitez l'utiliser (il n'est pas obligatoire) :
- `LEGAL.WITHDRAWAL_FORM_BODY` — À l'attention de {vendeur} ({email}) : je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous.
- `LEGAL.WITHDRAWAL_FORM_LINE_DATES` — — Commandé le : … / reçu le : …
- `LEGAL.WITHDRAWAL_FORM_LINE_ORDER` — — Numéro de commande : …
- `LEGAL.WITHDRAWAL_FORM_LINE_CONSUMER` — — Nom et adresse du consommateur : …
- `LEGAL.WITHDRAWAL_FORM_LINE_DATE` — — Date : …

### PRODUCT — routes anglaises (2026-08-26)

- `PRODUCT.H1_LEAD` — Le leurre
- `PRODUCT.H1_MARK` — articulé
- `PRODUCT.H1_TAIL` — deux sections
- `PRODUCT.SECTION_VISUAL` — Visuel du leurre
- `PRODUCT.DELIVERY_BANNER_BODY` — Votre leurre part de France, en enveloppe matelassée noire. Vous recevez un numéro de suivi par email dès l'envoi.
- `PRODUCT.GIFT_LABEL` — Votre 4e leurre, offert :
- `PRODUCT.GIFT_DUPLICATE_A11Y` — {coloris} — en double, offert
- `PRODUCT.GIFT_COLLECTOR_A11Y` — {collector} — le collector, offert

### PROGRESS — routes anglaises (2026-08-26)

- `PROGRESS.STEP_SECOND` — Le deuxième
- `PROGRESS.STEP_THIRD` — Le troisième
- `PROGRESS.LOCKED_A11Y` — — à débloquer

### ABOUT — routes anglaises (2026-08-26)

- `ABOUT.DESCRIPTION` — Qui vend le leurre Alure : une micro-entreprise française de pêcheurs de carnassiers. Un seul leurre articulé, stocké en France, expédié par nos soins.
- `ABOUT.H1` — Un seul leurre, stocké en France
- `ABOUT.HERO_ALT` — Éclaboussure à la surface d'un lac au lever du jour, sous le logo Alure.
- `ABOUT.INTRO` — Alure est une micro-entreprise française montée par des pêcheurs de carnassiers. Nous ne vendons pas un catalogue : nous vendons un leurre, un articulé deux sections de {specs}, taillé pour le black-bass et la perche, parce que c'est celui que nous voulions avoir en boîte. Les leurres sont stockés chez nous, en France, et nous préparons chaque commande nous-mêmes.
- `ABOUT.RANGE` — Vous le trouvez ici en {nbColoris} coloris, chacun nommé d'après sa robe — {coloris}.
- `ABOUT.COLLECTOR_RULE` — Le {collector}, lui, ne s'achète pas : il se choisit comme 4e leurre offert, dès 3 achetés.
- `ABOUT.VISUALS_TITLE` — Ce que vous voyez est ce que nous vendons
- `ABOUT.VISUALS_BODY` — Les visuels des leurres viennent de nous : la vitrine interactive de l'accueil est notre modèle 3D du leurre réel, et les gros plans de la boutique montrent la pièce, détail par détail. Nous n'affichons pas de prise de poisson tant que nous n'en avons pas de nous.
- `ABOUT.COLORWAY_ALT` — Le leurre Alure, coloris {coloris}, posé sur une ardoise mouillée.
- `ABOUT.TRANSPARENCY_TITLE` — D'où part votre leurre
- `ABOUT.TRANSPARENCY_BODY` — Votre leurre part de chez nous, dans une enveloppe matelassée noire que nous déposons à la poste. Comptez {delai} entre votre commande et sa livraison. Ce délai est affiché avant que vous payiez, et rappelé dans votre email de confirmation. Le prix est port inclus. Vous disposez de 14 jours pour changer d'avis, comme la loi le prévoit.
- `ABOUT.KIT_ENVELOPE_ALT` — Une pile d'enveloppes matelassées noires.
- `ABOUT.KIT_LURES_ALT` — Les quatre leurres Alure tenus au creux d'une main, au bord de l'eau.
- `ABOUT.KIT_CARD_ALT` — Le dos de la carte glissée dans chaque enveloppe, au nom d'Alure.
- `ABOUT.KIT_CAPTION` — Ce que vous recevez, et rien d'autre.

### Îlots clients traduits (2026-08-26)

- `CONTACT.ORDER_NUMBER_LABEL` — Numéro de commande
- `CONTACT.OPTIONAL` — (facultatif)
- `CONTACT.SUCCESS_TITLE` — Votre message est parti.
- `CONTACT.SUCCESS_DETAIL` — Nous répondons à l’adresse indiquée.
- `CONTACT.ERROR_RATE_LIMIT` — Trop de requêtes. Réessayez dans une minute.
- `CONTACT.ERROR_UNAVAILABLE` — Le formulaire est momentanément indisponible. Réessayez plus tard.
- `PRICING.TAGLINE_SOLO` — Port inclus · TVA non applicable, art. 293 B du CGI.
- `PRICING.TAGLINE_COLLECTION` — 3 leurres achetés, le 4e offert au choix · port inclus · TVA non applicable, art. 293 B du CGI.
- `PROGRESS.COLLECTOR_PICK` — choisissez-le ci-dessus, il part dans votre colis
- `PRODUCT.VIEWER_ALT` — Le leurre Alure en vue 3D, coloris {coloris}. Il nage sur place.
- `STATES.COLORWAY_UNKNOWN` — Ce coloris n’existe pas.
- `STATES.COLORWAY_SOLD_OUT` — Ce coloris est épuisé.

### PRECOMMANDE — la campagne des 100 (2026-08-26)

- `PRECOMMANDE.TITLE` — Le leurre existe. La série, non.
- `PRECOMMANDE.INTRO` — On n'a pas les fonds pour lancer la production. C'est notre seul problème, autant le dire tout de suite. Le modèle est arrêté, les coloris sont choisis, et vous pouvez acheter ce leurre ici à {prixSolo}. Alure est une micro-entreprise française tenue par des pêcheurs, et personne ne la finance à notre place. Il nous faut {objectif} précommandes pour produire une série à notre nom, signée, dans sa propre boîte.
- `PRECOMMANDE.COUNTER` — {compte} sur un objectif de {objectif}
- `PRECOMMANDE.COUNTER_NOTE` — Ce compteur est branché sur nos paiements. Il monte quand une commande est encaissée, et pas autrement.
- `PRECOMMANDE.WHY_TITLE` — Pourquoi {objectif}
- `PRECOMMANDE.WHY_BODY` — Aucun atelier ne produit à notre nom pour une poignée de pièces. En dessous de {objectif}, le coût par leurre monte au point que le prix affiché ne tient plus. Vos précommandes paient cette première série, et rien d'autre.
- `PRECOMMANDE.BOX_TITLE` — Ce qu'on veut vous envoyer
- `PRECOMMANDE.BOX_BODY` — Chaque leurre est signé à la main avant l'envoi. La boîte, nous la voulons à la hauteur de ce que vous avez payé, et nous voulons recevoir toute la série avant de vous expédier la vôtre, pour raccourcir l'attente. Tant que l'atelier n'a rien confirmé, nous n'annonçons ni matériau ni contenu. Vous verrez la boîte finie ici avant de la recevoir.
- `PRECOMMANDE.DATE_TITLE` — La date
- `PRECOMMANDE.DATE_BODY` — Une précommande sans date d'expédition n'engage à rien. La nôtre en a une : votre commande part au plus tard le {dateLimite}. Cette date ne dépend pas du compteur, et nous ne la repousserons pas en attendant des commandes.
- `PRECOMMANDE.REFUND_TITLE` — Si on n'y arrive pas
- `PRECOMMANDE.REFUND_BODY` — Si les {objectif} commandes ne sont pas réunies, la série ne se fait pas et vous êtes remboursé en entier. Si elles le sont mais que l'expédition ne peut pas tenir le {dateLimite}, vous êtes remboursé en entier aussi. Le remboursement revient sur votre moyen de paiement, sans que vous ayez à le demander.
- `PRECOMMANDE.PRICE` — {prixSolo} le leurre. {prixCollection} pour 3 achetés, le 4e offert. Port inclus. C'est le prix de la boutique : la précommande ne le change pas.
- `PRECOMMANDE.CTA` — Précommander mon leurre
- `PRECOMMANDE.CTA_NOTE` — Vous payez aujourd'hui. Expédition au plus tard le {dateLimite}. Livraison en France métropolitaine uniquement.
- `PRECOMMANDE.LEGAL` — Précommande : vous payez aujourd'hui un leurre que nous nous engageons à expédier au plus tard le {dateLimite}, conformément à l'article L216-1 du code de la consommation. Passé cette date, vous pouvez annuler votre commande et être remboursé intégralement sur votre moyen de paiement, sous 14 jours. Si l'objectif de {objectif} commandes n'est pas atteint, la série n'est pas lancée et toutes les précommandes sont remboursées dans les mêmes conditions. Droit de rétractation de 14 jours à compter de la réception. Livraison en France métropolitaine uniquement. TVA non applicable, article 293 B du CGI. Le vendeur est identifié dans les mentions légales.

### BANNER — bandeau d'objectif (2026-08-26)

- `BANNER.LABEL` — Objectif lancement
- `BANNER.ARIA` — Objectif de lancement
- `BANNER.ORDERS_ONE` — 1 commande
- `BANNER.ORDERS_MANY` — {compte} commandes
- `BANNER.DONE` — {commandes} passées. Merci d’être là.
- `BANNER.EMPTY` — Alure se lance. Soyez la première commande, l’objectif est de {objectif}.
- `BANNER.PROGRESS` — {commandes} sur un objectif de {objectif}. Faites partie des premiers.

### PRODUCT — visionneuse orientable (2026-08-28)

- `PRODUCT.VIEWER_LABEL` — Le leurre en 3D, orientable
- `PRODUCT.VIEWER_HINT` — Faites glisser pour tourner le leurre. Au clavier : les flèches, et Origine pour revenir.
- `PRODUCT.VIEWER_FREE` — Angle libre.

### NAV — page Nos projets (2026-08-28)

- `NAV.PROJECTS` — Nos projets

### PROJECTS — la page Nos projets (2026-08-28)

- `PROJECTS.TITLE` — Où en est Alure
- `PROJECTS.DESCRIPTION` — Où en est Alure : le leurre existe, il est stocké en France et livré sous {delai}. Il manque une première série signée, dans sa propre boîte.
- `PROJECTS.INTRO` — Cette page dit où en est le projet Alure, et ce qu'il lui reste à faire. Le leurre existe, il est en stock, il part de chez nous. Ce qui n'existe pas encore, c'est une série produite sous notre nom.
- `PROJECTS.DONE_TITLE` — Ce qui est déjà là
- `PROJECTS.DONE_BODY` — Le leurre est fait : un articulé deux sections de {specs}, pour le black-bass et la perche. Il existe en {nbColoris} coloris, {coloris}, et le {collector} qui ne se vend pas et s'offre en 4e leurre. Les visuels du site sont nos rendus 3D de cette pièce, et sur sa page vous la faites tourner du doigt.
- `PROJECTS.STOCK_TITLE` — Le stock est rentré en France
- `PROJECTS.STOCK_BODY` — Les leurres sont chez nous, et c'est nous qui préparons chaque commande, en enveloppe matelassée noire. Elle vous arrive sous {delai}. Avant, ils partaient de chez un fournisseur, et l'attente allait de 10 à 20 jours.
- `PROJECTS.SERIES_TITLE` — La série et la boîte
- `PROJECTS.SERIES_BODY` — Il manque une première série sous notre nom : le même leurre, signé, dans une boîte qui lui soit propre. C'est la seule différence avec celui que vous commandez ici aujourd'hui. Notre objectif est de {objectif} commandes pour la financer, et chaque commande payée compte dans ce total.
- `PROJECTS.CTA` — Voir le leurre
- `PROJECTS.CTA_NOTE` — {prixSolo} le leurre, ou {prixCollection} pour 3 achetés et le 4e offert. Port inclus, livraison {delai}. France métropolitaine uniquement.
