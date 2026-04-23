---
status: proposed
created: 2026-04-23
owner: lucassantana
pr:
tags: follow-up,portability,setup
---

# dev-assets-import

## Goal

Import the reusable, non-secret parts of `dev-assets` into Forge Kit so setup,
catalog, and editor/tooling integrations stop depending on one private local
backup repo or machine-specific absolute paths.

## Context

- PR #96 merged the Forge Kit monorepo, but `dev-assets` was intentionally left
  out of scope so the consolidation could ship safely first.
- Current repo evidence still shows follow-up pressure:
  - `packages/catalog/scripts/import-agents.ts` hardcodes a local
    `/Volumes/External HD/.../dev-assets/...` source path.
  - docs under `docs/guides/` still contain stale setup references from the
    pre-monorepo split.
  - `dev-assets` is a private backup/config repo containing both reusable
    toolkit material and personal/machine-specific data.
- The user chose to keep the Forge Kit naming direction for the shipped merge,
  so this follow-up should improve portability and content ownership without
  reopening the broader rename decision.

## Desired Outcome

- Forge Kit no longer depends on a private local `dev-assets` checkout for any
  required import/build path.
- Reusable assets from `dev-assets` have a clear canonical home in this repo.
- Personal backups, project snapshots, secrets, and machine-specific data stay
  out of the monorepo.
- Setup and contributor docs point at the monorepo layout only.

## Import Boundaries

### In scope

- reusable editor/tooling templates
- portable setup/bootstrap assets
- shared docs or skills that are clearly productized and non-secret
- importer/path cleanup needed to make these assets reproducible in CI and on
  fresh machines

### Out of scope

- personal project snapshots under `projects/`
- machine-local backups and workstation state
- tokens, auth material, or secret-bearing config
- Full Disk Access instructions tied only to local backup workflows
- a second broad naming/rebrand sweep

## Proposed Approach

1. Audit `dev-assets` and classify each top-level area as:
   - import into Forge Kit
   - keep external/private
   - document but do not import
2. Remove hardcoded local `dev-assets` paths from repo scripts by switching to:
   - repo-local canonical sources when they now exist in Forge Kit, or
   - explicit env/config inputs when external content must stay private.
3. Import only the reusable surfaces into stable homes such as:
   - `packages/setup/` for bootstrap/editor config templates
   - `packages/core/implementations/` for implementation-specific reusable
     config/examples
   - `docs/guides/` for user-facing setup guidance
4. Update docs and any importer metadata that still assume the old split repos.
5. Validate from a clean checkout without relying on a private local clone.

## Verification

This follow-up is done only when all of these are true:

- no required repo script depends on `/Volumes/.../dev-assets`
- imported assets are reproducible from this repo alone or via documented
  explicit external inputs
- setup/docs paths match the current Forge Kit monorepo layout
- validation/build commands that touch the changed areas still pass
- no private or secret-bearing content is introduced

## Risks

- Accidentally importing personal or secret-bearing material from `dev-assets`
- Mixing portable product assets with machine backup concerns
- Creating a second source of truth when equivalent content already exists in
  `packages/core` or `packages/setup`
- Reopening broad branding scope instead of keeping this follow-up narrowly
  about portability and ownership
