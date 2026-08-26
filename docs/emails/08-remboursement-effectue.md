# Remboursement effectué

**Destinataire** : le client · **Envoi** : à la main · **Déclencheur** : le remboursement est parti
depuis le dashboard Stripe.

> À envoyer **le jour même**. Un remboursement Stripe met 5 à 10 jours ouvrés à apparaître sur le
> compte du client. Sans cet email, ces dix jours de silence deviennent une réclamation.

## Objet

```
Votre remboursement Alure est parti
```

## Corps

```
Bonjour,

Votre remboursement de {montant} est parti aujourd'hui, sur le moyen de paiement utilisé lors
de la commande {numéro_de_commande}.

Comptez 5 à 10 jours ouvrés avant de le voir apparaître sur votre relevé. Ce délai est celui de
votre banque, je n'ai pas la main dessus.

Si rien n'apparaît après 10 jours ouvrés, répondez à cet email : je vous transmets la preuve de
remboursement à présenter à votre banque.

Alure — https://alure-peche.fr
```

## Variables

| Variable | Où la trouver |
|---|---|
| `{montant}` | Le montant réellement remboursé, dans le dashboard Stripe |
| `{numéro_de_commande}` | L'identifiant de session Stripe |

**Le montant vient de Stripe, pas de votre mémoire.** Un remboursement partiel qu'on annonce
intégral crée exactement le litige qu'on cherchait à éteindre.

## Remboursement partiel

Si vous ne remboursez pas la totalité, la raison se dit dans l'email, chiffrée :

```
Votre remboursement de {montant_remboursé} est parti aujourd'hui, sur le moyen de paiement
utilisé lors de la commande {numéro_de_commande}.

Le détail : {montant_payé} payés, moins {montant_retenu} pour {raison_précise}.
```

Une retenue sans raison chiffrée est contestable, et Stripe donnera raison au client.

## Après l'envoi

Rien. Pas de relance, pas d'offre de remise pour « se faire pardonner ». Le dossier est clos.

## Ce que cet email ne doit jamais dire

- « Sous 3 à 5 jours ». Le délai réel des banques françaises est de 5 à 10 jours ouvrés, et
  annoncer plus court crée la réclamation du 4e jour.
- « Nous sommes désolés de vous voir partir » et toute formule de rétention.
- Un code promo. Un remboursement n'est pas une occasion commerciale.
