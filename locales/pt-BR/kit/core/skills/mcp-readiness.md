---
name: mcp-readiness
description: Verifique se workflows apoiados em MCP estão utilizáveis nesta máquina
triggers:
  - mcp ready
  - check de setup mcp
  - mcp ausente
  - verificar config mcp
  - troubleshoot mcp
---

# MCP Readiness

Verifique se os arquivos de config MCP existem e se os tokens dos provedores estão presentes — diferencie problemas de config de problemas de auth.

## Steps

1. **Check config files** — confirme se os arquivos de configuração MCP existem nos locais esperados
2. **Check provider tokens** — confirme se variáveis de ambiente ou tokens de auth obrigatórios estão definidos
3. **Classify problems** — config ausente vs auth ausente vs ambos
4. **Report next fix** — a menor ação para chegar a um estado funcional

## Output

```text
Config:    found | missing (<path>)
Auth:      OK | missing (<provider>)
Status:    ready | blocked
Action:    <próxima correção>
```

## Rules

- Nunca exponha valores secretos ou tokens
- Nunca afirme prontidão do MCP se ainda faltar auth
- Diferencie explicitamente problemas de config de problemas de auth
- Reporte a menor próxima correção, não um guia completo de setup
