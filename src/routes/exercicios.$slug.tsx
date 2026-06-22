import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { exercicios, type Exercise } from "@/lib/microbox/examples";
import { Simulator } from "@/components/microbox/Simulator";
import { useMicroboxStore } from "@/lib/microbox/store";

export const Route = createFileRoute("/exercicios/$slug")({
  loader: ({ params }) => {
    const ex = exercicios.find((e) => e.slug === params.slug);
    if (!ex) throw notFound();
    return { ex };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.ex.titulo} — Exercício Micro-Box` },
          { name: "description", content: loaderData.ex.enunciado },
          { property: "og:title", content: `${loaderData.ex.titulo} — Micro-Box` },
          { property: "og:description", content: loaderData.ex.enunciado },
        ]
      : [],
  }),
  component: Page,
});

function Page() {
  const { ex } = Route.useLoaderData() as { ex: Exercise };
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showDica, setShowDica] = useState(false);

  function handleRunComplete(ok: boolean) {
    if (!ok) {
      setStatus({ ok: false, msg: "Houve um erro durante a execução. Veja o console." });
      return;
    }
    const { callLog, pinos } = useMicroboxStore.getState();
    const result = ex.verificar({ callLog, pinos });
    if (result === null) setStatus({ ok: true, msg: "Mandou bem! Exercício concluído ✓" });
    else setStatus({ ok: false, msg: result });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link to="/exercicios" className="text-sm text-muted-foreground hover:text-foreground">← Voltar para exercícios</Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{ex.titulo}</h1>
        <div className="mt-4 rounded-xl border border-border bg-accent/40 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">Enunciado</p>
          <p className="mt-1 text-foreground">{ex.enunciado}</p>
          <button
            onClick={() => setShowDica((v) => !v)}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            {showDica ? "Ocultar dica" : "Mostrar dica"}
          </button>
          {showDica && <p className="mt-2 text-sm text-muted-foreground">{ex.dica}</p>}
        </div>
      </header>

      {status && (
        <div
          className={
            "mb-4 rounded-lg border px-4 py-3 text-sm font-semibold " +
            (status.ok
              ? "border-led-on/40 bg-led-on/15 text-foreground"
              : "border-destructive/40 bg-destructive/10 text-destructive")
          }
        >
          {status.ok ? "✓ " : "✗ "} {status.msg}
        </div>
      )}

      <Simulator initialCode={ex.codigoInicial} onRunComplete={handleRunComplete} height="360px" />
    </div>
  );
}