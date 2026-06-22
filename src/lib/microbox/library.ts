import { useMicroboxStore } from "./store";

/**
 * JS implementations of the Micro-Box library functions, wired to the
 * zustand store so the virtual board reacts in real time.
 */
export const microboxLib = {
  ligar_pino(numPino: number) {
    const s = useMicroboxStore.getState();
    s.ensurePin(numPino, "output");
    s.setPin(numPino, { modo: "output", ativo: true });
    s.pushCall({ type: "ligar_pino", numPino, t: Date.now() });
    s.log(`ligar_pino(${numPino})`, "call");
  },
  desligar_pino(numPino: number) {
    const s = useMicroboxStore.getState();
    s.ensurePin(numPino, "output");
    s.setPin(numPino, { modo: "output", ativo: false });
    s.pushCall({ type: "desligar_pino", numPino, t: Date.now() });
    s.log(`desligar_pino(${numPino})`, "call");
  },
  ler_pino(numPino: number) {
    const s = useMicroboxStore.getState();
    s.ensurePin(numPino, "input");
    s.setPin(numPino, { modo: "input" });
    const valor = !!s.pinos[numPino]?.ativo;
    s.pushCall({ type: "ler_pino", numPino, valor, t: Date.now() });
    s.log(`ler_pino(${numPino}) → ${valor ? "True" : "False"}`, "call");
    return valor;
  },
  esperar(_segundos: number) {
    // Real waiting is handled by the interpreter (it yields). This is only
    // used as a fallback when called outside a generator context.
    const s = useMicroboxStore.getState();
    s.pushCall({ type: "esperar", segundos: _segundos, t: Date.now() });
  },
  liberar_pino(numPino: number) {
    const s = useMicroboxStore.getState();
    s.releasePin(numPino);
    s.pushCall({ type: "liberar_pino", numPino, t: Date.now() });
    s.log(`liberar_pino(${numPino})`, "call");
  },
  liberar_todos() {
    const s = useMicroboxStore.getState();
    s.releaseAll();
    s.pushCall({ type: "liberar_todos", t: Date.now() });
    s.log(`liberar_todos()`, "call");
  },
  print(...args: unknown[]) {
    const s = useMicroboxStore.getState();
    s.log(args.map((a) => formatValue(a)).join(" "), "log");
  },
  range(...args: number[]) {
    let start = 0;
    let stop = 0;
    let step = 1;
    if (args.length === 1) stop = args[0];
    else if (args.length === 2) [start, stop] = args;
    else if (args.length >= 3) [start, stop, step] = args;
    const out: number[] = [];
    if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
    else if (step < 0) for (let i = start; i > stop; i += step) out.push(i);
    return out;
  },
  len(v: unknown) {
    if (typeof v === "string") return v.length;
    if (Array.isArray(v)) return v.length;
    return 0;
  },
  str(v: unknown) {
    return formatValue(v);
  },
  int(v: unknown) {
    return Math.trunc(Number(v));
  },
  bool(v: unknown) {
    return !!v;
  },
};

export function formatValue(v: unknown): string {
  if (v === true) return "True";
  if (v === false) return "False";
  if (v === null || v === undefined) return "None";
  if (Array.isArray(v)) return "[" + v.map(formatValue).join(", ") + "]";
  return String(v);
}

export type MicroboxLib = typeof microboxLib;