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
- Never add yourself as author in Git or GitHub commits

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

## Session Budget
- Keep context small and current
- Prefer finishing or shipping work over carrying a long local-only queue

## Durable Execution
- Continue until the planned work is complete or a real blocker is documented
- If blocked, record the blocker and move to the next useful step
- Before claiming done, verify the relevant checks actually ran

## Skill Auto-Invocation

Apply these skill patterns automatically when the situation matches — do not wait to be asked.

| Skill | Auto-trigger condition |
|---|---|
| **rag** | Building document search, semantic search, knowledge-base chatbot, vector embeddings, chunking, context retrieval |
| **eval** | Changing a prompt, switching models, modifying RAG config, claiming an AI feature works |
| **self-heal** | Tool call fails, loop phase errors, tests fail unexpectedly, context overflows mid-task |
| **debug** | Any error, test failure, unexpected output, broken build |
| **context** | Context ≥ 60% of limit, switching major tasks, after completing a large phase |
| **memory** | Session ending, key architectural decision made, surprising gotcha discovered |
| **secure** | Code touches auth, payments, credentials, user data, permissions, external APIs |
| **verify** | Before creating a PR, before claiming any phase complete |

### rag
When the task involves document retrieval, semantic search, or any RAG pipeline: follow chunk → embed → hybrid retrieve → rerank → augment. Apply the full pipeline pattern, not just retrieval.

### eval
Before shipping any LLM change: write the eval first, run baseline, measure delta. Gate on regression > 5%. Do not claim an AI feature works without measurement evidence.

### self-heal
When an error occurs in an autonomous loop: diagnose before retrying. Transient errors → exponential backoff. Deterministic errors → fix root cause first, then retry. Unknown → checkpoint state and surface to human.

### context
At 60-70% capacity: prune stale outputs first. At 80%+: checkpoint to `.agents/plans/checkpoint-<date>.md` immediately. Summarize completed subtasks rather than dropping them silently.

### memory
At session end: write a dated episodic entry (what/why/outcome/gotcha) for each significant decision or discovery. Store at `.agents/memory/`. Do not leave key decisions only in the conversation.

### verify
Before every PR: run lint + type-check + tests + build. Evidence of passing checks belongs in the PR description, not just assumed.
