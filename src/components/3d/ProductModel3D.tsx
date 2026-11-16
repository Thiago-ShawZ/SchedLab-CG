import React, { useRef, useState, Suspense, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PlaceholderBottle from './PlaceholderBottle';

interface ProductModel3DProps {
  modelPath: string;
  placeholderColor?: string;
  placeholderShape?: 'bottle' | 'tube' | 'jar' | 'dropper';
  autoRotate?: boolean;
  clippingPlanes?: THREE.Plane[];
}

function GLBModel({
  modelPath,
  autoRotate = true,
  clippingPlanes,
}: {
  modelPath: string;
  autoRotate?: boolean;
  clippingPlanes?: THREE.Plane[];
}) {
  const { scene } = useGLTF(modelPath);
  const ref = useRef<THREE.Group>(null);
  const rotationVelocity = useRef(0);

  // Clone scene, limpa elementos espúrios de estúdio/câmeras e aprimora materiais
  const cloned = useMemo(() => {
    try {
      const clone = scene.clone(true);

      clone.traverse((child) => {
        // Ignora e oculta luzes, câmeras e estúdios que possam ter vindo em arquivos exportados (Sketchfab/Blender)
        if ((child as any).isCamera || (child as any).isLight) {
          child.visible = false;
          return;
        }
        if (/stage|floor|ground|backdrop|studio|shadow_plane/i.test(child.name)) {
          child.visible = false;
          return;
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const enhanceMaterial = (original: THREE.Material): THREE.Material => {
            /* 
             * Computação Gráfica / PBR:
             * Clona o material original preservando texturas, UVs e normais do modelo 3D,
             * e aprimora os parâmetros de acabamento plástico/cosmético.
             */
            const m = original.clone();
            m.side = THREE.DoubleSide;

            if ('roughness' in m && typeof (m as any).roughness === 'number') {
              (m as any).roughness = THREE.MathUtils.clamp((m as any).roughness || 0.28, 0.18, 0.42);
            }
            if ('metalness' in m && typeof (m as any).metalness === 'number') {
              (m as any).metalness = Math.min((m as any).metalness || 0.05, 0.15);
            }
            if ('clearcoat' in m && typeof (m as any).clearcoat === 'number') {
              (m as any).clearcoat = 0.85;
              (m as any).clearcoatRoughness = 0.15;
            }
            if ('envMapIntensity' in m && typeof (m as any).envMapIntensity === 'number') {
              (m as any).envMapIntensity = 1.15;
            }

            return m;
          };

          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(enhanceMaterial);
          } else if (mesh.material) {
            mesh.material = enhanceMaterial(mesh.material);
          }
        }
      });

      return clone;
    } catch (err) {
      console.warn('ProductModel3D: aviso ao processar cena, utilizando objeto original:', err);
      return scene;
    }
  }, [scene]);

  const hasPlanes = Boolean(clippingPlanes && clippingPlanes.length > 0);

  // Toggle clipping on materials and trigger shader recompile only when clipping state flips
  useEffect(() => {
    const planes = hasPlanes ? clippingPlanes! : null;
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.visible) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          if (mat) {
            mat.clippingPlanes = planes;
            mat.clipShadows = true;
            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [cloned, hasPlanes]);

  // Keep clippingPlanes reference updated on materials without rebuilding shaders
  useEffect(() => {
    if (!hasPlanes) return;
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.visible) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          if (mat) {
            mat.clippingPlanes = clippingPlanes!;
          }
        }
      }
    });
  }, [cloned, clippingPlanes, hasPlanes]);

  /*
   * Auto-framing e Recentralização Robusta:
   * 1. Calcula o Bounding Box real apenas das malhas visíveis do produto (ignora estúdios/luzes).
   * 2. Centraliza os eixos X e Z na origem (corrige modelos com pivôs deslocados).
   * 3. Apoia a base do produto (box.min.y) exatamente sobre a plataforma giratória (Y = -1.21).
   * 4. Ajusta a escala para enquadramento ideal no campo de visão da câmera (targetSize = 2.1).
   */
  const { scaleFactor, centeredOffset } = useMemo(() => {
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let hasValidMesh = false;

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.visible) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) {
            const meshBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            const meshSize = new THREE.Vector3();
            meshBox.getSize(meshSize);

            // Filtra geometrias espúrias desproporcionais (ex: chão de 100m)
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
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2.1;
    const sf = maxDim > 0 ? targetSize / maxDim : 1;

    /*
     * CG — Reposicionamento do pivô em espaço pré-escala:
     * O grupo interno recebe scale=sf; portanto o offset deve ser em coordenadas do modelo
     * (pré-escala) para que a transformação final resulte nas coordenadas mundiais corretas:
     *   mundo_X = (offset_X + center.x) * sf = 0  →  offset_X = -center.x
     *   mundo_Y_base = (offset_Y + box.min.y) * sf = TURNTABLE_Y
     *                  →  offset_Y = TURNTABLE_Y / sf - box.min.y
     */
    const TURNTABLE_SURFACE_Y = -1.21;
    const offsetY = TURNTABLE_SURFACE_Y / sf - box.min.y;

    return {
      scaleFactor: sf,
      centeredOffset: [
        -center.x,
        offsetY,
        -center.z,
      ] as [number, number, number],
    };
  }, [cloned]);

  // Smooth rotation with easing — stops when autoRotate is false
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

  /*
   * CG: O grupo de spin (ref) fica na origem (0,0,0) — a rotação .y gira em torno do eixo
   * mundial Y, sem deslocamento. O grupo interno aplica escala e reposicionamento do pivô
   * do modelo, garantindo que modelos Sketchfab com centro fora da origem (ex: mask.glb,
   * creme.glb) girem corretamente sem "voar" para fora da tela.
   */
  return (
    <group ref={ref}>
      <group scale={scaleFactor} position={centeredOffset}>
        <primitive object={cloned} />
      </group>
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
  componentDidCatch(error: any) {
    console.error('ProductModel3D ErrorBoundary capturou erro:', error);
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
  clippingPlanes,
}: ProductModel3DProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <PlaceholderBottle
        color={placeholderColor}
        shape={placeholderShape}
        scale={1}
        clippingPlanes={clippingPlanes}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <PlaceholderBottle
          color={placeholderColor}
          shape={placeholderShape}
          scale={1}
          clippingPlanes={clippingPlanes}
        />
      }
    >
      <ErrorBoundary onError={() => setError(true)}>
        <GLBModel
          modelPath={modelPath}
          autoRotate={autoRotate}
          clippingPlanes={clippingPlanes}
        />
      </ErrorBoundary>
    </Suspense>
  );
}
