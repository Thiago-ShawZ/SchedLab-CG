import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { PRODUCTS, GENERAL_SOURCES } from '@/data/products';
import type { Category } from '@/types/product';
import ProductCard from '@/components/products/ProductCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import SourceList from '@/components/ui/SourceList';

export default function Catalog() {
  const [active, setActive] = useState<Category | 'Todos'>('Todos');

  const filtered = useMemo(() => {
    if (active === 'Todos') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === active);
  }, [active]);

  return (
    <div className="container-app animate-fadeIn py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Catálogo
        </h1>
        <p className="mt-2 text-ink-300">
          Explore os produtos capilares. Clique em um item para ver a visualização 3D ampliada e
          informações detalhadas.
        </p>
      </div>

      <div className="mb-8">
        <CategoryFilter active={active} onChange={setActive} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-ink-400">
          Nenhum produto nesta categoria.
        </div>
      )}

      <p className="mt-10 text-xs text-ink-500">
        Mostrando {filtered.length} de {PRODUCTS.length} produtos.
      </p>

      {/* Fontes gerais */}
      <div className="mt-10 card p-5">
        <div className="flex items-center gap-2 text-brand-400">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
            Fontes consultadas
          </h2>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          As informações do SchedLab são baseadas em fontes oficiais. Cada produto também lista
          suas fontes específicas na página de detalhes.
        </p>
        <div className="mt-3">
          <SourceList sources={GENERAL_SOURCES} />
        </div>
      </div>
    </div>
  );
}
