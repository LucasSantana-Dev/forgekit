---
name: resume
description: Recover session state from git, plans, and recent work to continue where you left off
triggers:
  - resume
  - continue
  - what was I doing
  - pick up where I left off
  - start session
---

# Resume

Load current state and suggest the next action.

## Steps

1. Check git status and recent log (last 5 commits)
2. Check for open PRs on current branch
3. Check for plan files in `.agents/plans/` or `.claude/plans/`
4. Check for TODO/FIXME markers in recently changed files
5. Summarize state and recommend next action

## Priority Order

1. Open PR with review feedback → address comments first
2. Failing CI on current branch → fix before new work
3. Active plan file exists → continue from last incomplete phase
4. Uncommitted changes → decide: commit, stash, or discard
5. No in-flight work → check backlog or ask for direction

## Output

```text
## Session State
Branch: <name>
Last commit: <message> (<time ago>)
Open PRs: <count>
Active plan: <path or none>
Uncommitted: <count files>

## Next Action
<one sentence recommendation>
```

## Rules

- Always check git state before suggesting work
- If an open PR exists, prioritize review feedback over new work
- Never start new work without acknowledging in-flight work
- If a plan file exists, continue from where it left off
