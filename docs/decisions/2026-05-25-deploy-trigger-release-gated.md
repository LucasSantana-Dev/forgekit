# ADR: Gate web deploy on GitHub release, not push to main

**Date:** 2026-05-25  
**Status:** Accepted  
**Replaces:** implicit push-to-main deploy trigger added in PR #209

---

## Context

`apps/web` deploys to Cloudflare Workers via `deploy-web.yml`. The original trigger was `push` to main filtered to `apps/web/**` and `packages/catalog/**` paths. This caused:

- Deploys on every qualifying commit during batch catalog work (5+ commits = 5+ deploys, each potentially seeing a partially-updated catalog)
- No clear signal for what version is live — must check Cloudflare dashboard
- Deploy noise on CI non-release pushes (CI fixes, skill file edits, docs) that happen to touch watched paths

The project has a defined release flow: `release.yml` fires on every push to main, checks if CHANGELOG has a new version, and if so publishes a GitHub release automatically. Release cadence is ~every 2 days.

---

## Decision

Replace the `push` trigger with `release: types: [published]` plus `workflow_dispatch`.

Deploy fires when:
1. A GitHub release is published (via `release.yml` on version bump) — the primary path
2. `workflow_dispatch` — manual escape hatch for urgent deploys or testing

Deploy does NOT fire on:
- Push to main (even if web/catalog paths change)
- Draft releases

---

## Alternatives considered

**`push` + paths filter (rejected)**  
Always-current site, but mid-batch deploys create partially-updated states and deploy noise. No stable "what's deployed" signal.

**Both triggers (rejected)**  
Redundant deploys on release days; adds complexity without benefit. If the content-lag concern grows material, the better fix is a dedicated `on: push` workflow for catalog-only changes, not conflating it with the release deploy.

**Manual only / `workflow_dispatch` only (rejected)**  
Too much friction; easy to forget after a release is cut.

---

## Consequences

**Positive:**
- Deployed state unambiguously matches a versioned release
- Batch catalog work (multiple commits before version bump) deploys once, after the release
- Smoke check gates a stable, release-validated build

**Negative:**
- Catalog content merged to main without a version bump is not visible on the live site until the next release
- Requires `workflow_dispatch` trigger for urgent content-only deploys

**Neutral:**
- `workflow_dispatch` remains available and is sufficient for the solo-developer workflow

---

## Revisit when

Catalog content PRs routinely ship without an accompanying version bump (≥3 times in a sprint without a release), AND the content lag is user-visible. At that point: add a second `on: push` trigger scoped only to `packages/catalog/**` with a separate step that skips the smoke check (catalog-only changes don't require a full build gate).
