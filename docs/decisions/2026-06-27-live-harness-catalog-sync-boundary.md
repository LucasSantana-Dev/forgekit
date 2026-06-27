# ADR: Live-harness → catalog sync is a curated pull, never a full mirror

**Date:** 2026-06-27
**Status:** Accepted
**Extends:** 2026-06-06-curated-index-link-dont-rehost.md, 2026-06-10-v029-catalog-scope.md, 2026-06-24-catalog-curation-quality-gates.md

## Context

Prior ADRs governed **externally-sourced** entries (link to anthropics/obra/alirezarezvani, don't re-host — 2026-06-06; retention quality gates for those link-outs — 2026-06-24). None govern the **operator's own live harness** at `~/.agents/skills`, which is now the larger inflow pressure.

The live harness holds ~305 skills *not* in the catalog (plus standards + agents). It is the operator's **complete working set** — it includes project-specific skills (`criativaria-*`, `lucky-*`, `shorts-edit`, `brain-sync`), identity-laden config, and experiments. forgekit positions as "a curated useful list, not an exhaustive mirror."

The forgekit import script (`packages/catalog/scripts/import-upstream-skills.ts`) is **additive-only** (refuses to overwrite existing entries) and does **not** read from the live harness. A proposed "full sync" (import all missing → catalog skills 111 → ~330) would have dumped the entire personal working set into the public catalog. It was rejected; a curated subset (3 tools + 1 hook) shipped instead (PR #310).

### Evidence gathered before deciding

- **Gate effectiveness:** of 305 live skills missing from the catalog, **187 (61%) pass gate 1** (general / no project or identity token), **118 (39%) fail** (4 by name, 114 by body). → A full mirror would publish 118 project/personal skills. The gates demonstrably filter.
- **Staleness risk:** live skills change at **~0.24 commits/skill over 6 months (≈0.48/year)**. → Low. The additive-only "no automatic refresh" gap is real but not a P1 data-integrity emergency.

## Decision

**The live harness is never bulk-mirrored into the catalog. An entry is published only if it passes ALL four curation gates, and arrives through a reviewed PR.**

| # | Gate | Criterion (objective) |
|---|------|------------------------|
| 1 | **General** | No project/client token in id or `SKILL.md` body (denylist: `criativaria`, `lucky`, `shorts-edit`, `homelab`, `forge-space`, `figurinhas`, `posicionamento`, `linkedin-engage`, `knowledge-brain`, `brain-sync`, `sharekit`, `hitgate`, `graphify`). |
| 2 | **Sanitizable** | Passes `skill-leak-check` — no `/Users/<maintainer>`, `-Users-<maintainer>`, `/Volumes/External HD`, `oac-workstation`. `~/.claude` + `$HOME` allowed. |
| 3 | **Self-contained** | Runs from the published artifact with no private-repo / homelab / personal-MCP dependency. |
| 4 | **Categorizable** | Fits an existing catalog kind + the schema's `category` enum. |

### Refresh — the additive-only gap, solved not deferred

The import is additive-only, so re-running it never updates a published entry. Therefore:

- **A published entry that diverges from its live source is updated by opening a new PR with the new content** (edit the catalog file + canonical `packages/core/...` copy; re-run `catalog:index`). Never by re-import.
- Because measured update frequency is low (~0.48/skill/year), published entries are treated as **deliberately versioned snapshots**, not live tracking. This is acceptable for skills; it is **not** acceptable for security-relevant content — a security fix in a live source MUST be mirrored via PR within the same release cycle.
- *(Future, optional — not required by this ADR:)* a scheduled drift-detector that diffs published entries vs their live source and opens refresh PRs. Tracked separately.

### Enforcement — CI, not just reviewer judgment

Gates 1 & 2 are reviewer-independent and MUST be enforced by lint, not memory:

- Extend the existing `scripts/skill-leak-check.js` (or a sibling `catalog-curation-check.js`) to **reject** any catalog entry whose id/body matches the gate-1 project denylist or gate-2 maintainer-token denylist. Wire into `npm run validate` so a project/personal skill **cannot merge** even if a reviewer misses it.
- Gates 3 & 4 remain review + `catalog:validate` (schema/category already enforced).

### Cadence — batched, to avoid backlog starvation

187 candidate-general entries is too many for strict one-at-a-time. Sync in **themed batches (≤15 entries/PR)**; no SLA promise, but the backlog is worked in deliberate batches rather than ad hoc, so it neither starves nor floods.

## Consequences

- **Positive:** public catalog stays curated + credible; 118 project/personal skills provably stay out; CI makes the boundary mechanical, not vigilance-dependent; the staleness gap is bounded by data + a concrete refresh path.
- **Negative / accepted:** ~187 general skills enter as a worked backlog, not instantly; published entries can lag their live source by up to a release cycle (acceptable given ~0.48 updates/skill/year, except security fixes which are expedited).
- **Follow-up issues:** (a) implement `catalog-curation-check` CI lint; (b) optional drift-detector; (c) standards are still un-vendored (0 in catalog) — out of scope here.

## Alternatives considered

- **Full live-harness mirror (111→~330).** Rejected — evidence shows 39% (118) carry project/identity content; dumps them into a public catalog, contradicting 2026-06-06 / 2026-06-24 positioning, and is demand-blind.
- **Separate "personal" catalog for the 118.** Not adopted now — no demonstrated audience; revisit if external demand appears.
- **Namespace-tag + denylist auto-import.** Rejected as the default — automation without the gate-1/gate-2 CI lint would publish project skills on the first bad tag; the lint is the prerequisite, not the import automation.
