import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlaceholderBottleProps {
  color?: string;
  labelColor?: string;
  shape?: 'bottle' | 'tube' | 'jar' | 'dropper';
  hovered?: boolean;
  selected?: boolean;
  scale?: number;
  clippingPlanes?: THREE.Plane[];
}

const EMISSIVE_HOVER = new THREE.Color('#43c497');
const EMISSIVE_SELECTED = new THREE.Color('#1fa87d');

export default function PlaceholderBottle({
  color = '#1fa87d',
  labelColor = '#ffffff',
  shape = 'bottle',
  hovered = false,
  selected = false,
  scale = 1,
  clippingPlanes,
}: PlaceholderBottleProps) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const currentEmissive = useRef(0);

  // Animação suave de hover e seleção via interpolação exponencial (lerp delta)
  useFrame((_, delta) => {
    const target = selected ? 0.35 : hovered ? 0.18 : 0;
    const emissiveAnimating = Math.abs(currentEmissive.current - target) > 0.005;
    const targetOpacity = hovered || selected ? 0.95 : 0.86;

    if (!emissiveAnimating && Math.abs((materialRef.current?.opacity ?? 0.86) - targetOpacity) < 0.005) {
      return;
    }

    currentEmissive.current = THREE.MathUtils.lerp(
      currentEmissive.current,
      target,
      1 - Math.exp(-delta * 8)
    );

    if (materialRef.current) {
      const c = selected ? EMISSIVE_SELECTED : EMISSIVE_HOVER;
      materialRef.current.emissive.copy(c);
      materialRef.current.emissiveIntensity = currentEmissive.current;
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        1 - Math.exp(-delta * 8)
      );
    }
  });

  /*
   * Computação Gráfica / Modelagem Paramétrica:
   * Geometrias otimizadas para embalagens cosméticas:
   * - bottle: corpo levemente cônico com ombros suaves e bocal rosqueado
   * - tube: bisnaga cônica invertida com extremidade superior prensada (crimp)
   * - jar: pote cilíndrico de boca larga com tampa biselada
   * - dropper: frasco esguio de vidro com colar metálico e bulbo de sucção
   */
  const config = useMemo(() => {
    switch (shape) {
      case 'tube':
        return {
          bodyGeo: new THREE.CylinderGeometry(0.42, 0.32, 1.05, 64),
          bodyPos: [0, 0.1, 0] as [number, number, number],
          labelY: 0.1,
          labelZ: 0.38,
          labelW: 0.44,
          labelH: 0.48,
        };
      case 'jar':
        return {
          bodyGeo: new THREE.CylinderGeometry(0.58, 0.54, 0.62, 64),
          bodyPos: [0, -0.05, 0] as [number, number, number],
          labelY: -0.05,
          labelZ: 0.57,
          labelW: 0.58,
          labelH: 0.32,
        };
      case 'dropper':
        return {
          bodyGeo: new THREE.CylinderGeometry(0.26, 0.28, 1.15, 64),
          bodyPos: [0, -0.08, 0] as [number, number, number],
          labelY: -0.08,
          labelZ: 0.285,
          labelW: 0.34,
          labelH: 0.54,
        };
      case 'bottle':
      default:
        return {
          bodyGeo: new THREE.CylinderGeometry(0.36, 0.44, 0.98, 64),
          bodyPos: [0, -0.08, 0] as [number, number, number],
          labelY: -0.08,
          labelZ: 0.41,
          labelW: 0.48,
          labelH: 0.44,
        };
    }
  }, [shape]);

  const planes = clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes : undefined;

  return (
    <group scale={scale}>
      {/* ================= CORPO PRINCIPAL ================= */}
      {/* 
        * Material PBR Physical:
        * - Clearcoat: simula camada externa de laca/resina transparente polida
        * - Roughness baixa: realça especularidade dos mapas de ambiente de estúdio
        * - Metalness dielétrico (0.04): reflexão acromática com dispersão difusa colorida
        * - Translucidez com opacidade 86%: efeito plástico leitoso cosmético
        */}
      <mesh
        ref={bodyRef}
        geometry={config.bodyGeo}
        position={config.bodyPos}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          roughness={0.16}
          metalness={0.04}
          clearcoat={0.88}
          clearcoatRoughness={0.12}
          transparent
          opacity={0.86}
          envMapIntensity={1.25}
          clippingPlanes={planes}
          clipShadows
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ================= DETALHES DE FORMA ESPECÍFICOS ================= */}

      {/* 1. BOTTLE: Ombros, Gargalo e Tampa Refinada */}
      {shape === 'bottle' && (
        <group>
          {/* Ombro suave de transição */}
          <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.36, 0.12, 48]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.18}
              metalness={0.04}
              clearcoat={0.85}
              clippingPlanes={planes}
              clipShadows
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Gargalo estreito */}
          <mesh position={[0, 0.54, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 48]} />
            <meshStandardMaterial
              color="#1a1d24"
              roughness={0.4}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Anel de base da tampa */}
          <mesh position={[0, 0.61, 0]} castShadow>
            <cylinderGeometry args={[0.23, 0.23, 0.05, 48]} />
            <meshStandardMaterial
              color="#262a33"
              roughness={0.25}
              metalness={0.2}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Tampa principal com chanfro */}
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.21, 0.22, 0.22, 48]} />
            <meshStandardMaterial
              color="#1e222a"
              roughness={0.28}
              metalness={0.15}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
        </group>
      )}

      {/* 2. TUBE: Borda selada no topo (crimpagem) e Tampa Flip-Top na base */}
      {shape === 'tube' && (
        <group>
          {/* Crimpagem superior frisada */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.74, 0.06, 0.05]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.3}
              metalness={0.05}
              clearcoat={0.5}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Tampa flip-top chanfrada na base */}
          <mesh position={[0, -0.48, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.31, 0.34, 0.16, 48]} />
            <meshStandardMaterial
              color="#1e222a"
              roughness={0.32}
              metalness={0.1}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Base da tampa de apoio */}
          <mesh position={[0, -0.58, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.06, 48]} />
            <meshStandardMaterial
              color="#14171d"
              roughness={0.4}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
        </group>
      )}

      {/* 3. JAR: Tampa larga e Friso Metálico de Luxo */}
      {shape === 'jar' && (
        <group>
          {/* Gargalo do pote */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.54, 0.54, 0.06, 48]} />
            <meshStandardMaterial
              color="#1a1d24"
              roughness={0.4}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Anel metálico dourado de destaque estético */}
          <mesh position={[0, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.59, 0.59, 0.04, 64]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.2}
              metalness={0.85}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Tampa rosqueada do pote com topo suave */}
          <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.58, 0.59, 0.18, 64]} />
            <meshStandardMaterial
              color="#222630"
              roughness={0.26}
              metalness={0.2}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
        </group>
      )}

      {/* 4. DROPPER: Gargalo, Colar Metálico de Luxo e Bulbo de Sucção */}
      {shape === 'dropper' && (
        <group>
          {/* Gargalo de transição */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 0.1, 32]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.18}
              metalness={0.05}
              clearcoat={0.9}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Colar metálico dourado/champanhe */}
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.18, 48]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.22}
              metalness={0.85}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
          {/* Bulbo superior flexível de borracha escura */}
          <mesh position={[0, 0.81, 0]} castShadow scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.12, 32, 24]} />
            <meshStandardMaterial
              color="#16181e"
              roughness={0.55}
              metalness={0.05}
              clippingPlanes={planes}
              clipShadows
            />
          </mesh>
        </group>
      )}

      {/* ================= RÓTULO COM MOLDURA/BORDA SUTIL ================= */}
      {/* 
        * Rótulo (Label):
        * Acabamento fosco/acetinado para contraste físico com o frasco translúcido brilhante.
        * Apresenta uma moldura de borda sutil simulando papel adesivo prensado.
        */}
      {/* Rótulo Frontal */}
      <group position={[0, config.labelY, config.labelZ]}>
        {/* Borda sutil do rótulo */}
        <mesh position={[0, 0, -0.002]} castShadow>
          <planeGeometry args={[config.labelW + 0.03, config.labelH + 0.03]} />
          <meshStandardMaterial
            color="#2a2e3a"
            roughness={0.5}
            metalness={0.1}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
            clipShadows
          />
        </mesh>
        {/* Rótulo frontal principal */}
        <mesh castShadow>
          <planeGeometry args={[config.labelW, config.labelH]} />
          <meshStandardMaterial
            color={labelColor}
            roughness={0.65}
            metalness={0.0}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
            clipShadows
          />
        </mesh>
      </group>

      {/* Rótulo Traseiro com informações */}
      <group position={[0, config.labelY, -config.labelZ]} rotation={[0, Math.PI, 0]}>
        {/* Borda traseira */}
        <mesh position={[0, 0, -0.002]} castShadow>
          <planeGeometry args={[config.labelW + 0.03, config.labelH + 0.03]} />
          <meshStandardMaterial
            color="#2a2e3a"
            roughness={0.5}
            metalness={0.1}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
            clipShadows
          />
        </mesh>
        {/* Rótulo traseiro */}
        <mesh castShadow>
          <planeGeometry args={[config.labelW, config.labelH]} />
          <meshStandardMaterial
            color={labelColor}
            roughness={0.65}
            metalness={0.0}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
            clipShadows
          />
        </mesh>
      </group>
    </group>
  );
}
