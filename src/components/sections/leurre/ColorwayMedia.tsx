'use client'

import { useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ColorwayPhoto } from './ColorwayPhoto'
import { ColorwayViewer } from './ColorwayViewer'
import type { LeurreStrings } from './leurre-strings'

type Media = 'photo' | 'modele'

/**
 * LE visuel de la page produit : la photo du coloris OU le leurre en 3D, dans un
 * seul bloc, avec un sélecteur pour passer de l'un à l'autre (consigne Camil,
 * 2026-09-03).
 *
 * Les deux s'empilaient jusqu'ici. C'était deux fois la même chose l'une sous
 * l'autre, et surtout deux façons de regarder qui ne se pratiquent pas en même
 * temps : on veut voir le produit tel qu'il arrive, OU tourner autour. Un
 * sélecteur dit ce choix ; un empilement le subit.
 *
 * ── LA PHOTO EST LE DÉFAUT, ET CE N'EST PAS QU'UN GOÛT ──
 *
 * La scène 3D pèse une douzaine de mégaoctets par coloris. Empilée, elle se
 * chargeait à l'ouverture de la page, pour tout le monde. Derrière le sélecteur,
 * elle ne se télécharge que si le visiteur la demande — et c'est la page qui
 * VEND, celle où le premier affichage compte le plus.
 *
 * L'état vit ici et nulle part ailleurs : `ColorwayViewer` est démonté quand on
 * repasse en photo, donc il n'y a pas deux scènes WebGL qui se disputent le GPU.
 */
export function ColorwayMedia({ strings }: { strings: LeurreStrings }) {
  const [media, setMedia] = useState<Media>('photo')

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        ariaLabel={strings.mediaLabel}
        value={media}
        onChange={setMedia}
        options={[
          { value: 'photo', label: strings.mediaPhoto },
          { value: 'modele', label: strings.mediaModel },
        ]}
        className="px-seg--sm"
      />

      {media === 'photo' ? (
        <ColorwayPhoto strings={strings} />
      ) : (
        <ColorwayViewer strings={strings} />
      )}
    </div>
  )
}
