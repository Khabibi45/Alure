# Coloris épuisé après la commande

**Destinataire** : le client · **Envoi** : à la main · **Déclencheur** : le fournisseur ne peut pas
servir un coloris déjà payé.

> À envoyer **sous 24 h**. Le client a payé un produit précis. Plus l'information tarde, plus
> l'issue amiable s'éloigne.

## Objet

```
Votre commande Alure — un coloris indisponible
```

## Corps — commande d'un leurre seul

```
Bonjour,

Le coloris {coloris_indisponible} que vous avez commandé est en rupture chez mon fournisseur. Je
ne l'ai su qu'au moment de passer votre commande, et je m'en excuse.

Trois possibilités, au choix :

1. Un autre coloris, expédié immédiatement : {coloris_disponibles}.
2. Attendre le réapprovisionnement, prévu {délai_réapprovisionnement}.
3. Le remboursement intégral, 21,99 €, sous 5 à 10 jours ouvrés sur votre moyen de paiement.

Répondez simplement à cet email en indiquant votre choix. Sans réponse de votre part d'ici
{date_limite}, je vous rembourse.

Alure — https://alure-peche.fr
```

## Corps — commande « 3 achetés, le 4e offert »

```
Bonjour,

Le coloris {coloris_indisponible} est en rupture chez mon fournisseur. Votre commande comprend
les 3 coloris plus le 4e leurre offert que vous avez choisi ({cadeau}), je ne peux donc pas
l'expédier complète en l'état.

Trois possibilités, au choix :

1. Expédition immédiate de ce qui est disponible, et le coloris manquant envoyé séparément dès
   son retour en stock, sans frais.
2. Attendre le réapprovisionnement et tout recevoir en un seul colis, prévu
   {délai_réapprovisionnement}.
3. Le remboursement intégral, 65,97 €, sous 5 à 10 jours ouvrés sur votre moyen de paiement.

Répondez simplement à cet email en indiquant votre choix. Sans réponse de votre part d'ici
{date_limite}, je vous rembourse.

Alure — https://alure-peche.fr
```

## La règle du silence

**Sans réponse, on rembourse.** On n'expédie pas un produit de substitution que le client n'a pas
choisi, et on ne garde pas l'argent en attendant. Une date limite explicite dans l'email protège
les deux parties.

Comptez 7 jours calendaires pour `{date_limite}`.

## Une fois le choix connu

| Le client choisit… | Suite |
|---|---|
| Un autre coloris | Commander, puis [Expédition et suivi](04-expedition-suivi.md) |
| D'attendre | Prévenir à nouveau si le réapprovisionnement glisse |
| Le remboursement | Rembourser depuis Stripe, puis [Remboursement effectué](08-remboursement-effectue.md) |

## Après l'envoi : fermer le coloris à la vente

Passer `available: false` sur le coloris concerné dans `src/lib/shop/product.ts`. Il s'affichera
« Épuisé » et ne sera plus commandable, ni comme achat ni comme 4e leurre offert. Sans ça, le
même problème se reproduit à la commande suivante.

## Ce que cet email ne doit jamais dire

- Le nom du fournisseur.
- « Nous vous enverrons un coloris équivalent » sans accord préalable du client.
- Une date de réapprovisionnement que le fournisseur n'a pas confirmée.
