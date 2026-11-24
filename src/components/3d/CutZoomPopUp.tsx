import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ZoomIn, X, RotateCcw } from 'lucide-react';
import ProductModel3D from './ProductModel3D';
import PlaceholderBottle from './PlaceholderBottle';
import type { Product } from '@/types/product';

interface CutZoomPopUpProps {
  product: Product;
  color: string;
  shape: 'bottle' | 'tube' | 'jar' | 'dropper';
  planeY: number;
  clippingPlanes: THREE.Plane[];
  onClose: () => void;
  onResetCut: () => void;
}

function ZoomCameraController({ planeY }: { planeY: number }) {
  const { camera } = useThree();
  const prevY = useRef(planeY);

  useEffect(() => {
    const diff = planeY - prevY.current;
    camera.position.y += diff;
    prevY.current = planeY;
  }, [planeY, camera]);

  return null;
}

export default function CutZoomPopUp({
  product,
  color,
  shape,
  planeY,
  clippingPlanes,
  onClose,
  onResetCut,
}: CutZoomPopUpProps) {
  return (
    <div
      role="dialog"
      aria-label="Detalhe ampliado do corte"
      aria-modal="false"
      className="absolute right-3 bottom-20 sm:bottom-auto sm:top-3 sm:right-4 z-20 w-64 sm:w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-700/80 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-md animate-fadeIn"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-ink-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Detalhe do Corte</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-800 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Fechar detalhe do corte"
          title="Fechar"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* 2º Canvas R3F compacto com zoom na fatia cortada */}
      <div className="relative mt-2.5 h-[230px] w-full overflow-hidden rounded-lg border border-ink-800 bg-ink-950/90 shadow-inner">
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          camera={{ position: [0, planeY + 0.35, 1.45], fov: 38 }}
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
          <color attach="background" args={['#0a0c10']} />

          {/* Iluminação focada para o produto cortado */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[2.5, 3.5, 2]} intensity={1.3} color="#fff5ea" />
          <directionalLight position={[-2.5, 1.5, 1]} intensity={0.5} color="#c8d8ff" />
          <directionalLight position={[0, -2, -2]} intensity={0.3} color={color} />
          <Environment preset="studio" />

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
              autoRotate={false}
              clippingPlanes={clippingPlanes}
            />
          </Suspense>

          <ZoomCameraController planeY={planeY} />

          <OrbitControls
            target={[0, planeY, 0]}
            enablePan={false}
            minDistance={0.7}
            maxDistance={2.6}
            autoRotate
            autoRotateSpeed={0.8}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            zoomSpeed={0.7}
          />
        </Canvas>

        {/* Indicador sutil de ampliação */}
        <div
          className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-ink-900/85 px-1.5 py-0.5 text-[10px] font-mono text-ink-300 backdrop-blur-sm"
          role="note"
        >
          Zoom 2.8x
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={onResetCut}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/80 py-1.5 text-xs text-ink-200 transition-colors hover:bg-ink-700 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Limpar corte e fechar pop-up"
          title="Limpar corte e restaurar visualização"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          <span>Limpar corte</span>
        </button>
        <button
          onClick={onClose}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand-500/30 bg-brand-500/20 py-1.5 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-500/30 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Fechar janela de zoom"
          title="Fechar zoom mantendo o corte no modelo"
        >
          <span>Fechar</span>
        </button>
      </div>
    </div>
  );
}
