# ai-dev-toolkit for Teams

A governance-safe, vendor-neutral foundation for AI-Assisted Development and Agent-Driven workflows. Built from production experience across 10+ repos, distilled into portable patterns any team can adopt.

## TL;DR

**What it is** — a convention library + executable tooling that turns ad-hoc AI usage into a repeatable, measurable engineering practice.

**What your team gets**
- Consistent skill / rule / agent definitions across projects, so AI tools behave the same way regardless of which IDE or CLI each teammate prefers.
- A local RAG engine that keeps institutional knowledge retrievable in seconds — no context loss between sessions, no repeated questions.
- Lightweight per-feature specs + auto-generated roadmaps that replace stale wikis and Jira drift with a living, git-native source of truth.
- Safe defaults: no third-party SaaS storage, no cloud data egress, all retrieval runs locally from MiniLM embeddings in a SQLite file.

**What your org gets**
- An auditable, in-repo convention layer — rules live in markdown, not hidden in tool configs.
- A compliance story: no Anthropic/OpenAI/Cursor-specific tooling on `main` (that lives on the `personal` branch); `main` is the work-safe surface.
- Shipping velocity: the skills are opinionated about when to use RAG, when to spec, when to ship, and when to stop. Less thrash, more landed PRs.

## The three pillars

### 1. AI-Assisted Development (AAD)
Every skill in `kit/core/skills/` is a "how to use AI for X" playbook — debugging, refactoring, code review, test generation, migration, observability. Skills are markdown-only, so any AI tool that reads project docs (Claude Code, Cursor, Copilot Chat, Codex) picks them up automatically.

### 2. Agent-Driven Development (ADD)
`kit/core/agents.json` + `kit/core/skills/auto-invoke.md` let agents route work to themselves based on task verbs (plan, ship, fix, refactor, review). Teams with custom agent setups (LangGraph, AutoGen, internal tooling) wire into the same registry.

### 3. Shared conventions as code
`rules/CLAUDE.md`, `rules/CODEX.md`, `rules/GEMINI.md`, `rules/COPILOT.md` express the same rules in each tool's dialect — written once in `kit/core/rules.md`, rendered per tool. No "what's our convention again" slack threads.

## Adoption path (2 weeks to full team)

| Week | Action | Owner |
|---|---|---|
| 1 | Clone `ai-dev-toolkit` + `ai-dev-toolkit-setup`. Run `bash scripts/install-rag.sh` on one dev box with `RAG_WORK_MODE=1` and work-repo globs. Measure time-to-first-useful-recall. | You |
| 1 | Add `rules/<your-tool>.md` to your flagship repo. Confirm agents respect it. | You |
| 2 | Pilot spec flow on one in-flight feature. Show the team the auto-generated `docs/roadmap.md`. | You + 1 teammate |
| 2 | Run `install-rag.sh` on 2-3 additional machines with the same `RAG_REPOS`. Shared `.env` in a secret store. | Team |
| After | Measure: PR-body-to-merge time, "did someone already fix this" recall hit rate, spec-to-ship cycle. | Eng manager |

## Governance

- **No third-party services.** Embeddings run locally (`all-MiniLM-L6-v2`, 90MB model); SQLite index stays on disk.
- **No telemetry.** The query log is local-only (`~/.claude/rag-index/queries.sqlite`); you can disable with `RAG_QLOG=off`.
- **No Anthropic/OpenAI/Cursor tie-in on `main`.** Handoff, session-resume, and vendor-CLI-specific skills live on the `personal` branch. `main` is vendor-neutral markdown + Python + Bash.
- **Audit surface** — all rules are markdown files in the repo; every skill lists its trigger conditions and side effects. No opaque configs.
- **Opt-in observability** — `kit/rag/scripts/report.py` generates a weekly summary of index stats, query hits, and stale chunks. Shareable; no per-user tracking.

## Concrete wins we can show

From production use in the authoring team (10+ repos, 6 months):
- Cold-session onboarding time for a new repo: **~20 min → ~2 min** (read the aggregate roadmap + run one RAG recall).
- Session context token overhead after the CLAUDE.md slicing change: **−62%** (`~/.claude/CLAUDE.md` trimmed 133→50 lines; the rest loads on demand).
- Eval baseline on a 50-query dataset covering real recall questions: **MRR 0.68 · Hit@3 0.72 · Hit@5 0.76** (hybrid BM25 + cosine + cross-encoder rerank).
- Auto-refreshed per-repo roadmap: zero hand-maintained roadmap files in the 7 active repos.

(Reproduce these on your own corpus — `tools/release.py`, `kit/rag/scripts/report.py`, and `kit/rag/eval/run.py` are the scripts that generated them.)

## What this is NOT

- Not a code generator or an auto-pilot. It's a convention + retrieval layer; humans still write the code.
- Not a replacement for your IDE's AI assistant. It makes whatever AI you use smarter about *your* codebase and team practices.
- Not a vendor lock-in. Swap Claude for Codex, Cursor, Copilot — rules render per tool; skills are markdown.
- Not a SaaS. No dashboard, no login, no org accounts. Everything lives in the repo + your laptop.

## Next steps for a work presentation

Pull this repo, then open:
1. `docs/for-teams.md` (this file) — elevator pitch.
2. `kit/rag/README.md` — RAG deep-dive with benchmarks.
3. `kit/specs/README.md` — spec flow, why derived state beats hand-curated.
4. `kit/core/skills/` — browse the skill catalog to see what's opinionated.
5. `rules/CLAUDE.md` — example of the rule-rendering output per tool.

The **`personal` branch** contains the same toolkit plus Codex/Claude-handoff workflow skills. Use `main` for work, `personal` for solo.

## Contact + contributing

Open PRs to `main` for rules/skills/patterns that are generally applicable. PRs that add tool-specific or workflow-specific skills belong on `personal`. See `CONTRIBUTING.md` for the full gate.
