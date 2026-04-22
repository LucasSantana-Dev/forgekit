# Git Worktrees para Trabalho Concorrente com Agentes de IA

> Um worktree por sessão de agente. Zero conflito entre branches. Isolamento total.

## O Problema

Várias sessões de agente trabalhando no mesmo repositório geram caos. A sessão A está na branch `feature/auth`. A sessão B muda para `main` para verificar algo. A próxima chamada de ferramenta da sessão A falha porque a branch sumiu. Ou pior: a sessão B faz force-push por cima do trabalho da sessão A.

Soluções tradicionais não resolvem:
- Clones separados: desperdiçam disco e sincronizam devagar
- Bloqueio de branch: reduz paralelismo
- Coordenação manual cuidadosa: exige intervenção humana o tempo todo

O insight é que Git worktrees fornecem diretórios de trabalho isolados compartilhando o mesmo repositório `.git`. Cada sessão de IA recebe seu próprio worktree. Elas não conseguem interferir umas nas outras.
