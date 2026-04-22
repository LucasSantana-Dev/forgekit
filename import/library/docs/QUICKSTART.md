# Quickstart

Get your local stack running in ~5 minutes. Works on macOS and Linux; Windows users need WSL2.

## Prerequisites

- **Docker** (Docker Desktop or colima on macOS; `docker compose` v2 subcommand required)
- **Node 20+** (`node --version` ≥ 20.11)
- **pnpm 9+** (`corepack enable` or `npm i -g pnpm`)
- **Python 3.11+** with `pip` (only needed for the seed script)
- **OpenSSL** (for secret generation — preinstalled on macOS/Linux)

## 1. Clone + start the gateway

```bash
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit-library
cd ai-dev-toolkit-library/gateway
```

Create `gateway/.env`:

```dotenv
GATEWAY_ADMIN_TOKEN=<paste output of: openssl rand -hex 32>
JWT_SECRET=<paste output of: openssl rand -hex 32>
ADMIN_USER=admin
GATEWAY_PORT=4444
```

Start the stack:

```bash
docker compose up -d
docker compose ps      # all healthy
```

## 2. Seed MCP servers from the catalog

```bash
pip install -r seeds/requirements.txt
python seeds/seed.py
```

You should see `＋ registered context7`, `＋ registered github`, … and a line for the `library` virtual server.

## 3. Wire Claude Code

From the repo root:

```bash
cd ..
npx @lucassantana/adtl setup-claude
npx @lucassantana/adtl doctor
```

`doctor` should report all ✓. Restart Claude Code — you'll see tools from every registered server under the single `library` MCP entry.

## 4. Install a skill

```bash
npx @lucassantana/adtl list --kind skill
npx @lucassantana/adtl install prompting-discipline
```

The skill lands in `~/.claude/skills/prompting-discipline/` and Claude Code picks it up on the next session.

## 5. Browse the catalog

Open the [catalog site](https://library.lucassantana.tech) or run `npx @lucassantana/adtl list`.

## Troubleshooting

- **`doctor` says gateway unreachable** — `docker compose ps` in `gateway/`. If gateway is not `healthy`, check logs: `docker compose logs gateway`.
- **`seed.py` returns 401** — `GATEWAY_ADMIN_TOKEN` in `gateway/.env` doesn't match what the container is using. Recreate the stack: `docker compose down && docker compose up -d`.
- **`setup-claude` can't find the repo** — run it from inside a cloned `ai-dev-toolkit-library` directory.
- **Skill not showing up in Claude** — restart Claude Code fully; it scans `~/.claude/skills/` at session start.

## Uninstall

```bash
# Stop gateway + wipe data
cd gateway && docker compose down -v

# Remove installed skills
rm -rf ~/.claude/skills/<skill-id>

# Remove the MCP entry (keeps settings.json.bak)
# Open ~/.claude/settings.json and drop the "library" key.
```
