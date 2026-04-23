[English](README.md) | [Português](README.pt-BR.md)

# ai-dev-toolkit-setup

Setup portátil de máquina para a stack AI Dev Toolkit: prepare um novo macOS, Ubuntu ou Windows sem depender de dotfiles pessoais.

## Qual repositório eu devo usar?

- **Use este repositório (`ai-dev-toolkit-setup`)** quando quiser instalar o ambiente compartilhado em uma máquina.
- **Use [`ai-dev-toolkit`](https://github.com/Forge-Space/ai-dev-toolkit)** quando quiser regras, padrões, skills e implementações de referência dentro dos seus projetos.

Este repositório é a camada de bootstrap da máquina. O repositório complementar contém o conteúdo reutilizável do toolkit.

## Para quem isso foi feito

Este setup é voltado para desenvolvedores e pequenos times que querem um ambiente reproduzível de desenvolvimento com IA, com os mesmos helpers de shell, fluxo de tmux, baseline de OpenCode e helpers opcionais de MCP/auth em qualquer máquina.

Use quando você quiser:

- configurar uma máquina nova rapidamente
- evitar acoplar o ambiente a dotfiles privados
- manter o onboarding do time reproduzível
- começar de uma baseline conhecida de OpenCode / AI tooling

## O que este repositório faz

O fluxo de bootstrap consegue:

- instalar dependências base em macOS, Ubuntu e Windows
- configurar helpers portáteis para bash/zsh
- instalar o workflow compartilhado de tmux e helpers de onboarding por projeto
- preparar suporte opcional ao iTerm2 no macOS
- gerar uma baseline portátil de configuração do OpenCode
- criar arquivos locais de ambiente para segredos e autenticação de provedores

## Plataformas suportadas

| Plataforma | Entrypoint do bootstrap | Observações                                                                           |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------- |
| macOS      | `./bootstrap.sh`        | Suporte opcional ao iTerm2 com `--with-iterm2`                                        |
| Ubuntu     | `./bootstrap.sh`        | Caminho Linux recomendado                                                             |
| Windows    | `./bootstrap.ps1`       | A melhor experiência continua sendo **WSL2 + Ubuntu** para o fluxo completo bash/tmux |

## Pré-requisitos

Antes de rodar o bootstrap:

- tenha o **Git** instalado
- tenha acesso aos repositórios GitHub com os quais pretende trabalhar
- esteja pronto para autenticar provedores depois do setup (`gh`, OpenCode, Claude Code, provedores MCP)
- no Windows, prefira executar o PowerShell **como administrador**

## Quick start

### macOS / Ubuntu

```bash
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
```

Valide o ambiente logo após o bootstrap:

```bash
./scripts/doctor.sh
```

macOS com extras do iTerm2:

```bash
./bootstrap.sh --with-iterm2
```

Para Macs corporativos (proxy, sem sudo):

```bash
./bootstrap.sh --work-mac
```

Veja [docs/work-mac-setup.md](docs/work-mac-setup.md) para mais detalhes.

### Windows

Abra o PowerShell como administrador:

```powershell
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.ps1
```

Para o workflow completo do toolkit, o caminho recomendado no Windows é:

1. rodar o bootstrap do Windows
2. instalar ou habilitar **WSL2 + Ubuntu**
3. usar o fluxo Linux dentro do WSL para os comandos diários orientados a bash

## O que será instalado

Ferramentas base instaladas nas plataformas suportadas:

- Git
- GitHub CLI (`gh`)
- Node.js
- Python 3
- `jq`
- `ripgrep`
- `fd`
- `fzf`
- `tmux`
- OpenCode CLI
- Claude Code CLI / bridge quando a plataforma suporta
- Gemini CLI

No macOS, o bootstrap também instala extras úteis via Homebrew, como:

- `zoxide`
- `atuin`
- `eza`
- `bat`
- `starship`
- `direnv`

## O que será configurado

O bootstrap prepara uma baseline portátil para o AI tooling, incluindo:

- `~/.config/opencode/opencode.jsonc`
- `~/.config/opencode/AGENTS.md`
- `~/.config/opencode/dcp.jsonc`
- `~/.opencode/skills/agents`
- `~/.opencode/skills/codex`
- `~/.config/ai-dev-toolkit/local.env`

Ele também instala um starter pack de skills compartilhadas e mantém segredos/autenticação locais fora do repositório.

### Limite importante

Este repositório prepara a **estrutura** e a **configuração base**.

Ele **não** instala automaticamente:

- tokens ou segredos privados
- skills proprietárias de terceiros
- autenticação de provedores para todos os serviços

Esses passos continuam manuais de propósito.

## Primeiros comandos após a instalação

Recarregue o shell e autentique o essencial:

```bash
source ~/.bashrc   # ou source ~/.zshrc
gh auth login
```

Ao entrar em um repositório, rode:

```bash
repo-terminal-ready
```

Se quiser autoaplicar o onboarding quando detectado:

```bash
repo-terminal-ready-yes
```

## Autenticação guiada e helpers de MCP

Autentique as ferramentas de IA mais comuns:

```bash
bash ./scripts/auth-ai-tools.sh
```

Autentique provedores MCP com OAuth ou fluxo guiado:

```bash
bash ./scripts/auth-mcp-tools.sh
bash ./scripts/auth-mcp-tools.sh linear
```

Gerencie entradas opcionais de MCP sem editar JSON manualmente:

```bash
mcp-status
mcp-enable linear
mcp-disable linear
```

Valide o estado live dos MCPs:

```bash
mcp-health
mcp-health linear
```

## Helpers de release incluídos no setup

Se o repositório alvo estiver preparado para isso, o ambiente também expõe helpers de release:

```bash
release-plan --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-plan-github --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-patch --repo /path/to/repo
release-patch-github --repo /path/to/repo
release-tag --repo /path/to/repo --tag v1.2.3
release-tag-github --repo /path/to/repo --tag v1.2.3
```

Ao usar `--changelog`, o repositório alvo já precisa ter um `CHANGELOG.md` com a seção `## [Unreleased]`.

## Estrutura do repositório

```text
bootstrap.sh / bootstrap.ps1   Entrypoints de bootstrap por plataforma
scripts/                       Helpers de instalação, validação, auth e setup
config/                        Configuração portátil de shell, tmux, OpenCode e iTerm2
templates/                     Templates de arquivos locais de ambiente
.github/                       Automação de CI e checks compartilhados
```

Helpers importantes:

- `scripts/doctor.sh` — validação pós-bootstrap
- `scripts/ci-check.sh` — verificação local alinhada com a CI
- `scripts/auth-ai-tools.sh` — autenticação guiada de ferramentas/provedores de IA
- `scripts/auth-mcp-tools.sh` — fluxo de auth e health para MCP

## Validação e CI local

Rode a pipeline compartilhada localmente:

```bash
bash ./scripts/ci-check.sh
```

Os checks cobrem:

- validação de shell scripts
- lint de shell
- validação Python
- smoke tests
- checagens de versões e ferramentas

## Troubleshooting

### O bootstrap terminou, mas algumas ferramentas não apareceram

Rode:

```bash
./scripts/doctor.sh
```

Use a saída para identificar o que falhou antes de repetir o bootstrap.

### O fluxo no Windows parece incompleto

Isso é esperado se você ficar apenas no PowerShell nativo. O workflow avançado é otimizado para **bash/zsh**, então prefira **WSL2 + Ubuntu** depois do bootstrap inicial no Windows.

### A autenticação do MCP parece correta, mas os comandos ainda falham

Rode novamente o helper específico do provedor e confirme o estado live:

```bash
bash ./scripts/auth-mcp-tools.sh <provider>
mcp-health <provider>
```

### Não sei onde guardar segredos locais

Use o arquivo local fora do repositório:

```bash
~/.config/ai-dev-toolkit/local.env
```

O bootstrap copia `templates/local.env.example` automaticamente caso o arquivo ainda não exista.

## Contribuição e suporte

- Abra uma issue se algum passo de bootstrap falhar em uma plataforma ou se a documentação estiver errada.
- Abra um PR para ajustes em scripts, templates ou documentação do setup.
- Ao reportar um problema, inclua a saída do `./scripts/doctor.sh` sempre que possível.

## Repositório relacionado

- [`Forge-Space/ai-dev-toolkit`](https://github.com/Forge-Space/ai-dev-toolkit) — regras, padrões, skills, companies e setups de referência reutilizáveis
