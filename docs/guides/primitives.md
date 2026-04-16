---
status: draft
audience: all
primitive: mixed
---

# Primitives: Rules, Skills, Agents, Hooks

Four core concepts. One decision flowchart. ≤1 minute to answer "what should this be?"

---

## The Four Primitives

| Primitive | Example | When | Lifecycle | Input | Output |
|-----------|---------|------|-----------|-------|--------|
| **Rule** | `rules/CLAUDE.md` | Define default behavior, coding standards, security gates | Load once at session start, never reload | Text file in Git | Loaded into AI tool config |
| **Skill** | `kit/core/skills/plan.md` | Single, reusable task (recall, plan, dispatch, review) | Invoked by user or agent on demand | Activation phrase (`/plan`) | Structured output (analysis, code, advice) |
| **Agent** | `kit/core/agents/code-reviewer` | Persona with opinions (auditor, debugger, reviewer) | Session-level; routed to by command or auto-invoke | Problem statement | Deep analysis, persona-driven reasoning |
| **Hook** | `kit/hooks/post-edit-typecheck.sh` | Auto-run at edit moments (after Write, before Submit) | Triggered by editor/harness lifecycle event | File changes, response body | Advisory messages, optional blocking |

---

## Decision Flowchart

**Question: I want to add something. Should it be a Rule, Skill, Agent, or Hook?**

Start here:

```
Is it always-on behavior that shapes every response?
├─ YES → RULE
│        (coding standard, security policy, workflow gate)
│
└─ NO → Is it a single, reusable task invoked on demand?
         ├─ YES → SKILL
         │        (plan, recall, review, dispatch, route)
         │
         └─ NO → Does it have a persona or deep reasoning?
                  ├─ YES → AGENT
                  │        (code-reviewer, auditor, debugger)
                  │
                  └─ NO → Does it run at an edit moment (post-Write, post-Submit)?
                           ├─ YES → HOOK
                           │        (format, typecheck, evaluate-response)
                           │
                           └─ NO → Needs design; reach out to maintainers
```

---

## Examples

**"I want the AI to always follow PEP-8"** → Rule (`rules/GEMINI.md`)  
**"I want to analyze code coverage gaps"** → Skill (`kit/core/skills/coverage.md`)  
**"I want a persona that catches security flaws"** → Agent (`kit/core/agents/security-auditor`)  
**"I want to auto-format after every edit"** → Hook (`kit/hooks/post-edit-format.sh`)

---

## Cross-Reference

- **Naming discipline**: Skills are **verb-named** (`plan.md`, `recall.md`). Agents are **noun-named** (`code-reviewer`, `security-auditor`).
- **Vendor coverage**: Rules are vendor-specific (CLAUDE.md, COPILOT.md, GEMINI.md). Skills and agents are vendor-neutral (called from any tool).
- **Scope**: Rules are repo-wide. Skills and agents are tool-wide (reused across repos). Hooks are repo-scoped (optional per-project setup).

See [Agents vs Skills](./agents-vs-skills.md) for detailed comparison.

---

## If You're Still Unsure

Use `/recall "primitives rules skills agents hooks"` to search for similar decisions, or open an issue on GitHub.
