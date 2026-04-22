---
name: mcp-health
description: Valide a saúde real de provedores MCP — separe issues de config de falhas de auth e conectividade
triggers:
  - mcp health
  - verificar mcp
  - mcp não funciona
  - conexão mcp
  - status mcp
---

# MCP Health

Rode um health check real nos servidores MCP para distinguir problemas de config, auth e conectividade.

## Steps

1. **Check enabled servers** — liste quais servidores MCP estão configurados e habilitados
2. **Test connectivity** — tente uma conexão real ou check de status por servidor
3. **Classify failures** — config ausente, auth expirada, provedor inacessível ou desconhecido
4. **Report next fix** — a menor ação necessária para resolver cada falha

## Output

```text
Server:   <name>     Status: OK | FAIL (<reason>)
Server:   <name>     Status: OK | FAIL (<reason>)
Action:   <próxima correção para a primeira falha>
```

## Rules

- Nunca exponha valores secretos ou tokens na saída
- Nunca afirme saúde do MCP apenas pela presença do arquivo de config — teste ao vivo
- Nunca invente comandos de health provider-specific que não existam localmente
- Diferencie claramente problemas de config de problemas de auth
