# ai-dev-toolkit para Times

Uma base segura para governança, agnóstica a fornecedores, para Desenvolvimento Assistido por IA e fluxos orientados a Agents. Construída a partir de experiência em produção em 10+ repositórios, destilada em padrões portáveis que qualquer time pode adotar.

## TL;DR

**O que é** — uma biblioteca de convenções + ferramenta executável que transforma uso ad-hoc de IA em uma prática de engenharia repetível e mensurável.

**O que seu time ganha**
- Definições consistentes de skill / rule / agent nos projetos, para que ferramentas de IA se comportem do mesmo jeito independente de qual IDE ou CLI cada membro do time prefere.
- Um engine RAG local que mantém o conhecimento institucional recuperável em segundos — nenhuma perda de contexto entre sessões, nenhuma pergunta repetida.
- Specs leves por feature + roadmaps auto-gerados que substituem wikis obsoletos e desvio de Jira com uma fonte única de verdade nativa de git e viva.
- Padrões seguros: nenhum armazenamento SaaS de terceiros, nenhuma saída de dados na nuvem, toda recuperação roda localmente a partir de embeddings MiniLM em um arquivo SQLite.

**O que sua organização ganha**
- Uma camada de convenção auditável, in-repo — rules vivem em markdown, não escondidas em configurações de ferramentas.
- Uma história de conformidade: nenhuma ferramenta específica de Anthropic/OpenAI/Cursor no `main` (isso vive no branch `personal`); `main` é a superfície segura para trabalho.
- Velocidade de entrega: os skills têm opiniões sobre quando usar RAG, quando especificar, quando entregar, e quando parar. Menos churn, mais PRs entregues.

## Os três pilares

### 1. Desenvolvimento Assistido por IA (AAD)
Cada skill em `kit/core/skills/` é um playbook "como usar IA para X" — debugging, refatoração, review de código, geração de testes, migração, observabilidade. Skills são apenas markdown, então qualquer ferramenta de IA que leia docs do projeto (Claude Code, Cursor, Copilot Chat, Codex) os pega automaticamente.

### 2. Desenvolvimento Orientado a Agents (ADD)
`kit/core/agents.json` + `kit/core/skills/auto-invoke.md` deixam agents rotear trabalho para si mesmos baseado em verbos de tarefa (plan, ship, fix, refactor, review). Times com setups de agents customizados (LangGraph, AutoGen, ferramentas internas) conectam ao mesmo registry.

### 3. Convenções compartilhadas como código
`rules/CLAUDE.md`, `rules/CODEX.md`, `rules/GEMINI.md`, `rules/COPILOT.md` expressam as mesmas rules em cada dialeto de ferramenta — escritas uma vez em `kit/core/rules.md`, renderizadas por ferramenta. Nenhum "qual era nossa convenção mesmo" em threads de Slack.

## Caminho de adoção (2 semanas até o time todo)

| Semana | Ação | Responsável |
|---|---|---|
| 1 | Clone `ai-dev-toolkit` + `ai-dev-toolkit-setup`. Rode `bash scripts/install-rag.sh` em uma máquina dev com `RAG_WORK_MODE=1` e globs de work-repo. Meça tempo para o primeiro recall útil. | Você |
| 1 | Adicione `rules/<your-tool>.md` ao seu repositório principal. Confirme que agents o respeitam. | Você |
| 2 | Pilot de spec flow em uma feature em andamento. Mostre ao time o `docs/roadmap.md` auto-gerado. | Você + 1 colega |
| 2 | Rode `install-rag.sh` em 2-3 máquinas adicionais com o mesmo `RAG_REPOS`. `.env` compartilhado em um secret store. | Time |
| Depois | Meça: tempo de PR-body-to-merge, taxa de hit "alguém já consertou isso", ciclo spec-to-ship. | Gestor de engenharia |

## Governança

- **Nenhum serviço de terceiros.** Embeddings rodam localmente (`all-MiniLM-L6-v2`, modelo 90MB); índice SQLite fica em disco.
- **Nenhuma telemetria.** O log de query é apenas local (`~/.claude/rag-index/queries.sqlite`); você pode desabilitar com `RAG_QLOG=off`.
- **Nenhuma vinculação a Anthropic/OpenAI/Cursor no `main`.** Handoff, session-resume, e skills específicos de vendor-CLI vivem no branch `personal`. `main` é markdown, Python e Bash agnósticos a fornecedor.
- **Superfície auditável** — todas as rules são arquivos markdown no repo; cada skill lista suas condições de trigger e efeitos colaterais. Nenhuma config opaca.
- **Observabilidade opt-in** — `kit/rag/scripts/report.py` gera um resumo semanal de stats de índice, hits de query, e chunks obsoletos. Compartilhável; sem tracking por usuário.

## Ganhos concretos que podemos mostrar

De uso em produção no time de autoria (10+ repos, 6 meses):
- Tempo de onboarding cold-session para um novo repo: **~20 min → ~2 min** (leia o roadmap agregado + rode um recall RAG).
- Overhead de token de contexto de sessão após a mudança de slicing CLAUDE.md: **−62%** (`~/.claude/CLAUDE.md` reduzido 133→50 linhas; o resto carrega sob demanda).
- Baseline eval em um dataset de 50 queries cobrindo questões reais de recall: **MRR 0.68 · Hit@3 0.72 · Hit@5 0.76** (hybrid BM25 + cosine + rerank de cross-encoder).
- Roadmap por-repo auto-atualizado: zero arquivos de roadmap mantidos manualmente nos 7 repos ativos.

(Reproduza esses em seu próprio corpus — `tools/release.py`, `kit/rag/scripts/report.py`, e `kit/rag/eval/run.py` são os scripts que os geraram.)

## O que isto NÃO é

- Não é um gerador de código ou um auto-pilot. É uma camada de convenção + retrieval; humanos ainda escrevem o código.
- Não é um substituto para o assistente de IA de sua IDE. Torna qualquer IA que você usa mais inteligente sobre *seu* codebase e práticas de time.
- Não é um vendor lock-in. Troque Claude por Codex, Cursor, Copilot — rules renderizam por ferramenta; skills são markdown.
- Não é um SaaS. Nenhum dashboard, nenhum login, nenhuma conta de org. Tudo vive no repo + seu laptop.

## Próximos passos para uma apresentação no trabalho

Faça pull deste repo, então abra:
1. `docs/for-teams.md` (este arquivo) — elevator pitch.
2. `kit/rag/README.md` — RAG deep-dive com benchmarks.
3. `kit/specs/README.md` — spec flow, por que derived state bate hand-curated.
4. `kit/core/skills/` — browse o catálogo de skills para ver o que é opinionado.
5. `rules/CLAUDE.md` — exemplo da saída de rule-rendering por ferramenta.

O **branch `personal`** contém o mesmo toolkit mais skills de workflow Codex/Claude-handoff. Use `main` para trabalho, `personal` para solo.

## Contato + contribuição

Abra PRs para `main` com rules/skills/patterns que são geralmente aplicáveis. PRs que adicionam skills específicos de ferramenta ou workflow pertencem ao `personal`. Veja `CONTRIBUTING.md` para o gate completo.
