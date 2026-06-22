import { createFileRoute, Link } from "@tanstack/react-router";
import { tutoriais } from "@/lib/microbox/examples";

export const Route = createFileRoute("/tutoriais/")({
  head: () => ({
    meta: [
      { title: "Tutoriais — Micro-Box" },
      { name: "description", content: "Tutoriais passo a passo para aprender a biblioteca Micro-Box: piscar LED, ler botão, sequências e mais." },
      { property: "og:title", content: "Tutoriais — Micro-Box" },
      { property: "og:description", content: "Aprenda Micro-Box passo a passo." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Tutoriais</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cada tutorial é um caminho curto, com explicação, código pronto e o simulador integrado para você rodar na hora.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {tutoriais.map((t, i) => (
          <Link
            key={t.slug}
            to="/tutoriais/$slug"
            params={{ slug: t.slug }}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tutorial {i + 1}</span>
            <h2 className="font-display text-xl font-bold">{t.titulo}</h2>
            <p className="text-sm text-muted-foreground">{t.resumo}</p>
            <span className="mt-auto text-sm font-semibold text-primary group-hover:underline">Começar →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}