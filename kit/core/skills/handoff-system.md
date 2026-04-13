---
name: handoff-system
description: "Preserve session state across tool switches and context resets. Generate handoff at message 22 (auto) or on demand. Anti-false-completion: IMPLEMENT section prevents archiving-without-work."
triggers:
  - /handoff
  - session limit approaching
  - switch to codex
  - message 22
  - save session
metadata:
  owner: global-agents
  tier: housekeeping
  run_frequency: message-22, before-compact, on-demand
---

# Handoff System — Cross-Tool Session Continuity

Preserve session state when hitting Claude context limits, switching to Codex, or resuming work in a fresh session. The critical invariant: **the handoff file must describe NEW work to implement, not just verify state.**

## When to Trigger

| Trigger | Timing | Priority |
|---|---|---|
| Auto (message 22) | ~90% context | Always |
| Manual `/handoff` | Before `/compact` or tool switch | On demand |
| Pre-compact hook | Automatically before /compact | Always |

## Handoff File Format

Save to `~/.claude/handoffs/<project>/latest.md`:

```markdown
# Handoff — <project> — <YYYY-MM-DD HH:MM>

## Task
<single-sentence: what is being built/fixed and why>

## ⚡ IMPLEMENT THIS — Do Not Just Verify State or Archive
- [ ] <explicit next action 1>
- [ ] <explicit next action 2>
- [ ] verify, commit, push, open PR

## Current State
- Branch: <branch>
- Last commit: <git log --oneline -1>
- Uncommitted: <git status --short | head -5 or "clean">

## Context Preserved
- Plan file: <path or "none">
- Open PRs: <gh pr list --head <branch> or "none">
- Blockers: <any known blockers or "none">

## Resume in Codex
`codex "$(cat ~/.claude/handoffs/<project>/latest.md)"`
```

## Auto-Generation Steps

At message 22 (or on `/handoff`):

1. Extract project: `git remote get-url origin | sed 's|.*/\([^/]*/[^/]*\)\.git|\1|'`
2. Read current branch: `git branch --show-current`
3. Extract last 1-3 commits: `git log --oneline -3`
4. Read git status: `git status --short | head -5`
5. Find active plan: scan `.agents/plans/` or `.claude/plans/` for incomplete phases
6. Write file to `~/.claude/handoffs/<project>/latest.md`
7. Print: `Resume with: codex "$(cat ~/.claude/handoffs/<project>/latest.md)"`

## Critical Anti-Patterns

### False Completion
**Symptom**: Codex loads handoff, finds clean git state, archives without implementing anything.

**Causes and fixes**:

1. Handoff captured already-completed phases
   - Fix: Extract only UNCOMPLETED phases: `grep "^### Phase" plan.md | grep -v "✅\|DONE\|complete"`

2. No explicit IMPLEMENT THIS directive
   - Fix: Always include `## ⚡ IMPLEMENT THIS` with actionable checklist — not just "review state"

3. Plan phases not marked complete after shipping
   - Fix: After merging, immediately update plan: `## Phase 1 ✅ SHIPPED v2.6.80`

### Over-Archiving
Symptom: Every resume call archives the handoff without checking if the work is done.
Fix: Archive only after verifying the checklist items are actually shipped.

## Integration: Claude ↔ Codex

The resume protocol works identically in both tools:

1. Check for `~/.claude/handoffs/<project>/latest.md`
2. If found: **implement the IMPLEMENT THIS section** (do not just read and archive)
3. After shipping: `mv latest.md $(date +%Y-%m-%d-%H-%M)-completed.md`

Never archive without implementing unless work was completed before the handoff was created.

## Rules

- Handoff must have `## ⚡ IMPLEMENT THIS` section with at least one checkbox
- Never auto-archive a handoff because git is clean — clean git just means no local changes
- Mark plan phases `✅ SHIPPED` immediately after merging so future handoffs skip them
- One handoff per project (`latest.md`) — old ones are archived with timestamp suffix
