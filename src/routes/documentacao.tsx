import { createFileRoute, Link } from "@tanstack/react-router";
import { funcoes } from "@/lib/microbox/docs";

export const Route = createFileRoute("/documentacao")({
  head: () => ({
    meta: [
      { title: "Documentação — Micro-Box" },
      { name: "description", content: "Referência completa da biblioteca Micro-Box: ligar_pino, desligar_pino, ler_pino, esperar, liberar_pino, liberar_todos e DefnPino." },
      { property: "og:title", content: "Documentação — Micro-Box" },
      { property: "og:description", content: "Referência das funções da biblioteca Micro-Box em português." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Funções</p>
        <ul className="flex flex-col gap-1 text-sm">
          {funcoes.map((f) => (
            <li key={f.nome}>
              <a href={`#${f.nome}`} className="block rounded-md px-3 py-1.5 font-mono text-foreground/80 hover:bg-secondary hover:text-foreground">
                {f.nome}()
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col gap-10">
        <header>
          <h1 className="font-display text-4xl font-bold tracking-tight">Documentação</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A biblioteca <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">biblioteca_microbox</code> oferece funções em PT-BR para controlar GPIOs em cima da <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">gpiod</code>. Um cache interno guarda os pinos já configurados, então você pode chamar as funções dentro de loops sem requisitar o GPIO novamente.
          </p>
        </header>

        {funcoes.map((f) => (
          <article key={f.nome} id={f.nome} className="scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">
                <code className="font-mono">{f.assinatura}</code>
              </h2>
              <Link
                to="/simulador"
                search={{ codigo: f.exemplo }}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Abrir no simulador →
              </Link>
            </div>
            <p className="mt-2 text-foreground/90">{f.resumo}</p>
            <p className="mt-3 text-sm text-muted-foreground">{f.descricao}</p>

            {f.parametros.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parâmetros</p>
                <ul className="space-y-2 text-sm">
                  {f.parametros.map((p) => (
                    <li key={p.nome} className="flex flex-col rounded-md border border-border bg-muted/50 p-3">
                      <span><code className="font-mono text-primary">{p.nome}</code> <span className="text-xs text-muted-foreground">: {p.tipo}</span></span>
                      <span className="mt-1 text-muted-foreground">{p.descricao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {f.retorno && (
              <p className="mt-4 text-sm"><span className="font-semibold">Retorno:</span> <span className="text-muted-foreground">{f.retorno}</span></p>
            )}

            <div className="mt-5 overflow-hidden rounded-lg border border-border bg-code-bg">
              <div className="border-b border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wider text-code-fg/70">Exemplo</div>
              <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed text-code-fg"><code>{f.exemplo}</code></pre>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}