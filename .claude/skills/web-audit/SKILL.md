---
name: web-audit
description: >-
  Lance les audits des domaines sensibles d'un site web avant une mise en ligne ou une revue :
  sécurité (headers/CSP, secrets, routes API), performance (images, LCP/CLS, bundle), SEO
  (metadata, sitemap, JSON-LD), accessibilité, RGPD/confidentialité, et qualité de code. À
  invoquer avant la mise en ligne, avant de merger un gros diff, ou dès qu'on veut « vérifier que
  tout est respecté ». Orchestre un audit par domaine (en sous-agents parallèles quand c'est
  possible) et rend des verdicts ancrés fichier:ligne. C'est le filet qui évite de relancer les
  mêmes vérifications à la main à chaque fois.
---

# web-audit — audits des domaines sensibles (parallélisés)

Objectif : **relancer, à l'identique et sans effort, tous les audits critiques** d'un site public.
Chaque domaine a sa **checklist de référence** (dans `reference/`) et rend un **verdict ancré
`fichier:ligne`** — jamais un « ça a l'air ok » vague.

## Les 6 domaines

| Domaine | Référence | Ce qu'il attrape |
|---|---|---|
| Sécurité | [reference/security.md](reference/security.md) | CSP incomplète, secret exposé, route API non validée, `dangerouslySetInnerHTML`, deps vulnérables |
| Performance | [reference/performance.md](reference/performance.md) | Images lourdes/mal dimensionnées, LCP/CLS, fonts, JS inutile, animations coûteuses |
| SEO | [reference/seo.md](reference/seo.md) | Metadata manquante/dupliquée, sitemap/robots incohérents, JSON-LD, 301 absents, OG cassés |
| Accessibilité | [reference/accessibility.md](reference/accessibility.md) | Sémantique, alt, contrastes, clavier, focus, reduced-motion, formulaires |
| RGPD / confidentialité | [reference/privacy-rgpd.md](reference/privacy-rgpd.md) | Trackers avant consentement, fonts non self-hosted, pages légales, minimisation |
| Qualité de code | [reference/code-quality.md](reference/code-quality.md) | `any`/ts-ignore, composants monstres, duplication, code mort, TODO(kit) restants |

## Comment lancer l'audit

**Mode recommandé — sous-agents en parallèle** (protège ton contexte, va plus vite) :

1. Pour **chaque** domaine demandé (par défaut : les 6), lance **un sous-agent** (outil Agent,
   type `Explore` ou `general-purpose`, en lecture seule) avec cette consigne :
   > « Audite le domaine **<domaine>** de ce site Next.js. Lis la checklist
   > `.claude/skills/web-audit/reference/<domaine>.md`, applique-la au code réel, et renvoie
   > UNIQUEMENT les problèmes trouvés, chacun avec : `fichier:ligne`, sévérité (bloquant / à
   > corriger / mineur), le scénario d'échec concret, et la correction suggérée. Aucun problème →
   > dis-le. N'invente rien : si tu n'es pas sûr, marque `à vérifier`. »
2. Lance-les **en parallèle** (plusieurs appels Agent dans le même tour).
3. Quand tous ont répondu, **agrège** en un tableau unique trié par sévérité (bloquants d'abord),
   groupé par domaine.

**Mode dégradé — sans sous-agents** : déroule toi-même les 6 checklists, une par une, avec les
mêmes verdicts ancrés.

**Complément runtime (recommandé avant mise en ligne)** : les checklists sont statiques ; la
performance et l'a11y réelles se mesurent aussi en runtime — `npm run build && npm run start`
puis Lighthouse (mobile) sur les pages clés. Objectif : **≥ 90 en Performance / SEO / A11y /
Best Practices** (le site précédent a payé cher pour passer de 61 à 85 — viser 90 dès le départ).

## Faits web volatils

Les règles bougent (CSP/Next, RGPD/consentement, Core Web Vitals). Avant un verdict « conforme »
sur ces points, confronte à `docs/standards/WEB-REFERENCE.md` et, au moindre doute, à la doc
officielle (WebFetch). Ne certifie jamais « conforme » de mémoire.

## Format du rapport final

Un tableau, bloquants en premier :

```
| Sévérité   | Domaine   | fichier:ligne          | Problème                  | Correction        |
|------------|-----------|------------------------|---------------------------|-------------------|
| BLOQUANT   | Sécurité  | next.config.ts:44      | CSP sans frame-ancestors  | Ajouter…          |
```

Puis un **verdict global** : `✅ prêt` seulement si **zéro bloquant**. Sinon `❌` + la liste courte
de ce qui reste. Règle anti-mensonge : ne déclare jamais « conforme » un domaine que tu n'as pas
réellement inspecté ; si non vérifié, écris « non vérifié ».

## Quand relancer

- **Avant chaque mise en ligne** : les 6 + Lighthouse.
- **Après un gros diff / avant un merge** : au moins sécurité + les domaines touchés.
- **Après tout ajout de service tiers** : sécurité (CSP) + RGPD, systématiquement.
- **En routine** : sécurité + RGPD sont les moins chers à passer souvent.
