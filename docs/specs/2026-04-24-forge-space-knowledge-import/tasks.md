# Tasks — forge-space-knowledge-import

Phased checklist. Each phase is one PR. Do not start a phase until its
predecessor merges cleanly.

## Pre-flight

- [x] Draft `spec.md`
- [x] Capture inventory in `inventory.md`
- [ ] User resolves the 4 Open Questions in `spec.md`
- [ ] User approves phased approach (vs. monolithic PR)

## Phase A — Docs-only

- [ ] Create `docs/architecture/` with index `README.md`
- [ ] Import `core/ARCHITECTURE.md` → `docs/architecture/core-patterns.md` (with provenance header)
- [ ] Import `core/AGENTS.md` → `docs/architecture/agent-operations.md`
- [ ] Import `core/docs/SHARED_DOCUMENTATION.md` → `docs/architecture/shared-documentation.md`
- [ ] Import `branding-mcp/README.md` → `docs/architecture/branding-mcp.md` (overview only)
- [ ] Import `ui-mcp/README.md` → `docs/architecture/ui-mcp.md`
- [ ] Update `docs/guides/README.md` to surface the new `architecture/` index
- [ ] Markdown link check + validate + test + build all green
- [ ] Open PR "docs(architecture): import forge-space core + MCP architecture notes"

## Phase B — MCP server entries

- [ ] Confirm upstream repos exist (answers Open Question 1)
- [ ] Add `packages/catalog/catalog/servers/branding-mcp.yaml` (with `usage` block when PR #102 lands)
- [ ] Add `packages/catalog/catalog/servers/ui-mcp.yaml`
- [ ] Decide whether `mcp-gateway-ref.yaml` is user-facing
- [ ] Catalog validate, build, test green
- [ ] Open PR "feat(catalog): add branding-mcp + ui-mcp server entries"

## Phase C — Design tokens

- [ ] Decide naming (`@forge-kit/brand-tokens` vs. raw under `packages/core/brand-tokens/`) — Open Question 2
- [ ] Import `brand-guide/src/tokens/` to chosen path
- [ ] Wire a generator smoke test (CSS/Tailwind/React output)
- [ ] (Optional) Wire into webapp theme (deferrable)
- [ ] Open PR "feat(brand-tokens): import forge-space design tokens"

## Phase D — Governance rules

- [ ] Resolve conflict policy for duplicate rules (Open Question 3)
- [ ] Inventory forge-ai-init rules that do NOT already exist as Forge Kit skills/hooks
- [ ] For each: decide hook vs. `doctor` subcommand
- [ ] Import chosen rules with provenance headers
- [ ] Add `docs/guides/governance-rules.md` index
- [ ] Open PR "feat(governance): import forge-ai-init anti-pattern rules as hooks"

## Phase E — CI automation

- [ ] Port `forge-ai-action/` outer workflow (no bundled code)
- [ ] Import `github-org-workflows/` reusable workflows to `.github/workflows/reusable/`
- [ ] Document pinning pattern for downstream repos
- [ ] Open PR "ci: reusable workflows from github-org-workflows"

## Phase F — Deferred (no action without new signal)

- [ ] `siza-gen/src/generators/` — reconsider after Phase B
- [ ] `forge-local` — promote to its own spec if user interest emerges

## Post-migration

- [ ] Update `README.md` with an "Ecosystem heritage" section referencing
      which forge-space repos contributed
- [ ] Add `Migrated-From:` trailer policy (if chosen in Open Question 4) to
      `docs/standards/` or leave inline header as sufficient
- [ ] Close out spec: move to `docs/specs/archived/`
- [ ] Update `docs/roadmap.md`
