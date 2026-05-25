---
name: scope-and-execute
description: Composite skill — understand a problem area, plan the work, execute it, and ship it in one chained workflow. Chains adt-repo-intake or ecosystem-health (analysis) → context-pack (load context) → plan (phased plan) → parallel agents or loop (execute) → ship (merge). Use when the task is "fix the X area" or "implement Y end-to-end" — the single command for analysis through merge.
triggers:
  - scope-and-execute
  - open-ended-feature-or-fix-requests
  - composite skill
  - merge
---

# Scope and Execute

Replaces the "should I /plan first or /loop?" decision with one workflow that handles
the whole arc: understand → plan → execute → merge.

## Auto-invocation triggers

- User asks to "fix X", "implement Y", "build the Z feature" with non-trivial scope
- User asks to "look at this repo and figure out what to do"
- Work spans multiple files or services
- Estimated >1h of effort

## Workflow

### Phase 1 — Analysis (always)
- New repo / unfamiliar code: invoke `adt-repo-intake`
- Multi-repo or workspace context: invoke `ecosystem-health`
- Already in active work: skip Phase 1
- Output: scope brief — which files, which contracts, which dependencies

### Phase 2 — Context loading (always for non-trivial work)
- Invoke `context-pack` (or `auto-context-pack` if it has already fired this prompt)
- Pulls relevant code, standards, prior ADRs, related decisions
- Cap at 2k tokens

### Phase 3 — Plan (skip for trivial single-file changes)
- Invoke `plan` to write a phased plan with validation per phase
- Output: `.claude/plans/<task>.md`
- Skip if scope is genuinely 1-2 files with obvious edits

### Phase 4 — Execute (always)
- For independent parallel tracks: spawn parallel sub-agents via the `Agent` tool
- For sequential inspect→act→verify: invoke `loop`
- For complex 3+ phase work: invoke `three-man-team`
- Implement against Phase 3's plan

### Phase 5 — Pre-merge (always for shippable work)
- Invoke `merge-confidently` (or `pr-merge-readiness` directly)
- Resolve any blockers
- Invoke `ship` when verdict is MERGE

### Phase 6 — Capture (always)
- If non-trivial decision was made: invoke `adr-write`
- Invoke `knowledge-loop` to update memory + RAG

## Reconciliation

Output a scope summary at start, status updates between phases, final summary:
```
SCOPE AND EXECUTE — <task>
  Phase 1 Analysis:    <files in scope>, <key dependencies>
  Phase 2 Context:     <token count loaded>
  Phase 3 Plan:        <plan path, N phases>
  Phase 4 Execute:     <commits, files changed>
  Phase 5 Ship:        <PR number, merge SHA>
  Phase 6 Capture:     <ADR / memory paths>
```

## Outputs / Evidence

- Scope brief
- Plan file
- Implementation commits
- Merged PR
- Decision capture

## Failure / Stop Conditions

- Analysis reveals scope >1 week of work → stop, recommend breaking into phases
- Plan rejected by user → restart Phase 3 with their feedback
- Phase 5 verdict is FIX → stop and surface blocker, do not push through
- Never auto-merge without Phase 5 returning MERGE
