# Índice de Memória

## Usuário
- [Preferências do Usuário](user-preferences.md) - estilo de código, preferências de workflow e stack técnica
- Modelo padrão: Sonnet (Opus apenas para arquitetura complexa)
- Prefere setup enxuto, sem bloat e sem features especulativas
- Commits constantes: após cada passo funcional, commit + push

## Projeto
- [Decisões do Projeto](project-decisions.md) - decisões de arquitetura e seus motivos
- TypeScript + React + Node.js + PostgreSQL
- Monorepo com Turborepo e workspaces pnpm

## Contexto da Tarefa
- Sprint atual: autenticação e segurança de API (`TASK-001`, `TASK-002`)
- Bloqueios conhecidos: migration do banco para filtros do dashboard (`TASK-003`)
- Próximo passo: implementar rate limiting após concluir o fluxo de autenticação
