---
name: ship-check
description: Verifique o trabalho antes de fazer commit, push ou pedir review
triggers:
  - check before ship
  - pre-commit check
  - verificar antes do push
  - pronto para commit
  - quality gate
---

# Ship Check

Rode os comandos de verificação do próprio repo e reporte pass/fail com evidência — antes de qualquer operação git.

## Steps

1. **Inspect changes** — revise arquivos staged e unstaged, resumo do diff
2. **Discover verification commands** — procure scripts de lint, typecheck, test e build
3. **Run each command** — capture a saída exata e os exit codes
4. **Report results** — pass/fail por comando com evidência

## Output

```text
Files changed: <count>
Lint:          PASS | FAIL
Typecheck:     PASS | FAIL | N/A
Tests:         PASS | FAIL | N/A
Build:         PASS | FAIL | N/A
Blockers:      <lista ou none>
```

## Rules

- Nunca invente testes ou comandos de build que não existam no repo
- Nunca marque trabalho como pronto quando a verificação foi pulada
- Recuse afirmar sucesso sem evidência de saída dos comandos
- Reporte bloqueadores explicitamente em vez de esconder falhas
