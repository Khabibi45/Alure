import { useRef, type ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import {
  BOB_FREQUENCY_RATIO,
  ROLL_FREQUENCY_RATIO,
  SWIM_PRESETS,
  YAW_FREQUENCY_RATIO,
  type SwimPresetName,
} from '../config/swim.config';
import { useLureModel } from '../hooks/useLureModel';

/**
 * Rôle : afficher un leurre et l'animer.
 *
 * Séparation des deux étages de mouvement, qui est ce qui rend la nage crédible :
 *
 *   ÉTAGE 1 — DÉFORMATION (GPU, dans le shader) : l'onde qui parcourt le corps.
 *   ÉTAGE 2 — CORPS RIGIDE (CPU, ici) : roulis, lacet et oscillation verticale du leurre
 *             entier, à des fréquences non commensurables de l'onde.
 *
 * Un seul étage ne suffit jamais : la déformation seule donne un poisson qui ondule mais
 * reste scotché dans l'air ; le mouvement de corps seul donne un objet rigide qu'on secoue.
 * C'est le battement entre les deux qui se lit comme de la nage.
 *
 * Coût CPU par frame et par leurre : 4 écritures de float. Toute la déformation
 * (70 000 à 84 000 sommets) est faite par le GPU.
 *
 * Structure à DEUX groupes, et pas un seul : le groupe externe porte le placement statique
 * (position, correction d'orientation) fourni par le parent, le groupe interne est réécrit
 * à chaque frame. Les fusionner ferait écraser la `rotation` du parent par l'animation.
 */

export interface SwimmingLureProps {
  readonly url: string;
  readonly preset: SwimPresetName;
  readonly position?: readonly [number, number, number];
  readonly rotation?: readonly [number, number, number];
  /**
   * Décalage temporel initial, en secondes. Deux leurres affichés côte à côte démarreraient
   * sinon exactement en phase, ce qui trahit immédiatement le caractère procédural.
   */
  readonly phaseOffset?: number;
}

export function SwimmingLure({
  url,
  preset,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  phaseOffset = 0,
}: SwimmingLureProps): ReactElement | null {
  const animatedRef = useRef<Group>(null);
  const swimPreset = SWIM_PRESETS[preset];
  const model = useLureModel(url, swimPreset);

  useFrame((state) => {
    const animated = animatedRef.current;
    if (model === null || animated === null) {
      return;
    }

    const time = state.clock.elapsedTime + phaseOffset;

    // Étage 1 : la seule donnée que le shader a besoin de recevoir.
    model.uniforms.uSwimTime.value = time;

    // Étage 2 : la phase du corps est calée sur celle de l'onde (même `speed`), sinon le
    // roulis et l'ondulation dériveraient lentement l'un par rapport à l'autre.
    const phase = time * swimPreset.speed;

    animated.rotation.x = Math.sin(phase * ROLL_FREQUENCY_RATIO) * swimPreset.rollAmplitude;
    animated.rotation.y = Math.sin(phase * YAW_FREQUENCY_RATIO) * swimPreset.yawAmplitude;
    animated.position.y = Math.sin(phase * BOB_FREQUENCY_RATIO) * swimPreset.bobAmplitude;
  });

  if (model === null) {
    return null;
  }

  return (
    <group position={[position[0], position[1], position[2]]} rotation={[rotation[0], rotation[1], rotation[2]]}>
      <group ref={animatedRef}>
        {/* Le Mesh est construit impérativement dans le hook : `primitive` l'insère dans
            le graphe R3F sans que React ne tente d'en gérer le cycle de vie. */}
        <primitive object={model.object} />
      </group>
    </group>
  );
}
