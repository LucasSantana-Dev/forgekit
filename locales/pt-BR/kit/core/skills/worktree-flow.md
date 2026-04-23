---
name: worktree-flow
description: Decida quando e como usar git worktrees para trabalho paralelo isolado
triggers:
  - worktree
  - isolar branch
  - branches paralelas
  - new worktree
  - isolamento de feature
---

# Worktree Flow

Decida se uma tarefa merece um git worktree isolado, crie-o com um nome de branch apropriado e mantenha o checkout original limpo.

## Steps

1. **Evaluate isolation need** — esta tarefa corre risco de conflitar com o trabalho atual?
2. **Choose branch name** — use prefixo `feature/`, `fix/`, `chore/` ou `refactor/`
3. **Create worktree** — `git worktree add ../<repo>-<branch> -b <branch>`
4. **Report** — nome da branch, caminho do worktree, motivo do isolamento

## Output

```text
Branch:    <prefix/short-name>
Path:      ../<repo>-<branch>
Reason:    <por que o isolamento era necessário>
```

## Rules

- Pare se o diretório não for um repositório git
- Nunca crie branches descartáveis sem motivo claro
- Prefira worktrees a stash para trabalho paralelo de vários dias
- Mantenha o checkout original na branch atual
