---
name: dispatch
description: Spawn parallel subtasks, assign to worker agents, collect results
triggers:
  - dispatch
  - parallel tasks
  - spawn subtask
  - fan out
  - run in parallel
---

# Dispatch

Break work into independent subtasks and run them concurrently.

## Steps

1. Identify independent units of work (no shared state, no ordering dependency)
2. For each subtask: define scope, assign agent tier, set expected output
3. Spawn all independent subtasks simultaneously
4. Collect results as they complete
5. Verify each result meets its expected output
6. Integrate results into the main workflow

## Subtask Template

```text
Subtask: <name>
  Agent: <tier>
  Scope: <files or module>
  Expected: <what done looks like>
  Depends: none (must be independent)
```

## Rules

- Maximum 3 concurrent subtasks — more degrades review quality
- Each subtask must be independently verifiable
- Never dispatch subtasks with shared file writes — they will conflict
- Collect ALL results before proceeding — no partial integration
- If a subtask fails, retry it once then report the failure
- Independent reads and searches are always safe to parallelize

## When NOT to Dispatch

- Tasks share mutable state (same files being written)
- Tasks have sequential dependencies (B needs A's output)
- Total scope is small enough for one agent (<50 lines)
