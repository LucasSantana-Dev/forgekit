# Ferramentas CLI

## A Stack

| Ferramenta                                          | O que é          | Por que                                                                                                         |
| --------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| [lazygit](https://github.com/jesseduffield/lazygit) | Cliente git TUI  | Staging interativo, rebase, stash — mais rápido que CLI                                                         |
| [fzf](https://github.com/junegunn/fzf)              | Fuzzy finder     | Histórico com Ctrl+R, seletor de arquivos com Ctrl+T, salto de diretórios com Alt+C                            |
| [bat](https://github.com/sharkdp/bat)               | `cat` melhorado  | Syntax highlighting, números de linha, integração com git                                                       |
| [eza](https://github.com/eza-community/eza)         | `ls` melhorado   | Coluna de status do git, visualização em árvore, ícones                                                         |
| [delta](https://github.com/dandavison/delta)        | `git diff` melhorado | Syntax highlighting, lado a lado, números de linha                                                           |
| [zoxide](https://github.com/ajeetdsouza/zoxide)     | `cd` inteligente | Aprende seus diretórios, `z project` salta para lá                                                             |
| [atuin](https://github.com/atuinsh/atuin)           | Histórico do shell | Sincronizado entre máquinas, pesquisável, com timestamp                                                      |
| [btop](https://github.com/aristocratos/btop)        | Monitor do sistema | CPU, memória, disco, rede — detecta processos descontrolados                                                |
| [jq](https://github.com/jqlang/jq)                  | Processador JSON | Faz parse de respostas de API, transforma dados                                                                 |
| [yq](https://github.com/mikefarah/yq)               | Processador YAML | Edita configs de CI, manifests de k8s                                                                          |
| [fd](https://github.com/sharkdp/fd)                 | `find` melhorado | Rápido, respeita `.gitignore`                                                                                   |
| [ripgrep](https://github.com/BurntSushi/ripgrep)    | `grep` melhorado | Rápido, respeita `.gitignore`                                                                                   |
| [rtk](https://github.com/rtk-ai/rtk)                | Otimizador de tokens | Comprime saída de Bash antes que ela chegue ao contexto do LLM; economia de 60-90% em `git`, `npm`, `ls` e outros comandos de desenvolvimento |

## Adições Curadas para Produtividade com IA

Essas são ferramentas de alto sinal vindas do thread compartilhado no X que se encaixam nos workflows deste toolkit.

| Ferramenta                                                                          | Categoria                 | Por que melhora a produtividade                                                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Context7](https://context7.com/)                                                   | Recuperação de docs       | Reduz alucinações ao ancorar a geração de código na documentação atual                                                                                                                              |
| [Tavily](https://tavily.com/)                                                       | Pesquisa web              | Busca rápida e amigável para agentes em dúvidas de implementação e comparações                                                                                                                      |
| [Firecrawl](https://github.com/mendableai/firecrawl)                                | Ingestão web              | Converte docs/sites em Markdown limpo para RAG e conhecimento interno                                                                                                                               |
| [promptfoo](https://github.com/promptfoo/promptfoo)                                 | Avaliação de prompts      | Faz regression test de prompts e configs de modelo antes de enviar                                                                                                                                  |
| [Portkey AI Gateway](https://github.com/Portkey-AI/gateway)                         | Gateway de LLM            | Centraliza roteamento, logging, cache e guardrails entre provedores                                                                                                                                 |
| [LangGraph](https://github.com/langchain-ai/langgraph)                              | Workflows de agentes      | Fluxos stateful confiáveis para tarefas mais longas e em múltiplas etapas                                                                                                                           |
| [n8n](https://github.com/n8n-io/n8n)                                                | Automação                 | Transforma tarefas repetitivas de desenvolvimento/review/release em automações reutilizáveis                                                                                                       |
| [Dify](https://github.com/langgenius/dify)                                          | Orquestração de apps      | Acelera o envio de ferramentas internas de IA e workflows de chat                                                                                                                                   |
| [Ollama](https://github.com/ollama/ollama)                                          | Inferência local          | Modelos locais rápidos para tarefas privadas/offline e iterações baratas                                                                                                                            |
| [TurboQuant](https://github.com/0xSero/turboquant)                                  | Otimizador de inferência local | Quantização de KV-cache do Google (demonstrou redução de memória de 6x e velocidade 8x em GPUs H100 por pesquisa de março de 2026) — integração com vLLM disponível; suporte a llama.cpp/Ollama em desenvolvimento comunitário |
| [Open WebUI](https://github.com/open-webui/open-webui)                              | UX de equipe              | Interface compartilhada para modelos locais/self-hosted e workflows de prompt                                                                                                                       |
| [fastmcp](https://github.com/jlowin/fastmcp)                                        | Desenvolvimento MCP       | Caminho mais rápido para construir servidores MCP internos com menos boilerplate                                                                                                                    |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp)                       | Automação de UI           | Ações estáveis de navegador e loops reproduzíveis de validação end-to-end                                                                                                                           |
| [browser-use](https://github.com/browser-use/browser-use)                           | Agente de navegador       | Automação persistente local/browser-cloud com CLI e APIs Python                                                                                                                                     |
| [Letta](https://github.com/letta-ai/letta)                                          | Agentes stateful          | Runtime de agentes durável e memory-first com suporte a CLI                                                                                                                                         |
| [Mem0](https://github.com/mem0ai/mem0)                                              | Camada de memória         | Extração/recuperação de memória em produção para workflows de agentes                                                                                                                               |
| [Graphiti](https://github.com/getzep/graphiti)                                      | Memória em grafo          | Grafo de memória temporal e consciente de relacionamentos para agentes de longa duração                                                                                                             |
| [planning-with-files](https://github.com/OthmanAdi/planning-with-files)             | Workflow de planejamento  | Padrão persistente de planejamento em 3 arquivos com recuperação de sessão e suporte a hooks                                                                                                       |
| [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | Catálogo de skills        | Instalador grande de pacotes de skills cross-agent com starter packs curados                                                                                                                        |
| [OpenViking](https://github.com/volcengine/OpenViking)                              | Banco de contexto         | Armazenamento de contexto de longo prazo em estilo filesystem, projetado para workflows de agentes                                                                                                 |
| [Codex CLI](https://github.com/openai/codex)                                        | Agente de programação com IA | Agente de terminal sandbox-first (OpenAI). A baseline conservadora é `read-only` com approvals; muitas equipes migram para `workspace-write` em desenvolvimento ativo                            |
| [markdownify-mcp](https://github.com/zcaceres/markdownify-mcp)                      | Ingestão de documentos    | Converte PDFs, imagens e áudio em Markdown para pipelines de RAG e injeção de contexto                                                                                                             |
| [MCPHub](https://github.com/samanhappy/mcphub)                                      | Gestão de MCP             | Proxy HTTP que agrega e roteia múltiplos servidores MCP — reduz overhead de conexão                                                                                                                |
| [lmnr](https://github.com/lmnr-ai/lmnr)                                             | Observabilidade de agentes | Faz tracing, avaliação e monitoramento do comportamento de agentes em produção — complementa o promptfoo para visibilidade em runtime                                                           |
| [TDD Guard](https://github.com/nizos/tdd-guard)                                     | Enforcamento de testes    | Hook para Claude Code que bloqueia implementação antes de existirem testes — impõe test-first no nível do agente                                                                                  |
| [container-use](https://github.com/dagger/container-use)                            | Isolamento de agentes     | Ambientes containerizados com Dagger para agentes de código — evita contaminar o host em tarefas arriscadas                                                                                       |
| [claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | Varredura de segurança | Action oficial da Anthropic que analisa PRs em busca de problemas de segurança — etapa plug-and-play de CI                                                                                        |

### Skills para Claude Code

Skills são arquivos `.md` colocados em `~/.claude/skills/` que ensinam ao Claude workflows e padrões.
Escolhas de alto sinal da comunidade:

| Skill                                                                                           | Stars | Por que importa                                                               |
| ----------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- |
| [Superpowers](https://github.com/obra/superpowers)                                              | 96k+  | 20+ skills testadas em batalha: pipeline TDD, plan-to-execute, systematic debugging |
| [Context Optimization](https://github.com/muratcankoylan/agent-skills-for-context-engineering)  | 13.9k | Truques de KV-cache e redução de tokens — complementa diretamente o RTK      |
| [claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) | —     | Pesquisa em 8 fases com auto-continuação para investigações profundas        |
| [Anthropic Official Skills](https://github.com/anthropics/skills)                               | —     | PDF, DOCX, XLSX, PPTX, Canvas Design, Frontend Design, Brand Guidelines      |

**Instalação:**

```bash
# Instalação global
git clone <repo-url> && cp <repo>/skills/*.md ~/.claude/skills/

# Ou via skills CLI
npx -y skills add obra/superpowers -g
npx -y skills add anthropics/skills -g
```

### Plugins para OpenCode

Adicione em `~/.config/opencode/opencode.jsonc` dentro do array `"plugin"`. Reinicie o OpenCode após as mudanças.

Ao usar `forge-kit`, `--oh-my-compat` pode fazer bootstrap de um arquivo de referência `oh-my-opencode.jsonc` sem mudar arrays de plugins existentes.

```jsonc
{
  "plugin": [
    "oh-my-openagent", // orchestration
    "opencode-claude-auth", // auth
    "@kompassdev/opencode", // repo navigation
    "opencode-scheduler", // scheduling
  ],
}
```

#### Auth

| Plugin                                                                                | O que faz                                                                                   | Observações                                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`opencode-claude-auth`](https://github.com/griffinmartin/opencode-claude-auth)       | Reutiliza suas credenciais OAuth do Claude Code — sem API key ou login separados            | Lê o Keychain do macOS ou `~/.claude/.credentials.json`; renova tokens automaticamente |
| [`opencode-gemini-auth`](https://github.com/jenslys/opencode-gemini-auth)             | OAuth do Gemini via fluxo no navegador — sem API key                                        | ⚠️ O Google avisa que isso viola os ToS; use API key se o risco de conta importar |
| [`opencode-antigravity-auth`](https://github.com/NoeFabris/opencode-antigravity-auth) | Gemini 3 Pro + Claude 4.6 via OAuth da Antigravity IDE; dois pools de cota, rotação multi-conta | ⚠️ Mesmo risco de ToS; acesso grátis a modelos que normalmente são pagos |

#### Orquestração e Fluxo de Trabalho

| Plugin                                                                     | O que faz                                                                                                             | Observações                                                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`oh-my-openagent`](https://ohmyopenagent.com)                             | Harness multi-model de agentes — digite `ulw` para acionar loop autônomo de plano → pesquisa → agentes paralelos → autocorreção | 40+ lifecycle hooks; retomada de sessão com `boulder.json`; roteia tarefas para o modelo ideal |
| [`@kompassdev/opencode`](https://github.com/kompassdev/kompass)            | Mantém agentes ancorados no estado real do repo via `changes_load`, `pr_load`, `ticket_load`                         | Adiciona comandos `/dev`, `/ship`, `/commit`, `/todo`; evita drift em tarefas longas                |
| [`@plannotator/opencode`](https://github.com/backnotprop/plannotator)      | Revisão interativa de planos com anotação visual de diff antes de o agente prosseguir                                  | Aprovar/rejeitar/comentar planos; compartilhamento com AES-256-GCM; comando `/plannotator-review`  |
| [`opencode-scheduler`](https://github.com/different-ai/opencode-scheduler) | Agenda tarefas recorrentes de agente usando schedulers nativos do SO (launchd/systemd/Task Scheduler)                 | Sintaxe cron; prevenção de sobreposição; timeout enforcement; roda do diretório do projeto com config MCP completa |

#### Memória

| Plugin                                                             | O que faz                                                                  | Observações                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`opencode-graphiti`](https://github.com/vicary/opencode-graphiti) | Memória persistente temporal e orientada a relacionamentos via grafo de conhecimento Graphiti | Melhor para projetos longos onde decisões encadeiam ao longo de sessões |
| [`opencode-mem`](https://github.com/tickernelz/opencode-mem)       | Memória local em vector DB com busca semântica                             | Mais leve que graphiti; bom ponto de partida                           |

#### Qualidade de Código

| Plugin                                                                                 | O que faz                                                                              | Observações                                                         |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`opencode-codegraph`](https://codegraph.ru/docs/en/integrations/OPENCODE_PLUGIN.html) | Análise de código via CPG — entende call graphs, fluxo de dados e estrutura de AST     | Útil em codebases grandes onde contexto baseado em grep não basta |
| [`opencode-plugin-openspec`](https://github.com/Octane0411/opencode-plugin-openspec)   | Agente dedicado a planejar e especificar arquitetura de software antes da implementação | Traz contratos de API e decisões de interface mais cedo          |

#### Notificações

| Plugin                                                                         | O que faz                                                                         | Observações                                                                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`opencode-plugin-apprise`](https://github.com/or1is1/opencode-plugin-apprise) | Envia notificações ricas (macOS, Slack, email, Discord) quando o agente precisa de atenção | Exige [Apprise CLI](https://github.com/caronc/apprise); configure os destinos no config do plugin |

#### Ordem Recomendada de Adoção (OpenCode)

1. `opencode-claude-auth` — auth sem atrito se você já usa Claude Code
2. `oh-my-openagent` — só o comando `ulw` já vale a instalação
3. `@kompassdev/opencode` — adicione quando os agentes começarem a desviar em tarefas multi-step
4. `opencode-scheduler` — adicione quando tiver workflows recorrentes de agentes (resumos, scans, uptime checks)
5. `opencode-graphiti` — adicione quando o contexto de decisões precisar persistir por semanas de sessões
6. `@plannotator/opencode` — adicione quando a revisão em equipe dos planos do agente virar gargalo
7. `opencode-codegraph` — adicione para codebases grandes onde análise estrutural importa

### Escolhas Manuais/Opcionais de Repositórios da Comunidade

Estas têm alto valor, mas não são instaladas automaticamente porque são IDE-first, docs-first ou stacks pesadas.

| Ferramenta                                                                                  | Origem                                          | Por que manual                                                          |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| [Cline](https://github.com/cline/cline)                                                     | `cline/cline`                                   | Workflow de extensão para VS Code, gerido pelo marketplace do editor    |
| [OpenHands](https://github.com/OpenHands/OpenHands)                                         | `OpenHands/OpenHands`                           | Melhor adotar como deployment containerizado/SDK do que bootstrap via pipx |
| [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide)             | `dair-ai/Prompt-Engineering-Guide`              | Base de conhecimento de referência, não ferramenta de runtime           |
| [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps)                        | `Shubhamsaboo/awesome-llm-apps`                 | Catálogo de patterns/exemplos para templates de solução                 |
| [System Prompts & Models](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | `x1xhlol/system-prompts-and-models-of-ai-tools` | Corpus de pesquisa/referência, não alvo de instalação                  |

### Ordem Recomendada de Adoção

1. Comece com `Context7`, `promptfoo` e `Playwright MCP` para ganhos imediatos de qualidade.
2. Adicione `Portkey AI Gateway` quando precisar de governança multi-provider e observabilidade.
3. Adicione skills `Superpowers` e `Context Optimization` para enriquecer a biblioteca de workflows do Claude Code.
4. Adicione `markdownify-mcp` e `lmnr` ao construir pipelines de RAG ou workflows de agentes que precisam de observabilidade.
5. Adicione `TDD Guard` para impor comportamento test-first no nível do agente.
6. Adicione `LangGraph` ou `Dify` quando fluxos simples de chat virarem workflows de várias etapas.
7. Adicione `n8n` para automação repetível entre ferramentas e redução de handoff.
8. Adicione `Ollama` + `TurboQuant` + `Open WebUI` para experimentação privada/local — a quantização de KV-cache do TurboQuant pode reduzir o uso de memória em hardware suportado (os resultados variam por arquitetura de GPU).
9. Adicione `container-use` quando as tarefas dos agentes trouxerem risco real de contaminação do host.
10. Adicione `Codex CLI` como alternativa sandbox-first em modelos da OpenAI.

## capture-training

Extraia suas sessões do Claude Code como dados de fine-tuning de instruções:

```bash
python3 tools/capture-training.py --export --min-turns 3
```

Faz parse de `~/.claude/projects/**/*.jsonl`, extrai trocas user→assistant, faz deduplicação por
hash da sessão e adiciona a um `dataset.jsonl` em formato alpaca. Rodar `setup-claude-code.sh` instala
isso como `capture-training` em `~/.local/bin/`. Veja [training/README.md](../training/README.md).

## Instalação

```bash
# macOS
bash tools/install-macos.sh
bash tools/setup-ai-workflow-macos.sh

# Ubuntu/Linux
bash tools/install-ubuntu.sh

# Windows (PowerShell como Admin)
.\tools\install-windows.ps1
```

## Auxiliar de Release

Use `tools/release.py` para visualizar ou executar releases versionados.

```bash
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --dry-run --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
```

Quando `--github-release` é adicionado, o preflight também verifica disponibilidade e auth do `gh`; ele sempre checa identidade git e disponibilidade da tag de destino antes de qualquer mutação.

## Comandos Locais de Fluxo de Trabalho com IA

Depois de rodar `bash tools/setup-ai-workflow-macos.sh` e `source ~/.zshrc`:

| Command            | Propósito                                                          |
| ------------------ | ------------------------------------------------------------------ |
| `ai-eval`          | Avaliação de prompts com `promptfoo`                               |
| `ai-flow`          | Servidor local de automação via `n8n`                              |
| `ai-ollama`        | Runtime local de modelos via `ollama`                              |
| `ai-webui`         | Roda Open WebUI localmente em Docker (`localhost:3000`)            |
| `ai-portkey`       | Roda gateway Portkey localmente em Docker (`localhost:8787`)       |
| `ai-browser-mcp`   | Inicia servidor Playwright MCP para automação de navegador         |
| `ai-skills-find`   | Descobre skills da comunidade via Skills CLI                       |
| `ai-skills-add`    | Instala um pacote de skill com Skills CLI                          |
| `ai-plan-files`    | Instala globalmente a skill `planning-with-files`                  |
| `ai-skill-pack`    | Instala bundle de skills Antigravity para caminhos compatíveis com Claude |
| `ai-openviking`    | Inicia o servidor OpenViking (se instalado)                        |
| `ai-browser-use`   | Inicia a CLI do Browser Use                                        |
| `ai-letta`         | Inicia a CLI do Letta                                              |
| `ai-lmnr`          | Abre o dashboard do lmnr para tracing e avaliação de agentes       |
| `ai-markdownify`   | Roda markdownify-mcp — converte PDF/imagem/áudio para Markdown     |
| `ai-mcphub`        | Inicia o proxy MCPHub para gerenciar múltiplos servidores MCP      |
| `ai-memory-check`  | Valida imports da stack de memória (`mem0`, `graphiti_core`)       |
| `ai-memory-python` | Abre o runtime Python dedicado à stack de memória                  |
| `ai-docs`          | Lembrete para usar Context7 MCP em código ancorado em docs         |
| `ai-search`        | Lembrete para usar Tavily MCP em pesquisa web para agentes         |
| `ai-crawl`         | Lembrete para usar Firecrawl API/MCP em pipelines de ingestão      |

## Aliases Recomendados

### Bash/Zsh/Fish

```bash
alias lg='lazygit'
alias ll='eza -la --git'
alias lt='eza -la --tree --level=2 --git'
alias cat='bat'
```

### PowerShell

```powershell
Set-Alias -Name lg -Value lazygit
function ll { eza -la --git @args }
function lt { eza -la --tree --level=2 --git @args }
Set-Alias -Name cat -Value bat -Option AllScope
```

## Notas por Plataforma

| Ferramenta | macOS | Ubuntu           | Windows                                                |
| ---------- | ----- | ---------------- | ------------------------------------------------------ |
| lazygit | brew  | GitHub release   | winget                                                 |
| fzf     | brew  | apt              | winget                                                 |
| bat     | brew  | apt (`batcat`)   | winget                                                 |
| eza     | brew  | gierens apt repo | scoop                                                  |
| delta   | brew  | GitHub .deb      | winget                                                 |
| zoxide  | brew  | curl installer   | winget                                                 |
| atuin   | brew  | curl installer   | scoop                                                  |
| btop    | brew  | apt              | winget                                                 |
| jq      | brew  | apt              | winget                                                 |
| yq      | brew  | GitHub release   | scoop                                                  |
| rtk     | brew  | install.sh       | manual (veja [rtk docs](https://github.com/rtk-ai/rtk)) |
