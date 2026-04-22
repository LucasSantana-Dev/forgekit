---
name: cost
description: Acompanhe e reporte uso de tokens e custo estimado por sessão, agente e fase
triggers:
  - cost
  - quanto isso custou
  - uso de tokens
  - orçamento
  - gastos
---

# Cost

Acompanhe uso de tokens e custo ao longo da sessão.

## When to Report

- Após concluir uma fase importante
- Ao trocar de agente ou de tier
- No fim da sessão
- Quando solicitado explicitamente

## Output

```text
Cost Report
───────────
Phase:   <nome da fase atual>
Agent:   <nome do agente> (<tier>)
Tokens:  <input> in / <output> out
Est:     $<amount>
Session: $<running total>
Budget:  $<remaining or unlimited>
```

## Rules

- Reporte inline, não como uma etapa separada — custo é metadado, não tarefa
- Nunca pare o trabalho para reportar custo, a menos que o orçamento tenha sido excedido
- Ao exceder o orçamento: avise, continue e registre o excesso
- Acompanhe por agente para identificar quais agentes consomem mais
- Use o tier mais barato que funcione — consciência de custo orienta o roteamento
