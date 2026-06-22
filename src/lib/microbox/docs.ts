export interface FuncDoc {
  nome: string;
  assinatura: string;
  resumo: string;
  descricao: string;
  parametros: { nome: string; tipo: string; descricao: string }[];
  retorno?: string;
  exemplo: string;
}

export const funcoes: FuncDoc[] = [
  {
    nome: "ligar_pino",
    assinatura: "ligar_pino(numPino)",
    resumo: "Ativa um pino digital de saída (LED, relé, buzzer...).",
    descricao:
      "Configura o pino como saída (na primeira chamada) e o coloca em nível ATIVO. Em chamadas seguintes, apenas atualiza o valor — o pino já fica em cache, então pode ser usado dentro de loops.",
    parametros: [
      { nome: "numPino", tipo: "int", descricao: "Número global do pino (0–63). O chip é calculado como numPino // 32 e a porta como numPino % 32." },
    ],
    exemplo:
      "from biblioteca_microbox import ligar_pino, esperar\n\nligar_pino(41)\nesperar(1)",
  },
  {
    nome: "desligar_pino",
    assinatura: "desligar_pino(numPino)",
    resumo: "Desativa um pino digital de saída.",
    descricao:
      "Configura o pino como saída (na primeira chamada) e o coloca em nível INATIVO. Funciona para qualquer componente digital de saída.",
    parametros: [
      { nome: "numPino", tipo: "int", descricao: "Número global do pino." },
    ],
    exemplo:
      "from biblioteca_microbox import desligar_pino\n\ndesligar_pino(41)",
  },
  {
    nome: "ler_pino",
    assinatura: "ler_pino(numPino)",
    resumo: "Lê o estado de um pino digital de entrada.",
    descricao:
      "Configura o pino como entrada (na primeira chamada) e retorna True se estiver ativo, False se inativo. Serve para botões, sensores de presença, fins de curso, etc.",
    parametros: [
      { nome: "numPino", tipo: "int", descricao: "Número global do pino." },
    ],
    retorno: "bool — True quando o sinal está em nível ativo.",
    exemplo:
      "from biblioteca_microbox import ler_pino, ligar_pino, esperar\n\nwhile True:\n    if ler_pino(10):\n        ligar_pino(41)\n    esperar(0.1)",
  },
  {
    nome: "esperar",
    assinatura: "esperar(segundos)",
    resumo: "Pausa a execução pelo tempo informado.",
    descricao:
      "Equivalente a time.sleep(). Use para criar ritmo em piscadas, debouncing simples e temporização de saídas.",
    parametros: [
      { nome: "segundos", tipo: "float", descricao: "Duração da pausa em segundos. Aceita valores fracionários (ex: 0.2)." },
    ],
    exemplo:
      "from biblioteca_microbox import esperar\n\nesperar(0.5)",
  },
  {
    nome: "liberar_pino",
    assinatura: "liberar_pino(numPino)",
    resumo: "Libera um pino específico, encerrando o controle sobre ele.",
    descricao:
      "Remove o pino do cache interno e devolve o GPIO ao sistema. Use ao final do programa ou quando quiser reconfigurar o pino com função/estado diferentes.",
    parametros: [
      { nome: "numPino", tipo: "int", descricao: "Número global do pino a liberar." },
    ],
    exemplo: "from biblioteca_microbox import liberar_pino\n\nliberar_pino(41)",
  },
  {
    nome: "liberar_todos",
    assinatura: "liberar_todos()",
    resumo: "Libera todos os pinos configurados até o momento.",
    descricao:
      "Útil em um bloco try/finally para garantir que o programa devolva todos os GPIOs ao sistema, mesmo se houver erro ou interrupção.",
    parametros: [],
    exemplo:
      "from biblioteca_microbox import ligar_pino, esperar, liberar_todos\n\ntry:\n    while True:\n        ligar_pino(41)\n        esperar(1)\n        # ...\nfinally:\n    liberar_todos()",
  },
  {
    nome: "DefnPino",
    assinatura: "DefnPino(numPino, funcao, estado)",
    resumo: "Função de baixo nível usada por todas as outras.",
    descricao:
      "Configura um pino GPIO diretamente e devolve (request, porta). Normalmente você não precisa chamá-la — use ligar_pino / desligar_pino / ler_pino, que já cuidam disso automaticamente.",
    parametros: [
      { nome: "numPino", tipo: "int", descricao: "Número global do pino." },
      { nome: "funcao", tipo: 'str', descricao: '"output" ou "input".' },
      { nome: "estado", tipo: 'str', descricao: '"ativo" ou "inativo" — valor inicial.' },
    ],
    retorno: "(request, porta) — objeto gpiod.LineRequest e número da porta dentro do chip.",
    exemplo:
      'from biblioteca_microbox import DefnPino\n\nrequest, porta = DefnPino(41, "output", "inativo")',
  },
];