---
status: published
audience: team
---

# Governança: Conformidade e Segurança de Dados

Link único para adoção no trabalho. Formato perguntas e respostas para times de segurança/conformidade.

---

## Dados e Privacidade

**P: O toolkit envia dados para servidores externos?**  
R: Não. Todo indexing, skills e lógica de agent executam na sua máquina. O índice RAG é SQLite local.

**P: E quanto à ferramenta de IA em si (Claude, Copilot, etc.)?**  
R: O toolkit é agnóstico de vendor. Sua escolha de ferramenta de IA determina o fluxo de dados (ex: Copilot pode enviar para Microsoft; Claude para Anthropic). O toolkit em si é zero-phone-home.

**P: Posso auditar o que é indexado?**  
R: Sim. Veja `kit/rag/scripts/reindex.sh` para lógica de indexing. Padrões de exclusão: `.env`, `*.pem`, `node_modules/`, caminhos de segredos. Customize em `~/.claude/rag-index/config.json`.

---

## Segredos e Credenciais

**P: A ferramenta de IA pode ver meu arquivo `.env`?**  
R: Apenas se você colar em um prompt. O índice RAG explicitamente exclui `.env`, `.pem` e arquivos de credenciais por padrão.

**P: E se eu quiser isolamento de segredos mais rigoroso?**  
R: Use padrões fatiados. Regras privadas vivem em `~/.claude/standards/security.md` (não versionado). Referencie-as de regras públicas via diretiva include.

**P: Isso funciona com credential managers?**  
R: Sim. Use variáveis de ambiente em vez de arquivos. O toolkit evita ler segredos; você controla que contexto você cola.

---

## Dependências e Supply Chain

**P: Como vocês verificam skills e agents?**  
R: Skills sofrem **code review antes de landing**. Cada PR requer sign-off do reviewer. Sem auto-merge de mudanças de tooling.

**P: E se uma skill tem um problema de segurança?**  
R: Skills descontinuadas são marcadas `status: deprecated` no frontmatter. Versões mais novas são destacadas em busca. Veja metadados em `kit/core/skills/*/skill.md`.

**P: Posso fazer fork e customizar skills para meu time?**  
R: Sim. Skills são MIT-licensed. Copie para seu repo privado, customize, commit. O índice RAG pode indexar suas skills locais também (veja docs de setup).

---

## Auditoria e Conformidade

**P: Isso gera audit logs?**  
R: O toolkit não. Sua ferramenta de IA sim (Copilot, Claude registram chamadas de API; Gemini tem audit trails). Combine com specs (`docs/specs/`) para criar uma **trilha de auditoria de decisão** (o que mudou, por quê, quem aprovou).

**P: Posso enforçar quais skills são permitidas?**  
R: Sim. Em seu arquivo de rule, adicione uma seção `## Permitted Skills` listando frases de ativação permitidas. A ferramenta de IA vai enforçar.

**P: Como compro conformidade em uma auditoria?**  
R: Compartilhe:
1. Arquivo(s) `rules/` — seus padrões como código
2. Pasta `docs/specs/` — decisões e approvals
3. `docs/roadmap.md` — auto-gerado a partir de specs
4. Histórico Git — commits com issues/PRs linkadas

---

## Dual-Branch vs Chezmoi

**P: Por que vocês usam branches `main` vs `personal` em vez de chezmoi?**  
R: Ambas abordagens funcionam. Templates Chezmoi são padrão no ecossistema open-source (usados por `wshobson/agents`, outros). Escolhemos dual-branch para:
- Simpler para repos single-maintainer
- Visibilidade explícita (diff mostra o que é adicionado para uso pessoal)
- Sem overhead de sintaxe de template

**Se seu time prefere chezmoi**: Migre convertendo seções de rule para condicionais `chezmoi:role="personal"`. Abra uma issue se você quer um migration script.

---

## Checklist de Governança

Antes de adotar no seu time:

- [ ] Arquivo de rule copiado e customizado para sua codebase
- [ ] Sem segredos em rule file ou specs
- [ ] `.env.example` em place (sem valores reais)
- [ ] Setup de padrões fatiados para governança privada
- [ ] RAG index reindex hook executando (semanal via cron ou CI)
- [ ] Template de spec criado (`docs/specs/TEMPLATE.md`)
- [ ] CI verde em markdown-links e lint
- [ ] Pelo menos um membro do time testou `/recall` e `/plan`
- [ ] Time de segurança revisou rule file e diagrama de data-flow
- [ ] Handoff / session management documentado (veja `patterns/session-management.md`)

---

## Mais Ajuda

- **Diagrama de fluxo de dados**: Veja `patterns/multi-repo-work.md`
- **Setup de regras privadas**: Estrutura de pasta `~/.claude/standards/`
- **Health checks MCP**: `kit/core/skills/mcp-health.md`
- **Secrets scanning**: `kit/core/skills/secure.md`

---

Compartilhe este doc no trabalho. Ele responde as perguntas mais comuns de governança.
