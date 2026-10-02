import React, { useRef, useState, Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PlaceholderBottle from './PlaceholderBottle';

interface ProductModel3DProps {
  modelPath: string;
  placeholderColor?: string;
  placeholderShape?: 'bottle' | 'tube' | 'jar' | 'dropper';
  autoRotate?: boolean;
}

function GLBModel({ modelPath, autoRotate = true }: { modelPath: string; autoRotate?: boolean }) {
  const { scene } = useGLTF(modelPath);
  const ref = useRef<THREE.Group>(null);
  const rotationVelocity = useRef(0);

  const cloned = useRef<THREE.Group>(scene.clone(true)).current;

  // Auto-framing: compute bounding box, center and scale to fit a target size
  const { scaleFactor, centeredOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2;
    const sf = maxDim > 0 ? targetSize / maxDim : 1;
    return {
      scaleFactor: sf,
      centeredOffset: [
        -center.x * sf,
        -center.y * sf + size.y * sf * 0.5,
        -center.z * sf,
      ] as [number, number, number],
    };
  }, [cloned]);

  cloned.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Smooth rotation with easing — stops when user is interacting (damping brings velocity near 0)
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (autoRotate) {
      rotationVelocity.current = THREE.MathUtils.lerp(
        rotationVelocity.current,
        0.3,
        1 - Math.exp(-delta * 3),
      );
    } else {
      rotationVelocity.current = THREE.MathUtils.lerp(
        rotationVelocity.current,
        0,
        1 - Math.exp(-delta * 5),
      );
    }
    // Skip writing rotation if velocity is negligible — saves a matrix update per frame
    if (Math.abs(rotationVelocity.current) < 0.001 && !autoRotate) return;
    ref.current.rotation.y += delta * rotationVelocity.current;
  });

  return (
    <group ref={ref} scale={scaleFactor} position={centeredOffset}>
      <primitive object={cloned} />
    </group>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function ProductModel3D({
  modelPath,
  placeholderColor = '#1fa87d',
  placeholderShape = 'bottle',
  autoRotate = true,
}: ProductModel3DProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <PlaceholderBottle color={placeholderColor} shape={placeholderShape} scale={1} />;
  }

  return (
    <Suspense
      fallback={<PlaceholderBottle color={placeholderColor} shape={placeholderShape} scale={1} />}
    >
      <ErrorBoundary onError={() => setError(true)}>
        <GLBModel modelPath={modelPath} autoRotate={autoRotate} />
      </ErrorBoundary>
    </Suspense>
  );
}
