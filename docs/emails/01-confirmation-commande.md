# Confirmation de commande

**Destinataire** : le client · **Envoi** : automatique · **Déclencheur** : webhook Stripe, une fois
le paiement confirmé (`payment_status` différent de `unpaid`).

**Écrit dans le code** : `src/lib/shop/emails.ts` (`confirmationSubject`, `confirmationText`,
`confirmationHtml`). Ce fichier documente le gabarit ; toute modification se fait dans le code,
pas ici.

## Objet

```
Votre commande Alure est confirmée
```

## Corps — un leurre

```
Bonjour,

Votre commande est confirmée — merci de votre confiance.

Récapitulatif :
- Leurre Alure — articulé 2 sections
- 1 leurre — {coloris}
- Total payé : 21,99 € (port inclus — TVA non applicable, art. 293 B du CGI)

Livraison : 10 à 20 jours ouvrés, comme annoncé avant votre achat.
Dès l'expédition, vous recevrez le numéro de suivi par email.

Vous disposez d'un droit de rétractation de 14 jours après réception.
Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Corps — 3 achetés, le 4e offert

```
Bonjour,

Votre commande est confirmée — merci de votre confiance.

Récapitulatif :
- Leurre Alure — articulé 2 sections
- 3 achetés — les 3 coloris + le 4e offert : {cadeau}
- Total payé : 65,97 € (port inclus — TVA non applicable, art. 293 B du CGI)

Livraison : 10 à 20 jours ouvrés, comme annoncé avant votre achat.
Dès l'expédition, vous recevrez le numéro de suivi par email.

Vous disposez d'un droit de rétractation de 14 jours après réception.
Une question ? Répondez simplement à cet email.

Alure — https://alure-peche.fr
```

## Variables

| Variable | Source | Valeurs possibles |
|---|---|---|
| `{coloris}` | `session.metadata.coloris` | Truite arc-en-ciel · Perche · Orange feu |
| `{cadeau}` | `session.metadata.cadeau` | Truite arc-en-ciel · Perche · Orange feu · Pirate |
| Total | `session.amount_total` | 21,99 € (solo) · 65,97 € (collection) |

Le montant affiché est **celui que Stripe a réellement encaissé**, jamais un montant recalculé
côté site. C'est ce qui interdit l'écart entre le reçu et l'email.

## Ce que cet email ne doit jamais dire

- Une date de livraison précise. Le fournisseur expédie sous 10 à 20 jours ouvrés, et personne ne
  connaît le jour exact.
- « Votre colis est en route » tant que rien n'est parti. L'expédition a son propre email.
- Un numéro de suivi vide ou provisoire. Pas de numéro, pas de ligne.
- Une relance commerciale. Le client vient d'acheter, on lui confirme son achat.

## À vérifier avant de considérer cet email comme livré

- [ ] Le délai « 10 à 20 jours ouvrés » y figure, en toutes lettres.
- [ ] La mention « TVA non applicable, art. 293 B du CGI » accompagne le montant.
- [ ] Le droit de rétractation de 14 jours est rappelé.
- [ ] Le libellé du 4e leurre offert apparaît quand l'offre est la collection.
- [ ] Une réponse du client arrive bien dans une boîte relevée.
