---
name: production-incident
description: Composite skill — full production incident workflow from alert to post-mortem. Chains sentry (triage incoming events) → debug-deep (root cause) → incident-response (coordinate fix + comms) → ship-it (rollback or hotfix deploy) → adr-write (post-mortem). Use when production is on fire — not for dev-time debugging (use debug-deep alone for that).
triggers:
  - production-incident
  - production-down
  - sentry-spike
  - ship-it-detected-new-errors
  - composite skill
  - ship
  - deploy
  - incident
---

# Production Incident

The on-fire workflow. Different from `debug-deep` (dev-time investigation) — this
one assumes users are affected RIGHT NOW and prioritizes blast-radius reduction
before root cause.

## Auto-invocation triggers

- User says "prod is down", "users are reporting X", "Sentry is firing"
- `ship-it` Phase 4 detected new Sentry issues post-deploy
- Manual escalation from a regular bug that turned out to be production-impacting
- Sentry alert webhook (if wired)

## Workflow — sequential, blast-radius first

### Phase 1 — Triage (ALWAYS, FIRST)
Invoke `sentry` to pull the incoming event picture:
- Issue count + frequency in last 15 minutes
- Affected users / orgs / regions
- First seen timestamp (correlate with recent deploys)
- Stack trace top frame

**Decide blast-radius:**
- Single user / single feature → Phase 2 (investigate)
- Multiple users / one feature → Phase 2 + parallel Phase 3 (consider rollback)
- Multiple users / multiple features → SKIP to Phase 3 (rollback first, debug after)

### Phase 2 — Root cause (if blast-radius limited)
Invoke `debug-deep`:
- Hypothesis tree from the Sentry stack trace
- Tracer agent for evidence walk
- Bisect to introducing commit (almost certainly the most-recent deploy)

### Phase 3 — Stop the bleeding (if blast-radius high OR Phase 2 confirms recent deploy)
Two options based on severity:

**Option A — Rollback** (preferred for high blast-radius):
- Invoke `ship-it` in rollback mode: revert to previous tag, deploy
- Communicate via `incident-response` (Linear ticket + Slack post)
- Continue to Phase 4 to fix forward

**Option B — Hotfix** (for limited blast-radius with known fix):
- Implement the fix
- Skip normal merge gates: invoke `ship-it` with `--hotfix` (still NOT `--admin`)
- Verify in Phase 5

### Phase 4 — Coordinate (always)
Invoke `incident-response` to:
- Create Linear incident ticket
- Cross-reference Sentry issue ID
- Pin a Slack/Discord post if applicable
- Track timeline (alert time → triage → action → resolve)

### Phase 5 — Verify resolution (always)
- Wait 5-10 min after action
- Invoke `sentry` again — confirm new event rate dropped to zero or pre-incident baseline
- Hit affected endpoint manually to confirm
- Update Linear ticket with resolution

### Phase 6 — Post-mortem (always, mandatory)
Invoke `adr-write` with post-mortem template:
- Timeline (alert → resolved)
- Root cause
- Why monitoring didn't catch it earlier
- Why it slipped through tests / CI
- Action items: tests to add, monitors to add, gates to tighten
- Revisit when: when the action items are complete

Then invoke `knowledge-loop` to capture for future similar incidents.

## Reconciliation

```
PRODUCTION INCIDENT — <issue summary>

Detected:    <timestamp> via <source>
Blast:       <users/scope affected>
Root cause:  <one-liner from Phase 2>
Action:      <rollback to v<X> | hotfix v<Y>>
Resolution:  <timestamp>, took <minutes>
Sentry:      <event rate before / after>

Linear:      <ticket URL>
Post-mortem: ADR-NNNN

Action items: <count> (tests:N, monitors:N, gates:N)
```

## Outputs / Evidence

- Triage report
- Root cause + evidence
- Rollback or hotfix deploy proof
- Linear ticket
- Post-mortem ADR with action items
- Sentry resolution confirmation

## Failure / Stop Conditions

- Sentry inaccessible → cannot triage; surface immediately, fall back to manual
  user-report investigation
- Rollback fails (deploy broken too) → ESCALATE — page humans; this skill cannot
  fix infrastructure failures
- Phase 6 ADR cannot be written without root cause → block; do not declare
  resolved without understanding why

## Memory Hooks

- Read prior incidents on the same component to detect recurring patterns
- Write incident outcome with full timeline; trend across months reveals fragile
  areas worth structural refactors
