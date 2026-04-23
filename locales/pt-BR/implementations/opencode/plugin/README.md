# Plugins do OpenCode

## Orquestrador de Tarefas (`orchestrator.ts`)

Backlog centralizado de tarefas com dispatch automático — o cérebro que gerencia
o que será feito, quando e onde.

### O Problema

Abrir cada sessão manualmente e colar "continue with next priorities" é
repetitivo. Você está atuando como scheduler quando a máquina deveria fazer isso.

### Como Funciona

```
/plan  →  Analisa repositórios e cria backlog priorizado de tarefas
           ↓
orchestrator  →  A cada 60s, escolhe a próxima tarefa "ready"
           ↓
         Cria uma nova sessão no diretório do projeto da tarefa
           ↓
         Envia um prompt detalhado com a descrição da tarefa
           ↓
         Monitora a sessão → marca a tarefa como "done" quando fica idle + todos completos
           ↓
         Pega a próxima tarefa automaticamente
```

### Commands

| Command | O que faz |
|---------|-----------|
| `/plan` | Analisa projetos e cria plano de execução com tarefas priorizadas |
| `/backlog` | Mostra o status atual das tarefas (`in_progress`, `ready`, `backlog`, `done`) |
| `/next` | Dispara manualmente a próxima tarefa pronta |

### Task Schema

As tarefas são armazenadas em `~/.local/share/opencode/orchestrator/backlog.json`:

```json
{
  "tasks": [
    {
      "id": "task_abc123",
      "title": "Add rate limiting to API routes",
      "description": "Detailed instructions for the agent...",
      "directory": "/path/to/project",
      "priority": "high",
      "status": "ready",
      "agent": "architect",
      "tags": ["security", "api"]
    }
  ],
  "version": 1
}
```

### Ciclo de Vida da Tarefa

```
backlog → ready → in_progress → done
                       ↓
                    blocked
```

- **backlog**: planejada, mas aguardando dependências
- **ready**: pode ser despachada imediatamente
- **in_progress**: atribuída a uma sessão, agente em execução
- **done**: a sessão ficou idle e todos os todos foram concluídos
- **blocked**: a sessão deu erro ou foi apagada

### Configuração

```typescript
const MAX_CONCURRENT = 2        // máximo de sessões trabalhando ao mesmo tempo
const POLL_INTERVAL_MS = 60000  // verifica a cada 60s
```

### Planos (Tarefas Sequenciais)

Use `/plan` e o orquestrador dá suporte a relações pai-filho entre tarefas.
As tarefas filhas começam como `backlog` e são promovidas para `ready` conforme
as predecessoras terminam.

### Install

```bash
cp opencode/plugin/orchestrator.ts ~/.config/opencode/plugin/
```

---

## Retomada de Sessão (`session-resume.ts`)

Retoma automaticamente sessões interrompidas depois que o OpenCode reinicia.

Quando você reinicia o OpenCode, sessões com tarefas pendentes retomam de onde
pararam — sem necessidade de re-prompt manual em cada uma.

### Como funciona

1. **On idle**: salva os todos pendentes e o último prompt de cada sessão em `~/.local/share/opencode/session-state/`
2. **On startup** (com atraso de 8s): procura sessões com estado salvo, verifica se estão idle e envia um prompt de retomada com a lista de tarefas pendentes
3. **On new message**: rastreia o último prompt do usuário por sessão
4. **On session delete**: limpa o arquivo de estado

### Comportamento

- Apenas sessões com todos pendentes/em progresso são salvas
- Arquivos de estado com mais de 48h são descartados automaticamente
- Sessões que não existem mais são limpas
- A retomada usa `promptAsync`, então várias sessões podem retomar em paralelo
- Os arquivos de estado são apagados após uma retomada bem-sucedida

### Install

```bash
cp opencode/plugin/session-resume.ts ~/.config/opencode/plugin/
```

## Gerenciador de Sessões (`session-manager.ts`)

Gerencia automaticamente as sessões do OpenCode para manter a sidebar limpa em
vários projetos.

| Trigger | Action |
|---------|--------|
| A cada 30 min + startup | Apaga sessões com mais de 24h e sem mudanças de arquivo |
| A cada 30 min | Mantém no máximo 3 sessões por projeto, apagando as vazias mais antigas |
| Sessão fica idle | Prefixa o título com `[IDLE]` ou `[WIP]` |
| Sessão volta a ficar ativa | Remove o prefixo de status |

### Install

```bash
cp opencode/plugin/session-manager.ts ~/.config/opencode/plugin/
```

### Configuração

Edite as constantes no topo de `session-manager.ts`:

```typescript
const IDLE_THRESHOLD_MS = 2 * 60 * 60 * 1000     // 2h — quando marcar [IDLE]
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000   // 24h — quando apagar automaticamente
const MAX_SESSIONS_PER_PROJECT = 3                 // máximo de sessões mantidas por projeto
const AUTO_CLEAN_INTERVAL_MS = 30 * 60 * 1000     // frequência da limpeza
```

### Comportamento

- Sessões com mudanças de arquivo ainda não commitadas **nunca são apagadas automaticamente** — apenas recebem a tag `[WIP]`
- Sessões sem mudanças e com mais de 24h são apagadas automaticamente
- Quando você excede 3 sessões por projeto, as sessões vazias mais antigas são podadas
- Os prefixos de status são removidos automaticamente ao retomar uma sessão

## Otimizador de Performance (`perf-optimizer.ts`)

Auto-compacta sessões idle para que carreguem mais rápido quando você alternar
para elas.

A principal causa de lentidão ao trocar de sessão no OpenCode é renderizar
históricos grandes de mensagens no Tauri WebView. Este plugin compacta sessões
depois de 5 minutos em idle, reduzindo a contagem de mensagens e tornando a
troca quase instantânea.

| Trigger | Action |
|---------|--------|
| Sessão idle (>20 mensagens) | Resume/compacta a sessão |
| Sessão recebe nova atividade | Reseta a flag de compactação |

### Install

```bash
cp opencode/plugin/perf-optimizer.ts ~/.config/opencode/plugin/
```

## Notify (`notify.ts`)

Plugin de notificação nativa do macOS — sem interrupções sonoras desnecessárias.

| Event | Notification | Sound |
|-------|-------------|-------|
| Sessão idle | "Ready for next task" | Silent |
| `git push` | "Changes pushed" | Silent |
| `gh pr create` | "PR opened" | Ding |
| Testes falham | "Check test output" | Ding |

### Install

```bash
cp opencode/plugin/notify.ts ~/.config/opencode/plugin/
```

## Install All

```bash
cp opencode/plugin/*.ts ~/.config/opencode/plugin/
```
