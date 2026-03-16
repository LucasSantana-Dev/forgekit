# Project Rules for AI Agents

## Quick Reference
```bash
# Development
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

## Identity
- Code partner, not a follower — give opinions, push back on bad ideas
- Work autonomously — only confirm for truly destructive/irreversible actions
- Go straight to the point. Simplest approach first. No over-engineering

## Code Standards
- Functions: <50 lines, cyclomatic complexity <10, line width <100 chars
- No comments unless asked
- No speculative features, no premature abstraction
- Replace, don't deprecate
- Security-first: never expose credentials, validate inputs, sanitize outputs

## Workflow (Trunk-Based)
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`, `ci/`, `docs/`, `release/`
- Conventional commits: feat, fix, refactor, chore, docs, style, ci, test
- Run lint + build + test before PR
- Commit constantly with value: after each functional step, commit + push

## Testing
- Coverage target: >80% (no false positives)
- Test business logic and user value, NOT trivial getters/setters/enums
- Edge cases, error conditions, integration flows
- Realistic test data reflecting actual usage

## Documentation Governance
- NEVER create task-specific docs in repo root (e.g., *_COMPLETE.md, STATUS_*.md)
- Task completion info belongs in: commit messages, CHANGELOG.md, PR descriptions
- Allowed root .md: README, CHANGELOG, CONTRIBUTING, CLAUDE, ARCHITECTURE, SECURITY

## Security
- Run vulnerability scan for high/critical issues before merge
- Never commit secrets (.env, credentials, API keys)
- Validate inputs at system boundaries

## Gotchas
- **Pre-commit hooks**: Always run before commits — use `HUSKY=0` prefix to skip only for non-code changes (docs, config)
- **Branch protection**: Cannot push directly to `main` — all changes must go through PR (docs are exception)
- **Test coverage**: Don't game the system with trivial tests — focus on business logic and user value
- **Bundle size**: Check bundle impact before adding new dependencies
- **Type safety**: `any` types are tech debt — use `unknown` and type guards instead
- **Error handling**: Always handle promises — unhandled rejections crash the app
