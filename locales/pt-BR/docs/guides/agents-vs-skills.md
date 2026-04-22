---
status: published
audience: technical
primitive: agent
---

# Agentes vs Skills: Quando Usar Cada Um

**Skills** são verbos. **Agents** são nomes. Como diferenciá-los e qual usar.

---

## Comparação Rápida

| Aspecto | Skill | Agent |
|--------|-------|-------|
| **Nome** | Verbo (`plan`, `recall`, `review`, `dispatch`) | Sustantivo (`code-reviewer`, `security-auditor`, `debugger`) |
| **Ativação** | Explícita (`/plan`, `/recall`) | Roteada ou auto-invocada |
| **Escopo** | Tarefa única, reutilizável em qualquer lugar | Dirigida por persona, opinada |
| **Raciocínio** | Procedural (passo a passo) | Argumentativo (com opiniões) |
| **Sub-skills** | Independentes | Escolhe suas próprias skills; raciocínio coordenado |
| **Exemplo** | "Delinear um refactor de 5 passos" | "Revisar este código como um revisor pragmático" |

---

## Árvore de Decisão

**Você está projetando uma nova ferramenta. Deve ser uma skill ou um agent?**

```
Possui uma persona ou opinião forte?
├─ SIM → AGENT
│        (ex: "code-reviewer", "security-auditor")
│        Raciocínio é argumentativo; persona importa.
│
└─ NÃO → É uma tarefa única e reutilizável?
         ├─ SIM → SKILL
         │        (ex: "plan", "recall", "route")
         │        Utilidade pura; funciona em qualquer lugar.
         │
         └─ NÃO → Talvez seja um padrão, não uma ferramenta.
                  Escreva em `patterns/` ou faça link de uma skill.
```

---

## Exemplos

### Skill: `/plan`
```
Usuário: "Plan a database refactor"
Skill: Delinea 5 passos, identifica riscos, sugere pontos de revisão
Saída: Plano estruturado (texto)
```

Sem persona. Apenas um procedimento útil. Reutilizável para qualquer tipo de tarefa.

### Agent: `code-reviewer`
```
Usuário: "Review this PR"
Agent: Carrega a persona "code-reviewer"
Agent: Pensa como um revisor pragmático
Agent: Escolhe a skill `/review` + `/recall` para padrões
Agent: Raciocina: "Este estilo é OK, mas há problema de performance aqui..."
Saída: Feedback opinado
```

Persona forte. Raciocínio coordenado entre múltiplas skills. Reutilizável em projetos.

---

## Disciplina de Nomes

**Skills**: Verbos de ação
- `plan.md`, `recall.md`, `review.md`, `dispatch.md`, `route.md`, `schedule.md`, `eval.md`, `learn.md`

**Agents**: Sustantivos de papel
- `code-reviewer`, `security-auditor`, `systematic-debugger`, `database-reviewer`, `ultrathink-debugger`

**Por quê?** Quando você vê `/plan` em um prompt, você sabe que é uma tarefa. Quando você vê `code-reviewer`, você sabe que é uma persona. Nomes = intenção.

---

## Misturando e Combinando

Você **pode** ter um híbrido skill-agent (raro):

- Skill: `kit/core/skills/review.md` (procedimento de revisão genérico)
- Agent: `kit/core/agents/code-reviewer` (persona pragmática + chama skill review)

O agent carrega a skill + adiciona raciocínio opinado.

---

## Criando o Seu

### Adicionar uma Skill
1. Arquivo: `kit/core/skills/your-task.md`
2. Frontmatter: `primitive: skill`, `trigger: /your-task`
3. Corpo: Passos, exemplos, formato de saída
4. Teste: Pode funcionar em qualquer projeto? Se sim, é uma skill.

### Adicionar um Agent
1. Diretório: `kit/core/agents/your-persona/`
2. Arquivos: `agent.md` (persona), `SKILL.md` (ativação)
3. Frontmatter: `primitive: agent`, `persona: "..."`
4. Teste: Possui opiniões? Coordena múltiplas skills? Se sim, é um agent.

---

## Relacionado

- **Primitivas** em cheio: [Primitivas](./primitives.md)
- **Desenvolvimento orientado a agents** (ADD): [Desenvolvimento Orientado a Agents](./agent-driven-development.md)
- **Exemplos de skills**: `kit/core/skills/`
- **Exemplos de agents**: `kit/core/agents/`
