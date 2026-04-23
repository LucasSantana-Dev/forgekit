---
name: loop
description: Ciclo autônomo de desenvolvimento — planejar, implementar, testar, revisar, corrigir, commitar e abrir PR sem parar
triggers:
  - loop
  - autônomo
  - executar o ciclo completo
  - dev loop
  - code loop
  - autopilot
  - ultraloop
---

# Loop

Execute o ciclo completo de desenvolvimento de forma autônoma até a tarefa ser entregue ou até disparar uma parada dura.

## Cycle

```text
PLAN → IMPLEMENT → VERIFY → REVIEW → FIX → COMMIT → (repeat) → PR
```

## Steps

1. **Receive task** — aceite a descrição, estime o escopo, escolha o tier de modelo (use a skill route)
2. **Plan** — quebre em fases com dependências (use a skill orchestrate)
3. **For each phase:**
   a. Implemente a mudança
   b. Rode lint + type-check (feedback rápido)
   c. Se lint/types falharem → corrija imediatamente, máximo de 3 tentativas
   d. Rode os testes
   e. Se os testes falharem → debug (use a skill debug), corrija, máximo de 3 tentativas
   f. Faça self-review do diff (use a skill review)
   g. Se a review encontrar issues → corrija e verifique de novo
   h. Faça commit com mensagem convencional
4. **After all phases:**
   a. Rode os quality gates completos (use a skill verify)
   b. Faça push da branch
   c. Abra o PR (use a skill ship)
5. **If interrupted** — salve o estado em um arquivo de plano para retomar

## Fallback Behavior

```text
Attempt 1: current model at current tier
Attempt 2: retry same model (transient failure)
Attempt 3: switch to fallback model at same tier
Attempt 4: switch to fallback provider
Attempt 5: escalate to next tier
After 5 failures on same phase: STOP and report
```

## Guardrails

- Nunca faça force-push nem push para `main`
- Nunca pule testes para "ganhar progresso"
- Nunca suprima erros de tipo para destravar
- Pare o loop se 3 fases consecutivas falharem
- Sempre rode verify antes de afirmar que terminou

## Output Per Phase

```text
Phase N: <name> [DONE]
  Files: <list>
  Lint: ✓  Types: ✓  Tests: ✓ (N passed)
  Commit: <hash> <message>
```

## Final Output

```text
Loop Complete
─────────────
Phases: N/N completed
Commits: N
Branch: <name>
PR: <url>
Quality: lint ✓ | types ✓ | tests ✓ (N passed) | build ✓
```

## Resume

Se o loop foi interrompido, delegue para a skill `resume` — ela detecta o
handoff, estado do plano, estado do git e PRs abertos, depois re-entra no loop na
última fase incompleta sem repetir trabalho.
