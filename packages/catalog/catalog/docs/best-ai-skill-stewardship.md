---
id: best-ai-skill-stewardship
title: AI Skill Stewardship
description: Coding agents amplify what you already are. They don't substitute for
  what you aren't.
tags:
- best-practice
- ai-dev-toolkit
- security
- skill-md
source:
  path: ai-dev-toolkit/packages/core/best-practices/ai-skill-stewardship.md
  upstream: https://github.com/LucasSantana-Dev/forgekit/blob/main/packages/core/best-practices/ai-skill-stewardship.md
  license: MIT
translations:
  pt-BR:
    title: Administração de Skills de IA
    description: Agentes de codificação amplificam quem você já é. Não substituem
      o que você não é. Disciplina de habilidades permanece essencial — esta é a prática.
---
# AI Skill Stewardship

Coding agents amplify what you already are. They don't substitute for what you aren't.

> _"An exoskeleton amplifies strength. A crutch only tries to hide weakness." — Fabio Akita, [akitaonrails.com](https://akitaonrails.com)_

## The risk this doc addresses

AI-assisted coding is fast enough that it hides a compounding liability: fundamentals-poor developers ship at industrial scale, and the debt arrives at industrial scale too. Individually, this looks like over-reliance; at team scale, it's skill atrophy; at org scale, it's a brittle codebase no human can reason about anymore.

This is the counter-practice.

## The principle

**Exoskeletons require skeletons.** The people who use AI best understand the layers the AI is writing for: operating systems, databases, networking, data structures, compilers, computer architecture, profiling, debugging, concurrency, consistency, security, and cost. Without that skeleton, agent output is accepted uncritically — and that's where shipping slows down, not speeds up, as bad decisions accumulate.

The practices below keep the skeleton sharp.

## Practices

### 1. Deliberate unassisted work

Designate some work as "no agent." Pick one task per sprint — a tricky refactor, a test you don't fully understand yet, a debugging session, a small migration — and complete it by hand. Not to prove a point, but to keep the muscles you rely on for review.

Rule of thumb: if you can't explain the output the agent produced, you can't catch when it's wrong. Periodic unassisted work is how you stay able to explain.

### 2. Read the diff before accepting

This is non-negotiable and still the most violated practice. "Skim the diff" means:

- Every file the agent touched — open it, scroll through the change.
- Every new dependency — justify it against existing options.
- Every deleted line — confirm it was dead, not load-bearing.
- Every TODO or stub — decide immediately to fix or file an issue.

If a PR is too large to read, it's too large to merge. Split it before reviewing, not after.

### 3. Fundamentals-first onboarding

For new teammates (junior or senior-in-a-new-stack), prioritize the skeleton before the exoskeleton:

- First week: no agents. Read the codebase, read standards, ship a small change manually.
- Week 2+: introduce the agent, but require explicit pair-programming discipline (see [`packages/core/patterns/prompting-discipline.md`](../packages/core/patterns/prompting-discipline.md)).
- Ongoing: require the new hire to occasionally review agent output **without** running it — just reading. If they can't evaluate, they can't yet benefit from it.

### 4. Resist the seduction of volume

Agents can produce more code per day than any human can read carefully. That ratio is the trap. Cap yourself: no more PRs per day than you can defend in review to a skeptical colleague. Volume is not productivity if the team can't verify it.

### 5. Explicitly ask for what the model skips

Agents generate the happy path confidently and quietly omit defensive code: CORS headers, timeout handling, auth refresh flows, WebSocket keep-alive, input validation at trust boundaries, error telemetry. Don't expect "secure by default" — ask explicitly:

- "List the security-sensitive paths in this change and how each is protected."
- "What happens if each network call in this diff times out?"
- "Where could a malicious user break this?"

This fills the predictable gaps without needing to know in advance which gap will bite.

### 6. Write the spec, not just the prompt

For anything beyond a one-shot change, write a short spec — goal, constraints, test plan — before prompting. The act of writing forces the fundamentals question ("what am I actually building, and why?") through a path the agent can't shortcut for you.

Use [`packages/core/kit/core/skills/ticket.md`](../packages/core/kit/core/skills/ticket.md) or the `docs/specs/` flow to persist the spec.

### 7. Track provenance

Know which code was AI-generated and which wasn't. At minimum:

- Commits that include AI-generated code use a scope tag (e.g. `feat(auth, ai-assisted): ...`) OR the PR body notes it.
- AI-generated tests get a comment marker (`// ai-generated — reviewed <date>`).
- Never co-sign an agent as commit author; the human is accountable.

When something breaks six months later, provenance tells you where to look first.

## Warning signs the practice is slipping

- You catch yourself accepting diffs without reading them.
- You can no longer explain what a function does without re-prompting.
- New teammates' first ships are indistinguishable from senior ships — meaning nobody is learning at the fast pace.
- Review time per PR drops faster than defect rate.
- "Why is this here?" blameless-review answers default to "the agent added it."

## Related

- [`packages/core/patterns/prompting-discipline.md`](../packages/core/patterns/prompting-discipline.md) — the four-block prompt and pair-programming discipline
- [`packages/core/patterns/code-review.md`](../packages/core/patterns/code-review.md) — what to catch when reading an AI-generated diff
- [`packages/core/best-practices/security.md`](./security.md) — minimum secrets and auth hygiene
- [`packages/core/kit/core/skills/ticket.md`](../packages/core/kit/core/skills/ticket.md) — per-feature spec flow
