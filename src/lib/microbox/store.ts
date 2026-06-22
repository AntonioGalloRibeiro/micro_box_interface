import { create } from "zustand";

export type PinMode = "output" | "input";

export interface PinState {
  numPino: number;
  modo: PinMode;
  ativo: boolean;
}

export interface ConsoleLine {
  id: number;
  kind: "log" | "error" | "info" | "call";
  text: string;
}

export type CallLogEntry =
  | { type: "ligar_pino"; numPino: number; t: number }
  | { type: "desligar_pino"; numPino: number; t: number }
  | { type: "ler_pino"; numPino: number; valor: boolean; t: number }
  | { type: "esperar"; segundos: number; t: number }
  | { type: "liberar_pino"; numPino: number; t: number }
  | { type: "liberar_todos"; t: number };

interface MicroboxState {
  pinos: Record<number, PinState>;
  consoleLines: ConsoleLine[];
  callLog: CallLogEntry[];
  running: boolean;
  startedAt: number;

  setPin: (numPino: number, patch: Partial<PinState> & { numPino?: number }) => void;
  ensurePin: (numPino: number, modo: PinMode) => void;
  togglePinValue: (numPino: number) => void;
  releasePin: (numPino: number) => void;
  releaseAll: () => void;
  log: (text: string, kind?: ConsoleLine["kind"]) => void;
  clearConsole: () => void;
  reset: () => void;
  setRunning: (v: boolean) => void;
  pushCall: (entry: CallLogEntry) => void;
}

let lineId = 0;

export const useMicroboxStore = create<MicroboxState>((set, get) => ({
  pinos: {},
  consoleLines: [],
  callLog: [],
  running: false,
  startedAt: 0,

  setPin: (numPino, patch) =>
    set((s) => ({
      pinos: {
        ...s.pinos,
        [numPino]: {
          numPino,
          modo: patch.modo ?? s.pinos[numPino]?.modo ?? "output",
          ativo: patch.ativo ?? s.pinos[numPino]?.ativo ?? false,
        },
      },
    })),

  ensurePin: (numPino, modo) => {
    const existing = get().pinos[numPino];
    if (!existing) {
      set((s) => ({
        pinos: { ...s.pinos, [numPino]: { numPino, modo, ativo: false } },
      }));
    }
  },

  togglePinValue: (numPino) =>
    set((s) => {
      const p = s.pinos[numPino];
      if (!p) return s;
      return { pinos: { ...s.pinos, [numPino]: { ...p, ativo: !p.ativo } } };
    }),

  releasePin: (numPino) =>
    set((s) => {
      const next = { ...s.pinos };
      delete next[numPino];
      return { pinos: next };
    }),

  releaseAll: () => set({ pinos: {} }),

  log: (text, kind = "log") =>
    set((s) => ({
      consoleLines: [...s.consoleLines, { id: ++lineId, kind, text }].slice(-300),
    })),

  clearConsole: () => set({ consoleLines: [] }),

  reset: () =>
    set({
      pinos: {},
      consoleLines: [],
      callLog: [],
      running: false,
      startedAt: 0,
    }),

  setRunning: (v) => set({ running: v, startedAt: v ? Date.now() : 0 }),

  pushCall: (entry) =>
    set((s) => ({ callLog: [...s.callLog, entry].slice(-500) })),
}));