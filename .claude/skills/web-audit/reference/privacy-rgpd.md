# Audit RGPD / confidentialité — checklist de référence

Posture du kit : **le meilleur consentement est celui dont on n'a pas besoin** — zéro cookie non
essentiel, analytics respectueux ou rien, fonts self-hosted. Tout écart se paie en bannière, en
maintenance et en risque.

## 1. Cookies & trackers

- [ ] Inventaire réel : ouvrir le site, onglet réseau + cookies. **Aucun cookie non essentiel posé
      avant un consentement explicite** (pas de GA/pixel/embed qui se charge au premier paint).
- [ ] S'il y a des trackers : bannière de consentement **bloquante pour ces scripts** (refus aussi
      simple que l'accord, pas de dark pattern), choix persisté, script chargé APRÈS accord
      seulement. (Une bannière qui s'affiche pendant que GA tourne déjà = non conforme.)
- [ ] Analytics : privilégier sans cookie (Plausible, Umami) → pas de bannière nécessaire.
      Le domaine du service est dans la CSP **et** dans la politique de confidentialité.
- [ ] Embeds tiers (YouTube, Maps, Calendly) : version « privacy » (youtube-nocookie) ou
      chargement au clic (façade) — jamais l'iframe pleine au chargement.

## 2. Fonts & ressources

- [ ] **Fonts self-hosted via `next/font`** — un `<link>` Google Fonts au runtime transmet l'IP
      du visiteur à Google (jurisprudence UE) : interdit.
- [ ] Aucun CDN tiers pour les assets propres (JS/CSS/images du site servis par le site).

## 3. Pages légales (v1, pas « plus tard »)

- [ ] **Mentions légales** : identité de l'éditeur (micro-entreprise : nom, SIREN si exigible,
      contact), hébergeur (nom + adresse).
- [ ] **Politique de confidentialité** : quelles données, finalité, base légale, durée de
      conservation, destinataires (dont chaque service tiers réel), droits + contact pour les exercer.
- [ ] **Politique cookies** si cookies non essentiels.
- [ ] Accessibles depuis le footer de chaque page, dans le sitemap (priorité basse), et le contenu
      correspond à la **réalité technique du site** (un tiers ajouté = politique mise à jour).
- [ ] Textes légaux : jamais « réécrits pour le style » (charte UI-COPY, corollaire).

## 4. Formulaires & données

- [ ] **Minimisation** : chaque champ du schéma zod se justifie par la finalité. Un champ « au cas
      où » se supprime.
- [ ] Le visiteur sait ce qui est fait de ses données (mention courte sous le formulaire + lien
      politique). Pas de case pré-cochée d'inscription à quoi que ce soit.
- [ ] Où vont les données ? Chaque destinataire (email, webhook, CRM) est listé dans la politique.
      Destinataire hors UE = vérifier l'encadrement (clauses/DPF).
- [ ] Pas de donnée personnelle dans les **logs** serveur (`grep -rn "console.log\|console.error" src/app/api/` :
      on logge l'erreur, jamais le payload complet), ni dans les **URLs** (query params).

## 5. Divers

- [ ] `.env.local` jamais committé ; pas de dump de données réelles dans le repo (fixtures = fausses données évidentes).
- [ ] Si envoi d'emails : le fournisseur (Resend…) est dans la politique ; adresse d'expédition réelle.
- [ ] Pas de collecte cachée (fingerprinting, session recording) — si un jour souhaité : consentement explicite d'abord.
