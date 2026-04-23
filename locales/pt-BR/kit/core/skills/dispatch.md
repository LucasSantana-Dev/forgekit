---
name: dispatch
description: Dispare subtarefas em paralelo, atribua a agentes workers e colete os resultados
triggers:
  - dispatch
  - tarefas paralelas
  - criar subtarefa
  - fan out
  - rodar em paralelo
---

# Dispatch

Quebre o trabalho em subtarefas independentes e execute-as concorrentemente.

## Steps

1. Identifique unidades de trabalho independentes (sem estado compartilhado, sem dependência de ordem)
2. Para cada subtarefa: defina o escopo, atribua um tier de agente, defina a saída esperada
3. Dispare todas as subtarefas independentes ao mesmo tempo
4. Colete os resultados conforme terminarem
5. Verifique se cada resultado atende à sua saída esperada
6. Integre os resultados ao workflow principal

## Subtask Template

```text
Subtask: <nome>
  Agent: <tier>
  Scope: <arquivos ou módulo>
  Expected: <como é o pronto>
  Depends: none (deve ser independente)
```

## Rules

- Máximo de 3 subtarefas concorrentes — mais do que isso degrada a qualidade da revisão
- Cada subtarefa deve ser verificável de forma independente
- Nunca despache subtarefas com escrita nos mesmos arquivos — haverá conflito
- Colete TODOS os resultados antes de prosseguir — sem integração parcial
- Se uma subtarefa falhar, tente novamente uma vez e então reporte a falha
- Leituras e buscas independentes sempre são seguras para paralelizar

## When NOT to Dispatch

- Tarefas compartilham estado mutável (os mesmos arquivos sendo escritos)
- Tarefas têm dependências sequenciais (B precisa da saída de A)
- O escopo total é pequeno o bastante para um único agente (<50 linhas)
