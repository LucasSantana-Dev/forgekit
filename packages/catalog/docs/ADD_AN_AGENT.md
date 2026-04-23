# Contributing an Agent

An **Agent** is a Claude Code sub-agent — a single `.md` file that installs to `~/.claude/agents/<id>.md`. Structurally different from a Skill: agents carry an XML-tagged or prose system prompt in their body and declare a `model` in frontmatter. Claude Code routes delegated tasks to them based on the `description` field.

## 1. Write the markdown

`catalog/agents/<id>.md` — one file, one agent.

```markdown
---
id: my-agent
name: My Agent
description: One sentence that names when Claude Code should delegate to this agent. Keep it crisp — vague descriptions cause wrong routing.
version: 0.1.0
tags:
  - agent
  - claude-code
  - <domain>
model: claude-sonnet-4-6
level: 3
disallowed_tools:
  - Write
  - Edit
source:
  path: where-it-came-from.md
  type: local
license: MIT
author: Your Name
---

<Agent_Prompt>
  <Role>
    You are ... Your mission is ...
    You are responsible for ...
    You are not responsible for ...
  </Role>

  <Why_This_Matters>
    ...
  </Why_This_Matters>

  <When_To_Use>
    ...
  </When_To_Use>
</Agent_Prompt>
```

Required fields: `id`, `name`, `description`, `version`, `tags`. Optional but recommended: `model`, `level`, `disallowed_tools`. Schema: [`schemas/agent.schema.json`](../schemas/agent.schema.json).

## 2. Validate + PR

```bash
pnpm run validate
pnpm run index
```

Commit: `feat(catalog): add <id> agent`.

## Skill vs Agent — decision rule

- **Skill** = procedural knowledge the *main* model reads to guide its own work (installs to `~/.claude/skills/`).
- **Agent** = a sub-process with its own system prompt that the main model *delegates* to (installs to `~/.claude/agents/`).

A code-review checklist is a Skill. A "code-reviewer" sub-agent that runs autonomously on a diff is an Agent.

## Tips

- **Tight description.** Claude Code's auto-dispatch reads it; vague descriptions cause either over-delegation or no delegation at all. Name the actual trigger ("Use for severity-rated review of a diff" > "Reviews code").
- **Declare disallowed tools.** A reviewer agent shouldn't have `Write`/`Edit`; a verifier shouldn't have `Bash`. Explicit denial beats trust.
- **Match model to scope.** Opus for architecture/critique/planning; Sonnet for debugging/execution/tests; Haiku for routing/simple triage.
- **Never embed secrets.** The importer's secrets scan runs in CI.
