---
name: worktree-flow
description: Decide when and how to use git worktrees for isolated parallel work
triggers:
  - worktree
  - isolate branch
  - parallel branches
  - new worktree
  - feature isolation
---

# Worktree Flow

Decide whether a task deserves an isolated git worktree, create it with a proper branch name, and keep the original checkout clean.

## Steps

1. **Evaluate isolation need** — does this task risk conflicting with current work?
2. **Choose branch name** — use `feature/`, `fix/`, `chore/`, or `refactor/` prefix
3. **Create worktree** — `git worktree add ../<repo>-<branch> -b <branch>`
4. **Report** — branch name, worktree path, isolation reason

## Output

```text
Branch:    <prefix/short-name>
Path:      ../<repo>-<branch>
Reason:    <why isolation was needed>
```

## Rules

- Stop if the directory is not a git repo
- Never create throwaway branches without a clear reason
- Prefer worktrees over stashing for multi-day parallel work
- Keep the original checkout on its current branch
