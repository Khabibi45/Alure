# Les emails d'Alure — index

Un fichier par email. Chacun donne l'objet, le corps prêt à copier, les variables à remplir, et
ce que l'email ne doit jamais dire.

## Ce qui part tout seul (écrit dans le code)

| Email | Qui le reçoit | Déclencheur | Code |
|---|---|---|---|
| [Confirmation de commande](01-confirmation-commande.md) | Le client | Webhook Stripe, paiement confirmé | `src/lib/shop/emails.ts` |
| [Commande à traiter](02-notification-vendeur.md) | Vous | Webhook Stripe, paiement confirmé | `src/lib/shop/emails.ts` |
| [Message du formulaire](03-contact-formulaire.md) | Vous | Envoi du formulaire de contact | `src/app/api/contact/route.ts` |

## Ce qui s'envoie à la main (aucun code aujourd'hui)

| Email | Quand | Urgence |
|---|---|---|
| [Expédition et numéro de suivi](04-expedition-suivi.md) | Le colis part de chez le fournisseur | **Promis au client dans la confirmation** |
| [Retard de livraison](05-retard-livraison.md) | Le 5e jour ouvré est dépassé | Avant que le client réclame |
| [Coloris épuisé après commande](06-coloris-epuise.md) | Le fournisseur ne peut pas servir le coloris | Sous 24 h |
| [Rétractation reçue](07-retractation-recue.md) | Le client demande à se rétracter (14 jours) | Sous 48 h, obligation légale |
| [Remboursement effectué](08-remboursement-effectue.md) | Le remboursement est parti depuis Stripe | Le jour même |
| [Paiement non abouti](09-paiement-echoue.md) | Un paiement différé a échoué | Sous 24 h |

## Les règles qui valent pour tous

1. **Le délai reste 3 à 5 jours ouvrés.** Jamais atténué, jamais arrondi vers le bas, jamais
   remplacé par « très bientôt ». C'est la règle Alure n°1, et c'est ce qui évite les litiges qui
   gèlent un compte Stripe.
2. **Aucun chiffre inventé.** Un numéro de suivi qui n'existe pas encore ne s'annonce pas. Une
   date de livraison ne se promet pas, elle s'estime avec le mot « estimée ».
3. **Vouvoiement, phrases courtes, pas de vente.** Un email transactionnel informe. Il ne
   remercie pas trois fois, ne vend pas le prochain leurre, n'ajoute pas d'emoji.
4. **Les mentions obligatoires** dans tout email qui parle d'argent : « TVA non applicable,
   art. 293 B du CGI » et le droit de rétractation de 14 jours.
5. **On répond depuis la même adresse** que celle qui a envoyé la confirmation, pour que le fil
   de discussion du client reste entier.

## L'adresse d'expédition — état actuel

Aujourd'hui les emails partent de `Alure <onboarding@resend.dev>`, l'adresse de test de Resend.

**Conséquence à connaître : Resend refuse (erreur 403) tout destinataire autre que l'adresse
propriétaire du compte.** Tant que le domaine `alure-peche.fr` n'est pas vérifié sur
[resend.com/domains](https://resend.com/domains), aucun client réel ne recevra sa confirmation.
Voir `docs/PROGRESS.md` pour l'état de cette bascule.
