/**
 * Doublure de `server-only` pour vitest.
 *
 * Le vrai paquet JETTE dès qu'il est importé hors d'un contexte React Server —
 * c'est sa raison d'être : transformer un import client accidentel de
 * `stripe.ts`/`emails.ts` en erreur de BUILD. Les tests node importent ces
 * modules légitimement ; l'alias de `vitest.config.ts` pointe donc ici.
 */
export {}
