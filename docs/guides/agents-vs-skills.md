---
status: draft
audience: technical
primitive: agent
---

# Agents vs Skills: When to Pick Which

**Skills** are verbs. **Agents** are nouns. How to tell them apart and which to use.

---

## Quick Comparison

| Aspect | Skill | Agent |
|--------|-------|-------|
| **Name** | Verb (`plan`, `recall`, `review`, `dispatch`) | Noun (`code-reviewer`, `security-auditor`, `debugger`) |
| **Activation** | Explicit (`/plan`, `/recall`) | Routed or auto-invoked |
| **Scope** | Single task, reusable everywhere | Persona-driven, opinionated |
| **Reasoning** | Procedural (step-by-step) | Argumentative (with opinions) |
| **Sub-skills** | Independent | Picks its own skills; coordinated reasoning |
| **Example** | "Outline a 5-step refactor" | "Review this code as a pragmatic reviewer" |

---

## Decision Tree

**You're designing a new tool. Should it be a skill or an agent?**

```
Does it have a strong persona or opinion?
├─ YES → AGENT
│        (e.g., "code-reviewer", "security-auditor")
│        Reasoning is argumentative; persona matters.
│
└─ NO → Is it a single, reusable task?
         ├─ YES → SKILL
         │        (e.g., "plan", "recall", "route")
         │        Pure utility; works anywhere.
         │
         └─ NO → Maybe it's a pattern, not a tool.
                  Write it in `patterns/` or link from a skill.
```

---

## Examples

### Skill: `/plan`
```
User: "Plan a database refactor"
Skill: Outline 5 steps, identify risks, suggest review points
Output: Structured plan (text)
```

No persona. Just a useful procedure. Reusable for any task type.

### Agent: `code-reviewer`
```
User: "Review this PR"
Agent: Loads "code-reviewer" persona
Agent: Thinks like a pragmatic reviewer
Agent: Picks `/review` skill + `/recall` for patterns
Agent: Reasons: "This style is OK, but performance issue here..."
Output: Opinionated feedback
```

Strong persona. Coordinated reasoning across multiple skills. Reusable across projects.

---

## Naming Discipline

**Skills**: Action verbs
- `plan.md`, `recall.md`, `review.md`, `dispatch.md`, `route.md`, `schedule.md`, `eval.md`, `learn.md`

**Agents**: Role nouns
- `code-reviewer`, `security-auditor`, `systematic-debugger`, `database-reviewer`, `ultrathink-debugger`

**Why?** When you see `/plan` in a prompt, you know it's a task. When you see `code-reviewer`, you know it's a persona. Naming = intent.

---

## Mixing & Matching

You **can** have a skill-agent hybrid (rare):

- Skill: `kit/core/skills/review.md` (generic review procedure)
- Agent: `kit/core/agents/code-reviewer` (pragmatic persona + calls review skill)

The agent loads the skill + adds opinionated reasoning.

---

## Creating Your Own

### Add a Skill
1. File: `kit/core/skills/your-task.md`
2. Frontmatter: `primitive: skill`, `trigger: /your-task`
3. Body: Steps, examples, output format
4. Test: Can it work in any project? If yes, it's a skill.

### Add an Agent
1. Directory: `kit/core/agents/your-persona/`
2. Files: `agent.md` (persona), `SKILL.md` (activation)
3. Frontmatter: `primitive: agent`, `persona: "..."`
4. Test: Does it have opinions? Does it coordinate multiple skills? If yes, it's an agent.

---

## Related

- **Primitives** in full: [Primitives](./primitives.md)
- **Agent-driven development** (ADD): [Agent-Driven Development](./agent-driven-development.md)
- **Skill examples**: `kit/core/skills/`
- **Agent examples**: `kit/core/agents/`
