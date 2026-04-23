---
name: User Preferences
description: Developer workflow preferences, coding style, and communication patterns
type: user
created: 2026-03-01
updated: 2026-03-15
---

# User Preferences

## Communication Style
- Direct and concise — skip pleasantries, get to the point
- Wants opinions and pushback, not blind compliance
- Prefers "here's what I think, here's why" over "what would you like me to do?"
- Assumes competence — explain edge cases, not basics

## Workflow
- Commit constantly with value: after each functional step, commit + push
- Quality-first: run lint/security/tests frequently, catch issues early
- Philosophy: deliver fast, fail early, fix early
- Work autonomously — only confirm for truly destructive/irreversible actions

## Code Preferences
- TypeScript strict mode always enabled
- Functional programming style over OOP where possible
- No premature abstraction — wait until pattern appears 3+ times
- Error handling: explicit over implicit (no silent failures)
- Prefer composition over inheritance
- Keep functions small: <50 lines, cyclomatic complexity <10

## Testing Philosophy
- Coverage target: >80% (no false positives)
- Test business logic and user value, NOT trivial getters/setters
- Edge cases and error conditions matter more than happy paths
- Integration tests > unit tests for API routes
- Mock external dependencies, not internal modules

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Build**: Turborepo, tsup, esbuild
- **Deploy**: Vercel (frontend), Railway (backend)
- **Testing**: Vitest, Playwright
- **Linting**: ESLint 9, Prettier, TypeScript ESLint

## Anti-Patterns to Avoid
- Don't add comments explaining what the code does — write self-documenting code
- Don't create task-specific documentation files (STATUS.md, PROGRESS.md)
- Don't use `any` types — use `unknown` and type guards
- Don't swallow errors — log and propagate or handle explicitly
- Don't add dependencies without checking bundle impact
