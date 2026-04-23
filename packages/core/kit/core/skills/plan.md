---
name: plan
description: Analyze the codebase and create a structured implementation plan before writing any code
triggers:
  - create a plan
  - plan this
  - before implementing
  - what's the approach
---

# Plan

Before writing code, gather context and produce a structured plan.

## Steps

1. Read relevant files — CLAUDE.md / AGENTS.md, recent git log, open PRs
2. Understand the current state — what exists, what's partial, what's missing
3. Break work into phases (each completable in ~1-2 hours)
4. Identify dependencies between phases
5. Write plan to `.agents/plans/<task-name>.md` or `.claude/plans/<task-name>.md`

## Plan Structure

```markdown
# <Task>

## Goal
One sentence.

## Phases
### Phase 1: <name>
Steps, files to touch, verification check.

### Phase N: Ship
Lint + build + test + PR.
```

## Rules

- Explore before implementing — don't assume the current state
- Every phase must have a verification step
- Explicitly list what is OUT OF SCOPE
- If work is >40% done already, document what's complete before continuing
