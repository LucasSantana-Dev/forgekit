# Contributing

Thanks for your interest in improving the AI Dev Toolkit.

## What We're Looking For

- **New patterns** — Tool-agnostic working patterns you've validated in production
- **Reference implementations** — Concrete implementations for Cursor, Windsurf, Copilot, or other tools
- **Tool additions** — CLI tools that improve AI-assisted workflows
- **Bug fixes** — Broken links, incorrect examples, outdated model names

## How to Contribute

1. Fork the repo
2. Create a branch: `feature/your-pattern` or `fix/broken-link`
3. Make your changes
4. Open a PR with a clear description of what and why

## Guidelines

### Patterns
- Must be tool-agnostic (the pattern works regardless of which AI tool you use)
- Include anti-patterns (what NOT to do is often more valuable)
- Include concrete examples, not just theory
- Keep it under 200 lines — if it's longer, split into multiple patterns

### Rule Templates
- Keep rules actionable ("Functions < 50 lines") not vague ("Write clean code")
- Test with at least one AI tool before submitting
- Rules should fit on one screen — agents skim long files

### Implementations
- Reference the pattern it implements
- Include setup instructions
- Explain how to adapt it to other tools

### Install Scripts
- Must be idempotent (safe to run twice)
- Test on a clean system
- Include both install and post-install configuration

## Code Style

- TypeScript for all implementation code
- Markdown for documentation (no HTML unless necessary)
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Questions?

Open an issue with the "question" label.
