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
}: PlaceholderBottleProps) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const currentEmissive = useRef(0);

  useFrame((_, delta) => {
    const target = selected ? 0.35 : hovered ? 0.18 : 0;
    const emissiveAnimating = Math.abs(currentEmissive.current - target) > 0.005;
    const targetOpacity = hovered || selected ? 0.95 : 0.82;
    if (!emissiveAnimating && Math.abs((materialRef.current?.opacity ?? 0.82) - targetOpacity) < 0.005) {
      return;
    }
    currentEmissive.current = THREE.MathUtils.lerp(currentEmissive.current, target, 1 - Math.exp(-delta * 8));
    if (materialRef.current) {
      const c = selected ? EMISSIVE_SELECTED : EMISSIVE_HOVER;
      materialRef.current.emissive.copy(c);
      materialRef.current.emissiveIntensity = currentEmissive.current;
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        1 - Math.exp(-delta * 8),
      );
    }
  });

  const bodyGeometry = useMemo(() => {
    if (shape === 'tube') {
      return new THREE.CylinderGeometry(0.35, 0.35, 1.1, 48);
    }
    if (shape === 'jar') {
      return new THREE.CylinderGeometry(0.55, 0.5, 0.6, 48);
    }
    if (shape === 'dropper') {
      return new THREE.CylinderGeometry(0.22, 0.22, 1.2, 48);
    }
    // bottle — slight taper with rounded top
    return new THREE.CylinderGeometry(0.38, 0.45, 1.0, 48);
  }, [shape]);

  const capHeight = shape === 'jar' ? 0.12 : shape === 'dropper' ? 0.5 : 0.25;
  const capRadius = shape === 'tube' ? 0.36 : shape === 'jar' ? 0.56 : shape === 'dropper' ? 0.23 : 0.39;
  const labelY = shape === 'jar' ? 0 : 0;
  const labelZ = shape === 'jar' ? 0.51 : 0.42;

  return (
    <group scale={scale}>
      {/* Body */}
      <mesh ref={bodyRef} geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          roughness={0.25}
          metalness={0.15}
          transparent
          opacity={0.82}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Label — front */}
      <mesh position={[0, labelY, labelZ]} castShadow>
        <planeGeometry args={[0.5, 0.35]} />
        <meshStandardMaterial color={labelColor} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Label — back */}
      <mesh position={[0, labelY, -labelZ]} rotation={[0, Math.PI, 0]} castShadow>
        <planeGeometry args={[0.5, 0.35]} />
        <meshStandardMaterial color={labelColor} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Cap */}
      <mesh position={[0, shape === 'jar' ? 0.36 : 0.62 + capHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[capRadius, capRadius, capHeight, 48]} />
        <meshStandardMaterial color="#262a33" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Dropper tip */}
      {shape === 'dropper' && (
        <mesh position={[0, 0.62 + capHeight + 0.15, 0]} castShadow>
          <coneGeometry args={[0.08, 0.2, 32]} />
          <meshStandardMaterial color="#262a33" roughness={0.3} metalness={0.4} />
        </mesh>
      )}
    </group>
  );
}
