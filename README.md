# Micro-Box

Projeto desenvolvido pelo **LER³** que transforma TV boxes reutilizadas em plataformas de controle de componentes eletrônicos via GPIO, usando Python. O objetivo é fornecer kits educacionais de robótica de baixo custo para escolas públicas.

A biblioteca `biblioteca_microbox.py` encapsula a complexidade da `gpiod` (biblioteca nativa de GPIO do Linux) em funções simples escritas em português. Uma interface complementa a biblioteca com documentação, tutoriais, um simulador visual de GPIO e exercícios com verificação automática.

---

## Instalação

Copie o arquivo `biblioteca_microbox.py` para o mesmo diretório do seu script e importe as funções que quiser usar:

```python
from biblioteca_microbox import ligar_pino, desligar_pino, ler_pino, esperar, liberar_todos
```

A única dependência externa é a `gpiod`, já disponível no Linux embarcado das TV boxes suportadas.

---

## Funções disponíveis

| Função | Descrição |
|---|---|
| `ligar_pino(n)` | Ativa o pino `n` (saída digital) |
| `desligar_pino(n)` | Desativa o pino `n` (saída digital) |
| `ler_pino(n)` | Retorna `True` se o pino `n` estiver ativo, `False` se inativo |
| `esperar(s)` | Pausa a execução por `s` segundos (aceita decimais) |
| `liberar_pino(n)` | Libera o pino `n`, devolvendo-o ao sistema operacional |
| `liberar_todos()` | Libera todos os pinos configurados até o momento |

Os pinos não precisam ser configurados manualmente antes do uso: na primeira chamada, a função configura o pino automaticamente e reutiliza essa configuração nas chamadas seguintes.

---

## Exemplos

**Piscar um LED (ou qualquer saída digital):**
```python
from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos

try:
    while True:
        ligar_pino(41)
        esperar(1)
        desligar_pino(41)
        esperar(1)
finally:
    liberar_todos()
```

**Botão controlando um LED (ou sensor controlando uma saída):**
```python
from biblioteca_microbox import ler_pino, ligar_pino, desligar_pino, esperar, liberar_todos

try:
    while True:
        if ler_pino(10):
            ligar_pino(41)
        else:
            desligar_pino(41)
        esperar(0.1)
finally:
    liberar_todos()
```

**Sequência com múltiplos pinos:**
```python
from biblioteca_microbox import ligar_pino, desligar_pino, esperar, liberar_todos

pinos = [40, 41, 42, 43, 44]

try:
    for pino in pinos:
        ligar_pino(pino)
        esperar(0.2)
        desligar_pino(pino)
finally:
    liberar_todos()
```

> Use sempre `try/finally` com `liberar_todos()` para garantir que os GPIOs sejam liberados ao encerrar o programa, mesmo em caso de erro ou interrupção (Ctrl+C).

---

## Mapeamento de pinos

As TV boxes suportadas expõem até 128 pinos GPIO distribuídos em 4 chips (`/dev/gpiochip0` a `/dev/gpiochip3`), com 32 linhas por chip. A numeração usada nas funções segue a convenção:

```
porta   = numPino % 32
numChip = int(numPino / 32)
```

O pino 41, por exemplo, corresponde à linha 9 do `/dev/gpiochip1`. Esse mapeamento é feito automaticamente pela biblioteca — basta usar o número do pino diretamente.

---

## Interface web

A interface oferece:

- **Documentação** — referência completa de todas as funções com exemplos
- **Tutoriais** — guias passo a passo do uso básico ao entendimento interno da biblioteca
- **Simulador** — editor de código com placa virtual de 128 pinos; o mesmo código que roda no simulador pode ser executado diretamente na TV box
- **Exercícios** — desafios com verificação automática de comportamento
