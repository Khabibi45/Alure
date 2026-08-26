import type { ContactMessages } from '@/lib/contact-schema'

/**
 * TOUS les textes du formulaire de contact, tels qu'ils traversent la frontière
 * serveur → client.
 *
 * Pourquoi ce type vit ici et pas dans `src/lib/i18n/` : c'est le CONTRAT du
 * composant qui les consomme (`ContactForm`, `'use client'`). Le serveur les
 * prépare (`contactStrings()` dans `src/lib/i18n/contact-strings.ts`) et les
 * passe en props — un composant client ne peut pas appeler `getDictionary`, qui
 * embarquerait les deux dictionnaires entiers dans le bundle navigateur
 * (CLAUDE.md, règle Alure n°6).
 *
 * Ce type est la raison pour laquelle `/en/contact` cessait d'être anglais au
 * premier champ : jusqu'ici `ContactForm` ne recevait AUCUNE prop, et tous ses
 * libellés — jusqu'aux refus du schéma zod — étaient écrits en français en dur.
 *
 * Aucun gabarit à `{placeholders}` ici : le formulaire n'affiche aucune valeur
 * calculée au clic. Les chaînes arrivent donc prêtes à poser.
 */
export type ContactStrings = {
  /* ── Les champs ── */
  readonly emailLabel: string
  readonly orderNumberLabel: string
  /** La mention discrète à côté du libellé : « (facultatif) ». */
  readonly orderNumberOptional: string
  readonly messageLabel: string
  /** Le libellé du champ piège, hors écran mais lu par les robots. */
  readonly honeypotLabel: string

  /* ── Le bouton ── */
  readonly submit: string
  readonly sending: string

  /* ── L'issue de l'envoi ── */
  readonly successTitle: string
  readonly successDetail: string
  /**
   * Les trois refus possibles, choisis sur le STATUT HTTP et non sur le corps de
   * la réponse : la route répond en français à tout le monde (elle ne connaît
   * pas la langue de la page), et relayer son texte remettait du français sous
   * un formulaire anglais.
   */
  readonly error: string
  readonly errorOffline: string
  readonly errorRateLimit: string
  readonly errorUnavailable: string

  /**
   * Les messages du schéma zod partagé, dans la langue de la page. Le composant
   * en fabrique son schéma (`createContactSchema`) : mêmes règles que la route
   * API, autres mots.
   */
  readonly validation: ContactMessages
}
