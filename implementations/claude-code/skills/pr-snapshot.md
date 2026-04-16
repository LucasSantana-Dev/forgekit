---
name: pr-snapshot
description: Multi-PR state snapshot in one GraphQL query. Takes space-separated PR numbers, returns table with state, merge status, failing checks, pending checks. Replaces "for P in 645 646 647; do gh pr view..." polling loop.
type: skill
triggers:
  - pr snapshot
  - check PRs
  - pr status
  - batch check
---

# pr-snapshot

Single `gh api graphql` query for N PRs instead of N sequential REST calls. See state, merge block reason, failing/pending checks in one table.

## When to use

- Checking 3+ PRs at once (e.g. morning triage, batch merge decision)
- Determining which PRs are blocked and why (SonarCloud? CodeQL? branch behind?)
- Quick dashboard view without visiting GitHub web

## When NOT to use

- Single PR (use `gh pr view <N>` directly)
- Need detailed check run logs (use `gh api check-runs` with filtering)
- Monitoring one PR over time (use `loop` or `ci-watch` skill instead)

## Usage

```bash
pr-snapshot 645 646 647 --repo LucasSantana-Dev/Lucky
pr-snapshot 123 124 125  # infers current repo from git origin
pr-snapshot --all  # all open PRs in current repo
```

## Output format

```
#PR   STATE   MERGE        FAILING              PENDING
645   OPEN    UNSTABLE     -                    Vercel, Sonar
646   OPEN    BLOCKED      SonarCloud           Build
647   MERGED  -            -                    -
```

Colors:
- GREEN: state=OPEN, merge=CLEAN or BLOCKED, no failing checks
- YELLOW: merge=BLOCKED (pending checks holding merge)
- RED: failing checks present

## Script behavior

1. Accepts space-separated PR numbers + optional `--repo OWNER/REPO` and `--all`
2. Constructs single GraphQL query with all PR identifiers
3. Extracts for each PR:
   - State (OPEN / CLOSED / MERGED)
   - Merge state (CLEAN, UNSTABLE, BLOCKED, UNKNOWN)
   - Check suite status (passing / failing / pending)
   - Failing check names (if any)
   - Pending check names (if any)
4. Formats as aligned table, colorized
5. Exit code 0 if all PRs mergeable, 1 if any blocked

## Rules

- **Single round trip**: All PRs fetched in one API call, not N sequential calls
- **Repo detection**: Uses git origin if --repo not provided
- **Exit codes**: 0=OK, 1=blocked, 2=error (invalid args)

## Related skills

- `coverage-gap` — when SonarCloud fails, dispatch test-fixer subagent
- `auto-ship` — after PR is clean, use this to merge hands-off
