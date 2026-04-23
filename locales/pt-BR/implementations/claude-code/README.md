# Implementação para Claude Code

Implementação de referência abrangente dos patterns do AI Dev Toolkit para [Claude Code](https://claude.com/claude-code).

## Visão Geral

Claude Code é a CLI oficial e a extensão para VSCode da Anthropic para Claude.
Ele se destaca em:

- exploração profunda de codebases com ferramentas de busca embutidas
- memória persistente entre sessões
- extensibilidade via servidores MCP, skills e hooks
- roteamento multi-modelo (Sonnet, Opus, Haiku)
- workflow de tool-calling com gates de confirmação

Esta implementação mostra como aplicar os patterns do toolkit à arquitetura do Claude Code.

As partes estáveis da guidance do Claude Code são:

- `CLAUDE.md` para o comportamento do repositório
- arquivos hierárquicos `settings.json` para a config real da ferramenta
- hooks para guardrails e automação
- um conjunto pequeno de plugins always-on
- arquivos locais de memória e contexto do projeto

Mantenha nomes de modelo e escolhas de plugin na config. Mantenha regras de workflow em `CLAUDE.md`.

## Quick Start

```bash
# Instalação (macOS/Linux)
curl -fsSL https://claude.com/install.sh | sh

# Inicializar projeto
cd your-project
cp implementations/claude-code/example-claude-md.md CLAUDE.md

# Estrutura de memória
mkdir -p ~/.claude/projects/$(pwd | sed 's/\//-/g')/memory
echo "# Memory Index" > ~/.claude/projects/$(pwd | sed 's/\//-/g')/memory/MEMORY.md

# Adicionar settings iniciais (opcional)
mkdir -p .claude
cp implementations/claude-code/settings.project.example.json .claude/settings.json
cp implementations/claude-code/settings.user.example.json ~/.claude/settings.json

# Iniciar sessão
claude
```

## Hierarquia de Settings

A superfície oficial de configuração do Claude Code é hierárquica:

- `~/.claude/settings.json` para settings globais
- `.claude/settings.json` para settings compartilhadas do projeto
- `.claude/settings.local.json` para settings locais do projeto que não devem ser commitadas

Use `/config` dentro do Claude Code quando quiser inspecionar ou alterar settings de forma interativa.

Boas práticas:

- mantenha settings globais mínimas
- coloque comportamento compartilhado do time no `CLAUDE.md` do projeto
- coloque experimentos arriscados em `.claude/settings.local.json`
- mantenha hooks, permissões, plugins, attribution e overrides de modelo em `settings.json`

Templates iniciais:

- [settings.user.example.json](./settings.user.example.json)
- [settings.project.example.json](./settings.project.example.json)

## Compatibilidade com oh-my-claudecode

Use [oh-my-claudecode.md](./oh-my-claudecode.md) como limite de ownership ao combinar
`forge-kit` com orquestração oh-my.

`forge-kit` pode instalar esta referência em `~/.claude/oh-my-claudecode.md` com:

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --tools claude-code --oh-my-compat
```

## Organizações de Agentes

O diretório `companies/` fornece times prontos de agentes especializados com
papéis, skills e protocolos de roteamento definidos. Essas definições são
agentes nativos do toolkit, não subagentes nativos do Claude por si só.

```bash
# Exportar ou adaptar um agente do toolkit para o formato nativo de subagente do Claude
mkdir -p .claude/agents
cp implementations/claude-code/subagents/react-engineer.md .claude/agents/react-engineer.md
```

Subagentes do Claude são arquivos markdown colocados diretamente em
`.claude/agents/` ou `~/.claude/agents/` com frontmatter nativo do Claude, como
`name` e `description`. Trate `companies/` como material-fonte e exporte ou
adapte para a ferramenta-alvo.

Veja [companies/README.md](../../companies/README.md) para os companies e a lista de agentes disponíveis.

## Construção de Contexto

### Camadas de CLAUDE.md

Claude Code carrega arquivos `CLAUDE.md` respeitando precedência pela hierarquia de diretórios:

```
your-project/
  CLAUDE.md                    # Regras de todo o projeto (sempre carregado)
  apps/
    web/
      CLAUDE.md                # Regras específicas do web (carregado em apps/web)
  packages/
    ui/
      CLAUDE.md                # Regras da biblioteca UI (carregado em packages/ui)
```

**Boas práticas:**

- `CLAUDE.md` da raiz: arquitetura, stack, workflow, gotchas
- `CLAUDE.md` de subdiretório: convenções específicas do módulo, APIs, patterns de teste
- mantenha cada arquivo abaixo de 500 linhas (Claude Code carrega o arquivo inteiro no contexto)
- use referências `@filename` em vez de descrever caminhos de arquivo

**Template de estrutura:**

```markdown
# Project Name

## Quick Reference

- Stack: TypeScript, React, Supabase
- Build: `npm run build`
- Test: `npm test`
- Deploy: `npm run deploy`

## Architecture

[2-3 paragraph overview]

## Code Standards

- Functions: <50 lines, cyclomatic complexity <10
- No comments unless required for complex logic
- Prefer composition over inheritance

## Workflow

- Branch: feature/_ or fix/_
- Commit: Conventional Commits format
- Test before PR, lint on pre-commit

## Testing Strategy

- Unit: business logic, edge cases
- Integration: API routes, database interactions
- E2E: critical user paths

## Gotchas

- [Specific issues that waste time]

## Security

- Never commit .env files
- Use secret scanning in CI
```

Veja [example-claude-md.md](./example-claude-md.md) para uma referência completa.

### Sistema de Memória

Claude Code mantém memória persistente em `~/.claude/projects/<path>/memory/`.

**Estrutura:**

```
~/.claude/projects/-home-user-myproject/
  memory/
    MEMORY.md              # Arquivo índice (limite de 200 linhas, sempre carregado)
    architecture.md        # Decisões arquiteturais detalhadas
    gotchas.md            # Issues conhecidas e workarounds
    dependencies.md       # Notas específicas de pacotes
    workflows.md          # Sequências de tarefas comuns
```

**Template de MEMORY.md:**

```markdown
# Memory Index

## Quick Facts

- Last deployed: 2026-03-10
- Current version: v1.2.3
- Active branch: feature/new-auth

## Key Decisions

- [2026-03-10] Switched to Supabase Auth (see architecture.md)
- [2026-03-05] Adopted Conventional Commits (see workflows.md)

## Active Tasks

- [ ] Implement OAuth flow (PR #42)
- [ ] Fix mobile responsiveness (issue #38)

## Gotchas Index

- See gotchas.md for full list
- Husky pre-commit fails on WSL → use HUSKY=0
- Docker build requires 16GB RAM minimum

## Learning

- [Key insights from recent work]

File paths: [link to topic files]
```

**Workflow de gestão da memória:**

1. **Início da sessão**: Claude carrega automaticamente o `MEMORY.md`
2. **Durante o trabalho**: atualize arquivos de tópico relevantes quando descobrir novos patterns
3. **Fim da sessão**: rode a skill `/sync-memories` (ou atualize manualmente o índice do `MEMORY.md`)
4. **Limpeza**: mantenha `MEMORY.md` abaixo de 200 linhas; mova detalhes para arquivos de tópico

**Mapeamento para os patterns do toolkit:**

- `MEMORY.md` = [Memory Systems: Session Memory](../../patterns/memory-systems.md#session-memory)
- arquivos de tópico = [Memory Systems: Knowledge Base](../../patterns/memory-systems.md#knowledge-base)
- workflow de atualização = [Memory Systems: Update Protocol](../../patterns/memory-systems.md#update-protocol)

## Hooks

Hooks do Claude Code são configurados em `settings.json`, não colocando scripts de shell em `~/.claude/hooks/`.

Use hooks para:

- bloquear ações destrutivas
- adicionar gates explícitos de review
- registrar logs ou emitir notificações após uso de ferramentas
- fazer validações leves que não reescrevam silenciosamente os arquivos do usuário

Os scripts de exemplo em [`hooks/`](./hooks/) são comandos iniciais que você
pode conectar a partir de `settings.json`. Eles leem o payload JSON do hook via
stdin e são seguros para adaptação.

### Hook PreToolUse

Roda **antes** de Claude executar uma ferramenta. Use para:

- bloquear comandos perigosos
- adicionar gates de confirmação
- reescrever comandos antes da execução (ex.: compressão de tokens com RTK)
- injetar setup de ambiente

**Exemplo:** veja [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh)

**Exemplo de wiring em `settings.json`:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$PROJECT_ROOT/implementations/claude-code/hooks/pre-tool-use.sh"
          }
        ]
      }
    ]
  }
}
```

**Patterns comuns:**

```text
# Bloquear operações perigosas
deny when command matches destructive patterns

# Alertar sobre operações git destrutivas
require confirmation or deny when command force-pushes protected branches

# Injetar setup
allow only lightweight, explicit setup checks
```

Outros eventos de hook importantes:

- `PostToolUse`
- `SessionStart`
- `UserPromptSubmit`
- `SessionEnd`
- `PreCompact`
- `SubagentStop`

Use hooks para guardrails e automação leve, não para esconder lógica crítica de workflow que deveria morar em `CLAUDE.md`.

#### RTK: Hook de Compressão de Tokens

[RTK (Rust Token Killer)](https://github.com/rtk-ai/rtk) é um hook PreToolUse que
reescreve comandos Bash de forma transparente para canalizar a saída por um
binário Rust antes que ela entre na janela de contexto. Economiza 60-90% em
`git`, `npm`, `ls` e outros comandos de alto volume.

**Instalação e wiring (macOS):**

```bash
brew install rtk
rtk init -g   # instala hook + altera settings.json
```

## Superfície de Plugins e Ferramentas

Mantenha pequena a superfície always-on.

Um default forte é:

- recursos centrais do Claude
- um número pequeno de plugins de alto valor
- hooks locais do projeto
- memória local do projeto

Prefira skills on-demand e ativação temporária de ferramentas a um conjunto
grande de plugins permanentemente habilitados. Isso reduz ruído, custo e deriva
de comportamento inesperada.

## Settings de Alto Valor para Documentar Explicitamente

As settings mais importantes do Claude para padronizar são:

- `permissions`
- `hooks`
- `statusLine`
- `enabledPlugins`
- `extraKnownMarketplaces`
- `modelOverrides`
- `attribution`

Overrides úteis guiados por variáveis de ambiente:

- `CLAUDE_CODE_SUBAGENT_MODEL`
- qualquer env var específica do projeto necessária para hooks ou servidores MCP

Mantenha a guidance do time genérica em `CLAUDE.md` e as escolhas específicas da máquina em `settings.json`.

## Subagentes

Subagentes do Claude Code devem ser tratados como ferramenta de escala, não como o default para toda tarefa.

Use subagentes quando:

- as tarefas forem independentes
- as superfícies de escrita forem distintas
- o agente principal puder continuar trabalho útil em paralelo

Evite subagentes quando:

- o próximo passo depende da resposta
- a tarefa é fortemente acoplada ao contexto local atual
- o custo de orquestração supera o valor do paralelismo

**Instalação e wiring (Linux):**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
rtk init -g
```

**Verificação:**

```bash
rtk --version   # rtk 0.x.x
rtk gain        # mostra economia acumulada de tokens
```

O hook usa um protocolo por exit code: exit 0 = reescreve+permite, exit 1 =
pass through sem mudanças, exit 2 = nega (deixa o Claude Code tratar), exit 3 =
reescreve+prompta o usuário. Comandos que o RTK não sabe comprimir passam com
exit 1 e overhead zero.

### Hook PostToolUse

Roda **depois** da execução da ferramenta. Use para:

- rodar checks não mutáveis
- validar saídas
- logs/métricas

**Exemplo:** veja [hooks/post-tool-use.sh](./hooks/post-tool-use.sh)

**Exemplo de wiring em `settings.json`:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$PROJECT_ROOT/implementations/claude-code/hooks/post-tool-use.sh"
          }
        ]
      }
    ]
  }
}
```

**Gotchas importantes:**

- hooks PostToolUse que modificam arquivos podem criar loops de edição
- prefira comportamento de notificação, lint ou log a edições ocultas
- para edições em massa de vários arquivos, mantenha hooks leves ou desabilite-os temporariamente

**Mapeamento para os patterns do toolkit:**

- PreToolUse = [Agent Gotchas](../../patterns/agent-gotchas.md)
- PostToolUse = [Workflow Best Practices](../../best-practices/workflow.md)

## Skills

Skills são workflows reutilizáveis de IA definidos em arquivos markdown.

**Estrutura:**

```markdown
---
name: skill-name
description: What this skill does
triggers:
  - keyword or phrase that suggests this skill
  - another trigger phrase
---

# Skill Instructions

[Detailed instructions for Claude to execute]

## Steps

1. First do X
2. Then do Y
3. Finally Z

## Important Notes

- [Constraints or gotchas]
```

**Local:** `~/.claude/skills/` (global) ou `.claude/skills/` (local do projeto)

**Exemplos:**

- [skills/verify.md](./skills/verify.md) - skill de quality gate (lint, type-check, test, build)
- [skills/ship.md](./skills/ship.md) - skill de workflow git

**Boas práticas:**

- mantenha as skills focadas (um workflow por skill)
- inclua instruções de tratamento de erro
- especifique critérios de sucesso
- documente ferramentas/pré-requisitos

**Criando skills customizadas:**

````markdown
---
name: deploy-staging
description: Deploy current branch to staging environment
triggers:
  - deploy to staging
  - staging deployment
---

# Deploy to Staging

## Prerequisites

Check that:

1. All tests pass (`npm test`)
2. No uncommitted changes (`git status`)
3. Current branch is pushed to remote

## Steps

1. **Build production bundle**
   ```bash
   npm run build
   ```
````

2. **Deploy para Vercel staging**

   ```bash
   vercel deploy --prebuilt
   ```

3. **Verify deployment**
   - confirme que a deployment URL funciona
   - rode smoke tests, se existirem
   - atualize `MEMORY.md` com URL e timestamp do deploy

## Success Criteria

- Deployment URL retornada
- Sem erros de build
- Ambiente de staging acessível

## Rollback

If deployment fails:

```bash
vercel rollback
```

```

**Mapeamento para os patterns do toolkit:**
- Skills = [Task Orchestration: Reusable Workflows](../../patterns/task-orchestration.md#reusable-workflows)
- Skill triggers = [Task Orchestration: Trigger Patterns](../../patterns/task-orchestration.md)

## Estratégia de Servidores MCP

Claude Code suporta servidores Model Context Protocol para ampliar capacidades.

**Locais dos arquivos de config:**

```
~/.claude/.mcp.json              # Servidores globais no nível do usuário (caminho correto)
your-project/.mcp.json           # Servidores específicos do projeto
```

> **Nota:** o arquivo global correto é `~/.claude/.mcp.json` — não `~/.claude/config.json`
> nem `~/.claude/settings.json`. A chave `mcpServers` **não** é válida em `settings.json`;
> adicioná-la ali gera erro de validação de schema no startup.

**Exemplo de config global:**

```json
// ~/.claude/.mcp.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    }
  }
}
```

**Exemplo de config por projeto:**

```json
// your-project/.mcp.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    }
  }
}
```

**Servidores globais recomendados:**

- `@modelcontextprotocol/server-github` - acesso à API do GitHub
- `tavily-mcp` - busca na web
- `@upstash/context7-mcp` - lookup de documentação de bibliotecas

**Recomendados por projeto:**

- SDKs de provedores cloud (Supabase, Vercel, AWS)
- servidores de lógica de negócio customizada
- ferramentas específicas de domínio

**Dicas de performance:**

- mantenha menos de 10 servidores no total (overhead de contexto)
- mantenha menos de 80 ferramentas no total (precisão de seleção de ferramentas)
- use `.mcp.json` local do projeto para ferramentas dependentes do ambiente

### Sistema de Plugins e Registro Duplo

O marketplace de plugins do Claude Code também pode registrar servidores MCP.
Isso cria um **problema de registro duplo** do qual você deve estar ciente:

- um servidor adicionado em `.mcp.json` registra como `mcp__<server>__*`
- o mesmo servidor habilitado via plugin registra como `mcp__plugin_<id>_<server>__*`
- se ambos existirem, cada ferramenta aparece **duas vezes** na lista — dobrando o overhead de contexto

**Audite suas ferramentas ativas periodicamente:**

```bash
# Listar plugins instalados e status
claude plugin list

# Desabilitar um plugin (use o formato do marketplace)
claude plugin disable <plugin-name>@claude-plugins-official

# Ver o que está no seu .mcp.json
cat ~/.claude/.mcp.json
```

**Regra prática:** para servidores de uso constante (github, tavily, playwright),
registre-os diretamente em `.mcp.json` e desabilite o plugin correspondente.
Para servidores especializados usados ocasionalmente, prefira o marketplace.

### Alerta da Env Var Agent Teams

Se você vir nomes de ferramenta `mcp__agents__*` na sessão (por exemplo
`mcp__agents__github__*`), a variável de ambiente
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` está definida. Isso duplica **todas** as
ferramentas MCP registradas sob um namespace `agents` — adicionando ~70+ entradas
extras de nomes de ferramenta na janela de contexto, mesmo sem teams configurados.

**Correção:**

```json
// ~/.claude/settings.json — remova esta linha
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" // <-- remover
  }
}
```

Só defina isso se você estiver usando ativamente o recurso agent teams com uma
chave `teams` configurada em `settings.json`.

**Mapeamento para os patterns do toolkit:**

- servidores MCP = [Context Building](../../patterns/context-building.md)
- configuração de servidores = [Context Building](../../patterns/context-building.md)

## Roteamento Multi-Model

Claude Code suporta três tiers de modelo:

| Model                     | ID         | Use For                              | Cost (in/out) | Context |
| ------------------------- | ---------- | ------------------------------------ | ------------- | ------- |
| claude-sonnet-4-6         | Sonnet 4.6 | Trabalho default, maior parte das tarefas | $3/$15        | 200K    |
| claude-opus-4-6           | Opus 4.6   | Arquitetura complexa, análise profunda | $15/$75       | 1M      |
| claude-haiku-4-5-20251001 | Haiku 4.5  | Subagentes, checks rápidos, formatação | $1/$5         | 200K    |

**Estratégia de roteamento:**

```markdown
## Multi-Model Routing (in CLAUDE.md)

- **Default: Sonnet** - Most development work
- **Use Opus for:**
  - Architectural decisions affecting >3 files
  - Complex debugging requiring deep trace analysis
  - Refactoring with cross-cutting concerns
  - Security-critical code review
- **Use Haiku for:**
  - Formatting/linting fixes
  - Simple test generation
  - Documentation updates
```

**Workflow de seleção de modelo:**

1. Comece com Sonnet para trabalho geral
2. Troque para Opus se Claude travar depois de 2-3 turnos
3. Use Haiku para operações em lote (via API programática, não pela CLI)

### Roteamento de Modelo para Subagentes

Claude Code cria subagentes para trabalho em background (compactação, tarefas paralelas).
Por padrão, eles usam o mesmo modelo da sessão principal. Direcione-os para Haiku automaticamente:

Em `~/.claude/settings.json` (ou rode `bash tools/setup-claude-code.sh` — ele faz isso por você):

```json
{
  "env": {
    "CLAUDE_CODE_SUBAGENT_MODEL": "claude-haiku-4-5-20251001"
  }
}
```

Economia esperada: 60-80% no custo de subagentes sem impacto de qualidade na sessão principal.

### Claude Code Router (CCR)

[CCR](https://github.com/musistudio/claude-code-router) é um proxy local que
roteia requests do Claude Code para slots de modelo diferentes, permitindo
controle de custo mais fino.

**Instalação:**

```bash
npm install -g @musistudio/claude-code-router
```

**Preset** (`~/.claude-code-router/presets/<name>/manifest.json`):

```json
{
  "name": "my-preset",
  "PORT": 3456,
  "Providers": [
    {
      "name": "anthropic",
      "api_base_url": "https://api.anthropic.com/v1/messages",
      "api_key": "$ANTHROPIC_API_KEY",
      "models": [
        "claude-sonnet-4-6",
        "claude-opus-4-6",
        "claude-haiku-4-5-20251001"
      ],
      "transformer": { "use": ["Anthropic"] }
    }
  ],
  "Router": {
    "default": "anthropic,claude-sonnet-4-6",
    "background": "anthropic,claude-haiku-4-5-20251001",
    "think": "anthropic,claude-opus-4-6",
    "longContext": "anthropic,claude-opus-4-6",
    "longContextThreshold": 120000
  }
}
```

Slots: `default` (trabalho interativo), `background` (auto-compactação, subagentes),
`think` (raciocínio complexo), `longContext` (>120K tokens).

```bash
ccr my-preset start && eval "$(ccr activate)" && claude
```

**Mapeamento para os patterns do toolkit:**

- roteamento de modelo = [Multi-Model Routing](../../patterns/multi-model-routing.md)
- otimização de custo = [Context Management](../../best-practices/context-management.md)

## Workflow de Sessão

Workflow recomendado para sessões eficazes:

### Início da Sessão

```bash
# 1. Navegue até o projeto
cd ~/projects/myproject

# 2. Inicie Claude Code
claude

# Claude carrega automaticamente:
# - CLAUDE.md (raiz do projeto + subdiretórios)
# - MEMORY.md (memória da sessão)
# - servidores MCP (globais + do projeto)

# 3. (Opcional) Carregue contexto específico
# @path/to/file.ts - Referência de arquivo
# @**/*.test.ts - Glob pattern
```

**Checks automáticos** (via skill ou manual):

- verificar git status e branch atual
- revisar issues/PRs abertos
- checar tarefas ativas no `MEMORY.md`

### Durante o Trabalho

**Gestão de contexto:**

- use referências `@filename` em vez de descrever localizações
- rode `/compact` quando o contexto atingir **60-70%** dos 200K tokens — não espere 90%
- use `/clear` entre tarefas não relacionadas

**Quality gates:**

- rode a skill `/verify` após mudanças relevantes
- faça commits frequentes com mensagens significativas
- atualize `MEMORY.md` ao descobrir novos patterns

**Prevenção de gotchas:**

- leia arquivos existentes antes de editar (a ferramenta Edit exige leitura prévia)
- confira a saída dos testes para evitar falsos positivos
- valide que o CI passa antes de pedir criação de PR

### Fim da Sessão

```markdown
## End-of-Session Checklist (via skill or manual)

1. **Commit work**
   - [ ] All changes staged
   - [ ] Conventional commit message
   - [ ] Pushed to remote

2. **Update documentation**
   - [ ] CHANGELOG.md updated (if applicable)
   - [ ] README.md updated (if API changed)
   - [ ] MEMORY.md updated with new insights

3. **Sync memories**
   - [ ] Run `/sync-memories` skill
   - [ ] Move MEMORY.md details to topic files if over 200 lines

4. **Cleanup**
   - [ ] Delete temporary scripts
   - [ ] Remove debug code
   - [ ] Close unused branches
```

**Mapeamento para os patterns do toolkit:**

- workflow de sessão = [Session Management](../../patterns/session-management.md)
- workflow de commit = [Workflow Best Practices](../../best-practices/workflow.md)
- sync de memória = [Memory Systems: Update Protocol](../../patterns/memory-systems.md#update-protocol)

## Orquestração de Tarefas

Para workflows de múltiplas etapas, use skills com gestão explícita de estado:

````markdown
---
name: feature-flow
description: Complete feature development workflow
---

# Feature Development Flow

## Input Required

- Feature name
- Target branch (default: main)

## Steps

1. **Create feature branch**
   ```bash
   git checkout -b feature/[feature-name]
   ```
````

2. **Implementar a feature**
   - escrever código
   - adicionar testes
   - atualizar `CHANGELOG.md`

3. **Quality gates**
   - rodar a skill `/verify`
   - corrigir quaisquer issues
   - commit: `feat: [description]`

4. **Criar PR**
   - push da branch
   - rodar a skill `/ship`
   - vincular issues relacionadas

5. **Atualizar memória**
   - adicionar em `MEMORY.md` as tarefas ativas
   - documentar quaisquer gotchas descobertos

```

**Rastreamento de progresso:**

Use `MEMORY.md` para rastreamento leve:

```markdown
## Active Tasks

### Feature: OAuth Integration (PR #42)
- [x] Setup Supabase auth config
- [x] Implement login flow
- [ ] Add logout handler
- [ ] Write E2E tests
- [ ] Update docs

Next: Write logout handler, then E2E tests
```

Para projetos complexos, use ferramentas externas (Linear, GitHub Projects) e sincronize via MCP.

**Mapeamento para os patterns do toolkit:**

- workflows de múltiplas etapas = [Task Orchestration](../../patterns/task-orchestration.md)
- rastreamento de progresso = [Task Orchestration: State Management](../../patterns/task-orchestration.md#state-management)

## Segurança & Safety

### Gestão de Segredos

**Prevenção (hook PreToolUse):**

```bash
# Bloquear commits contendo segredos
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$COMMAND" =~ "git commit" ]]; then
  if git diff --cached | grep -qE 'sk_live_|AKIA|-----BEGIN PRIVATE KEY-----'; then
    echo "BLOCKED: Potential secret detected"
    exit 1
  fi
fi
```

**Detecção (hook PostToolUse):**

```bash
# Fazer scan de arquivos escritos em busca de segredos
if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  if command -v gitleaks &> /dev/null; then
    gitleaks detect --no-git --source="$FILE_PATH"
  fi
}
```

**Boas práticas:**

- use variáveis de ambiente para todos os segredos
- adicione `.env` ao `.gitignore`
- use secret scanning no CI (GitGuardian, Gitleaks, Trivy)
- nunca coloque segredos em `CLAUDE.md` ou em arquivos de memória

### Salvaguardas de Ferramentas

Veja [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh) para exemplos completos:

- bloquear `rm -rf /`, `dd`, `mkfs` (operações destrutivas em arquivos)
- alertar sobre `git push --force` em branches protegidas
- confirmar `git branch -D` (deleção permanente)
- validar migrations de banco antes de aplicar

**Mapeamento para os patterns do toolkit:**

- secret scanning = [Security Best Practices](../../best-practices/security.md)
- safeguards = [Agent Gotchas](../../patterns/agent-gotchas.md)

## Otimização de Performance

### Gestão do Orçamento de Tokens

Claude Code tem janela de contexto de 200K tokens (Sonnet) ou 1M (Opus).

**Monitoramento:**

- verifique o uso de tokens na barra de status inferior
- rode `/compact` em **60-70%** (120-140K tokens para Sonnet) — esperar até 90% aumenta o risco de bater limite em tarefas longas
- use `/clear` entre tarefas não relacionadas

**Estratégias de redução:**

1. **Hook RTK (maior impacto, nenhuma mudança de workflow)**
   Instale RTK para comprimir saídas de Bash antes de chegarem ao modelo. Um
   único `git log` pode produzir 10K tokens de saída bruta; RTK filtra para
   menos de 1K.

   ```bash
   brew install rtk && rtk init -g   # macOS
   # ou: curl installer + rtk init -g  (Linux)
   ```

   Veja [RTK hook setup](#rtk-hook-de-compressão-de-tokens) para as instruções completas.

2. **Leitura direcionada de arquivos**

   ```
   Em vez de: "Read all files in src/"
   Faça: "@src/components/Button.tsx @src/hooks/useAuth.ts"
   ```

3. **Glob patterns para arquivos específicos**

   ```
   Em vez de: "@**/*"
   Faça: "@**/*.test.ts" ou "@src/lib/**/*.ts"
   ```

4. **Resumir antes de carregar**

   ```
   "List files in src/components/, then I'll tell you which to read"
   ```

5. **Usar arquivos de memória**
   - armazene decisões arquiteturais em `memory/architecture.md`
   - referencie: "Check architecture.md for DB schema"
   - isso evita reler arquivos grandes

### Cache

Claude Code faz cache de definições de ferramentas e conteúdo de arquivos entre turnos.

**Otimização:**

- reutilize referências `@filename` (entram em cache após a primeira leitura)
- mantenha `CLAUDE.md` estável (ele é reparseado quando muda)
- minimize reinícios de servidores MCP (as ferramentas são reindexadas no restart)

**Mapeamento para os patterns do toolkit:**

- gestão de tokens = [Context Management](../../best-practices/context-management.md)
- cache = [Context Management](../../best-practices/context-management.md)

## Estratégia de Testes

### Geração de Testes

Use skills para geração consistente de testes:

```markdown
---
name: generate-tests
description: Generate comprehensive tests for a module
---

# Generate Tests

## Inputs

- Target file path
- Test type (unit, integration, e2e)

## Steps

1. **Analyze target file**
   - Read target file
   - Identify exported functions/classes
   - Note edge cases, error conditions

2. **Create test file**
   - Follow project naming convention (_.test.ts or _.spec.ts)
   - Import testing framework (Jest, Vitest, Playwright)
   - Setup mocks if needed

3. **Write test cases**
   - Happy path (primary use case)
   - Edge cases (empty inputs, boundary values)
   - Error conditions (invalid inputs, failures)
   - Integration points (if applicable)

4. **Verify**
   - Run tests: `npm test path/to/test.ts`
   - Check coverage meets threshold (>80%)
   - Verify no false positives
```

### Quality Gates

Integre com o CI existente:

```yaml
# .github/workflows/quality.yml
name: Quality Gates

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build
```

**Verificação local** (via skill `/verify`):

```bash
npm run lint && \
npm run type-check && \
npm test && \
npm run build
```

**Mapeamento para os patterns do toolkit:**

- geração de testes = [Testing](../../patterns/testing.md)
- quality gates = [Workflow Best Practices](../../best-practices/workflow.md)

## Troubleshooting

### Issues Comuns

**1. A ferramenta Edit falha com "file not read"**

```
Solução: leia o arquivo primeiro com @filename ou Read tool
Sempre: workflow Read → Edit
```

**2. Hooks criam loops infinitos**

```
Problema: hook PostToolUse modifica arquivo → dispara outro Edit
Solução: adicione uma checagem condicional no hook para pular se já estiver formatado
```

**3. Timeout do servidor MCP**

```
Problema: o servidor leva >30s para responder
Solução: reduza a quantidade de tools, otimize o startup do servidor, confira a rede
```

**4. Arquivo de memória não carrega**

```
Problema: MEMORY.md passou de 200 linhas
Solução: mova detalhes para arquivos de tópico, mantenha o índice abaixo do limite
```

**5. Hooks do git conflitam com hooks do Claude Code**

```
Problema: hook de pre-commit falha, mas Claude Code continua
Solução: o hook PreToolUse deve sair com exit 1 para bloquear
```

**6. RTK não está reescrevendo comandos**

```
Problema: binário rtk não está no PATH quando o hook roda
Solução: use o caminho completo no hook ou garanta que PATH inclua ~/.local/bin
         Rode: rtk --version para confirmar que o binário é acessível
```

### Modo de Debug

Habilite logging verboso:

```bash
# Defina a variável de ambiente
export CLAUDE_DEBUG=1

# Ou rode com flag
claude --debug
```

**Locais de log:**

- `~/.claude/logs/` - logs de sessão
- `~/.claude/mcp-logs/` - logs dos servidores MCP

## Patterns Avançados

### Subagentes em Paralelo

Para tarefas independentes, invoque múltiplas instâncias do Claude:

```bash
# Terminal 1: trabalho de frontend
cd apps/web && claude --prompt "Implement login form"

# Terminal 2: trabalho de backend
cd apps/api && claude --prompt "Add authentication endpoint"

# Terminal 3: testes
cd apps/web && claude --prompt "Write E2E tests for login"
```

**Quando usar:**

- 3+ tarefas independentes
- sem estado/arquivos compartilhados
- limites claros entre arquivos
- jobs de CI em paralelo

**Coordenação:**

- use branches git (faça merge depois)
- atualize o `MEMORY.md` compartilhado por último (para evitar conflitos)
- comunique-se via GitHub issues/PRs

### Dependências Sequenciais

Para tarefas em que B depende da saída de A:

```markdown
## Workflow: API + Client Generation

### Step 1: Update API schema

1. Modify `schema.prisma`
2. Run `prisma generate`
3. Commit schema changes

### Step 2: Generate client types

1. Wait for Step 1 completion
2. Run `npm run codegen` (generates types from schema)
3. Verify types in `src/generated/`

### Step 3: Update frontend

1. Wait for Step 2 completion
2. Update React components with new types
3. Run type-check to verify
```

Use skills para codificar essas dependências:

```markdown
---
name: schema-update-flow
description: Complete flow for schema changes (API → types → frontend)
---

# Schema Update Flow

## Step 1: Update Schema

[Instructions...]

## Step 2: Generate Types (requires Step 1)

Check that Step 1 completed:

- [ ] schema.prisma modified
- [ ] prisma generate ran successfully
- [ ] Changes committed

Then run: `npm run codegen`

## Step 3: Update Frontend (requires Step 2)

Check that Step 2 completed:

- [ ] Types generated in src/generated/
- [ ] No type errors in codegen output

Then update components...
```

**Mapeamento para os patterns do toolkit:**

- trabalho em paralelo = [Task Orchestration: Parallel Execution](../../patterns/task-orchestration.md#parallel-execution)
- dependências sequenciais = [Task Orchestration: Dependency Management](../../patterns/task-orchestration.md#dependency-management)

## Exemplos

Veja os arquivos abaixo para exemplos completos:

- [example-claude-md.md](./example-claude-md.md) - `CLAUDE.md` completo para projeto TypeScript + React + Supabase
- [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh) - hook PreToolUse com safeguards
- [hooks/post-tool-use.sh](./hooks/post-tool-use.sh) - hook PostToolUse com formatação
- [skills/verify.md](./skills/verify.md) - skill de quality gate
- [skills/ship.md](./skills/ship.md) - skill de workflow git

## Contribuindo

Melhorias são bem-vindas. Se você descobrir patterns melhores ou encontrar issues:

1. Abra uma issue descrevendo o pattern/problema
2. Envie um PR com código de exemplo
3. Atualize este README com as lições aprendidas

## Recursos

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [AI Dev Toolkit Patterns](../../patterns/)

## Licença

MIT
