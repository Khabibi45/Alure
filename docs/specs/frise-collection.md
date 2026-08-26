# Spec — Frise « collection » au-dessus du carrousel 3D

Statut : `retirée` — consigne Camil du 2026-08-20 : la frise disparaît de l'accueil ; l'offre
se raconte désormais par les DEUX boutons du carrousel (« Ajouter au panier » + « Acheter »)
et leur ligne de statut (`CartActions` dans `LureCarousel.tsx`). Le panier-compteur
(`use-collection-selection`, `collection-selection.ts`) et l'entonnoir restent en place.
Historique : `livrée` — validée le 2026-08-12 (décisions Camil : collector renommé « Pirate »,
frise placée au-dessus des leurres 3D dans le carrousel). Périmètre étendu le même jour
sur consigne Camil : bouton « Ajouter au panier » après les specs de la fiche, qui met la
frise à jour aussitôt.
Date : 2026-08-12

> Consigne de Camil : une frise au-dessus des leurres 3D pour pousser à l'achat du pack
> complet et à l'obtention du leurre collector — puis : « après les specs du leurre, fais
> un bouton ajouter au panier qui mettra à jour automatiquement la frise ».

## 1. Exigences (le quoi & le pourquoi)

- **Problème / valeur** : le carrousel de l'accueil montre les 4 leurres (3 coloris vendables
  + le collector) mais **ne dit pas l'offre** au moment où l'attention est maximale. La frise
  raconte, sous les yeux des modèles 3D : « réunissez les 3 coloris → le collector est offert »,
  et route vers la page produit avec la collection présélectionnée.
- **Vérité produit (source unique, `src/lib/shop/product.ts`)** : le collector s'appelle
  aujourd'hui **« Noir collector »** (`PRODUCT.collector.label`). Il ne se vend pas, il
  s'obtient avec la collection (43,98 € = 2 × 21,99 €). ⚠️ « Pirate » n'existe nulle part dans
  le produit : si Camil veut ce nom, on change **une ligne** (`collector.label`) et il se
  propage partout (Stripe, emails, carrousel, page produit). Décision produit à valider —
  la frise n'inventera pas un nom qui n'est pas dans la source.
- **Critères d'acceptation** (observables) :
  - [ ] La frise montre 4 jalons : les 3 coloris + le collector **verrouillé** (cadenas,
        jamais « épuisé »), avec la mention « offert avec la collection ».
  - [ ] Le jalon du coloris actuellement affiché dans le carrousel est mis en évidence, et
        suit la navigation du carrousel (flèches, balayage).
  - [ ] Le CTA mène à `/leurre` avec l'offre **collection** présélectionnée, et le prix
        affiché est celui de `OFFERS.collection` (jamais un chiffre écrit à la main).
  - [ ] Au clavier : la frise est atteignable, le CTA focusable, ordre de tabulation logique.
  - [ ] `prefers-reduced-motion` : aucune animation de la frise, mise en évidence instantanée.
- **Hors-scope** : prix barrés ou « valeur totale » fictive (interdits par
  `offre-collection.md` §1) ; toute mention de stock ou d'urgence ; refonte du carrousel.

## 2. Design (le comment, avant le code)

- **Contenu réel** : tout dérive de `PRODUCT` / `OFFERS` (labels, prix, « offert ») — zéro
  texte dupliqué. Copies conformes à `UI-COPY.md`.
- **Tension DA à trancher** : le hero est « territoire de marque — aucun texte posé sur
  l'image » (`Hero.tsx`). Le titre du coloris au-dessus du carrousel (branche `lot8`) a déjà
  entrouvert cette porte. Deux placements possibles :
  - **A. Dans `LureCarousel`, au-dessus du canvas** (avec le titre LOT8) : l'histoire se lit
    au bon moment, mais charge le territoire de marque. Version ultra-compacte exigée
    (une ligne de pastilles + une ligne de texte).
  - **B. Bandeau immédiatement sous le hero** : territoire de marque intact, message un cran
    plus tard. Moins efficace, plus sobre.
- **Sections / composants** : `src/components/sections/home/CollectionStrip.tsx` (client —
  synchronisée avec l'index du carrousel). Réutilise la grammaire visuelle d'`OfferProgress`
  (pastilles, cadenas `lucide`, jauge qui se remplit une fois) en version horizontale.
- **États** : purement statique côté données (pas de fetch) → pas de loading/erreur. Le seul
  état est l'index du carrousel, déjà détenu par `LureCarousel` (à remonter/partager).
- **SEO** : aucun impact (accueil existant). Texte réel dans le DOM, lisible par les robots.
- **Images** : pastilles = points colorés CSS ou mini-rendus déjà existants (`/produit/*.webp`
  redimensionnés via `next/image`) — aucun nouvel asset fournisseur.
- **Animations** : mise en évidence du jalon actif (fondu court, tokens `motion.ts`) ;
  remplissage éventuel de la liaison entre jalons **une seule fois** ; `reduced-motion` → tout
  est affiché tel quel.
- **Tiers** : aucun.
- **Responsive** : 375 px = 4 pastilles + une ligne de texte + CTA ; desktop = pastilles avec
  labels visibles. La frise ne crée jamais de défilement horizontal.
- **Dépendance de branche** : s'implémente sur `lot8-splash-carrousel` (le titre au-dessus du
  carrousel y vit déjà) — pas sur `main` tant que LOT8 n'est pas fusionné.

## 3. Tâches (tranches verticales)

- [x] T1 — Décisions : « Pirate » (une ligne, `PRODUCT.collector.label`, se propage partout,
      y compris `{collector}` des dictionnaires) ; placement A (au-dessus des leurres).
- [x] T2 — Présélection `/leurre?offre=…&coloris=…` : `parsePreselection()` dans
      `checkout-schema.ts` (schéma partagé, champ par champ, coloris épuisé écarté) + tests.
- [x] T3 — `CollectionStrip` + sélection « panier » : `collection-selection.ts` (résolution
      1 → solo, 2+ → collection — jamais d'option dominée) + `use-collection-selection.ts`
      (`useSyncExternalStore` sur sessionStorage : revient d'un aller-retour /leurre sans
      écart d'hydratation) + bouton `AddToCollection` dans le pied de la fiche (`LureSpecs
      footer`) — la frise se met à jour au clic. Tests de la résolution.
- [x] T4 — Copies charte (une phrase par état, zéro urgence fabriquée), jalons focusables,
      `aria-live` sur le message, `px-pop` une fois au déblocage (motion-safe).

## 4. Vérification

- **Tests** : le paramètre d'offre de `/leurre` (valide, invalide, absent) ; le mapping
  jalon ↔ coloris depuis `LURE_MODELS` (le collector est bien le seul verrouillé).
- **Gate** : `web-quality-gate` complet + navigateur réel 375 px/desktop + parcours clavier.
- **Audits concernés** : a11y, qualité de code. Pas de nouvelle surface sécurité.
