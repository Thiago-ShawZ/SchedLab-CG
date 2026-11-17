import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Hair, { HAIR_TYPE_IDS, prebuildHair, type ColliderSpec } from './Hair';

interface HairMannequinProps {
  hairTypeId: string | null;
}

// Cabeça e Busto Base do Manequim
function BaseHead() {
  return (
    <group>
      {/* Cabeça */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow scale={[0.82, 1.05, 0.9]}>
        <sphereGeometry args={[0.9, 36, 36]} />
        <meshStandardMaterial color="#2a2e39" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Pescoço */}
      <mesh position={[0, -0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.38, 0.65, 32]} />
        <meshStandardMaterial color="#222630" roughness={0.6} metalness={0.08} />
      </mesh>
      {/* Busto/Ombros */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow scale={[1.4, 0.4, 0.8]}>
        <sphereGeometry args={[0.85, 32, 24]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.65} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Medidas do manequim, em relação ao centro da cabeça [0, 0.45, 0]:
// cabeça = esfera r0.9 com scale [0.82, 1.05, 0.9]
const HEAD_CENTER: [number, number, number] = [0, 0.45, 0];
const HEAD_RADII: [number, number, number] = [0.9 * 0.82, 0.9 * 1.05, 0.9 * 0.9];

// Ombros = esfera r0.85 com scale [1.4, 0.4, 0.8] em y = -0.75 (centro da cabeça está em y = 0.45)
// Os fios deslizam por cima deles em vez de atravessar.
const COLLIDERS: ColliderSpec[] = [
  { center: [0, -0.75 - 0.45, 0], radii: [0.85 * 1.4, 0.85 * 0.4, 0.85 * 0.8], margin: 0.03 },
];

export default function HairMannequin({ hairTypeId }: HairMannequinProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0.9);
  const targetScale = 1;

  // Animação de idle (leve respiração senoidal) e transição de escala
  useFrame(({ clock }, delta) => {
    if (!rootRef.current) return;
    const t = clock.getElapsedTime();
    rootRef.current.rotation.y = Math.sin(t * 0.7) * 0.05;
    rootRef.current.position.y = Math.sin(t * 1.2) * 0.02 - 0.15;

    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      1 - Math.exp(-delta * 6)
    );
    rootRef.current.scale.setScalar(currentScale.current);
  });

  // Pulso de transição ao trocar o tipo
  useEffect(() => {
    currentScale.current = 0.94;
  }, [hairTypeId]);

  // Gera os demais tipos em segundo plano (um por vez) para a troca ser instantânea
  useEffect(() => {
    const timers = HAIR_TYPE_IDS.map((id, i) =>
      window.setTimeout(() => prebuildHair(id, HEAD_RADII, COLLIDERS), 800 + i * 500)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const type = hairTypeId || 'liso';

  return (
    <group ref={rootRef}>
      <BaseHead />
      <Hair type={type} radii={HEAD_RADII} position={HEAD_CENTER} colliders={COLLIDERS} />
    </group>
  );
}
