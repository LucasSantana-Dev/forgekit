# Companies

Pre-built agent organizations for AI-assisted development. Each company is a complete team of specialized agents with defined roles, skills, and routing protocols — ready to drop into any project.

## Concept

A company maps work to the right specialist automatically:

```
Task → CEO → CTO → Team Lead → Specialist
```

Each agent has a strict contract:

- **What triggers it** — conditions that activate the agent
- **What it does** — specific responsibilities
- **What it produces** — concrete outputs
- **Who it hands off to** — next agent in the chain

## File format

```
companies/
  <company-name>/
    COMPANY.md          ← manifest (name, schema, goals)
    README.md           ← usage guide
    agents/
      <role>/
        AGENTS.md       ← agent definition (frontmatter + body)
    skills/
      <skill>/
        SKILL.md        ← reusable skill definition
    teams/
      <team>/
        TEAM.md         ← team grouping with members
```

### Agent format (`AGENTS.md`)

```yaml
---
name: React Engineer
title: Senior React/Next.js Engineer
reportsTo: frontend-lead
skills:
  - react-expert
  - nextjs-developer
---
You are the React Engineer. You handle React and Next.js projects.
## What triggers you
...
## What you do
...
## What you produce
...
## Who you hand off to
...
```

The `skills` field references entries in the company's `skills/` directory.
This format is toolkit-native. Some tools can use it directly; others need an adapter.

## Using with AI tools

### Claude Code

Treat `companies/` as source material. Export or adapt an agent into Claude's native
subagent format as `.claude/agents/<role>.md` with Claude-specific frontmatter such as
`name` and `description`.

### OpenCode

Use the toolkit agent body as source material for your OpenCode agent or prompt layer.

### Codex CLI

Agents follow the standard `AGENTS.md` format — drop into your repo root or subdirectory.

### Cursor / Windsurf

Use the agent body as a scoped `.cursorrules` or `.windsurfrules` entry.

## Available companies

| Company                                             | Agents | Skills | Teams | Description                                                         |
| --------------------------------------------------- | ------ | ------ | ----- | ------------------------------------------------------------------- |
| [solopreneur](./solopreneur/)                       | 3      | 3      | 0     | Founder-led product studio for solo SaaS and indie product work     |
| [startup-mvp](./startup-mvp/)                       | 4      | 4      | 0     | Early-stage startup pack for MVP building and launch iteration      |
| [agency](./agency/)                                 | 5      | 4      | 0     | Client delivery model for discovery, execution, QA, and comms       |
| [open-source-maintainer](./open-source-maintainer/) | 5      | 4      | 0     | Maintainer-focused org for triage, releases, docs, and community    |
| [fullstack-forge](./fullstack-forge/)               | 49     | 66     | 10    | Full-service software development consultancy across 11 departments |

## Attribution

Companies are MIT licensed. `fullstack-forge` was imported from [paperclipai/companies](https://github.com/paperclipai/companies).
