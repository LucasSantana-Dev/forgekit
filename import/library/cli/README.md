# @lucassantana/adtl

CLI for [ai-dev-toolkit-library](https://github.com/LucasSantana-Dev/ai-dev-toolkit-library) —
browse Skills and MCP servers, install them into Claude Code, and wire up your local MCP gateway.

## Install

No install needed:

```bash
npx @lucassantana/adtl <command>
```

Or globally:

```bash
npm i -g @lucassantana/adtl
adtl <command>
```

## Commands

| Command | What it does |
|---|---|
| `adtl list [--kind K] [--tag T] [query]` | Browse the catalog. |
| `adtl search <query>` | Alias for `list`. |
| `adtl install <skill-id> [--force]` | Copies a skill to `~/.claude/skills/<id>/`. |
| `adtl add-server <server-id>` | Registers a catalog MCP server with your local gateway. |
| `adtl setup-claude` | Wires `~/.claude/settings.json` to your local gateway. |
| `adtl doctor` | Verifies catalog + gateway + Claude home are healthy. |

## First-time setup

```bash
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit-library
cd ai-dev-toolkit-library/gateway

# create gateway/.env (see gateway/README.md), then:
docker compose up -d
python seeds/seed.py

cd ..
npx @lucassantana/adtl setup-claude
npx @lucassantana/adtl doctor      # all green = ready
```

## Data sources

- Catalog index: fetched from `main` branch on every run (cached under `~/.cache/adtl/`).
- When run from inside a cloned repo, local `catalog/index.json` wins.

## License

MIT.
