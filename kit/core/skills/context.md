---
name: context
description: Optimize context window usage — compact stale data, preserve active state
triggers:
  - optimize context
  - context too large
  - compact
  - session slow
  - free up context
---

# Context

Keep the context window focused on what matters right now.

## When to Use

- Session feels slow or responses degrade
- Switching between unrelated tasks
- After completing a major task and pivoting
- Context approaching capacity

## Steps

1. Estimate current context usage
2. Identify stale context (old outputs, resolved discussions, completed items)
3. Compact or remove stale context
4. Verify active state preserved (branch, files, plan, decisions)
5. Report what changed

## Output

```text
Before: ~N% used
Compacted: <what was removed>
After: ~N% used
Preserved: <key items kept>
```

## Rules

- Never compact active task state
- Preserve: current branch, active files, in-progress plan, key decisions
- Remove: old search outputs, completed todos, resolved threads
- If severely bloated, recommend a fresh session instead
- Save critical state to a plan file before compacting if work is in progress
