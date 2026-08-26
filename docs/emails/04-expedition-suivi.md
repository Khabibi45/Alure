# Expédition et numéro de suivi

**Destinataire** : le client · **Envoi** : à la main · **Déclencheur** : le fournisseur a expédié et
a fourni un numéro de suivi.

> **Cet email est promis au client.** La confirmation de commande dit noir sur blanc : « Dès
> l'expédition, vous recevrez le numéro de suivi par email. » Aucun code ne l'envoie aujourd'hui.
> C'est vous qui tenez cette promesse, à la main, pour chaque commande.

## Objet

```
Votre commande Alure est expédiée
```

## Corps

```
Bonjour,

Votre commande est partie.

Numéro de suivi : {numéro_de_suivi}
Suivre le colis : {lien_de_suivi}

Le suivi peut mettre 24 à 48 h avant d'afficher un premier scan. C'est normal, le colis est
déjà pris en charge.

Livraison estimée : {date_min} au {date_max}.

Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Variables

| Variable | Où la trouver |
|---|---|
| `{numéro_de_suivi}` | Confirmation d'expédition du fournisseur |
| `{lien_de_suivi}` | Page de suivi du transporteur, avec le numéro déjà renseigné |
| `{date_min}` / `{date_max}` | Calculées depuis la date d'expédition, dans la fenêtre annoncée de 10 à 20 jours ouvrés à partir de la commande |

## La règle sur les dates

**« Livraison estimée », jamais « livraison le ».** Le mot « estimée » n'est pas une précaution de
style : une date promise et manquée est un litige, et un litige gèle un compte Stripe.

Si les dates calculées sortent de la fenêtre des 10 à 20 jours ouvrés annoncée avant l'achat,
n'envoyez pas cet email tel quel. Envoyez d'abord [Retard de livraison](05-retard-livraison.md).

## Si le fournisseur ne donne aucun numéro

N'inventez pas de numéro et n'envoyez pas cet email amputé de sa ligne principale. Écrivez plutôt :

```
Bonjour,

Votre commande est partie. Le transporteur n'a pas encore émis le numéro de suivi ; je vous
l'envoie dès qu'il m'est communiqué.

Livraison estimée : {date_min} au {date_max}.

Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Ce que cet email ne doit jamais dire

- Un numéro de suivi qui n'est pas encore actif chez le transporteur.
- « Livré demain », ou toute date au singulier.
- Une excuse préventive pour un retard qui n'a pas eu lieu.
