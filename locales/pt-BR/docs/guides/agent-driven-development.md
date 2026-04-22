---
status: published
audience: all
primitive: agent
---

# Desenvolvimento Orientado a Agentes (ADD)

**Comando → Agent → Orquestração de Skills**

Rotear tarefas complexas para a persona correta. Agents escolhem suas próprias ferramentas.

---

## O Modelo

```
User Command
    ↓
[agents.json] ← tabela de roteamento
    ↓
Persona Agent (ex: code-reviewer, auditor)
    ↓
Agent escolhe melhor(es) skill(s) (plan, dispatch, recall, route)
    ↓
Skill executa; agent raciocina sobre o resultado
    ↓
Insight ou artefato de volta para o usuário
```

Sem engenharia de prompts. Sem "chame skill X depois skill Y". **Declare o objetivo; agent cuida do roteamento.**

---

## Exemplo

**Você diz**: "Revise este PR em busca de falhas de segurança"

**Sem ADD**: Você elabora um prompt de 500 palavras sobre o que verificar, executa `/review` manualmente.

**Com ADD**: Você diz `/security-review` → Agent lê `agents.json` → Persona é "security-auditor" → Agent escolhe automaticamente `kit/core/skills/review.md` + raciocínio de modelo de ameaça → Retorna lista de vulnerabilidades.

---

## Como Funciona

### 1. Defina Agents
Cada agent é uma **persona + trigger** em `kit/core/agents/`.

Exemplo: `code-reviewer/`
```
name: Code Reviewer
trigger: /review
persona: "Você é um code reviewer pragmático..."
skills: [plan, dispatch, recall, review]
do_this: "Capture problemas de correção, performance e estilo"
dont_do_this: "Sugira refatorações de código perfeito; peça specs"
handoff_back: "Retorne feedback focado e acionável"
```

### 2. Registre em `agents.json`
```json
{
  "agents": [
    {
      "name": "code-reviewer",
      "trigger": "/review",
      "skills": ["plan", "dispatch", "recall"]
    }
  ]
}
```

### 3. Auto-Invoke (Opcional)
Quando habilitado, o harness escolhe automaticamente um agent baseado no tipo de comando:
- "Revise este código" → roteia para agent code-reviewer
- "Encontre problemas de segurança" → roteia para agent security-auditor
- "Debugue este erro" → roteia para agent systematic-debugger

Veja `kit/core/skills/auto-invoke.md`.

---

## Agents Neste Kit

| Agent | Persona | Quando Usar |
|-------|---------|-------------|
| `code-reviewer` | Pragmático, focado em feedback | Code reviews, quality gates |
| `security-auditor` | Pensamento de modelo de ameaça | Revisões de segurança, checks de conformidade |
| `systematic-debugger` | Detetive de causa raiz | Diagnóstico de bugs, rastreamento de erros |
| `database-reviewer` | Especialista em design de dados | Revisões de schema, checks de migration |
| `ultrathink-debugger` | Raciocínio profundo | Bugs complexos multi-sistema |

---

## Relacionado

- **Skills vs Agents**: [Agents vs Skills](./agents-vs-skills.md)
- **Mecânica auto-invoke**: `kit/core/skills/auto-invoke.md`
- **Padrões de roteamento**: `kit/core/skills/route.md`

---

Veja [Primitives](./primitives.md) para flowchart de decisão.
