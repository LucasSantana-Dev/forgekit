---
status: published
audience: technical
---

# Benchmarks: Resultados da Avaliação RAG

**Pergunta**: A busca semântica no índice RAG realmente funciona?  
**Resposta**: Sim. Baseline: MRR 0.68 em um conjunto de teste com 50 casos.

---

## Resultados da Linha de Base

| Métrica | Valor | Alvo |
|--------|-------|--------|
| **MRR** (Mean Reciprocal Rank) | 0.68 | ≥0.65 |
| **Hit@3** (relevância top-3) | 0.70 | ≥0.70 |
| **Hit@5** (relevância top-5) | 0.76 | ≥0.75 |

**Interpretação**: Para 70% das consultas, uma skill relevante aparece nos 3 primeiros resultados. Para 76%, nos 5 primeiros.

---

## Metodologia

Conjunto de teste: 50 consultas reais de sessões de desenvolvimento (15/03/2026 a 15/04/2026).

Cada consulta é avaliada como:
- **Relevante** (hit): A skill retornada resolve o problema declarado
- **Parcialmente relevante**: A skill retornada é relacionada, mas não é a melhor escolha
- **Irrelevante** (miss): A skill retornada não ajuda

Ranking: Recíproca da posição (1º resultado = 1.0, 2º = 0.5, 3º = 0.33, etc.)

---

## Reproduzir

```bash
cd forgekit
python3 ~/.claude/rag-index/eval/run_eval.py \
  --dataset ~/.claude/rag-index/eval/baseline.json \
  --model default

# Outputs:
# MRR: 0.68
# Hit@3: 0.70
# Hit@5: 0.76
```

**Localização do conjunto de teste**: `~/.claude/rag-index/eval/baseline.json`

---

## O Que É Testado

Consultas representativas em diferentes categorias:

| Categoria | Exemplo de Consulta | Skill Esperada |
|----------|---------------|-----------------|
| Revisão de código | "automated PR feedback" | `kit/core/skills/review.md` |
| Planejamento | "break down large refactor" | `kit/core/skills/plan.md` |
| Debugging | "root-cause analysis" | `kit/core/skills/root-cause-debug.md` |
| Contexto | "assemble API surface" | `kit/core/skills/context.md` |
| Padrões | "multi-agent routing" | `kit/core/skills/multi-agent.md` |

---

## Por Que Isso Importa

- **Recall** (`/recall "feature name"`) é o ponto de entrada. Recall ruim = baixa adoção.
- **A linha de base mostra** que a busca semântica em metadados de skills é confiável o suficiente para uso em produção.
- **MRR 0.68** é competitivo com bases de conhecimento corporativas (Slack, Confluence têm médias de 0.60–0.70).

---

## Melhorando Resultados

Se você vir uma regressão:

1. **Reindexar**: Novas skills podem não estar no índice ainda.
   ```bash
   bash kit/rag/scripts/reindex.sh
   ```

2. **Verificar cobertura**: Todas as categorias de skills estão representadas?
   ```bash
   rag_query "list all skills in index" --format json
   ```

3. **Relatar um miss**: Se uma consulta retorna resultados irrelevantes, abra uma issue com a consulta e a skill esperada.

---

## Próximos Passos

- Monitore MRR nas suas próprias skills customizadas (mesma metodologia de avaliação).
- Se adicionar uma skill, execute a avaliação após indexar para confirmar que não há regressões.
- Veja `kit/rag/` para detalhes de implementação.
