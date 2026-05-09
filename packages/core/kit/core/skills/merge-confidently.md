---
name: merge-confidently
description: Composite skill — take a PR from "I think it's ready" to merged with full gate verification. Chains pr-merge-readiness (verdict) → ci-watch / gh-fix-ci (if blockers) → gh-address-comments (if review needed) → ship (when verdict is MERGE). Use as the one-call answer to "can I merge this?" instead of running 4 skills sequentially.
triggers:
  - merge-confidently
  - merge-requests
  - pr-completion-claims
  - composite skill
  - merge
---

# Merge Confidently

Daily-use composite. Turns "is this PR ready?" into one workflow that resolves
every blocker automatically and stops only when human input is required.

## Auto-invocation triggers

- User says "merge this", "ship this", "is this ready"
- After commit-push-pr workflow completes with a new PR
- When a PR has been open >24h without action

## Workflow

### Phase 1 — Combined verdict (always)
Invoke `pr-merge-readiness` for the 8-signal aggregate verdict.

Verdict drives the remaining phases:
- **MERGE** → skip to Phase 5
- **WAIT** → Phase 2 (resolve waits)
- **FIX** → Phase 3 (resolve blockers)

### Phase 2 — Resolve waits (if WAIT)
For each WAIT signal:
- CI in progress → invoke `ci-watch` until checks complete, then re-verdict
- Branch behind base → rebase or merge base in
- Awaiting review → notify reviewers, wait or page
- CodeRabbit/Greptile suggestions → invoke `gh-address-comments`

After resolution: re-invoke `pr-merge-readiness`. If still WAIT after 2 cycles,
surface to user — likely needs human decision.

### Phase 3 — Resolve blockers (if FIX)
For each FAIL signal:
- CI failure → invoke `gh-fix-ci` (autonomous fix attempt)
- CHANGES_REQUESTED review → invoke `gh-address-comments`
- Conflicts → rebase, resolve, push
- Branch protection block → surface to user; do not bypass

After fix: re-invoke `pr-merge-readiness`. Loop max 3 times before escalating.

### Phase 4 — Re-verify (if Phase 2 or 3 ran)
Re-invoke `pr-merge-readiness`. Continue when verdict is MERGE.

### Phase 5 — Ship (always when MERGE)
Invoke `ship`. It handles version bump / changelog / tag / merge / post-merge
verification. Refuses --admin / --no-verify automatically.

### Phase 6 — Cleanup (always after merge)
- Delete merged branch (if not auto-deleted by GitHub)
- Invoke `commit-commands:clean_gone` if multiple stale local branches exist
- If release was cut: invoke `chain-release` to coordinate downstream repos

## Reconciliation

Per-cycle status update, final summary:
```
MERGE CONFIDENTLY — PR #<n> "<title>"
  Initial verdict:  WAIT (CodeRabbit suggestions, CI in progress)
  Cycle 1:          ci-watch → green; gh-address-comments → resolved
  Re-verdict:       MERGE
  Shipped:          merged at <SHA>; v<X.Y.Z> tagged
  Cleanup:          branch deleted; 2 stale local branches pruned
```

## Outputs / Evidence

- Initial readiness verdict
- Per-cycle resolution log
- Merge SHA
- Tag / release if applicable

## Failure / Stop Conditions

- After 3 fix cycles still FIX → stop, escalate to user with full blocker list
- After 2 wait cycles still WAIT → stop, likely needs human decision (review,
  staffing, environment access)
- Never invoke `ship` directly without `pr-merge-readiness` returning MERGE
- Never use `--admin` or `--no-verify` even if `ship` would refuse — that's a
  user-only override
