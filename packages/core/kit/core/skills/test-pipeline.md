---
name: test-pipeline
description: Full test suite improvement composite — audit health, prune dead tests, validate with mutation testing, capture rationale in ADR. Use after a major feature ship, before tightening coverage gates, or when the suite shows bloat, excessive skips, or slow runtime. Chains test-health → test-cleanup → mutation-test → adr-write.
triggers:
  - test pipeline
  - improve test suite
  - clean up tests
  - fix test coverage
  - test health audit
  - suite cleanup
---

# test-pipeline

Composite for improving a test suite from audit through validated cleanup.

## Auto-invocation triggers

- User asks "clean up tests", "improve coverage", "the suite is slow"
- Test runtime exceeds 2 minutes
- Skipped test count grows past 10
- Coverage gate is failing or gate values feel arbitrary

## Workflow

### Phase 1 — Health audit (always)

Invoke `test-health` to produce the current baseline:
- Total tests, skipped, failing, flaky
- Coverage per package vs current gate
- Suite runtime
- Dead test files (no corresponding source)

Output: scored health report. If score is GREEN across all dimensions → skip Phase 2-3, run Phase 4 as a spot-check only.

### Phase 2 — Cleanup (if health is YELLOW or RED)

Invoke `test-cleanup` to reduce noise:
- Delete tests for deleted code
- Remove tests that duplicate coverage with lower signal
- Replace skip-annotated tests with placeholder issues
- Consolidate redundant setup/teardown

Gate: do not drop any package below its current coverage threshold. If cleanup would reduce coverage below the gate, add a replacement integration test first, then clean.

### Phase 3 — Validate with mutation testing

Invoke `mutation-test` on the files touched in Phase 2 (and any new coverage added):
- Confirm the surviving test suite kills meaningful mutations
- Target mutation score ≥70% for business-critical modules

If mutation score drops below 50% in a critical module → Phase 2 cleanup was too aggressive; revert the highest-impact deletions until score recovers.

### Phase 4 — Capture (always)

Invoke `adr-write` to record:
- Before/after: test count, coverage %, runtime, mutation score
- What was cleaned, what was added
- Current gate values and the rationale for where they're set
- Revisit trigger: "revisit when runtime exceeds X or mutation score drops below Y"

## Reconciliation

```
TEST PIPELINE — <scope>

Phase 1 Health:   score <N>/100, <X> tests, <Y> skipped, <Z>% cov, <T>s runtime ✅ DONE
Phase 2 Cleanup:  <N> removed, <M> added/replaced ✅ DONE | (skipped: health GREEN)
Phase 3 Mutation: score <N>%, <X> mutations killed ✅ DONE
Phase 4 ADR:      <path> ✅ DONE

Net: <before> → <after> tests, <before%> → <after%> coverage, <before> → <after> runtime
```

## Failure / Stop Conditions

- Phase 2: if cleanup would drop any package below its coverage gate → stop, add replacement coverage first, then re-run cleanup.
- Phase 3: if mutation score drops below 50% in a critical module → revert Phase 2 deletions until score recovers; do not ship a weaker suite.
- Phase 4: never skip ADR — gate changes rot without rationale.
- Do not lower coverage gates to make a cleanup pass succeed. If the gate was right, keep it.

## Memory Hooks

- Read prior pipeline runs for this repo to detect trend (runtime creep, gate drift, mutation score decline).
- Write the before/after snapshot so the next pipeline run has a regression baseline without re-running Phase 1 from scratch.
