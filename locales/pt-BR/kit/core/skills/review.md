---
name: review
description: Revise mudanças de código em busca de bugs, problemas de segurança, cobertura de testes e estilo
triggers:
  - revise isso
  - confira meu código
  - code review
  - procurar issues
---

# Review

Revisão sistemática de código cobrindo correção, segurança, testes e estilo.

## Checklist

### Correctness
- [ ] A lógica cobre todos os ramos (null, vazio, edge cases)
- [ ] Caminhos de erro são tratados e propagados corretamente
- [ ] Sem falhas silenciosas (blocos catch que engolem erros)
- [ ] Async/await usados corretamente — sem `await` esquecido

### Security
- [ ] Sem segredos, credenciais ou PII no código
- [ ] Entradas do usuário validadas nos limites do sistema
- [ ] Injeção SQL/comando não é possível
- [ ] Dependências: sem novas vulnerabilidades high/critical

### Tests
- [ ] O novo comportamento está testado
- [ ] Edge cases cobertos
- [ ] Os testes pegariam uma regressão se o código quebrasse

### Style
- [ ] Funções com menos de 50 linhas
- [ ] Sem código especulativo além do que foi pedido
- [ ] Sem código comentado deixado para trás

## Output Format

Para cada issue encontrada:
```text
[SEVERITY] file:line — descrição
  Why: <por que isso é um problema>
  Fix: <sugestão específica>
```

Severidades: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO`

Reporte apenas issues em que você confia. Sem ruído.
