# Commande à traiter (notification interne)

**Destinataire** : vous (`ORDER_NOTIFICATIONS_EMAIL`) · **Envoi** : automatique · **Déclencheur** :
webhook Stripe, en même temps que la confirmation client.

**Écrit dans le code** : `src/lib/shop/emails.ts` (`notificationText`).

## Objet

```
Commande à traiter — {récapitulatif}
```

Exemples réels :

```
Commande à traiter — 1 leurre — Perche
Commande à traiter — 3 achetés — les 3 coloris + le 4e offert : Pirate
```

## Corps

```
Nouvelle commande payée (session {session_id}) :
- Client : {email_client}
- {récapitulatif}
- Total : {montant}

À préparer et expédier, puis renseigner le n° de suivi au client par email.
Détails complets : dashboard Stripe.
```

## Pourquoi cet email est bloquant

Le site n'a **pas de base de données** : la source de vérité des commandes est le dashboard
Stripe (règle Alure n°4). Cet email est donc le seul signal qui vous dit qu'une commande attend
d'être passée chez le fournisseur.

Le code le traite comme tel : si `ORDER_NOTIFICATIONS_EMAIL` est absente, l'envoi **échoue
bruyamment** et Stripe re-livrera l'événement. C'est voulu — une commande payée qui ne serait
jamais traitée coûte plus cher qu'un webhook en erreur.

**Effet de bord à connaître** : la confirmation client part *avant* la notification interne. Si la
notification échoue, le webhook répond 500, Stripe re-livre, et le client reçoit **une deuxième
confirmation**. Garder cette variable renseignée n'est pas optionnel.

## Ce qu'il faut faire en le recevant

1. Préparer le colis avec le ou les coloris exacts du récapitulatif, en enveloppe matelassée noire.
2. Pour l'offre « 3 achetés, le 4e offert » : commander **les 3 coloris** plus le 4e leurre
   indiqué après « le 4e offert : ». Ce 4e est un choix du client, pas une valeur par défaut.
3. Récupérer l'adresse de livraison dans le dashboard Stripe (elle n'est pas dans cet email).
4. À l'expédition, envoyer l'[email d'expédition](04-expedition-suivi.md).

## Ce que cet email ne contient pas, volontairement

- L'adresse postale du client. Elle vit chez Stripe, pas dans une boîte mail (minimisation des
  données, règle n°10).
- Le détail du paiement. Le dashboard Stripe fait autorité.
