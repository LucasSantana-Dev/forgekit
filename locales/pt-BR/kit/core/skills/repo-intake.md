---
name: repo-intake
description: Faça onboarding rápido em um repositório desconhecido antes de mudar qualquer coisa
triggers:
  - repo novo
  - onboard
  - o que é este projeto
  - explorar codebase
  - visão geral do repo
---

# Repo Intake

Leia docs locais, detecte a stack, resuma a estrutura e sinalize bloqueadores — antes de tocar em qualquer código.

## Steps

1. **Read local instructions** — verifique `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`
2. **Detect the stack** — examine manifests de pacote, lockfiles, Dockerfiles e configs de CI
3. **Map the structure** — identifique entrypoints, layout de source, diretórios de teste e scripts
4. **List primary commands** — run, test, build, lint, deploy (somente o que realmente existir)
5. **Flag blockers** — arquivos de ambiente ausentes, auth, deps quebradas, passos de setup pouco claros

## Output

```text
Repo:      <name>
Stack:     <language, framework, package manager>
Commands:  <run | test | build | lint>
Blockers:  <missing auth | broken deps | none>
Next:      <top 1-3 actions>
```

## Rules

- Leia as docs antes de varrer o código
- Nunca adivinhe comandos que não estão presentes no repo
- Pare se a raiz do repo estiver pouco clara ou ambígua
- Sinalize passos de setup ausentes em vez de inventá-los
