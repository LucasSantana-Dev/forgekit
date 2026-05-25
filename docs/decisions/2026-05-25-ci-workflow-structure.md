# ADR: CI workflow structure — parallel jobs, npm/pnpm split, action version strategy

**Date:** 2026-05-25  
**Status:** Accepted

## Context

`validate.yml` has 9 parallel jobs. Four of them (`validate-schema`, `lint`, `test`, `typecheck-plugin`) each independently run `checkout → setup-node (cache: npm) → npm ci → one script`. A review raised two questions: (1) should these be consolidated into one job to reduce redundant installs; (2) are the remaining workflows using unpinned action refs a security/consistency risk?

Separately, the `workspace-packages` job was missing `cache: 'pnpm'` on its `setup-node` step, causing uncached pnpm installs on every run.

## Decision

**Keep 4 npm jobs as separate parallel jobs.** Do not consolidate or matrix them.

**Root-level tooling (jest, eslint, ajv, prettier, typescript) is managed by npm** via `package-lock.json`. Workspace packages (catalog, CLI, web) are managed by pnpm via `pnpm-lock.yaml`. This split is intentional and load-bearing — `workspace:validate` and the CI jobs reflect it explicitly. The 4 npm jobs are correct as written.

`cache: 'npm'` on `setup-node` means after the first job writes the npm cache for a given lockfile hash, subsequent jobs in the same run hit it. Real overhead is ~0.5s per job; no optimization needed.

**Add `cache: 'pnpm'` to the `workspace-packages` job.** This was a clear omission — every other pnpm job in the repo sets it.

**Pin all action refs to SHA in all workflow files.** `validate.yml` and `deploy-web.yml` already used SHA pins; `release.yml`, `backlog-triage.yml`, `secret-scan.yml`, and `semgrep.yml` used unpinned `@v6` tags. Standardize to SHA pins throughout. Dependabot (`package-ecosystem: github-actions`, weekly schedule) automatically PRs SHA updates, so this is maintenance-free in practice.

## Alternatives considered

**Consolidate 4 npm jobs into one sequential job**: Saves ~1.5s of redundant npm ci overhead but destroys parallel failure discovery — if lint fails, tests would not run in the same CI pass. Rejected.

**Matrix the 4 npm jobs**: Keeps parallelism, reduces YAML duplication. But makes job names dynamic (`node-checks [lint]` instead of `lint`), which degrades the GitHub UI experience when re-running individual checks. Also adds a layer of indirection for a problem that `cache: 'npm'` already handles. Rejected.

**Leave action refs unpinned, rely on Dependabot**: Tags are readable; Dependabot manages updates. Valid approach, but mixing pinned (validate.yml) and unpinned (other files) creates an inconsistent security posture. Standardizing to all-SHA is more defensible and still low-maintenance with Dependabot running weekly.

## Consequences

- Positive: `workspace-packages` will cache pnpm installs across runs for the same lockfile hash.
- Positive: All action refs are now pinned to a specific commit, preventing supply chain attacks from tag mutation.
- Neutral: Dependabot will generate SHA-update PRs for all workflows on the same weekly cadence it already used.
- Neutral: No job consolidation; CI structure remains the same conceptually.

## Revisit when

- If the 4 npm jobs begin taking >2 minutes each (currently <1 min), revisit caching or consolidation.
- If the npm/pnpm split is removed (i.e., all root tooling migrated to pnpm), the 4 npm jobs should be migrated to pnpm at that point.
- If Dependabot is removed or disabled, switch to a manual SHA update process or revert to tag-based refs.
