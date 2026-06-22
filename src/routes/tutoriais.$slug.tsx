import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { tutoriais, type Tutorial } from "@/lib/microbox/examples";
import { Simulator } from "@/components/microbox/Simulator";

export const Route = createFileRoute("/tutoriais/$slug")({
  loader: ({ params }) => {
    const tutorial = tutoriais.find((t) => t.slug === params.slug);
    if (!tutorial) throw notFound();
    return { tutorial };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.tutorial.titulo} — Tutorial Micro-Box` },
          { name: "description", content: loaderData.tutorial.resumo },
          { property: "og:title", content: `${loaderData.tutorial.titulo} — Micro-Box` },
          { property: "og:description", content: loaderData.tutorial.resumo },
        ]
      : [],
  }),
  component: Page,
});

function Page() {
  const { tutorial } = Route.useLoaderData() as { tutorial: Tutorial };
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <Link to="/tutoriais" className="text-sm text-muted-foreground hover:text-foreground">← Voltar para tutoriais</Link>
      <header className="mt-3 mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">{tutorial.titulo}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tutorial.resumo}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <ol className="flex flex-col gap-5">
          {tutorial.passos.map((p, i) => (
            <li key={i} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">{i + 1}</span>
                Passo {i + 1}
              </div>
              <p className="text-sm text-foreground/90">{p.texto}</p>
              {p.codigo && (
                <pre className="mt-3 overflow-x-auto rounded-md bg-code-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-code-fg"><code>{p.codigo}</code></pre>
              )}
            </li>
          ))}
        </ol>

        <div>
          <h2 className="mb-3 font-display text-lg font-bold">Tente no simulador</h2>
          <Simulator initialCode={tutorial.codigoFinal} />
        </div>
      </div>
    </div>
  );
}