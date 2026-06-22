import { motion } from "framer-motion";
import { useMicroboxStore } from "@/lib/microbox/store";

interface Props {
  /** Total pin count to render. Default 64 (chip 0 + chip 1). */
  pins?: number;
}

export function Board({ pins = 64 }: Props) {
  const pinos = useMicroboxStore((s) => s.pinos);
  const toggle = useMicroboxStore((s) => s.togglePinValue);
  const ensure = useMicroboxStore((s) => s.ensurePin);

  return (
    <div className="rounded-2xl bg-board p-5 text-board-foreground shadow-[var(--shadow-elevated)]">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider opacity-70">
        <span>Placa virtual Micro-Box</span>
        <span className="font-mono">{Object.keys(pinos).length} pino(s) ativo(s)</span>
      </div>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-16">
        {Array.from({ length: pins }, (_, i) => {
          const p = pinos[i];
          const modo = p?.modo;
          const ativo = !!p?.ativo;
          const isInput = modo === "input";
          const isOutput = modo === "output";
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (!p) ensure(i, "input");
                if (isInput || !p) {
                  if (!p) ensure(i, "input");
                  toggle(i);
                }
              }}
              title={
                !p
                  ? `Pino ${i} (livre — clique para usar como entrada virtual)`
                  : `Pino ${i} · ${modo} · ${ativo ? "ativo" : "inativo"}`
              }
              className={[
                "group relative flex aspect-square flex-col items-center justify-center rounded-md border text-[10px] font-mono transition",
                "border-white/10 bg-white/5 hover:bg-white/10",
                isInput ? "ring-1 ring-pin-input" : "",
                isOutput ? "ring-1 ring-pin-output" : "",
              ].join(" ")}
            >
              <motion.span
                animate={{
                  scale: ativo ? 1 : 0.7,
                  opacity: ativo ? 1 : 0.35,
                }}
                transition={{ duration: 0.18 }}
                className="h-3 w-3 rounded-full"
                style={{
                  background: ativo ? "var(--led-on)" : "var(--led-off)",
                  boxShadow: ativo ? "var(--shadow-led)" : "none",
                }}
              />
              <span className="mt-1 opacity-70">{i}</span>
              {p && (
                <span
                  className="absolute right-0.5 top-0.5 text-[8px] uppercase tracking-wider"
                  style={{ color: isInput ? "var(--pin-input)" : "var(--pin-output)" }}
                >
                  {isInput ? "in" : "out"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-board-foreground/70">
        <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--led-on)", boxShadow: "var(--shadow-led)" }} /> LED ativo</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--led-off)" }} /> LED inativo</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded border" style={{ borderColor: "var(--pin-output)" }} /> saída (output)</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded border" style={{ borderColor: "var(--pin-input)" }} /> entrada (input — clique para alternar)</span>
      </div>
    </div>
  );
}