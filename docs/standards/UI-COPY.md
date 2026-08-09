# UI-COPY — charte de ton des textes visibles (web)

> **Standard (couche 1).** S'applique à **chaque chaîne visible** : titres, sous-titres, CTA,
> labels et erreurs de formulaire, états vides, 404, bannière cookies, footer, emails
> transactionnels, metadata (title/description). Origine : audit complet d'une app dont tous les
> textes « sentaient l'IA » (07/2026) — charte validée pour toutes les apps et sites du studio.

## Le principe

**On écrit ce que fait la page, et on s'arrête.** Une phrase = une information. L'explication
détaillée vit là où le visiteur la demande (page dédiée, FAQ), jamais en appendice d'un label.
Ton : **vouvoiement** (fixé dans `docs/product/PRODUCT.md`, appliqué sur tout le site), direct, un peu de chaleur —
**sans sur-corriger vers le télégraphique froid**.

La **référence de ton** : le message d'erreur concret et actionnable — cause + geste de sortie.

> ✅ « Votre message n'est pas parti (connexion interrompue). Réessayez, ou écrivez-nous
> directement à contact@… »

**Nuance web** : le marketing **assumé** est permis sur la landing et les pages d'offre — c'est le
rôle d'un site. Mais il reste soumis aux 5 interdits ci-dessous, et les micro-copies
fonctionnelles (formulaires, erreurs, états, bannières, 404) suivent la charte strictement.

## Les 5 tournures interdites

Relire **chaque nouvelle chaîne** contre cette liste avant de livrer.

### 1. Vendre ou coacher au lieu d'informer
Pas de leçon ou de bénéfice appendu à une micro-copie. C'est LE tic n°1.
- ❌ « Décrivez votre projet — c'est la première étape vers votre transformation digitale. »
- ✅ « Décrivez votre projet. »

### 2. Métaphore filée répétée
Jamais la même image martelée de section en section (« votre partenaire de croissance » ×4).
Un concept marketing vit **une fois**, à son endroit fort (le hero) — partout ailleurs,
description concrète de ce que c'est.

### 3. Auto-défense préventive
Le site ne se justifie pas contre des reproches que personne n'a formulés (« sans engagement,
promis », « vos données ne seront jamais revendues » saupoudré partout). Chaque garantie légitime
se dit **une seule fois, à son endroit canonique** (sous le formulaire, page confidentialité).

### 4. Slogans symétriques & fausse chaleur
Pas de constructions binaires en système (« Des résultats, pas des promesses »), pas
d'enthousiasme fabriqué (« Génial ! Votre message est envoyé 🎉 »), pas de titre-slogan vide.
Un bouton dit ce qu'il fait.
- ❌ « C'est parti ! » → ✅ « Envoyer ma demande »
- ❌ « Passez à la vitesse supérieure » (titre de section services) → ✅ « Nos accompagnements »

### 5. Tiret cadratin béquille
Le motif « affirmation — justification » est interdit en système. Un ou deux tirets dans tout le
site, ça passe ; à chaque phrase, c'est une signature d'IA. Phrases courtes séparées par un point.

## Corollaires

- **Verbes français** : envoyer, découvrir, réserver — jamais d'anglicisme conjugué ni de
  franglais d'interface (« submitter », « checker »).
- **Une caption qui n'apporte aucune information se supprime**, elle ne se réécrit pas.
- **Textes légaux et contractuels** (mentions, politique, CGV) : intouchés sur le fond ; on ne
  les « réécrit » pas pour le style.
- **États vides et 404** : dire ce qui se passe et où aller, sans coaching.
  - ✅ 404 : « Cette page n'existe pas (ou plus). Retour à l'accueil, ou contactez-nous. »
- **Cohérence** : une même action porte le même verbe partout (bouton, menu, lien).
- **Metadata** : les title/description SEO suivent la charte aussi — décrire la page, pas
  empiler des mots-clés ni des slogans.
- **Jamais d'emoji** dans l'UI (boutons, titres, listes). Dans un texte éditorial de blog, avec
  parcimonie si le ton du produit l'assume.

## Où ça se vérifie

- `web-render` : la conformité des textes est une case de la **definition of done visuelle**.
- `web-product` : les textes marketing du cadrage suivent la même charte.
- En revue (`web-audit` qualité de code / relecture de diff) : toute chaîne ajoutée se relit
  contre les 5 tournures.
