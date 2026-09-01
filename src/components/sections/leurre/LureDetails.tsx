import { Eye, Sparkles, Sun, Waves, Footprints } from 'lucide-react'
import { getDictionary, t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/paths'

/**
 * « Ce qu'il y a dans le leurre » — les cinq partis pris de fabrication, tels
 * que le vendeur les décrit (consigne Camil du 2026-09-01 : gros yeux,
 * paillettes, barrette d'aluminium, queue articulée striée, palette en patte de
 * canard).
 *
 * Server Component PARTAGÉ par les deux pages produit (`(fr)/leurre` et
 * `[lang]/leurre`) : c'est ce qui empêche la description d'exister en deux
 * exemplaires qui dérivent. Il lit le dictionnaire directement — il n'est pas
 * `'use client'`, donc rien n'atterrit dans le bundle (règle Alure n°6).
 *
 * Ces cinq faits sont des CARACTÉRISTIQUES VÉRIFIÉES sur l'échantillon reçu, pas
 * des arguments : c'est ce qui lève la réserve inscrite jusqu'ici en tête de la
 * page française (« pas de section Caractéristiques tant que les specs ne sont
 * pas vérifiées sur l'échantillon », règle n°6). Aucun chiffre, aucun avis,
 * aucune promesse de résultat de pêche — seulement ce que la pièce contient.
 */
export function LureDetails({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  const details = [
    {
      icon: Eye,
      title: t(dict, 'PRODUCT.DETAIL_EYES_TITLE'),
      body: t(dict, 'PRODUCT.DETAIL_EYES_BODY'),
    },
    {
      icon: Sparkles,
      title: t(dict, 'PRODUCT.DETAIL_GLITTER_TITLE'),
      body: t(dict, 'PRODUCT.DETAIL_GLITTER_BODY'),
    },
    {
      icon: Sun,
      title: t(dict, 'PRODUCT.DETAIL_BLADE_TITLE'),
      body: t(dict, 'PRODUCT.DETAIL_BLADE_BODY'),
    },
    {
      icon: Waves,
      title: t(dict, 'PRODUCT.DETAIL_TAIL_TITLE'),
      body: t(dict, 'PRODUCT.DETAIL_TAIL_BODY'),
    },
    {
      icon: Footprints,
      title: t(dict, 'PRODUCT.DETAIL_PADDLE_TITLE'),
      body: t(dict, 'PRODUCT.DETAIL_PADDLE_BODY'),
    },
  ]

  return (
    <section aria-labelledby="lure-details-title" className="mt-10 md:mt-14">
      <h2
        id="lure-details-title"
        className="text-[1.75rem] leading-[1.1] font-bold tracking-[0.02em] text-balance uppercase md:text-[2.25rem]"
      >
        {t(dict, 'PRODUCT.DETAILS_TITLE')}
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {t(dict, 'PRODUCT.DETAILS_INTRO')}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8 md:gap-6">
        {details.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-card bg-surface p-5 shadow-card"
          >
            <Icon className="mt-0.5 size-6 shrink-0 text-info" strokeWidth={1.75} aria-hidden />
            <div className="space-y-1">
              <p className="font-bold">{title}</p>
              <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
