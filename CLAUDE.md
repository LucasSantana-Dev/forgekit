# forgekit monorepo

## Key commands

| Task | Command |
|------|---------|
| Validate catalog | `pnpm catalog:validate` |
| Rebuild catalog index | `pnpm catalog:index` |
| Run tests | `pnpm test` |
| Lint | `pnpm lint` |
| Type-check CLI | `pnpm cli:typecheck` |
| Build web | `pnpm web:build` |
| Dev server | `pnpm web:dev` |
| Format all | `pnpm format` |
| Full workspace check | `pnpm workspace:validate` |
| Check backlog state | `pnpm backlog:check` |
| Reconcile backlog | `pnpm backlog:reconcile` |

## Catalog structure

```
packages/catalog/catalog/
  skills/<id>/manifest.json      # individual skill
  hooks/<id>/manifest.json       # individual hook
  agents/<id>.md                 # agent definition
  servers/<id>.yaml              # MCP server definition
  collections/<id>.yaml          # curated collection
  docs/<id>.md                   # AI guide document
  tools/<id>/                    # installable tool
```

Rules for catalog entries:
- All `manifest.json` and `.yaml` files require a `translations.pt-BR` block with `name` + `description`.
- Tags must be kebab-case. Common tags: `skill-md`, `core`, `rag`, `testing`, `security`, `git`, `deploy`, `mcp`, `debugging`, `planning`, `orchestration`.
- Every new skill should be referenced in at least one collection.
- Run `pnpm catalog:validate` after any catalog change.

## Release flow

1. Merge Dependabot PRs (patch/minor) → no changelog needed per PR
2. Promote `## [Unreleased]` in `CHANGELOG.md` to the new version
3. Bump `version` in root `package.json`
4. Run `pnpm workspace:validate` — must be green
5. Tag `vX.Y.Z` and push; GH Actions handles the release

See `.claude/plans/` for the active backlog map.

## Monorepo packages

| Package | Purpose |
|---------|---------|
| `packages/catalog` | Catalog source + validation scripts |
| `packages/cli` | `forge-kit`/`adtl` CLI (TypeScript) |
| `packages/core` | Shared hooks, tools, shell scripts |
| `packages/setup` | Install scripts for new users |
| `apps/web` | Astro 6 catalog web UI (Cloudflare Pages via Wrangler) |

## Locale parity

The `locales/pt-BR/` tree mirrors `packages/catalog/catalog/` and `packages/core/` in Portuguese. When adding catalog entries, also update or stub the pt-BR locale equivalent. Use `adt-sync-pt-parity` skill for bulk sync.

## Agents available locally

`.claude/agents/catalog-pr-reviewer.md` — review catalog PRs for schema, translation, and coverage issues
`.claude/agents/changelog-assistant.md` — generate CHANGELOG blocks from git log

## Storage policy

All new repos, clones, worktrees, and large artifacts go on `/Volumes/External HD/`, never under `~/`.
Worktrees live at `/Volumes/External HD/Desenvolvimento/.worktrees/`.
