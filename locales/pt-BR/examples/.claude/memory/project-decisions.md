---
name: Project Decisions
description: Key architectural decisions and their rationale
type: project
created: 2026-02-15
updated: 2026-03-14
---

# Project Decisions

## 1. Monorepo with Turborepo (2026-02-15)

### Why
- Share TypeScript configs, ESLint rules, and utilities across 3 apps
- Atomic commits across frontend + backend for feature development
- Single CI pipeline, unified deployment process
- Team is small (4 devs) — coordination overhead is minimal

### How to Apply
- New packages go in `packages/` (shared code) or `apps/` (deployable apps)
- Use workspace protocol for internal dependencies: `"@company/utils": "workspace:*"`
- Run tasks from root: `pnpm turbo lint test build`
- Each package has its own `package.json` and `tsconfig.json` extending root configs

### Consequences
- Slightly longer CI times (all packages checked on every PR)
- Need careful dependency management to avoid circular deps
- Tooling must support monorepos (Vercel, Railway both do)

---

## 2. PostgreSQL over MongoDB (2026-02-20)

### Why
- Data model has clear relationships (users → teams → projects)
- Need ACID guarantees for billing and permissions
- Strong typing via Prisma schema
- Team has more SQL experience than NoSQL

### How to Apply
- Use Prisma for schema + migrations + type-safe client
- Indexes on foreign keys and frequently queried columns
- Use `SELECT` with explicit columns, not `SELECT *`
- Transactions for multi-table operations (e.g., create team + assign owner)

### Consequences
- Schema changes require migrations (not as flexible as schemaless)
- Need connection pooling for serverless (using PgBouncer on Railway)
- Joins can get expensive — denormalize for read-heavy tables if needed

---

## 3. Feature Flags with Database Table (2026-03-01)

### Why
- Need to toggle features per-user and per-organization
- Tried environment variables — too coarse-grained (all-or-nothing)
- LaunchDarkly/Unleash overkill for 50-user beta
- Simple `feature_flags` table + Redis cache = fast + flexible

### How to Apply
- Schema: `feature_flags(id, key, enabled, scope, scope_id)` where scope is `global|user|org`
- Check flag: `await isFeatureEnabled('new-dashboard', { userId: '123' })`
- Cache in Redis with 5min TTL to avoid DB hit on every request
- Add new flags via migration, not manual SQL

### Consequences
- Cache invalidation complexity — need to bust Redis on flag update
- No A/B testing built in (just on/off) — will migrate to proper platform at 1000+ users
- Requires flag cleanup discipline (remove after rollout complete)

---

## 4. Client-Side Error Tracking with Sentry (2026-03-10)

### Why
- Users reporting "it doesn't work" without details
- Browser DevTools not accessible in production
- Need stack traces + user context + breadcrumbs
- Sentry free tier covers beta traffic (<5k events/month)

### How to Apply
- Initialize Sentry in `_app.tsx` with `environment`, `release`, `userId` tags
- Wrap API calls in try-catch and send to Sentry with context:
  ```ts
  try {
    await apiCall();
  } catch (err) {
    Sentry.captureException(err, { tags: { endpoint: '/api/users' } });
    throw err; // re-throw after logging
  }
  ```
- Use `Sentry.setUser()` after auth to track errors per user
- Filter out known third-party script errors (ads, extensions)

### Consequences
- PII concern — sanitize user data before sending to Sentry
- Error noise from bots — filter by user agent
- Free tier limit — will need paid plan at scale
