---
name: dev-assets-sync
description: Run the dev-assets backup sync on demand — rsyncs Claude/Codex configs, memories, standards, hooks, skills-index, and per-project dev files (Lucky, Craftvaria, homelab, ai-dev-toolkit, forge-space) to the private LucasSantana-Dev/dev-assets repo. Use when the user wants to back up the current workstation state, refresh dev-assets before a clean-OS install, capture a snapshot before a risky change, or asks to "sync dev-assets". Not for normal git commits — this is a workspace-wide backup.
---

# dev-assets-sync

Back up local Claude Code + Codex state plus priority project dev files to the private `LucasSantana-Dev/dev-assets` GitHub repo. Runs on demand; also scheduled via cron (`0 2 */3 * *`).

## What it syncs

- **Claude**: `~/.claude/projects/*/memory/`, `~/.claude/standards/`, `~/.claude/hooks/`, sanitized `~/.claude/settings.json`
- **Codex**: `~/.codex/{memories,skills,rules,automations,plugins,superpowers,scripts}/`, `~/.codex/{AGENTS.md,config.toml,mcp.json}`
- **zsh**: `~/.config/zsh/functions.zsh`
- **Projects**: Lucky, forge-space, ai-dev-toolkit, homelab, Craftvaria — each picks up `.agents/`, `.opencode/`, `.serena/`, `.cursor/skills|rules`, `.claude/plans|skills`, `AGENTS.md`, `CLAUDE.md`, `opencode.jsonc`
- **Self**: the sync script itself into `scripts/`

## What it does NOT sync

- `.env*`, keys, credentials, tokens, SSH/cloud config (excluded by rsync filters and `.gitignore`)
- `node_modules/`, `dist/`, `build/`, `.cache/`, `.log`, `.DS_Store`
- Full skill bodies (only an index is generated) — the toolkit installer is the source of truth
- `.git/` of project dirs

## How to run

```bash
/bin/zsh ~/scripts/sync-dev-assets.sh
```

Output: commits to `main` and pushes to `LucasSantana-Dev/dev-assets`. Log: `~/scripts/sync-dev-assets.log`. Lock: `~/scripts/.sync-dev-assets.lock`.

## Snapshots

`projects/<name>/SNAPSHOT.md` files are currently hand-written point-in-time summaries. To refresh, hand an Explore agent the target project and ask for version/stack/plans/specs/last-5-commits/gotchas under 250 words. Commit alongside the auto-synced data.

## Extending

Add a new project:

```bash
# In ~/scripts/sync-dev-assets.sh, near line 150:
sync_project "NewThing" "/Volumes/External HD/Desenvolvimento/NewThing"
```

Add a new global directory: edit the `# ── Global:` blocks in the script.

## Safety

- Guards against concurrent runs via lockfile.
- Aborts commit if staged files match `*.env|*.key|*.pem|secrets.json|auth.json|credentials*`.
- Skips push if `github.com` is unreachable (commits locally instead).
- Rotates log at 2000 lines.

## References

- Live script: `~/scripts/sync-dev-assets.sh`
- Backup of script: `LucasSantana-Dev/dev-assets` → `scripts/sync-dev-assets.sh`
- Cron entry: `crontab -l | grep sync-dev-assets`
- Token optimization context: `LucasSantana-Dev/dev-assets` → `global/token-optimization-playbook.md`
