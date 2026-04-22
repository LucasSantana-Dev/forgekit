# Implementação para OpenCode

Implementação de referência dos patterns do toolkit para [OpenCode](https://opencode.ai).

## Setup

```bash
# Config principal do OpenCode
cp opencode.jsonc ~/.config/opencode/opencode.jsonc
cp dcp.jsonc ~/.config/opencode/dcp.jsonc

# Config do plugin oh-my-openagent (se estiver usando oh-my-openagent)
cp oh-my-openagent.jsonc ~/.config/opencode/oh-my-opencode.jsonc
```

## oh-my-openagent

[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) substitui os
arquivos locais de plugin `.ts` por um plugin npm com tudo incluído. Ao usá-lo,
pule a etapa `plugin/` acima.

Adicione aos plugins de `opencode.jsonc`:

```json
{ "plugin": ["oh-my-openagent"] }
```

Configure agentes e roteamento por categoria em `oh-my-openagent.jsonc`. O campo
`prompt_append` do Sisyphus injeta automaticamente as suas regras de `AGENTS.md`
em toda sessão.

Se você instalar com `forge-kit`, rode com `--oh-my-compat` para copiar esta
configuração de referência para `~/.config/opencode/oh-my-opencode.jsonc` quando
ela ainda não existir.

## Plugins

| Plugin               | Pattern                                                    | Descrição                                               |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `orchestrator.ts`    | [Task Orchestration](../../patterns/task-orchestration.md) | Backlog centralizado, auto-dispatch, monitoramento de conclusão |
| `session-manager.ts` | [Session Management](../../patterns/session-management.md) | Auto-cleanup, marcação de status, limites por projeto   |
| `session-resume.ts`  | [Session Management](../../patterns/session-management.md) | Persiste e retoma trabalho interrompido                 |
| `perf-optimizer.ts`  | [Session Management](../../patterns/session-management.md) | Auto-compacta para alternar mais rápido                 |
| `notify.ts`          | —                                                          | Notificações nativas do SO para eventos                 |

## Commands

| Command      | Descrição                                         |
| ------------ | ------------------------------------------------- |
| `/plan`      | Analisa repositórios e cria backlog priorizado    |
| `/backlog`   | Mostra o status das tarefas em todos os projetos  |
| `/next`      | Dispara manualmente a próxima tarefa pronta       |
| `/resume`    | Carrega estado do git e sugere a próxima tarefa   |
| `/verify`    | Roda lint + type-check + test + build             |
| `/ship`      | Commit + push + criação de PR                     |
| `/commit`    | Conventional commit sem push                      |
| `/test`      | Executa testes e reporta os resultados            |
| `/clean`     | Limpa artefatos de build                          |
| `/validate`  | Scorecard completo de saúde do repo               |
| `/ecosystem` | Health check em todos os repositórios             |

## Adapting to Other Tools

Cada plugin implementa um pattern. Para portar para outra ferramenta:

1. Leia a documentação do pattern em `patterns/`
2. Use o plugin como referência da lógica
3. Implemente usando a API de extensão da sua ferramenta

Por exemplo, `orchestrator.ts` poderia virar:

- uma **extensão do Cursor** usando a API do Cursor
- um **script shell** com `claude --session-id` para Claude Code
- uma **task do VS Code** com automação de workspace
