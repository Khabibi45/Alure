# Multilingue — le standard

> **Statut : contenu prêt, mise en ligne BLOQUÉE par une décision commerciale.** Lire le §0
> avant tout. Les fichiers de langue sont complets et utilisables ; ce qui manque n'est pas du
> texte, c'est une décision.

Ce dossier contient **tout le texte visible du site**, langue par langue. Un fichier par langue,
les mêmes clés dans le même ordre partout. Le français fait foi.

| Fichier | Langue | Statut |
|---|---|---|
| [`fr.md`](./fr.md) | Français | **référence** — c'est la source, les autres en dérivent |
| [`en.md`](./en.md) | Anglais | adapté |
| [`es.md`](./es.md) | Espagnol | adapté |
| [`de.md`](./de.md) | Allemand | adapté |
| [`nl.md`](./nl.md) | Néerlandais | adapté |

---

## 0. Le blocage à lever avant de publier une seule de ces langues

**Le site ne livre qu'en France.** C'est écrit dans le code
(`shipping_address_collection.allowed_countries: ['FR']`) et assumé comme hors-scope dans
[`../specs/boutique.md`](../specs/boutique.md).

Publier une version allemande ou espagnole d'une boutique qui refuse l'adresse de livraison au
moment de payer, c'est **faire venir des gens pour rien** — et c'est le genre de parcours qui
génère des litiges, or les litiges gèlent un compte Stripe. Ce n'est pas un détail de traduction :
c'est la première chose à trancher.

Trois issues, à choisir explicitement :

1. **Ouvrir la livraison à ces pays.** Alors il faut, *avant* de publier : le coût réel
   d'expédition par zone (déjà signalé par Camil le 2026-08-06 : « en fonction des régions et des
   pays ça va leur revenir beaucoup plus cher »), les **délais par zone** (le « 10 à 20 jours
   ouvrés » actuel est une promesse France), la **TVA** — une micro-entreprise en franchise
   art. 293 B qui vend à des particuliers d'autres pays de l'UE entre dans le régime des ventes à
   distance et son seuil ; et la **rétractation 14 jours** vaut dans toute l'UE, donc le retour
   depuis l'étranger doit être décidé. **Aucun de ces points ne se devine — ils se vérifient.**
2. **Publier en anglais seulement**, comme langue de lecture pour des visiteurs francophones ou
   internationaux, en indiquant clairement « nous n'expédions qu'en France » **au-dessus du
   bouton d'achat**, pas dans une FAQ.
3. **Ne rien publier** et garder ces fichiers comme travail préparatoire.

**Tant que ce n'est pas tranché, chaque fichier de langue porte en tête l'encadré
`SHIPPING_NOTICE`** — il dit la vérité au visiteur. Le supprimer sans avoir ouvert la livraison
serait un mensonge, pas une simplification.

---

## 1. Le principe : adapter, pas traduire

Le français du site a un ton précis, décrit dans
[`../standards/UI-COPY.md`](../standards/UI-COPY.md) : vouvoiement, phrases courtes, aucune
promesse qu'on ne tient pas, aucune tournure « IA générée ». Les autres langues doivent produire
**le même effet**, pas les mêmes mots.

Ce qui se transpose, et comment :

| En français | Ce qu'on veut faire ressentir | Ce que ça devient ailleurs |
|---|---|---|
| Vouvoiement systématique | Respect, sérieux commercial | EN : neutre (« you ») · ES : **usted** · DE : **Sie** · NL : **u** |
| « Comptez 10 à 20 jours ouvrés » | Honnêteté assumée sur un délai long | Jamais adouci, jamais déplacé plus bas dans la page |
| « Nous vendons un seul leurre, que nous avons choisi » | Petite maison, choix assumé | Garder la première personne du pluriel, garder l'aveu |
| « Le paiement n'a pas pu démarrer. Réessayez dans un instant. » | Erreur qui dit quoi faire | Même structure : ce qui s'est passé, puis l'action |
| « Acheter » | Verbe d'action, zéro emphase | EN « Buy » (pas « Buy now! ») · DE « Kaufen » · ES « Comprar » · NL « Kopen » |

**Interdits, dans toutes les langues** : le point d'exclamation commercial, les superlatifs
(« best », « ultimate », « revolutionär »), l'urgence fabriquée (« offre limitée »), et tout
avis, note ou statistique — il n'y en a aucun de réel (règle n°6).

---

## 2. Ce qui ne se traduit JAMAIS

Ces éléments restent en français ou à l'identique, même dans un fichier allemand :

- **La mention de TVA** : « TVA non applicable, art. 293 B du CGI ». C'est une mention légale
  française qui cite un article de loi français. On peut l'**expliquer** entre parenthèses dans
  la langue lue, jamais la remplacer.
- **Le nom de la marque** : *Alure*. Jamais décliné, jamais traduit.
- **Le nom du produit** dans les emails et sur la page Stripe — il doit correspondre à ce que le
  client a vu au moment de payer.
- **Les mentions légales et CGV** : elles engagent juridiquement une micro-entreprise française.
  Une traduction n'a **aucune valeur juridique** et peut en avoir une trompeuse. Elles restent en
  français, avec un résumé traduit clairement identifié comme non contractuel. **À faire valider
  — ceci n'est pas un avis juridique.**
- **Les montants** : la devise reste l'**euro**. Aucune conversion affichée, aucun « ≈ $27 » —
  le client paie en euros, il doit voir des euros.

---

## 3. La structure d'un fichier de langue

Chaque fichier suit **exactement** le même plan, avec les mêmes clés `SCREAMING_SNAKE`. C'est ce
qui rend une langue ajoutable sans réfléchir et une clé manquante repérable d'un coup d'œil.

```
0. SHIPPING_NOTICE      L'encadré du §0, tant que la livraison est France seule
1. META                 Nom, accroche, description SEO, langue, locale
2. NAV                  Les entrées du header et du footer
3. HOME                 Hero, sélecteur de vues, carrousel
4. PRODUCT              Page /leurre : titres, îlot d'achat, coloris, quantité, délai
5. PRICING              Le barème dégressif dit en une phrase
6. FAQ                  Les questions/réponses, dans l'ordre du français
7. TRACKING             Page /suivi
8. THANKS               Page /merci
9. CONTACT              Formulaire et ses états
10. LEGAL               Titres des pages légales + avertissement de non-traduction
11. EMAILS              Confirmation client + notification interne
12. STATES              Chargement, vide, erreurs, 404
13. LANG_SWITCHER       Libellés du sélecteur de langue
```

**Ajouter une langue** = copier `fr.md`, traduire chaque valeur, garder chaque clé, ajouter la
ligne au tableau ci-dessus. Rien d'autre. **Ne jamais réordonner ni renommer une clé dans une
seule langue** : c'est ce qui fait diverger les fichiers.

---

## 4. Le front — sélection rapide de la langue

**Ce n'est pas encore implémenté.** Voici la forme retenue, à valider avant d'écrire le code.

**Routing** : un segment de langue en tête d'URL — `/`, `/en`, `/es`, `/de`, `/nl`. Le français
reste à la racine (c'est le marché réel). Next.js App Router le fait avec un segment dynamique
`[lang]` ; les pages restent statiques, donc aucune perte de performance.

**Le sélecteur** — dans le header, à droite de la nav :

- Un **bouton unique** portant le code de la langue courante (`FR`, `EN`…), qui ouvre une liste
  de 5 entrées. Pas de drapeaux : un drapeau désigne un pays, pas une langue, et l'espagnol ou
  l'allemand en couvrent plusieurs. Le nom de la langue s'écrit **dans sa propre langue**
  (*Deutsch*, pas *Allemand*), c'est ce qu'un visiteur reconnaît sans savoir lire la page.
- Sur mobile, il rejoint le menu, en **haut** de la liste : un visiteur qui ne comprend pas la
  page ne doit pas avoir à faire défiler pour en changer.
- Le changement de langue **garde la page courante** (`/leurre` → `/en/leurre`). Renvoyer à
  l'accueil est la faute classique.
- Le choix se retient dans un cookie **strictement nécessaire** (préférence d'affichage, pas de
  traçage) — donc pas de bannière de consentement requise. **À faire valider.**
- **Aucune redirection automatique** sur la langue du navigateur : elle piège les visiteurs et
  casse le référencement. On propose, on n'impose pas.

**SEO, sans quoi le multilingue dessert plus qu'il ne sert** :
- `<html lang>` correct sur chaque page ;
- balises **`hreflang`** réciproques entre les 5 versions + `x-default` sur le français ;
- **une entrée de sitemap par langue**, et une URL canonique par langue (jamais la version
  française en canonique d'une page anglaise) ;
- `title` et `description` **adaptés**, pas traduits mot à mot : ce sont eux qui décident du clic.

**Accessibilité** : le bouton porte un `aria-label` explicite (« Changer de langue — actuellement
Français »), la liste est navigable au clavier, et chaque entrée porte `lang` et `hreflang`.

---

## 5. Ce qui reste à faire

- [ ] **Trancher le §0** (livraison hors France) — bloquant pour toute publication.
- [ ] Faire **relire chaque langue par un locuteur natif**. Ces fichiers sont une base de travail
      soignée, pas une traduction certifiée : personne ici n'est traducteur.
- [ ] Faire **valider juridiquement** le statut des pages légales traduites (§2).
- [ ] Implémenter le routing `[lang]`, le sélecteur, les `hreflang` et le sitemap par langue.
- [ ] Décider si les **emails transactionnels** suivent la langue de la commande (recommandé :
      oui, la langue est connue au moment du checkout et se stocke dans les `metadata` Stripe).
