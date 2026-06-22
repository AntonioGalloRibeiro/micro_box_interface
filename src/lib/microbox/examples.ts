export interface Tutorial {
  slug: string;
  titulo: string;
  resumo: string;
  passos: { texto: string; codigo?: string }[];
  codigoFinal: string;
}

export const tutoriais: Tutorial[] = [
  {
    slug: "piscar-led",
    titulo: "Piscando um LED",
    resumo: "Seu primeiro programa: faça um LED no pino 41 piscar a cada 1 segundo.",
    passos: [
      {
        texto:
          "Importe as funções da biblioteca. Em PT-BR, ligar_pino e desligar_pino controlam qualquer saída digital — LED, relé ou buzzer.",
        codigo: "from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos",
      },
      {
        texto: "Ligue o pino 41. O LED acende imediatamente.",
        codigo: "ligar_pino(41)\nesperar(1)",
      },
      {
        texto: "Desligue o pino 41 e espere mais 1 segundo.",
        codigo: "desligar_pino(41)\nesperar(1)",
      },
      {
        texto:
          "Coloque tudo em um loop. O bloco try/finally garante que os pinos sejam liberados ao parar o programa.",
      },
    ],
    codigoFinal:
      "from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos\n\ntry:\n    while True:\n        ligar_pino(41)\n        esperar(1)\n        desligar_pino(41)\n        esperar(1)\nfinally:\n    liberar_todos()\n",
  },
  {
    slug: "botao-led",
    titulo: "Botão controlando um LED",
    resumo: "Use ler_pino para ler um botão no pino 10 e acender o LED no pino 41 quando pressionado.",
    passos: [
      {
        texto:
          "ler_pino(numPino) configura o pino como entrada e retorna True quando o sinal está ativo. Sirva-se de um if para reagir.",
        codigo: "from biblioteca_microbox import ler_pino, ligar_pino, desligar_pino, esperar",
      },
      {
        texto:
          "No simulador, clique no pino 10 da placa virtual para alternar seu estado (ele aparece em laranja porque está em modo entrada).",
      },
      {
        texto:
          "Use um pequeno esperar(0.05) dentro do loop para o programa não consumir 100% da CPU.",
      },
    ],
    codigoFinal:
      "from biblioteca_microbox import ler_pino, ligar_pino, desligar_pino, esperar, liberar_todos\n\ntry:\n    while True:\n        if ler_pino(10):\n            ligar_pino(41)\n        else:\n            desligar_pino(41)\n        esperar(0.05)\nfinally:\n    liberar_todos()\n",
  },
  {
    slug: "sequencia-leds",
    titulo: "Sequência de LEDs (efeito knight rider)",
    resumo: "Acione 5 LEDs em sequência usando um laço for. Demonstra o uso da biblioteca em vários pinos.",
    passos: [
      {
        texto:
          "Defina uma lista com os números dos pinos. Em Python, listas são iteráveis e funcionam direto com for.",
        codigo: "pinos = [40, 41, 42, 43, 44]",
      },
      {
        texto: "Percorra a lista acendendo um por vez.",
        codigo: "for p in pinos:\n    ligar_pino(p)\n    esperar(0.15)\n    desligar_pino(p)",
      },
    ],
    codigoFinal:
      "from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos\n\npinos = [40, 41, 42, 43, 44]\n\ntry:\n    for _ in range(4):\n        for p in pinos:\n            ligar_pino(p)\n            esperar(0.12)\n            desligar_pino(p)\n        for p in pinos[::-1] if False else [44, 43, 42, 41, 40]:\n            ligar_pino(p)\n            esperar(0.12)\n            desligar_pino(p)\nfinally:\n    liberar_todos()\n",
  },
  {
    slug: "entendendo-chips",
    titulo: "Entendendo chips e portas",
    resumo: "Como numPino vira /dev/gpiochipN e porta. Conceitos por trás de DefnPino.",
    passos: [
      {
        texto:
          "Cada chip GPIO controla 32 linhas. Por isso a biblioteca calcula: chip = numPino // 32 e porta = numPino % 32. O pino 41 vira chip 1, porta 9.",
        codigo: "numPino = 41\nchip = numPino // 32   # 1\nporta = numPino % 32   # 9\nprint(chip, porta)",
      },
      {
        texto:
          "ligar_pino(41) faz tudo isso por você e guarda o resultado num cache interno, então chamar a função num loop não requisita o GPIO de novo a cada iteração.",
      },
    ],
    codigoFinal:
      'numPino = 41\nchip = numPino // 32\nporta = numPino % 32\nprint("chip:", chip, "porta:", porta)\nprint("dispositivo:", "/dev/gpiochip" + str(chip))\n',
  },
];

export interface Exercise {
  slug: string;
  titulo: string;
  enunciado: string;
  dica: string;
  codigoInicial: string;
  /** Returns null on success, or an error message string. */
  verificar: (ctx: ExerciseContext) => string | null;
}

import type { CallLogEntry, PinState } from "./store";

export interface ExerciseContext {
  callLog: CallLogEntry[];
  pinos: Record<number, PinState>;
}

export const exercicios: Exercise[] = [
  {
    slug: "piscar-3-vezes",
    titulo: "Piscar o LED 3 vezes",
    enunciado:
      "Faça o LED do pino 41 piscar exatamente 3 vezes (1 segundo ligado, 1 segundo desligado em cada ciclo).",
    dica: "Use um for com range(3) e alterne ligar_pino(41) / desligar_pino(41) com esperar(1).",
    codigoInicial:
      "from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos\n\n# escreva seu código aqui\n\nliberar_todos()\n",
    verificar: ({ callLog }) => {
      const padrao = callLog.filter((c) =>
        c.type === "ligar_pino" || c.type === "desligar_pino"
      );
      const ligar41 = padrao.filter((c) => c.type === "ligar_pino" && c.numPino === 41).length;
      const desligar41 = padrao.filter((c) => c.type === "desligar_pino" && c.numPino === 41).length;
      if (ligar41 !== 3) return `ligar_pino(41) chamado ${ligar41} vez(es), esperado 3.`;
      if (desligar41 !== 3) return `desligar_pino(41) chamado ${desligar41} vez(es), esperado 3.`;
      return null;
    },
  },
  {
    slug: "botao-acende-led",
    titulo: "Botão acende LED",
    enunciado:
      "Quando o botão do pino 10 for pressionado (clique nele na placa para deixá-lo ativo), o LED do pino 41 deve acender. Quando soltar, deve apagar.",
    dica: "Use um while True com if ler_pino(10): ligar_pino(41) e else: desligar_pino(41). Adicione esperar(0.05).",
    codigoInicial:
      "from biblioteca_microbox import ler_pino, ligar_pino, desligar_pino, esperar, liberar_todos\n\n# escreva seu código aqui\n",
    verificar: ({ callLog }) => {
      const leu10 = callLog.some((c) => c.type === "ler_pino" && c.numPino === 10);
      const ligou41 = callLog.some((c) => c.type === "ligar_pino" && c.numPino === 41);
      const desligou41 = callLog.some((c) => c.type === "desligar_pino" && c.numPino === 41);
      if (!leu10) return "Você precisa chamar ler_pino(10) no seu loop.";
      if (!ligou41) return "O LED 41 nunca foi ligado. Lembre de chamar ligar_pino(41) quando o botão estiver pressionado.";
      if (!desligou41) return "O LED 41 nunca foi desligado. Faça um else com desligar_pino(41).";
      return null;
    },
  },
  {
    slug: "liberar-todos",
    titulo: "Sempre libere os pinos",
    enunciado:
      "Ligue o pino 41, espere 0,5s, desligue, e ao final libere todos os pinos com liberar_todos(). Boa prática: use try/finally.",
    dica: "try: ... finally: liberar_todos().",
    codigoInicial:
      "from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos\n\n# escreva seu código aqui\n",
    verificar: ({ callLog }) => {
      const seq = callLog
        .filter((c) => ["ligar_pino", "desligar_pino", "liberar_todos"].includes(c.type))
        .map((c) => c.type);
      if (!seq.includes("ligar_pino")) return "ligar_pino(41) não foi chamado.";
      if (!seq.includes("desligar_pino")) return "desligar_pino(41) não foi chamado.";
      if (seq[seq.length - 1] !== "liberar_todos") return "liberar_todos() deve ser a última chamada (use try/finally).";
      return null;
    },
  },
];