import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import ProductModel3D from './ProductModel3D';
import PlaceholderBottle from './PlaceholderBottle';
import type { Product } from '@/types/product';

const SHAPE_BY_CATEGORY: Record<string, 'bottle' | 'tube' | 'jar' | 'dropper'> = {
  Shampoo: 'bottle',
  Condicionador: 'bottle',
  Máscara: 'jar',
  'Leave-in': 'tube',
  Óleo: 'dropper',
  'Creme para pentear': 'tube',
};

const COLOR_BY_CATEGORY: Record<string, string> = {
  Shampoo: '#43c497',
  Condicionador: '#3b82f6',
  Máscara: '#f97316',
  'Leave-in': '#8b5cf6',
  Óleo: '#eab308',
  'Creme para pentear': '#ec4899',
};

interface ProductViewer3DProps {
  product: Product;
  autoRotate?: boolean;
  controlsRef?: React.MutableRefObject<OrbitControlsImpl | null>;
}

function Turntable({ color }: { color: string }) {
  return (
    <group position={[0, -1.25, 0]}>
      {/* Platform */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.1, 1.15, 0.08, 64]} />
        <meshStandardMaterial color="#1e222a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Accent ring */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.12, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

export default function ProductViewer3D({
  product,
  autoRotate = true,
  controlsRef,
}: ProductViewer3DProps) {
  const shape = SHAPE_BY_CATEGORY[product.category] ?? 'bottle';
  const color = COLOR_BY_CATEGORY[product.category] ?? '#1fa87d';

  return (
    <div className="w-full h-full" role="img" aria-label={`Modelo 3D de ${product.name}`}>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <color attach="background" args={['#0e1015']} />

        {/* SoftShadows removido — incompatível com Three.js 0.175+ */}

        {/* Three-point lighting */}
        {/* Key — warm, upper right front */}
        <directionalLight
          position={[3, 4.5, 3]}
          intensity={1.3}
          color="#fff5e8"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={15}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        {/* Fill — cool, left */}
        <directionalLight position={[-3.5, 2, 1.5]} intensity={0.45} color="#c8d8ff" />
        {/* Rim — behind, product-colored */}
        <directionalLight position={[0, 2, -4]} intensity={0.5} color={color} />
        {/* Ambient */}
        <ambientLight intensity={0.3} />

        <Suspense fallback={<PlaceholderBottle color={color} shape={shape} scale={1} />}>
          <ProductModel3D
            modelPath={product.modelPath}
            placeholderColor={color}
            placeholderShape={shape}
            autoRotate={autoRotate}
          />
        </Suspense>

        <Turntable color={color} />

        <ContactShadows
          position={[0, -1.29, 0]}
          opacity={0.5}
          scale={5}
          blur={2.5}
          far={3}
          resolution={512}
        />
        <Environment preset="studio" />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.9}
          enableDamping
          dampingFactor={0.07}
          rotateSpeed={0.65}
          zoomSpeed={0.7}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  );
}
