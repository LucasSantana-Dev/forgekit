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

- `kit/core/skills/resume.md` missing — listed as a key autonomy skill in README but no dedicated file exists.
- `kit/core/agents.json` has no `tools` allowlist per agent tier.
- `kit/core/token-optimization.json` has no `budgets` block for per-session / per-tier caps.
- `implementations/antigravity/` missing.
- `implementations/windsurf/README.md` missing.
- `kit/plugins/` missing (design phase only — not queued for near-term).

---

## Now

### 1. Ship `resume` skill (close README gap)

**Why now**

- `README.md` promotes `resume` as a first-class autonomy skill but the file does not exist.
- Functionality is split across `self-heal.md` (recovery) and `checkpoint.md` (WIP stash).

**First action**

- Create `kit/core/skills/resume.md` consolidating the two flows; update `loop.md` to delegate.

### 2. Agent tool-access allowlist

**Why now**

- `backlog.json → agent-tool-access` is the only open `high+ready` governance item.
- Prevents expensive opus agents from doing cheap grep work.

**First action**

- Add `tools: []` field per agent in `kit/core/agents.json`, update schema + governance tests.

### 3. Cost budgets

**Why now**

- `backlog.json → cost-tracking` is `high+ready`.
- Session + per-agent caps are needed to land autonomous loops safely.

**First action**

- Extend `kit/core/token-optimization.json` with `budgets` block; refresh schema; extend `cost.md` docs.

---

## Next

### 4. Release v0.17.0

Bundles `resume` skill, agent tool allowlist, cost budgets, and the state reconciliation in this PR.

### 5. Antigravity implementation doc

Create `implementations/antigravity/README.md` mirroring Cursor/Codex structure.

### 6. Windsurf implementation doc + Cursor/Windsurf skill-format parity

Create `implementations/windsurf/README.md`; document `.mdc` vs `.windsurfrules` mapping from `kit/core/skills/*.md`.

---

## Later

### 7. Plugin system design

**Why later**

- Broad architecture surface; depends on parity + core config maturity being stable.
- `backlog.json → plugin-system` is `low+backlog`, gated on `hooks-manifest` (now done).

**First action**

- Write a short architecture note clarifying plugin boundaries: skills, hooks, MCP config, providers.

### 8. Company template breadth

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

1. Land `resume` skill
2. Agent tool allowlist
3. Cost budgets
4. Cut `v0.17.0`
5. Antigravity + Windsurf implementation docs
6. Plugin system design note
7. Additional company templates

---

## Immediate recommended next task

Create `kit/core/skills/resume.md` and update `loop.md` delegation — this closes the advertised-but-missing autonomy skill in the README.
