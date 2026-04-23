---
status: published
audience: all
primitive: mixed
---

# Primitivos: Rules, Skills, Agents, Hooks

Quatro conceitos principais. Um fluxograma de decisão. ≤1 minuto para responder "o que isso deveria ser?"

---

## Os Quatro Primitivos

| Primitivo | Exemplo | Quando | Ciclo de Vida | Entrada | Saída |
|-----------|---------|--------|---------------|---------|-------|
| **Rule** | `rules/CLAUDE.md` | Defina comportamento padrão, padrões de codificação, gates de segurança | Carregue uma vez no início da sessão, nunca recarregue | Arquivo de texto em Git | Carregado em config de ferramenta de IA |
| **Skill** | `kit/core/skills/plan.md` | Tarefa única e reutilizável (recall, plan, dispatch, review) | Invocado por usuário ou agente sob demanda | Frase de ativação (`/plan`) | Saída estruturada (análise, código, conselho) |
| **Agent** | `kit/core/agents/code-reviewer` | Persona com opiniões (auditor, debugger, revisor) | Nível de sessão; encaminhado por comando ou auto-invoke | Declaração de problema | Análise profunda, raciocínio orientado por persona |
| **Hook** | `kit/hooks/post-edit-typecheck.sh` | Auto-executar em momentos de edição (após Write, antes de Submit) | Acionado por evento de ciclo de vida do editor/harness | Mudanças de arquivo, corpo de resposta | Mensagens de aviso, bloqueio opcional |

---

## Fluxograma de Decisão

**Pergunta: Quero adicionar algo. Deveria ser uma Rule, Skill, Agent ou Hook?**

Comece aqui:

```
É um comportamento sempre ativo que molda cada resposta?
├─ SIM → RULE
│        (padrão de codificação, política de segurança, gate de workflow)
│
└─ NÃO → É uma tarefa única e reutilizável invocada sob demanda?
         ├─ SIM → SKILL
         │        (plan, recall, review, dispatch, route)
         │
         └─ NÃO → Tem uma persona ou raciocínio profundo?
                  ├─ SIM → AGENT
                  │        (code-reviewer, auditor, debugger)
                  │
                  └─ NÃO → Executa em um momento de edição (post-Write, post-Submit)?
                           ├─ SIM → HOOK
                           │        (format, typecheck, evaluate-response)
                           │
                           └─ NÃO → Precisa de design; entre em contato com maintainers
```

---

## Exemplos

**"Quero que a IA sempre siga PEP-8"** → Rule (`rules/GEMINI.md`)  
**"Quero analisar gaps de cobertura de código"** → Skill (`kit/core/skills/coverage.md`)  
**"Quero uma persona que pegue falhas de segurança"** → Agent (`kit/core/agents/security-auditor`)  
**"Quero auto-format após cada edição"** → Hook (`kit/hooks/post-edit-format.sh`)

---

## Referência Cruzada

- **Disciplina de nomeação**: Skills são **nomeadas com verbos** (`plan.md`, `recall.md`). Agentes são **nomeados com substantivos** (`code-reviewer`, `security-auditor`).
- **Cobertura de vendor**: Rules são específicas do vendor (CLAUDE.md, COPILOT.md, GEMINI.md). Skills e agentes são agnósticos de vendor (chamados de qualquer ferramenta).
- **Escopo**: Rules são repo-wide. Skills e agentes são tool-wide (reutilizados entre repos). Hooks são repo-scoped (setup opcional por projeto).

Veja [Agentes vs Skills](./agents-vs-skills.md) para comparação detalhada.

---

## Se Você Ainda Tiver Dúvida

Use `/recall "primitives rules skills agents hooks"` para buscar decisões similares, ou abra uma issue no GitHub.
