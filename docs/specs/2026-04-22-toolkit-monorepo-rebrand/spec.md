---
status: proposed
created: 2026-04-22
owner: lucassantana
pr:
tags: monorepo,rebrand,tooling
---

# toolkit-monorepo-rebrand

## Goal

Merge `ai-dev-toolkit`, `ai-dev-toolkit-setup`, `ai-dev-toolkit-pt-br`, and
`ai-dev-toolkit-library` into one branded monorepo with a shorter name, shared
CI, shared release governance, and one source of truth for docs, skills,
catalog data, bootstrap scripts, and localization.

## Context

The current split creates repeated sync work:

- `ai-dev-toolkit` owns the reusable rules, patterns, skills, schemas, and
  `forge-kit` installer.
- `ai-dev-toolkit-setup` consumes a pinned toolkit version and owns machine
  bootstrap scripts.
- `ai-dev-toolkit-pt-br` mirrors much of the toolkit content in Portuguese.
- `ai-dev-toolkit-library` catalogs skills and MCP servers, and already imports
  content from `ai-dev-toolkit` and `ai-dev-toolkit-setup`.

Current evidence gathered on 2026-04-22:

- `ai-dev-toolkit` has active specs/roadmap machinery and is the best canonical
  host for the migration PR sequence.
- `ai-dev-toolkit-setup` is clean locally, has `TOOLKIT_VERSION=0.17.0`, and is
  already coupled to toolkit releases.
- `ai-dev-toolkit-library` is already a pnpm workspace (`cli`, `web`, `scripts`)
  and has uncommitted local i18n/schema/web work. Do not rewrite that checkout
  until those changes are either shipped or intentionally incorporated.
- `ai-dev-toolkit-pt-br` is clean locally and duplicates the toolkit package
  structure with Portuguese content.

This is also the right time to rename. `ai-dev-toolkit` is descriptive but long,
generic, and not brandable. The existing installer language already points at
`forge-kit`, which is short and close to the Forge Space naming direction
without depending on the retired Forge-Space org.

## Name Decision

Recommended product and repo name: **Forge Kit** (`forge-kit`).

Why:

- already appears in the toolkit install flow
- short enough for CLI/package names
- brandable without the generic `ai-dev-toolkit` phrase
- fits the previous Forge Space naming direction while keeping this under
  `LucasSantana-Dev`

Working package names, pending registry availability:

- `@forge-kit/core` — rules, patterns, skills, schemas, and installer assets
- `@forge-kit/setup` — machine bootstrap scripts and templates
- `@forge-kit/catalog` — skill/MCP/server catalog data and schemas
- `@forge-kit/cli` or `forge-kit` — command-line entrypoint, replacing or
  wrapping `@lucassantana/adtl`
- `@forge-kit/web` — private docs/catalog site package

Fallback names if `forge-kit` is unavailable:

- `forge-stack`
- `forge-workbench`
- `forgebase`

## Approach

Use a staged migration. Do not archive or rename the old repos until the
monorepo builds, releases, and docs are green.

### Target Layout

```text
forge-kit/
├── packages/
│   ├── core/              # current ai-dev-toolkit content
│   ├── setup/             # current ai-dev-toolkit-setup content
│   ├── catalog/           # current ai-dev-toolkit-library/catalog + schemas
│   └── cli/               # current ai-dev-toolkit-library/cli
├── apps/
│   └── library-web/       # current ai-dev-toolkit-library/web
├── infra/
│   └── gateway/           # current ai-dev-toolkit-library/gateway
├── locales/
│   └── pt-BR/             # migrated ai-dev-toolkit-pt-br content
├── docs/
│   ├── specs/
│   └── roadmap.md
├── scripts/
└── package.json           # root workspace commands
```

### Migration Strategy

1. **Finish ready drift first.** Merge green maintenance PRs before the import.
2. **Freeze repo writes briefly.** Do not start large content PRs in the four
   source repos during the import window.
3. **Preserve history.** Import the other repos with subtree-style merges under
   their target prefixes. Avoid copy-paste imports that drop history.
4. **Move current root last.** Once external repos are imported, move current
   toolkit files under `packages/core/` in one mechanical commit.
5. **Unify workspace tooling.** Use pnpm at the root because
   `ai-dev-toolkit-library` is already a pnpm workspace. Keep npm package lock
   compatibility only inside `packages/core` until the migration proves green.
6. **Wire CI by package.** Keep existing checks intact, then add path-filtered
   jobs for core, setup, catalog, cli, and web.
7. **Rename after CI is green.** Rename the GitHub repo to `forge-kit`, update
   package metadata, and add redirects/README pointers in archived repos.
8. **Deprecate old repos slowly.** Old repos become read-only pointers after one
   successful monorepo release and one successful setup bootstrap from the
   monorepo.

### Explicit Tradeoffs

- Initial import may keep `locales/pt-BR` as an overlay instead of fully merging
  every Portuguese file into `packages/core`. That avoids a risky bilingual
  content rewrite during the mechanical migration.
- Existing package names may remain temporarily for compatibility, then move to
  Forge Kit names in a follow-up release.
- `ai-dev-toolkit-library` local uncommitted work must be handled before import:
  either land it in that repo first or import it as an explicit migration commit.

### Out Of Scope For The First PR

- Renaming GitHub repositories.
- Archiving the source repositories.
- Publishing renamed npm packages.
- Rewriting every internal link.
- Removing compatibility shims.
- Migrating private secrets, local auth, or machine-specific config.

## Verification

The migration is done only when all of these are true:

- root workspace install succeeds on a clean checkout
- core checks pass: shell validation, schema validation, lint, tests, plugin
  typecheck, markdown link check, and secret scan
- setup checks pass: bootstrap script syntax, shellcheck, PowerShell parse, and
  doctor/CI smoke checks
- catalog checks pass: schema validation, index generation, CLI typecheck/build,
  and web build
- Portuguese content has an explicit parity check or documented accepted drift
- old repo READMEs point to the monorepo after the rename
- one monorepo release validates the setup bootstrap against the new source path
- no secrets are introduced by imported history or config files
