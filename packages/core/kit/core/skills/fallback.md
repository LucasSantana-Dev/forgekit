---
name: fallback
description: Graceful degradation when primary approach fails. Try alternates in priority order; record which path succeeded for future routing.
triggers:
  - "try fallback"
  - "primary failed"
  - "alternate approach"
  - "plan b"
---

# fallback

Graceful degradation when primary approach fails.

## Fallback Ladder

1. **Try primary** — Execute preferred approach.
2. **On failure** — Capture error, severity, and root cause.
3. **Try secondary** — Run alternate (lower cost, lower latency, or lower fidelity).
4. **Try tertiary** — Final fallback (minimal viable approach).
5. **Escalate** — If all fail, surface blocker and ask the user.
6. **Record** — Note which path succeeded for future routing.

## Examples

- Primary API rate-limited → try cheaper model or cached result
- Preferred tool unavailable → shell equivalent or simpler approach
- Test framework broken → manual verification or other test harness
- Deployment target down → try alternate region or staging

## Failure / Stop Conditions

- One attempt per fallback level — do not retry a fallback that already failed.
- If all safe paths are exhausted, checkpoint current state and escalate: "All paths blocked: [last failure]. Next option requires user decision."
- Do not invent a workaround that changes the security posture (e.g., disabling a check, widening permissions) as a fallback — surface it instead.

## Memory Hooks

- Read memory if the blocking tool or path has a known reliable workaround from a prior session.
- Write memory only if a new durable fallback path is confirmed working, so future sessions can skip rungs.
