# Message du formulaire de contact

**Destinataire** : vous (`ORDER_NOTIFICATIONS_EMAIL`) · **Envoi** : automatique · **Déclencheur** :
un visiteur envoie le formulaire de contact.

**Écrit dans le code** : `src/app/api/contact/route.ts` (fonction `deliver`).

## Objet

Deux formes, selon que le visiteur a renseigné un numéro de commande.

```
Contact depuis le site
Contact (commande {numéro})
```

## Corps

```
De : {email_visiteur}
Commande : {numéro}          ← la ligne disparaît si le champ est vide

{message}
```

## Le détail qui compte : `replyTo`

L'email part de `Alure <onboarding@resend.dev>`, mais son `replyTo` est **l'adresse du
visiteur**. Répondre depuis votre boîte écrit donc directement au client, sans copier-coller
d'adresse. C'est le seul mécanisme de réponse du site.

## Ce qu'il faut faire en le recevant

| Le message porte sur… | Envoyer |
|---|---|
| « Où en est ma commande ? » avant le 5e jour ouvré | Une réponse simple : commande passée, délai 3 à 5 jours ouvrés, l'email de suivi partira à l'expédition. |
| « Où en est ma commande ? » après le 5e jour ouvré | [Retard de livraison](05-retard-livraison.md) |
| Une demande d'annulation ou de retour | [Rétractation reçue](07-retractation-recue.md) |
| Un coloris indisponible | [Coloris épuisé](06-coloris-epuise.md) |

## Ce que le formulaire ne collecte pas, volontairement

Ni nom, ni téléphone, ni adresse. Trois champs seulement : email, numéro de commande facultatif,
message (minimisation des données, règle n°10). Si vous avez besoin de l'adresse postale, elle est
dans le dashboard Stripe.

## Le piège à connaître

Ce message utilise la **même variable** `ORDER_NOTIFICATIONS_EMAIL` que les notifications de
commande. Si elle est vide, le formulaire de contact renvoie une erreur au visiteur **et** les
commandes ne sont plus notifiées. Une seule variable, deux fonctions bloquées.
