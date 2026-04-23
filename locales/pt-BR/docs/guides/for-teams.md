---
status: published
audience: team
---

# Para Times: Adoção, Governança e Conformidade

Apresente isso ao seu time: ganhos de produtividade, gates de qualidade e clareza de conformidade em um toolkit.

## Os Três Pilares

### 1. Produtividade — Desenvolvimento Assistido por IA (AAD)
Codifique seus padrões uma vez; IA os respeita em cada sessão.

- **Contexto**: Arquivos de regras carregam automaticamente. Sem "me lembre do padrão de codificação" a cada sessão.
- **Padrões**: Linting, testes, gates de segurança embutidos no arquivo de regra.
- **Gates**: Cada commit passa: lint ✓ test ✓ type-check ✓ antes de merge.

**Tempo economizado**: 30–60 min/semana por dev (menos loops "apenas escreva novamente").

Veja [Desenvolvimento Assistido por IA](./ai-assisted-development.md).

### 2. Qualidade — Desenvolvimento Dirigido por Agentes (ADD)
Encaminhe tarefas complexas para a ferramenta certa, não para o prompt de chat certo.

- **Agentes**: Baseados em persona (code-reviewer, security-auditor, systematic-debugger).
- **Skills**: Tarefas com nome de verbo (plan, dispatch, recall, route).
- **Auto-invoke**: Agente escolhe a skill certa; você apenas declara o problema.

**Resultado**: Menos alucinações, raciocínio mais profundo, trilhas de auditoria.

Veja [Desenvolvimento Dirigido por Agentes](./agent-driven-development.md).

### 3. Governança — Convenções como Código
Perguntas de conformidade têm respostas com um link único. Sem improviso.

- **Dados**: Regras vivem em Git, versionadas, revisadas como código.
- **Segredos**: Padrões fatiados mantêm configuração sensível separada (`.claude/standards/security.md` é privada).
- **Auditoria**: Specs geram auto-roadmap; log de decisões é pesquisável.
- **Deps**: Sistema de hooks valida versões de ferramentas e marca padrões obsoletos.

**Para seu time de segurança**: Veja [Governança](./governance.md) Q&A e checklist de conformidade.

---

## Caminho de Adoção

### Semana 1: Baseline (4 horas)
1. Copie `rules/CLAUDE.md` (ou COPILOT.md / GEMINI.md para suas ferramentas) para a raiz.
2. Execute `install-rag.sh` em um shell.
3. Time tenta `/recall "feature X"` em uma tarefa de um sprint.

### Semanas 2-3: Expansão de Skills (8 horas)
- Ative `/plan` para refatorações.
- Ative `/dispatch` para revisão de código paralela.
- Crie padrões específicos de time em `patterns/team-X.md`.

### Semana 4+: Governança (contínuo, ≤2 horas de setup)
- Adicione `--with-hooks` para gates de CI opcionais.
- Configure template de spec em `docs/specs/TEMPLATE.md`.
- Integre roadmap ao planejamento de sprint (puxe do `docs/roadmap.md` gerado automaticamente).

---

## Q&A de Conformidade

**P: Isso envia dados para casa?**  
R: Não. O índice RAG é SQLite local. Servidor MCP roda em localhost:7429. Todos os dados permanecem em disco.

**P: Posso restringir skills?**  
R: Sim. Em `rules/CLAUDE.md`, adicione uma seção `## Permitted Skills`. A ferramenta de IA vai aplicar.

**P: E quanto a segredos no índice?**  
R: O índice nunca contém `.env` ou arquivos de credenciais. RAG exclui caminhos sensíveis por padrão. `sliced-standards` mantêm segredos em um arquivo de regra separado e privado.

**P: Isso exige vendor lock-in?**  
R: Não. Regras funcionam em Claude Code, Codex, Copilot, Cursor, Gemini, Antigravity. Exporte o catálogo de skills a qualquer momento.

**P: Qual é o custo?**  
R: Zero para o toolkit. Custo vem de suas subscrições de ferramentas de IA. Skills não adicionam chamadas de API; estruturam suas chamadas existentes melhor.

---

Veja [Governança](./governance.md) para a checklist completa de conformidade.
