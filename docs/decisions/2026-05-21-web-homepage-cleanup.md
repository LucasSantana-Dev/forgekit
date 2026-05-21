# Web Homepage Cleanup — Remove External Links + Orphaned Curation Code

**Date:** 2026-05-21
**Status:** Accepted

## Context

A hygiene pass on the catalog web app (`apps/web/`) surfaced three categories of dead weight:

1. **"Other catalogs worth a look" section** — 6 hardcoded external link cards (skills.sh, mcpmarket.com, anthropics/skills, modelcontextprotocol/servers, pulsemcp.com, cursor.directory) added in PR #165 (2026-05-09). These links have no automatic maintenance path: they go stale when projects change names, move, or shut down, and there is no signal from the codebase when that happens. The editorial blurbs were written at a moment in time and will rot silently.

2. **`buildHomepageCuration()` in `apps/web/src/lib/curation.ts`** — exported function (and its supporting types `HomepageItem`, `WorkflowTheme`, `HomepageCuration`, plus private helpers) that was never wired to any page. Zero imports across the entire web app.

3. **`apps/web/src/data/homepage-curation.yaml`** — YAML config feeding the orphaned function above, including a `featured:` block and a `workflows:` block. Also never read by any page.

Items 2 and 3 were likely leftovers from a planned homepage redesign that was shelved; the current homepage uses `collections.slice(0, 6)` instead of the curated featured lists.

## Decision

**Remove all three.** No new code to replace them.

- Delete the "Other catalogs" section (`<section class="related-catalogs">`) and its scoped CSS from `index.astro`.
- Delete `apps/web/src/lib/curation.ts` (entire file — no callers).
- Delete `apps/web/src/data/homepage-curation.yaml` (entire file — no readers).

## Alternatives Considered

| Option | Rejected because |
|---|---|
| Keep the external links section, add a "last verified" badge | Adds maintenance work with no clear owner; the core problem is link rot, not the UI |
| Wire `buildHomepageCuration()` to the homepage | Scope creep; the current collections grid is simpler and already works; restore only if the curated-featured-items design is explicitly planned again |
| Move the external links to a `resources.astro` page | Same maintenance problem in a different location |
| Defer all three items | Code that exists but doesn't run wastes future readers' time; dead code has no upside |

## Deferred

- **i18n wrappers** (`localizeEntries`, `localizedUrl`, `t()`) in `index.astro` — these are no-ops with `locale = "en"` hardcoded but catalog entries still carry `translations.pt-BR` data blocks. The infrastructure is load-bearing for a future i18n revival. Deferred.

## Consequences

- **Positive:** Homepage is a clean, self-contained page. No code paths exist that fetch external URLs or depend on curated ID lists at build time.
- **Positive:** `curation.ts` deletion removes ~220 lines of dead code that would otherwise mislead future contributors.
- **Negative (minor):** External catalog links are gone. Users who found them useful must search independently. This is acceptable — the links were not a differentiating feature of the site.

## Revisit When

- A curated featured-items homepage section is explicitly planned and scoped — at that point restore `buildHomepageCuration()` from git history rather than starting fresh.
- The "Other catalogs" section is requested by users via issues — at that point add it to a dedicated `/resources` page with a clear update cadence.
