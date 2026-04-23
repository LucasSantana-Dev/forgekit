# gateway/

Local, single-user MCP gateway stack. Runs `ghcr.io/ibm/mcp-context-forge`
bound to `127.0.0.1` only. Each friend runs their own instance.

## Quickstart

Create `gateway/.env` with the following (all values required, all local-only):

```dotenv
# openssl rand -hex 32
GATEWAY_ADMIN_TOKEN=REPLACE_ME_64_HEX_CHARS
# openssl rand -hex 32
JWT_SECRET=REPLACE_ME_64_HEX_CHARS
# Admin username (used with GATEWAY_ADMIN_TOKEN for basic auth)
ADMIN_USER=admin
# Port binding (already localhost-only in docker-compose.yml)
GATEWAY_PORT=4444
```

Then:

```bash
docker compose up -d
docker compose ps          # all healthy
docker compose logs -f gateway   # tail startup

# Seed servers from catalog/servers/*.yaml
pip install -r seeds/requirements.txt
python seeds/seed.py
```

Wire Claude Code:

```bash
npx forge-kit setup-claude
```

…or manually in `~/.claude/mcpServers`:

```json
{
  "library": {
    "command": "bash",
    "args": ["<repo>/gateway/scripts/mcp-wrapper.sh"],
    "env": {
      "MCP_CLIENT_SERVER_URL": "http://127.0.0.1:4444/servers/<virtual-server-uuid>/mcp",
      "MCP_GATEWAY_TOKEN": "<same as GATEWAY_ADMIN_TOKEN from .env>"
    }
  }
}
```

Virtual-server UUID is pinned in `seeds/virtual-server.yaml`.

## Port bindings (all localhost-only)

| Service   | Host       | Default port |
|-----------|------------|--------------|
| gateway   | 127.0.0.1  | 4444         |
| postgres  | 127.0.0.1  | 5433         |
| redis     | 127.0.0.1  | 6380         |

Never flip these to `0.0.0.0`. If you want remote access, front with Tailscale
or an SSH tunnel — do not expose the gateway directly.

## Troubleshooting

- **`seed.py` 401**: check `GATEWAY_ADMIN_TOKEN` / `ADMIN_USER` in `.env`.
- **gateway unhealthy**: `docker compose logs gateway` — usually DB migration needs a retry on first boot.
- **MCP Inspector connects but no tools**: check `/servers/<uuid>` vs `/gateways/<id>` — you want the virtual-server endpoint for bundled tools.

## Stop / wipe

```bash
docker compose down              # stop, keep volumes
docker compose down -v           # stop + delete postgres + redis data
```
