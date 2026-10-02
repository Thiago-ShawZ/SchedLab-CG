import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, MousePointerClick, Sparkles } from 'lucide-react';
import { Suspense, lazy } from 'react';
import { PRODUCTS } from '@/data/products';
import type { Product } from '@/types/product';

const HairShelf3D = lazy(() => import('@/components/3d/HairShelf3D'));

export default function Home() {
  const navigate = useNavigate();

  const handleSelect = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative overflow-x-hidden" aria-labelledby="hero-title">
        <div className="container-app grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-8 py-12 lg:grid-cols-2 lg:py-0">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Experiência 3D Interativa
            </div>
            <h1 id="hero-title" className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sched<span className="text-brand-400">Lab</span>
            </h1>
            <p className="mt-3 font-display text-xl font-medium text-ink-300 sm:text-2xl">
              Explore. Entenda. Cuide.
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-300">
              Um laboratório visual onde você explora produtos capilares e aprende através de uma
              experiência 3D. Gire, aproxime e descubra como cada produto funciona.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="btn-primary"
                aria-label="Explorar catálogo de produtos"
              >
                Explorar catálogo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="btn-ghost"
                aria-label="Sobre o projeto"
              >
                Sobre o projeto
              </button>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-ink-400">
              <MousePointerClick className="h-4 w-4" aria-hidden="true" />
              <span>Interaja com a estante 3D — clique nos produtos para ver detalhes</span>
            </div>

            {/* Accessible fallback list for keyboard / screen reader users */}
            <details className="mt-4 rounded-lg border border-ink-800 bg-ink-900/40">
              <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:text-white">
                Ver lista de produtos (acessível por teclado)
              </summary>
              <ul className="px-4 pb-3 space-y-1.5">
                {PRODUCTS.map((product) => (
                  <li key={product.id}>
                    <button
                      onClick={() => handleSelect(product)}
                      className="text-sm text-brand-400 transition-colors hover:text-brand-300 hover:underline"
                    >
                      {product.name} — {product.category}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* 3D Scene */}
          <div className="order-1 h-[320px] sm:h-[400px] lg:order-2 lg:h-[600px]">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-ink-400">
                    Carregando estante 3D...
                  </div>
                }
              >
                <HairShelf3D products={PRODUCTS} onSelect={handleSelect} compact />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-ink-800 bg-ink-900/30">
        <div className="container-app grid grid-cols-1 gap-6 py-12 sm:grid-cols-3">
          {[
            {
              title: 'Modelagem 3D',
              desc: 'Produtos renderizados em WebGL com materiais, iluminação e sombras.',
            },
            {
              title: 'Informação Confiável',
              desc: 'Fontes como ANVISA, FDA e American Academy of Dermatology.',
            },
            {
              title: 'Interativo',
              desc: 'Rotação, zoom e seleção com mouse ou toque.',
            },
          ].map((f, i) => (
            <div key={i} className="animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
              <h3 className="font-display font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Entenda seu cabelo */}
      <section className="border-t border-ink-800 bg-ink-900/50">
        <div className="container-app flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Entenda seu cabelo</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
              Informações gerais sobre tipos e condições de cabelo — liso, ondulado, cacheado,
              crespo, seco e oleoso. Conteúdo educativo, não diagnóstico.
            </p>
          </div>
          <Link
            to="/hair-types"
            className="btn-ghost whitespace-nowrap"
            aria-label="Acessar a área Entenda seu cabelo"
          >
            Acessar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
