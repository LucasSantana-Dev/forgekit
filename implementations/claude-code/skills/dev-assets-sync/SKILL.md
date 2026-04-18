---
name: dev-assets-sync
description: Run a workspace backup sync on demand — rsyncs Claude/Codex configs, memories, standards, hooks, skills-index, and per-project dev files to a private git repo (e.g. `{org}/dev-assets`). Use when backing up workstation state, prepping for clean-OS install, or capturing a snapshot before risky changes. Not for normal git commits — this is workspace-wide backup automation.
---

# dev-assets-sync

Back up local Claude Code + Codex state plus priority project dev files to a private GitHub repo. Runs on demand; may also be scheduled via cron for periodic snapshots.

## What it syncs

- **Claude**: `~/.claude/projects/*/memory/`, `~/.claude/standards/`, `~/.claude/hooks/`, sanitized `~/.claude/settings.json`
- **Codex**: `~/.codex/{memories,skills,rules,automations,plugins,superpowers,scripts}/`, `~/.codex/{AGENTS.md,config.toml,mcp.json}`
- **zsh**: `~/.config/zsh/functions.zsh`
- **Projects**: Configurable per user — syncs `.agents/`, `.opencode/`, `.serena/`, `.cursor/skills|rules`, `.claude/plans|skills`, `AGENTS.md`, `CLAUDE.md`, `opencode.jsonc` from priority projects
- **Self**: the sync script itself into `scripts/`

## What it does NOT sync

- `.env*`, keys, credentials, tokens, SSH/cloud config (excluded by rsync filters and `.gitignore`)
- `node_modules/`, `dist/`, `build/`, `.cache/`, `.log`, `.DS_Store`
- Full skill bodies (only an index is generated) — the toolkit installer is the source of truth
- `.git/` of project dirs

## How to run

```bash
/bin/zsh ~/scripts/dev-assets-sync.sh
```

Output: commits to `main` and pushes to the configured private repo. Log: `~/scripts/dev-assets-sync.log`. Lock: `~/scripts/.dev-assets-sync.lock`.

## Snapshots

`projects/<name>/SNAPSHOT.md` files are currently hand-written point-in-time summaries. To refresh, hand an Explore agent the target project and ask for version/stack/plans/specs/last-5-commits/gotchas under 250 words. Commit alongside the auto-synced data.

## Extending

Add a new project:

```bash
# In ~/scripts/dev-assets-sync.sh, near the project-sync section:
sync_project "NewThing" "/path/to/your/projects/NewThing"
```

Add a new global directory: edit the `# ── Global:` blocks in the script.

## Safety

- Guards against concurrent runs via lockfile.
- Aborts commit if staged files match `*.env|*.key|*.pem|secrets.json|auth.json|credentials*`.
- Skips push if `github.com` is unreachable (commits locally instead).
- Rotates log at 2000 lines.

## References

- Live script: `~/scripts/dev-assets-sync.sh`
- Cron entry: `crontab -l | grep dev-assets-sync`
- Backed up to: your configured private repo (e.g. `{org}/dev-assets` on GitHub)
