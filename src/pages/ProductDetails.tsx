import { useParams, Link } from 'react-router-dom';
import { useRef, Suspense, lazy } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  ArrowLeft,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  Info,
  Droplets,
  BookOpen,
  Beaker,
  AlertCircle,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import SourceList from '@/components/ui/SourceList';

const ProductViewer3D = lazy(() => import('@/components/3d/ProductViewer3D'));

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="container-app flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-accent-400" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-white">Produto não encontrado</h1>
        <Link to="/catalog" className="mt-6 btn-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.3);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.3);
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="container-app animate-fadeIn py-8">
      {/* Back link */}
      <Link
        to="/catalog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar ao catálogo
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 3D Viewer */}
        <div className="lg:sticky lg:top-24 lg:self-start animate-fadeInScale">
          <div className="relative h-[360px] overflow-hidden rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900/60 to-ink-950 sm:h-[460px] lg:h-[540px]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-ink-400">
                  Carregando modelo 3D...
                </div>
              }
            >
              <ProductViewer3D product={product} autoRotate controlsRef={controlsRef} />
            </Suspense>

            {/* Controls overlay */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/90 px-2 py-1.5 backdrop-blur-md">
              <button
                onClick={handleZoomIn}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-ink-700 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Aproximar modelo 3D"
                title="Aproximar"
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={handleZoomOut}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-ink-700 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Afastar modelo 3D"
                title="Afastar"
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="h-5 w-px bg-ink-700" />
              <button
                onClick={handleReset}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-ink-700 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Resetar visualização 3D"
                title="Resetar"
              >
                <RotateCw className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="absolute right-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-xs text-ink-300 backdrop-blur-sm" role="note">
              Arraste para girar
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-6 animate-slideUp" style={{ animationDelay: '120ms' }}>
          <div>
            <span className="inline-block rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
              {product.category}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
              {product.name}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-300">{product.description}</p>
          </div>

          {/* Indication */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand-400">
              <Info className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                Indicação
              </h2>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-300">{product.indication}</p>
          </div>

          {/* Usage */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand-400">
              <Droplets className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                Modo de uso
              </h2>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-300">{product.usage}</p>
          </div>

          {/* Benefits */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand-400">
              <Check className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                Benefícios
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {product.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Ingredientes */}
          {product.ingredients.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 text-brand-400">
                <Beaker className="h-4 w-4" aria-hidden="true" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                  Ingredientes em destaque
                </h2>
              </div>
              <div className="mt-3 space-y-3">
                {product.ingredients.map((ing, i) => (
                  <div key={i} className="rounded-lg border border-ink-700 bg-ink-800/40 p-3">
                    <p className="text-sm font-medium text-ink-100">{ing.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-300">{ing.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções de rótulo */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand-400">
              <Info className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                Instruções de rótulo
              </h2>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-300">{product.labelInstructions}</p>
          </div>

          {/* O que saber */}
          <div className="rounded-xl border border-accent-500/30 bg-accent-500/5 p-5">
            <div className="flex items-center gap-2 text-accent-400">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                O que saber
              </h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-400" />
                As informações são de caráter educativo e não constituem recomendação médica.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-400" />
                Resultados podem variar conforme o tipo de cabelo e frequência de uso.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-400" />
                Em caso de irritação ou reação adversa, suspenda o uso e procure um profissional.
              </li>
            </ul>
          </div>

          {/* Sources */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand-400">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Fontes</h2>
            </div>
            <div className="mt-3">
              <SourceList sources={product.sources} />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-ink-700 bg-ink-800/30 px-4 py-3">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-ink-300" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-ink-300">
              Conteúdo educativo. As informações apresentadas não substituem avaliação de um
              dermatologista ou outro profissional de saúde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
