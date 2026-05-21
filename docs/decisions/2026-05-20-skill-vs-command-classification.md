# Skill vs Command classification rule

**Date:** 2026-05-20  
**Status:** Accepted

## Context

The catalog defines two kinds for slash commands: `skill` (installed as a directory
`~/.claude/skills/<id>/` with a `SKILL.md`) and `command` (installed as a single file
`~/.claude/commands/<id>.md`). Both surface as slash commands to the user, so the
structural difference is not obvious to a contributor deciding which kind to use.

At time of writing, the `commands/` directory in the catalog is **empty** — the schema
and install infrastructure exist, but no Command entries have been promoted yet. The
classification rule is being established proactively, before the first promotions.

Schema evidence:

| Field / capability | Skill | Command |
|--------------------|-------|---------|
| Auto-invoke triggers | ✅ | ❌ |
| `editors` (editor targeting) | ✅ | ❌ |
| `usage` (use_when, skip_when, prerequisites, resources) | ✅ | ❌ |
| `install.post_install` | ✅ | ❌ |
| `install.copy_to` (custom target path) | ✅ | ❌ |
| `argument_hint` (brief UI hint, max 200 chars) | ❌ | ✅ |
| `category` (grouping label) | ❌ | ✅ |
| Install target | Directory | Single file |

The initial Phase 1 rule ("Command when: single invocation + no auto-invoke + no aux
files + argument_hint captures full input") was reviewed by the `critic` agent and
returned VERDICT: MODIFY. Core finding: the rule focuses on structure while ignoring
intent and purpose, which causes three failure modes — over-promotion of procedural
templates as Skills, under-promotion of simple reference material that stays as Skills
out of contributor uncertainty, and mutual confusion because the rule reads as a
structural checklist rather than a design question.

## Decision

**Default to Skill. Promote as Command only when ALL five gates pass:**

1. **Intent gate** — the entry is explicitly invoked by the user (`/command-name`);
   it is never auto-triggered by the composite router or any hook.

2. **Simplicity gate** — the content is reference material (template, checklist, cheat
   sheet) — not procedural scaffolding that walks the user through steps or calls
   sub-skills.

3. **Argument gate** — `argument_hint` (max 200 chars) meaningfully captures the full
   input surface; there are no optional flags, conditionals, or complex parameterization
   that would require a richer `usage.use_when` / `skip_when` description.

4. **Metadata gate** — the entry is editor-agnostic, needs no prerequisites, no
   post-install wiring, and no resource hints (gpu, storage, compute, network, cost).

5. **State gate** — the output is stateless; the result does not depend on detecting
   file existence, environment variables, mode flags, or any other runtime state.

Promote as Skill when **any** of these apply:
- Auto-invoke triggers exist or are plausible
- Procedural scaffolding (multi-step workflow, calls to sub-skills or agents)
- Editor targeting
- Resource hints or prerequisites
- Post-install wiring
- Input is complex, parameterized, or conditional
- Output depends on runtime state

## Alternatives considered

| Option | Rejected because |
|--------|-----------------|
| Original 4-gate rule (Phase 1) | Structural checklist — doesn't express design intent; causes over-promotion and under-promotion; MODIFY verdict from critic |
| "Always Skill" | Forfeits `argument_hint` / `category` schema expressivity; makes simple reference material heavier than it needs to be |
| "Command for any simple prompt" | "Simple" is subjective; without gates, contributors will differ on where to draw the line; catalog diverges inconsistently |
| Schema presence as the rule | `argument_hint` and `editors` can technically coexist in a hybrid; schema presence is insufficient as a classifier |

## Consequences

- Contributors get a clear question sequence: "Does it auto-invoke?" → "Is it reference
  material?" → "Can a 200-char hint capture the full input?" → "No metadata?" →
  "Stateless?" — five yeses → Command; any no → Skill.
- The Command catalog will remain sparse until real promotion attempts stress-test the
  rule against concrete entries.
- CONTEXT.md Command definition is consistent with this rule (intent-first framing:
  "one-shot prompt template invoked only by its explicit slash-command name").

## Revisit when

The first Command entries are promoted to the catalog and the 5-gate rule is
stress-tested against real examples; or when a contributor makes a strong case that
one gate produces systematic misclassification on a class of entries.
