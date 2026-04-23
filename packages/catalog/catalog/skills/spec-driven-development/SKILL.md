---
name: spec-driven-development
description: >-
  AI agents are fast at writing code but have no memory of your intent. You
  describe a feature in a prompt, the agent builds it, and three sessions later
  a different agent (or you) changes it in a way that drifts from the original
  requirement. The spec lives only in your head.
---
# Spec Driven Development

> Write the spec first. The agent writes the code. Both are working from the same source of truth.

## The Problem

AI agents are fast at writing code but have no memory of your intent. You describe a feature in a prompt, the agent builds it, and three sessions later a different agent (or you) changes it in a way that drifts from the original requirement. The spec lives only in your head.

The second problem: agents working in parallel on the same feature have no shared contract. Two agents building the frontend and backend of the same endpoint will disagree on field names, nullability, and error shapes unless something pins them together.

## The Pattern

Spec Driven Development (SDD) places a machine-readable spec at the center of the workflow. The spec is written first, agents are grounded to it, and code that diverges from it is wrong — not just different.

### Three Roles the Spec Plays

| Role | How |
|------|-----|
| **Agent instruction** | Loaded into context as a grounding file before any implementation work |
| **Inter-agent contract** | Frontend and backend agents share the same spec; both are bound by it |
| **Regression anchor** | Future changes must update the spec before touching the code |

### Spec File Structure

Keep specs close to the code they describe. One spec per feature or module boundary.

```
src/
  features/
    billing/
      billing.spec.md       ← spec lives here
      billing.service.ts
      billing.controller.ts
      billing.test.ts
```

A spec is a structured document, not prose. Structured means any agent can parse it consistently.

### Minimal Spec Template

```markdown
# Feature: <name>

## Purpose
One sentence. What user problem does this solve?

## Scope
- IN: what this feature handles
- OUT: what it explicitly does not handle

## Inputs
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| ...   | ...  | ...      | ...   |

## Outputs
| Field | Type | Notes |
|-------|------|-------|
| ...   | ...  | ...   |

## Behavior
Numbered, testable statements:
1. If X, then Y.
2. Error Z is returned when W.
3. Side effect: event E is emitted after A.

## Constraints
- Performance: response < 200ms at p99
- Security: input is sanitized before passing to DB
- Compatibility: must work with schema version >= 3

## Open Questions
- [ ] Should field X be nullable when user has no billing history?
```

### Workflow

```
1. Write spec (human + agent collaboration)
   └── spec.md committed, reviewed, approved

2. Implement against spec
   └── Agent reads spec.md before writing code
   └── Agent references behavior statements as acceptance criteria

3. Test against spec
   └── Each behavior statement becomes at least one test

4. Change control
   └── Any feature change requires spec update first
   └── PR diff must include spec.md changes
```

### Grounding Agents to a Spec

When starting implementation work, include the spec in the agent's context explicitly:

```markdown
<!-- In your prompt or CLAUDE.md for the feature directory -->
Before implementing, read billing.spec.md. Every behavior statement in that file
is an acceptance criterion. Do not implement anything outside the defined scope.
```

For Claude Code, you can use directory-level `CLAUDE.md` files to auto-load the spec:

```markdown
<!-- src/features/billing/CLAUDE.md -->
@billing.spec.md

All work in this directory must conform to the spec above.
Flag any spec ambiguity before writing code, not after.
```

### Multi-Agent Coordination

When agents work in parallel, the spec is the contract that prevents drift:

```
[Spec] billing.spec.md
   ├── [Agent A] Implements backend service
   │     reads spec → produces billing.service.ts
   └── [Agent B] Implements frontend form
         reads spec → produces BillingForm.tsx

Both agents are grounded to the same field names, types, and error shapes.
```

If Agent A returns `{ invoice_id: string }` but Agent B expects `{ invoiceId: string }`, the spec catches the conflict — not integration tests at 2am.

### Spec Fidelity Checks

Build verification into your workflow:

```bash
# In CI or pre-commit: check that spec and implementation stay in sync
# Example: extract endpoint contracts from spec and diff against OpenAPI output
```

For TypeScript projects, derive types from the spec rather than duplicating them:

```typescript
// billing.types.ts — generated from or directly references billing.spec.md
// When spec changes, types change. When types change without spec change → flag it.
```

### When Specs Evolve

Specs are not frozen. Requirements change. The rule is:

1. Update the spec first
2. Review the spec change (PR, pair review, or async comment)
3. Implement the code change
4. Never let code diverge silently

A spec that lags behind the code is worse than no spec — it actively misleads agents.

## Spec Granularity

Not every file needs a spec. Apply SDD where the cost of misalignment is high:

| Apply SDD | Skip SDD |
|-----------|----------|
| Public APIs and service boundaries | Internal utility functions |
| Features with multiple stakeholders | Refactors with no behavior change |
| Parallel agent work | Single-session throwaway scripts |
| Anything customer-facing | Build config and tooling setup |

## Anti-Patterns

- **Spec as prose**: "The billing system should handle invoices nicely." Not actionable; agents will interpret differently every time.
- **Spec written after code**: Reverse-engineering a spec from existing code produces a description, not a specification. The coercive value is gone.
- **One giant spec**: A 500-line spec for an entire application is too coarse. Split at feature or module boundaries.
- **Orphaned specs**: Specs that no agent ever reads. If you can't reference the spec in a prompt or auto-load it via `CLAUDE.md`, it provides no grounding value.
- **Spec theater**: Writing specs to satisfy a process requirement without agents ever being bound to them.

## Measuring Effectiveness

SDD is working when:
- Agents ask clarifying questions about scope rather than assuming
- First-attempt implementations match the spec without correction
- Integration bugs between parallel agents drop measurably
- Code reviews reference spec statements, not just code style
- Changing a feature means editing the spec first, naturally
