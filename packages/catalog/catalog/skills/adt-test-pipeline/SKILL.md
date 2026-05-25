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

## Phases

### Phase 1 — Health audit (always)
Invoke `test-health` to produce the baseline: total tests, skipped, failing, flaky; coverage per package vs gate; suite runtime; dead test files.

If score is GREEN across all dimensions → skip Phase 2-3, run Phase 4 as a spot-check only.

### Phase 2 — Cleanup (if health is YELLOW or RED)
Invoke `test-cleanup` to reduce noise. Gate: do not drop any package below its current coverage threshold. If cleanup would reduce coverage below the gate, add a replacement integration test first.

### Phase 3 — Validate with mutation testing
Invoke `mutation-test` on files touched in Phase 2. Target mutation score ≥70% for business-critical modules.

If mutation score drops below 50% in a critical module → Phase 2 was too aggressive; revert highest-impact deletions until score recovers.

### Phase 4 — Capture (always)
Invoke `adr-write` to record before/after (test count, coverage %, runtime, mutation score), what was cleaned, gate values and rationale, and a revisit trigger.

## Reconciliation

```
TEST PIPELINE — <scope>

Phase 1 Health:   score <N>/100, <X> tests, <Y> skipped, <Z>% cov, <T>s runtime ✅
Phase 2 Cleanup:  <N> removed, <M> added/replaced ✅ | (skipped: health GREEN)
Phase 3 Mutation: score <N>%, <X> mutations killed ✅
Phase 4 ADR:      <path> ✅

Net: <before> → <after> tests, <before%> → <after%> coverage, <before> → <after> runtime
```

## Failure / Stop Conditions

- Phase 2: cleanup would drop any package below its coverage gate → stop, add replacement coverage first.
- Phase 3: mutation score drops below 50% in a critical module → revert Phase 2 deletions until score recovers.
- Phase 4: never skip ADR — gate changes rot without rationale.
- Do not lower coverage gates to make a cleanup pass succeed.
