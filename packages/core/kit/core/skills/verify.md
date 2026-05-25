---
name: verify
description: Run full quality gate suite before committing or creating a PR
triggers:
  - verify
  - quality check
  - run tests
  - before commit
  - before PR
---

# Verify

Run all quality gates. Do not commit or PR until all pass.

## Before running

State-check: if the most recent CI run against the same commit SHA is already fully green on all required gates, log "already verified at <SHA> — skipping" and stop.

## Gates (run in order)

```bash
npm run lint         # or: ruff check . / golangci-lint run / cargo clippy
npm run type-check   # or: tsc --noEmit / mypy . / go build ./...
npm test             # or: pytest / go test ./... / cargo test
npm run build        # confirm no build errors
```

## Rules

- Fix lint errors before moving on — don't suppress
- If tests fail, determine root cause before changing the test
- Coverage below threshold = a problem to fix, not a number to ignore
- Security: `npm audit --audit-level=high` for any dependency changes

## Output

Signal-first: verdict on the first line, then only gates with findings.

```
PASS — all required gates green
  Skipped: security (no dep changes)

FAIL — 1 gate failed
  ✗ tests — 3 failures (see log)
  ✓ lint
  ✓ type-check
  ✓ build
```

## Failure / Stop Conditions

- If a gate fails on code unrelated to the current change, name it as pre-existing and note whether it blocks shipping.
- Do not claim "verified" if any required gate was skipped for a reason other than "not applicable."
- Do not merge on PARTIAL without explicit user acknowledgement of what was skipped.
