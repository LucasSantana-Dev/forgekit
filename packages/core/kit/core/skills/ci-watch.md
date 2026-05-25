---
name: ci-watch
description: Inspect current CI state, identify the first real blocker, separate required failures from noise, and monitor until checks settle. Use when checks are failing, flaky, or blocking a merge.
triggers:
  - ci watch
  - failing checks
  - check the pipeline
  - ci blocker
  - checks failing
---

# ci-watch

Use for broken checks, flaky tests, or merge-blocking pipeline noise.

## Phase 1 — Triage

1. Identify the active PR or HEAD commit.
2. List non-passing checks.
3. Separate required failures from advisory noise.

Read PR state first:
```bash
gh pr view N --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

## Phase 2 — Diagnose

4. Inspect the first failing required job deeply (logs, not just the summary line).
5. Name the smallest fix — or the exact reason the failure is pre-existing / unrelated to the current change.

## Phase 3 — Fix or Monitor

6. If fixable: apply smallest fix, push, watch checks settle.
7. If not fixable now: document the blocker and surface it as output.
8. For checks that take >1 min to settle: arm a `Monitor` (see below) rather than busy-waiting.

## Output

Signal-first: verdict on the first line.

```
BLOCKED — <job name>: <one-line cause>
  Fix: <smallest concrete action>
  Blocks shipping: yes / no

CLEAR — all required checks green
```

## Reconciliation

```
CI WATCH — <PR/SHA>

Phase 1 Triage:   N failing checks (<X> required, <Y> advisory) ✅
Phase 2 Diagnose: root cause: <description> ✅
Phase 3 Fix:      <action taken> | (blocked: <reason>) ✅

Result: RESOLVED | BLOCKED (requires: <what unblocks it>)
```

## PR state machine

Read `gh pr view N --json mergeable,mergeStateStatus,reviewDecision` first, then:

| mergeable / state | Action |
|---|---|
| `MERGEABLE` + `CLEAN` | proceed to merge |
| `MERGEABLE` + `UNSTABLE` | non-required check failing or pending; poll required-only checks |
| `MERGEABLE` + `BEHIND` | `gh pr update-branch` or local rebase + force-push |
| `MERGEABLE` + `BLOCKED` | check `reviewDecision` and branch protection; if self-PR → enforce_admins toggle pattern |
| `CONFLICTING` + `DIRTY` | local rebase first; if `git merge-tree` reports clean but GH disagrees → webhook desync, close+recreate PR |
| `UNKNOWN` + `UNKNOWN` | GitHub still computing — wait 15s, recheck once; if STILL UNKNOWN, try `gh pr merge` directly (may already be merged) |

## Polling with Monitor

For checks that take >1 min to settle, use the `Monitor` tool with an until-loop instead of busy-waiting:

```
Monitor command: until s=$(gh pr view N --json statusCheckRollup); \
  pend=$(echo "$s" | python3 -c "..."); [ "$pend" = "0" ]; do sleep 15; done
```

Don't issue a single long `sleep` — the harness blocks chained sleeps.

## Common gotchas

- `UNKNOWN` often means the PR was *already merged* in another window. Verify with `gh pr view N --json state` before re-arming a monitor.
- `mergeStateStatus: BLOCKED` with no failing checks = review or branch protection. Look at `requiredStatusChecks` + `requiredApprovingReviewCount`.
- A PR head SHA that disagrees with `git ls-remote` for its branch ref = webhook desync. Close + recreate, don't try to nudge.
