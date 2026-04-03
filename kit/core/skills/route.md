---
name: route
description: Classify task complexity and pick the right model tier to avoid overspending on trivial work
triggers:
  - route
  - which model
  - model selection
  - task complexity
  - pick model
---

# Route

Classify the task and recommend a model tier before execution.

## Classification

| Signal | Cheap | Mid | Expensive |
|---|---|---|---|
| Lines changed | <20, single file | 20-200, multi-file | >200 or cross-repo |
| Reasoning depth | Lookup, grep, rename | Bug fix, test writing | Architecture, migration |
| Domain | Config, docs, typo | Standard implementation | Multi-system design |

## Overrides

- Visual/UI work → visual-capable model regardless of size
- Docs/writing → mid-tier with high token limit
- Security audit → mid-tier minimum

## Steps

1. Estimate lines changed and file count
2. Assess reasoning depth required
3. Check for domain overrides
4. Output recommendation

## Output

```text
Tier: cheap | mid | expensive
Reason: <one sentence justification>
```

## Rules

- Default to the cheapest tier that can handle the task
- When uncertain, start cheap and escalate on failure
- Never use expensive tier for single-file edits under 20 lines
