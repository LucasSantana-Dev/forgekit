---
name: memory
description: Persist decisions, preferences, and project state across sessions
triggers:
  - memory
  - remember this
  - save for next session
  - persist
  - cross-session
---

# Memory

Sync important context to persistent storage so future sessions start informed.

## What to Remember

| Category | Examples | Priority |
|---|---|---|
| Decisions | Architecture choices, API design, naming conventions | high |
| Preferences | Code style, commit format, PR template | high |
| Blockers | Known issues, dependency constraints, environment quirks | high |
| Progress | Completed phases, shipped PRs, release history | medium |
| Context | Team members, repo relationships, deployment targets | medium |

## What NOT to Remember

- Transient debugging output
- Tool execution logs
- Completed todo items (already in git history)
- Session-specific file reads

## Steps

1. Identify decisions, preferences, or blockers from the current session
2. Check if they already exist in memory (avoid duplicates)
3. Write to the appropriate storage:
   - `.agents/memory/` for project-local memory
   - Plan files for in-progress work state
   - Git commit messages for shipped decisions
4. Confirm what was persisted

## Storage Locations

```text
.agents/memory/decisions.md    — architecture and design decisions
.agents/memory/preferences.md  — code style and workflow preferences
.agents/memory/blockers.md     — known issues and constraints
.agents/plans/<task>.md         — in-progress work state
```

## Rules

- Write memory at session end, not continuously
- Keep entries concise — one line per decision
- Date-stamp entries for staleness detection
- Remove entries that are no longer true
- Memory is supplementary — the codebase is the source of truth
