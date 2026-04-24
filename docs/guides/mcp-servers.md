---
status: active
audience: contributors
reading_time: 9 min
---

# MCP servers in Forge Kit

**MCP** (Model Context Protocol) is the open standard Claude and other agents use to
reach tools outside their sandbox — file systems, databases, GitHub, Sentry, etc.
Forge Kit curates MCP servers as catalog entries and runs them through a single
local gateway so agents see one endpoint instead of a dozen.

This guide covers the curator-side concerns: **transport choice**, **gateway model**,
**secrets**, **how to add a new server**, and **how to troubleshoot one that's
misbehaving**.

If you're just looking for available servers, browse `/servers/` on the site.

## The one-gateway model

```
┌──────────────┐        ┌────────────────────────┐
│ Claude /     │        │ Local mcp-context-forge │
│ Codex / etc. │ ◀────▶ │ gateway (127.0.0.1)     │ ◀────▶  upstream MCP servers
└──────────────┘        └────────────────────────┘
```

- The gateway binds to **`127.0.0.1` only**. Never `0.0.0.0`. Never exposed to the
  internet. MCP servers touch personal secrets (GitHub tokens, Sentry keys,
  database credentials) — the blast radius of a mis-bound gateway is too large
  to accept.
- Each user runs their own gateway. The **catalog is shared; runtime is personal.**
- The gateway aggregates everything behind one URL, so `settings.json` needs one
  entry, not one per server.
- Infrastructure lives at `infra/gateway/` (docker-compose + seeds).

## Transport: which one and when

| Transport | When to pick it | Example |
|---|---|---|
| **`stdio`** | Local CLI / npx / uvx / docker binary | `@upstash/context7-mcp` via `npx` |
| **`sse`** | Remote server that streams events over HTTP | legacy remote MCP deployments |
| **`http`** | Plain remote HTTP MCP | rare, being superseded by streamable-http |
| **`streamable-http`** | Current standard for remote MCP servers | most cloud-hosted MCPs in 2026 |

Default: prefer `stdio` for anything that can run locally. It avoids network round
trips, doesn't need auth bootstrapping, and you can `kill -9` it if it goes bad.
Only reach for a network transport when the upstream publishes one and a local
binary doesn't exist.

Schema enforces:
- `stdio` ⇒ `command` required, `args` optional.
- `sse | http | streamable-http` ⇒ `url` required.

See the transport rules in `packages/catalog/schemas/server.schema.json` (the
`allOf` block at the bottom).

## Adding a new server

Lifecycle: **one file**, one PR.

### 1. Create `packages/catalog/catalog/servers/<slug>.yaml`

```yaml
id: my-server             # slug, unique, matches URL
name: My Server
description: One sentence — what it does and when to reach for it.
transport: stdio
command: npx
args:
  - -y
  - "@someorg/my-server-mcp"
tags:
  - documentation
  - research
env:
  - name: MY_SERVER_API_KEY
    description: Personal API key for my-server.
    required: true
homepage: https://my-server.example.com
license: MIT
usage:
  use_when: The agent needs to pull live X data from my-server to answer accurately.
  skip_when: The task is local-only — skip the network dependency.
  prerequisites:
    - MY_SERVER_API_KEY set in environment
  resources:
    cost: paid-optional
    network: online
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - answering recent X questions
    - avoiding stale docs from training data
translations:
  pt-BR:
    name: My Server
    description: Uma frase em português.
```

### 2. Validate locally

```bash
pnpm --filter @forge-kit/catalog run validate
```

If validation fails, read the Ajv error — it points at the exact path.

### 3. (Optional) Add it to a collection

If your server pairs naturally with existing catalog items for a specific
workflow, add it to (or create) a `packages/catalog/catalog/collections/*.yaml`:

```yaml
items:
  - { kind: server, id: my-server }
  - { kind: skill,  id: adt-context }
```

### 4. Open a PR

The `Validate catalog, CLI, and web` job re-runs validation and
the web build, proving the detail page renders.

## Secrets: what's allowed in the catalog

**Zero secrets in catalog YAML/JSON.** Ever.

- `env[].name` is the variable name, not the value.
- `env[].default` is for non-secret defaults like a port or a public URL. Never
  put a real credential here.
- The importer runs a secrets scan; CI runs **TruffleHog + GitGuardian + Semgrep**.
  A leaked credential will block the PR and needs to be rotated, not just
  scrubbed from the diff.

Secrets live in the *user's* local `.env`, read by the gateway at runtime.
`infra/gateway/.env.example` documents the variables each server expects.

## Troubleshooting

### "The agent can't see the tool"

1. Is the server configured in your local gateway?
   ```bash
   docker compose -f infra/gateway/docker-compose.yml ps
   ```
2. Is the gateway reachable from the agent?
   ```bash
   curl http://127.0.0.1:<gateway-port>/health
   ```
3. Does the server actually start?
   ```bash
   docker compose -f infra/gateway/docker-compose.yml logs <service>
   ```

### "Tools are stale / partially registered"

Run the `mcp-health` tool:

```bash
mcp-health --all
```

It iterates every configured server, calls `list-tools`, and reports servers
that failed auth, returned zero tools, or timed out.

See also the **[mcp-ops-and-recovery](../../packages/catalog/catalog/collections/mcp-ops-and-recovery.yaml)**
collection (PR #100) — it bundles the diagnostic skills and servers for
exactly this situation.

### "The server I need doesn't exist yet"

Two options:

1. **Vendor an upstream MCP implementation** as a catalog entry and open a PR.
2. **Write a thin MCP server** wrapping the API you care about. Keep it in your
   personal repo first; promote to the catalog once a second person needs it.

Don't add one-off servers to the shared catalog — the curation signal erodes.

## Security model, briefly

- Gateway bound to `127.0.0.1`.
- Secrets live in user-local `.env`, never in the catalog.
- No catalog entry executes on import — the validator only parses the schema.
- CI blocks on secret leaks, schema violations, and any shell script that
  fails shellcheck.
- Each user's gateway is their blast radius. If a malicious upstream MCP
  leaks a token, the damage is to that user's personal credentials — not
  the catalog or other users.

## See also

- **[Catalog schema reference](./catalog-schema-reference.md)** — every field
  on the server schema with examples.
- **[Authoring a hook](./authoring-a-hook.md)** — pair an MCP server with a
  hook that sanity-checks its output.
- **[Primitives](./primitives.md)** — where servers fit in the four-primitive
  model.
