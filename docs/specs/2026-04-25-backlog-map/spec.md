---
status: proposed
created: 2026-04-25
owner: lucassantana
pr:
tags: backlog,planning,audit
---

# backlog-map

## Goal

Track the Top-10 actionable items surfaced by the 2026-04-25 backlog audit so they don't get lost in the wider plan file. Each item has a single concrete next PR or task and a sourced piece of evidence.

Source: `.claude/plans/backlog-2026-04-25.md` (full audit, all buckets, A-J).

## Top 10 (impact/effort)

1. **Astro 5.18.1 → 6.1.6 in `apps/web`** — quiets GHSA-j687-52p2-xcff. **Not exploitable** in this codebase (no `define:vars`, static output) — reclassified from security to hygiene. `[med/M/med]`
2. **`ai-dev-toolkit` → `forgekit` rename PR** across ~200 in-tree refs — task §4 of `2026-04-22-toolkit-monorepo-rebrand`. `[high/M/low]`
3. ✅ **Update `package.json` `repository.url`** + badges to `forgekit` — shipped PR #117 + #119 (pt-BR companion).
4. **`forge-space-knowledge-import` Phase A** — 8 docs-only imports. Blocked on user resolving 4 open questions in the spec. `[high/M/low]`
5. ✅ **Triage 3 orphaned remote branches** — shipped; expanded to 42 branches via D5.
6. **`dev-assets-import` task #2** — remove hardcoded local `dev-assets` paths from setup scripts. `[high/M/low]`
7. ✅ **Bump GH Actions in `deploy-web.yml` to Node-24-compatible versions** — shipped PR #118.
8. ❌ **Update `deploy-web.yml` comments** — dropped: Cloudflare Worker is still deliberately named `ai-dev-toolkit-library` per `apps/web/wrangler.jsonc:13-14`.
9. ✅ **Remove stray `import-library` git remote** — done locally.
10. ✅ **Archive stale handoff dir** — done.

## Status snapshot — 2026-04-25

Shipped 6 of 10 items (3 PRs + 4 local cleanups). Three Top-10 items remain actionable; one is blocked.

## Security findings — re-evaluated

- **GHSA-j687-52p2-xcff (Astro XSS)** — moderate-severity advisory. Surfaced by `pnpm audit`, but **codebase is not exploitable**: no `define:vars` usage in `apps/web/`, and the site builds with `output: 'static'` (advisory requires `'server'`). Tracked as hygiene under item #1.
- **Dependabot alerts disabled** at repo level — re-enable in Settings → Code security to get earlier signal on future advisories. (Tracked under bucket G2.)

## Tasks

- [x] Draft this spec
- [x] Land items #3, #5, #7, #9, #10 (and the pt-BR companion to #3)
- [x] Reclassify item #1 after exposure analysis (not exploitable here)
- [ ] Land item #2 (`ai-dev-toolkit` → `forgekit` rename across ~200 in-tree refs)
- [ ] Land item #6 (`dev-assets` hardcoded paths)
- [ ] Land item #1 hygiene bump (`astro@^6.1.6`) when Astro 5→6 migration is reviewed
- [ ] User decides 4 open questions blocking forge-space Phase A (#4)
- [ ] Re-run audit on 2026-05-09 (2 weeks) to diff progress

## Notes

- Repo was renamed `ai-dev-toolkit` → `forgekit` on 2026-04-25; local `origin` updated.
- HEAD CI green; latest tag `v0.17.0` 7 days old at audit time.
- Companion full backlog (all A-J buckets, untracked): `.claude/plans/backlog-2026-04-25.md`.
