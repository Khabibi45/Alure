---
name: web-illegal-states
description: >-
  Modélise les états pour rendre les états illégaux IMPOSSIBLES à représenter, plutôt que
  « possibles mais on fait attention ». À invoquer dès qu'on écrit un état React (loading/erreur/
  données), un résultat de route API, un statut de paiement ou de commande, ou qu'on voit
  plusieurs booléens/nullables corrélés décrivant la même chose. Impose l'union discriminée, la
  source unique par dimension d'état, et l'interdiction de stocker un état dérivable.
---

# web-illegal-states — l'état illégal ne doit pas être représentable

Étoile polaire : **on doit pouvoir énumérer les états valides d'une chose sur une main** (≤ 5),
sans tenir d'invariants croisés dans sa tête.

Ce skill traite le niveau **état d'un objet** (composant, résultat d'API, commande). Le niveau
valeur unique (un littéral à nommer, un montant à typer) est dans `web-anti-magic-string`.

## Les 4 lois

1. **Une dimension d'état = une source unique.** Jamais N booléens corrélés pour décrire la
   même chose.
2. **Un état dérivable est calculé, jamais stocké.** S'il se déduit d'autres champs, il ne
   mérite pas son propre `useState`.
3. **L'état illégal est interdit par le TYPE**, pas par la vigilance de celui qui écrit.
4. **Deux dimensions vraiment orthogonales** (qui évoluent indépendamment) → deux états
   séparés, pas un état fourre-tout.

## Signal n°1 — le trio `isLoading` / `error` / `data`

C'est l'anti-pattern le plus fréquent d'un front React.

```ts
// ❌ 2³ = 8 combinaisons représentables, 4 sont absurdes
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<Devis | null>(null)
// loading ET error ? data ET error ? rien du tout ? le type l'autorise.
```

```ts
// ✅ 4 états, exactement 4, exhaustivité vérifiée par TypeScript
type EtatRequete<T> =
  | { statut: 'inactif' }
  | { statut: 'chargement' }
  | { statut: 'succes'; donnees: T }
  | { statut: 'erreur'; message: string }

const [etat, setEtat] = useState<EtatRequete<Devis>>({ statut: 'inactif' })
```

Bénéfice direct sur la règle n°5 du kit (**états loading / vide / erreur distincts**) : le JSX
devient un `switch` exhaustif, et le compilateur refuse d'oublier un cas.

```tsx
switch (etat.statut) {
  case 'inactif':    return <Formulaire />
  case 'chargement': return <Squelette />
  case 'succes':     return <Resultat donnees={etat.donnees} />   // donnees existe forcément
  case 'erreur':     return <Alerte message={etat.message} />      // message existe forcément
}
```

**Le « vide » n'est pas un état de requête.** Une liste vide est un `succes` avec `donnees: []`.
Confondre « pas encore chargé » et « chargé, rien à afficher » produit exactement le faux vide que
la règle n°5 interdit.

## Signal n°2 — le résultat d'API modélisé en plat

```ts
// ❌ le client doit deviner quelle combinaison est légale
type Reponse = { success: boolean; data?: X; error?: string; issues?: Record<string, string[]> }

// ✅ union discriminée : le client fait un switch, rien à deviner
export type ResultatContact =
  | { type: 'ok' }
  | { type: 'invalide'; champs: Record<string, string[]> }
  | { type: 'trop-de-requetes'; reessayerDansSecondes: number }
  | { type: 'indisponible' }
```

Ce type se partage client **et** serveur (comme `contact-schema.ts` partage déjà le schéma zod) :
une seule source, aucune dérive possible entre ce que la route renvoie et ce que le client lit.

> Rappel `WEB-REFERENCE.md` : côté client, `res.ok` **avant** `res.json()`. L'union discriminée ne
> dispense pas du garde-fou HTTP — une route qui plante renvoie du HTML, pas ton union.

## Signal n°3 — l'état dérivé stocké (le cache qui diverge)

```ts
// ❌ deux sources pour la même vérité : elles finiront par se contredire
const [articles, setArticles] = useState<Article[]>([])
const [totalCentimes, setTotalCentimes] = useState(0)   // recalculé à la main partout

// ✅ une source, le reste se calcule
const [articles, setArticles] = useState<Article[]>([])
const totalCentimes = articles.reduce((somme, a) => somme + a.prixCentimes * a.quantite, 0)
```

Règle : **si ça se déduit, ça se calcule.** `useMemo` seulement si le calcul est réellement coûteux
et mesuré — pas par réflexe.

Corollaire côté produit, déjà posé par le kit : **une valeur serveur ne se recalcule jamais sur le
client.** Si le serveur a décidé qu'un paiement est `succeeded`, le composant l'affiche ; il ne
re-déduit pas le statut à partir d'un montant et d'une date. Sinon la règle métier vit à deux
endroits et les deux divergeront.

## Signal n°4 — les booléens corrélés

```ts
// ❌ estBrouillon + estPublie + estArchive : 8 combinaisons, 3 légales
// ✅ une dimension, une union
type StatutArticle = 'brouillon' | 'publie' | 'archive'
```

Si deux booléens ne peuvent **pas** être vrais en même temps, ce sont deux valeurs d'une même
union, pas deux champs.

## Faux positifs — ne PAS sur-modéliser

Le risque n°1 de ce skill est la cérémonie inutile. **N'applique pas** ce qui suit :

- Un booléen **isolé et non corrélé** (`menuOuvert`, `accepteCGV`) reste un booléen. Ne
  l'« énumifie » pas.
- Un booléen dérivé sain (`const estVide = articles.length === 0`) est correct : il est calculé,
  pas stocké.
- Une union à 2 valeurs sans transition métier n'a pas besoin d'une machine à états.
- Ne découpe pas un objet cohérent en sous-objets « pour faire propre ». On **regroupe** les
  sous-états d'une même dimension ; on ne fragmente que des dimensions vraiment indépendantes.
- Pas de métrique « 2^N états représentables » : le test reste qualitatif — **énumérables sur une
  main ?**

## Le test de simplicité (à se poser avant d'écrire)

1. Puis-je énumérer les états valides sur une main ?
2. Chaque champ stocké est-il **impossible** à déduire des autres ?
3. Le TYPE interdit-il la combinaison illégale, ou seulement ma vigilance ?
4. Y a-t-il une valeur d'union qu'aucune transition ne produit (état mort) ?
5. Un état décidé par le serveur est-il re-calculé côté client quelque part ?

Deux « non » ou plus → remodéliser avant de coder la suite.

## Application aux paiements (le back **livré** de ce site)

Ce que le dépôt contient réellement (`src/lib/shop/`, `src/app/api/checkout/`,
`src/app/api/stripe-webhook/` — livrés et couverts par vitest) : **Stripe Checkout en redirection
pleine page**, et
**aucune base de données** — règle permanente Alure n°4 : la source de vérité des commandes est
Stripe, on n'introduit pas de persistance « au cas où ». Le webhook ne crée, ne stocke et ne met à
jour **rien** : il envoie deux emails.

- **La preuve du paiement est le webhook signé**, jamais le retour navigateur.
  `/merci?session_id=…` n'est pas une preuve : l'URL est forgeable et l'utilisateur peut fermer
  l'onglet avant. C'est exactement ce que fait `src/app/merci/page.tsx` — contenu générique et
  honnête (« si votre paiement a été validé, vous recevrez un email »), aucun détail de commande,
  et le `session_id` n'est même pas lu.
- **Rien n'est persisté, donc il n'y a aucun statut de commande à modéliser.** Le seul état
  manipulé côté serveur est `event.type === 'checkout.session.completed'`, plus un `Set` d'IDs
  d'événements déjà traités (idempotence bornée par `PROCESSED_MAX`, en mémoire, borne par
  instance assumée : le pire cas est un email en double, pas une double commande). N'écris pas une
  union `StatutCommande` « pour être prêt » : ce serait un état sans transition et sans lecteur —
  exactement l'état mort du test de simplicité n°4.
- **Un fait reçu ne se re-déduit jamais.** « Payé » n'est pas dérivable d'un montant ou d'un
  horodatage. Le webhook relit `session.amount_total` et les `metadata` chez Stripe ; il ne
  recalcule pas ce que Stripe a décidé.
- **Côté client, l'union discriminée est déjà en place** — `src/components/sections/leurre/BuyBox.tsx` :

  ```ts
  type Status = { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string }
  ```

  Remarque le cas **absent** : il n'y a pas de `'succes'`. Le succès, c'est quitter la page
  (`window.location.assign(url)` vers Stripe) — il n'a donc aucun état représentable ici. Ajouter
  un quatrième cas créerait un état qu'aucune transition ne produit.

**Leçon conditionnelle — l'état « en attente » n'existe PAS dans ce système.** Les moyens
**asynchrones** (prélèvement SEPA, virement) confirment en plusieurs jours et imposeraient un vrai
état intermédiaire durable, donc quelque chose à suivre entre deux requêtes. Aucun n'est activé :
le paiement se joue sur la page hébergée Stripe, dont l'issue est immédiate. Ne modélise cet état
que le jour où un moyen asynchrone est réellement ouvert — et lis d'abord
`docs/specs/paiement-sepa.md`, qui explique pourquoi il est sans objet pour un achat unique à
21,99 €.

> Corollaire à connaître avant de spéculer sur « le prochain moyen de paiement » :
> `src/lib/shop/stripe.ts` **ne fixe volontairement pas** `payment_method_types` (le commentaire du
> fichier le dit). Activer un moyen de paiement est un **réglage du dashboard Stripe**, pas un
> changement de code — et donc, en général, pas un changement de modèle d'état. La seule exception
> est justement un moyen asynchrone.

Où est la vérité, dans cet ordre : **le code livré**, puis `docs/specs/boutique.md` (spec LOT 2
validée, T1-T4 livrées). `docs/architecture/PAIEMENTS.md` complète avec les faits Stripe vérifiés et
`docs/adr/001-paiements-stripe.md` avec la décision — en cas de désaccord, **le code a raison**.
