import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, AccumulativeShadows, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Product } from '@/types/product';
import PlaceholderBottle from './PlaceholderBottle';

interface HairShelf3DProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  compact?: boolean;
}

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

const SHELF_WOOD_COLOR = '#3a322a';
const SHELF_WOOD_DARK = '#2a241e';

interface ShelfProductProps {
  product: Product;
  position: [number, number, number];
  onSelect?: (product: Product) => void;
  selectedId: string | null;
}

function ShelfProduct({ product, position, onSelect, selectedId }: ShelfProductProps) {
  const [hovered, setHovered] = useState(false);
  const liftRef = useRef<THREE.Group>(null);
  const currentLift = useRef(0);
  const idleRef = useRef(true);
  const isSelected = selectedId === product.id;
  const shape = SHAPE_BY_CATEGORY[product.category] ?? 'bottle';
  const color = COLOR_BY_CATEGORY[product.category] ?? '#1fa87d';

  useFrame((_, delta) => {
    const targetLiftVal = hovered || isSelected ? 0.25 : 0;
    const isAnimating = Math.abs(currentLift.current - targetLiftVal) > 0.001;
    if (!isAnimating && idleRef.current) return;
    idleRef.current = !isAnimating && targetLiftVal === 0;
    currentLift.current = THREE.MathUtils.lerp(
      currentLift.current,
      targetLiftVal,
      1 - Math.exp(-delta * 6),
    );
    if (liftRef.current) {
      liftRef.current.position.y = currentLift.current;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(product);
      }}
    >
      <group ref={liftRef}>
        <Suspense fallback={null}>
          <PlaceholderBottle
            color={color}
            shape={shape}
            hovered={hovered}
            selected={isSelected}
            scale={0.55}
          />
        </Suspense>
      </group>

      {/* Hover/selected tooltip */}
      {(hovered || isSelected) && (
        <Html position={[0, 1.1, 0]} center distanceFactor={9} occlude>
          <div
            className={`px-3 py-1.5 rounded-lg border text-white text-xs whitespace-nowrap pointer-events-none shadow-xl transition-colors ${
              isSelected
                ? 'bg-brand-500/95 border-brand-400'
                : 'bg-ink-900/95 border-brand-500/50'
            }`}
          >
            {product.name}
          </div>
        </Html>
      )}

      {/* Selection ring on shelf */}
      {isSelected && (
        <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.62, 48]} />
          <meshBasicMaterial color="#43c497" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

interface ShelfProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  selectedId: string | null;
}

function Shelf({ products, onSelect, selectedId }: ShelfProps) {
  const shelfPositions = useMemo(() => {
    const cols = 3;
    const spacing = 1.4;
    return products.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [(-cols / 2 + 0.5 + col) * spacing, row * 1.6, 0] as [number, number, number];
    });
  }, [products]);

  return (
    <group>
      {/* Back wall with subtle gradient feel */}
      <mesh position={[0, 1.5, -1.2]} receiveShadow>
        <boxGeometry args={[7, 5, 0.1]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.95} metalness={0} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#1e222a" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Shelves — wood-like */}
      {[0, 1.6, 3.2].map((y, i) => (
        <mesh key={i} position={[0, y - 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[6.5, 0.08, 1.8]} />
          <meshStandardMaterial color={SHELF_WOOD_COLOR} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* Shelf side panels */}
      {[-3.25, 3.25].map((x, i) => (
        <mesh key={`side-${i}`} position={[x, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 4, 1.8]} />
          <meshStandardMaterial color={SHELF_WOOD_DARK} roughness={0.75} metalness={0.05} />
        </mesh>
      ))}

      {/* Top shelf board */}
      <mesh position={[0, 3.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.08, 1.8]} />
        <meshStandardMaterial color={SHELF_WOOD_COLOR} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Products */}
      {products.map((product, i) => (
        <ShelfProduct
          key={product.id}
          product={product}
          position={shelfPositions[i]}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </group>
  );
}

export default function HairShelf3D({ products, onSelect, compact = false }: HairShelf3DProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (product: Product) => {
    setSelectedId(product.id);
    // Brief delay so the selection animation is visible before navigating
    setTimeout(() => {
      onSelect?.(product);
      setSelectedId(null);
    }, 350);
  };

  const cameraDistance = compact ? 7.5 : 9.5;
  const cameraHeight = compact ? 1.8 : 1.5;

  return (
    <div className="w-full h-full" role="img" aria-label="Estante 3D com produtos capilares">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, cameraHeight, cameraDistance], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <color attach="background" args={['#101218']} />
        <fog attach="fog" args={['#101218', 14, 28]} />

        <SoftShadows size={20} samples={6} focus={0.8} />

        {/* Key light — warm, from upper right */}
        <directionalLight
          position={[4, 7, 4]}
          intensity={1.4}
          color="#fff5e8"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={22}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        {/* Fill light — cool, from left */}
        <directionalLight
          position={[-5, 4, 2]}
          intensity={0.4}
          color="#c8d8ff"
        />
        {/* Rim light — from behind */}
        <directionalLight
          position={[0, 3, -4]}
          intensity={0.3}
          color="#43c497"
        />
        {/* Ambient */}
        <ambientLight intensity={0.25} />

        <Suspense fallback={null}>
          <Shelf products={products} onSelect={handleSelect} selectedId={selectedId} />
          <Environment preset="apartment" />
          <AccumulativeShadows
            position={[0, -0.54, 0]}
            opacity={0.55}
            scale={12}
            frames={60}
            color="#0a0c10"
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={4.5}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
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
