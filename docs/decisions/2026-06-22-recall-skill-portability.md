# Decision: keep forgekit's `recall` distributable — cherry-pick portable improvements, don't absorb the maintainer's private recall

- **Date:** 2026-06-22
- **Status:** Accepted
- **Process:** /research-and-decide (RAG pre-check + decision-critic APPROVE-WITH-CONDITIONS, conditions verified against the files)
- **Governs:** `packages/core/kit/rag/skills/recall/SKILL.md`

## Context

A heavily-improved `recall` exists in the maintainer's private `~/.claude/skills/recall`
(129 lines): reconciliation/output block, signal-first verdict, explicit fail-loud
guard, and a 4-source auto-route table. The question: should forgekit's authored
`recall` (74 lines) absorb it?

Verified facts (read both files + forgekit git log):
- The improved recall carries **31 maintainer-environment references** and declares
  `mcp_servers: [rag-index, claude-mem, serena]`. Its auto-route table and guard are
  coupled to the maintainer's setup: an **External HD** mount guard, a `knowledge-brain`
  vault via `search_knowledge`, the `claude-mem` plugin, and `serena`.
- forgekit is a **public, distributable** toolkit (`forge install`, multi-harness
  setup). No forgekit *skill* currently imports `claude-mem`/`serena` (only `packages/core/patterns/*` docs mention them) — porting the coupling would set a new precedent.
- forgekit's own recall **still leaks a maintainer path**: `~/.claude/projects/-Users-lucassantana/memory/*.md` (line 38), untouched since the #96 monorepo consolidation — the recent path/key-scrub commits did not reach it. It also hardcodes `~/.claude/rag-index/venv/bin/python`.
- Prior decision (2026-06-18): distributable skills declare deps via `mcp_servers` frontmatter.

## Decision

**Cherry-pick only the portable improvements into forgekit's `recall`; do NOT absorb the private version.**

Port:
1. **Fix the leaked path** — genericize `~/.claude/projects/-Users-lucassantana/memory/*.md` to a maintainer-neutral form (e.g. `~/.claude/projects/<project>/memory/*.md`); genericize the hardcoded `venv/bin/python` (detect interpreter / document setup).
2. **Output/reconciliation discipline** (generic text only) — lead with a verdict, report hit count, and handle the **no-hits case explicitly** ("no matches — broaden query or check the index is built").
3. **Soft index-availability guard** — if the index is missing at the configured path, say so and point to the build step; **do not hard-fail** the harness.
4. Keep recall's existing clean "When NOT to use" (Serena / Grep / Read) routing.
5. Declare `mcp_servers: [rag-index]` per the 2026-06-18 convention (its only real dep).

Do NOT port (maintainer-environment-coupled; verified source-coupled, no skill precedent):
the 4-source auto-route table, the External-HD mount guard, `knowledge-brain`/`search_knowledge`, `claude-mem`, `serena`.

## Alternatives considered
- **Full absorb (replace verbatim):** rejected — imports 4 maintainer-env deps + the External-HD guard into a public tool; worst portability; sets an unwanted MCP-coupling precedent.
- **Leave as-is:** rejected — keeps the leaked `-Users-lucassantana` path and forgoes genuinely portable, low-cost improvements.
- **Link-out to the private recall:** rejected — a private `~/.claude/skills` skill is not installable by end users.

## Consequences
- (+) forgekit `recall` becomes leak-free, degrades gracefully without an index, and gains signal-first output — with no new environment coupling.
- (+) Establishes the portability bar for future skill ports: improvements yes, maintainer-env coupling no.
- (−) The private recall's richer multi-source routing stays maintainer-only; the two diverge intentionally.
- (neutral) `recall` remains useful only to users who have built a local RAG index (see revisit).

## Revisit when
- forgekit adopts its **own** standard vault / multi-source memory backend → reconsider porting source-routing (genericized to that backend).
- Usage/telemetry shows a meaningful share of forgekit users lack a RAG index → reconsider whether to ship `recall` at all (demand question, separate from portability).
- The maintainer adds non-env-coupled recall improvements (ranking, multi-index) → backport in the next sweep.
