---
name: safe-merge
description: Merge a PR safely to main with strict CI-green enforcement. Never bypass branch protection — no `--admin`, no `--no-verify`. Use when asked to merge, ship, or land a PR to main.
triggers:
  - merge PR
  - safe merge
  - ship to main
  - land PR
  - merge to main
---

# Safe Merge — Strict CI Gate

## Hard Rule (NEVER bypass)

Never use `gh pr merge --admin`, `git push --force` to main, `--no-verify`, or any flag that bypasses branch protection or pre-commit hooks. If a merge is blocked, the correct action is to **fix the blocker**, not bypass it.

Even if the only failing check is a "known-flaky" external provider (e.g. Vercel preview build limit), **do not** admin-merge. Either:
1. Remove that check from required list in branch protection (deliberate config change), or
2. Re-run the flaky provider until green, or
3. Mark the PR as draft and wait.

## Pre-Merge Checklist

Before running `gh pr merge <N>`:

```bash
PR=<N>; REPO=<owner/repo>

# 1. All required checks green
GH_PAGER=cat gh pr view $PR --repo $REPO --json mergeable,mergeStateStatus,statusCheckRollup \
  --jq '{mergeable, mergeStateStatus, failing: [.statusCheckRollup[] | select(.conclusion == "FAILURE" or .state == "FAILURE") | (.name // .context)]}'
# mergeStateStatus must be "CLEAN" or "HAS_HOOKS". Anything else (BEHIND, BLOCKED, UNSTABLE) → stop.

# 2. Branch up to date (no stale head vs base)
# If "the head branch is not up to date with the base branch" appears, run:
GH_PAGER=cat gh pr update-branch $PR --repo $REPO
# Then re-check CI from step 1 after re-run completes.
```

## Merge

Only when all required checks are SUCCESS and mergeStateStatus is CLEAN:

```bash
GH_PAGER=cat gh pr merge $PR --repo $REPO --squash --delete-branch
# NO --admin. NO --auto with bypass. If this fails, the PR is not ready.
```

## Branch Protection Baseline

Each repo's `main` (or release branch) must have:
- `required_status_checks.strict: true` (up-to-date enforcement)
- `enforce_admins: true` (blocks `--admin` bypass for everyone including repo owner)
- Required contexts include at minimum: lint/format, typecheck, unit tests, security scan
- `allow_force_pushes: false`
- `allow_deletions: false`

Verify with:

```bash
GH_PAGER=cat gh api /repos/$REPO/branches/main/protection --jq '{strict: .required_status_checks.strict, enforce_admins: .enforce_admins.enabled, contexts: .required_status_checks.contexts, force_push: .allow_force_pushes.enabled}'
```

To enable admin enforcement on a repo that lacks it:

```bash
GH_PAGER=cat gh api -X POST /repos/$REPO/branches/main/protection/enforce_admins
```

## When CI Fails

Use the `gh-fix-ci` skill to diagnose; fix; push; re-check. Do not merge until green.

## When Vercel / External Provider Blocks

If a non-essential external check (Vercel preview quota, Coderabbit comment, etc.) is the only failure:

```bash
# View exactly which checks are REQUIRED
GH_PAGER=cat gh api /repos/$REPO/branches/main/protection/required_status_checks/contexts

# Only REQUIRED contexts block merge. If the failure is non-required, merge is allowed without --admin.
# If the failure is required but the provider is transiently broken, remove it from required list deliberately — don't bypass.
```

## Rationale

Bypassing CI means shipping unverified code to production. The one time you bypass is the one time a real regression makes it through. The cost of waiting 10 minutes for a retry is always lower than the cost of a production rollback. Every `--admin` merge erodes the social contract that makes the gate meaningful.
