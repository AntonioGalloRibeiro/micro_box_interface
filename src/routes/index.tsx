import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Micro-Box — Aprenda GPIO com Python" },
      { name: "description", content: "Plataforma educacional Micro-Box: documentação, tutoriais e um simulador visual para aprender a controlar GPIOs com Python." },
      { property: "og:title", content: "Micro-Box — Aprenda GPIO com Python" },
      { property: "og:description", content: "Documentação, tutoriais e simulador para a biblioteca Micro-Box em PT-BR." },
    ],
  }),
  component: Index,
});

function Index() {
  const features = [
    { title: "Documentação", desc: "Referência de cada função da biblioteca em português.", to: "/documentacao", emoji: "📘" },
    { title: "Tutoriais", desc: "Aprenda passo a passo: piscar LED, ler botão, sequências.", to: "/tutoriais", emoji: "🎓" },
    { title: "Simulador", desc: "Editor de código + placa virtual com 64 pinos reagindo em tempo real.", to: "/simulador", emoji: "🔌" },
    { title: "Exercícios", desc: "Desafios curtos com verificação automática.", to: "/exercicios", emoji: "🏁" },
  ] as const;

  return (
    <div>
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 text-primary-foreground md:grid-cols-[1.1fr_1fr] md:py-28">
          <div className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              Projeto Micro-Box · biblioteca em PT-BR
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Aprenda <span className="underline decoration-white/40 underline-offset-4">GPIO</span> com Python, sem precisar de hardware.
            </h1>
            <p className="max-w-xl text-lg text-white/90">
              Documentação, tutoriais e um simulador visual de pinos GPIO para apoiar estudantes iniciantes na biblioteca <code className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-sm">biblioteca_microbox</code>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/simulador" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition hover:bg-white/90">
                Abrir o simulador
              </Link>
              <Link to="/tutoriais" className="rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Começar pelos tutoriais
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-[var(--code-bg)] p-5 font-mono text-sm text-[var(--code-fg)] shadow-[var(--shadow-elevated)]">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-300/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs opacity-60">piscar_led.py</span>
            </div>
<pre className="overflow-x-auto leading-relaxed"><code>{`from biblioteca_microbox import (
    ligar_pino, desligar_pino, esperar, liberar_todos,
)

try:
    while True:
        ligar_pino(41)
        esperar(1)
        desligar_pino(41)
        esperar(1)
finally:
    liberar_todos()`}</code></pre>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Tudo em um só lugar</h2>
          <p className="mt-3 text-muted-foreground">
            Quatro frentes pensadas para quem está aprendendo eletrônica digital com Python.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="text-3xl" aria-hidden>{f.emoji}</span>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
              <span className="mt-auto text-sm font-semibold text-primary group-hover:underline">Acessar →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {[
            { n: "7", t: "funções na biblioteca", d: "ligar / desligar / ler pino, esperar, liberar e a base DefnPino." },
            { n: "64", t: "pinos no simulador", d: "Distribuídos em 2 chips GPIO virtuais — exatamente como o hardware real." },
            { n: "100%", t: "no navegador", d: "Sem instalar nada. Editor Python, placa visual e console integrados." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <p className="font-display text-4xl font-extrabold text-primary">{s.n}</p>
              <p className="mt-1 font-semibold">{s.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
