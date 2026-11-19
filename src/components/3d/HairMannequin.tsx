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
        <meshStandardMaterial color="#222630" roughness={0.65} metalness={0.06} />
      </mesh>
      {/* Pescoço */}
      <mesh position={[0, -0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.38, 0.65, 32]} />
        <meshStandardMaterial color="#1c2028" roughness={0.7} metalness={0.06} />
      </mesh>
      {/* Busto/Ombros */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow scale={[1.4, 0.4, 0.8]}>
        <sphereGeometry args={[0.85, 32, 24]} />
        <meshStandardMaterial color="#161920" roughness={0.75} metalness={0.08} />
      </mesh>
    </group>
  );
}

// Medidas anatômicas do manequim:
const HEAD_CENTER: [number, number, number] = [0, 0.45, 0];
const HEAD_RADII: [number, number, number] = [0.9 * 0.82, 0.9 * 1.05, 0.9 * 0.9];

const COLLIDERS: ColliderSpec[] = [
  { center: [0, -0.75 - 0.45, 0], radii: [0.85 * 1.4, 0.85 * 0.4, 0.85 * 0.8], margin: 0.03 },
];

export default function HairMannequin({ hairTypeId }: HairMannequinProps) {
  const rootRef = useRef<THREE.Group>(null);
  const hairPhysicsRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0.9);
  const targetScale = 1;

  // Estados de física secundária para movimento reativo e inércia do cabelo
  const prevCamYaw = useRef<number | null>(null);
  const prevCamPitch = useRef<number | null>(null);

  const yawVelFiltered = useRef(0);
  const pitchVelFiltered = useRef(0);

  // Osciladores de mola e amortecimento (Spring-Damper)
  const hairLagYaw = useRef(0);
  const hairLagVelYaw = useRef(0);

  const hairLagPitch = useRef(0);
  const hairLagVelPitch = useRef(0);

  useFrame(({ camera, clock }, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.08); // estabiliza contra saltos
    const t = clock.getElapsedTime();

    // 1. Idle suave do manequim (leve respiração senoidal)
    const idleYaw = Math.sin(t * 0.7) * 0.025;
    rootRef.current.rotation.y = idleYaw;
    rootRef.current.position.y = Math.sin(t * 1.2) * 0.015 - 0.15;

    // Transição de escala do manequim
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      1 - Math.exp(-dt * 6)
    );
    rootRef.current.scale.setScalar(currentScale.current);

    // 2. Medição da velocidade angular da interação do usuário com a câmera
    // Calcula o azimute (Yaw) e a elevação (Pitch) da câmera em relação ao centro da cabeça
    const camX = camera.position.x;
    const camY = camera.position.y - HEAD_CENTER[1];
    const camZ = camera.position.z;

    const camYaw = Math.atan2(camX, camZ);
    const camDistXZ = Math.sqrt(camX * camX + camZ * camZ);
    const camPitch = Math.atan2(camY, Math.max(camDistXZ, 0.1));

    if (prevCamYaw.current === null) {
      prevCamYaw.current = camYaw;
      prevCamPitch.current = camPitch;
    }

    // Variação angular com unwrap para evitar quebras em +-PI
    let dYaw = camYaw - prevCamYaw.current;
    while (dYaw > Math.PI) dYaw -= Math.PI * 2;
    while (dYaw < -Math.PI) dYaw += Math.PI * 2;
    prevCamYaw.current = camYaw;

    const dPitch = camPitch - prevCamPitch.current!;
    prevCamPitch.current = camPitch;

    // Velocidades instantâneas e filtragem suave
    const instYawVel = dYaw / Math.max(dt, 0.001);
    const instPitchVel = dPitch / Math.max(dt, 0.001);

    yawVelFiltered.current = THREE.MathUtils.lerp(
      yawVelFiltered.current,
      instYawVel,
      1 - Math.exp(-dt * 12)
    );
    pitchVelFiltered.current = THREE.MathUtils.lerp(
      pitchVelFiltered.current,
      instPitchVel,
      1 - Math.exp(-dt * 12)
    );

    // 3. Simulação de Inércia Física com Spring-Damper Elástico
    // Alvos de inércia: o cabelo resiste à aceleração da câmera com resposta nítida
    const targetLagYaw = THREE.MathUtils.clamp(-yawVelFiltered.current * 0.15, -0.22, 0.22);
    const targetLagPitch = THREE.MathUtils.clamp(-pitchVelFiltered.current * 0.12, -0.15, 0.15);

    // Oscilador com retorno elástico visível (sub-amortecido para dar bounce natural)
    const springK = 34.0; // rigidez da mola
    const damping = 3.6; // amortecimento viscoso moderado (permite 2 oscilações de rebote)

    const forceYaw = (targetLagYaw - hairLagYaw.current) * springK - hairLagVelYaw.current * damping;
    hairLagVelYaw.current += forceYaw * dt;
    hairLagYaw.current += hairLagVelYaw.current * dt;
    hairLagYaw.current = THREE.MathUtils.clamp(hairLagYaw.current, -0.22, 0.22);

    const forcePitch = (targetLagPitch - hairLagPitch.current) * springK - hairLagVelPitch.current * damping;
    hairLagVelPitch.current += forcePitch * dt;
    hairLagPitch.current += hairLagVelPitch.current * dt;
    hairLagPitch.current = THREE.MathUtils.clamp(hairLagPitch.current, -0.15, 0.15);

    // 4. Micro-movimento orgânico de repouso (fios com vida mesmo sem arrastar)
    const idleHairYaw = Math.sin(t * 1.5) * 0.016;
    const idleHairRoll = Math.cos(t * 1.2) * 0.014;
    const idleBounce = Math.sin(t * 2.2) * 0.007;

    // 5. Aplicação direta no grupo de física do cabelo
    if (hairPhysicsRef.current) {
      // Giro inercial (Yaw), inclinação centrífuga (Roll) e elevação (Pitch)
      hairPhysicsRef.current.rotation.y = hairLagYaw.current + idleHairYaw;
      hairPhysicsRef.current.rotation.z = hairLagYaw.current * 0.55 + idleHairRoll;
      hairPhysicsRef.current.rotation.x = hairLagPitch.current;

      // Deslocamento transversal em X e rebote elástico em Y
      hairPhysicsRef.current.position.x = hairLagYaw.current * 0.06;
      hairPhysicsRef.current.position.y = HEAD_CENTER[1] + idleBounce - Math.abs(hairLagYaw.current) * 0.025;
      hairPhysicsRef.current.position.z = hairLagPitch.current * 0.035;
    }
  });

  // Pulso de transição ao trocar o tipo
  useEffect(() => {
    currentScale.current = 0.94;
  }, [hairTypeId]);

  // Pré-gera os demais tipos em segundo plano para a troca ser instantânea
  useEffect(() => {
    const timers = HAIR_TYPE_IDS.map((id, i) =>
      window.setTimeout(() => prebuildHair(id, HEAD_RADII, COLLIDERS), 600 + i * 400)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const type = hairTypeId || 'liso';

  return (
    <group ref={rootRef}>
      <BaseHead />
      {/* Grupo com pivô dinâmico no centro da cabeça que aplica a inércia elástica */}
      <group ref={hairPhysicsRef} position={HEAD_CENTER}>
        <Hair type={type} radii={HEAD_RADII} position={[0, 0, 0]} colliders={COLLIDERS} />
      </group>
    </group>
  );
}
