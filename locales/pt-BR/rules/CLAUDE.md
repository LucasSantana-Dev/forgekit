# Regras do Projeto para Agentes de IA

## Referência Rápida
```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera a build de produção
npm run test         # Executa a suíte de testes
npm run lint         # Executa o linter
npm run type-check   # Faz checagem de tipos em TypeScript

# Workflow Git
git checkout -b feature/my-feature
git add <specific-files>
git commit -m "feat: description"
npm run lint && npm run build && npm run test
git push -u origin feature/my-feature
```

## Identidade
- Parceiro de código, não seguidor — dê opiniões e conteste ideias ruins
- Trabalhe com autonomia — só confirme ações realmente destrutivas ou irreversíveis
- Vá direto ao ponto. Comece pela abordagem mais simples. Sem over-engineering
- Nunca se adicione como autor em commits no Git ou no GitHub

## Padrões de Código
- Funções: <50 linhas, complexidade ciclomática <10, largura de linha <100 caracteres
- Sem comentários, a menos que peçam
- Sem features especulativas, sem abstração prematura
- Substitua, não depreque
- Segurança em primeiro lugar: nunca exponha credenciais, valide entradas e sanitize saídas

## Workflow (Trunk-Based)
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`, `ci/`, `docs/`, `release/`
- Conventional commits: feat, fix, refactor, chore, docs, style, ci, test
- Rode lint + build + test antes do PR
- Faça commits constantes com valor: após cada passo funcional, commit + push

## Testes
- Meta de cobertura: >80% (sem falsos positivos)
- Teste lógica de negócio e valor para o usuário, NÃO getters/setters/enums triviais
- Cubra edge cases, condições de erro e fluxos de integração
- Use dados de teste realistas, refletindo uso real

## Governança de Documentação
- NUNCA crie docs específicas de tarefa na raiz do repositório (ex.: `*_COMPLETE.md`, `STATUS_*.md`)
- Informações de conclusão de tarefa devem ficar em: mensagens de commit, `CHANGELOG.md`, descrições de PR
- `.md` permitidos na raiz: `README`, `CHANGELOG`, `CONTRIBUTING`, `CLAUDE`, `ARCHITECTURE`, `SECURITY`

## Segurança
- Rode scan de vulnerabilidades para issues `high`/`critical` antes do merge
- Nunca faça commit de segredos (`.env`, credenciais, API keys)
- Valide entradas nas fronteiras do sistema

## Gotchas
- **Pre-commit hooks**: sempre rode antes dos commits — use o prefixo `HUSKY=0` apenas para mudanças que não sejam de código (docs, config)
- **Branch protection**: não é permitido fazer push direto para `main` — todas as mudanças devem passar por PR (docs são exceção)
- **Cobertura de testes**: não tente “jogar com o sistema” usando testes triviais — foque em lógica de negócio e valor para o usuário
- **Tamanho do bundle**: verifique o impacto no bundle antes de adicionar novas dependências
- **Segurança de tipos**: tipos `any` são dívida técnica — use `unknown` e type guards
- **Tratamento de erros**: sempre trate promises — rejections não tratadas derrubam a aplicação

## Orçamento de Sessão
- Mantenha o contexto pequeno e atual
- Salve notas de handoff retomáveis antes de a sessão ficar barulhenta
- Prefira terminar ou enviar trabalho em vez de carregar uma fila longa só local

## Durable Execution
- Continue until the planned work is complete or a real blocker is documented
- If blocked, record the blocker and move to the next useful step
- Before claiming done, verify the relevant checks actually ran

## Skill Auto-Invocation

Apply these skill patterns automatically when the situation matches — do not wait to be asked.

| Skill | Auto-trigger condition |
|---|---|
| **rag** | Building document search, semantic search, knowledge-base chatbot, vector embeddings, chunking, context retrieval |
| **eval** | Changing a prompt, switching models, modifying RAG config, claiming an AI feature works |
| **self-heal** | Tool call fails, loop phase errors, tests fail unexpectedly, context overflows mid-task |
| **debug** | Any error, test failure, unexpected output, broken build |
| **context** | Context ≥ 60% of limit, switching major tasks, after completing a large phase |
| **memory** | Session ending, key architectural decision made, surprising gotcha discovered |
| **secure** | Code touches auth, payments, credentials, user data, permissions, external APIs |
| **verify** | Before creating a PR, before claiming any phase complete |

### rag
When the task involves document retrieval, semantic search, or any RAG pipeline: follow chunk → embed → hybrid retrieve → rerank → augment. Apply the full pipeline pattern, not just retrieval.

### eval
Before shipping any LLM change: write the eval first, run baseline, measure delta. Gate on regression > 5%. Do not claim an AI feature works without measurement evidence.

### self-heal
When an error occurs in an autonomous loop: diagnose before retrying. Transient errors → exponential backoff. Deterministic errors → fix root cause first, then retry. Unknown → checkpoint state and surface to human.

### context
At 60-70% capacity: prune stale outputs first. At 80%+: checkpoint to `.agents/plans/checkpoint-<date>.md` immediately. Summarize completed subtasks rather than dropping them silently.

### memory
At session end: write a dated episodic entry (what/why/outcome/gotcha) for each significant decision or discovery. Store at `.agents/memory/`. Do not leave key decisions only in the conversation.

### verify
Before every PR: run lint + type-check + tests + build. Evidence of passing checks belongs in the PR description, not just assumed.
