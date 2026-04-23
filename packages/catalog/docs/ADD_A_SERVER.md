# Contributing an MCP Server

A **Server** is an MCP server registered into the local gateway. Installing it means the gateway proxies its tools behind the single `library` virtual-server endpoint.

## 1. Write the YAML

`packages/catalog/catalog/servers/<id>.yaml` — one file per server.

### stdio (most common)

```yaml
id: my-server
name: My Server
description: One sentence on what tools it provides and when to reach for it.
transport: stdio
command: npx
args:
  - -y
  - "@scope/mcp-my-server"
env:
  - name: MY_SERVER_API_KEY
    description: How to get the key and what scopes it needs.
    required: true
tags:
  - category
  - domain
homepage: https://github.com/...
license: MIT
```

### sse / http

```yaml
id: my-http-server
name: My HTTP Server
description: ...
transport: sse   # or: http, streamable-http
url: https://example.com/mcp
tags: [...]
```

Schema: [`schemas/server.schema.json`](../schemas/server.schema.json).

## 2. Validate

```bash
pnpm --filter @forge-kit/catalog run validate
pnpm --filter @forge-kit/catalog run index
```

## 3. Smoke-test locally

```bash
cd infra/gateway
docker compose up -d          # if not already running
python seeds/seed.py          # registers your new server
```

Then in another shell:

```bash
npx forge-kit doctor
npx forge-kit add-server my-server
```

Verify the server appears in the gateway admin:

```bash
curl -u admin:$GATEWAY_ADMIN_TOKEN http://127.0.0.1:4444/gateways | jq '.[] | {id, name}'
```

## 4. Commit + PR

```
feat(catalog): add <my-server-id> server
```

## Tips

- **Never paste real tokens in the YAML.** Use the `env` section to declare them; users supply their own.
- **Set `required: true` on env vars the server will fail without.** Setting `default: <value>` gives a hint but doesn't auto-populate the user's env.
- **Prefer public, maintained servers.** Pin to a specific tag if the upstream is chaotic.
- **For Docker-based servers**, use `command: docker` + the full `run -i --rm ...` args. Avoid `image:` on stdio entries — the gateway doesn't run containers for you.
