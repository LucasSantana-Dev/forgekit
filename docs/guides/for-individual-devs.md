---
status: draft
audience: individual
---

# For Individual Developers

Personal workflow: Plan → Ship → Spec. How AI dev tooling integrates into your daily loop.

## The Workflow Loop

```
┌─────────────┐       ┌──────────┐       ┌──────────┐       ┌────────┐
│   Plan      │──────▶│  Ship    │──────▶│  Spec    │──────▶│ Review │
│ (CLAUDE.md) │       │ (Skills) │       │(Handoff) │       │(Tools) │
└─────────────┘       └──────────┘       └──────────┘       └────────┘
      ▲                                                           │
      └───────────────────────────────────────────────────────────┘
```

## Stage 1: Plan — Setup Your Rules

Copy a rule file into your project:
- `rules/CLAUDE.md` → Claude Code, Codex
- `rules/COPILOT.md` → GitHub Copilot
- `rules/GEMINI.md` → Gemini CLI
- `rules/AGENTS.md` for multi-agent flows

**File is always loaded.** You only write once, reuse forever. See [Conventions as Code](./conventions-as-code.md) for how rules layer on tool defaults.

## Stage 2: Ship — Use Skills

Skills are verb-named, single-purpose tools. Activate them in your prompt:

- `/recall "feature name"` — find relevant code patterns
- `/context-pack "module path"` — assemble API context
- `/plan "5-step refactor"` — break down large changes
- `/dispatch "2 subagents"` — parallelize analysis

See [Kit Overview](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md) for the full skill catalog. Link a skill in your prompt; the AI tool calls it automatically.

## Stage 3: Spec — Document Decisions

When shipping to production, commit a spec:

```bash
echo "### New Feature X

- What: Async timeout for connections
- Why: Prevent resource leaks
- How: Thread timeout param through pool, add circuit breaker
" > docs/specs/2026-04-15-feature-x/spec.md
```

Specs feed the auto-generated `docs/roadmap.md`. Over time, they become your project's decision audit trail. See [Benchmarks](./benchmarks.md) for why this matters.

## Stage 4: Review — Governance

As you scale:
- Enable hooks: `bash install-rag.sh --with-hooks` (optional)
- Check the governance checklist: [Governance](./governance.md)
- Share [For Teams](./for-teams.md) with your lead if crossing into team work

---

**Questions?** See [Primitives](./primitives.md) for "should this be a skill, agent, or hook?" decision tree.
