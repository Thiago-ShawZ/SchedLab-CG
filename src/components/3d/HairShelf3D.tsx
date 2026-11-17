import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, ContactShadows, useGLTF } from '@react-three/drei';
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

// Shelf surface is 0.46 below each product's group origin
const SHELF_SURFACE_Y = -0.46;
const SHELF_MODEL_TARGET = 0.85;
const EMISSIVE_HOVER = new THREE.Color('#43c497');
const EMISSIVE_SELECTED = new THREE.Color('#1fa87d');

// Clipping planes — recorta elementos fora da região de visualização da estante
// Clip behind the back wall (z < -1.25) so nothing behind the shelf is visible
const SHELF_CLIP_PLANES = [
  new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.25),
];

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error?: any) => void; modelPath?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error?: any) => void; modelPath?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error(`[HairShelf3D] Falha ao carregar modelo 3D (${this.props.modelPath ?? 'desconhecido'}):`, error);
    this.props.onError(error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ShelfGLBModel({
  modelPath,
  hovered,
  selected,
}: {
  modelPath: string;
  hovered: boolean;
  selected: boolean;
}) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const spinRef = useRef<THREE.Group>(null);

  const { scaleFactor, center, boxMinY, meshes } = useMemo(() => {
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let hasValidMesh = false;
    const meshList: THREE.Mesh[] = [];

    cloned.traverse((child) => {
      // Ignora câmeras, luzes e elementos de estúdio/chão
      if ((child as any).isCamera || (child as any).isLight) {
        child.visible = false;
        return;
      }
      if (/stage|floor|ground|backdrop|studio|shadow_plane/i.test(child.name)) {
        child.visible = false;
        return;
      }

      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && child.visible) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const enhanceMaterial = (original: THREE.Material): THREE.Material => {
          // Clona material original preservando mapas de textura e UVs com segurança
          const m = original.clone();
          if ('roughness' in m && typeof (m as any).roughness === 'number') {
            (m as any).roughness = THREE.MathUtils.clamp((m as any).roughness || 0.28, 0.18, 0.42);
          }
          if ('metalness' in m && typeof (m as any).metalness === 'number') {
            (m as any).metalness = Math.min((m as any).metalness || 0.05, 0.15);
          }
          if ('clearcoat' in m && typeof (m as any).clearcoat === 'number') {
            (m as any).clearcoat = 0.8;
            (m as any).clearcoatRoughness = 0.15;
          }
          if ('envMapIntensity' in m && typeof (m as any).envMapIntensity === 'number') {
            (m as any).envMapIntensity = 1.1;
          }
          return m;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(enhanceMaterial);
        } else if (mesh.material) {
          mesh.material = enhanceMaterial(mesh.material);
        }
        meshList.push(mesh);

        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) {
            const meshBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            const meshSize = new THREE.Vector3();
            meshBox.getSize(meshSize);
            if (meshSize.x < 35 && meshSize.y < 35 && meshSize.z < 35) {
              box.union(meshBox);
              hasValidMesh = true;
            }
          }
        }
      }
    });

    if (!hasValidMesh) {
      box.setFromObject(cloned);
    }

    const size = new THREE.Vector3();
    box.getSize(size);
    const c = new THREE.Vector3();
    box.getCenter(c);

    const maxDim = Math.max(size.x, size.y, size.z);
    let sf = maxDim > 0 ? SHELF_MODEL_TARGET / maxDim : 1;
    if (isNaN(sf) || sf <= 0 || !isFinite(sf)) {
      console.warn(`[HairShelf3D] Escala inválida (${sf}) para ${modelPath}, aplicando escala 1`);
      sf = 1;
    }

    return {
      scaleFactor: sf,
      center: c,
      boxMinY: box.min.y,
      meshes: meshList,
    };
  }, [cloned, modelPath]);

  const emissiveIntensity = useRef(0);

  useFrame((_, delta) => {
    const target = selected ? 0.3 : hovered ? 0.15 : 0;
    if (Math.abs(emissiveIntensity.current - target) > 0.005) {
      emissiveIntensity.current = THREE.MathUtils.lerp(
        emissiveIntensity.current,
        target,
        1 - Math.exp(-delta * 8),
      );
      const color = selected ? EMISSIVE_SELECTED : EMISSIVE_HOVER;
      for (const mesh of meshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          mat.emissive.copy(color);
          mat.emissiveIntensity = emissiveIntensity.current;
        }
      }
    }

    // Suave rotação no centro visual ao interagir (hover ou selected)
    if (spinRef.current && (hovered || selected)) {
      spinRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group ref={spinRef}>
      <group position={[0, SHELF_SURFACE_Y, 0]} scale={scaleFactor}>
        <primitive object={cloned} position={[-center.x, -boxMinY, -center.z]} />
      </group>
    </group>
  );
}

function ShelfProductModel({
  modelPath,
  placeholderColor,
  placeholderShape,
  hovered,
  selected,
}: {
  modelPath: string;
  placeholderColor: string;
  placeholderShape: 'bottle' | 'tube' | 'jar' | 'dropper';
  hovered: boolean;
  selected: boolean;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <PlaceholderBottle
        color={placeholderColor}
        shape={placeholderShape}
        hovered={hovered}
        selected={selected}
        scale={0.55}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <PlaceholderBottle
          color={placeholderColor}
          shape={placeholderShape}
          hovered={hovered}
          selected={selected}
          scale={0.55}
        />
      }
    >
      <ErrorBoundary onError={() => setError(true)}>
        <ShelfGLBModel modelPath={modelPath} hovered={hovered} selected={selected} />
      </ErrorBoundary>
    </Suspense>
  );
}

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
        <ShelfProductModel
          modelPath={product.modelPath}
          placeholderColor={color}
          placeholderShape={shape}
          hovered={hovered}
          selected={isSelected}
        />
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
        <meshStandardMaterial color="#1a1d24" roughness={0.95} metalness={0} clippingPlanes={SHELF_CLIP_PLANES} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#1e222a" roughness={0.85} metalness={0.05} clippingPlanes={SHELF_CLIP_PLANES} />
      </mesh>

      {/* Shelves — wood-like */}
      {[0, 1.6, 3.2].map((y, i) => (
        <mesh key={i} position={[0, y - 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[6.5, 0.08, 1.8]} />
          <meshStandardMaterial color={SHELF_WOOD_COLOR} roughness={0.7} metalness={0.05} clippingPlanes={SHELF_CLIP_PLANES} />
        </mesh>
      ))}

      {/* Shelf side panels */}
      {[-3.25, 3.25].map((x, i) => (
        <mesh key={`side-${i}`} position={[x, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 4, 1.8]} />
          <meshStandardMaterial color={SHELF_WOOD_DARK} roughness={0.75} metalness={0.05} clippingPlanes={SHELF_CLIP_PLANES} />
        </mesh>
      ))}

      {/* Top shelf board */}
      <mesh position={[0, 3.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.08, 1.8]} />
        <meshStandardMaterial color={SHELF_WOOD_COLOR} roughness={0.7} metalness={0.05} clippingPlanes={SHELF_CLIP_PLANES} />
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
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [0, cameraHeight, cameraDistance], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', localClippingEnabled: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <color attach="background" args={['#101218']} />
        <fog attach="fog" args={['#101218', 14, 28]} />

        {/* SoftShadows removido — incompatível com Three.js 0.175+ (PCFSoftShadowMap removido) */}

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
          <ContactShadows
            position={[0, -0.54, 0]}
            opacity={0.45}
            scale={12}
            blur={2}
            far={4}
            resolution={256}
            color="#000000"
          />
          <Environment preset="apartment" />
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

// Preload all product GLB models so they're cached for both shelf and detail views
useGLTF.preload('/models/shampoo.glb');
useGLTF.preload('/models/conditioner.glb');
useGLTF.preload('/models/mask.glb');
useGLTF.preload('/models/leavein.glb');
useGLTF.preload('/models/oil.glb');
useGLTF.preload('/models/creme.glb');
