---
name: root-cause-debug
description: Debugue de forma sistemática antes de mudar código — reproduza, reúna evidências, formule uma hipótese e teste a menor correção possível
triggers:
  - debug
  - causa raiz
  - por que isso está falhando
  - investigação de bug
  - debug sistemático
---

# Root Cause Debug

Reproduza o problema, reúna evidências, formule uma hipótese única e teste a menor correção que a confirme ou refute.

## Steps

1. **Reproduce** — rode o comando ou cenário com falha
2. **Gather evidence** — logs, saída de erro, stack traces, diffs de estado
3. **Compare** — comportamento esperado vs comportamento real
4. **Hypothesize** — formule uma hipótese de causa raiz a partir das evidências
5. **Test minimal fix** — aplique a menor mudança que valide a hipótese

## Output

```text
Reproduction: <comando ou cenário>
Evidence:     <principal achado>
Root cause:   <hipótese>
Fix:          <mudança mínima>
Verified:     <pass/fail após a correção>
```

## Rules

- Nunca agrupe várias correções não relacionadas
- Nunca afirme a causa raiz sem evidência
- Reproduza antes de teorizar
- Teste primeiro a menor correção, não o refactor mais abrangente
