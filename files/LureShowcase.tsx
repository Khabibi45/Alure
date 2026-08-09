import { Suspense, type ReactElement } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';

import { LURES } from '../config/swim.config';
import { SwimmingLure } from './SwimmingLure';

/**
 * Rôle : scène complète, montable telle quelle dans une page.
 *
 * Réglages non négociables ici :
 *  - `dpr={[1, 2]}` : sur un écran Retina, le rendu par défaut à devicePixelRatio 3
 *    multiplie le nombre de pixels par 9. Plafonner à 2 est invisible et divise la
 *    charge fragment par plus de deux.
 *  - `<Environment>` : les leurres sont métalliques/vernis. Sans map d'environnement,
 *    un matériau à `metalness` élevé ne réfléchit rien et rend NOIR. Les lumières
 *    ponctuelles seules ne suffisent pas.
 *  - `<Suspense>` : `useGLTF` suspend pendant le téléchargement. Sans frontière, React
 *    remonte la suspension jusqu'à la racine de l'app.
 */

/** Espacement horizontal entre deux leurres, en unités monde (leurre normalisé = 2 de long). */
const LURE_SPACING = 2.6;

/** Décalage de phase entre leurres consécutifs, en secondes. */
const PHASE_STEP = 0.7;

function LureRow(): ReactElement {
  const offset = ((LURES.length - 1) * LURE_SPACING) / 2;

  return (
    <>
      {LURES.map((lure, index) => (
        <SwimmingLure
          key={lure.id}
          url={lure.url}
          preset={lure.preset}
          position={[0, index * -1.2, index * LURE_SPACING - offset]}
          rotation={lure.rotation ?? [0, 0, 0]}
          phaseOffset={index * PHASE_STEP}
        />
      ))}
    </>
  );
}

export function LureShowcase(): ReactElement {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [6, 2, 6], fov: 40 }}
      // `powerPreference` évite que le navigateur choisisse le GPU intégré sur portable.
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0a1a24']} />
      <fog attach="fog" args={['#0a1a24', 8, 22]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />

      <Suspense fallback={null}>
        <LureRow />
        {/* `preset` télécharge un HDR depuis un CDN. En production, self-hoster le .hdr
            et passer `files="/hdr/studio.hdr"` pour ne pas dépendre d'un tiers. */}
        <Environment preset="sunset" />
      </Suspense>

      <OrbitControls enablePan={false} minDistance={3} maxDistance={14} />
    </Canvas>
  );
}

// Précharge dès l'évaluation du module : le téléchargement démarre pendant que React
// monte l'arbre, au lieu d'attendre le premier rendu du Canvas.
for (const lure of LURES) {
  useGLTF.preload(lure.url);
}
