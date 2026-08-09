'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { contactSchema, type ContactInput } from '@/lib/contact-schema'

type Status = { state: 'idle' } | { state: 'sent' } | { state: 'error'; message: string }

/**
 * Formulaire de contact (charte V.02 §8.12) — schéma zod partagé avec la route.
 * Validation à la soumission puis au blur des champs déjà signalés ; anneau
 * d'erreur non-texte en --color-danger, messages en --color-danger-text.
 * Le message de succès ne promet AUCUN délai de réponse (charte §13.8).
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  async function onSubmit(data: ContactInput) {
    setStatus({ state: 'idle' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null)
        const message =
          typeof body === 'object' && body !== null && 'error' in body
            ? String((body as { error: unknown }).error)
            : 'Votre message n’est pas parti. Réessayez dans un instant.'
        setStatus({ state: 'error', message })
        return
      }
      reset()
      setStatus({ state: 'sent' })
    } catch {
      setStatus({
        state: 'error',
        message: 'Votre message n’est pas parti (connexion interrompue). Réessayez.',
      })
    }
  }

  if (status.state === 'sent') {
    return (
      <div role="status" className="flex items-start gap-3 rounded-card bg-surface p-5 shadow-card">
        <Check className="mt-0.5 size-6 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="font-bold">Votre message est parti.</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Nous répondons à l'adresse indiquée.
          </p>
        </div>
      </div>
    )
  }

  const fieldClass = (invalid: boolean) =>
    `w-full bg-muted text-foreground ${invalid ? 'outline outline-2 outline-danger' : ''}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-email" className="mb-2 block text-[0.8125rem] font-bold">
          Votre email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={`${fieldClass(!!errors.email)} h-12 rounded-full px-5 text-base`}
        />
        {errors.email && (
          <p
            id="contact-email-error"
            role="alert"
            className="mt-2 flex items-center gap-2 text-[0.8125rem] font-medium text-danger-text"
          >
            <CircleAlert className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-order" className="mb-2 block text-[0.8125rem] font-bold">
          Numéro de commande <span className="font-normal text-muted-foreground">(facultatif)</span>
        </label>
        <input
          id="contact-order"
          type="text"
          {...register('orderNumber')}
          className="h-12 w-full rounded-full bg-muted px-5 text-base text-foreground"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-[0.8125rem] font-bold">
          Votre message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={`${fieldClass(!!errors.message)} min-h-30 rounded-row px-5 py-4 text-base leading-relaxed`}
        />
        {errors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-2 flex items-center gap-2 text-[0.8125rem] font-medium text-danger-text"
          >
            <CircleAlert className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot : caché aux humains, rempli par les bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" type="text" tabIndex={-1} {...register('website')} />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </Button>

      {status.state === 'error' && (
        <p role="alert" className="text-sm font-medium text-danger-text">
          {status.message}
        </p>
      )}
    </form>
  )
}
