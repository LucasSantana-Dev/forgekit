# ai-dev-toolkit Backlog Map

_Last updated: 2026-04-18_

## Snapshot

- Current branch inspected: `main`
- Default branch: `main`
- Latest release: `v0.16.0`
- Open PRs: `0`
- Open issues: `0`
- Primary backlog source: `backlog.json`
- Strategic roadmap source: `docs/roadmap.md` (regenerated from `docs/specs/`)

## Evidence Summary

### Confirmed recent shipments

- `v0.16.0` released (PR #79).
- Dev-assets-sync workspace backup skill shipped (PR #81).
- Vendor-neutral `SKILL.md` adoption pattern shipped (PR #80).
- Autonomous routing skills (`loop`, `route`, `orchestrate`, `dispatch`, `fallback`, `add`, `secure`) shipped (PR #78).
- MCP tool lazy-loading + agent-evals-as-CI patterns shipped (PR #76).
- Benchmark-reality gap pattern shipped (PR #77).
- EN→PT sync skill shipped (PR #72).
- AI Guides wave 1 — primitives, hooks pack, governance, benchmarks, adoption playbook, agents migration, index — shipped (PR #61).
- RAG kit + specs kit shipped.
- Portable hook manifest (`kit/core/hooks.json`) + schema shipped.
- MCP tool registry (`kit/core/mcp.json`) shipped with 10 servers across 3 profiles.
- `parity-audit-script` (`scripts/parity-audit.js`) shipped.
- `memory-skill`, `dispatch-skill`, `schedule-skill` shipped.
- Formal JSON schemas for all kit/core configs shipped.

### Confirmed remaining gaps

- `implementations/antigravity/` missing.
- `implementations/windsurf/README.md` missing.
- `kit/plugins/` missing (design phase only — not queued for near-term).
- Additional company templates beyond `fullstack-forge` (deferred until core parity stabilizes).

---

## Now

### 1. Cut `v0.17.0`

**Why now**

- `resume` skill, agent tier-governance test, and state reconciliation are ready to ship.
- PRs #80 (SKILL.md adoption pattern) and #81 (dev-assets-sync) have been unreleased since v0.16.0.

**First action**

- Promote `CHANGELOG.md [Unreleased]` → `[0.17.0]`; bump `package.json`; tag and release.

---

## Next

### 2. Antigravity implementation doc

Create `implementations/antigravity/README.md` mirroring Cursor/Codex structure.

### 3. Windsurf implementation doc + Cursor/Windsurf skill-format parity

Create `implementations/windsurf/README.md`; document `.mdc` vs `.windsurfrules` mapping from `kit/core/skills/*.md`.

---

## Later

### 4. Plugin system design

**Why later**

- Broad architecture surface; depends on parity + core config maturity being stable.
- `backlog.json → plugin-system` is `low+backlog`, gated on `hooks-manifest` (now done).

**First action**

- Write a short architecture note clarifying plugin boundaries: skills, hooks, MCP config, providers.

### 5. Company template breadth

Expand beyond `companies/fullstack-forge` to cover `solopreneur` and `startup-mvp` adoption paths once core surface is stable.

---

## Cleanup / De-risking

### A. Drift detection

Weekly GitHub Action `backlog-triage` runs `npm run backlog:check`. Any drift between `backlog.json` and shipped artifacts must be reconciled in the same cycle.

### B. Release-gate guard

Release pipeline already fails if:

- branch name implies a higher version than `package.json`
- `CHANGELOG.md` unreleased content exists for a tagged release branch
- GitHub release/tag state does not match the intended version

### C. Keep local install noise out of planning

Keep planning and backlog work in a clean worktree to avoid `node_modules/` noise.

---

## Recommended execution order

1. Cut `v0.17.0`
2. Antigravity + Windsurf implementation docs
3. Plugin system design note
4. Additional company templates

---

## Immediate recommended next task

Promote `CHANGELOG.md [Unreleased]` to `[0.17.0]` and cut the release — queued work is green and tests pass at 25/25.
