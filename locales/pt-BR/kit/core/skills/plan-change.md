---
name: plan-change
description: Planeje uma mudança de código antes de editar — identifique arquivos, sequencie passos e defina critérios de verificação
triggers:
  - plan change
  - planejar antes de codar
  - quais arquivos mudar
  - plano de execução
  - plano de mudança
---

# Plan Change

Reformule a tarefa, identifique o conjunto mínimo de arquivos envolvidos, produza um plano ordenado e defina como verificar cada passo.

## Steps

1. **Restate the task** — uma frase, sem ambiguidade
2. **Identify files** — conjunto mínimo de arquivos e sistemas envolvidos
3. **Sequence the plan** — passos em ordem com dependências marcadas
4. **Set verification** — qual comando ou check prova que cada passo funcionou
5. **Flag risks** — ambiguidade, efeitos colaterais ou desconhecidos antes de editar

## Output

```text
Task:    <reformulação em uma frase>
Files:   <lista de arquivos>
Plan:    1. <step> → verify: <check>
         2. <step> → verify: <check>
Risks:   <lista ou none>
```

## Rules

- Nunca salte para a implementação se o pedido estiver ambíguo
- Nunca produza um plano abstrato enorme para uma tarefa pequena
- Inclua critérios de verificação para cada passo relevante
- Aponte riscos antes de editar, não depois
