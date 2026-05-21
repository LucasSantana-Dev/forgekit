# forgekit Toolkit Capabilities & Improvement Map

This document answers "what does forgekit do", "what's working well", and "what
could be improved or is missing." It exists so the RAG system can surface toolkit
gaps during planning sessions.

## What forgekit provides

**Catalog** — a structured registry of Claude tools: skills (SKILL.md), hooks,
agents, MCP servers, collections, codex rules, and installable shell tools. Each
entry has bilingual metadata (en + pt-BR), tags, and collection membership. The
catalog is validated with `pnpm catalog:validate` and published to the web UI.

**CLI** (`forge-kit` / `adtl`) — installs skills, pulls catalog entries, syncs
local skills to the index, and wraps common kit operations. TypeScript, uses
`execa` + `zod`. Currently lacking: `adtl diff` (compare local vs remote catalog
versions), `adtl upgrade` (bulk-update stale skills), `adtl lint` (pre-push
catalog validation).

**Core kit** — Bash/Python setup scripts (`setup.sh`) that wire agents,
MCP servers, schedules, and hooks into a Claude Code session. Reads `agents.json`
(20 specialist agents), `mcp.json` (tool-to-agent routing), `schedules.json`
(cron-style triggers). Well-tested, but agent registry and AGENT.md catalog entries
are two separate representations with no cross-validation.

**Web UI** — Astro 6 catalog browser (Cloudflare Pages). Features: full-text
search, collection pages, provider pages, skill detail pages, SEO, i18n skeleton.
Missing: skill version history UI, user-contributed entries, install-from-web flow.

**RAG index** — SQLite + sentence-transformers semantic search over skills,
standards, handoffs, plans, code. Weekly reports track coverage. Gaps: codex
source type under target (35 vs 50), changelog under target (21 vs 30),
ai-dev-toolkit code not repo-attributed.

**Skills** (`~/.claude/skills/`) — 50+ SKILL.md files: planning composites
(research-and-decide, plan, adr-write), RAG ops (adt-rag-coverage, adt-rag-curate,
adt-rag-quality), git/deploy ops (ship, pr-merge-readiness), agent orchestration
(orchestrate, dispatch, loop), security (secure, /secure-scan), graphify, and more.
Well-covered in RAG (1029 chunks).

**Standards** (`~/.claude/standards/`) — 27 markdown standards documents covering
workflow, composite contract, skill auto-invoke routing, agent routing, code style,
testing, prompting discipline, security, release cadence, PR conventions, and
session management. Hit coverage target (56 chunks) after 2026-05-20 reindex.

**Hooks** — Claude Code hooks for composite routing, session budgets, handoff
creation, context packing, and scheduled diagnostics (Sundays 03:00 via launchd).

## What's working well

- Catalog validation pipeline (`pnpm catalog:validate`) catches schema errors fast
- Release flow is well-defined (version bump → CHANGELOG → tag → GH Actions)
- Skills > 500 chunk target in RAG gives solid retrieval for slash commands
- Web UI fully deployed on Cloudflare Pages with SEO infra in place
- Agent registry (`agents.json`) covers 20 specialist agents with tier + skill lists
- `classify_type()` symlink-path resolution now correctly prioritizes `/standards/`
  over `/.agents/skills/` (fixed 2026-05-20)

## What's missing or under-optimized

### High priority

1. **Cross-validation between `agents.json` and `packages/core/kit/core/agents/`**
   — Adding an agent to the runtime registry doesn't enforce a corresponding
   AGENT.md catalog entry and vice versa. Should add a `catalog:validate` check.

2. **`adtl upgrade` / `adtl diff` CLI commands** — no way to see which locally
   installed skills are stale vs. the published catalog. Manual process today.

3. **Changelog RAG gap** — CHANGELOG.md only generates 21 chunks (target 30).
   Split release sections into separate indexed documents or add more changelog
   files per repo.

4. **Zero-hit query "what's missing / how to improve"** — this document addresses
   that gap. Add to `docs/` and index with `build.py --incremental`.

### Medium priority

5. **Codex source coverage** — codex source type has 35 chunks (target 50).
   `~/.codex/memories/raw_memories.md` (177KB) is too noisy to index wholesale;
   need curated topic summaries instead.

6. **ai-dev-toolkit repo attribution** — `classify_repo()` resolves symlinks before
   comparing, so chunks from symlinked repos get NULL repo column. Fix: resolve both
   `path` and `repo` before `relative_to()`.

7. **pt-BR locale dead code** — `i18n.ts` still declares pt-BR after pages were
   removed in PR #165. ~80 lines of cleanup in a single-file PR.

8. **Skill promotion workflow automation** — batch skill promotion currently takes
   ~8 min of manual steps. Could add `adtl promote <skill-glob>` to automate the
   manifest + pt-BR + collection wiring steps.

### Low priority

9. **Web UI: skill version history** — catalog shows current version only; no diff
   view between releases.

10. **MCP server coverage** — `mcp.json` wires agents to servers but there's no
    automated check that listed MCP servers are actually installed and running.

11. **Test coverage for CLI** — `packages/cli` has no test suite. Adding at least
    smoke tests for `adtl validate` and `adtl install` would catch regressions.

## How to extend the toolkit

**Add a skill:** Write `SKILL.md` in `~/.claude/skills/<name>/`, then promote to
the catalog with `packages/catalog/scripts/import-agents.ts` or manually copy to
`packages/catalog/catalog/skills/<id>/manifest.json`. Run `pnpm catalog:validate`.

**Add an agent:** Update `packages/core/kit/core/agents.json` AND create
`packages/core/kit/core/agents/<id>/AGENT.md`. Both must stay in sync.

**Add an MCP server:** Register in `packages/core/kit/core/mcp.json` under
`toolRegistry` and `agentMapping`. Document in the catalog as a `servers/<id>.yaml`.

**Improve RAG coverage:** Run `cd ~/.claude/rag-index && venv/bin/python build.py
--incremental <file>` for any new docs. Edit `build.py` SOURCES to include new
glob patterns for future full rebuilds. Run `venv/bin/python report.py` to verify.

**Ship a release:** Promote `## [Unreleased]` in CHANGELOG.md, bump root
`package.json` version, run `pnpm workspace:validate`, create PR on
`release/vX.Y.Z`, squash-merge. GH Actions tags and publishes automatically.
