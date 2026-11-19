import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FlaskConical, Menu, X, Calendar, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand-400' : 'text-ink-300 hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500/15 text-brand-400' : 'text-ink-300 hover:bg-ink-800/60 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/80 backdrop-blur-lg">
      <nav className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="SchedLab — Início">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white transition-transform group-hover:scale-105">
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Sched<span className="text-brand-400">Lab</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:gap-8 md:flex">
          <NavLink to="/" className={linkClass} end>
            Início
          </NavLink>
          <NavLink to="/catalog" className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/hair-types" className={linkClass}>
            Entenda seu cabelo
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            Sobre
          </NavLink>
          <a
            href="https://schediaagendamentostcc.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-schedia-500/30 bg-schedia-500/10 px-3 py-1.5 text-sm font-medium text-schedia-400 transition-all hover:border-schedia-500/60 hover:bg-schedia-500/20 hover:text-schedia-300 active:scale-95"
            aria-label="Abrir Schedia — plataforma de agendamentos (abre em nova aba)"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Schedia</span>
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-ink-800 hover:text-white md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-ink-800 bg-ink-950/95 px-4 py-3 backdrop-blur-lg md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={mobileLinkClass} end onClick={() => setOpen(false)}>
              Início
            </NavLink>
            <NavLink to="/catalog" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Catálogo
            </NavLink>
            <NavLink to="/hair-types" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Entenda seu cabelo
            </NavLink>
            <NavLink to="/about" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Sobre
            </NavLink>
            <a
              href="https://schediaagendamentostcc.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-lg border border-schedia-500/30 bg-schedia-500/10 px-4 py-2.5 text-sm font-medium text-schedia-400 transition-colors hover:bg-schedia-500/20 hover:text-white"
              aria-label="Abrir Schedia — plataforma de agendamentos (abre em nova aba)"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Schedia
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
