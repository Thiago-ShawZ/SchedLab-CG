import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import HairMannequin from './HairMannequin';
import { HAIR_TYPES } from '@/data/hairTypes';

interface HairHeadViewerProps {
  hairTypeId: string | null;
}

export default function HairHeadViewer({ hairTypeId }: HairHeadViewerProps) {
  const currentTypeName = useMemo(() => {
    return HAIR_TYPES.find((t) => t.id === hairTypeId)?.name || 'Geral';
  }, [hairTypeId]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900/80 to-ink-950"
      role="img"
      aria-label={`Visualização 3D do tipo de cabelo ${currentTypeName}`}
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, 3.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <color attach="background" args={['#0e1015']} />

        {/* Iluminação suave de 3 pontos para retrato/busto */}
        <directionalLight
          position={[2.5, 3.5, 2.5]}
          intensity={1.2}
          color="#fff5ea"
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-3, 1.8, 1.5]} intensity={0.5} color="#c8d8ff" />
        <directionalLight position={[0, 2.5, -3]} intensity={0.4} color="#43c497" />
        <ambientLight intensity={0.35} />

        <Suspense fallback={null}>
          <HairMannequin hairTypeId={hairTypeId} />
        </Suspense>

        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.45}
          scale={3.5}
          blur={2.2}
          far={2.5}
          resolution={256}
        />

        <Environment preset="studio" />

        <OrbitControls
          target={[0, 0.25, 0]}
          enablePan={false}
          minDistance={2.2}
          maxDistance={4.5}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.75}
          minAzimuthAngle={-Math.PI / 2.5}
          maxAzimuthAngle={Math.PI / 2.5}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
        />
      </Canvas>

      <div
        className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-xs text-ink-300 backdrop-blur-sm"
        role="note"
      >
        Arraste para girar
      </div>
    </div>
  );
}
