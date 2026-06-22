# Decision: adopt Astro 7.0.0 for apps/web (merge #257), via a blocking pre-merge pilot

- **Date:** 2026-06-22
- **Status:** Accepted (gated — pilot steps are blocking, see Plan)
- **Process:** /research-and-decide (web research + decision-critic APPROVE-WITH-CONDITIONS; conditions verified against the repo)
- **Governs:** `apps/web` + Dependabot PR #257 (astro 6.4.6 → 7.0.0)

## Context

Dependabot opened #257 bumping Astro a **major** version (6 → 7) for the catalog site (`apps/web`, static, Cloudflare Pages). Majors were held out of the dep-sweep for deliberate review. The question: adopt Astro 7 now, or defer?

Verified facts (checked in the repo / on GitHub):
- **#257 CI is GREEN — 15 checks, 0 failed**, including `Validate catalog, CLI, and web` (runs `pnpm web:build`). Astro 7 **builds** the site.
- `apps/web/astro.config.mjs` is minimal + **static**: `{ site, base, trailingSlash: "always", build: { format: "directory" }, integrations: [sitemap()] }`. **No SSR adapter.** One integration (`@astrojs/sitemap` ^3.7.3). Deployed as static files via wrangler.
- **No markdown pipeline at all**: zero `.md`/`.mdx` files, no `src/content/` collections, and no `remark`/`rehype`/`plugin` references anywhere in `src/` — the site is **25 `.astro` pages**. So Astro 7's markdown-engine breaking changes are **N/A**.
- **Whitespace risk low**: the only whitespace CSS is `white-space: nowrap` (×8) — unaffected by `compressHTML` (which strips collapsible inter-element whitespace). **No `pre`/`pre-wrap`** dependency.
- **Node 22** in CI (satisfies Astro 7's Node requirement).
- Other v7 breaking changes (DB package removal, transitions internals, advanced-routing default) don't apply to this static, no-SSR, no-DB config.
- RAG pre-check: no prior forgekit astro-upgrade decision. (The astro→Next.js migration on record is a *different* project, Criativaria — not forgekit.)

## Decision

**Adopt Astro 7.0.0** (merge #257). Risk is **low**: it builds green, the config surface is forward-compatible, there's no markdown/SSR/whitespace-dependent surface, and static output makes rollback trivial. Deferring accrues framework-major debt + Dependabot noise for no justified risk.

## Plan — pilot is a BLOCKING gate (decision-critic condition: build-success ≠ output-correctness)

1. Re-rebase #257 onto current `main` (currently DIRTY post-dep-sweep); confirm CI stays green.
2. **Diff `dist/sitemap.xml`** built on 6.x vs 7.0.0 — CI proves the build runs, not that sitemap XML is unchanged. Hold if URLs/namespace/format differ.
3. **Cloudflare Pages deploy preview**, eyeball the whitespace-bearing render surfaces — `HeroTerminal`, `InstallBlock`, `tools/[id]` (code/command display) — plus `/sitemap.xml`.
4. Merge only if 2–3 are clean.
- **Rollback:** revert the dep bump + redeploy. No data/schema/linked-service migration. Clear Cloudflare cache on rollback.

## Alternatives considered
- **Defer / stay on Astro 6.x.** Rejected: risk is low (CI builds green, no risky surface), and staying a major behind accrues upgrade debt.
- **Pin astro, ignore future majors.** Rejected: forgekit's thesis is staying current.

## Consequences
- (+) Stays current on the web framework; near-floor risk; trivial rollback (static).
- (+) Clears one of the two held majors from the backlog.
- (−) One-time pilot cost (rebase + sitemap diff + preview eyeball, ~15 min).
- (neutral) `@astrojs/sitemap` ^3.x compatibility is inferred from the green build + docs, confirmed by the sitemap diff in step 2.

## Revisit when
- The deploy preview or sitemap diff shows a regression (whitespace/layout or XML format) → hold the merge, pin to 6.x until fixed.
- A future Astro major adds an SSR adapter / content collections to this app → re-evaluate (larger breaking surface).
