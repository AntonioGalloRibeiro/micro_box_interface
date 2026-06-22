import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { Board } from "./Board";
import { Console } from "./Console";
import { useMicroboxStore } from "@/lib/microbox/store";
import { runPython } from "@/lib/microbox/interpreter";

interface Props {
  initialCode: string;
  /** Optional callback after a run finishes; receives true if completed without errors. */
  onRunComplete?: (ok: boolean) => void;
  /** Compact mode: smaller editor, side-by-side board hidden on small screens. */
  height?: string;
}

export function Simulator({ initialCode, onRunComplete, height = "340px" }: Props) {
  const [code, setCode] = useState(initialCode);
  const log = useMicroboxStore((s) => s.log);
  const reset = useMicroboxStore((s) => s.reset);
  const setRunning = useMicroboxStore((s) => s.setRunning);
  const running = useMicroboxStore((s) => s.running);
  const stopRef = useRef(false);

  useEffect(() => { setCode(initialCode); }, [initialCode]);

  async function run() {
    if (running) return;
    stopRef.current = false;
    reset();
    setRunning(true);
    log("▶ Iniciando execução…", "info");
    let ok = true;
    try {
      await runPython(code, {
        onLog: (text, kind) => log(text, kind),
        shouldStop: () => stopRef.current,
      });
      log("✓ Programa finalizado.", "info");
    } catch {
      ok = false;
    } finally {
      setRunning(false);
      onRunComplete?.(ok);
    }
  }

  function stop() {
    if (!running) return;
    stopRef.current = true;
  }

  function resetAll() {
    stopRef.current = true;
    reset();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={run}
            disabled={running}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 disabled:opacity-50"
          >
            {running ? "Rodando…" : "▶ Rodar"}
          </button>
          <button
            onClick={stop}
            disabled={!running}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            ■ Parar
          </button>
          <button
            onClick={resetAll}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
          >
            Resetar
          </button>
          <button
            onClick={() => setCode(initialCode)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Carregar exemplo
          </button>
        </div>
        <CodeEditor value={code} onChange={setCode} height={height} />
        <Console />
      </div>
      <Board />
    </div>
  );
}