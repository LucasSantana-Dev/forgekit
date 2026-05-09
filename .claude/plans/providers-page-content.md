# Providers page — content backlog

_Repo: ai-dev-toolkit (forgekit) · Created: 2026-05-08_

The catalog now exposes `/providers/` (PR pending — current branch). Each entry is bucketed into a primary provider derived from its tags via `deriveProvider()` in `apps/web/src/lib/ui.ts`. Today every entry without a provider-signal tag falls into **Claude** by default, so Codex / Gemini / Cursor / Local buckets are empty or near-empty. This plan tracks the content + schema work needed to make the page useful.

## Goal

A `/providers/` page where each provider section is non-trivial (≥ 3 curated entries), with editorial copy that tells the reader **what works on that provider, where it installs, and what runtime to expect**.

## Out of scope

- Building per-provider install commands beyond the existing `npx forge-kit install` flow. Provider-specific install paths (`~/.codex/`, `~/.cursor/`) are tracked separately in #162.
- Provider auth / API key onboarding flows.

---

## Phases

### Phase 1 — Schema (1 PR)

Make provider an explicit, validated field instead of a tag-derivation heuristic.

- [ ] **#154** — Add optional `provider` field to manifest schema (skills, agents, hooks, commands, tools, servers).
  - Allowed values: `claude | codex | gemini | cursor | local | any`.
  - When omitted, validator emits a warning recommending the field; `deriveProvider()` keeps working as a fallback.
  - Update `pnpm catalog:validate` to enforce the enum.
  - **Acceptance:** schema files under `packages/catalog/catalog/_schemas/` updated; validation covers all kinds; build still green.

### Phase 2 — Backfill (1 PR)

Populate the new field across the existing 274 entries so the providers page reflects reality.

- [ ] **#155** — Backfill `provider` on every existing manifest.
  - Default: `claude` (everything currently lands in `~/.claude/`).
  - Promote to other providers when an entry already carries `codex`, `gemini`, `cursor`, `local-llm`, `ollama`, `vllm`, or `lm-studio` tags.
  - Mark provider-agnostic items (e.g. catalog docs, generic markdown skills) as `any`.
  - **Acceptance:** ≥ 95 % of entries have explicit `provider` set; warnings count drops to 0.

### Phase 3 — Seed non-Claude buckets (4 PRs, parallelisable)

Each bucket gets ≥ 3 curated entries so the section has real content.

- [ ] **#156** — Seed Codex bucket (≥ 3 entries).
  - Likely candidates: a Codex-targeted variant of `smart-model-select`, a Codex-aware `prompt-injection-defense`, a `codex-bridge` skill that explains how to import existing skills into the OpenAI Codex agent surface.
  - **Acceptance:** 3 new entries in `packages/catalog/catalog/skills/codex-*`; `pnpm catalog:validate` clean; entries appear under Codex on `/providers/`.
- [ ] **#157** — Seed Gemini bucket (≥ 3 entries).
  - Candidates: `gemini-context-cache`, `gemini-grounding-config`, `vertex-ai-setup`. Source: existing Anthropic skills can be ported with rewritten install paths.
  - **Acceptance:** same shape as #156.
- [ ] **#158** — Seed Cursor bucket (≥ 3 entries).
  - Candidates: `cursor-rules-import`, `cursor-mcp-bridge`, `cursor-tab-mode`.
  - Required reading: `~/.cursor/rules/` schema, MCP support matrix.
  - **Acceptance:** same shape.
- [ ] **#159** — Seed Local LLM bucket (≥ 3 entries).
  - Candidates: `ollama-runtime`, `vllm-server`, `lm-studio-import`, `model-routing-local-first`.
  - **Acceptance:** same shape.

### Phase 4 — Page polish (2 PRs)

- [ ] **#160** — Editorial intro per provider section.
  - Add `getProviderBlurb(provider)` returning 2–3 sentence intro: install path, runtime expectations, when to pick this provider over Claude.
  - Render above each provider's grid on `/providers/`.
  - **Acceptance:** every provider with content has a blurb; tone matches site voice (direct, no fluff, no em dashes per CLAUDE.md).
- [ ] **#161** — Per-provider deep page `/providers/[id]/`.
  - Static path for each provider id with a longer intro, the curated grid, and a "good first 3" mini-list.
  - Cross-link from the providers index sidebar.
  - **Acceptance:** 5 new pages built; nav still under 1.5 s LCP; all entries route to their provider page.

### Phase 5 — Documentation + UX (1 PR each)

- [ ] **#162** — `docs/PROVIDERS.md` taxonomy doc.
  - Define what each provider means in this catalog, install path conventions, and the `provider` field rules. Linked from CONTRIBUTING and from each provider page.
- [ ] **#163** — Provider badge on `Card.astro` and entry detail headers.
  - Small monospace pill in the card head (next to `id`) showing the provider id.
  - Detail page: provider chip in `EntryHeader` next to version + tags.
  - **Acceptance:** visible without breaking the terminal-style card layout.

---

## Dependencies

```
#154 (schema)
   └── #155 (backfill)
         ├── #156 (Codex)
         ├── #157 (Gemini)
         ├── #158 (Cursor)
         └── #159 (Local)
                  └── #160 (blurbs)
                         └── #161 (deep pages)
                                └── #163 (badges)

#162 (docs) — independent, can ship anytime after #154
```

## Success metrics

- Every provider bucket on `/providers/` has ≥ 3 entries.
- 95 %+ of catalog entries declare `provider` explicitly.
- Provider taxonomy is documented in `docs/PROVIDERS.md`.
- Page build cost ≤ existing budget (no extra > 2 s in `pnpm web:build`).

## Risk register

| Risk | Mitigation |
|------|-----------|
| Curated entries for non-Claude providers may be aspirational and not actually verified to work. | Mark uncurated drafts with a `draft: true` flag; only counted toward bucket size when removed. |
| Provider metadata drifts as upstream agents (Cursor, Codex) change install conventions. | Pin convention in `docs/PROVIDERS.md`; revisit quarterly. |
| Adding `provider` field is a breaking schema change for downstream consumers. | Keep it optional in v0.x; only required at v1.0. |

## Replanning triggers

- A provider deprecates its plugin / skill surface (e.g. Cursor drops MCP support).
- New first-class provider emerges that warrants its own bucket (e.g. AWS Kiro IDE — already tracked separately in `kiro-ide-collection.md`).
- `provider` count exceeds 6; reconsider whether the sticky-sidebar layout still fits.
