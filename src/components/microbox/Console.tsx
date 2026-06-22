import { useEffect, useRef } from "react";
import { useMicroboxStore } from "@/lib/microbox/store";

export function Console() {
  const lines = useMicroboxStore((s) => s.consoleLines);
  const clear = useMicroboxStore((s) => s.clearConsole);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [lines]);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-code-bg text-code-fg">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs uppercase tracking-wider opacity-70">
        <span>Console</span>
        <button onClick={clear} className="rounded px-2 py-0.5 text-[10px] hover:bg-white/10">limpar</button>
      </div>
      <div ref={ref} className="h-48 overflow-auto px-3 py-2 font-mono text-[12px] leading-relaxed">
        {lines.length === 0 && <p className="opacity-50">Sem mensagens. Rode seu código para ver a saída aqui.</p>}
        {lines.map((l) => (
          <div
            key={l.id}
            className={
              l.kind === "error"
                ? "text-red-400"
                : l.kind === "call"
                ? "text-emerald-300/90"
                : l.kind === "info"
                ? "text-blue-300"
                : ""
            }
          >
            {l.kind === "call" ? "» " : l.kind === "error" ? "✗ " : ""}
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}