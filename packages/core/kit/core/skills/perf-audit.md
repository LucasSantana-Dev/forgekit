---
name: perf-audit
description: End-to-end performance audit composite — baseline the slow metric, profile to find the real hotspot, implement the smallest targeted fix, re-benchmark to confirm improvement, capture in ADR. Use when users report slowness, CI shows runtime regression, or before a release. Never optimize without profiling first.
triggers:
  - perf audit
  - performance audit
  - slow build
  - slow tests
  - performance regression
  - optimize performance
  - profile this
---

# perf-audit

Profile before you optimize. Never guess hotspots.

## Auto-invocation triggers

- User reports slowness or a performance regression
- Test suite runtime creeps past the threshold in memory
- Build time exceeds 2× the baseline recorded last audit
- Before a major release where latency matters

## Workflow

### Phase 1 — Baseline (always)

Measure current performance across relevant dimensions and record the numbers:

| Dimension | Tool |
|---|---|
| Test suite runtime | `time npm test` / `vitest bench` |
| Build time | `time npm run build` |
| Bundle size | `npx bundlesize` / `size-limit` |
| API latency | `curl -w "@curl-format.txt"` / `k6 run` |
| DB query time | slow query log / `EXPLAIN ANALYZE` |
| Node memory/CPU | `clinic flame` / `--prof` |

These numbers go into the reconciliation block as the before-state.

### Phase 2 — Profile (always — identify before fixing)

Locate the top 1-3 hotspots:

- **Node:** `clinic flame` or `node --prof` + `node --prof-process`
- **Frontend:** Chrome DevTools Performance tab, `webpack-bundle-analyzer`
- **DB:** `EXPLAIN ANALYZE`, slow query log
- **Tests:** `vitest --reporter=verbose`, `jest --logHeapUsage`

Do NOT skip this phase and jump to a fix based on intuition. If production-only latency, collect traces first (Sentry/OpenTelemetry) before attempting a local reproduction.

### Phase 3 — Fix (smallest change, biggest hotspot)

Apply the no-big-bang rule: fix one hotspot per PR. If the fix would touch >5 files or >150 LOC → stop and escalate to `/research-and-decide`.

Common patterns:
- Memoize pure functions called in hot loops
- Lazy-load modules imported eagerly at startup
- Add DB indexes for unindexed foreign keys
- Replace synchronous I/O with async equivalent
- Deduplicate test setup/teardown (for test-suite hotspots)

### Phase 4 — Validate

Re-run the same benchmarks from Phase 1 under the same conditions. Confirm:
- Improvement is measurable (>5% or above the noise floor for that metric)
- No regression on other dimensions
- CI gates still pass

If improvement is <5% → the fix may not be worth the change risk. Revert and document.

### Phase 5 — Capture (always)

Write an ADR with:
- Context: which metric, by how much
- Decision: what was changed (or "no change — below noise floor")
- Before/after numbers
- Revisit when: the metric crosses the threshold again

Invoke `knowledge-loop` to index the baseline so future audits detect regressions immediately.

## Reconciliation

```
PERF AUDIT — <scope>

Phase 1 Baseline:  <metric>: <before value> ✅ DONE
Phase 2 Profile:   Hotspot: <file/function/query> ✅ DONE
Phase 3 Fix:       <change applied> | (escalated to /research-and-decide) ✅ DONE
Phase 4 Validate:  <metric>: <before> → <after> (<delta>%) ✅ DONE
Phase 5 Capture:   ADR <path> ✅ DONE | (skipped: below noise floor)
```

## Failure / Stop Conditions

- Phase 2: if profiling tools are unavailable for the target environment → baseline with available metrics, note the gap in the ADR, continue.
- Phase 3: if fix scope exceeds 5 files / 150 LOC → stop, escalate to `/research-and-decide`; do not implement a big-bang optimization.
- Phase 4: if no measurable improvement → revert, mark as "investigated, no action" in ADR, stop.
- Never ship a fix whose only evidence is subjective. Require numbers.

## Memory Hooks

- Read memory for prior profiling on this area — avoid re-profiling what's already been measured.
- Write the baseline numbers as a memory note so future runs detect regressions without re-running Phase 1 from scratch.
