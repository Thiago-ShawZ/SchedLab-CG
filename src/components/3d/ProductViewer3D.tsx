import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import ProductModel3D from './ProductModel3D';
import PlaceholderBottle from './PlaceholderBottle';
import ClippingPlaneHelper from './ClippingPlaneHelper';
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

// Clipping planes — recorta elementos abaixo da base do produto
const VIEWER_CLIP_PLANES = [
  new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.33),
];

interface ProductViewer3DProps {
  product: Product;
  autoRotate?: boolean;
  controlsRef?: React.MutableRefObject<OrbitControlsImpl | null>;
  isCutActive?: boolean;
  planeY?: number;
  planeAngle?: number;
  onPlaneChange?: (y: number, angle: number) => void;
  confirmCutTrigger?: number;
  resetCutTrigger?: number;
}

function Turntable({ color }: { color: string }) {
  return (
    <group position={[0, -1.25, 0]}>
      {/* Platform */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.1, 1.15, 0.08, 64]} />
        <meshStandardMaterial color="#1e222a" roughness={0.4} metalness={0.3} clippingPlanes={VIEWER_CLIP_PLANES} />
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
          clippingPlanes={VIEWER_CLIP_PLANES}
        />
      </mesh>
    </group>
  );
}

function CutCameraController({
  confirmTrigger = 0,
  resetTrigger = 0,
  planeY = 0,
  controlsRef,
}: {
  confirmTrigger?: number;
  resetTrigger?: number;
  planeY?: number;
  controlsRef?: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animStartTime = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());

  const prevConfirm = useRef(confirmTrigger);
  const prevReset = useRef(resetTrigger);

  useEffect(() => {
    if (confirmTrigger > 0 && confirmTrigger !== prevConfirm.current) {
      prevConfirm.current = confirmTrigger;
      startPos.current.copy(camera.position);
      startTarget.current.copy(controlsRef?.current?.target || new THREE.Vector3(0, 0, 0));

      // Dolly closer and look at cut section
      targetPos.current.set(0, planeY + 0.9, 2.6);
      endTarget.current.set(0, planeY, 0);

      animStartTime.current = performance.now();
      isAnimating.current = true;
    }
  }, [confirmTrigger, planeY, camera, controlsRef]);

  useEffect(() => {
    if (resetTrigger > 0 && resetTrigger !== prevReset.current) {
      prevReset.current = resetTrigger;
      startPos.current.copy(camera.position);
      startTarget.current.copy(controlsRef?.current?.target || new THREE.Vector3(0, 0, 0));

      // Restore camera to initial position
      targetPos.current.set(0, 0.3, 4.2);
      endTarget.current.set(0, 0, 0);

      animStartTime.current = performance.now();
      isAnimating.current = true;
    }
  }, [resetTrigger, camera, controlsRef]);

  useFrame(() => {
    if (!isAnimating.current) return;
    const elapsed = (performance.now() - animStartTime.current) / 1000;
    const t = Math.min(elapsed / 1.0, 1.0);
    // 1s cubic ease-out
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos.current, targetPos.current, ease);
    if (controlsRef?.current) {
      controlsRef.current.target.lerpVectors(startTarget.current, endTarget.current, ease);
      controlsRef.current.update();
    }

    if (t >= 1) {
      isAnimating.current = false;
    }
  });

  return null;
}

export default function ProductViewer3D({
  product,
  autoRotate = true,
  controlsRef,
  isCutActive = false,
  planeY = 0,
  planeAngle = 0,
  onPlaneChange,
  confirmCutTrigger = 0,
  resetCutTrigger = 0,
}: ProductViewer3DProps) {
  const shape = SHAPE_BY_CATEGORY[product.category] ?? 'bottle';
  const color = COLOR_BY_CATEGORY[product.category] ?? '#1fa87d';

  // Clipping plane calculated from normal and coplanar point
  const clippingPlane = useMemo(() => {
    const normal = new THREE.Vector3(0, -1, 0).applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      planeAngle,
    );
    const point = new THREE.Vector3(0, planeY, 0);
    return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point);
  }, [planeY, planeAngle]);

  const clippingPlanes = useMemo(() => {
    return isCutActive ? [clippingPlane] : [];
  }, [isCutActive, clippingPlane]);

  return (
    <div className="w-full h-full" role="img" aria-label={`Modelo 3D de ${product.name}`}>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 4.2], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
        }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <color attach="background" args={['#0e1015']} />

        {/* Three-point lighting */}
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
        <directionalLight position={[-3.5, 2, 1.5]} intensity={0.45} color="#c8d8ff" />
        <directionalLight position={[0, 2, -4]} intensity={0.5} color={color} />
        <ambientLight intensity={0.3} />

        <Suspense
          fallback={
            <PlaceholderBottle
              color={color}
              shape={shape}
              scale={1}
              clippingPlanes={clippingPlanes}
            />
          }
        >
          <ProductModel3D
            modelPath={product.modelPath}
            placeholderColor={color}
            placeholderShape={shape}
            autoRotate={isCutActive ? false : autoRotate}
            clippingPlanes={clippingPlanes}
          />
        </Suspense>

        {isCutActive && (
          <ClippingPlaneHelper
            planeY={planeY}
            planeAngle={planeAngle}
            onPlaneChange={onPlaneChange}
          />
        )}

        <CutCameraController
          confirmTrigger={confirmCutTrigger}
          resetTrigger={resetCutTrigger}
          planeY={planeY}
          controlsRef={controlsRef}
        />

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
          target={[0, -0.15, 0]}
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
