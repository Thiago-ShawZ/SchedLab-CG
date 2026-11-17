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

// Componente interno que carrega o GLB via useGLTF (compatível com Suspense)
function HairGLBScene({ type }: { type: string }) {
  const path = `/models/hair/hair-${type}.glb`;
  const { scene } = useGLTF(path);

  const { clone, sf, targetY, offsetY, center, hasHead } = useMemo(() => {
    const c = scene.clone(true);
    c.updateMatrixWorld(true);

    // Oculta câmeras, luzes e planos de estúdio que vêm em rigs de personagem
    c.traverse((child) => {
      if ((child as any).isCamera || (child as any).isLight) {
        child.visible = false;
        return;
      }
      if (/stage|floor|ground|backdrop|studio|shadow_plane/i.test(child.name)) {
        child.visible = false;
        return;
      }
    });

    // Detecta se o modelo já inclui cabeça/busto
    let headDetected = false;
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.visible) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if (m) m.side = THREE.DoubleSide;
            });
          } else {
            mesh.material.side = THREE.DoubleSide;
          }
        }
        const mat = mesh.material;
        const matName = Array.isArray(mat)
          ? mat.map((m) => m?.name || '').join(' ')
          : mat?.name || '';
        const meshName = mesh.name || '';
        const isHeadMat =
          /head|face|skin|body|corpo|bust|sclup|sculpt/i.test(matName) &&
          !/hair/i.test(matName);
        const isHeadMesh =
          /head|face|skin|body|corpo|bust|sclup|sculpt/i.test(meshName) &&
          !/hair/i.test(meshName);
        if (isHeadMat || isHeadMesh) {
          headDetected = true;
        }

        // Se o modelo é crespo/seco e não tiver mapa de textura (KHR_materials_pbrSpecularGlossiness legado),
        // aplica acabamento PBR coerente para o busto e os fios
        if (!Array.isArray(mat) && mat && !(mat as any).map) {
          if (/sclup|sculpt/i.test(matName) || /sclup|sculpt/i.test(meshName)) {
            (mat as THREE.MeshStandardMaterial).color = new THREE.Color('#2a2e39');
            (mat as THREE.MeshStandardMaterial).roughness = 0.55;
          } else if (/GoZMesh/i.test(matName)) {
            (mat as THREE.MeshStandardMaterial).color = new THREE.Color(
              type === 'seco' ? '#2b211a' : '#181412'
            );
            (mat as THREE.MeshStandardMaterial).roughness = 0.65;
          }
        }
      }
    });

    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const cntr = new THREE.Vector3();
    box.getCenter(cntr);

    let scaleFactor = 1;
    let tY = 0;
    let offY = 0;

    if (headDetected) {
      // O modelo já inclui cabeça e busto completos (ex: crespo, seco)
      // Normaliza altura total para ~2.45 e apoia a base em Y = -1.05 (alinhando com o manequim)
      const TARGET_BUST_HEIGHT = 2.45;
      scaleFactor = size.y > 0 ? TARGET_BUST_HEIGHT / size.y : 1;
      tY = -1.05;
      offY = -box.min.y;
    } else {
      // O modelo traz apenas o cabelo (ex: liso, ondulado, cacheado, oleoso)
      // Normaliza para encaixar sobre a cabeça do manequim (topo da cabeça Y ~1.40, largura ~1.5)
      const horizontalDim = Math.max(size.x, size.z);
      const TARGET_WIDTH = type === 'cacheado' ? 2.1 : 1.85;
      scaleFactor = horizontalDim > 0 ? TARGET_WIDTH / horizontalDim : 1;
      tY = 1.44;
      offY = -box.max.y;
    }

    if (!isFinite(scaleFactor) || scaleFactor <= 0) scaleFactor = 1;

    return {
      clone: c,
      sf: scaleFactor,
      targetY: tY,
      offsetY: offY,
      center: cntr,
      hasHead: headDetected,
    };
  }, [scene, type]);

  return (
    <>
      {!hasHead && <BaseHead />}
      <group position={[0, targetY, 0]} scale={sf}>
        <primitive object={clone} position={[-center.x, offsetY, -center.z]} />
      </group>
    </>
  );
}

// ErrorBoundary para capturar falha de carregamento do GLB e cair no fallback procedural
class HairGLBErrorBoundary extends React.Component<
  { children: React.ReactNode; type: string; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; type: string; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error(`[HairMannequin] Falha ao carregar hair-${this.props.type}.glb:`, error);
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function HairMannequin({ hairTypeId }: HairMannequinProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0.9);
  const targetScale = 1;
  const [glbFailed, setGlbFailed] = useState(false);

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

  // Dispara pulso de transição e reseta falha ao trocar o hairTypeId
  useEffect(() => {
    currentScale.current = 0.94;
    setGlbFailed(false);
  }, [hairTypeId]);

  const type = hairTypeId || 'liso';

  return (
    <group ref={rootRef}>
      {glbFailed ? (
        <>
          <BaseHead />
          <ProceduralHair type={type} />
        </>
      ) : (
        <React.Suspense
          fallback={
            <>
              <BaseHead />
              <ProceduralHair type={type} />
            </>
          }
        >
          <HairGLBErrorBoundary key={type} type={type} onError={() => setGlbFailed(true)}>
            <HairGLBScene type={type} />
          </HairGLBErrorBoundary>
        </React.Suspense>
      )}
    </group>
  );
}

// Pré-carrega apenas os arquivos leves (< 3 MB) para não bloquear a primeira renderização
useGLTF.preload('/models/hair/hair-liso.glb');
useGLTF.preload('/models/hair/hair-ondulado.glb');
useGLTF.preload('/models/hair/hair-cacheado.glb');
useGLTF.preload('/models/hair/hair-oleoso.glb');
// hair-crespo.glb (~13 MB) e hair-seco.glb (~13.8 MB) NÃO são pré-carregados — só sob demanda
