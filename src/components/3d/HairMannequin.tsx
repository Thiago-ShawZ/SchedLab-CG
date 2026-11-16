import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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

// Gerador de mechas procedurais com curvas
function ProceduralHair({ type }: { type: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const { geometries, materialProps } = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];

    // Calota base do couro cabeludo
    const scalp = new THREE.SphereGeometry(0.85, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    scalp.scale(0.88, 1.05, 0.96);
    scalp.translate(0, 0.5, -0.04);
    geos.push(scalp);

    let mat = {
      color: '#1c1613',
      roughness: 0.35,
      metalness: 0.08,
      clearcoat: 0.4,
    };

    if (type === 'liso' || type === 'oleoso') {
      // Mechas longas e retas descendo pelos ombros
      const strandCount = 14;
      for (let i = 0; i < strandCount; i++) {
        const angle = (i / (strandCount - 1)) * Math.PI * 1.1 - Math.PI * 0.05;
        const x = Math.cos(angle) * 0.78;
        const z = -Math.sin(angle) * 0.78;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x * 0.9, 1.1, z * 0.9),
          new THREE.Vector3(x * 1.05, 0.5, z * 1.05),
          new THREE.Vector3(x * 1.08, -0.2, z * 1.08 + 0.05),
          new THREE.Vector3(x * 1.05, -0.75, z * 1.05 + 0.1),
        ]);
        geos.push(new THREE.TubeGeometry(curve, 16, 0.045, 8, false));
      }

      if (type === 'oleoso') {
        mat = {
          color: '#120f0e',
          roughness: 0.12,
          metalness: 0.28,
          clearcoat: 0.95,
        };
      }
    } else if (type === 'ondulado') {
      // Mechas em formato de ondas suaves (curvas em S)
      const strandCount = 16;
      for (let i = 0; i < strandCount; i++) {
        const angle = (i / (strandCount - 1)) * Math.PI * 1.15 - Math.PI * 0.08;
        const x = Math.cos(angle) * 0.82;
        const z = -Math.sin(angle) * 0.82;
        const wave = (i % 2 === 0 ? 1 : -1) * 0.08;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x * 0.9, 1.15, z * 0.9),
          new THREE.Vector3(x * 1.1 + wave, 0.6, z * 1.1),
          new THREE.Vector3(x * 1.15 - wave, 0.0, z * 1.15),
          new THREE.Vector3(x * 1.12 + wave, -0.5, z * 1.12),
          new THREE.Vector3(x * 1.08, -0.75, z * 1.08),
        ]);
        geos.push(new THREE.TubeGeometry(curve, 20, 0.05, 8, false));
      }
      mat = { color: '#221914', roughness: 0.42, metalness: 0.06, clearcoat: 0.35 };
    } else if (type === 'cacheado') {
      // Espirais helicoidais de cachos definidos
      const curlCount = 18;
      for (let i = 0; i < curlCount; i++) {
        const angle = (i / (curlCount - 1)) * Math.PI * 1.2 - Math.PI * 0.1;
        const baseX = Math.cos(angle) * 0.85;
        const baseZ = -Math.sin(angle) * 0.85;
        const points: THREE.Vector3[] = [];
        const turns = 4;
        for (let s = 0; s <= 24; s++) {
          const t = s / 24;
          const y = 1.1 - t * 1.6;
          const r = 0.06 * (1 - t * 0.2);
          const theta = t * Math.PI * 2 * turns;
          points.push(
            new THREE.Vector3(
              baseX * (1 + t * 0.35) + Math.cos(theta) * r,
              y,
              baseZ * (1 + t * 0.35) + Math.sin(theta) * r
            )
          );
        }
        geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.038, 8, false));
      }
      mat = { color: '#18120f', roughness: 0.55, metalness: 0.05, clearcoat: 0.2 };
    } else if (type === 'crespo') {
      // Volume afro marcante com agrupamento esférico de cachos compactos
      const afroSpheres = [
        [0, 0.85, -0.1, 0.58],
        [-0.5, 0.65, -0.1, 0.48],
        [0.5, 0.65, -0.1, 0.48],
        [-0.35, 0.85, 0.2, 0.44],
        [0.35, 0.85, 0.2, 0.44],
        [0, 0.95, 0.1, 0.5],
        [0, 0.5, -0.45, 0.52],
        [-0.55, 0.35, -0.2, 0.42],
        [0.55, 0.35, -0.2, 0.42],
      ];
      afroSpheres.forEach(([x, y, z, r]) => {
        const s = new THREE.SphereGeometry(r, 20, 16);
        s.translate(x, y, z);
        geos.push(s);
      });
      mat = { color: '#130e0c', roughness: 0.78, metalness: 0.02, clearcoat: 0.1 };
    } else if (type === 'seco') {
      // Fios mais abertos e espalhados (frizz)
      const strandCount = 18;
      for (let i = 0; i < strandCount; i++) {
        const angle = (i / (strandCount - 1)) * Math.PI * 1.2 - Math.PI * 0.1;
        const x = Math.cos(angle) * 0.85;
        const z = -Math.sin(angle) * 0.85;
        const spread = ((i % 3) - 1) * 0.12;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x * 0.9, 1.15, z * 0.9),
          new THREE.Vector3(x * (1.1 + spread * 0.5), 0.5, z * 1.1),
          new THREE.Vector3(x * (1.25 + spread), -0.1, z * 1.25),
          new THREE.Vector3(x * (1.35 + spread), -0.65, z * 1.35),
        ]);
        geos.push(new THREE.TubeGeometry(curve, 18, 0.04, 8, false));
      }
      mat = { color: '#2b211a', roughness: 0.88, metalness: 0.01, clearcoat: 0.05 };
    }

    return { geometries: geos, materialProps: mat };
  }, [type]);

  return (
    <group ref={groupRef}>
      {geometries.map((geo, idx) => (
        <mesh key={idx} geometry={geo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={materialProps.color}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
            clearcoat={materialProps.clearcoat}
            clearcoatRoughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Componente para tentar carregar GLB customizado de /models/hair/hair-{id}.glb
function CustomHairGLB({ path, fallback }: { path: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);

  // Tenta pré-carregar; se falhar cai no fallback procedural
  useEffect(() => {
    fetch(path, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [path]);

  if (failed) return <>{fallback}</>;

  return (
    <React.Suspense fallback={fallback}>
      <LoadedGLB path={path} onError={() => setFailed(true)} fallback={fallback} />
    </React.Suspense>
  );
}

function LoadedGLB({
  path,
  onError,
  fallback,
}: {
  path: string;
  onError: () => void;
  fallback: React.ReactNode;
}) {
  try {
    const { scene } = useGLTF(path);
    return <primitive object={scene.clone(true)} />;
  } catch {
    onError();
    return <>{fallback}</>;
  }
}

export default function HairMannequin({ hairTypeId }: HairMannequinProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0.9);
  const targetScale = 1;

  // Animação de idle (leve respiração senoidal) e transição de escala
  useFrame(({ clock }, delta) => {
    if (!rootRef.current) return;
    const t = clock.getElapsedTime();
    // Leve oscilação natural de idle
    rootRef.current.rotation.y = Math.sin(t * 0.7) * 0.05;
    rootRef.current.position.y = Math.sin(t * 1.2) * 0.02 - 0.15;

    // Transição suave de escala ao trocar o tipo
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      1 - Math.exp(-delta * 6)
    );
    rootRef.current.scale.setScalar(currentScale.current);
  });

  // Dispara pulso de transição ao trocar o hairTypeId
  useEffect(() => {
    currentScale.current = 0.94;
  }, [hairTypeId]);

  const type = hairTypeId || 'liso';
  const customGLBPath = `/models/hair/hair-${type}.glb`;

  return (
    <group ref={rootRef}>
      <BaseHead />
      <CustomHairGLB path={customGLBPath} fallback={<ProceduralHair type={type} />} />
    </group>
  );
}
