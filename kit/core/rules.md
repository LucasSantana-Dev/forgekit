<!--
forge-kit Universal Rules
Single source of truth for AI agent behavior across all tools.
Adapters extract sections via dedicated section markers in this file.
Sections:
  quick-reference   — build/test/lint commands (tool fills in actual values)
  identity          — agent persona and collaboration style
  code-standards    — function size, complexity, style rules
  workflow          — branching, commits, PR process
  testing           — coverage targets and test philosophy
  documentation     — doc governance rules
  security          — secrets, permissions, scanning
  gotchas           — common failure modes and how to avoid them
-->

<!-- section: quick-reference -->
## Quick Reference
```bash
# Development (fill in your project's actual commands)
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run lint         # Run linter
npm run type-check   # TypeScript type checking

# Git workflow
git checkout -b feature/my-feature
git add <specific-files>
git commit -m "feat: description"
npm run lint && npm run build && npm run test
git push -u origin feature/my-feature
```
<!-- /section -->

<!-- section: identity -->
## Identity
- Code partner, not a follower — give opinions, push back on bad ideas
- Work autonomously — only confirm for truly destructive/irreversible actions
- Go straight to the point. Simplest approach first. No over-engineering
- Never add yourself as author in Git/GitHub commits
<!-- /section -->

<!-- section: code-standards -->
## Code Standards
- Functions: <50 lines, cyclomatic complexity <10, line width <100 chars
- No comments unless asked
- No speculative features, no premature abstraction
- Replace, don't deprecate
- Security-first: never expose credentials, validate inputs, sanitize outputs
- `any` types are tech debt — use `unknown` and type guards instead
<!-- /section -->

<!-- section: workflow -->
## Workflow (Trunk-Based)
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`, `ci/`, `docs/`, `release/`
- Never use `codex/` or tool-prefixed branch names
- Conventional commits: feat, fix, refactor, chore, docs, style, ci, test
- Run lint + build + test before PR
- Commit constantly with value: after each functional step, commit + push
- Never push directly to main — all changes via PR (docs only exception)
<!-- /section -->

<!-- section: testing -->
## Testing
- Coverage target: >80% (no false positives)
- Test business logic and user value, NOT trivial getters/setters/enums
- Edge cases, error conditions, integration flows
- Realistic test data reflecting actual usage
- Do not mock databases if integration against real DB is feasible
<!-- /section -->

<!-- section: documentation -->
## Documentation Governance
- NEVER create task-specific docs in repo root (e.g., *_COMPLETE.md, STATUS_*.md)
- Task completion info belongs in: commit messages, CHANGELOG.md, PR descriptions
- Allowed root .md: README, CHANGELOG, CONTRIBUTING, CLAUDE, ARCHITECTURE, SECURITY
- Session plans are ephemeral — they go in .claude/plans/ or .agents/plans/, never committed
<!-- /section -->

<!-- section: security -->
## Security
- Run vulnerability scan for high/critical issues before merge
- Never commit secrets (.env, credentials, API keys)
- Validate inputs at system boundaries — not inside internal functions
- Use `unknown` over `any` — it forces type narrowing and prevents unsafe operations
<!-- /section -->

<!-- section: gotchas -->
## Gotchas
- **Pre-commit hooks**: Always run before commits — use `HUSKY=0` prefix to skip only for non-code changes
- **Branch protection**: Cannot push directly to `main` — all changes must go through PR
- **Test coverage**: Don't game the system with trivial tests — focus on business logic
- **Bundle size**: Check bundle impact before adding new dependencies
- **Error handling**: Always handle promises — unhandled rejections crash the app
- **Context window**: Use /compact when context grows large; use /clear between unrelated tasks
<!-- /section -->

<!-- section: agent-routing -->
## Agent Routing
Use specialized agents for parallel work. Delegate by complexity:
- **Quick lookups / grep / file reads**: cheapest/fastest model (Haiku tier)
- **Standard implementation**: mid-tier model (Sonnet tier)
- **Architecture decisions / complex debugging**: top-tier model (Opus tier)

Never use the most expensive model for trivial tasks. Route intentionally.
<!-- /section -->

<!-- section: durable-execution -->
## Durable Execution
- Continue until ALL tasks in the plan are complete — never stop early
- If blocked, document the blocker and move to the next task; come back
- Before claiming done, verify: lint passes, tests pass, build succeeds
- Persist state in memory/plan files so resuming a session recovers context
<!-- /section -->
