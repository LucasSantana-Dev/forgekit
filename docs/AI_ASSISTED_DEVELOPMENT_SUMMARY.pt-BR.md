# Resumo do AI Dev Toolkit

Este repositório é um toolkit para desenvolvimento assistido por IA. Ele não é um app e não é um framework para ser importado no código de produção. O objetivo é ajudar agentes de programação a trabalhar com mais contexto, padrões mais seguros, fluxos mais claros e resultados mais repetíveis.

## O Jeito Mais Rápido de Tirar Valor

Se você está chegando agora, faça o caminho mais simples:

1. Descubra qual superfície de instrução o seu agente já lê.
2. Copie um arquivo-base de regras para o seu projeto.
3. Só depois adicione patterns de contexto, review e testes.

Depois traduza isso para a ferramenta que você usa:

- `rules/CLAUDE.md` para Claude Code e ferramentas compatíveis
- `rules/AGENTS.md` para Codex CLI
- `rules/COPILOT.md` para GitHub Copilot
- `rules/GEMINI.md` para Gemini CLI e superfícies relacionadas do Gemini
- `rules/ANTIGRAVITY.md` para Antigravity
- os arquivos específicos para Cursor e Windsurf

Copie o arquivo certo para a raiz do seu projeto. Isso já dá ao agente uma base de identidade, padrões de código, workflow, testes, segurança e entrega antes do primeiro prompt.

Você não precisa instalar tudo para se beneficiar do repositório.
No primeiro dia, você também pode ignorar `companies/`, `training/`, ecossistemas de plugins e bootstrap de máquina.

## O Que Existe Aqui Dentro

### 1. Regras

O diretório `rules/` contém arquivos prontos para diferentes ferramentas de IA.

Use essas regras quando você quiser que o agente respeite automaticamente:

- seus padrões de código
- workflow trunk-based
- gates de teste e verificação
- regras de documentação
- limites de segurança
- expectativa de execução durável

Pense em regras como a camada de comportamento sempre carregada.

### 2. Patterns

O diretório `patterns/` contém playbooks de workflow. Eles explicam como usar IA direito, não apenas o que mandar para o modelo.

O conjunto cobre:

- construção de contexto
- orquestração de tarefas
- code review
- testes
- memória
- roteamento de modelos
- gestão de sessão
- git worktrees
- limites de permissão
- observabilidade
- desenvolvimento guiado por especificação
- trabalho em múltiplos repositórios
- streaming orchestration
- prompt engineering
- design de tool registry
- falhas comuns de agentes

Pense em `patterns` como o manual conceitual do desenvolvimento assistido por IA.

### 3. Best Practices

O diretório `best-practices/` é uma camada mais curta e operacional em cima dos `patterns`.

Ele reforça:

- desenvolvimento assistido por IA com segurança
- higiene de contexto e controle de tokens
- branching, commits e fluxo de entrega

Pense em `best-practices` como a versão checklist do manual.

### 4. forge-kit

O diretório `kit/` contém o `forge-kit`, que é o sistema de instalação e configuração do toolkit.

Ele inclui:

- `kit/install.sh` para instalar os assets do toolkit em ferramentas suportadas
- `kit/setup.sh` para setup interativo
- `kit/adapters/` com a lógica de instalação por ferramenta
- `kit/profiles/` com modos como `standard`, `minimal`, `research` e `durable`
- `kit/core/` com regras compartilhadas, registries de configuração e skills portáteis

O `forge-kit` existe para que a mesma orientação de desenvolvimento com IA possa ser instalada em várias ferramentas sem reescrever tudo na mão.

### 5. Skills Portáteis

O diretório `kit/core/skills/` atualmente contém 29 skills portáteis.

A forma mais simples de entender é por grupos:

- Planejamento e execução: `plan`, `plan-change`, `orchestrate`, `loop`, `ship`, `verify`, `ship-check`
- Debug e qualidade: `debug`, `root-cause-debug`, `review`, `secure`, `tdd`, `release-flow`
- Sessão e contexto: `resume`, `memory`, `context`, `context-hygiene`, `worktree-flow`, `repo-intake`
- Roteamento, fallback e infraestrutura: `route`, `fallback`, `schedule`, `mcp-health`, `mcp-readiness`, `toolkit-sync`, `cost`, `learn`, `research`, `dispatch`

Pense em skills como micro-workflows reutilizáveis que ensinam o agente a executar tarefas recorrentes.

### 6. Implementações por Ferramenta

O diretório `implementations/` mostra como as mesmas ideias se traduzem para ferramentas reais:

- Claude Code
- Codex CLI
- OpenCode
- Cursor
- GitHub Copilot
- Windsurf
- Antigravity
- Gemini

Use essas implementações quando você precisar de setup específico de ferramenta, não quando quiser entender a ideia central do toolkit. As ideias principais estão em `rules/`, `patterns/` e `kit/`.

### 7. Organizações de Agentes

O diretório `companies/` contém organizações prontas de agentes especialistas.

Aqui, `companies` significa estruturas reutilizáveis de time para agentes, não estudos de caso de negócio. Elas definem papéis, roteamento, skills e handoff para tornar trabalho multiagente mais previsível.

O repo inclui organizações menores e um exemplo grande:

- `solopreneur`
- `startup-mvp`
- `agency`
- `open-source-maintainer`
- `fullstack-forge`

Se você está começando, trate essa parte como opcional e avançada.

### 8. Tools e Training

Existem duas áreas de apoio úteis, mas opcionais:

- `tools/README.md` cataloga CLIs recomendadas, plugins, utilitários ligados a MCP e helpers de shell para ambientes intensivos em IA
- `training/README.md` cobre captura de conversas e fine-tuning opcional

Nenhuma das duas é obrigatória para usar bem o toolkit.

### 9. Examples

O diretório `examples/` é uma das partes mais amigáveis para iniciantes porque mostra o toolkit em uso, em vez de só explicar conceitos.

Use `examples/` quando quiser ver:

- arquivos de memória de exemplo
- superfícies de instrução de exemplo
- estrutura de contexto de projeto

Se `rules/` e `patterns/` parecerem abstratos demais no começo, vale olhar `examples/` antes de mergulhar nas áreas mais avançadas.

## O Modelo Mental Central

Este repositório fica muito mais simples quando você separa bem as camadas:

- Regras dizem como o agente deve se comportar por padrão.
- Patterns explicam por que um workflow funciona e quando usar.
- Skills ensinam procedimentos reutilizáveis em nível de tarefa.
- Implementações mostram como essas ideias se encaixam em uma ferramenta específica.
- Organizações de agentes definem times especialistas reutilizáveis.
- forge-kit instala e sincroniza o sistema inteiro.

Se você mantiver essas seis camadas separadas na cabeça, a navegação pelo repo fica bem mais fácil.

## Um Jargão Que Vale Entender: MCP

MCP significa Model Context Protocol. Na prática, é uma forma padronizada de uma ferramenta de IA se conectar a ferramentas ou fontes de dados externas, como GitHub, filesystem, servidores de documentação, navegadores, sistemas de memória ou APIs internas.

Se você é iniciante, basta guardar isto:

- regras moldam o comportamento do agente
- MCP amplia o que o agente consegue acessar e fazer

Você não precisa de MCP no primeiro dia, mas ele aparece bastante neste repositório porque se torna importante quando o workflow cresce além do prompting básico.

## Superfícies de Instrução por Ferramenta

Ferramentas diferentes leem arquivos diferentes para comportamento e guidance do repositório:

- Claude Code: `CLAUDE.md`
- Codex CLI: `AGENTS.md`
- GitHub Copilot: `.github/copilot-instructions.md` e opcionalmente `.github/instructions/*.instructions.md`
- Gemini CLI: `GEMINI.md`
- Gemini Code Assist no GitHub: `.gemini/styleguide.md`
- Antigravity: `~/.antigravity/rules.md` como superfície principal de regras

Este repositório agora inclui cobertura explícita de regras e implementações para GitHub Copilot, Antigravity e Gemini, para que o mesmo modelo de desenvolvimento assistido por IA possa ser reutilizado nessas ferramentas também.

## O Que o `ai-dev-toolkit-setup` Faz

O repositório companheiro `ai-dev-toolkit-setup` resolve outro problema.

Use `ai-dev-toolkit` quando você quer guidance reutilizável de desenvolvimento com IA dentro de um projeto.

Use `ai-dev-toolkit-setup` quando você quer preparar uma máquina com:

- helpers de shell
- workflow de tmux
- bootstrap de OpenCode
- diretórios iniciais de skills
- scaffolding de ambiente local
- scripts guiados de autenticação
- instalação de pacotes para uma máquina nova

Em resumo:

- `ai-dev-toolkit` é o manual e a caixa de ferramentas reutilizável
- `ai-dev-toolkit-setup` é a camada de bootstrap da máquina

Detalhes importantes:

- o setup consome uma release pinada do toolkit via `TOOLKIT_VERSION`
- o setup instala scripts canônicos do toolkit quando está online
- o setup ainda mantém uma pequena camada offline de fallback
- o setup não instala secrets nem conclui a autenticação de provedores por você

## Caminho Recomendado Para Iniciantes

Se você quer a menor trilha útil de adoção, siga esta ordem:

1. Copie um arquivo de regras para o seu projeto.
2. Leia `patterns/context-building.md`.
3. Leia `patterns/task-orchestration.md`.
4. Adicione `patterns/code-review.md` e `patterns/testing.md`.
5. Adicione memória e disciplina de sessão com `patterns/memory-systems.md` e `best-practices/context-management.md`.
6. Instale `forge-kit` só depois que souber quais ferramentas realmente usa.
7. Explore organizações de agentes apenas quando o workflow com um agente só começar a quebrar.

Adoção mínima viável:

- copie um arquivo de regras
- leia dois ou três patterns
- não instale `forge-kit` ainda
- use `implementations/` apenas quando precisar de setup específico

## O Que É Opcional e Avançado

Estas áreas têm valor, mas iniciantes não devem começar por elas:

- organizações multiagente em `companies/`
- ecossistema avançado de plugins em `tools/README.md`
- captura de dados e fine-tuning em `training/README.md`
- overlays avançados de orquestração no OpenCode
- configuração completa de loops autônomos antes de consolidar hábitos básicos de verificação

## O Que Este Repo Otimiza

O repositório empurra sempre para os mesmos resultados:

- mais contexto antes de codar
- uso mais barato de modelos via roteamento
- menos falhas silenciosas
- permissões mais seguras
- gates de qualidade repetíveis
- unidades menores e entregáveis de trabalho
- continuidade entre sessões
- portabilidade entre ferramentas de IA

Se o seu workflow com IA sofre com pouco contexto, qualidade instável, disciplina de entrega fraca ou repetição manual demais, este repositório foi feito para atacar exatamente esses problemas.
