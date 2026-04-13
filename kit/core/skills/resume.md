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
## Anti-Pattern: False Completion

**Symptom**: Resume finds clean git and all plan phases marked done → archives handoff without implementing anything.

### Root Causes

1. **Handoff captured already-done phases** — grep extracted plan header including completed phases
   - Fix: Only extract phases without `✅`, `DONE`, or `complete` markers

2. **No explicit action directive** — handoff says "review state" instead of "implement X"
   - Fix: Require `## ⚡ IMPLEMENT THIS` section with checkboxes in every handoff

3. **Plan phases not marked complete** — completed phases show as pending to the next agent
   - Fix: Immediately after merging/shipping, update plan: `## Phase 1 ✅ SHIPPED`

### Checklist Before Archiving

- [ ] Read the `## ⚡ IMPLEMENT THIS` section (not just task description)
- [ ] Is there uncompleted work in that section?
  - Yes → implement first, then archive
  - No → archive (work was done before handoff was created)
- [ ] Is git clean because work shipped, or because work was never started?

## Rules

- Always check git state before suggesting work
- If an open PR exists, prioritize review feedback over new work
- Never start new work without acknowledging in-flight work
- If a plan file exists, continue from where it left off
