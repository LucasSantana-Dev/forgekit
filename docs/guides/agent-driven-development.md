---
status: draft
audience: all
primitive: agent
---

# Agent-Driven Development (ADD)

**Command → Agent → Skill Orchestration**

Route complex tasks to the right persona. Agents pick their own tools.

---

## The Model

```
User Command
    ↓
[agents.json] ← routing table
    ↓
Persona Agent (e.g., code-reviewer, auditor)
    ↓
Agent picks best skill(s) (plan, dispatch, recall, route)
    ↓
Skill executes; agent reasons on result
    ↓
Insight or artifact back to user
```

No prompt engineering. No "call skill X then skill Y". **Declare the goal; agent handles routing.**

---

## Example

**You say**: "Review this PR for security flaws"

**Without ADD**: You craft a 500-word prompt about what to check, run `/review` manually.

**With ADD**: You say `/security-review` → Agent reads `agents.json` → Persona is "security-auditor" → Agent auto-picks `kit/core/skills/review.md` + threat-model reasoning → Returns vulnerability list.

---

## How It Works

### 1. Define Agents
Each agent is a **persona + trigger** in `kit/core/agents/`.

Example: `code-reviewer/`
```
name: Code Reviewer
trigger: /review
persona: "You are a pragmatic code reviewer..."
skills: [plan, dispatch, recall, review]
do_this: "Catch correctness, performance, style issues"
dont_do_this: "Suggest perfect-code refactors; ask for specs"
handoff_back: "Return focused, actionable feedback"
```

### 2. Register in `agents.json`
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

### 3. Auto-Invoke (Optional)
When enabled, the harness auto-picks an agent based on your command type:
- "Review this code" → routes to code-reviewer agent
- "Find security issues" → routes to security-auditor agent
- "Debug this error" → routes to systematic-debugger agent

See `kit/core/skills/auto-invoke.md`.

---

## Agents in This Kit

| Agent | Persona | When to Use |
|-------|---------|-------------|
| `code-reviewer` | Pragmatic, feedback-focused | Code reviews, quality gates |
| `security-auditor` | Threat-model thinking | Security reviews, compliance checks |
| `systematic-debugger` | Root-cause detective | Bug diagnosis, error traces |
| `database-reviewer` | Data-design specialist | Schema reviews, migration checks |
| `ultrathink-debugger` | Deep reasoning | Complex, multi-system bugs |

---

## Related

- **Skills vs Agents**: [Agents vs Skills](./agents-vs-skills.md)
- **Auto-invoke mechanics**: `kit/core/skills/auto-invoke.md`
- **Routing patterns**: `kit/core/skills/route.md`

---

See [Primitives](./primitives.md) for decision flowchart.
