---
status: proposed
created: 2026-04-24
owner: lucassantana
pr:
tags: migration,forge-space,knowledge-import
---

# forge-space-knowledge-import

## Goal

Reclaim the valuable R&D from the (now wound-down) Forge-Space org by pulling a
prioritized subset of its content into Forge Kit as the single source of truth.

The wind-down commit `f02aed8` removed Forge-Space *references* from this repo
but did not migrate the actual content. An inventory of the local
`/Volumes/External HD/Desenvolvimento/forge-space/` tree surfaced ~10 high-value
candidates across 13 still-active sub-repos. This spec picks which ones to
import, in what order, and with what scope discipline — so the import doesn't
swell the monorepo or pull in things that are really separate products.

## Context

Snapshot of the forge-space tree (read-only inspection, 2026-04-24):

| Sub-repo | Last commit | Status | Verdict |
|---|---|---|---|
| `forge-ai-init` | 2026-04-08 | active | **import (M)** |
| `core` | 2026-04-15 | active | **import docs (M)** |
| `branding-mcp` | 2026-04-20 | active | **import as MCP server (S)** |
| `ui-mcp` | 2026-04-20 | active | **import as MCP server (S)** |
| `brand-guide` | 2026-04-08 | active | **import tokens only (S)** |
| `forge-ai-action` | 2026-04-04 | active | **import (S)** |
| `github-org-workflows` | 2026-04-07 | active | **import (S)** |
| `mcp-gateway` | 2026-04-20 | active | **reference only (S)** |
| `siza-gen` | 2026-04-20 | active | **defer (L)** — deep UI-gen backend |
| `forge-local` | 2026-04-02 | quiet | **defer** — local model tooling, niche |
| `siza`, `siza-desktop`, `forgespace-web` | 2026-04-06..08 | active | **skip** — full products, not toolkit |
| `siza-backup-no-git`, `_worktrees`, `automations` | — | — | **skip** — artifacts / non-repos |
| `ai-dev-toolkit` (inside forge-space) | 2026-04-04 | stale | **skip** — v0.11 clone, this repo is the canonical |

No sub-repo is >6 months stale. No fork divergence from main Forge Kit detected.

## Name Decision

Migration lives under existing Forge Kit surfaces. No new namespace. Each
candidate is routed to one of:

- `packages/catalog/catalog/servers/` — MCP server entries
- `packages/catalog/catalog/tools/` — standalone CLI/scripts
- `packages/catalog/catalog/agents/` — Claude sub-agents
- `packages/catalog/catalog/skills/` — reusable procedures
- `docs/architecture/` — new directory for architectural patterns
- `docs/guides/` — new/expanded how-tos
- `.github/workflows/` — CI automation
- `infra/gateway/` — gateway infra extensions

No new top-level package is introduced by this migration.

## Approach — phased, one PR per phase

### Phase A — Docs-only (fastest, lowest risk)
**Effort: S-M · Risk: low · Reversible: yes**

1. Create `docs/architecture/` with an index.
2. Import `core/ARCHITECTURE.md` → `docs/architecture/core-patterns.md`.
3. Import `core/AGENTS.md` → `docs/architecture/agent-operations.md`.
4. Import `core/docs/SHARED_DOCUMENTATION.md` and supporting files as
   `docs/architecture/shared-documentation.md` + split if > 2 pages.
5. Import `branding-mcp/README.md` → `docs/architecture/branding-mcp.md`
   (pointer / overview only; the actual MCP entry lands in Phase B).
6. Import `ui-mcp/README.md` → `docs/architecture/ui-mcp.md` (same pattern).
7. Update `docs/guides/README.md` to surface the new `architecture/` index.

**Scope cap:** only Markdown files and small JSON/YAML samples. No code,
no binary assets, no CI changes.

### Phase B — MCP server entries
**Effort: S-M · Risk: low · Reversible: yes**

1. Add `packages/catalog/catalog/servers/branding-mcp.yaml`:
   - source: `git+https://github.com/LucasSantana-Dev/forge-space-branding-mcp`
     (or whichever upstream repo the code lives in after wind-down).
   - transport + run command per upstream instructions.
   - richer `description` + `usage` block (PR #102 schema).
2. Add `packages/catalog/catalog/servers/ui-mcp.yaml` — same pattern.
3. Add `packages/catalog/catalog/servers/mcp-gateway-ref.yaml` — if this should
   be exposed as a user-addressable MCP server; otherwise skip and keep it as
   infra only.
4. Backfill `usage` metadata (when PR #102 merges).

**Scope cap:** only catalog entries (YAML + small docs). No upstream code
vendored into this repo.

### Phase C — Design tokens
**Effort: S · Risk: low · Reversible: yes**

1. Decide: publish `@forge-kit/brand-tokens` as a new workspace package or
   keep as raw assets under `packages/core/brand-tokens/`?
2. Import `brand-guide/src/tokens/` → chosen path.
3. Add a generator test that emits CSS/Tailwind/React from the source.
4. Update webapp to optionally use these tokens for its own theme (low
   priority; parity with current theme is fine).

### Phase D — Governance CLI
**Effort: M · Risk: med · Reversible: yes**

1. Evaluate `forge-ai-init/src/lib/scanners/` (115+ anti-pattern checks). Pick
   the subset that overlaps with Forge Kit's existing skills + hooks —
   duplicates stay upstream.
2. For rules that are *new*, import them as either:
   - **Hooks** (preferred for edit-moment checks), or
   - **A new `forge-kit doctor --strict` subcommand** (for bulk scans).
3. Skip the full CLI — only rescue the rules themselves.
4. Add a `docs/guides/governance-rules.md` index listing imported rules with
   provenance (original forge-space source file, author, date).

### Phase E — CI automation
**Effort: S · Risk: low-med · Reversible: yes**

1. Inspect `forge-ai-action/` workflow — if it wraps the rules from Phase D,
   port only the outer action YAML, not the bundled code.
2. Inspect `github-org-workflows/` — import reusable workflows into
   `.github/workflows/reusable/` if they add CI capability not already present.
3. Publish as documented workflows so downstream repos can pin to them.

### Phase F — Defer decisions
**Not scheduled. Decide case-by-case before opening tickets.**

- `siza-gen/src/generators/` — depends on whether Forge Kit grows a UI-generation
  pillar. Today, no. Reconsider after Phase B validates MCP-server adoption.
- `forge-local` — local-model tooling. If user interest emerges, promote to a
  Phase G spec.

## Explicit Tradeoffs

- **One big PR would be faster to type but slower to review.** Six smaller
  PRs (one per phase) let CodeRabbit and CI catch problems per concern.
- **Vendoring vs. linking.** For MCP servers, we link upstream (Phase B) — we
  don't vendor the code. For docs (Phase A) and rules (Phase D), we copy into
  the repo because the upstream may get archived.
- **Provenance matters.** Every imported file ships with a header comment
  citing the original source path + commit SHA, so we can trace back if the
  upstream becomes unavailable.
- **Stop at Phase E unless new signal.** Phases A–E capture 70 %+ of the
  value per the inventory. Phase F requires new evidence of demand.

## Out Of Scope For This Spec

- Archiving `forge-space-*` repos on GitHub (separate task, owner: human).
- Rewriting any imported code to match Forge Kit's style conventions beyond
  mechanical formatting.
- Migrating `siza`, `siza-desktop`, `forgespace-web` — these are products,
  not toolkit content.
- Publishing any new npm package to the public registry. Monorepo-internal
  only for now.

## Verification

Per phase, green means:

- All imported files have a provenance header (upstream path + SHA).
- `pnpm --filter @forge-kit/catalog run validate` — catalog valid.
- `pnpm --filter @forge-kit/web run build` — site builds.
- `pnpm test` — no regressions.
- Secret scan: `gitguardian` / `trufflehog` / `semgrep` — all clean.
- Markdown link check on changed files — all internal links resolve.

A phase is "done" when the PR merges and the next phase's branch rebases
cleanly onto it.

## Open Questions (for the user)

1. **Upstream repos.** After the forge-space wind-down, do canonical
   upstream repos still exist for `forge-ai-init`, `branding-mcp`, `ui-mcp`,
   `brand-guide`, `core`, etc.? If yes, MCP server entries in Phase B can
   `source.git` reference them. If no, we'll vendor inline.
2. **Brand tokens naming.** `@forge-kit/brand-tokens` or keep them under
   `packages/core/brand-tokens/` without a separate package manifest?
3. **Phase D rule conflicts.** Some forge-ai-init rules likely duplicate
   existing Forge Kit skills/hooks. Preferred conflict policy:
   - (a) prefer the Forge Kit version and note the equivalence,
   - (b) prefer the forge-ai-init version because it's stricter, or
   - (c) case-by-case decision at import time?
4. **Commit trailers.** Should migrated files carry a `Migrated-From:` trailer
   in the commit message, or is an inline provenance header in the file itself
   sufficient?

## Inventory artefact

Full read-only inventory by Explore agent is captured at
`docs/specs/2026-04-24-forge-space-knowledge-import/inventory.md` for audit.
