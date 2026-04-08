# ai-dev-toolkit Backlog Map

_Last updated: 2026-04-03_

## Snapshot

- Current branch inspected: `release/v0.11.0`
- Default branch: `main`
- Open PRs: `0`
- Open issues: `0`
- Primary backlog source: `backlog.json`
- Strategic roadmap source: `.claude/plans/universal-toolkit-installer.md`

## Evidence Summary

### Confirmed urgent signals

- GitHub latest release is now **`v0.11.0`**.
- The highest-value next work has moved from release execution to post-release governance hardening.
- `backlog.json` is the primary operational queue and should stay aligned with merged PR and release state.
- The strongest near-term quality gains come from schemas, adapter parity, and recurring backlog hygiene.

### Confirmed missing implementation surfaces

- `kit/core/schedules.json` is missing.
- `kit/plugins/` is missing.
- `implementations/antigravity/` is missing.
- `implementations/windsurf/README.md` is missing.

### Confirmed existing surfaces

- `kit/core/mcp.json` exists.
- `kit/core/agents.json` exists.
- `kit/core/routing.json` exists.
- `kit/schema/` exists with 9 JSON schemas.
- `implementations/cursor/README.md` exists.
- `companies/fullstack-forge/` exists, but no additional company templates were found.

---

## Now

### 1. Stabilize post-release backlog governance

**Why now**

- `v0.11.0` is already published, so the remaining risk is backlog/process drift rather than release execution.
- The repo now depends on `backlog.json` as an operational control surface for follow-on work.

**Evidence**

- GitHub latest release → `v0.11.0`
- `backlog.json` still carries multiple governance and parity items as the active next work
- Human-readable backlog context was missing before this document

**First action**

- Keep `backlog.json` and the human-readable backlog in sync:
  1. reconcile shipped work to `done`
  2. add drift detection and recurring triage
  3. prioritize the next governance lanes for shipment

### 2. Formalize JSON schemas for forge-kit core config

**Why now**

- The repo already treats `agents.json`, `routing.json`, and `mcp.json` as structured contracts.
- Missing schemas are the clearest DX + governance gap after release readiness.

**Evidence**

- `backlog.json` → `json-schemas` is `high` + `ready`
- `kit/schema/` is currently missing
- Existing config files already reference schema paths (`agents.json`, `routing.json`)

**First action**

- Define the minimal schema set and validation contract for:
  - `agents.json`
  - `routing.json`
  - `mcp.json`
  - `autopilot.json`
  - `loop.json`
  - `token-optimization.json`
  - `hooks.json`

### 3. Close the highest-value adapter parity gaps

**Why now**

- The toolkit promise is cross-tool portability; parity gaps undermine the headline value proposition.
- This work is already explicitly queued and tightly coupled to the installer story.

**Evidence**

- `backlog.json` → `adapter-parity-close` is `high` + `ready`
- README and `kit/` position forge-kit as multi-tool, but parity work remains open

**First action**

- Re-run or reconstruct a parity matrix and convert it into adapter-specific subtasks.

---

## Next

### 4. Fill missing implementation docs/adapters

**Why next**

- These are concrete, bounded gaps that improve trust and adoption after the release and core schema work.

**Evidence**

- `implementations/antigravity/` missing
- `implementations/windsurf/README.md` missing
- `implementations/cursor/README.md` already present

**First action**

- Define a minimum implementation-doc contract and apply it to Antigravity + Windsurf.

### 5. Expand company templates beyond `fullstack-forge`

**Why next**

- Template breadth is an adoption multiplier, but it depends on the core forge-kit surface stabilizing first.

**Evidence**

- `backlog.json` → `company-templates` exists
- Only `companies/fullstack-forge/` is currently present

**First action**

- Pick the first two templates with the highest adoption leverage:
  - `solopreneur`
  - `startup-mvp`

### 6. Stabilize backlog governance itself

**Why next**

- There are no open GitHub issues/PRs, so backlog visibility currently lives inside the repo.
- Without a clear human-readable map, backlog.json alone is easy to ignore.

**Evidence**

- `gh pr list` → `[]`
- `gh issue list` → `[]`
- `backlog.json` exists, but there was no canonical markdown backlog before this map

**First action**

- Decide whether `backlog.json` remains the source of truth with `BACKLOG.md` as a human-readable projection.

---

## Later

### 7. Add schedule / heartbeat automation

**Why later**

- Important for autonomous workflows, but not a release blocker.
- Best done after the core config/schema story is stable.

**Evidence**

- `backlog.json` → `heartbeat-schedule`
- `kit/core/schedules.json` is missing

**First action**

- Define 3 concrete schedule use cases before inventing schema shape.

### 8. Design the plugin system

**Why later**

- It is a broad architecture surface and should not outrun parity + core config maturity.

**Evidence**

- `backlog.json` → `plugin-system`
- `kit/plugins/` is missing

**First action**

- Write a short architecture note clarifying plugin boundaries: skills, hooks, MCP config, providers.

### 9. Align the repo backlog with the broader forge-kit roadmap

**Why later**

- `.claude/plans/universal-toolkit-installer.md` suggests a larger initiative than the current backlog.json expresses.
- This should become an epic map once the release line is stable.

**Evidence**

- `.claude/plans/universal-toolkit-installer.md`

**First action**

- Extract roadmap milestones from that plan and link them to backlog epics.

---

## Cleanup / De-risking

### A. Separate “missing by design” from “missing by omission”

For each missing path, add one disposition:

- `required-now`
- `planned-next`
- `deferred`
- `intentionally-out-of-scope`

### B. Make release state impossible to drift silently

Add a release gate that fails if:

- branch name implies a higher version than `package.json`
- `CHANGELOG.md` unreleased content exists for a tagged release branch
- GitHub release/tag state does not match the intended version

### C. Keep local install noise out of planning

If your checkout contains local workspace noise such as `node_modules/`, keep planning and backlog work in a clean worktree to avoid false backlog signals.

---

## Recommended execution order

1. Ship `v0.11.0`
2. Add JSON schemas + validation enforcement
3. Close adapter parity gaps
4. Fill Antigravity/Windsurf implementation docs
5. Expand company templates
6. Add schedule layer
7. Design plugin system
8. Fold universal installer roadmap into long-term epics

---

## Immediate recommended next task

**Ship the next post-release governance lane** with explicit checklist + verification gates.
