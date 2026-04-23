---
name: orchestrate
description: Break complex work into phases with dependency tracking and verification checkpoints
triggers:
  - orchestrate
  - break this down
  - multi-step
  - plan and execute
  - complex task
---

# Orchestrate

Break complex work into verifiable phases and execute them in order.

## Steps

1. Decompose the request into 3-7 atomic phases
2. Identify dependencies (which phases must complete before others)
3. Define per-phase: deliverable, verification check, estimated scope
4. Execute in dependency order
5. After each phase: verify, report, proceed or stop on failure
6. After all phases: run full quality gates

## Phase Template

```text
Phase N: <name>
  Scope: ~N lines across N files
  Deliverable: <what exists when done>
  Verify: <command or check>
  Depends on: <phase numbers or "none">
```

## Rules

- Never skip verification between phases
- Fix a failed phase before starting the next
- Independent phases can run in parallel when subagents are available
- Keep each phase under ~100 lines changed
- Write a brief status line after each phase completes
