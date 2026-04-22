---
name: verify
description: Rode a suíte completa de quality gates antes de fazer commit ou criar um PR
triggers:
  - verify
  - quality check
  - rodar testes
  - antes do commit
  - antes do PR
---

# Verify

Rode todos os quality gates. Não faça commit nem abra PR até que tudo passe.

## Gates (run in order)

```bash
npm run lint         # ou: ruff check . / golangci-lint run / cargo clippy
npm run type-check   # ou: tsc --noEmit / mypy . / go build ./...
npm test             # ou: pytest / go test ./... / cargo test
npm run build        # confirma que não há erros de build
```

## Rules

- Corrija erros de lint antes de seguir — não suprima
- Se testes falharem, determine a causa raiz antes de mudar o teste
- Cobertura abaixo do limite = problema a corrigir, não número para ignorar
- Segurança: `npm audit --audit-level=high` para qualquer mudança de dependência

## Output

Reporte o status de cada gate:
```text
✓ lint        — passou
✓ type-check  — passou
✓ tests       — 142 passaram, 87% de cobertura
✓ build       — sucesso
```
