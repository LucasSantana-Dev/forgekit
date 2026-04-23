# Gemini Implementation

Reference implementation of the toolkit patterns for Gemini CLI and Gemini Code Assist.

## Gemini CLI

Gemini CLI is a terminal-first AI coding agent with built-in tools, MCP support, large context windows, and project-level behavior files.

### Setup

```bash
npm install -g @google/gemini-cli
cp rules/GEMINI.md your-project/GEMINI.md
```

Authenticate with one of the supported methods:

- Google login for individual use
- `GEMINI_API_KEY` for Gemini API access
- Vertex AI environment variables for enterprise use

Then start Gemini in your project:

```bash
cd your-project
gemini
```

## Gemini Context and Rules

Use `GEMINI.md` as the stable project instruction file.

Keep in mind:

- `GEMINI.md` is for behavior and expectations
- prompts are still the right place to request concrete actions
- long-lived standards belong in `GEMINI.md`
- temporary task context belongs in prompts or project memory files

## Gemini Code Assist on GitHub

For Gemini Code Assist on GitHub, the repository instruction surface is `.gemini/styleguide.md`.

Use it for:

- coding standards
- testing expectations
- review heuristics
- architecture and repo-specific preferences

The repository can also include `.gemini/config.yaml` when feature flags or ignore rules are needed.

## Recommended Toolkit Mapping

- `rules/GEMINI.md` -> project-root `GEMINI.md`
- `.gemini/styleguide.md` -> GitHub review guidance for Gemini Code Assist
- `patterns/` -> workflow playbooks
- `best-practices/` -> short operational checklists

## Best Fit

Gemini works well in this toolkit when you want:

- terminal-first coding assistance
- large-context codebase analysis
- MCP-connected workflows
- GitHub-side review guidance through `.gemini/styleguide.md`

## Related Files

- `rules/GEMINI.md`
- `.gemini/styleguide.md`
- `patterns/context-building.md`
- `patterns/task-orchestration.md`
- `patterns/testing.md`
