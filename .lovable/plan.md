# Plataforma Micro-Box — Interface educacional

Site em português para ensinar a biblioteca `biblioteca_microbox.py` (gpiod simplificada) com documentação, tutoriais, exercícios e um simulador visual de GPIO com editor de código Python no navegador.

## Estilo visual
Educacional moderno e colorido: paleta vibrante (azul elétrico, verde-lima de "pino ativo", âmbar de alerta, fundos claros com superfícies em cinza-azulado), tipografia limpa (Outfit headings + Figtree body) e fonte mono (JetBrains Mono) para código. Ilustrações simples de placa/LED/botão em SVG.

## Estrutura de rotas
```text
/                  Landing: o que é o Micro-Box, CTA para Simulador e Tutoriais
/documentacao      Referência de todas as funções da biblioteca
/tutoriais         Lista de tutoriais
/tutoriais/$slug   Tutorial passo a passo (texto + código + mini simulação)
/simulador         Editor Python + placa virtual de GPIO
/exercicios        Lista de desafios
/exercicios/$slug  Desafio com enunciado, editor e verificação automática
```
Cada rota terá `head()` próprio (title/description/og) em PT-BR.

## Páginas — conteúdo

**Landing (`/`)**
Hero "Aprenda GPIO com a biblioteca Micro-Box", cards das 4 seções, snippet de código piscando um LED (animado), rodapé com créditos.

**Documentação (`/documentacao`)**
Sidebar com índice das funções. Cada função vira um card:
`DefnPino`, `ligar_pino`, `desligar_pino`, `ler_pino`, `esperar`, `liberar_pino`, `liberar_todos`.
Para cada uma: descrição, assinatura, parâmetros, retorno, exemplo de código, e botão "Abrir no simulador" que pré-carrega o exemplo.

**Tutoriais (`/tutoriais`)**
Lista inicial (3-4 tutoriais):
1. Piscar um LED no pino 41
2. Ler um botão e acender LED quando pressionado
3. Acionar um relé/buzzer com temporização
4. Entendendo chips e portas (`numPino % 32`, `/dev/gpiochipN`)
Cada tutorial: passos numerados, blocos de código copiáveis, mini-placa lateral mostrando o resultado quando o aluno clica "Rodar".

**Simulador (`/simulador`)**
- Editor de código (CodeMirror 6) com syntax highlight Python e snippets da biblioteca.
- Painel "Placa Micro-Box": grid de pinos (0–63) renderizados como LEDs; pinos configurados como entrada viram botões clicáveis (toggle ativo/inativo).
- Console de saída (print, erros, log de chamadas).
- Botões: Rodar, Parar, Resetar, Carregar exemplo.
- Execução: interpretação JS de um subconjunto Python (ver Detalhes técnicos).

**Exercícios (`/exercicios`)**
Desafios curtos com verificação automática observando o histórico de chamadas/estado dos pinos:
- "Faça o LED do pino 41 piscar 3 vezes (1s on, 1s off)"
- "Quando o botão do pino 10 for pressionado, ligue o LED do pino 41"
- "Libere todos os pinos ao final"
Feedback: ✅/❌ + dica.

## Detalhes técnicos

**Simulador (frontend-only, sem backend)**
Interpretador caseiro pequeno em TS que cobre apenas o necessário para a biblioteca:
- chamadas de função (`ligar_pino(41)`), atribuições, `while True`, `if/else`, `try/finally`, `time.sleep` → `esperar`, `print`, literais numéricos/strings/bool, comparações.
- Execução cooperativa por gerador para que `esperar(s)` ceda ao event loop e a UI anime LEDs em tempo real (sem travar).
- Botão Parar interrompe o gerador.
- Limite de iterações/segurança contra loops infinitos sem `esperar`.

Estado global do simulador: `Map<numPino, { modo: 'output'|'input', valor: boolean }>` em zustand. A placa virtual e a verificação de exercícios assinam esse estado.

**Stack**
TanStack Start (já configurado), Tailwind v4, shadcn/ui, CodeMirror 6 (`@codemirror/lang-python`), zustand, framer-motion para animação dos LEDs. Sem Lovable Cloud — tudo client-side.

**Fontes**
`<link>` Google Fonts no `__root.tsx` (Outfit, Figtree, JetBrains Mono) — nunca via `@import` em `styles.css`.

**Design tokens**
Adicionar em `src/styles.css`: `--color-led-on`, `--color-led-off`, `--color-pin-input`, `--color-pin-output`, `--color-board`, gradientes de hero, sombras. Sem cores hardcoded em componentes.

## Escopo fora desta entrega
- Login / persistência de progresso (pode entrar depois com Lovable Cloud).
- Tradução para inglês.
- Exportar código para `.py` / rodar em hardware real (apenas mencionado na doc).

## Entregáveis
Rotas listadas, simulador funcional com pelo menos 3 tutoriais e 3 exercícios, documentação completa das 7 funções, design system aplicado, SEO básico em cada rota.
