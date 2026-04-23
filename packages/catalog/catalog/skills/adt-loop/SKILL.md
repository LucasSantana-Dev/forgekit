---
name: loop
description: Autonomous development cycle — plan, implement, test, review, fix, commit, and PR without stopping
triggers:
  - loop
  - autonomous
  - run the full cycle
  - dev loop
  - code loop
  - autopilot
  - ultraloop
---

# Loop

Run the full development cycle autonomously until the task ships or a hard stop triggers.

## Cycle

```text
PLAN → IMPLEMENT → VERIFY → REVIEW → FIX → COMMIT → (repeat) → PR
```

## Steps

1. **Receive task** — accept description, estimate scope, pick model tier (use route skill)
2. **Plan** — break into phases with dependencies (use orchestrate skill)
3. **For each phase:**
   a. Implement the change
   b. Run lint + type-check (fast feedback)
   c. If lint/types fail → fix immediately, max 3 attempts
   d. Run tests
   e. If tests fail → debug (use debug skill), fix, max 3 attempts
   f. Self-review the diff (use review skill)
   g. If review finds issues → fix and re-verify
   h. Commit with conventional message
4. **After all phases:**
   a. Run full quality gates (use verify skill)
   b. Push branch
   c. Open PR (use ship skill)
5. **If interrupted** — save state to plan file for resume

## Fallback Behavior

```text
Attempt 1: current model at current tier
Attempt 2: retry same model (transient failure)
Attempt 3: switch to fallback model at same tier
Attempt 4: switch to fallback provider
Attempt 5: escalate to next tier
After 5 failures on same phase: STOP and report
```

## Guardrails

- Never force-push or push to main
- Never skip tests to "make progress"
- Never suppress type errors to unblock
- Stop the loop if 3 consecutive phases fail
- Always run verify before claiming done

## Output Per Phase

```text
Phase N: <name> [DONE]
  Files: <list>
  Lint: ✓  Types: ✓  Tests: ✓ (N passed)
  Commit: <hash> <message>
```

## Final Output

```text
Loop Complete
─────────────
Phases: N/N completed
Commits: N
Branch: <name>
PR: <url>
Quality: lint ✓ | types ✓ | tests ✓ (N passed) | build ✓
```

## Resume

If the loop was interrupted, delegate to the `resume` skill — it detects the
handoff, plan state, git state, and open PRs, then re-enters the loop at the
last-incomplete phase without repeating work.
