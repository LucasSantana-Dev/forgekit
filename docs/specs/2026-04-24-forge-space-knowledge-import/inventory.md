---
status: read-only reference
generated: 2026-04-24 by Explore subagent
---

# Inventory — forge-space tree

Read-only inspection of `/Volumes/External HD/Desenvolvimento/forge-space/`
on 2026-04-24, captured here for audit. This is **not** the spec; see
`spec.md` for decisions. Kept as evidence so a reviewer can verify the
migration plan against what's actually on disk.

## Tree overview

19 sub-directories under `forge-space/`, 13 with `.git/` (active or stale
repos), 6 artefacts (worktrees, backups, scaffolds). No sub-repo is
>6 months stale.

## High-value migration candidates

1. **forge-ai-init** (130 MB) — Comprehensive AI governance CLI. 115+
   anti-pattern scanners, legacy-migration assessment, test-autogen,
   quality gates. No equivalent in Forge Kit. **Effort M.** Extract
   `src/lib/scanners/`, `src/lib/assess/`, test-autogen hook generator.

2. **core/ARCHITECTURE.md + docs/** (212 KB docs inside 212 MB repo) —
   Architectural patterns, security spoke contract v1, IDP framework
   (scorecard, policy engine, tenant isolation). Forge Kit has 13 guide
   docs; this adds structured patterns + shared infra playbooks.
   **Effort M.**

3. **branding-mcp** (189 MB) — 58 MCP tools for design system generation
   (colours, typography, spacing, logos, OG images, export W3C/CSS/
   Tailwind/React/Figma). **Effort S.** Standalone MCP server, drop-in
   to servers catalog.

4. **ui-mcp** (747 MB total; 355 KB code + 22 tool specs) — Thin adapter
   layer for framework-aware UI generation (React/Vue/Angular/Svelte/
   HTML). Wraps `siza-gen` backend. **Effort S.** Protocol adapter only;
   reference implementation for code-generation MCP pattern.

5. **brand-guide/src/tokens/** (267 MB) — Design token export pipeline
   (6 formats), npm package `@forgespace/brand-guide`. Forge Kit has no
   design tokens. **Effort S.**

6. **forge-ai-action** (141 MB) — GitHub Action for PR quality gates
   (forge-ai-init integration). **Effort S.** Plug-and-play for
   `forge-kit --check` in Actions workflows.

7. **github-org-workflows** (1.2 MB) — Reusable GitHub Actions for
   org-level CI coordination, Renovate config, dep management.
   **Effort S.**

8. **core/docs/SHARED_DOCUMENTATION.md + core/AGENTS.md** — Agent
   orchestration patterns, operational guides for multi-agent repos.
   **Effort M.**

9. **siza-gen/src/generators/** (607 MB) — Generation engines for React/
   Vue/Angular/Svelte/HTML. Underlies ui-mcp. **Effort L — deferred.**
   Only migrate generators/ if ui-mcp adoption requires local tuning.

10. **mcp-gateway/scripts/gateways.txt + Docker compose** (15 MB) —
    Pre-configured MCP server registry (25+ servers, auth patterns,
    virtual server setup). **Effort S.** Reference for MCP server
    discovery + composition.

## Already represented in Forge Kit (skip)

- **Forge Kit at `/Volumes/External HD/Desenvolvimento/ai-dev-toolkit/`** —
  this is the target. `forge-space/ai-dev-toolkit` is v0.11.0 (20+
  commits behind); tombstone, do not import.
- **Skill catalog in `packages/catalog/catalog/skills/`** — 100 skills
  already present (adt-*); don't duplicate from forge-space repos.
- **Governance guide docs in `docs/guides/`** — 13 markdown files
  already in place; only add from forge-ai-init if new checks appear.

## Out of scope / won't migrate

- **siza/** (2.9 GB full-stack app) — product, not toolkit. Keep in
  forge-space; reference only.
- **siza-desktop/** (1.2 GB Electron app) — product. Keep separate.
- **forgespace-web/** (1.0 GB marketing site) — keep in org.
- **siza-backup-no-git/** — abandoned backup; ignore.
- **_worktrees/** — transient git worktrees; cleanup artefact.
- **automations/** (no git) — not a repository; scaffold only.

## Git activity summary

| Repo | Last commit | Status | Notes |
|---|---|---|---|
| branding-mcp | 2026-04-20 | active | Hono deps |
| mcp-gateway | 2026-04-20 | active | Python deps, security fix pending |
| ui-mcp | 2026-04-20 | active | Dev deps |
| siza-gen | 2026-04-20 | active | Dev deps |
| core | 2026-04-15 | active | Spec bootstrap |
| forge-ai-init | 2026-04-08 | active | Bin entry regression guard |
| siza | 2026-04-08 | active | Release candidate |
| brand-guide | 2026-04-08 | active | Hono deps |
| siza-desktop | 2026-04-07 | active | CVE patches |
| github-org-workflows | 2026-04-07 | active | Renovate preset |
| forgespace-web | 2026-04-06 | active | Release |
| forge-ai-action | 2026-04-04 | active | Test coverage pass |
| ai-dev-toolkit (forge-space clone) | 2026-04-04 | **stale** | 20 commits behind |
| forge-local | 2026-04-02 | quiet | Model upgrade |

No fork divergence from main Forge Kit detected in sampled repos.

## Notes

- Inventory is read-only. No files copied, moved, or pushed.
- Directory size estimates include `node_modules/` and `.git/`; actual
  code/docs payload is typically 1–5 % of total.
- Full inspection transcript preserved in agent-run logs (if needed).
