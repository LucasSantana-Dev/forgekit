---
status: active
audience: contributors
reading_time: 12 min
---

# Catalog schema reference

Every entry in the Forge Kit catalog is validated against a JSON schema in
`packages/catalog/schemas/`. The validator is `scripts/validate-catalog.ts`;
CI runs it on every PR via the **Validate catalog, CLI, and web** job.

This page is the canonical field-by-field reference. When the schemas and this
page disagree, **the schema wins** — open an issue so we can fix the doc.

## Kinds at a glance

| Kind | Source format | Where it lives | Rendered at |
|---|---|---|---|
| **skill** | `manifest.json` + `SKILL.md` body | `packages/catalog/catalog/skills/<id>/` | `/skills/<id>/` |
| **server** | single `.yaml` | `packages/catalog/catalog/servers/` | `/servers/<id>/` |
| **agent** | `.md` with YAML frontmatter | `packages/catalog/catalog/agents/` | `/agents/<id>/` |
| **hook** | `manifest.json` + script (`.sh` / `.py`) | `packages/catalog/catalog/hooks/<id>/` | `/hooks/<id>/` |
| **command** | `manifest.json` + `command.md` body | `packages/catalog/catalog/commands/<id>/` | `/commands/<id>/` |
| **tool** | `manifest.json` + script file | `packages/catalog/catalog/tools/<id>/` | `/tools/<id>/` |
| **doc** | `.md` with YAML frontmatter | `packages/catalog/catalog/docs/` | `/docs/<id>/` |
| **collection** | single `.yaml` | `packages/catalog/catalog/collections/` | `/collections/<id>/` |

Every kind accepts `translations.pt-BR` overrides on user-visible fields.
Every kind has `additionalProperties: false` — **unknown fields fail validation**.

## Shared fields (present on every kind)

### `id` (required)
Slug, lowercase, hyphen-separated, 2–64 chars. Pattern: `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.
This is the URL segment and the collection-reference key. Never rename; deprecate instead.

### `name` (required on most kinds; `title` on docs)
User-visible display name, 1–120 chars. Gets localized via `translations.pt-BR.name`.

### `description` (required)
One-sentence summary, max 500 chars. Shown on cards and list pages. Should:

- Lead with **what it does**, not what it is.
- Name the **target situation**.
- Avoid internal jargon a new contributor wouldn't know.

### `version` (required on skill/agent/hook/command/tool)
Semver: `^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$`. Not required on `server` (upstream version
owned by the upstream repo) or on `doc`/`collection`.

### `tags` (required, 1–16 items, unique)
Short discovery keywords. Pattern: `^[a-z0-9][a-z0-9-]*$`. Keep them reader-oriented
("debugging", "pre-merge") over implementation-oriented ("bash", "nodejs").

### `deprecated` (optional, boolean, default false)
Hides the entry from curation and marks it deprecated on the detail page.
Do not delete entries — deprecate.

### `source` (optional)
Where the original material lives so contributors can trace it.

```json
"source": {
  "type": "git|local|vendored",
  "repo": "https://github.com/.../",
  "ref": "main",
  "path": "some/path/in/repo"
}
```

### `homepage`, `license`, `author` (optional)
URL, SPDX-ish short string, up to 128 chars respectively.

### `translations` (optional)
Locale-specific overrides. Only `pt-BR` is wired today.

```yaml
translations:
  pt-BR:
    name: Override in Portuguese
    description: Same idea, Portuguese wording.
```

## Shared optional block: `usage`

Present on skill / server / agent / hook / tool. **All fields optional.** Purpose:
tell a reader *when* to reach for this entry and what it costs, without forcing
them to read the whole body.

```yaml
usage:
  use_when: One sentence — the situation that should make a reader pick this.
  skip_when: One sentence — when this is NOT the right fit.
  prerequisites:
    - Up to 8 short strings (≤ 200 chars each)
  resources:
    ram: "≤ 40 chars free-form (e.g. '512 MB', 'negligible')"
    storage: "≤ 40 chars free-form"
    compute: cpu-light    # cpu-light | cpu-moderate | cpu-heavy | gpu-optional | gpu-required
    network: online       # offline | online | online-optional
    cost: free            # free | paid-optional | paid-required | metered-api
  install_difficulty: easy   # easy | medium | hard
  time_to_setup: seconds     # seconds | minutes | hours
  good_for:
    - Up to 8 short concrete situations (≤ 120 chars each)
```

The webapp renders this as a "Usage" section on the entry detail page with two
coloured callout cards (use/skip), a chip row, and a resource table. Missing
entirely = section doesn't render.

## Kind-specific fields

### `skill`

- **`editors`** — which editors the skill applies to. Allowed values:
  `claude-code, claude-api, claude-ai, codex, cursor, windsurf, opencode,
  gemini, github-copilot, antigravity`. Empty or omitted = generic across editors.
- **`install`** — destination directory and post-install commands:
  ```json
  "install": {
    "copy_to": "~/.claude/skills/<id>/",   // default shown
    "post_install": ["up to 8 idempotent shell commands"]
  }
  ```

### `server`

- **`transport`** (required) — `stdio | sse | http | streamable-http`.
- **Conditional requireds** (enforced via `allOf`):
  - `transport = stdio` → `command` required.
  - `transport = sse | http | streamable-http` → `url` required.
- **`command` + `args`** — executable + argv for stdio (`npx`, `uvx`, `docker`, etc.).
- **`url`** — upstream endpoint for network transports.
- **`image`** — OCI image reference for dockerized servers.
- **`env`** — environment variables to pass in:
  ```yaml
  env:
    - name: UPPER_SNAKE_CASE_NAME
      description: Human-readable why.
      required: true
      default: optional-fallback
  ```

### `agent`

- **`model`** — model ID (e.g. `claude-opus-4-7`, `claude-sonnet-4-6`).
- **`level`** — 1–5, autonomy/permission tier if the upstream source uses one.
- **`disallowed_tools`** — array of tool names the sub-agent must not call
  (defence-in-depth; the host is expected to enforce).

### `hook`

- **`event`** (required) — one of `PreToolUse, PostToolUse, UserPromptSubmit, Stop,
  SubagentStop, Notification, PreCompact, PostCompact, SessionStart, SessionEnd, any`.
- **`matcher`** — tool-scope filter for tool-targeted hooks (e.g. `"Bash"`,
  `"Write|Edit"`). Up to 200 chars.
- **`runtime`** — `bash | zsh | sh | python`; defaults to `bash`.
- **`install`** — destination path + exec bit:
  ```json
  "install": { "copy_to": "~/.claude/hooks/<id>.sh", "chmod_exec": true }
  ```

### `command`

- **`category`** — free-form short tag grouping commands on list pages.
- **`argument_hint`** — one-line hint for `/command <args>` usage.

### `tool`

- **`runtime`** (required) — `bash | zsh | sh | python | node | go | rust | other`.
- **`category`** (required) — one of `token-optimization, rag, compression,
  observability, benchmarking, mcp-ops, setup, release, diagnostics, training,
  general`.
- **`install.dependencies`** — up to 10 strings (`"python>=3.11"`, etc.).

> **Note — legacy `usage` string on tools.** Older entries used `usage: "one-line
> invocation string"`. That string form is deprecated in favour of the richer
> `usage` object shared across kinds. New entries should use the object.

### `doc`

- **`body`** — the markdown content (stripped before schema validation; present
  on the loader object for rendering).
- **`source.upstream`** / **`source.license`** — for vendored external material.

### `collection`

- **`items`** (required) — array of `{ kind, id }` references. Current main accepts
  `kind: skill | server | doc`; PR #100 extends this to all seven content kinds.
- Collection items must reference an existing catalog entry — cross-references
  are validated by the same script that validates the schemas.

## Validation in practice

Local loop:

```bash
pnpm --filter @forge-kit/catalog run validate
# ✅ catalog valid: {"skills":100,...}
```

CI job: `.github/workflows/*` calls the same command. A failed validation blocks
merge. The validator prints `❌ <kind> <id> (<path>)` plus the Ajv error trace,
so most failures are a copy-paste fix.

Common failure modes:

- **`additionalProperties` violation** — you added a field the schema doesn't
  know about. Either update the schema (with tests + docs) or move the field
  into `usage` / the markdown body.
- **Broken collection reference** — the ID you listed doesn't exist as a
  catalog entry. Either create it, fix the ID, or remove the item.
- **Duplicate id across files** — the `idSeen` map catches these. Rename the
  new file; don't delete the old.

## See also

- **[Authoring a skill](./authoring-a-skill.md)** — end-to-end for adding a new skill.
- **[Authoring a hook](./authoring-a-hook.md)** — event semantics + matcher examples.
- **[MCP servers](./mcp-servers.md)** — transport choice, gateway model, secrets.
- **[Primitives](./primitives.md)** — Rules / Skills / Agents / Hooks decision tree.
