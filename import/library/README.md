# ai-dev-toolkit-library

A curated catalog of **Skills** and **MCP servers** for AI-assisted development,
fronted by a single local MCP gateway. Inspired by [skills.sh] and [mcpmarket.com].

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
- **`gateway/`** — docker-compose for a local [mcp-context-forge] gateway that aggregates every registered MCP server behind one endpoint
- **`cli/`** — `@lucassantana/adtl`: `list`, `search`, `install`, `add-server`, `setup-claude`, `doctor`
- **`web/`** — Astro static site that browses the catalog ([published on GH Pages])
- **`schemas/`** — JSON schemas for all catalog kinds
- **`scripts/`** — validators + importers

[mcp-context-forge]: https://github.com/IBM/mcp-context-forge
[published on GH Pages]: https://library.lucassantana.tech

---

## Quickstart

```bash
# 1. Run your local gateway
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit-library
cd ai-dev-toolkit-library/gateway
cp .env.example .env
# edit .env: generate GATEWAY_ADMIN_TOKEN + JWT_SECRET with `openssl rand -hex 32`
docker compose up -d
python seeds/seed.py

# 2. Wire Claude Code
npx @lucassantana/adtl setup-claude

# 3. Browse the catalog
open https://library.lucassantana.tech

# 4. Install a skill / register a server
npx @lucassantana/adtl install <slug>
npx @lucassantana/adtl add-server <slug>
```

See [`docs/QUICKSTART.md`](docs/QUICKSTART.md) for the full walkthrough and
[`docs/ADD_A_SKILL.md`](docs/ADD_A_SKILL.md) / [`docs/ADD_A_SERVER.md`](docs/ADD_A_SERVER.md) to contribute.

---

## Design principles

1. **Curate, don't rebuild.** We consume `mcp-context-forge` as a Docker image.
2. **Shared catalog, personal gateway.** MCP tools touch personal secrets — each user runs their own.
3. **Gateway binds to `127.0.0.1` only.** Never `0.0.0.0`.
4. **Skills ship procedure, docs ship reference.** If it has an install verb, it's a Skill.
5. **Secrets never enter the catalog.** The importer has a blocking secrets scan.

Full plan: [`.claude/plans/PLAN.md`](.claude/plans/PLAN.md).

---

## License

MIT (see [`LICENSE`](LICENSE)). Catalog entries that vendor third-party code
preserve their upstream licenses under `catalog/<kind>/<id>/LICENSE.<upstream>`.
