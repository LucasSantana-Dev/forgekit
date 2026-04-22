---
name: research
description: Pesquisa profunda sobre um tópico usando busca na web, documentação e análise da base de código
triggers:
  - research
  - investigar
  - o que X faz
  - como X funciona
  - encontrar informações sobre
  - ultraresearch
---

# Research

Esgote todas as fontes disponíveis antes de concluir. Não pare no primeiro resultado.

## Sources (in order)

1. **Codebase** — pesquise primeiro no código existente; a resposta pode já estar lá
2. **Library docs** — use context7 ou equivalente para documentação atualizada de pacotes
3. **Web search** — use para estado atual, comparações e boas práticas
4. **GitHub** — pesquise issues/PRs por bugs conhecidos e workarounds

## Rules

- Verifique afirmações em fontes primárias — não confie em resumos de resumos
- Observe a data das fontes; docs de versões antigas enganam
- Quando fontes se contradizerem, reporte a contradição — não escolha uma silenciosamente
- Se ainda houver incerteza depois de esgotar as fontes, diga isso explicitamente

## Output

```markdown
## Finding: <tópico>

### Summary
<2-3 frases>

### Key Facts
- <fato com fonte>
- <fato com fonte>

### Uncertainties
- <o que está incerto ou não verificado>

### Recommendation
<o que fazer com base nos achados>
```
