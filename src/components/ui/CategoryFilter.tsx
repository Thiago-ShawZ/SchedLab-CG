import { CATEGORIES } from '@/data/products';
import type { Category } from '@/types/product';

interface CategoryFilterProps {
  active: Category | 'Todos';
  onChange: (category: Category | 'Todos') => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoria">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-white'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
