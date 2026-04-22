---
name: resume
description: Recuperar estado da sessão de git, planos e PRs abertos, depois continuar da última fase concluída sem repetir trabalho
triggers:
  - resume
  - retomar sessão
  - continue de onde parei
  - continuar de onde parou
  - restaurar contexto
  - pick up where I left off
  - continue session
  - continue from checkpoint
  - where was I
  - restore context
---

# Resume

Recuperar de forma limpa de uma sessão pausada ou travada. Descubra o que estava em andamento, onde parou e o que fazer a seguir — sem repetir trabalho concluído.

## Quando Usar

- Nova sessão iniciando após uma queda, compactação ou handoff
- Branch tem trabalho não confirmado ou commits WIP e é unclear onde você estava
- `.agents/plans/*.json` ou `.loop-state.json` existe de uma execução anterior
- Um PR aberto no branch atual precisa que seu loop seja retomado

## Ordem de Detecção

1. **Handoff explícito** — ler `~/.claude/handoffs/<user>/latest.md` se presente; ele declara a próxima ação.
2. **Estado do plano** — escanear `.agents/plans/` para arquivos de estado `*.json`; o mais recente nomeia a fase atual e etapa.
3. **Estado do Git** — `git status`, `git log -3` e branch atual. Alterações não confirmadas ou um commit WIP significa que o trabalho parou na fase.
4. **Estado remoto** — `gh pr list --head <branch>` revela se o branch já foi enviado e é revisável.

## Árvore de Decisão

```
Arquivo de handoff presente?
├── Sim → seguir sua PRÓXIMA AÇÃO; arquivar após conclusão
└── Não
    ├── Estado do plano existe?
    │   ├── Sim → pular para última fase incompleta; pular fases concluídas
    │   └── Não
    │       ├── Branch tem commits WIP / diff não confirmado?
    │       │   ├── Sim → diagnosticar intenção a partir do diff, confirmar ou continuar
    │       │   └── Não → branch está limpo; perguntar ao usuário o que fazer
    │       └── PR aberto no branch?
    │           └── Sim → retomar o loop direcionando esse PR (veja skill `loop`)
```

## Regras

- **Nunca re-executar uma fase concluída.** Se uma fase tem um commit ou o plano a marca como concluída, pule-a.
- **Nunca adivinhar intenção apenas a partir do código.** Leia o plano, a última mensagem de commit e o handoff antes de decidir a próxima ação.
- **Não inicie um novo recurso** durante o resume. Se nenhum trabalho aberto for encontrado, devolva o controle ao usuário.
- **Delegue recuperação.** Arquivo de plano corrompido → usar `self-heal`. WIP não confirmado que deve ser guardado antes de fazer checkout de branch → usar `checkpoint`.

## Exemplo de Invocação

```bash
# início da sessão — automático em CLAUDE.md global do Claude Code
cat ~/.claude/handoffs/$USER/latest.md 2>/dev/null

# explícito
cat .agents/plans/*.json | head -1
git log --oneline -5 && git status --short
gh pr list --head "$(git branch --show-current)" --json number,state,title
```

## Saída

```text
Resume Report
─────────────
Source:   handoff | plan | git | pr
Phase:    <name> (step <N>/<M>)
Branch:   <name> @ <sha>
PR:       <url or none>
Next:     <concrete action to take>
Skipped:  <phases already done>
```

## Skills Relacionadas

- `checkpoint` — guarde WIP não confirmado antes de mudar de branches durante o resume
- `self-heal` — recuperar de erros encontrados ao retomar (plano corrompido, arquivos perdidos)
- `loop` — o ciclo autônomo que resume re-entra na fase certa
- `context-save` — escrever estado antes de uma pausa planejada para que o próximo resume tenha um âncora limpa

## Condições de Saída

- **Plano + fase encontrado**: imprimir relatório, fazer handoff para `loop` na fase detectada
- **Nenhum estado encontrado**: imprimir "nada para retomar" e sair, não iniciar novo trabalho
- **Estado ambíguo** (múltiplos planos, branch divergente): imprimir descobertas, pedir ao usuário para escolher
- **Arquivo de plano corrompido**: delegar para `self-heal`; não deletar evidência
