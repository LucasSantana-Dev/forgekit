# v0.29.0 catalog scope — new-tool entries and hygiene

- Date: 2026-06-10
- Status: Accepted
- Decision pipeline: `/research-and-decide` (catalog audit + Mar–Jun 2026 ecosystem sweep → critic (Opus, REVISE) → fact reconciliation → this ADR)

## Context

A full catalog audit (283 entries) plus an ecosystem sweep for tools released March–June 2026 surfaced: 6 orphan skills violating the every-skill-in-≥1-collection rule, two oversized collections (verification-review-gate 24 items, professional-work-toolkit 22), a 15-doc gap in the `locales/pt-BR/docs/` mirrored tree (manifest `translations.pt-BR` blocks are 22/22 — the gap is the locale tree only), and a wave of uncatalogued platform features/tools: Claude Code dynamic Workflows, ultrareview/ultraplan, Monitor, Routines, Auto Mode; Claude Managed Agents (beta); Braintrust; Brave Search MCP; nine official creative-app MCPs.

Critic review flagged: doc scope too large for one release given locale parity, ambiguous entry categories (skill vs doc vs server), unverified upstreams, and missing defer-triggers. Two critic factual claims were checked and rejected against the repo: collection sizes 24/22 are real (not "max 8"), and the pt-BR gap is the locale tree, not manifest blocks. One was confirmed: zero stale OpenAI-Evals references exist (cleanup item dropped).

## Decision

v0.29.0 ships three slices, in order:

1. **Hygiene PR** — wire the 6 orphans:
   `adt-specs-aggregate-roadmap` → spec-and-planning; `adt-sync-pt-parity`, `claude-automation-recommender` → skill-authoring; `gemini-context-cache` → token-and-context-optimization; `gemini-grounding-config` → api-and-mcp-development; `vertex-ai-setup` → local-models-starter. Tag harmonization is verify-then-fix (may be a no-op). Acceptance: `pnpm catalog:validate` green, zero orphans.
2. **Docs PR** — 3 new catalog docs (not 6): (a) Claude Code dynamic Workflows / orchestration, (b) ultrareview + ultraplan (explicitly marked research-preview), (c) Routines + Monitor. Each with manifest `translations.pt-BR` (mandatory) and a locale-tree stub. The 15-doc locale-tree backlog becomes a tracked issue, not a silent gap.
3. **Entries PR** — Claude Managed Agents as a **doc/guide** (not a skill — no installable behavior yet); Braintrust as a **doc** (its MCP server is unverified); Brave Search **server entry only after verifying** the upstream package is published and maintained at implementation time. Every new entry wired into ≥1 collection.

## Alternatives considered

- **All 6 feature docs in one release** — rejected: doubles translation load on a solo maintainer mid-locale-backlog; the 3 cut docs (Auto Mode standalone, etc.) fold into the 3 shipped ones or wait for v0.30.0.
- **Managed Agents as a skill** — rejected for now: a skill needs installable behavior/trigger; the product is beta and the right shape is a guide. Revisit on API stability.
- **creative-tools collection now** — deferred: audience is code-centric; only ship when ≥5 of the 9 creative MCPs are published with public docs.
- **Split oversized collections now** — deferred: published collection ids are user-facing; churn needs its own design pass. Trigger: any collection >25 items or user feedback on discoverability.
- **New slash commands (/debug, /learn, /history)** — deferred: days of effort each; trigger: ≥2 user requests or analytics demand on the commands category.
- **Cursor 3.0 comparative doc** — rejected: competitor-doc maintenance treadmill, weak fit for an install-catalog.
- **OpenAI-Evals stale-ref cleanup** — dropped: grep found zero references.

## Consequences

- (+) Catalog covers the 2026 Claude Code platform wave while it is still news.
- (+) Orphan rule restored to 100%; validation stays the enforcement gate.
- (−) Accepted: locale-tree doc backlog grows by 3 stubs; offset by tracking the full backlog as an issue.
- (n) Beta-status content (ultrareview/ultraplan, Managed Agents) carries explicit preview labels to bound staleness blame.

## Revisit when

- **Managed Agents GA or stable API** → upgrade doc to skill + guide pair.
- **≥5 of 9 creative MCPs published with docs** → create creative-tools collection.
- **Any collection >25 items or discoverability complaint** → collection-split design pass.
- **≥2 user requests for /debug //learn //history** → command additions enter scope.
- **Braintrust ships a verified MCP server** → promote doc to server entry.
- **v0.30.0 planning** → check the locale-tree backlog issue; if untouched, schedule a dedicated translation batch.
