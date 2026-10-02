import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Waves, Sparkles, Droplet, Sun, Flame, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { HAIR_TYPES } from '@/data/hairTypes';
import type { HairTypeInfo } from '@/data/hairTypes';
import SourceList from '@/components/ui/SourceList';

const ICON_MAP: Record<HairTypeInfo['icon'], typeof Wind> = {
  wind: Wind,
  waves: Waves,
  sparkles: Sparkles,
  droplet: Droplet,
  sun: Sun,
  flame: Flame,
};

export default function HairTypes() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = HAIR_TYPES.find((t) => t.id === activeId);

  return (
    <div className="container-app animate-fadeIn py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Entenda seu cabelo
        </h1>
        <p className="mt-2 text-ink-300">
          Informações gerais sobre diferentes tipos e condições de cabelo. Estas categorias são
          apenas formas de organizar conteúdo educativo e não substituem avaliação de um
          profissional.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mb-8 flex items-start gap-2 rounded-lg border border-accent-500/30 bg-accent-500/5 px-4 py-3">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-300">
          As informações a seguir são gerais e educativas. Elas não constituem diagnóstico. As
          características e necessidades de cada pessoa podem variar. Para orientações específicas,
          consulte um dermatologista ou outro profissional de saúde.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {HAIR_TYPES.map((type, i) => {
          const Icon = ICON_MAP[type.icon];
          const isActive = activeId === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setActiveId(isActive ? null : type.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 animate-fadeIn ${
                isActive
                  ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10'
                  : 'border-ink-800 bg-ink-900/60 hover:border-ink-600 hover:bg-ink-800/50'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
              aria-pressed={isActive}
              aria-label={`Ver informações sobre cabelo ${type.name}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-brand-500 text-white' : 'bg-ink-800 text-ink-300'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-white">{type.name}</span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {active && (
        <div className="mt-8 animate-fadeInScale">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                {(() => {
                  const Icon = ICON_MAP[active.icon];
                  return <Icon className="h-6 w-6" aria-hidden="true" />;
                })()}
              </span>
              <h2 className="font-display text-2xl font-bold text-white">{active.name}</h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Characteristics */}
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-400">
                  Características gerais
                </h3>
                <ul className="mt-3 space-y-2">
                  {active.characteristics.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Care */}
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-400">
                  Cuidados gerais
                </h3>
                <ul className="mt-3 space-y-2">
                  {active.care.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Related products */}
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-400">
                Produtos normalmente relacionados
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                A relação abaixo é geral. A escolha de produtos depende das características de cada
                pessoa e das instruções do rótulo.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {active.relatedCategories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/catalog`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/50 px-3 py-1.5 text-sm text-ink-200 transition-all hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
                  >
                    {cat}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 rounded-lg border border-ink-700 bg-ink-800/30 p-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-300">
                Orientações simples
              </h3>
              <ul className="mt-3 space-y-2">
                {active.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sources */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-brand-400">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide">
                  Fontes
                </h3>
              </div>
              <div className="mt-3">
                <SourceList sources={active.sources} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hint when nothing selected */}
      {!active && (
        <p className="mt-6 text-center text-sm text-ink-500">
          Selecione uma categoria acima para ver as informações.
        </p>
      )}
    </div>
  );
}
