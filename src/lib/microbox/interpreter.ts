/**
 * Tiny Python-subset interpreter for the Micro-Box simulator.
 * Supports the features needed by the library examples:
 *
 * - Numeric/string/bool/None literals, lists
 * - Variables, assignment, augmented assignment (+=, -=, *=, /=)
 * - Arithmetic, comparison, boolean operators (and/or/not)
 * - if / elif / else / while / for-in-range / try-finally / break / continue / pass
 * - Function calls (builtins + library), attribute access for `time.sleep`
 * - `import time` / `from biblioteca_microbox import *` (silently ignored)
 * - `print(...)` and the Micro-Box functions (ligar_pino, etc.)
 *
 * Execution is cooperative: `esperar(s)` / `time.sleep(s)` yields control to
 * the host (via a generator) so the UI updates between iterations.
 */

import { microboxLib } from "./library";

type Token =
  | { type: "NUMBER"; value: number; line: number }
  | { type: "STRING"; value: string; line: number }
  | { type: "NAME"; value: string; line: number }
  | { type: "OP"; value: string; line: number }
  | { type: "NEWLINE"; line: number }
  | { type: "INDENT"; line: number }
  | { type: "DEDENT"; line: number }
  | { type: "EOF"; line: number };

const KEYWORDS = new Set([
  "if", "elif", "else", "while", "for", "in", "and", "or", "not",
  "True", "False", "None", "pass", "break", "continue", "return",
  "try", "finally", "except", "import", "from", "as", "def",
]);

function tokenize(source: string): Token[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const tokens: Token[] = [];
  const indents: number[] = [0];
  let parenDepth = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const lineNo = lineIdx + 1;
    // strip comments
    let line = "";
    let inStr: false | '"' | "'" = false;
    for (let i = 0; i < rawLine.length; i++) {
      const c = rawLine[i];
      if (inStr) {
        line += c;
        if (c === "\\" && i + 1 < rawLine.length) { line += rawLine[++i]; continue; }
        if (c === inStr) inStr = false;
      } else {
        if (c === "#") break;
        if (c === '"' || c === "'") inStr = c;
        line += c;
      }
    }
    if (line.trim() === "") continue;

    // indent — only emit INDENT/DEDENT when not inside open brackets
    let indent = 0;
    while (indent < line.length && (line[indent] === " " || line[indent] === "\t")) {
      indent += line[indent] === "\t" ? 4 : 1;
    }
    const content = line.slice(indent);
    if (parenDepth === 0) {
      const top = indents[indents.length - 1];
      if (indent > top) {
        indents.push(indent);
        tokens.push({ type: "INDENT", line: lineNo });
      } else {
        while (indent < indents[indents.length - 1]) {
          indents.pop();
          tokens.push({ type: "DEDENT", line: lineNo });
        }
        if (indent !== indents[indents.length - 1]) {
          throw new Error(`Indentação inconsistente na linha ${lineNo}`);
        }
      }
    }

    // tokens within line
    let i = 0;
    while (i < content.length) {
      const c = content[i];
      if (c === " " || c === "\t") { i++; continue; }
      // number
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < content.length && /[0-9.]/.test(content[j])) j++;
        tokens.push({ type: "NUMBER", value: parseFloat(content.slice(i, j)), line: lineNo });
        i = j; continue;
      }
      // string
      if (c === '"' || c === "'") {
        const quote = c;
        let j = i + 1;
        let s = "";
        while (j < content.length && content[j] !== quote) {
          if (content[j] === "\\" && j + 1 < content.length) {
            const nx = content[j + 1];
            s += nx === "n" ? "\n" : nx === "t" ? "\t" : nx === "\\" ? "\\" : nx === quote ? quote : nx;
            j += 2;
          } else {
            s += content[j++];
          }
        }
        if (j >= content.length) throw new Error(`String não fechada na linha ${lineNo}`);
        tokens.push({ type: "STRING", value: s, line: lineNo });
        i = j + 1; continue;
      }
      // identifier
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < content.length && /[A-Za-z0-9_]/.test(content[j])) j++;
        const value = content.slice(i, j);
        tokens.push({ type: "NAME", value, line: lineNo });
        i = j; continue;
      }
      // multi-char ops
      const two = content.slice(i, i + 2);
      if (["==", "!=", "<=", ">=", "//", "**", "+=", "-=", "*=", "/="].includes(two)) {
        tokens.push({ type: "OP", value: two, line: lineNo });
        i += 2; continue;
      }
      if ("()[]{}:,.+-*/<>=%".includes(c)) {
        if (c === "(" || c === "[" || c === "{") parenDepth++;
        else if (c === ")" || c === "]" || c === "}") parenDepth = Math.max(0, parenDepth - 1);
        tokens.push({ type: "OP", value: c, line: lineNo });
        i++; continue;
      }
      throw new Error(`Caractere inesperado '${c}' na linha ${lineNo}`);
    }
    if (parenDepth === 0) tokens.push({ type: "NEWLINE", line: lineNo });
  }
  while (indents.length > 1) {
    indents.pop();
    tokens.push({ type: "DEDENT", line: lines.length });
  }
  tokens.push({ type: "EOF", line: lines.length });
  return tokens;
}

// ---------- AST ----------
type Expr =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "none" }
  | { kind: "name"; value: string }
  | { kind: "list"; items: Expr[] }
  | { kind: "attr"; obj: Expr; name: string }
  | { kind: "index"; obj: Expr; idx: Expr }
  | { kind: "call"; fn: Expr; args: Expr[] }
  | { kind: "unary"; op: string; arg: Expr }
  | { kind: "binop"; op: string; left: Expr; right: Expr }
  | { kind: "compare"; op: string; left: Expr; right: Expr }
  | { kind: "bool_op"; op: "and" | "or"; left: Expr; right: Expr };

type Stmt =
  | { kind: "expr"; expr: Expr; line: number }
  | { kind: "assign"; target: Expr; value: Expr; line: number }
  | { kind: "augassign"; target: Expr; op: string; value: Expr; line: number }
  | { kind: "if"; branches: { cond: Expr; body: Stmt[] }[]; elseBody?: Stmt[]; line: number }
  | { kind: "while"; cond: Expr; body: Stmt[]; line: number }
  | { kind: "for"; var: string; iter: Expr; body: Stmt[]; line: number }
  | { kind: "try"; body: Stmt[]; finallyBody?: Stmt[]; line: number }
  | { kind: "break"; line: number }
  | { kind: "continue"; line: number }
  | { kind: "pass"; line: number }
  | { kind: "import"; line: number };

class Parser {
  pos = 0;
  constructor(public tokens: Token[]) {}
  peek(o = 0) { return this.tokens[this.pos + o]; }
  eat(type: string, value?: string): Token {
    const t = this.tokens[this.pos];
    if (t.type !== type || (value !== undefined && (t as { value?: string }).value !== value)) {
      throw new Error(`Esperado ${type}${value ? " '" + value + "'" : ""}, encontrado ${t.type} '${(t as { value?: unknown }).value ?? ""}' na linha ${t.line}`);
    }
    this.pos++;
    return t;
  }
  match(type: string, value?: string): boolean {
    const t = this.tokens[this.pos];
    if (t.type !== type) return false;
    if (value !== undefined && (t as { value?: string }).value !== value) return false;
    return true;
  }

  parseProgram(): Stmt[] {
    const stmts: Stmt[] = [];
    while (!this.match("EOF")) {
      stmts.push(this.parseStmt());
    }
    return stmts;
  }

  parseBlock(): Stmt[] {
    this.eat("OP", ":");
    this.eat("NEWLINE");
    this.eat("INDENT");
    const stmts: Stmt[] = [];
    while (!this.match("DEDENT") && !this.match("EOF")) {
      stmts.push(this.parseStmt());
    }
    if (this.match("DEDENT")) this.pos++;
    return stmts;
  }

  parseStmt(): Stmt {
    const t = this.peek();
    if (t.type === "NAME") {
      if (t.value === "if") return this.parseIf();
      if (t.value === "while") { this.pos++; const cond = this.parseExpr(); const body = this.parseBlock(); return { kind: "while", cond, body, line: t.line }; }
      if (t.value === "for") return this.parseFor();
      if (t.value === "try") return this.parseTry();
      if (t.value === "break") { this.pos++; this.eat("NEWLINE"); return { kind: "break", line: t.line }; }
      if (t.value === "continue") { this.pos++; this.eat("NEWLINE"); return { kind: "continue", line: t.line }; }
      if (t.value === "pass") { this.pos++; this.eat("NEWLINE"); return { kind: "pass", line: t.line }; }
      if (t.value === "import" || t.value === "from") {
        // consume rest of line
        while (!this.match("NEWLINE") && !this.match("EOF")) this.pos++;
        if (this.match("NEWLINE")) this.pos++;
        return { kind: "import", line: t.line };
      }
      if (t.value === "def" || t.value === "return") {
        throw new Error(`'${t.value}' não é suportado neste simulador (linha ${t.line}).`);
      }
    }
    // assignment or expression
    const expr = this.parseExpr();
    if (this.match("OP", "=")) {
      this.pos++;
      const value = this.parseExpr();
      this.eat("NEWLINE");
      return { kind: "assign", target: expr, value, line: t.line };
    }
    if (["+=", "-=", "*=", "/="].some((op) => this.match("OP", op))) {
      const op = (this.peek() as { value: string }).value;
      this.pos++;
      const value = this.parseExpr();
      this.eat("NEWLINE");
      return { kind: "augassign", target: expr, op, value, line: t.line };
    }
    this.eat("NEWLINE");
    return { kind: "expr", expr, line: t.line };
  }

  parseIf(): Stmt {
    const t = this.eat("NAME", "if");
    const branches: { cond: Expr; body: Stmt[] }[] = [];
    const cond = this.parseExpr();
    branches.push({ cond, body: this.parseBlock() });
    while (this.match("NAME", "elif")) {
      this.pos++;
      const c = this.parseExpr();
      branches.push({ cond: c, body: this.parseBlock() });
    }
    let elseBody: Stmt[] | undefined;
    if (this.match("NAME", "else")) {
      this.pos++;
      elseBody = this.parseBlock();
    }
    return { kind: "if", branches, elseBody, line: t.line };
  }

  parseFor(): Stmt {
    const t = this.eat("NAME", "for");
    const varTok = this.eat("NAME") as Token & { value: string };
    this.eat("NAME", "in");
    const iter = this.parseExpr();
    const body = this.parseBlock();
    return { kind: "for", var: varTok.value, iter, body, line: t.line };
  }

  parseTry(): Stmt {
    const t = this.eat("NAME", "try");
    const body = this.parseBlock();
    let finallyBody: Stmt[] | undefined;
    // optional except (ignored)
    while (this.match("NAME", "except")) {
      while (!this.match("OP", ":") && !this.match("EOF")) this.pos++;
      this.parseBlock();
    }
    if (this.match("NAME", "finally")) {
      this.pos++;
      finallyBody = this.parseBlock();
    }
    return { kind: "try", body, finallyBody, line: t.line };
  }

  // Expression precedence: or > and > not > comparison > +/- > */// > unary > call/attr/index > atom
  parseExpr(): Expr { return this.parseOr(); }
  parseOr(): Expr {
    let left = this.parseAnd();
    while (this.match("NAME", "or")) { this.pos++; const right = this.parseAnd(); left = { kind: "bool_op", op: "or", left, right }; }
    return left;
  }
  parseAnd(): Expr {
    let left = this.parseNot();
    while (this.match("NAME", "and")) { this.pos++; const right = this.parseNot(); left = { kind: "bool_op", op: "and", left, right }; }
    return left;
  }
  parseNot(): Expr {
    if (this.match("NAME", "not")) { this.pos++; return { kind: "unary", op: "not", arg: this.parseNot() }; }
    return this.parseCompare();
  }
  parseCompare(): Expr {
    let left = this.parseAdd();
    const cmpOps = ["==", "!=", "<", ">", "<=", ">="];
    while (cmpOps.some((o) => this.match("OP", o))) {
      const op = (this.peek() as { value: string }).value;
      this.pos++;
      const right = this.parseAdd();
      left = { kind: "compare", op, left, right };
    }
    return left;
  }
  parseAdd(): Expr {
    let left = this.parseMul();
    while (this.match("OP", "+") || this.match("OP", "-")) {
      const op = (this.peek() as { value: string }).value;
      this.pos++;
      const right = this.parseMul();
      left = { kind: "binop", op, left, right };
    }
    return left;
  }
  parseMul(): Expr {
    let left = this.parseUnary();
    while (["*", "/", "//", "%"].some((o) => this.match("OP", o))) {
      const op = (this.peek() as { value: string }).value;
      this.pos++;
      const right = this.parseUnary();
      left = { kind: "binop", op, left, right };
    }
    return left;
  }
  parseUnary(): Expr {
    if (this.match("OP", "-")) { this.pos++; return { kind: "unary", op: "-", arg: this.parseUnary() }; }
    if (this.match("OP", "+")) { this.pos++; return this.parseUnary(); }
    return this.parsePostfix();
  }
  parsePostfix(): Expr {
    let node = this.parseAtom();
    for (;;) {
      if (this.match("OP", "(")) {
        this.pos++;
        const args: Expr[] = [];
        if (!this.match("OP", ")")) {
          args.push(this.parseExpr());
          while (this.match("OP", ",")) { this.pos++; args.push(this.parseExpr()); }
        }
        this.eat("OP", ")");
        node = { kind: "call", fn: node, args };
      } else if (this.match("OP", ".")) {
        this.pos++;
        const name = (this.eat("NAME") as Token & { value: string }).value;
        node = { kind: "attr", obj: node, name };
      } else if (this.match("OP", "[")) {
        this.pos++;
        const idx = this.parseExpr();
        this.eat("OP", "]");
        node = { kind: "index", obj: node, idx };
      } else {
        break;
      }
    }
    return node;
  }
  parseAtom(): Expr {
    const t = this.peek();
    if (t.type === "NUMBER") { this.pos++; return { kind: "num", value: t.value }; }
    if (t.type === "STRING") { this.pos++; return { kind: "str", value: t.value }; }
    if (t.type === "NAME") {
      if (t.value === "True") { this.pos++; return { kind: "bool", value: true }; }
      if (t.value === "False") { this.pos++; return { kind: "bool", value: false }; }
      if (t.value === "None") { this.pos++; return { kind: "none" }; }
      this.pos++;
      return { kind: "name", value: t.value };
    }
    if (t.type === "OP" && t.value === "(") {
      this.pos++;
      const e = this.parseExpr();
      this.eat("OP", ")");
      return e;
    }
    if (t.type === "OP" && t.value === "[") {
      this.pos++;
      const items: Expr[] = [];
      if (!this.match("OP", "]")) {
        items.push(this.parseExpr());
        while (this.match("OP", ",")) { this.pos++; items.push(this.parseExpr()); }
      }
      this.eat("OP", "]");
      return { kind: "list", items };
    }
    throw new Error(`Token inesperado '${(t as { value?: unknown }).value ?? t.type}' na linha ${t.line}`);
  }
}

// ---------- Interpreter ----------
class BreakSignal {}
class ContinueSignal {}

type Scope = Record<string, unknown>;

export interface RunOptions {
  onLog?: (text: string, kind: "log" | "error" | "info") => void;
  shouldStop?: () => boolean;
  /** Hard cap to avoid infinite loops without sleep. */
  maxSteps?: number;
}

/** Async runner — executes the parsed program with cooperative yielding. */
export async function runPython(source: string, opts: RunOptions = {}): Promise<void> {
  const tokens = tokenize(source);
  const program = new Parser(tokens).parseProgram();
  const scope: Scope = {};
  const onLog = opts.onLog ?? (() => {});
  let steps = 0;
  const maxSteps = opts.maxSteps ?? 200_000;

  function evalExpr(e: Expr): unknown {
    switch (e.kind) {
      case "num": return e.value;
      case "str": return e.value;
      case "bool": return e.value;
      case "none": return null;
      case "list": return e.items.map(evalExpr);
      case "name": {
        if (e.value in scope) return scope[e.value];
        if (e.value === "time") return { sleep: (s: number) => sleepMarker(s) };
        if (e.value in microboxLib) return (microboxLib as Record<string, unknown>)[e.value];
        throw new Error(`Nome não definido: '${e.value}'`);
      }
      case "attr": {
        const obj = evalExpr(e.obj) as Record<string, unknown> | null;
        if (obj == null) throw new Error(`Acesso a atributo '.${e.name}' em None`);
        return obj[e.name];
      }
      case "index": {
        const obj = evalExpr(e.obj) as unknown[];
        const idx = evalExpr(e.idx) as number;
        return obj[idx];
      }
      case "unary": {
        const v = evalExpr(e.arg);
        if (e.op === "-") return -(v as number);
        if (e.op === "not") return !v;
        return v;
      }
      case "binop": {
        const l = evalExpr(e.left) as number | string;
        const r = evalExpr(e.right) as number | string;
        switch (e.op) {
          case "+":
            if (typeof l === "string" || typeof r === "string") return String(l) + String(r);
            return (l as number) + (r as number);
          case "-": return (l as number) - (r as number);
          case "*": return (l as number) * (r as number);
          case "/": return (l as number) / (r as number);
          case "//": return Math.floor((l as number) / (r as number));
          case "%": return (l as number) - Math.floor((l as number) / (r as number)) * (r as number);
        }
        return 0;
      }
      case "compare": {
        const l = evalExpr(e.left) as number;
        const r = evalExpr(e.right) as number;
        switch (e.op) {
          case "==": return l === r;
          case "!=": return l !== r;
          case "<": return l < r;
          case ">": return l > r;
          case "<=": return l <= r;
          case ">=": return l >= r;
        }
        return false;
      }
      case "bool_op": {
        const l = evalExpr(e.left);
        if (e.op === "and") return l ? evalExpr(e.right) : l;
        return l ? l : evalExpr(e.right);
      }
      case "call": {
        // detect time.sleep / esperar to convert into sleep marker
        if (e.fn.kind === "attr" && e.fn.name === "sleep" && e.fn.obj.kind === "name" && e.fn.obj.value === "time") {
          const s = evalExpr(e.args[0]) as number;
          return sleepMarker(s);
        }
        if (e.fn.kind === "name" && e.fn.value === "esperar") {
          const s = evalExpr(e.args[0]) as number;
          return sleepMarker(s);
        }
        const fn = evalExpr(e.fn) as (...args: unknown[]) => unknown;
        const args = e.args.map(evalExpr);
        if (typeof fn !== "function") throw new Error(`Tentando chamar algo que não é função`);
        return fn(...args);
      }
    }
  }

  function assign(target: Expr, value: unknown) {
    if (target.kind === "name") { scope[target.value] = value; return; }
    if (target.kind === "index") {
      const obj = evalExpr(target.obj) as unknown[];
      const idx = evalExpr(target.idx) as number;
      obj[idx] = value;
      return;
    }
    throw new Error("Alvo de atribuição inválido");
  }

  async function execBlock(stmts: Stmt[]): Promise<void> {
    for (const s of stmts) {
      if (opts.shouldStop?.()) throw new Error("__STOPPED__");
      if (++steps > maxSteps) throw new Error("Limite de passos atingido. Faltou um esperar() no loop?");
      await execStmt(s);
    }
  }

  async function execStmt(s: Stmt): Promise<void> {
    switch (s.kind) {
      case "pass":
      case "import":
        return;
      case "break": throw new BreakSignal();
      case "continue": throw new ContinueSignal();
      case "expr": {
        const v = evalExpr(s.expr);
        if (isSleepMarker(v)) await sleep(v.seconds, opts.shouldStop);
        return;
      }
      case "assign": {
        const v = evalExpr(s.value);
        if (isSleepMarker(v)) { await sleep(v.seconds, opts.shouldStop); assign(s.target, null); }
        else assign(s.target, v);
        return;
      }
      case "augassign": {
        const cur = evalExpr(s.target) as number;
        const v = evalExpr(s.value) as number;
        let next: number;
        switch (s.op) {
          case "+=": next = cur + v; break;
          case "-=": next = cur - v; break;
          case "*=": next = cur * v; break;
          case "/=": next = cur / v; break;
          default: next = cur;
        }
        assign(s.target, next);
        return;
      }
      case "if": {
        for (const b of s.branches) {
          if (truthy(evalExpr(b.cond))) { await execBlock(b.body); return; }
        }
        if (s.elseBody) await execBlock(s.elseBody);
        return;
      }
      case "while": {
        while (truthy(evalExpr(s.cond))) {
          try { await execBlock(s.body); }
          catch (e) {
            if (e instanceof BreakSignal) return;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      }
      case "for": {
        const iter = evalExpr(s.iter) as unknown[];
        if (!Array.isArray(iter)) throw new Error(`Valor não iterável no for (linha ${s.line})`);
        for (const item of iter) {
          scope[s.var] = item;
          try { await execBlock(s.body); }
          catch (e) {
            if (e instanceof BreakSignal) return;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      }
      case "try": {
        try { await execBlock(s.body); }
        finally { if (s.finallyBody) await execBlock(s.finallyBody); }
        return;
      }
    }
  }

  try {
    await execBlock(program);
  } catch (e) {
    if (e instanceof Error && e.message === "__STOPPED__") {
      onLog("Execução interrompida.", "info");
      return;
    }
    const msg = e instanceof Error ? e.message : String(e);
    onLog(`Erro: ${msg}`, "error");
    throw e;
  }
}

// ---------- helpers ----------
interface SleepMarker { __sleep: true; seconds: number }
function sleepMarker(seconds: number): SleepMarker { return { __sleep: true, seconds }; }
function isSleepMarker(v: unknown): v is SleepMarker {
  return !!v && typeof v === "object" && (v as { __sleep?: boolean }).__sleep === true;
}

function truthy(v: unknown): boolean {
  if (v === null || v === undefined || v === false || v === 0 || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

async function sleep(seconds: number, shouldStop?: () => boolean): Promise<void> {
  // sleep in small slices so stop responds quickly
  const total = Math.max(0, seconds) * 1000;
  const slice = 30;
  const start = performance.now();
  while (performance.now() - start < total) {
    if (shouldStop?.()) throw new Error("__STOPPED__");
    await new Promise((r) => setTimeout(r, Math.min(slice, total - (performance.now() - start))));
  }
}