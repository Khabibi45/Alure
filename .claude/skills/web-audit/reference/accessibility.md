# Audit accessibilité — checklist de référence

Cible : WCAG 2.2 AA sur les parcours réels (lire, naviguer, remplir le formulaire). L'a11y est
structurelle : le HTML sémantique fait 80 % du travail, l'ARIA ne rattrape pas un mauvais balisage.

## 1. Sémantique & structure

- [ ] Landmarks : `<header>`, `<nav>`, `<main>` (un seul), `<footer>` — pas des `<div>` stylés.
- [ ] Hiérarchie de titres complète et sans saut ; le `h1` décrit la page.
- [ ] Listes réelles (`<ul>/<ol>`) pour les énumérations ; boutons `<button>`, liens `<a href>`
      — jamais un `<div onClick>` (repérage : `grep -rn "div.*onClick\|span.*onClick" src/`).
- [ ] Un lien ouvre une page ; un bouton déclenche une action. Pas d'inversion.

## 2. Images & médias

- [ ] `alt` informatif sur toute image porteuse de sens ; `alt=""` sur les décoratives.
- [ ] Icône seule dans un bouton → `aria-label` sur le bouton.
- [ ] Vidéo/animation auto : pause possible, pas de flash, pas d'audio auto.

## 3. Clavier & focus

- [ ] **Parcours complet au clavier** : menu (mobile inclus !), liens, formulaire, modales —
      testé réellement (Tab/Shift-Tab/Entrée/Échap), pas supposé.
- [ ] Focus **visible** partout : aucun `outline-none`/`outline: none` sans remplacement
      (`grep -rn "outline-none\|outline: none" src/`).
- [ ] Ordre de tabulation = ordre visuel ; pas de `tabindex` > 0.
- [ ] Menu mobile : focus contenu dedans quand ouvert, rendu au déclencheur à la fermeture, Échap ferme.
- [ ] Skip link (« aller au contenu ») si la nav dépasse quelques liens.

## 4. Contrastes & lisibilité

- [ ] Texte courant ≥ 4,5:1, grands titres ≥ 3:1 — vérifiés sur les **valeurs réelles des tokens**
      (`globals.css`), y compris texte sur image (voile si besoin) et les deux modes si dark mode.
- [ ] La couleur n'est jamais le **seul** vecteur d'information (état d'erreur = icône/texte aussi).
- [ ] Zoom 200 % : rien ne casse ; base 16px ; pas de `user-scalable=no`.

## 5. Formulaires

- [ ] Chaque champ a son `<label>` associé (htmlFor/id) — pas un placeholder en guise de label.
- [ ] Erreurs : à côté du champ, explicites (cause + geste), liées par `aria-describedby`,
      annoncées (`aria-live="polite"` sur le conteneur d'erreurs).
- [ ] `autocomplete` posé (name, email, tel, organization) ; `inputMode` adapté.
- [ ] Le succès d'envoi est annoncé aussi (pas seulement un changement visuel).
- [ ] Champ honeypot : invisible ET hors tab-order (`tabIndex={-1}`) ET `aria-hidden` — un
      lecteur d'écran ne doit jamais le présenter.

## 6. Mouvement

- [ ] `prefers-reduced-motion` : **chaque** animation a sa version réduite (affichage direct) —
      framer `useReducedMotion()` ou media query CSS. Smooth scroll (lenis) désactivé aussi.
- [ ] Rien ne clignote > 3×/s ; les carrousels auto ont pause.

## 7. Cibles tactiles

- [ ] Interactifs ≥ 44×44px (ou zone de clic étendue) ; espacement suffisant entre liens voisins.
