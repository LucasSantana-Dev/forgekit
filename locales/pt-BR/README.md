[English](https://github.com/LucasSantana-Dev/forgekit) | [Português](README.md)

# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/LucasSantana-Dev/forgekit)](https://github.com/LucasSantana-Dev/forgekit/releases)

Patterns reutilizáveis, regras prontas para usar, skills portáveis e automação de setup multiplataforma para que agentes AI de codificação produzam código alinhado com seu projeto desde a primeira sessão.

## Primeira instalação?

A maioria dos usuários deve começar com **[ai-dev-toolkit-setup](https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup)** — a camada de bootstrap de máquina que consome este toolkit em uma versão fixada. Ela detecta suas ferramentas instaladas, aplica configurações pré-construídas e instala todo o conjunto de skills e regras em um comando. Veja o repositório de setup para instruções de instalação específicas da plataforma.

## Como começar?

Copie um arquivo de rule para seu projeto. Esse arquivo único oferece a seu agente AI suas convenções, fluxo de trabalho e guardrails antes do primeiro prompt.

```bash
# Clone the toolkit
git clone https://github.com/LucasSantana-Dev/forgekit.git
cd forgekit

# Copy the rule file that matches your tool
cp rules/CLAUDE.md    ~/my-project/CLAUDE.md       # Claude Code / OpenCode
cp rules/AGENTS.md    ~/my-project/AGENTS.md       # Codex CLI
cp rules/.cursorrules ~/my-project/.cursorrules     # Cursor
cp rules/.windsurfrules ~/my-project/.windsurfrules # Windsurf
cp rules/COPILOT.md   ~/my-project/COPILOT.md      # GitHub Copilot
```

Abra sua ferramenta AI em `~/my-project/`. O agente agora segue suas regras automaticamente.

## Como instalar tudo de uma vez com forge-kit?

`forge-kit` detecta suas ferramentas, sincroniza regras, instala 29 skills portáveis, mescla servidores MCP e configura registros de providers — tudo em um comando.

```bash
# Auto-detect installed tools and apply standard profile
FORGE_KIT_DIR=./kit sh kit/install.sh --profile standard

# Target specific tools with a specific profile
FORGE_KIT_DIR=./kit sh kit/install.sh \
  --tools claude-code,codex,opencode \
  --profile standard
```

Visualize o que será alterado antes de confirmar:

```bash
# Dry run — shows exactly what would be created, updated, or skipped
FORGE_KIT_DIR=./kit sh kit/install.sh --tools all --profile standard --dry-run

# Show what forge-kit has installed
FORGE_KIT_DIR=./kit sh kit/install.sh --status

# Remove all forge-kit managed files
FORGE_KIT_DIR=./kit sh kit/install.sh --uninstall
```

### Como usar o assistente interativo de setup?

O assistente guia você através da seleção de provider, cadeias de fallback, otimização de token e preferências de autonomia — então gera uma configuração `.forge-setup.json` com mapas de model resolvidos.

```bash
# Run the interactive setup wizard
sh kit/setup.sh
# Follow prompts to select provider, fallback, optimization preset, and profile
# Output: .forge-setup.json with resolved model maps and agent assignments
```

Ele solicita:

- Primary AI provider (Anthropic, OpenAI, Google, OpenRouter, Ollama)
- Fallback provider
- Local model usage (hybrid cloud + local)
- Token optimization preset (standard, aggressive, minimal)
- Install profile and orchestration preferences

## Que patterns estão incluídos?

16 playbooks agnósticos de ferramentas cobrindo o ciclo de vida completo do desenvolvimento assistido por IA:

| Pattern                                                        | Quando você precisa dele                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| [Context Building](patterns/context-building.md)               | Agentes adivinham em vez de encontrar conhecimento do projeto    |
| [Task Orchestration](patterns/task-orchestration.md)           | Trabalho multi-passo precisa de menos supervisão               |
| [Code Review](patterns/code-review.md)                         | Capturando bugs, defetos de lógica e problemas de segurança    |
| [Testing with AI](patterns/testing.md)                         | Geração de teste de maior valor e fluxos TDD                   |
| [Multi-Model Routing](patterns/multi-model-routing.md)         | Reduzindo custo roteando tarefas baratas para modelos baratos   |
| [Memory Systems](patterns/memory-systems.md)                   | Decisões persistindo entre sessões                             |
| [Session Management](patterns/session-management.md)           | Sessões paralelas conflitando ou perdendo contexto             |
| [Prompt Engineering](patterns/prompt-engineering.md)           | Respostas de agente inconsistentes ou imprecisas              |
| [Git Worktrees](patterns/git-worktrees.md)                     | Isolando tarefas simultâneas em branches separadas             |
| [Agent Observability](patterns/agent-observability.md)         | Rastreamento e teste de regressão de comportamento de agente  |
| [Multi-Repo Workflows](patterns/multi-repo.md)                 | Coordenação entre repositórios                                |
| [Permission Boundaries](patterns/permission-boundaries.md)     | Acesso de ferramenta de privilégio mínimo                     |
| [Streaming Orchestration](patterns/streaming-orchestration.md) | Loops de turno orientado por evento e orçamento de token     |
| [Tool Registry Patterns](patterns/tool-registry-patterns.md)   | Desacoplando metadados de ferramenta de implementação         |
| [Spec Driven Development](patterns/spec-driven-development.md) | Agentes precisam de um contrato estável antes de construir     |
| [SKILL.md Adoption](patterns/skill-md-adoption.md)            | Descoberta de skill agnóstica de vendor e auto-invocação entre ferramentas |

## Que skills estão incluídas?

29 skills portáveis instaladas em cada ferramenta via `forge-kit`:

```bash
# Skills live in kit/core/skills/ and get copied to each tool's skill directory
ls kit/core/skills/

# Output:
# context.md   cost.md      debug.md     dispatch.md  fallback.md
# loop.md      memory.md    orchestrate.md  plan.md   research.md
# resume.md    review.md    route.md     schedule.md  secure.md
# ship.md      tdd.md       verify.md
```

Skills-chave para desenvolvimento autônomo:

| Skill         | O que faz                                                                             |
| ------------- | ------------------------------------------------------------------------------------- |
| `loop`        | Ciclo dev autônomo — plan → implement → test → review → fix → commit → PR            |
| `route`       | Classifica complexidade de tarefa e escolhe o tier de model certo                     |
| `orchestrate` | Quebra trabalho complexo em fases com rastreamento de dependência                     |
| `dispatch`    | Spawn subtarefas paralelas entre agentes workers                                     |
| `fallback`    | Manipula falhas de model/provider com cadeias de fallback automáticas                 |
| `resume`      | Recupera estado de sessão de git, plans e PRs abertas                                 |
| `tdd`         | Ciclo Red/green/refactor com ordenação estrita                                       |
| `secure`      | Scan de segurança de 5 pontos: secrets, deps, inputs, permissions, injection         |

## Como funciona o sistema de agents?

15 agentes especialistas organizados em um organograma, cada um com um papel definido, tier, lista de acesso de ferramenta e cadeia de fallback:

```text
orchestrator (Lead Orchestrator)
├── architect (Software Architect)
│   ├── frontend — React, CSS, UI, animations
│   ├── backend — APIs, databases, auth, services
│   ├── worker — Generalist implementation and execution
│   ├── devops — CI/CD, Docker, deployment, monitoring
│   ├── tester — Tests, coverage, e2e, regression
│   └── security — Vulns, secrets, OWASP, audit
├── reviewer — Code review, style, logic defects
│   ├── ts-reviewer — TypeScript and JavaScript review
│   ├── python-reviewer — Python review
│   ├── go-reviewer — Go review
│   └── rust-reviewer — Rust review
├── writer — README, docs, CHANGELOG, API docs
├── researcher — Web search, library investigation
└── explorer — Fast codebase grep (cheapest tier)
```

Tarefas são roteadas para o especialista certo automaticamente:

```json
{
  "specialtyRouting": {
    "ui-work": "frontend",
    "api-work": "backend",
    "ci-cd": "devops",
    "testing": "tester",
    "security-scan": "security",
      "documentation": "writer",
      "code-review": "reviewer",
      "ts-review": "ts-reviewer",
      "python-review": "python-reviewer",
      "go-review": "go-reviewer",
      "rust-review": "rust-reviewer"
  }
}
```

Agentes referenciam tiers (`haiku`/`sonnet`/`opus`), não models específicos. Troque providers sem alterar definições de agent.

## Como funciona a execução autônoma?

O loop engine executa o ciclo dev completo sem parar:

```text
PLAN → IMPLEMENT → VERIFY → REVIEW → SECURE → COMMIT
  ↓ (repeat per phase)
QUALITY GATES → PUSH → PR
```

Configuração em `kit/core/autopilot.json`:

```json
{
  "defaultLevel": "autonomous",
  "levels": {
    "autonomous": {
      "autoCommit": true,
      "autoPush": true,
      "autoPR": true,
      "autoDispatch": true,
      "autoFix": true,
      "autoEscalate": true,
      "maxUnattendedPhases": 99,
      "pauseOn": ["deploy to production", "database migration", "force push"]
    }
  }
}
```

Agentes nunca pausam por lint fixes, type fixes, test fixes, commits, pushes ou edições de arquivo. Eles só param para ações genuinamente destrutivas.

## Como rodar checks de qualidade?

```bash
# Install dependencies
npm install

# Run the full validation suite
npm test                 # 16 governance tests
npm run lint             # ESLint on scripts and tests
npm run validate         # Company schema + kit/core config validation
npm run validate:schema  # Schema validation only

# Run the parity audit — shows cross-tool feature gaps
node scripts/parity-audit.js
```

## Como validar um release antes de mutar um repo?

```bash
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog --github-release
```

Os checks de preflight verificam limpeza de git, identidade de git, disponibilidade de tag de destino, detecção de fonte de versão, destino de arquivo de notas, prontidão de changelog e prontidão opcional de `gh` antes de qualquer mutação de release.

Exemplo de saída de parity audit:

```text
Coverage: claude-code 6/6, codex 6/6, opencode 6/6, cursor 6/6, windsurf 6/6, antigravity 6/6
Skills: 19 | Configs: 8 | Gaps: 0
```

## O que o repositório contém?

```text
patterns/            15 tool-agnostic workflow playbooks
rules/               Drop-in rule templates (Claude, Codex, Cursor, Windsurf, Copilot)
kit/
  kit/install.sh     Entry point for forge-kit
  kit/setup.sh       Interactive setup wizard
  kit/core/          8 engine configs + 29 portable skills
  kit/adapters/      Per-tool adapters (6 tools)
  kit/profiles/      Install profiles (standard, minimal, research, durable)
implementations/     Reference setups for Claude Code, Codex, OpenCode, Cursor, Windsurf, Antigravity
companies/           Pre-built multi-agent organizations
tools/               Setup scripts + curated productivity stack
best-practices/      Security, workflow, context management standards
examples/            Starter assets (backlog, memory structure)
```

## Como adotar incrementalmente?

| Dia | Foco                                          | Recurso                                                                                                                         |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Copiar um arquivo de rule                     | [`rules/`](rules/)                                                                                                              |
| 2   | Fundamentar agentes em contexto do projeto    | [`patterns/context-building.md`](patterns/context-building.md)                                                                   |
| 3   | Melhorar confiabilidade de execução           | [`patterns/task-orchestration.md`](patterns/task-orchestration.md)                                                               |
| 4   | Revisar e testar qualidade                    | [`patterns/code-review.md`](patterns/code-review.md), [`patterns/testing.md`](patterns/testing.md)                               |
| 5   | Adicionar memória e observabilidade           | [`patterns/memory-systems.md`](patterns/memory-systems.md), [`patterns/agent-observability.md`](patterns/agent-observability.md) |
| 6   | Contratos orientados por spec                 | [`patterns/spec-driven-development.md`](patterns/spec-driven-development.md)                                                     |
| 7   | Setup completo de time com forge-kit          | [`kit/`](kit/) + [`implementations/`](implementations/)                                                                          |

Precisa do trabalho atual priorizado do repositório em vez do guia geral de adoção? Veja [`BACKLOG.md`](BACKLOG.md).

## Troubleshooting

### Missing Node ≥22

O toolkit requer Node 22 ou posterior. Verifique sua versão:

```bash
node --version
```

Se você ver `v20.*` ou anterior, atualize o Node via seu gerenciador de pacotes ou [nodejs.org](https://nodejs.org).

### Wrong shell

Algumas ferramentas só funcionam em bash ou zsh. Verifique:

```bash
echo $SHELL
```

Se mostrar um shell diferente, mude: `exec bash` ou `exec zsh`.

### ~/.claude directory permissions

Se `forge-kit` relatar erros de permissão ao instalar em `~/.claude`, corrija a propriedade:

```bash
chmod -R u+rwx ~/.claude
```

### Unsupported provider combinations

Nem todas as cadeias de fallback do provider são suportadas. Exemplo: Anthropic + Ollama fallback não é um emparelhamento válido. O assistente de setup o guiará para combinações válidas. Se você configurou manualmente, verifique sua cadeia de provider `~/.forge-setup.json` contra a documentação.

## Como contribuir?

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

Áreas de alto impacto: novas implementações de referência, atualizações de pattern testadas em produção, melhorias de adapter e correções de precisão de documentação.

## Licença

[MIT](LICENSE)
