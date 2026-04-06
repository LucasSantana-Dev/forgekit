# ai-dev-toolkit-setup

**Idioma:** Português | [English](README.en.md)

> **Papel do repositório:** `ai-dev-toolkit-setup` é a camada opcional de bootstrap, instalação e distribuição. A fonte canônica de padrões, skills, agentes e lógica reutilizável fica em `ai-dev-toolkit`.

Setup portátil do ai-dev-toolkit para máquinas novas, sem depender de dotfiles pessoais.

Quer a versão compartilhável com padrões, regras e implementações por ferramenta? Veja o
repositório companheiro
[ai-dev-toolkit](https://github.com/LucasSantana-Dev/ai-dev-toolkit).

## Qual repositório usar?

- Use **ai-dev-toolkit-setup** quando você quiser preparar uma máquina nova com shell, tmux, OpenCode, helpers de release/MCP e ambiente base para agentes.
- Use **ai-dev-toolkit** quando você quiser padrões reutilizáveis, templates de regras e implementações de referência para aplicar dentro dos seus projetos.

O mapa de ownership desta fase está em [OWNERSHIP.md](OWNERSHIP.md).

Quando online, este repo consome o release pinado de `ai-dev-toolkit` e instala os helpers canônicos `mcp-health.py`, `toggle-mcp.py` e `release.py` em `~/.config/opencode/scripts/`.

## Índice

- [Qual repositório usar?](#qual-repositório-usar)
- [O que este repo faz](#o-que-este-repo-faz)
- [Quick start](#quick-start)
- [CI / verificação local](#ci--verificação-local)
- [O que será instalado](#o-que-será-instalado)
- [Autenticação guiada](#autenticação-guiada)
- [O que será configurado para AI tools](#o-que-será-configurado-para-ai-tools)
- [Fluxo diário](#fluxo-diário)
- [Templates tmux por projeto](#templates-tmux-por-projeto)
- [Shells suportados](#shells-suportados)
- [Segredos locais](#segredos-locais)
- [Observação importante sobre AI Agents, MCP e Skills](#observação-importante-sobre-ai-agents-mcp-e-skills)

## O que este repo faz

- instala dependências base em macOS, Ubuntu e Windows
- configura shell helpers portáteis para bash/zsh
- instala o workflow compartilhado de tmux
- prepara onboarding por repositório com `.tmux-session.json`
- oferece suporte opcional ao iTerm2 no macOS
- prepara um ambiente base de OpenCode/AI tools com regras, config e diretórios de skills

## Quick start

### macOS / Ubuntu

```bash
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
```

Depois, valide o ambiente automaticamente:

```bash
./scripts/doctor.sh
```

Com iTerm2 no macOS:

```bash
./bootstrap.sh --with-iterm2
```

## CI / verificação local

O repo agora possui checks compartilhados para:

- shell scripts
- linting de shell
- validação Python
- smoke tests de funcionalidade
- checks de versões/ferramentas

Para rodar localmente:

```bash
bash ./scripts/ci-check.sh
```

### Windows

Abra PowerShell como administrador:

```powershell
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.ps1
```

> Para o workflow completo de tmux/bash, o caminho recomendado no Windows é usar **WSL2 + Ubuntu**.

## O que será instalado

- Git
- GitHub CLI (`gh`)
- Node.js
- Python 3
- jq
- ripgrep
- fd
- fzf
- tmux
- OpenCode CLI
- Claude Code CLI / app bridge (quando suportado pela plataforma)

Em macOS, o bootstrap também instala extras úteis via Homebrew:
- zoxide
- atuin
- eza
- bat
- starship
- direnv

## Autenticação guiada

Depois do bootstrap, você pode usar:

```bash
bash ./scripts/auth-ai-tools.sh
```

Isso ajuda com:

- `gh auth login`
- orientação para `opencode auth login`
- orientação para login do Claude Code

Para MCPs com OAuth/autenticação, use:

```bash
bash ./scripts/auth-mcp-tools.sh
```

Antes de autenticar, você também pode habilitar/desabilitar MCPs opcionais sem editar JSON manualmente:

```bash
mcp-status
mcp-enable linear
mcp-disable linear
```

Ou diretamente para um provedor configurado, por exemplo:

```bash
bash ./scripts/auth-mcp-tools.sh linear
```

Depois, valide o estado live do MCP com:

```bash
mcp-health
mcp-health linear
```

Para planejar ou executar releases em outros repositórios preparados pelo toolkit:

```bash
release-plan --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-plan-github --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-patch --repo /path/to/repo
release-patch-github --repo /path/to/repo
release-tag --repo /path/to/repo --tag v1.2.3
release-tag-github --repo /path/to/repo --tag v1.2.3
```

Quando usar `--changelog`, o repositório alvo precisa ter `CHANGELOG.md` com uma seção `## [Unreleased]`.

Observação: o pin atual deste repositório ainda é `TOOLKIT_VERSION=0.12.0`. Recursos novos do helper canônico — como release preflight / verify — só chegam aqui depois do próximo release tag do `ai-dev-toolkit` e de um bump explícito desse pin.

Você pode verificar drift local do pin com `bash ./scripts/doctor.sh`. Se ele reportar `toolkit pin drift`, rode `bash scripts/setup-ai-tools.sh .` para re-sincronizar o ambiente com o `TOOLKIT_VERSION` deste repositório.

Para verificar se já existe um release novo do toolkit antes de fazer bump do pin:

```bash
toolkit-version-check
toolkit-version-sync
```

## O que será configurado para AI tools

O bootstrap agora também prepara:

- `~/.config/opencode/opencode.jsonc`
- `~/.config/opencode/AGENTS.md`
- `~/.config/opencode/dcp.jsonc`
- `~/.opencode/skills/agents`
- `~/.opencode/skills/codex`
- `~/.config/ai-dev-toolkit/local.env`

E instala um starter pack de skills compartilhadas, incluindo:

- `ai-toolkit-repo-intake`
- `ai-toolkit-ship-check`
- `ai-toolkit-release`
- `ai-toolkit-mcp-health`
- `ai-toolkit-worktree-flow`
- `ai-toolkit-mcp-readiness`

E um starter pack de skills `codex`, incluindo:

- `ai-toolkit-plan-change`
- `ai-toolkit-root-cause-debug`
- `ai-toolkit-context-hygiene`

Isso cobre a base de:

- regras/guidance do OpenCode
- configuração inicial de MCPs portáteis
- estrutura local para skills
- ambiente inicial para agentes
- compressão de contexto e token optimization via DCP
- plugins base para worktrees e memória local
- comandos compartilhados para contexto, verificação e worktrees
- entradas opcionais de MCPs hospedados para provedores comuns

Ainda ficam manuais:

- autenticação de provedores de IA
- instalação de skills específicas de terceiros
- secrets e tokens locais

Mas o bootstrap agora já cria o arquivo base de ambiente local para você preencher:

```bash
~/.config/ai-dev-toolkit/local.env
```

## Fluxo diário

Depois do bootstrap:

```bash
source ~/.bashrc   # ou source ~/.zshrc
gh auth login
```

Em um repositório:

```bash
repo-terminal-ready
```

Ou, se quiser auto-aplicar onboarding detectado:

```bash
repo-terminal-ready-yes
```

## Templates tmux por projeto

Sugestão automática:

```bash
ttemplate-suggest
ttemplate-preview
ttemplate-apply
```

## Shells suportados

- bash
- zsh

PowerShell pode ser usado para bootstrap no Windows, mas o workflow avançado do toolkit hoje é pensado principalmente para bash/zsh.

## Segredos locais

Use um arquivo local fora do repo, por exemplo:

```bash
~/.config/ai-dev-toolkit/local.env
```

Exemplo em `templates/local.env.example`.

O bootstrap copia esse template automaticamente se o arquivo ainda não existir.

## Observação importante sobre AI Agents, MCP e Skills

Este setup prepara a base compartilhada e portátil.

Ele **não depende de dotfiles pessoais**, mas também **não instala automaticamente segredos, tokens privados ou skills proprietárias**.

Ou seja:

- **configura a estrutura**
- **gera os arquivos base**
- **deixa o ambiente pronto**

Mas ainda exige autenticação/segredos para uso completo de alguns provedores e ferramentas.
