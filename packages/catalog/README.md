# Forge Kit catalog

A curated catalog of **Skills** and **MCP servers** for AI-assisted development,
fronted by a single local MCP gateway and a Cloudflare-hosted web catalog.
Inspired by [skills.sh] and [mcpmarket.com].

Free, open-source (MIT for the code), invite-friendly. Each person runs their
own gateway locally — the catalog is shared, the runtime is not.

[skills.sh]: https://skills.sh
[mcpmarket.com]: https://app.mcpmarket.com

---

## What's here

- **`catalog/`** — the shared catalog
  - `skills/` — actionable procedures, Claude-skill format
  - `servers/` — MCP server definitions (stdio / sse / http)
  - `collections/` — opinionated bundles
  - `docs/` — reference material (no install verb)
- **`README.md`** — package overview and quickstart.
- **`../cli/`** — `forge-kit`: `list`, `search`, `install`, `add-server`, `setup-claude`, `doctor`.
- **`../../apps/web/`** — Astro static site deployed on Cloudflare Workers.
- **`../../infra/gateway/`** — docker-compose for a local [mcp-context-forge] gateway that aggregates every registered MCP server behind one endpoint.
- **`schemas/`** — JSON schemas for all catalog kinds.
- **`scripts/`** — validators + importers.

[mcp-context-forge]: https://github.com/IBM/mcp-context-forge

---

## Quickstart

```bash
# 1. Run your local gateway
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit
cd ai-dev-toolkit/infra/gateway
cp .env.example .env
# edit .env: generate GATEWAY_ADMIN_TOKEN + JWT_SECRET with `openssl rand -hex 32`
docker compose up -d
python seeds/seed.py

# 2. Wire Claude Code
npx forge-kit setup-claude

# 3. Browse the catalog
open https://forgekit.lucassantana.tech

# 4. Install a skill / register a server
npx forge-kit install <slug>
npx forge-kit add-server <slug>
```

See [`docs/QUICKSTART.md`](docs/QUICKSTART.md) for the full walkthrough and
[`docs/ADD_A_SKILL.md`](docs/ADD_A_SKILL.md) / [`docs/ADD_A_SERVER.md`](docs/ADD_A_SERVER.md) to contribute.

---

## Usage metadata

Every skill, server, agent, hook, and tool can carry an optional `usage` block
that tells a reader *when* to reach for it, what it costs, and what it needs.
Not required — but the more entries declare it, the more useful the catalog is
to someone new. Schema lives in each `schemas/<kind>.schema.json`.

Minimal example (YAML for a server; same shape as JSON in a skill/tool manifest):

```yaml
usage:
  use_when: One sentence — the situation that should make a reader pick this entry.
  skip_when: One sentence — when this is NOT the right fit.
  prerequisites:
    - Node.js 20+
    - Outbound HTTPS to the target backend
  resources:
    ram: "< 256 MB"
    storage: negligible       # free-form string, keep short
    compute: cpu-light        # cpu-light | cpu-moderate | cpu-heavy | gpu-optional | gpu-required
    network: online           # offline | online | online-optional
    cost: free                # free | paid-optional | paid-required | metered-api
  install_difficulty: easy    # easy | medium | hard
  time_to_setup: seconds      # seconds | minutes | hours
  good_for:
    - one-line tag of a concrete situation
    - another concrete situation
```

See `catalog/servers/context7.yaml`, `catalog/skills/adt-context/manifest.json`,
`catalog/tools/mcp-health/manifest.json`, and `catalog/agents/adt-code-reviewer.md`
for worked examples. The web app renders the block as a "Usage" section on each
entry's detail page.

---

## Design principles

1. **Curate, don't rebuild.** We consume `mcp-context-forge` as a Docker image.
2. **Shared catalog, personal gateway.** MCP tools touch personal secrets — each user runs their own.
3. **Gateway binds to `127.0.0.1` only.** Never `0.0.0.0`.
4. **Skills ship procedure, docs ship reference.** If it has an install verb, it's a Skill.
5. **Secrets never enter the catalog.** The importer has a blocking secrets scan.

Migration plan: [`../../docs/specs/2026-04-22-toolkit-monorepo-rebrand/spec.md`](../../docs/specs/2026-04-22-toolkit-monorepo-rebrand/spec.md).

---

## License

MIT (see [`LICENSE`](LICENSE)). Catalog entries that vendor third-party code
preserve their upstream licenses under `catalog/<kind>/<id>/LICENSE.<upstream>`.
