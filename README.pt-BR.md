[English](README.md) | [Português](README.pt-BR.md)

# Forge Kit

**Entregue mais rápido com IA: regras, skills e workflows testados em batalha para todos os principais agentes de código.**

[![Licença MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Última Release](https://img.shields.io/github/v/release/LucasSantana-Dev/forgekit)](https://github.com/LucasSantana-Dev/forgekit/releases)

**Funciona com:** Claude Code · Cursor · Windsurf · Codex · Copilot · Zed · VSCode · Kimi Code · OpenCode

**Navegue tudo em [forgekit.lucassantana.tech](https://forgekit.lucassantana.tech/)**: catálogo pesquisável de todas as skills, agentes, hooks, servidores MCP e coleções, com comando de instalação por entrada.

---

## Começo rápido

**Opção 1, um arquivo de regras (30 segundos).** Copie um arquivo de convenções para o seu projeto; o agente passa a segui-lo imediatamente:

```bash
git clone https://github.com/LucasSantana-Dev/forgekit.git && cd forgekit
cp packages/core/rules/CLAUDE.md ~/meu-projeto/CLAUDE.md   # Claude Code / OpenCode
```

Outras ferramentas: `.cursorrules` (Cursor), `.windsurfrules` (Windsurf), `AGENTS.md` (Codex), `COPILOT.md` (Copilot); todos em [`packages/core/rules/`](packages/core/rules/).

**Opção 2, instalar uma entrada do catálogo.** Encontre no [site do catálogo](https://forgekit.lucassantana.tech/) e rode:

```bash
npx forge-kit install <entry-id>
```

**Opção 3, toolkit completo (um comando).** Regras, skills, hooks e config MCP para cada ferramenta detectada:

```bash
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --profile standard
```

Flags (`--tools`, `--dry-run`, `--status`, `--uninstall`), perfis e o wizard interativo (`setup.sh`) estão no [guia de instalação](docs/guides/installing.md).

---

## O que tem dentro

| Componente | Qtde | Navegar |
| --- | --- | --- |
| Skills | 111 | [catálogo](https://forgekit.lucassantana.tech/skills/) · [`packages/catalog/catalog/skills/`](packages/catalog/catalog/skills/) |
| Hooks | 27 | [catálogo](https://forgekit.lucassantana.tech/hooks/) |
| Agentes | 22 | [catálogo](https://forgekit.lucassantana.tech/agents/) |
| Servidores MCP | 22 | [catálogo](https://forgekit.lucassantana.tech/servers/) |
| Coleções | 21 | [catálogo](https://forgekit.lucassantana.tech/collections/) |
| Padrões de playbook | 21 | [`packages/core/patterns/`](packages/core/patterns/) |
| Ferramentas | 14 | [catálogo](https://forgekit.lucassantana.tech/tools/) |
| Arquivos de regras drop-in | 5 | [`packages/core/rules/`](packages/core/rules/) |

Tudo com tradução pt-BR ([`locales/pt-BR/`](locales/pt-BR/)).

---

## Como funciona

```
forgekit/
├── apps/web              # Site do catálogo (Astro)
├── packages/catalog      # Fonte do catálogo + validação
├── packages/cli          # CLI forge-kit
├── packages/setup        # Bootstrap de máquina
├── packages/core         # Regras, skills, padrões, agentes, instalador do kit
└── locales/pt-BR         # Espelho em português
```

Agentes executam em fases com gates (`PLAN → IMPLEMENT → VERIFY → REVIEW → SECURE → COMMIT`), corrigindo lint/tipos/testes sozinhos e sempre pausando para ações destrutivas (deploys, migrations, force push). Agentes especialistas roteiam por domínio e referenciam *tiers* de modelo (`haiku`/`sonnet`/`opus`), permitindo trocar de provider sem tocar nas definições. Detalhes: [primitives](docs/guides/primitives.md) · [agents vs skills](docs/guides/agents-vs-skills.md) · [tool matrix](docs/guides/tool-matrix.md).

---

## Guias

- **Novo por aqui:** [começo em 10 minutos](docs/guides/ten-minute-start.md) · [escolha sua primeira ferramenta](docs/guides/pick-your-first-tool.md) · [getting started](docs/guides/getting-started.md)
- **Adotando:** [trilha iniciante](docs/guides/adoption-beginner.md) · [trilha avançada](docs/guides/adoption-advanced.md) · [para times](docs/guides/for-teams.md)
- **Operando:** [instalação](docs/guides/installing.md) · [modelos locais](docs/guides/local-models.md) · [servidores MCP](docs/guides/mcp-servers.md) · [higiene de segredos](docs/guides/secret-hygiene.md)
- **Mantendo este repo:** [manutenção e quality gates](docs/guides/maintenance.md) · [troubleshooting](docs/guides/troubleshooting.md)

---

## Herança do ecossistema

O Forge Kit consolida quatro repos antes separados; os aposentados ficam arquivados como somente-leitura com um ponteiro de volta para cá.

| Repo | Agora vive em | Status |
| --- | --- | --- |
| `ai-dev-toolkit` | este repo | Renomeado para `forgekit` em 2026-04-25 |
| [`ai-dev-toolkit-library`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-library) | `packages/catalog`, `packages/cli`, `apps/web`, `infra/gateway` | Arquivado em 2026-08-13 (commit pré-arquivamento `8d9ead5`) |
| [`ai-dev-toolkit-setup`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup) | `packages/setup` | Ainda não arquivado |
| [`ai-dev-toolkit-pt-br`](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br) | `locales/pt-BR` | Ainda não arquivado |

---

## Contribuindo

Áreas de alto impacto: implementações de referência, refinamento de padrões, melhorias de adapters e docs/traduções. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licença

[MIT](LICENSE) · Mais contexto: [`CONTEXT.md`](CONTEXT.md) · [`CHANGELOG.md`](CHANGELOG.md) · [`BACKLOG.md`](BACKLOG.md)
