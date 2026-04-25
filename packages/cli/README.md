# forge-kit

CLI for [Forge Kit](https://github.com/LucasSantana-Dev/forgekit) —
browse Skills and MCP servers, install them into Claude Code, and wire up your local MCP gateway
to Claude Code, Codex, Cursor, Gemini, Windsurf, or Claude Desktop.

## Install

No install needed:

```bash
npx forge-kit <command>
```

Or globally:

```bash
npm i -g forge-kit
forge-kit <command>
```

The old `adtl` binary remains available as a compatibility alias.

## Commands

| Command | What it does |
|---|---|
| `forge-kit list [--kind K] [--tag T] [query]` | Browse the catalog. |
| `forge-kit search <query>` | Alias for `list`. |
| `forge-kit install <skill-or-agent-id> [--force]` | Copies a skill to `~/.claude/skills/<id>/` or an agent to `~/.claude/agents/<id>.md`. |
| `forge-kit add-server <server-id>` | Registers a catalog MCP server with your local gateway. |
| `forge-kit setup <editor>` / `forge-kit setup --all` / `forge-kit setup --list` | Wire one or more editors' MCP configs to the local gateway. |
| `forge-kit doctor` | Verifies catalog + gateway + editor configs are healthy. |

### Per-editor aliases

Every adapter also has a dedicated command — identical to `forge-kit setup <editor>`, shorter to type:

| Alias | Editor | Writes |
|---|---|---|
| `forge-kit setup-claude` | Claude Code | `~/.claude/settings.json` |
| `forge-kit setup-claude-desktop` | Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) / `%APPDATA%/Claude/…` (Win) / `~/.config/Claude/…` (Linux) |
| `forge-kit setup-codex` | Codex CLI | `~/.codex/config.toml` |
| `forge-kit setup-cursor` | Cursor | `~/.cursor/mcp.json` |
| `forge-kit setup-gemini` | Gemini CLI | `~/.gemini/settings.json` |
| `forge-kit setup-windsurf` | Windsurf | `~/.codeium/windsurf/mcp_config.json` |

Every setup command:
- Merges into existing config (your other MCP servers are preserved).
- Writes a `.bak` of the previous file before overwriting.
- Uses `npx -y mcp-remote <gateway-url>` inline — no wrapper script, no repo clone required.

### Setup flags

- `--all` — install into every editor whose config directory already exists on disk (auto-detect).
- `--gateway-url <url>` — override gateway URL. Default: `http://127.0.0.1:4444`.
- `--server-uuid <uuid>` — skip the live gateway probe and hard-code the virtual-server UUID. Useful when running against a pinned or remote gateway.

## First-time setup

```bash
# 1. Start your local gateway (one-time)
git clone https://github.com/LucasSantana-Dev/forgekit
cd forgekit/infra/gateway
# create gateway/.env per gateway/README.md
docker compose up -d
python seeds/seed.py

# 2. Wire every installed editor
npx forge-kit setup --all

# 3. Browse + install
npx forge-kit list --kind skill
npx forge-kit install prompting-discipline
npx forge-kit doctor
```

## Data sources

- **Catalog index**: fetched from `main` branch on every run (cached under `~/.cache/forge-kit/`).
- **Running from inside a cloned repo**: local `packages/catalog/catalog/index.json` wins.

## License

MIT.
