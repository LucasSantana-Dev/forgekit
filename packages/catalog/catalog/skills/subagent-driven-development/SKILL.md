---
name: subagent-driven-development
description: Implement features by dispatching a fresh subagent per task with mandatory two-stage review (spec compliance then code quality) after each task.
triggers:
  - execute plan with subagents
  - subagent-driven implementation
  - dispatch per task with reviews
---

# Subagent-Driven Development

Execute implementation plans by dispatching a fresh subagent per task, with mandatory two-stage review after each task: spec compliance first, then code quality.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration.

## When to Use

- Have a written implementation plan with mostly independent tasks
- Want same-session execution without context pollution between tasks
- Need automatic review checkpoints (spec compliance, then code quality)
- Tasks can be implemented and reviewed sequentially before advancing

## When NOT to Use

- No plan exists yet — write the plan first
- Tasks are tightly coupled or have complex interdependencies
- Prefer parallel session execution — use `/executing-plans` instead
- Fewer than 3 tasks — overhead may not justify fresh subagents

## Core Workflow

1. **Extract plan:** Read plan file; extract all tasks with full text and context
2. **Per task:**
   - Dispatch implementer subagent with full task text
   - Answer subagent questions (before AND during work)
   - Implementer implements, tests, commits, self-reviews
   - Dispatch spec compliance reviewer → confirm code matches spec
   - If spec issues found: implementer fixes → reviewer re-reviews
   - Dispatch code quality reviewer → approve code quality
   - If quality issues found: implementer fixes → reviewer re-reviews
   - Mark task complete; advance to next
3. **After all tasks:** Dispatch final code reviewer for entire implementation
4. **Finish:** Use completion workflow (finishing-a-development-branch)

## Rules

1. **Fresh subagent per task** — Never reuse subagent between tasks
2. **Two-stage review mandatory** — Spec compliance FIRST, then code quality (not reversed)
3. **Fix-before-advance** — Don't skip reviews or move to next task with open issues
4. **Sequential reviews** — Spec compliance must pass before code quality review starts
5. **Answer questions upfront** — If subagent asks before implementation, answer completely
6. **Provide full task text** — Don't make subagent read plan files; provide text directly
7. **Review loops** — Reviewer found issues = implementer fixes = reviewer checks again (loop until approved)
8. **No parallel implementers** — Dispatch one implementer at a time (prevents conflicts)

## Red Flags

Never:
- Skip spec compliance or code quality reviews
- Start code quality review before spec compliance passes
- Proceed with unfixed issues from reviewers
- Dispatch multiple implementers in parallel
- Let implementer self-review replace actual reviews
- Accept "close enough" on spec compliance

## Advantages

**vs. Manual execution:**
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe isolation
- Subagents can ask clarifying questions

**vs. Executing Plans (parallel session):**
- Same session — no context switch
- Continuous progress — no waiting between tasks
- Review checkpoints automatic

**Quality gates:**
- Self-review catches issues before review
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work

## Related Skills

- **using-git-worktrees** — Set up isolated workspace before starting
- **writing-plans** — Creates the plan this skill executes
- **test-driven-development** — Subagents follow TDD for each task
- **finishing-a-development-branch** — Complete development after all tasks
- **executing-plans** — Use for parallel session instead of same-session execution
