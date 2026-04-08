# GitHub Copilot Implementation

Reference implementation of the toolkit patterns for GitHub Copilot.

## Instruction Surfaces

GitHub Copilot can use multiple repository instruction layers:

- `.github/copilot-instructions.md` for repository-wide custom instructions
- `.github/instructions/*.instructions.md` for path-specific guidance
- `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` for agent-style instructions when supported by the Copilot surface

Use `rules/COPILOT.md` as the reusable rule template. Use `.github/copilot-instructions.md` for the actual repository-wide instructions file.

## Recommended Setup

```bash
mkdir -p .github
cp rules/COPILOT.md .github/copilot-instructions.md
```

For path-specific guidance:

```bash
mkdir -p .github/instructions
cat > .github/instructions/testing.instructions.md <<'EOF'
---
applyTo: "**/*.{test,spec}.{js,ts,tsx,py}"
---
- Prefer behavior-focused tests
- Avoid implementation-detail assertions
- Cover errors and edge cases
EOF
```

## How to Use the Toolkit with Copilot

- Keep repository-wide engineering rules in `.github/copilot-instructions.md`
- Use `AGENTS.md` or `CLAUDE.md` if you want deeper agent-style behavior in compatible Copilot surfaces
- Use the toolkit `patterns/` docs to decide workflow, not just wording
- Use the toolkit `best-practices/` docs as short operational guardrails

## Best Fit

GitHub Copilot works best in this toolkit when you want:

- repository-wide coding guidance
- PR review support
- path-specific instructions for areas like testing, frontend, or CI
- agent assistance inside GitHub and editor workflows

## Related Files

- `rules/COPILOT.md`
- `.github/copilot-instructions.md`
- `patterns/context-building.md`
- `patterns/code-review.md`
- `patterns/testing.md`
