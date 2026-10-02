import { NavLink, Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand-400' : 'text-ink-300 hover:text-white'
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

        <div className="flex items-center gap-6 sm:gap-8">
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
        </div>
      </nav>
    </header>
  );
}
