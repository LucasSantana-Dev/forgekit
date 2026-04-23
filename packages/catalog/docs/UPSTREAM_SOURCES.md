# Upstream skill sources

The catalog mirrors hand-curated skills from three public GitHub repos.
All are vendored byte-for-byte (`SKILL.md` is preserved unchanged) with
our own `manifest.json` alongside — source, license, and attribution
propagate to the site and the CLI.

## Configured sources

| Label | Owner/Repo | Path | Skills | License |
|---|---|---|---|---|
| Anthropic official | [`anthropics/skills`](https://github.com/anthropics/skills) | `skills/` | 17 | MIT |
| Superpowers | [`obra/superpowers`](https://github.com/obra/superpowers) | `skills/` | 14 | MIT |
| claude-skills engineering | [`alirezarezvani/claude-skills`](https://github.com/alirezarezvani/claude-skills) | `engineering/` | 12 (curated subset) | MIT |

Rules:

- All upstreams follow the `<base>/<slug>/SKILL.md` layout.
- Slugs collide between sources? We prefix (e.g. `eng-git-worktree-manager` for the engineering source). Configured per-source in the importer.
- Secrets scan is blocking. Any upstream SKILL.md with a PAT / API key / private key gets rejected and reported.

## Refreshing / adding a source

```bash
pnpm --filter scripts run import:upstream-skills
pnpm run validate
pnpm run index
```

The importer is **idempotent** and **additive** — it won't overwrite an
existing `catalog/skills/<id>/`. To pull a fresh upstream version of an
already-imported skill, delete the directory and re-run.

To add a new upstream, edit `scripts/import-upstream-skills.ts` and
append to `SOURCES`. Fields:

- `label` — shown in logs.
- `owner`/`repo`/`ref` — GitHub coordinates.
- `basePath` — repo-relative path whose children are `<slug>/SKILL.md`.
- `license` — SPDX identifier; baked into every manifest.
- `author` — display name for attribution.
- `extraTags?` — always added to imported skills.
- `include?`/`exclude?` — slug allowlist/denylist.
- `slugPrefix?` — avoids collisions with skills already in the catalog.

## Why not federate the big aggregators?

We researched PulseMCP (12,992 servers), Glama, Smithery, and the
official MCP registry for servers, plus `VoltAgent/awesome-agent-skills`
(1000+) and `sickn33/antigravity-awesome-skills` (1400+) for skills.

Mass import is worse than manual curation for a small-group catalog:
signal-to-noise collapses, dedupe across 3+ sources is painful, and
upstream license metadata is inconsistent. We'd rather ship 50 known-good
skills than 1400 unknown ones. Expand `SOURCES` deliberately.

A future path: run a nightly GitHub Action that re-runs the importer,
opens a PR with the diff, and requires human review before merge. That
keeps the catalog fresh without sacrificing curation.
