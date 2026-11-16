import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface ClippingPlaneHelperProps {
  planeY: number;
  planeAngle: number;
  onPlaneChange?: (y: number, angle: number) => void;
}

export default function ClippingPlaneHelper({
  planeY,
  planeAngle,
  onPlaneChange,
}: ClippingPlaneHelperProps) {
  const isDraggingY = useRef(false);
  const dragStartY = useRef(0);
  const dragStartValY = useRef(0);

  const isDraggingAngle = useRef(false);
  const dragStartYAngle = useRef(0);
  const dragStartValAngle = useRef(0);

  const edgesGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    return new THREE.EdgesGeometry(geo);
  }, []);

  const handlePointerDownY = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {}
    isDraggingY.current = true;
    dragStartY.current = e.clientY;
    dragStartValY.current = planeY;
  };

  const handlePointerMoveY = (e: ThreeEvent<PointerEvent>) => {
    if (isDraggingY.current && onPlaneChange) {
      e.stopPropagation();
      const delta = (dragStartY.current - e.clientY) * 0.007;
      const nextY = Math.max(-1.1, Math.min(1.1, dragStartValY.current + delta));
      onPlaneChange(Number(nextY.toFixed(2)), planeAngle);
    }
  };

  const handlePointerUpY = (e: ThreeEvent<PointerEvent>) => {
    if (isDraggingY.current) {
      e.stopPropagation();
      isDraggingY.current = false;
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const handlePointerDownAngle = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {}
    isDraggingAngle.current = true;
    dragStartYAngle.current = e.clientY;
    dragStartValAngle.current = planeAngle;
  };

  const handlePointerMoveAngle = (e: ThreeEvent<PointerEvent>) => {
    if (isDraggingAngle.current && onPlaneChange) {
      e.stopPropagation();
      const delta = (e.clientY - dragStartYAngle.current) * 0.01;
      const maxAngle = Math.PI / 4;
      const nextAngle = Math.max(-maxAngle, Math.min(maxAngle, dragStartValAngle.current + delta));
      onPlaneChange(planeY, Number(nextAngle.toFixed(3)));
    }
  };

  const handlePointerUpAngle = (e: ThreeEvent<PointerEvent>) => {
    if (isDraggingAngle.current) {
      e.stopPropagation();
      isDraggingAngle.current = false;
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  return (
    <group position={[0, planeY, 0]} rotation={[planeAngle, 0, 0]}>
      {/* Semi-transparent plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDownY}
        onPointerMove={handlePointerMoveY}
        onPointerUp={handlePointerUpY}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'ns-resize';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[2.4, 2.4]} />
        <meshStandardMaterial
          color="#43c497"
          transparent
          opacity={0.22}
          roughness={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Border outline */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} geometry={edgesGeometry}>
        <lineBasicMaterial color="#43c497" transparent opacity={0.85} />
      </lineSegments>

      {/* Center arrow handle for Y drag */}
      <group
        onPointerDown={handlePointerDownY}
        onPointerMove={handlePointerMoveY}
        onPointerUp={handlePointerUpY}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'ns-resize';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Ring on plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.09, 32]} />
          <meshBasicMaterial color="#43c497" side={THREE.DoubleSide} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.225, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 16]} />
          <meshStandardMaterial color="#43c497" emissive="#43c497" emissiveIntensity={0.3} />
        </mesh>
        {/* Cone tip */}
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.05, 0.14, 16]} />
          <meshStandardMaterial color="#43c497" emissive="#43c497" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Side handles for rotation drag */}
      {[-1.2, 1.2].map((xPos) => (
        <mesh
          key={xPos}
          position={[xPos, 0, 0]}
          onPointerDown={handlePointerDownAngle}
          onPointerMove={handlePointerMoveAngle}
          onPointerUp={handlePointerUpAngle}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'ew-resize';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#43c497"
            emissive="#43c497"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
