---
name: feature-from-zero
description: Mega-composite — full greenfield feature development from idea to live. Chains research-and-decide (validate the idea + capture decision) → scope-and-execute (analysis + plan + implement) → design-build (if UI involved) → fix-the-suite (if tests need work) → merge-confidently → ship-it → knowledge-loop. The single command for "build feature X end-to-end."
triggers:
  - feature-from-zero
  - greenfield-feature-requests
  - spec-to-prod-workflows
  - ship
  - feature
  - greenfield
---

# Feature From Zero

Mega-composite for the largest natural unit of work: an entire feature, from "we
should build X" to "live in prod, decision captured." Chains 5 other composites
in the right order, with checkpoints between phases.

## Auto-invocation triggers

- User says "build feature X", "implement Y end-to-end", "ship the new W"
- Spec hand-off ("here's the spec, build it")
- Greenfield work (>2 days estimated)

Skip when scope is a small fix or refactor of existing code — use the more
focused composite (`scope-and-execute` or `refactor-pipeline`) directly.

## Workflow

### Phase 1 — Decide (always for greenfield)
Invoke `research-and-decide`:
- Validate the feature is worth building (vs alternatives, vs deferring)
- Decide on the approach (library choice, pattern, integration points)
- Write the ADR capturing rationale

If the decision is "don't build" or "defer": stop here. The ADR captures why.

### Phase 2 — Scope + plan (always)
Invoke `scope-and-execute`:
- Phase 1: analysis (adt-repo-intake or ecosystem-health)
- Phase 2: context-pack
- Phase 3: plan with phased steps and validation per phase
- Stops here for review before Phase 4 implementation

User reviews the plan. If rejected, loop back to plan phase with feedback. If
accepted, continue.

### Phase 3 — Implement (always)
Invoke `scope-and-execute` Phase 4 (execute):
- For independent tracks: dispatch (parallel sub-agents)
- For sequential work: loop
- For complex 3+ phases: three-man-team

Implementation follows the Phase 2 plan. Per-phase commits with validation gates.

### Phase 4 — UI build (only if feature has UI)
Detect if Phase 3 produced UI artifacts (new components, pages, layouts).
If yes: invoke `design-build`:
- Design context (web-design-guidelines or ui-audit)
- Scaffold (shadcn or tailwind)
- Build (impeccable for production UI, frontend-design for art-directed)
- Verify (webapp-testing — a11y, console, breakpoints)

### Phase 5 — Test suite check (always)
Invoke `test-health`:
- If verdict is HEALTHY: skip Phase 6
- If verdict is anything else: invoke `fix-the-suite`

This prevents the new feature from leaving the suite in a worse state.

### Phase 6 — Ship to merge (always)
Invoke `merge-confidently`:
- pr-merge-readiness verdict
- Resolve WAIT / FIX cycles
- Ship through merge gates

### Phase 7 — Ship to prod (always for production-bound work)
Invoke `ship-it`:
- Version bump + changelog
- Tag + GitHub release
- Deploy via correct deployer
- Post-deploy verify

If `ship-it` Phase 4 detects new Sentry issues: escalate to `production-incident`.

### Phase 8 — Capture (always — most-skipped step in real work)
Invoke `knowledge-loop`:
- Update memory with what was built and why
- Index into RAG for future search
- Write handoff if session is ending

## Reconciliation

Single feature summary across all phases:
```
FEATURE FROM ZERO — <feature name>

Phase 1 Decide:      ADR-NNNN <decision>
Phase 2 Plan:        <plan path, N phases, M files in scope>
Phase 3 Implement:   <commits, files changed>
Phase 4 UI:          <surfaces built / SKIPPED if no UI>
Phase 5 Tests:       <test-health verdict, fix-the-suite if applied>
Phase 6 Merge:       PR #N at <SHA>
Phase 7 Ship:        v<X.Y.Z> deployed to <target>, verified
Phase 8 Captured:    memory + RAG indexed, handoff if session-ending

Total commits: N
Total time: H hours wall-clock
```

## Outputs / Evidence

- Per-phase artifact (ADR, plan, commits, PR, tag, deploy proof, memory)
- Single end-to-end summary
- Captured for next-session search

## Failure / Stop Conditions

- Phase 1 decision is "don't build" → exit clean with ADR explaining why
- Phase 2 plan rejected by user → loop back; max 3 plan iterations before
  surfacing scope-too-fluid for stop-and-redefine
- Phase 3 implementation hits a blocker the plan didn't account for → trigger
  re-plan (back to Phase 2) rather than improvising past the plan
- Phase 7 deploy fails → STOP, do not auto-rollback (escalate to
  `production-incident`)
- Phase 8 is mandatory — never skip capture even if user is in a hurry; this is
  why prior decisions get lost

## Memory Hooks

- Read existing feature-related decisions to avoid re-litigating
- Write feature outcome with all phase artifacts; trend across features reveals
  bottlenecks (e.g., "Phase 5 fix-the-suite consistently takes 2x estimate")
