---
name: monorepo-dockerfile
description: Reference checklist for npm-workspaces + Prisma Dockerfiles. Pure doc skill. Prevents the 3 prod outages this week (missing node_modules, shared not built, Prisma not generated, env var typos).
type: skill
triggers:
  - dockerfile
  - docker build
  - prisma dockerfile
  - monorepo docker
---

# monorepo-dockerfile

Checklist for npm-workspaces + Prisma Dockerfiles. No script; reference documentation to avoid repeating the same outages.

## When to use

- Writing or reviewing a Dockerfile for a monorepo (Lucky, Forge projects, etc.)
- npm workspaces structure: root package.json + packages/*/package.json
- Prisma schema with migrations or client generation
- Multi-stage builds (builder stage + runtime stage)

## When NOT to use

- Single-service Dockerfile (use standard Node Dockerfile guides)
- Build system is Poetry / Cargo / Go modules (different patterns)

## Checklist

### Build Stage

- [ ] Copy `packages/*/prisma` before shared build
- [ ] Run `npx prisma generate` on shared workspace **before** `tsc` compilation
- [ ] Build shared first (`npm run build -w shared` or equivalent)
- [ ] Build dependents after shared is in `node_modules/.bin/` for shared exports
- [ ] Layer caching: use `.dockerignore` to exclude `node_modules`, `.git`, `dist/`, `coverage/`

### Dependencies & Exports

- [ ] Each public package exposes exports field in package.json: `"exports": { ".": "./dist/index.js", "./types": "./dist/types.d.ts" }`
- [ ] Node gyp modules pinned (avoid random native builds)
- [ ] Resolutions / overrides locked (prevent dependency version drift)

### Runtime Stage (Production)

- [ ] Copy entire `node_modules/` tree from builder, not just root (workspaces scatter node_modules across packages/)
- [ ] Copy `packages/*/node_modules` separately from root `node_modules` if monorepo uses phantom dependencies
- [ ] Copy Prisma client from builder: `COPY --from=builder /app/packages/db/.prisma ./packages/db/.prisma`
- [ ] Set `NODE_ENV=production` before `npm ci --omit=dev`

### Environment Variables

- [ ] `YOUTUBE_DL_SKIP_DOWNLOAD=1` (not `=true`) — yt-dlp binary expects string "1", not boolean
- [ ] `YOUTUBE_DL_SKIP_PYTHON_CHECK=1` where yt-dlp invoked without Python runtime
- [ ] `NODE_ENV=production` in runtime stage

### Permissions & Directories

- [ ] `chown -R node:node` scoped to writable dirs only: `/app/logs`, `/app/cache`, `/tmp`
- [ ] **NOT** `chown -R / /app` (breaks system binaries in production)
- [ ] User `node` (UID 1000) has write access to only necessary dirs

### Docker Compose (if used)

- [ ] `build:` section includes `args: { COMMIT_SHA: "${GIT_SHA}" }` for traceability
- [ ] `--build-arg COMMIT_SHA=<sha>` passed on rebuild for container identification
- [ ] `volumes` mounts for logs/cache are writable by node user

## Example structure

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/

# Prisma generate BEFORE tsc
RUN npm ci && \
    npm run generate:prisma -w shared && \
    npm run build -w shared && \
    npm run build -w api && \
    npm run build -w bot

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/*/node_modules ./packages/*/node_modules
COPY --from=builder /app/packages/*/dist ./packages/*/dist
COPY --from=builder /app/packages/db/.prisma ./packages/db/.prisma

RUN chown -R node:node /app
USER node

CMD ["node", "packages/bot/dist/index.js"]
```

## Related skills

- `prod-rebuild` — executes `docker compose build` with these Dockerfiles
- `docker-expert` — deep debugging of Docker layer caching issues

## Lessons from production

1. **v2.6.122 outage**: packages/bot/node_modules not copied → missing discord.js → process crash on startup
2. **v2.6.125 outage**: Prisma client not generated in builder → @prisma/client not in dist → runtime require fails
3. **v2.6.127 outage**: YOUTUBE_DL_SKIP=true instead of =1 → yt-dlp check for string "1", got boolean, downloaded full Python runtime (800MB)
