import { createFileRoute, Link } from "@tanstack/react-router";
import { exercicios } from "@/lib/microbox/examples";

export const Route = createFileRoute("/exercicios/")({
  head: () => ({
    meta: [
      { title: "Exercícios — Micro-Box" },
      { name: "description", content: "Desafios com verificação automática para praticar a biblioteca Micro-Box." },
      { property: "og:title", content: "Exercícios — Micro-Box" },
      { property: "og:description", content: "Pratique GPIO com feedback automático." },
      { property: "og:url", content: "https://microboxinterface.lovable.app/exercicios" },
    ],
    links: [{ rel: "canonical", href: "https://microboxinterface.lovable.app/exercicios" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Exercícios</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Desafios curtos. Escreva o código no simulador, rode, e a plataforma verifica automaticamente se a solução está correta.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {exercicios.map((e, i) => (
          <Link
            key={e.slug}
            to="/exercicios/$slug"
            params={{ slug: e.slug }}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Desafio {i + 1}</span>
            <h2 className="font-display text-xl font-bold">{e.titulo}</h2>
            <p className="text-sm text-muted-foreground">{e.enunciado}</p>
            <span className="mt-auto text-sm font-semibold text-primary group-hover:underline">Resolver →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}