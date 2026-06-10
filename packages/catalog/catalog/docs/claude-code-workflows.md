---
id: claude-code-workflows
title: Dynamic Workflows — Multi-Agent Orchestration
description: Orchestrate dozens to hundreds of subagents from a single command. Use workflows when a task is too large for one conversation — codebase-wide audits, large migrations, cross-repo coordination.
tags:
- claude-code
- orchestration
- agents
- automation
- workflow
translations:
  pt-BR:
    title: Workflows Dinâmicos — Orquestração Multi-Agente
    description: Orquestre dezenas a centenas de sub-agentes a partir de um único comando. Use workflows quando uma tarefa é muito grande para uma conversa — auditorias em toda a base de código, migrações grandes, coordenação entre repos.
---

# Dynamic Workflows — Multi-Agent Orchestration

A workflow is an orchestration script Claude writes for your task and runs across many subagents in the background. The model plans the work, breaks it into parallel units, assigns each to a subagent, and coordinates their results.

---

## When to Use Workflows vs. Single Agent

| Scenario | Single Agent | Workflow |
|----------|--------------|----------|
| **Scope** | One file, module, or PR | Multiple repos, many files, whole codebase |
| **Duration** | Minutes to hours | Hours or longer (your terminal can close) |
| **Parallelism** | Sequential work within one context | Work splits across many agents automatically |
| **Complexity** | Straightforward logic | Interdependent tasks (e.g., migrate A → update B → test all) |
| **Your focus** | Stay in the loop, iterative refinement | Set it and check back; Claude coordinates |

### Example: When Workflow Shines

- **Codebase audit**: "Find every internal `fetch()` call, list them with context, and prepare a migration plan" — hundreds of matches across dozens of files, spanning multiple subagents.
- **Large migration**: "Migrate from Jest to Vitest — update imports, config files, and test syntax across 500+ test files in 3 repos" — Claude breaks it into parallel batches per repo.
- **Cross-cutting refactoring**: "Extract validation logic into a shared library, update all consumers, run tests in each repo" — subagents work on validation, consumers, and CI in parallel.

---

## How to Request a Workflow

Describe the task and ask Claude for a workflow:

```text
claude> create a workflow that migrates every internal fetch() call to the new HttpClient wrapper
```

Or use the `/workflows` command to manage runs:

```text
claude> /workflows
```

Claude generates the orchestration script (a plan you can see), subagents fan out, and results land back in your session automatically.

---

## What the Model Plans For You

When you ask for a workflow, Claude:

1. **Breaks the task into independent units** — parallel audit agents, batched migrations, isolated test runs.
2. **Assigns each unit to a subagent** — same access and capabilities as your main session, but isolated context so they don't interfere.
3. **Coordinates results** — collects findings, merges reports, and flags blockers (e.g., "3 files have ambiguous syntax — review these by hand").
4. **Handles failures gracefully** — if one agent hits a dead end, others continue; the summary shows what succeeded and what needs manual review.

---

## Cost Considerations

**Context duplication**: Each subagent gets a copy of the repo context (or a subset relevant to its unit). For a repo with 10K tokens of context, spawning 20 subagents multiplies the context cost by ~20×.

**Parallelism savings**: But if the work would otherwise take 20 sequential turns in a single agent (each turn re-reading context), the parallelism can actually *reduce* total tokens by running in parallel.

**Opt-in**: Workflows are opt-in. If you don't ask for a workflow or include the keyword, Claude defaults to single-agent mode and makes incremental progress in your current session.

**What to monitor**: After a workflow completes, check:
- **Total tokens**: `/usage` shows the breakdown.
- **Wall-clock time**: Parallel work (1 hour across 20 agents) costs more per token but finishes faster than 20 sequential hours.
- **Quality of results**: Subagents may miss cross-cutting dependencies that a single agent would catch. Review summaries carefully.

---

## Workflow Exit Criteria

Workflows run until:
- All subagents complete their unit successfully.
- A subagent hits a hard blocker (missing dependency, access denied) and reports it.
- A timeout occurs (configurable per workflow).
- You explicitly stop the workflow.

Claude's summary will tell you which units succeeded, which had issues, and what needs follow-up.

---

## Tips

1. **Granular tasks work better** — "audit all fetch calls" is better than "refactor the entire API layer" because it's easier to parallelize.
2. **Provide context at the top** — the more the model understands up front (target tool, pattern to find, acceptance criteria), the better the subagent plans.
3. **Review the plan before it runs** — Claude shows the orchestration script before subagents spawn; you can tweak the strategy.
4. **Use `/workflows` to track runs** — check status, view logs, and clean up completed workflows.
5. **Combine with other tools** — workflows pair well with `/ultrareview` (parallel code review) and `/ultraplan` (distributed planning).

---

## When NOT to Use Workflows

- **Single file or module** — one agent is faster and cheaper.
- **High coordination cost** — if subagents must constantly sync state, overhead outweighs parallelism.
- **Real-time feedback loop** — you need to guide the work turn by turn; workflows are "fire and forget."
- **Debugging** — single agent is better for investigating a specific issue; workflows suit batch operations.
