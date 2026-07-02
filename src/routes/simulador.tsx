import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Simulator } from "@/components/microbox/Simulator";

const DEFAULT_CODE = `from biblioteca_microbox import (
    ligar_pino, desligar_pino, ler_pino,
    esperar, liberar_todos,
)

# Pisca o LED do pino 41 cinco vezes.
try:
    for i in range(5):
        ligar_pino(41)
        esperar(0.4)
        desligar_pino(41)
        esperar(0.4)
finally:
    liberar_todos()
`;

const searchSchema = z.object({
  codigo: z.string().optional(),
});

export const Route = createFileRoute("/simulador")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Simulador — Micro-Box" },
      { name: "description", content: "Editor Python + placa virtual de GPIO. Escreva código com a biblioteca Micro-Box e veja os LEDs reagirem em tempo real." },
      { property: "og:title", content: "Simulador — Micro-Box" },
      { property: "og:description", content: "Editor Python com placa GPIO virtual." },
      { property: "og:url", content: "https://microboxinterface.lovable.app/simulador" },
    ],
    links: [{ rel: "canonical", href: "https://microboxinterface.lovable.app/simulador" }],
  }),
  component: Page,
});

function Page() {
  const { codigo } = Route.useSearch();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Simulador Micro-Box</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Escreva código Python usando a biblioteca <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">biblioteca_microbox</code>. Pinos configurados como entrada ficam clicáveis na placa — simule um botão ou sensor.
        </p>
      </header>
      <Simulator initialCode={codigo ?? DEFAULT_CODE} height="420px" />
    </div>
  );
}