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
- When removing an entry, audit all collection `.yaml` files for references to its id and remove or reroute them before deleting the entry — otherwise `pnpm catalog:validate` will fail with a referential integrity error.
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

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`LucasSantana-Dev/forgekit`); use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. `CONTEXT.md` at root; ADRs at `docs/decisions/` (not `docs/adr/`). See `docs/agents/domain.md`.
