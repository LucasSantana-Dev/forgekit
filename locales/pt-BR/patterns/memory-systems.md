# Sistemas de Memória

> Toda sessão deveria tornar a próxima melhor.

## O Problema

Você explica a mesma coisa para a IA toda segunda-feira. “Usamos trunk-based development.” “O middleware de auth está neste arquivo.” “Não faça mock do banco em testes de integração.” Sem memória persistente, toda sessão começa do zero.

## O Pattern

### Três Camadas de Memória

```
┌─────────────────────────────────────────────┐
│  Camada 1: Contexto estático (sempre lido) │
│  CLAUDE.md, .cursorrules, AGENTS.md        │
│  → Regras do projeto, arquitetura, comandos│
├─────────────────────────────────────────────┤
│  Camada 2: Memória dinâmica (sob demanda)  │
│  Arquivos de memória, decisões, padrões    │
│  → O que foi feito, por quê, o que evitar  │
├─────────────────────────────────────────────┤
│  Camada 3: Estado da sessão (efêmero)      │
│  Histórico da conversa, contexto atual     │
│  → Descartado quando a sessão termina      │
└─────────────────────────────────────────────┘
```

### O que lembrar

| Tipo de memória | Exemplo | Onde armazenar |
|-------------|---------|---------------|
| **Preferências do usuário** | “Nunca adicione co-authored-by em commits” | Memória global |
| **Feedback** | “Não faça mock do DB — isso já nos queimou” | Memória do projeto |
| **Decisões** | “Escolhemos Supabase em vez de Firebase por causa de RLS” | Memória do projeto |
| **Referências** | “Bugs do pipeline estão no projeto Linear INGEST” | Memória do projeto |
| **Gotchas** | “pre-commit roda type-check do monorepo inteiro, use HUSKY=0 para docs” | Arquivo de regras do projeto |

### O que NÃO lembrar

- Patterns de código (leia do codebase atual)
- Histórico do Git (use `git log` / `git blame`)
- Soluções de debugging (a correção está no código, o contexto está no commit)
- Detalhes efêmeros da tarefa atual (a sessão atual já lida com isso)

### Estrutura de Arquivos de Memória

```
.claude/memory/          # ou .serena/memories/, .cursor/context/
  MEMORY.md              ← Índice (sempre lido, mantido curto)
  user-preferences.md    ← Como trabalhar com este usuário
  project-decisions.md   ← Por que tomamos certas decisões
  gotchas.md             ← O que quebra se você não tomar cuidado
  integrations.md        ← Sistemas externos e como acessá-los
```

### O Pattern de Índice

Mantenha o arquivo de índice (`MEMORY.md`) como sumário, não como depósito:

```markdown
# Índice de Memória

## Usuário
- [user-preferences.md](user-preferences.md) — Estilo de trabalho, preferências de modelo

## Projeto
- [decisions.md](decisions.md) — Escolhas arquiteturais e seus motivos
- [gotchas.md](gotchas.md) — Armadilhas conhecidas
```

### Memória entre sessões

Para memória que persiste entre ferramentas e máquinas:
- Arquivos de memória **versionados em Git** (compartilhados com o time)
- Arquivos de memória **locais** (pessoais, ignorados pelo Git)
- **Serviços externos** de memória (vector DB, Supermemory, claude-mem)
- **Repo de dotfiles** (sincronizado via chezmoi)

### Higiene de memória

- **Atualize, não apenas acrescente** — corrija memórias desatualizadas em vez de adicionar novas informações contraditórias
- **Apague quando ficar obsoleto** — uma decisão revertida é pior do que nenhuma memória
- **Date suas memórias** — “merge freeze começa em 2026-03-05”, não “merge freeze na próxima quinta”
- **Inclua o porquê** — “usar Supabase RLS” não significa nada sem “porque precisamos de isolamento por tenant no nível de linha”

## Anti-Patterns

- **Acumular memória demais**: 50 arquivos de memória que ninguém lê
- **Memória desatualizada**: regras de 6 meses atrás que contradizem o código atual
- **Índice inchado**: `MEMORY.md` com 500 linhas (deveria ter <100)
- **Memórias duplicadas**: o mesmo fato em 3 arquivos diferentes
