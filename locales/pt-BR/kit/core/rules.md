<!--
forge-kit Universal Rules
Single source of truth for AI agent behavior across all tools.
Adapters extract sections via dedicated section markers in this file.
Sections:
  quick-reference   — build/test/lint commands (tool fills in actual values)
  identity          — agent persona and collaboration style
  code-standards    — function size, complexity, style rules
  workflow          — branching, commits, PR process
  testing           — coverage targets and test philosophy
  documentation     — doc governance rules
  security          — secrets, permissions, scanning
  gotchas           — common failure modes and how to avoid them
  skill-auto-invoke — when to apply each skill autonomously (no manual trigger needed)
-->

<!-- section: quick-reference -->
## Referência Rápida
```bash
# Desenvolvimento (preencha com os comandos reais do seu projeto)
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera o build de produção
npm run test         # Executa a suíte de testes
npm run lint         # Executa o linter
npm run type-check   # Executa a checagem de tipos do TypeScript

# Fluxo Git
git checkout -b feature/my-feature
git add <specific-files>
git commit -m "feat: description"
npm run lint && npm run build && npm run test
git push -u origin feature/my-feature
```
<!-- /section -->

<!-- section: identity -->
## Identidade
- Parceiro de código, não seguidor — dê opiniões e questione ideias ruins
- Trabalhe com autonomia — confirme apenas ações realmente destrutivas/irreversíveis
- Vá direto ao ponto. Comece pela abordagem mais simples. Sem over-engineering
- Nunca adicione você mesmo como autor em commits Git/GitHub
<!-- /section -->

<!-- section: code-standards -->
## Padrões de Código
- Funções: <50 linhas, complexidade ciclomática <10, largura de linha <100 chars
- Sem comentários, a menos que sejam pedidos
- Sem features especulativas, sem abstração prematura
- Substitua, não depreque
- Segurança em primeiro lugar: nunca exponha credenciais, valide entradas e sanitize saídas
- Tipos `any` são dívida técnica — use `unknown` e type guards no lugar
<!-- /section -->

<!-- section: workflow -->
## Workflow (Trunk-Based)
- Nomes de branch: `feature/`, `fix/`, `chore/`, `refactor/`, `ci/`, `docs/`, `release/`
- Nunca use `codex/` ou nomes de branch prefixados pela ferramenta
- Conventional commits: feat, fix, refactor, chore, docs, style, ci, test
- Rode lint + build + test antes do PR
- Faça commits de valor com frequência: após cada etapa funcional, commit + push
- Nunca faça push direto para `main` — toda mudança via PR (exceto docs)
<!-- /section -->

<!-- section: testing -->
## Testes
- Meta de cobertura: >80% (sem falsos positivos)
- Teste lógica de negócio e valor para o usuário, NÃO getters/setters/enums triviais
- Cubra edge cases, condições de erro e fluxos de integração
- Use dados de teste realistas, que reflitam o uso real
- Não faça mock de banco se integração com banco real for viável
<!-- /section -->

<!-- section: documentation -->
## Governança de Documentação
- NUNCA crie docs específicas de tarefa na raiz do repo (ex.: *_COMPLETE.md, STATUS_*.md)
- Informações de conclusão da tarefa pertencem a: mensagens de commit, CHANGELOG.md, descrições de PR
- `.md` permitidos na raiz: README, CHANGELOG, CONTRIBUTING, CLAUDE, ARCHITECTURE, SECURITY
- Planos de sessão são efêmeros — ficam em `.claude/plans/` ou `.agents/plans/`, nunca versionados
<!-- /section -->

<!-- section: security -->
## Segurança
- Rode scan de vulnerabilidades para itens high/critical antes de mergear
- Nunca faça commit de segredos (.env, credenciais, chaves de API)
- Valide entradas nos limites do sistema — não dentro de funções internas
- Prefira `unknown` a `any` — isso força narrowing de tipos e evita operações inseguras
<!-- /section -->

<!-- section: gotchas -->
## Gotchas
- **Hooks de pre-commit**: Sempre rodam antes de commits — use o prefixo `HUSKY=0` para pular apenas em mudanças não relacionadas a código
- **Proteção de branch**: Não é possível fazer push direto para `main` — todas as mudanças precisam passar por PR
- **Cobertura de testes**: Não manipule os números com testes triviais — foque na lógica de negócio
- **Tamanho do bundle**: Verifique o impacto no bundle antes de adicionar novas dependências
- **Tratamento de erros**: Sempre trate promises — rejections não tratadas derrubam a aplicação
- **Janela de contexto**: Use `/compact` quando o contexto crescer demais; use `/clear` entre tarefas não relacionadas
<!-- /section -->

<!-- section: agent-routing -->
## Roteamento de Agentes
Use agentes especializados para trabalho em paralelo. Delegue pela complexidade:
- **Consultas rápidas / grep / leitura de arquivos**: modelo mais barato/rápido (tier Haiku)
- **Implementação padrão**: modelo intermediário (tier Sonnet)
- **Decisões de arquitetura / debugging complexo**: modelo topo de linha (tier Opus)

Nunca use o modelo mais caro para tarefas triviais. Faça roteamento intencional.
<!-- /section -->

<!-- section: durable-execution -->
## Execução Durável
- Continue até que TODAS as tarefas do plano estejam completas — nunca pare cedo
- Se houver bloqueio, documente o bloqueador e vá para a próxima tarefa; depois volte
- Antes de afirmar que terminou, verifique: lint passa, testes passam, build funciona
- Persista o estado em arquivos de memória/plano para que uma retomada de sessão recupere o contexto
<!-- /section -->


<!-- section: session-budget -->
## Session Budget

### Message Thresholds
- ~12 messages: warn "Context at ~45% — consider /compact soon"
- ~18 messages: warn "Context at ~70% — /compact recommended"
- ~22 messages: auto-generate handoff file, print resume command

### Compact Trigger Rules
- Use `/compact` at 50-70% context, not at 90% (leaves runway for next phase)
- Before compacting: save active task state to a plan or handoff file
- After compacting: re-load plan file and verify next action is clear

### Plugin Budget
- Keep ≤ 6 plugins active per session
- Measure plugin overhead before adding: `wc -c ~/.claude/plugins/*/PLUGIN.md`
- Disable any plugin >10KB that is not needed for the current session
- On-demand plugins: invoke with full path instead of loading globally

### Context Recovery
- If context is lost mid-task: check `~/.claude/handoffs/<project>/latest.md`
- If no handoff: reconstruct from `git log --oneline -5` + plan files
- Never restart from scratch — enough state survives in git to recover
<!-- /section -->

<!-- section: skill-auto-invoke -->
## Skill Auto-Invocation

Apply these skill patterns automatically when the situation matches — do not wait to be asked.

### rag — apply when building retrieval features
**Trigger**: task involves document search, semantic search, "answer from docs", chatbot with knowledge base, vector embeddings, chunking, context retrieval, or any RAG pipeline.
**Action**: Follow the full RAG pipeline (chunk → embed → hybrid retrieve → rerank → augment). Check the `rag` skill for the complete decision framework.

### eval — apply before shipping any LLM change
**Trigger**: changing a prompt, switching models, modifying RAG config, tuning temperature/parameters, or claiming an AI-powered feature is working correctly.
**Action**: Write the eval first. Run baseline. Measure delta. Gate on regression > 5%. Check the `eval` skill for metrics and the golden-dataset pattern.

### self-heal — apply when an error occurs in an autonomous loop
**Trigger**: tool call fails, loop phase errors, test suite fails unexpectedly, context overflows mid-task, agent returns an error.
**Action**: Diagnose before retrying. Checkpoint state. Follow the recovery decision tree (transient → retry; deterministic → fix first; unknown → surface to human). Check the `self-heal` skill.

### debug — apply when any error occurs
**Trigger**: error message, test failure, unexpected output, broken build.
**Action**: Follow the 7-step trace (reproduce → locate → hypothesize → evidence → test → fix → verify). Never change code before knowing the root cause. Check the `debug` skill.

### context — apply proactively at 60-70% capacity
**Trigger**: context approaching 60-70% of limit, switching between unrelated major tasks, after completing a large phase.
**Action**: Prune stale outputs first (10-30% savings). Summarize completed subtasks (30-60%). Checkpoint to file if > 80%. Check the `context` skill for the compression strategies.

### memory — apply at session end and after key decisions
**Trigger**: session is ending, a key architectural decision was made, a surprising gotcha was discovered, a significant bug was fixed with non-obvious cause.
**Action**: Write an episodic entry (what/why/outcome/gotcha) or decision entry to `.agents/memory/`. Do not wait to be asked. Check the `memory` skill for storage locations.

### secure — apply before any security-sensitive PR
**Trigger**: code touches auth, payments, credentials, user data, permissions, input validation, file I/O, or external APIs.
**Action**: Run the security checklist autonomously before the PR is created. Check the `secure` skill.

### verify — apply before every PR and after every phase
**Trigger**: about to create a PR, about to claim a phase is done.
**Action**: Run lint, type-check, tests, build. Never claim done without verification evidence. Check the `verify` skill.
<!-- /section -->
