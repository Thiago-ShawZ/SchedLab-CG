import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/product';

const COLOR_BY_CATEGORY: Record<string, string> = {
  Shampoo: '#43c497',
  Condicionador: '#3b82f6',
  Máscara: '#f97316',
  'Leave-in': '#8b5cf6',
  Óleo: '#eab308',
  'Creme para pentear': '#ec4899',
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const color = COLOR_BY_CATEGORY[product.category] ?? '#1fa87d';

  return (
    <Link
      to={`/product/${product.id}`}
      className="card group relative flex flex-col overflow-hidden transition-all duration-300 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 animate-fadeIn"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* Visual preview area */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-ink-800/50 to-ink-900">
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${color}, transparent 70%)`,
          }}
        />
        {/* Stylized bottle silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-28 w-16 rounded-t-lg rounded-b-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
            style={{
              background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
              boxShadow: `0 8px 24px ${color}33`,
            }}
          >
            <div className="h-5 w-full rounded-t-lg bg-ink-800" />
            <div className="mx-auto mt-6 h-12 w-10 rounded bg-white/20 backdrop-blur-sm" />
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-xs font-medium text-ink-200 backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Info */}
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
