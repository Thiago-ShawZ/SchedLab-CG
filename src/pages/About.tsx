import { Boxes, Cpu, Layers, Lightbulb, MousePointerClick, BookOpen, AlertCircle } from 'lucide-react';
import { GENERAL_SOURCES } from '@/data/products';
import SourceList from '@/components/ui/SourceList';

const TECH_STACK = [
  { name: 'React', desc: 'Biblioteca para construção de interfaces' },
  { name: 'TypeScript', desc: 'Tipagem estática para maior segurança' },
  { name: 'Three.js', desc: 'Biblioteca 3D baseada em WebGL' },
  { name: 'React Three Fiber', desc: 'Renderizador React para Three.js' },
  { name: 'Drei', desc: 'Componentes auxiliares para R3F' },
  { name: 'WebGL', desc: 'API de renderização 3D no navegador' },
];

const CG_TOPICS = [
  { icon: Boxes, label: 'Modelagem 3D', desc: 'Geometrias e formas compostas' },
  { icon: Layers, label: 'Materiais e Texturas', desc: 'Superfícies, cores e reflexos' },
  { icon: Lightbulb, label: 'Iluminação', desc: 'Luzes direcionais, ambientes e pontuais' },
  { icon: Cpu, label: 'Câmera Perspectiva', desc: 'Projeção e campo de visão' },
  { icon: MousePointerClick, label: 'Interação', desc: 'Mouse, toque e OrbitControls' },
];

export default function About() {
  return (
    <div className="container-app animate-fadeIn py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Sobre o SchedLab
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          O SchedLab é um projeto acadêmico de Computação Gráfica que utiliza tecnologias de
          renderização 3D para apresentar informações sobre produtos capilares através de uma
          experiência interativa. O objetivo é demonstrar conceitos de modelagem, iluminação,
          materiais e interação em um contexto educativo.
        </p>

        {/* Tech stack */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-white">Tecnologias</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="card flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-white">{tech.name}</p>
                  <p className="text-sm text-ink-300">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CG topics */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-white">
            Computação Gráfica aplicada
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            O projeto demonstra os seguintes conceitos de Computação Gráfica:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CG_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div key={topic.label} className="card flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{topic.label}</p>
                    <p className="text-sm text-ink-300">{topic.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Scope */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-white">Escopo do projeto</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-ink-700 bg-ink-800/30 p-4">
              <BookOpen className="h-5 w-5 flex-shrink-0 text-brand-400" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-300">
                Projeto totalmente front-end, sem login, cadastro, pagamentos, banco de dados ou
                backend. Foco em desempenho, simplicidade e qualidade visual.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-accent-500/30 bg-accent-500/5 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-accent-400" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-300">
                Conteúdo educativo. As informações apresentadas não substituem avaliação de um
                dermatologista ou outro profissional de saúde. Não há chatbot, IA, autenticação ou
                funcionalidades fora do escopo.
              </p>
            </div>
          </div>
        </section>

        {/* Fontes */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-white">Fontes consultadas</h2>
          <p className="mt-2 text-sm text-ink-300">
            O conteúdo informativo do SchedLab é baseado nas seguintes fontes oficiais:
          </p>
          <div className="mt-4 card p-5">
            <SourceList sources={GENERAL_SOURCES} />
          </div>
        </section>
      </div>
    </div>
  );
}
