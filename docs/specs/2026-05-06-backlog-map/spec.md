---
status: proposed
created: 2026-05-06
owner: lucassantana
pr:
tags: backlog,planning,audit
---

# backlog-map

## Goal

Track the Top-10 actionable items surfaced by the 2026-05-06 backlog audit.
Each item has a single concrete next PR or task and a sourced piece of evidence.

Source: `.claude/plans/backlog-2026-05-06.md` (full audit, all buckets A–J).

## Context since last audit (2026-04-25)

- Pruned 60 unused local skills (146 → 86), removed 6 dead catalog entries
- Added `professional-work-toolkit` collection (enterprise-safe, bilingual)
- Web app: nav reordered, collections sort by size, hero note shows collection count
- Catalog validated: 94 skills, 13 collections, 189 index entries
- 3 Dependabot PRs now open (#122 marked, #123 astro, #124 wrangler) — all CI green

## Top 10 (impact/effort)

1. **Enable Dependabot alerts** — GitHub Settings → Code security; currently HTTP 403. No CVE early-warning in place. `[high/S/low]`
2. **Merge wrangler PR #124** — patch bump 4.85→4.88, all CI green, zero risk. `[low/S/low]`
3. **Merge marked PR #122** (14→18) — 4 major versions on Markdown renderer, all tests pass. `[med/S/low]`
4. **Merge Astro PR #123** (5→6) — GHSA-j687-52p2-xcff hygiene + Vite 6, all CI green. `[med/S/med]`
5. **Cut v0.18.0** — after merging A1–A3; 18 days since v0.17.0 + catalog cleanup. `[med/S/low]`
6. **Complete forgekit rename** — 185 files in `locales/pt-BR/` + `kit/` still reference `ai-dev-toolkit`. PR #121 was partial. `[med/M/low]`
7. **Externalize `curation.ts`** — FEATURED_IDS + WORKFLOW_THEMES hardcoded in 222-line file (8 churn hits/90d); move to `src/data/homepage-curation.yaml`. `[med/M/low]`
8. **Add sort/filter to collections page** — static sort-by-size ships today; tag-filter pills + toggle needed for >13 collections. `[med/M/low]`
9. **Update stale BACKLOG.md** — last updated 2026-04-18 (18 days). `[low/S/low]`
10. **Close monorepo-rebrand spec as shipped** — `docs/roadmap.md` still shows it as "active"; most sub-tasks shipped (PRs #117, #119, #121). `[low/S/low]`

## Status snapshot — 2026-05-06

- 0 of 10 items started
- All 3 Dependabot PRs (items 2–4) are MERGEABLE with CI green
- Items 2–5 should land this week
- Items 6–8 are the non-trivial engineering work for next 2 weeks

## Security findings

- **Dependabot alerts disabled** — re-enable via Settings → Code security (item 1)
- **marked 14→18** — no open CVEs per `npm audit`; 4 major version gap on Markdown renderer; merge PR #122 (all tests pass)
- **GHSA-j687-52p2-xcff (Astro XSS)** — not exploitable (static output, no `define:vars`); hygiene bump via PR #123

## Tasks

- [ ] Enable Dependabot alerts (UI, no PR)
- [ ] Merge PR #124 (wrangler)
- [ ] Merge PR #122 (marked)
- [ ] Merge PR #123 (astro) — review Astro 6 changelog first
- [ ] Cut v0.18.0
- [ ] PR: Complete ai-dev-toolkit → forgekit rename in 185 remaining files
- [ ] PR: Externalize homepage curation to YAML
- [ ] PR: Add tag-filter + sort toggle to collections page
- [ ] Update BACKLOG.md
- [ ] Mark `2026-04-22-toolkit-monorepo-rebrand` spec as shipped; regenerate roadmap

## Notes

- Next re-run scheduled: 2026-05-20 (2-week cadence)
- Full audit (all A–J buckets): `.claude/plans/backlog-2026-05-06.md`
