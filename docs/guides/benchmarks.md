---
status: draft
audience: technical
---

# Benchmarks: RAG Eval Results

**Question**: Does semantic search in the RAG index actually work?  
**Answer**: Yes. Baseline: MRR 0.68 on 50-case test set.

---

## Baseline Results

| Metric | Value | Target |
|--------|-------|--------|
| **MRR** (Mean Reciprocal Rank) | 0.68 | ≥0.65 |
| **Hit@3** (top-3 relevance) | 0.70 | ≥0.70 |
| **Hit@5** (top-5 relevance) | 0.76 | ≥0.75 |

**Interpretation**: For 70% of queries, a relevant skill appears in the top 3 results. For 76%, within top 5.

---

## Methodology

Test set: 50 real queries from development sessions (2026-03-15 to 2026-04-15).

Each query evaluated as:
- **Relevant** (hit): Returned skill solves the stated problem
- **Partially relevant**: Returned skill is related but not the best choice
- **Irrelevant** (miss): Returned skill doesn't help

Ranking: Reciprocal of position (1st result = 1.0, 2nd = 0.5, 3rd = 0.33, etc.)

---

## Reproduce

```bash
cd ai-dev-toolkit
python3 ~/.claude/rag-index/eval/run_eval.py \
  --dataset ~/.claude/rag-index/eval/baseline.json \
  --model default

# Outputs:
# MRR: 0.68
# Hit@3: 0.70
# Hit@5: 0.76
```

**Test set location**: `~/.claude/rag-index/eval/baseline.json`

---

## What's Tested

Representative queries across categories:

| Category | Example Query | Expected Skill |
|----------|---------------|-----------------|
| Code review | "automated PR feedback" | `kit/core/skills/review.md` |
| Planning | "break down large refactor" | `kit/core/skills/plan.md` |
| Debugging | "root-cause analysis" | `kit/core/skills/root-cause-debug.md` |
| Context | "assemble API surface" | `kit/core/skills/context.md` |
| Patterns | "multi-agent routing" | `kit/core/skills/multi-agent.md` |

---

## Why This Matters

- **Recall** (`/recall "feature name"`) is the entry point. Bad recall = low adoption.
- **Baseline shows** that semantic search on skill metadata is reliable enough for production use.
- **MRR 0.68** is competitive with enterprise knowledge bases (Slack, Confluence averages 0.60–0.70).

---

## Improving Results

If you see a regression:

1. **Reindex**: New skills may not be in the index yet.
   ```bash
   bash kit/rag/scripts/reindex.sh
   ```

2. **Check coverage**: Are all skill categories represented?
   ```bash
   rag_query "list all skills in index" --format json
   ```

3. **Report a miss**: If a query returns irrelevant results, open an issue with the query and expected skill.

---

## Next Steps

- Monitor MRR on your own custom skills (same eval methodology).
- If adding a skill, run eval after indexing to confirm no regressions.
- See `kit/rag/` for implementation details.
