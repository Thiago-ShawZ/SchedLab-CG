import { useRef, useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import ProductModel3D from '@/components/3d/ProductModel3D';
import PlaceholderBottle from '@/components/3d/PlaceholderBottle';
import type { Product } from '@/types/product';

const COLOR_BY_CATEGORY: Record<string, string> = {
  Shampoo: '#43c497',
  Condicionador: '#3b82f6',
  Máscara: '#f97316',
  'Leave-in': '#8b5cf6',
  Óleo: '#eab308',
  'Creme para pentear': '#ec4899',
};

const SHAPE_BY_CATEGORY: Record<string, 'bottle' | 'tube' | 'jar' | 'dropper'> = {
  Shampoo: 'bottle',
  Condicionador: 'bottle',
  Máscara: 'jar',
  'Leave-in': 'tube',
  Óleo: 'dropper',
  'Creme para pentear': 'tube',
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

function ProductCard3DThumbnail({
  modelPath,
  color,
  shape,
  isHovered,
}: {
  modelPath: string;
  color: string;
  shape: 'bottle' | 'tube' | 'jar' | 'dropper';
  isHovered: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        className="pointer-events-none"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2.5, 4, 2.5]} intensity={1.3} color="#fff5ea" />
        <directionalLight position={[-2.5, 1.5, 1]} intensity={0.5} color="#c8d8ff" />
        <Environment preset="studio" />

        <Suspense
          fallback={
            <PlaceholderBottle color={color} shape={shape} scale={0.65} />
          }
        >
          <ProductModel3D
            modelPath={modelPath}
            placeholderColor={color}
            placeholderShape={shape}
            autoRotate={isHovered}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const color = COLOR_BY_CATEGORY[product.category] ?? '#1fa87d';
  const shape = SHAPE_BY_CATEGORY[product.category] ?? 'bottle';

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card group relative flex flex-col overflow-hidden transition-all duration-300 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 animate-fadeIn"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* Área de visualização 3D real do modelo GLB */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ink-800/40 to-ink-950">
        {/* Glow sutil de fundo com a cor da categoria */}
        <div
          className="absolute inset-0 opacity-15 transition-opacity duration-300 group-hover:opacity-25"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${color}, transparent 70%)`,
          }}
        />

        {/* Modelo 3D GLB real do produto */}
        <ProductCard3DThumbnail
          modelPath={product.modelPath}
          color={color}
          shape={shape}
          isHovered={isHovered}
        />

        {/* Categoria */}
        <span className="absolute left-3 top-3 rounded-full bg-ink-900/85 px-2.5 py-1 text-xs font-medium text-ink-200 shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Informações */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-white">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-300">
          {product.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-400 transition-colors group-hover:text-brand-300">
          Ver detalhes
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
