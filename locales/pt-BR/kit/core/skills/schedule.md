---
name: schedule
description: Defina e gerencie execuções recorrentes automatizadas de agentes — monitoramento de CI, updates de dependência, scans de segurança
triggers:
  - schedule
  - recorrente
  - cron
  - rodar a cada
  - automatizar em agenda
---

# Schedule

Defina tarefas recorrentes de agentes que rodam sem acionamento manual.

## Common Schedules

| Tarefa | Frequência | Agent | Skill |
|---|---|---|---|
| Auditoria de dependências | semanal | reviewer | secure |
| Check de saúde do CI | em atualização de PR | explorer | verify |
| Grooming de backlog | semanal | orchestrator | plan |
| Scan de segurança | diário | reviewer | secure |
| Limpeza de contexto | ao fim de cada sessão | orchestrator | context |
| Sync de memória | ao fim de cada sessão | orchestrator | resume |

## Definition Format

```json
{
  "name": "<nome da tarefa>",
  "cron": "<expressão cron ou palavra-chave>",
  "agent": "<nome do agente>",
  "skill": "<skill a invocar>",
  "scope": "<arquivos ou diretórios>",
  "notify": "on-failure | always | never"
}
```

## Keywords

- `on-pr` — rodar quando um PR é criado ou atualizado
- `on-push` — rodar em todo push para a branch
- `on-session-start` — rodar no início de cada sessão do agente
- `on-session-end` — rodar no fim de cada sessão
- `daily` / `weekly` / `monthly` — agendas de calendário

## Rules

- Tarefas agendadas rodam no tier viável mais barato
- Nunca agende ações destrutivas (deploy, force push)
- Em falha: tente uma vez de novo, depois registre e continue
- Resultados agendados retroalimentam a próxima sessão via memória
- Mantenha a agenda mínima — no máximo 3-5 tarefas recorrentes
