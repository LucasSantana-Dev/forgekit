# Implementação para Codex CLI

Implementação de referência dos patterns do toolkit para [Codex CLI](https://github.com/openai/codex).

## Como o Codex Difere de Outras Ferramentas de IA para Código

A maioria das ferramentas de IA para código (Claude Code, OpenCode, Cursor) é
**trust-first**: elas assumem que você quer acesso máximo e exigem setup
explícito para adicionar isolamento. O Codex é o oposto — **sandbox-first por
padrão**.

Os defaults documentados são conservadores:

- sandbox `read-only`
- rede desabilitada, a menos que você amplie o acesso explicitamente
- prompts de aprovação quando o agente precisa ir além do limite atual de confiança

Para trabalho ativo de implementação, muitos times migram de propósito para
`workspace-write` com aprovação `on-request`. Essa é uma postura recomendada
para desenvolvimento, não o baseline documentado.

**Policy de aprovação como dial de autonomia:**

```
untrusted ──── on-request ──── on-failure ──── never
  (pausa        (pausa quando     (pausa só      (automação
a cada ação)   houver dúvida)     em erros)       total)
```

Use `on-request` para desenvolvimento interativo — não `untrusted`. A diferença:
`untrusted` interrompe cada comando de shell e cada escrita em arquivo, quebrando
o seu fluxo. `on-request` deixa o Codex seguir quando ele está confiante e só
pausa quando realmente precisa da sua entrada. Você mantém supervisão sem
interrupção constante.

## Setup

```bash
# Install
npm install -g @openai/codex

# Copiar config global
cp config.toml ~/.codex/config.toml

# Copiar instruções globais
cp ../../rules/AGENTS.md ~/.codex/AGENTS.md

# Copiar instruções do projeto (rode na raiz do seu repo)
cp ../../rules/AGENTS.md your-project/AGENTS.md
```

Defina sua chave de API:

```bash
export OPENAI_API_KEY=sk-...
```

Prefira manter a escolha real do modelo em `~/.codex/config.toml` ou em flags de
sessão. Os nomes de modelo mudam mais rápido que os patterns de workflow, então
este guia permanece orientado a tiers e só usa nomes concretos como exemplo
quando necessário.

## Compatibilidade com oh-my-codex

Use [oh-my-codex.md](./oh-my-codex.md) como limite de ownership ao combinar
`forge-kit` com uma camada de orquestração oh-my-codex.

`forge-kit` pode instalar esta referência em `~/.codex/oh-my-codex.md` com:

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --tools codex --oh-my-compat
```

## Regras de Escopo do AGENTS.md

Codex lê `AGENTS.md` de forma hierárquica — arquivos mais profundos têm precedência:

```
~/.codex/AGENTS.md          ← global (todos os projetos)
your-project/AGENTS.md      ← raiz do projeto
your-project/src/AGENTS.md  ← escopo do subtree src/
```

Instruções em um arquivo mais profundo sobrescrevem as do pai para qualquer
arquivo modificado dentro daquela árvore de diretórios. Instruções do prompt
direto sempre sobrescrevem `AGENTS.md`.

Veja o [pattern de Context Building](../../patterns/context-building.md).

## Policies de Aprovação

| Policy       | Interrompe em | Quando usar                                   |
| ------------ | ------------- | --------------------------------------------- |
| `untrusted`  | Toda ação     | Auditorias de segurança, codebases não confiáveis |
| `on-request` | Incerteza     | **Dev interativo** — supervisão sem quebrar o fluxo |
| `on-failure` | Só em erros   | Tarefas repetitivas que você já validou       |
| `never`      | Nada          | Pipelines de CI, containers, execuções totalmente roteirizadas |

`on-request` é o default certo para desenvolvimento porque o Codex só pausa
quando há incerteza real — não a cada escrita de arquivo ou comando rotineiro.
`untrusted` parece mais seguro, mas treina você a aprovar prompts sem pensar,
o que destrói a utilidade da supervisão.

Override por sessão:

```bash
codex --approval-mode on-request "refactor the auth module"
codex --approval-mode on-failure "run tests and fix any failures"
codex --approval-mode never "generate a changelog summary"  # CI
```

## Modos de Sandbox

| Mode                 | Acesso a arquivos     | Rede     | Caso de uso      |
| -------------------- | -------------------- | -------- | ---------------- |
| `read-only`          | Somente leitura      | Disabled | Audit / explain  |
| `workspace-write`    | Escreve dentro do projeto | Disabled | Modo recomendado para dev ativo |
| `danger-full-access` | Irrestrito           | Enabled  | Apenas containers |

## Workflows Comuns

```bash
# Explorar a base de código
codex "explain the architecture of this project"

# Implementar uma feature com review
codex --approval-mode on-request "add rate limiting to the /api/auth route"

# Rodar e corrigir testes automaticamente
codex --approval-mode on-failure "run tests and fix any failures"

# Modo CI não interativo
codex -q --json --approval-mode never "generate a summary of recent changes"

# Use um modelo de raciocínio mais forte apenas quando a tarefa exigir
codex --model <deep-reasoning-model> "review this PR diff for security issues"
```

## Roteamento Multi-Model

Prefira tiers estáveis em vez de fixar nomes de modelo nas diretrizes do time:

| Tipo de tarefa | Tier recomendado | Como escolher |
| --- | --- | --- |
| Exploração, explicação | Tier rápido ou equilibrado para código | Use o modelo rápido ou equilibrado atual recomendado pela documentação oficial da OpenAI |
| Edições rápidas, formatação | Tier rápido | Otimize por velocidade e baixo custo |
| Implementação padrão | Tier equilibrado para código | Use seu modelo de código default |
| Arquitetura complexa ou debugging | Tier de raciocínio profundo | Só troque quando a tarefa realmente exigir mais raciocínio |
| Review de codebase inteira | Tier equilibrado ou profundo | Comece no equilibrado, escale só se travar |

Veja o [pattern de Multi-Model Routing](../../patterns/multi-model-routing.md).

Hoje, a regra operacional mais segura é:

- manter a guidance do repositório orientada a tiers
- manter os nomes reais de modelos na config local
- verificar periodicamente os modelos de código recomendados na documentação oficial da OpenAI

Exemplos atuais da OpenAI que se encaixam nesses tiers:

- fast: `gpt-5.4-mini` ou `gpt-5.4-nano`
- balanced: `gpt-5.4`
- long-horizon coding: `gpt-5.2-codex`

## Memória

Trate a memória do Codex como uma camada externa, não como um toggle embutido
nesta configuração inicial.

Para contexto entre sessões, siga o [pattern de Memory Systems](../../patterns/memory-systems.md):

- Mantenha um `DECISIONS.md` ou um diretório `.codex/context/`
- Referencie isso no `AGENTS.md` raiz: "Read `.codex/context/` for project decisions"
- Adicione um servidor MCP de memória apenas se você realmente usar um
- Prefira arquivos simples de handoff em vez de complexidade de memória always-on quando o projeto for pequeno

## Servidores MCP

Habilite servidores em `config.toml` apenas para projetos que realmente precisam
deles — cada servidor ativo aumenta o custo de contexto.

```bash
# Override em tempo de execução
codex --mcp-server filesystem --mcp-server github "list open PRs"
```

Veja [config.toml](config.toml) para o setup de referência de MCP.

Mantenha pequeno o conjunto always-on. Um default enxuto costuma parecer com:

- filesystem
- git ou GitHub
- fetch ou retrieval de docs
- um sistema de memória se você realmente usar

Todo o resto deve ser específico de projeto ou habilitado apenas quando necessário.

## Orquestração de Tarefas

Codex não tem backlog embutido. Use a abordagem no nível do shell:

```bash
# Alimente tarefas a partir de um arquivo de backlog
cat .codex/tasks/next.md | codex --approval-mode on-request

# Encadeie tarefas
codex "implement feature X" && codex "write tests for feature X"
```

Veja o [pattern de Task Orchestration](../../patterns/task-orchestration.md)
para estratégias de gestão de fila.
