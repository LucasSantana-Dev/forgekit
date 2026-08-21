[English](README.md) | [Português](README.pt-BR.md)

# Forge Kit

**Ship faster with AI: battle-tested rules, skills, and workflows for every major coding agent.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/LucasSantana-Dev/forgekit)](https://github.com/LucasSantana-Dev/forgekit/releases)

**Works with:** Claude Code · Cursor · Windsurf · Codex · Copilot · Zed · VSCode · Kimi Code · OpenCode

**Browse everything at [forgekit.lucassantana.tech](https://forgekit.lucassantana.tech/)**: searchable catalog of every skill, agent, hook, MCP server, and collection, with per-entry install commands.

---

## Quick start

**Option 1, one rule file (30 seconds).** Copy a convention file into your project; your agent follows it immediately:

```bash
git clone https://github.com/LucasSantana-Dev/forgekit.git && cd forgekit
cp packages/core/rules/CLAUDE.md ~/my-project/CLAUDE.md   # Claude Code / OpenCode
```

Other tools: `.cursorrules` (Cursor), `.windsurfrules` (Windsurf), `AGENTS.md` (Codex), `COPILOT.md` (Copilot); all in [`packages/core/rules/`](packages/core/rules/).

**Option 2, install a single catalog entry.** Find it on the [catalog site](https://forgekit.lucassantana.tech/), then:

```bash
npx forge-kit install <entry-id>
```

**Option 3, full toolkit (one command).** Rules, skills, hooks, and MCP config for every detected tool:

```bash
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --profile standard
```

Flags (`--tools`, `--dry-run`, `--status`, `--uninstall`), profiles, and the interactive wizard (`setup.sh`) are covered in the [install guide](docs/guides/installing.md).

---

## What's inside

| Component | Count | Browse |
| --- | --- | --- |
| Skills | 111 | [catalog](https://forgekit.lucassantana.tech/skills/) · [`packages/catalog/catalog/skills/`](packages/catalog/catalog/skills/) |
| Hooks | 27 | [catalog](https://forgekit.lucassantana.tech/hooks/) |
| Agents | 22 | [catalog](https://forgekit.lucassantana.tech/agents/) |
| MCP servers | 22 | [catalog](https://forgekit.lucassantana.tech/servers/) |
| Collections | 21 | [catalog](https://forgekit.lucassantana.tech/collections/) |
| Playbook patterns | 21 | [`packages/core/patterns/`](packages/core/patterns/) |
| Tools | 14 | [catalog](https://forgekit.lucassantana.tech/tools/) |
| Drop-in rule files | 5 | [`packages/core/rules/`](packages/core/rules/) |

Everything ships with pt-BR translations ([`locales/pt-BR/`](locales/pt-BR/)).

---

## How it works

```
forgekit/
├── apps/web              # Astro catalog site
├── packages/catalog      # Catalog source + validation
├── packages/cli          # forge-kit CLI
├── packages/setup        # Machine bootstrap
├── packages/core         # Rules, skills, patterns, agents, kit installer
└── locales/pt-BR         # Portuguese mirror
```

Agents execute in gated phases (`PLAN → IMPLEMENT → VERIFY → REVIEW → SECURE → COMMIT`), auto-fixing lint/type/test failures, and always pausing for destructive actions (deploys, migrations, force pushes). Specialist agents route by domain and reference model *tiers* (`haiku`/`sonnet`/`opus`), so you can swap providers without touching definitions. Details: [primitives](docs/guides/primitives.md) · [agents vs skills](docs/guides/agents-vs-skills.md) · [tool matrix](docs/guides/tool-matrix.md).

---

## Guides

- **New here:** [10-minute start](docs/guides/ten-minute-start.md) · [pick your first tool](docs/guides/pick-your-first-tool.md) · [getting started](docs/guides/getting-started.md)
- **Adopting:** [beginner path](docs/guides/adoption-beginner.md) · [advanced path](docs/guides/adoption-advanced.md) · [for teams](docs/guides/for-teams.md)
- **Operating:** [installing](docs/guides/installing.md) · [local models](docs/guides/local-models.md) · [MCP servers](docs/guides/mcp-servers.md) · [secret hygiene](docs/guides/secret-hygiene.md)
- **Maintaining this repo:** [maintenance & quality gates](docs/guides/maintenance.md) · [troubleshooting](docs/guides/troubleshooting.md)

---

## Ecosystem heritage

Forge Kit consolidates four formerly-separate repos; retired ones are archived read-only with a pointer back here.

| Repo | Now lives at | Status |
| --- | --- | --- |
| `ai-dev-toolkit` | this repo | Renamed to `forgekit` on 2026-04-25 |
| [`ai-dev-toolkit-library`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-library) | `packages/catalog`, `packages/cli`, `apps/web`, `infra/gateway` | Archived 2026-08-13 (pre-archive commit `8d9ead5`) |
| [`ai-dev-toolkit-setup`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup) | `packages/setup` | Not yet archived |
| [`ai-dev-toolkit-pt-br`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br) | `locales/pt-BR` | Not yet archived |

---

## Contributing

High-impact areas: reference implementations, pattern refinements, adapter improvements, and docs/translations. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

[MIT](LICENSE) · More context: [`CONTEXT.md`](CONTEXT.md) · [`CHANGELOG.md`](CHANGELOG.md) · [`BACKLOG.md`](BACKLOG.md)
