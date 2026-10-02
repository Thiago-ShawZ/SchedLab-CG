import { Link } from 'react-router-dom';
import { FlaskConical, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="container-app py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display font-semibold text-white">SchedLab</span>
          </div>

          <div className="max-w-md">
            <div className="flex items-start gap-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-ink-300">
                Conteúdo educativo. As informações apresentadas não substituem avaliação de um
                dermatologista ou outro profissional de saúde.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-800 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>SchedLab — Guia Interativo de Cuidados Capilares. Projeto acadêmico de Computação Gráfica.</p>
          <div className="flex gap-4">
            <Link to="/catalog" className="hover:text-brand-400 transition-colors">
              Catálogo
            </Link>
            <Link to="/hair-types" className="hover:text-brand-400 transition-colors">
              Entenda seu cabelo
            </Link>
            <Link to="/about" className="hover:text-brand-400 transition-colors">
              Sobre
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
