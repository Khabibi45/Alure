---
name: web-tests
description: >-
  Écrit et relit les tests vitest du BACKEND uniquement : route handlers (src/app/api/**), schémas
  zod partagés, et logique serveur du module src/lib/shop/ (vérification de signature webhook,
  idempotence, calcul de montant, gabarits d'emails). À invoquer dès qu'on crée ou modifie une
  route API, un schéma partagé ou une règle serveur — et pour relire un test suspect. Impose :
  assertions fortes (statut ET corps), zéro test fantôme, valeurs ancrées dans le réel, isolation
  de l'état de module. Ne produit JAMAIS de test de composant, de page ou de rendu.
---

# web-tests — un filet de régression sur le backend, et rien d'autre

## 0. L'état réel de la suite — LIVRÉ, pas à faire

Vérifié dans le code le 2026-08-05. **Le backend paiement est écrit, testé et vert** : ne le
re-spécifie pas, ne le « prépare » pas, étends-le.

| Fichier de test (le modèle à imiter) | Ce qu'il couvre | Tests |
|---|---|---|
| `src/lib/shop/shop.test.ts` | `checkoutSchema` (bornes, coloris, clés inconnues), `totalCents`, `orderableError`, `formatEuros` | 16 |
| `src/app/api/checkout/route.test.ts` | Route checkout : nominal, zod, coloris, JSON, 413, 503, 500, rate-limit | 8 |
| `src/app/api/stripe-webhook/route.test.ts` | Webhook : signature, en-tête absent, autres types, idempotence, 500 bruyant, session incomplète | 8 |
| `src/lib/shop/emails.test.ts` | Gabarits d'emails : délai ré-affiché, récap exact, vouvoiement, échappement HTML | 6 |
| `src/app/api/contact/route.test.ts` | Route contact : 503 bruyant, zod, honeypot, JSON, 413, rate-limit | 6 |

**Total : 44 tests verts** (gate confirmé dans `docs/PROGRESS.md`). Toute régression du chemin de
l'argent doit faire rougir au moins un de ces fichiers.

## 1. Périmètre — décision assumée du propriétaire, pas un oubli

| Ce qui a un test | Ce qui n'en a PAS |
|---|---|
| Route handlers `src/app/api/**` | Composants `src/components/**` |
| Schémas zod partagés (`contact-schema.ts`, `shop/checkout-schema.ts`) | Pages `src/app/**/page.tsx`, layouts |
| Logique serveur pure de `src/lib/shop/` : calcul de montant, disponibilité, gabarits d'emails | Rendu, styles, animations, responsive |
| Contrat des routes de paiement : signature, idempotence, échec bruyant | Hooks d'UI, navigation, formulaires côté client |

> **À l'attention d'un futur agent : ne « corrige » pas cette absence.** Le propriétaire a décidé
> qu'aucun test de composant ne serait écrit. Ne propose pas Testing Library sur un composant,
> même « juste un smoke test ». `@testing-library/*` reste installé pour l'outillage, pas pour
> qu'on s'en serve.
>
> **Le rendu est vérifié autrement** : par le navigateur réel de `web-quality-gate` (console,
> 375 px + desktop, parcours clavier). C'est une vérification, elle est simplement manuelle.

Ce que le fichier testé doit *contenir*, lui, est la doctrine de `web-backend`.

## 2. Outil, emplacement, environnement

```bash
npm run test          # vitest run — le gate
npm run test:watch    # boucle de dev
```

- Le test vit **à côté** du fichier testé : `src/app/api/checkout/route.test.ts`. Pas de dossier
  `__tests__`, pas de miroir d'arborescence.
- **Exception réelle et assumée** : `src/lib/shop/shop.test.ts` couvre `product.ts` **et**
  `checkout-schema.ts`. Dans `src/lib/shop/`, l'unité de test est le **module**, pas le fichier —
  ces deux-là forment une seule règle (le schéma dérive ses bornes de `PRODUCT`). Ne le découpe pas
  « pour faire propre ».
- `vitest.config.ts` déclare `environment: 'jsdom'`. **Tout fichier de test backend commence donc
  par `// @vitest-environment node`** — première ligne, avant les imports. Les 5 fichiers existants
  le font ; un oubli teste du code serveur dans un faux DOM.

## 3. Ce qu'un bon test prouve

Un **comportement observable**, pas une implémentation. Pour chaque unité backend :

1. **le cas nominal** — l'entrée valide produit la sortie attendue ;
2. **au moins un échec métier significatif** — pas « ça throw », mais *lequel* et *avec quel corps* ;
3. **les bornes déclarées** — plafond de taille, rate-limit, quantité min/max ;
4. **les effets de bord observables** — le module tiers a-t-il été appelé, avec quels arguments,
   combien de fois (`expect(sendOrderEmails).toHaveBeenCalledTimes(1)`) ;
5. **les règles produit qui ne sont pas des statuts HTTP.** `emails.test.ts` en est le modèle : il
   protège le délai 10-20 jours ré-affiché (règle Alure n°1), le vouvoiement (UI-COPY) et
   l'échappement HTML des valeurs interpolées. Ce sont des exigences, pas de la décoration.

Un test qui change dès qu'on renomme une variable interne teste l'implémentation : réécris-le.

## 4. Mocker la frontière, jamais la logique

Le SDK Stripe et Resend ne sont **jamais** appelés en test : on mocke le module d'isolation, pas la
règle qu'on veut prouver.

```ts
// ✅ le motif réel des deux route.test.ts : on mocke la frontière, on pilote le mock par test
const createCheckoutSession = vi.fn()
vi.mock('@/lib/shop/stripe', () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
}))
import { POST } from './route'          // import APRÈS le vi.mock

beforeEach(() => {
  createCheckoutSession.mockReset()
  createCheckoutSession.mockResolvedValue('https://checkout.stripe.com/c/pay/test_123')
})
```

**Piège réel de ce dépôt, à ne pas casser** : les classes d'erreur vivent dans
`src/lib/shop/errors.ts`, un fichier **séparé** de `stripe.ts`. C'est délibéré — la route fait
`error instanceof PaymentNotConfiguredError`, et si la classe vivait dans le module mocké,
l'`instanceof` ne reconnaîtrait plus rien : le 503 deviendrait un 500, **en silence**. Ne déplace
jamais une classe d'erreur dans un module mockable.

**Injection par paramètre par défaut > mock**, quand c'est possible :

```ts
// orderableError(colorisId, colorways = PRODUCT.colorways) — la donnée est injectable
const fixtures: Colorway[] = [{ id: 'epuise', label: 'Épuisé', available: false }]
expect(orderableError('epuise', fixtures)).toMatch(/épuisé/i)
```

C'est ce que fait `shop.test.ts` : sans ça, la branche « épuisé » serait **inatteignable** (les
3 coloris réels sont tous `available: true`) et la règle ne serait jamais prouvée.

## 5. Tests fantômes — interdits

Une assertion qui passe quoi qu'il arrive n'est pas un test, c'est un faux vert. C'est exactement
la « dégradation silencieuse » que le kit interdit, transposée à la suite de tests.

```ts
// ❌ fantômes : passent même si la route est cassée
expect(res).toBeDefined()
expect(body.error).toBeTruthy()                  // « une erreur, laquelle ? »
expect(() => parse(input)).not.toThrow()
expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0)  // « au moins une », donc rien

// ✅ versions fortes : la valeur exacte
expect(res.status).toBe(413)
expect(body).toEqual({ error: 'Requête trop volumineuse.' })
expect(checkoutSchema.safeParse(input).success).toBe(true)
expect(codes[9]).not.toBe(429)   // 10e requête : encore autorisée
expect(codes[10]).toBe(429)      // 11e : refusée — la borne est prouvée des DEUX côtés
```

`toBeTruthy`, `toBeDefined`, `not.toThrow` ne sont légitimes qu'**en complément** d'une assertion
sur la valeur, jamais comme seule assertion d'un test.

> Deux tests existants (`checkout/route.test.ts`, `contact/route.test.ts`) utilisent encore la forme
> faible sur le rate-limit et sur `body.error`. C'est un **durcissement identifié, listé en §12** —
> pas une régression à réparer en urgence, et surtout pas une raison de réécrire la suite. Écris
> fort dès maintenant pour tout **nouveau** test.

Pour mesurer objectivement si une suite attrape vraiment les régressions plutôt que de le supposer,
voir `web-mutation-testing` (optionnel, hors gate).

## 6. Assertions fortes sur une route : le statut ET le corps

Un statut seul ne prouve pas que la bonne branche s'est exécutée — sur `/api/checkout`, **quatre**
branches différentes renvoient `400` (JSON illisible, zod, coloris inconnu, coloris épuisé).

```ts
// ✅ le modèle du webhook : statut + effet de bord + arguments exacts
const res = await POST(makeReq())
expect(res.status).toBe(200)
expect(sendOrderEmails).toHaveBeenCalledTimes(1)
expect(sendOrderEmails).toHaveBeenCalledWith(
  expect.objectContaining({
    customerEmail: 'client@exemple.fr',
    colorisLabel: PRODUCT.colorways[0].label,
    quantite: 2,
    totalCents: totalCents(2),        // le montant dérive de la source de vérité, jamais d'un littéral
  })
)
```

À ne pas oublier sur une route : les **en-têtes** qui portent du contrat
(`res.headers.get('Retry-After')` sur un 429 — les deux routes en émettent un) et l'**absence** de
fuite (aucune donnée personnelle dans le corps d'erreur ni dans les logs).

## 7. Ancrage dans le réel

Les valeurs de test ressemblent à ce que le site traite **vraiment**, et dérivent de la source de
vérité quand elle existe : `PRODUCT.colorways[0].id`, `totalCents(2)`, `'client@exemple.fr'`.
`'aaa'`, `'test@test'`, `42` produisent des tests qui passent sur des cas que la production ne
verra jamais.

**Exception unique** : une valeur absurde est admise pour exercer un **contrôle de sécurité ou une
borne déclarée**. Dans ce cas, deux obligations :

1. le **nom du test dit l'intention** (« rejette un payload trop volumineux (413) »), et
2. la valeur extrême **dérive d'une constante nommée**, jamais d'un littéral brut.

```ts
import { CHECKOUT_MAX_BYTES } from '@/lib/shop/checkout-schema'   // exportée : sers-t'en

// ❌ 'A'.repeat(2000) — pourquoi 2000 ? le test dérive en silence si le plafond change
// ✅ le lien avec la borne est explicite et se met à jour tout seul
const trop = 'A'.repeat(CHECKOUT_MAX_BYTES + 1)
```

`CHECKOUT_MAX_BYTES` et `CONTACT_MAX_BYTES` **sont exportées** par leurs schémas : aucune excuse.
`RATE_LIMIT_MAX` ne l'est pas — voir la recommandation R1 en §12.

> **Piège de formatage à connaître** : `Intl.NumberFormat('fr-FR')` insère une **espace insécable
> fine (U+202F)**, pas une espace ordinaire. Une assertion brute sur `'21,99 €'` échoue. Les deux
> tests concernés (`shop.test.ts` sur `formatEuros`, `emails.test.ts` sur le récapitulatif)
> **normalisent l'espace avant de comparer** — fais pareil plutôt que de coller un caractère
> invisible dans le test.

## 8. Zéro bombe à retardement temporelle

Une date fixe finit toujours par être dans le passé. Un test vert aujourd'hui et rouge dans six mois
sans qu'une ligne de code ait bougé est un test cassé, pas un test strict.

Aujourd'hui **aucun test du dépôt ne dépend de l'horloge** : la fenêtre de rate-limit (60 s) est
largement plus longue qu'une exécution de suite. La règle vaut pour tout nouveau test.

```ts
// ❌ bombe : rouge un jour, pour rien
expect(expiree(new Date('2026-09-01'))).toBe(false)

// ✅ temps relatif, dérivé d'une constante nommée, et le temps est INJECTÉ
const TTL_MS = 24 * 60 * 60 * 1000              // 24 h
const maintenant = Date.now()
expect(expiree(maintenant - TTL_MS + 1_000, maintenant)).toBe(false)
expect(expiree(maintenant - TTL_MS - 1_000, maintenant)).toBe(true)
```

Illustration seulement : **aucune fonction d'expiration n'existe dans le dépôt**, ne la crée pas
« pour tester ». (Qu'une Checkout Session expire après 24 h est un fait Stripe vérifié ; tout autre
chiffre Stripe porte la mention **(à vérifier contre docs.stripe.com)**.)

**Injecte le temps** : un paramètre `now: number` sur la fonction testée est toujours préférable à
un mock global. Si c'est impossible, `vi.useFakeTimers()` + `vi.setSystemTime(...)`, et
`vi.useRealTimers()` dans un `afterEach` — sinon l'horloge figée fuit vers les tests suivants.

## 9. Isolation de l'état de module — le piège réel de ce dépôt

Trois états vivent **au niveau du module** et sont partagés par tous les tests d'un même fichier :

| État | Où | Effet s'il fuit |
|---|---|---|
| `hits: Map<string, number[]>` (rate-limit, max 5) | `api/contact/route.ts` | Un test consomme le quota d'une IP, le suivant reçoit un 429 inattendu |
| `hits: Map<string, number[]>` (rate-limit, max 10) | `api/checkout/route.ts` | Idem |
| `processedEventIds: Set<string>` (idempotence, borné à 1000) | `api/stripe-webhook/route.ts` | Un événement déjà traité fait répondre `{ duplicate: true }` au test suivant |

**La parade réellement employée, et qui suffit : un identifiant neuf par requête.**

```ts
// ✅ checkout : une IP différente à chaque appel, par défaut
'x-forwarded-for': ip ?? `10.0.0.${++ipCounter}`
// ✅ contact : une IP fixe distincte par test ('1.1.1.1', '1.1.1.2', …)
// ✅ webhook : un ID d'événement neuf par défaut
id: eventId ?? `evt_${++eventCounter}`
```

**Un identifiant fixe uniquement quand le test porte sur la répétition** — c'est le cas des deux
tests d'idempotence (`'evt_dup'`, `'evt_retry'`) et des deux tests de rate-limit (`'9.9.9.9'`, une
IP dédiée qu'aucun autre test du fichier n'utilise).

`vi.resetModules()` + import dynamique reste le dernier recours quand l'état **doit** repartir de
zéro ; **aucun test du dépôt n'en a besoin aujourd'hui**, et un import statique après un
`resetModules` garde l'ancien module — donc si tu y viens, l'import doit être dynamique.

> Vitest isole **par fichier** : l'état de module ne fuit pas d'un fichier de test à l'autre. C'est
> pourquoi `'9.9.9.9'` peut servir dans `contact/route.test.ts` **et** dans
> `checkout/route.test.ts` sans collision. À l'intérieur d'un fichier, en revanche, aucun test ne
> doit dépendre de l'ordre d'exécution.

Même discipline pour tout le reste : `mockReset()` dans un `beforeEach` (avec remise du
comportement par défaut), variables d'environnement stubbées (`vi.stubEnv` / `vi.unstubAllEnvs`),
horloge factice restaurée.

> Ces bornes en mémoire sont des bornes **par instance** en serverless. Le test prouve la logique,
> pas une garantie de production — ne laisse pas croire l'inverse dans le nom du test.

## 10. Nommer par le comportement

En français, phrase complète, du point de vue de l'appelant. Jamais `test1`, `ça marche`,
`should work`, ni le nom de la fonction interne.

| ❌ | ✅ (noms réels du dépôt) |
|---|---|
| `it('webhook ok')` | `it('est idempotent : le même événement livré deux fois → un seul envoi')` |
| `it('erreur email')` | `it('répond 500 si l’envoi échoue (Stripe re-livrera) — jamais un faux succès')` |
| `it('checkout 400')` | `it('rejette une quantité hors bornes (400) avec le détail par champ, sans appeler Stripe')` |
| `it('teste deliver')` | `it('traite le honeypot comme un succès sans rien livrer (200)')` |

Le nom doit permettre de comprendre la régression **sans ouvrir le fichier**.

## 11. Les paiements — ce que les tests prouvent DÉJÀ

Tout est **livré** (`src/lib/shop/`, `src/app/api/checkout/`, `src/app/api/stripe-webhook/`).
Comment ce code s'écrit relève de `web-backend` ; voici ce que ses tests prouvent aujourd'hui, à
lire avant d'ajouter quoi que ce soit.

| Unité | Ce que le test prouve — et sa limite |
|---|---|
| Signature du webhook | En-tête `stripe-signature` absent → 400 **et** le vérificateur n'est pas appelé. Vérificateur qui lève `WebhookSignatureError` → 400 **et** zéro email. **Limite honnête** : `@/lib/shop/stripe` est mocké — le test prouve le **contrat de la route**, pas le HMAC de Stripe (qui est le travail du SDK). |
| Idempotence | Même `event.id` livré deux fois → `sendOrderEmails` appelé **une seule fois**. Et le complément indispensable : un **échec d'envoi ne marque pas** l'événement traité, donc le retry ré-envoie (2 appels). La dédup porte sur `event.id`, et sur rien d'autre. |
| Types d'événements | Tout type ≠ `checkout.session.completed` → 200 immédiat, zéro email (sinon Stripe re-livre en boucle). |
| Données incomplètes | Session sans email client → 200 + zéro email (re-livrer ne réparerait rien). |
| Calcul de montant | `totalCents` : centimes entiers, `2199` et `10995`, et **échec bruyant** hors bornes ou sur un non-entier. Aucun arrondi flottant nulle part. |
| Disponibilité | `orderableError` : `null` si commandable, message si épuisé, message si inconnu — plus un test qui vérifie que **les 3 coloris réels** sont dans un état cohérent. |
| Gardes de la route checkout | 413 (plafond), 400 (JSON illisible), 400 + `issues` (zod), 400 (coloris), 503 (`PaymentNotConfiguredError`), 500 (Stripe en panne, **jamais** de `url` dans le corps), 429 (rate-limit). |

**Deux choses à NE PAS faire ici :**

- **N'écris pas de test « d'ordre des événements ».** L'ordre de livraison Stripe n'est pas garanti,
  c'est vrai — mais cette route ne traite **qu'un seul type d'événement** et ne tient **aucun état
  de commande** : tout autre type reçoit un 200 immédiat. Un test d'ordre porterait sur une machine
  à états qui n'existe pas.
- **N'invente pas de persistance.** `CLAUDE.md` règle Alure n°4 : **pas de BDD ni de comptes en
  v1**, la source de vérité des commandes est Stripe. La dédup est un `Set` de module borné à 1000
  IDs, et c'est un **choix assumé** : en serverless multi-instance la borne est par instance, le
  pire cas d'un doublon inter-instances est un email de confirmation en double, pas une double
  commande. Ne teste pas un stockage qui n'existe pas, et ne propose pas d'en ajouter un.

Tout fait Stripe utilisé dans un test vient de la doctrine vérifiée du projet ; le reste porte la
mention **(à vérifier contre docs.stripe.com)**.

## 12. Recommandations identifiées — NON appliquées

Aucune n'est un défaut bloquant : la suite est verte et attrape déjà les régressions du §11. Elles
sont listées pour être **arbitrées**, pas exécutées d'office.

| # | Constat (vérifié le 2026-08-05) | Ce que ça apporterait | Statut |
|---|---|---|---|
| **R1** | `RATE_LIMIT_MAX` n'est exporté ni par `api/contact/route.ts` (5) ni par `api/checkout/route.ts` (10). Les tests bouclent sur `7` et `12` en dur. | Le test dériverait de la borne (`RATE_LIMIT_MAX + 2`) et suivrait automatiquement un changement de valeur. Voir `web-anti-magic-string`. | **non appliquée** |
| **R2** | Assertions faibles à durcir : dans `checkout/route.test.ts` et `contact/route.test.ts`, le rate-limit s'asserte en `filter(c => c === 429).length > 0` et les corps d'erreur en `toBeTruthy()` ; les payloads 413 utilisent `'A'.repeat(2000)` / `'A'.repeat(21000)` au lieu de dériver de `CHECKOUT_MAX_BYTES` / `CONTACT_MAX_BYTES`. Dans `shop.test.ts`, `toThrow()` est sans motif. | Prouverait la borne des **deux côtés** (rang exact du premier 429), la **bonne** branche parmi les quatre qui renvoient 400, et le **bon** message d'échec de `totalCents`. | **non appliquée** |
| **R3** | `src/lib/shop/stripe.ts` n'a **aucun test direct** : il est mocké partout. `returnBaseUrl()` (utiliser `SITE.url` en production, jamais l'en-tête `Host` — protection contre l'open redirect après paiement) n'est donc couvert par rien. | Un test unitaire de cette seule fonction fermerait un trou de sécurité réel sans toucher au SDK. | **non appliquée** |
| **R4** | Le `TODO(kit)` en tête de `api/contact/route.test.ts` dit « quand `deliver()` sera branché » — or `deliver()` **est** branché sur Resend. Le 503 attendu vient de l'absence de `RESEND_API_KEY` en CI, pas d'un code non écrit. | Un commentaire qui décrit un état dépassé finit par tromper le prochain agent (règle « la doc dit la vérité »). | **non appliquée** |

## Checklist avant de dire « testé »

- [ ] Le fichier testé est du **backend** (route API, schéma partagé, logique `src/lib/shop/`). Sinon : pas de test.
- [ ] Le test vit **à côté** du fichier testé et commence par `// @vitest-environment node`.
- [ ] Cas nominal + au moins un échec métier + les bornes déclarées + les effets de bord observables.
- [ ] Les frontières (Stripe, Resend) sont **mockées** ; aucune classe d'erreur n'a été déplacée dans un module mocké.
- [ ] **Zéro assertion fantôme** : aucune assertion seule en `toBeDefined` / `toBeTruthy` / `not.toThrow`.
- [ ] Sur une route : le **statut ET le corps** sont assertés ; les en-têtes de contrat aussi (`Retry-After`).
- [ ] Les valeurs sont **plausibles** et dérivent de la source de vérité (`PRODUCT`, `totalCents`, constantes exportées).
- [ ] **Aucune date fixe** : temps relatif, ou temps injecté / `vi.setSystemTime` avec restauration.
- [ ] **Aucune dépendance à l'ordre** : identifiant neuf par requête (IP, `event.id`) ; identifiant fixe seulement si le test porte sur la répétition ; mocks et env restaurés.
- [ ] Chaque test est nommé par le **comportement**, en français.
- [ ] Aucun test n'a été écrit contre une persistance : il n'y en a pas, et il ne doit pas y en avoir.
- [ ] `npm run test` est vert **et** a été réellement lancé (44 tests aujourd'hui) — puis le reste du gate (`web-quality-gate`).
