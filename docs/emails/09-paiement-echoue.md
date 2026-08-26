# Paiement non abouti

**Destinataire** : le client · **Envoi** : à la main · **Déclencheur** : Stripe a livré
`checkout.session.async_payment_failed` — un moyen de paiement à notification différée a échoué
après que le client a terminé le tunnel.

## Comment vous l'apprenez

Le webhook ne vous envoie **pas** d'email pour ce cas. Il écrit une ligne dans les logs du
serveur :

```
POST /api/stripe-webhook : paiement différé échoué (session cs_…, événement evt_…).
Aucune commande à traiter.
```

Le signal fiable reste le **dashboard Stripe**, où la session apparaît terminée mais non payée.
Aucun email de confirmation n'est parti : le code vérifie `payment_status` avant d'envoyer quoi
que ce soit, donc le client n'a jamais lu « Total payé ».

> Ce cas ne peut se produire que si un moyen de paiement à notification différée est activé dans
> le dashboard Stripe. Avec la carte seule, le paiement aboutit ou échoue immédiatement, et
> aucune session n'atteint cet état.

## Objet

```
Votre commande Alure n'a pas pu être finalisée
```

## Corps

```
Bonjour,

Votre paiement du {date} n'a pas abouti. Votre commande n'a donc pas été enregistrée, et rien
ne vous a été débité.

Si vous souhaitez toujours commander, l'article reste disponible ici :
https://alure-peche.fr/leurre

Le prix et le délai sont inchangés : 10 à 20 jours ouvrés, port inclus.

Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Vérifiez ceci avant d'envoyer

**Que rien n'a été débité.** Ouvrez la session dans le dashboard Stripe et confirmez que le
paiement est bien en échec, pas simplement en attente. Écrire « rien ne vous a été débité » à
quelqu'un qui a été débité transforme un incident technique en litige.

Si le paiement est **en attente** et non en échec, n'envoyez rien : attendez. Stripe livrera
`checkout.session.async_payment_succeeded` si le paiement aboutit, et la confirmation partira
automatiquement.

## Le cas voisin : le panier abandonné

Un client qui quitte la page Stripe sans payer ne déclenche **aucun** événement traité par le
site, et vous n'avez ni son email ni son panier. Il n'y a donc pas d'email de relance possible, et
c'est un choix : pas de base de données, pas de tracking (règles Alure n°4 et n°10).

## Ce que cet email ne doit jamais dire

- « Votre carte a été refusée » ou toute cause précise. Vous ne connaissez pas le motif exact, et
  le supposer est humiliant pour rien.
- Une remise pour compenser. Le paiement a échoué, ce n'est pas une négociation.
- Une urgence fabriquée (« plus que quelques exemplaires »).
