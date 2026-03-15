# Project Rules for AI Agents

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
