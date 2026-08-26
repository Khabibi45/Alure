# Rétractation reçue

**Destinataire** : le client · **Envoi** : à la main · **Déclencheur** : le client notifie qu'il se
rétracte, dans les 14 jours suivant la réception.

> **Obligation légale, pas geste commercial** (art. L221-18 du code de la consommation). À
> répondre sous 48 h. Les conditions exactes sont sur `/retractation` : ce gabarit ne fait que les
> rappeler, il ne les modifie jamais.

## Objet

```
Votre rétractation est enregistrée
```

## Corps

```
Bonjour,

J'ai bien reçu votre demande de rétractation pour la commande {numéro_de_commande}. Elle est
enregistrée à la date de votre email, le {date_de_notification}.

Ce qu'il reste à faire :

1. Renvoyez le leurre non utilisé, dans son emballage, sous 14 jours à :
   {adresse_de_retour}
   Les frais de renvoi restent à votre charge.

2. Dès réception du colis, je vous rembourse l'intégralité de ce que vous avez payé,
   livraison comprise, soit {montant}. Le remboursement part sur votre moyen de paiement
   d'origine, sous 14 jours après réception du retour.

Gardez une preuve de dépôt : elle vous protège si le colis se perd au retour.

Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Variables

| Variable | Valeur |
|---|---|
| `{numéro_de_commande}` | L'identifiant de session Stripe, ou le numéro donné par le client |
| `{date_de_notification}` | La date de **son** email, pas celle de votre réponse |
| `{adresse_de_retour}` | `LEGAL.returnAddress` dans `src/lib/legal-config.ts` |
| `{montant}` | 21,99 € (un leurre) ou 65,97 € (collection) |

> **Bloquant aujourd'hui** : `LEGAL.returnAddress` vaut encore
> `À COMPLÉTER : adresse de retour des colis`. Cette valeur est affichée telle quelle sur la page
> `/retractation` du site. Tant qu'elle n'est pas renseignée, cet email ne peut pas être envoyé et
> la page publique est fausse.

## Le cas de la commande « 3 achetés, le 4e offert »

Le 4e leurre est offert, mais il fait partie du contrat. **Le retour doit être complet** : les 4
leurres, cadeau compris. Ajoutez cette ligne au point 1 :

```
   Votre commande comprenait 4 leurres, le 4e offert inclus. Le retour porte sur l'ensemble.
```

Si le client ne renvoie que les 3 payés, le remboursement reste dû, mais vous pouvez déduire la
valeur du leurre conservé. Dites-le **avant** de rembourser, jamais après.

## Les erreurs qui coûtent cher

- **Rembourser avant réception du retour.** La loi laisse jusqu'à 14 jours après réception du
  colis. Rembourser d'avance, c'est risquer de perdre le produit et l'argent.
- **Demander une justification.** Le droit de rétractation s'exerce sans motif. Poser la question
  est légal, la conditionner ne l'est pas.
- **Retenir les frais de livraison initiaux.** Le remboursement est intégral, **livraison
  comprise**. Seuls les frais de renvoi restent au client.
- **Laisser passer 14 jours sans répondre.** Le silence ne suspend pas le délai.

## Ce que cet email ne doit jamais dire

- Une tentative de retenir le client (« êtes-vous sûr ? », « un autre coloris peut-être ? »).
- « Sous réserve que le produit soit en parfait état ». Le client a le droit de l'essayer comme en
  magasin. Seul un leurre visiblement utilisé à la pêche justifie une retenue, et elle se
  discute au retour, pas par avance.
