---
status: active
audience: maintainers
reading_time: 4 min
---

# Auto-deploy — webapp → Cloudflare Workers

The Forge Kit webapp at `apps/web/` deploys to Cloudflare Workers under the
worker name `ai-dev-toolkit-library`, with custom domains
`forgekit.lucassantana.tech` and `library.lucassantana.tech`.

The deploy is automated via `.github/workflows/deploy-web.yml`. It triggers on:

- every push to `main` that touches `apps/web/**`, `packages/catalog/**`,
  `pnpm-workspace.yaml`, `pnpm-lock.yaml`, or the workflow itself,
- and manual `workflow_dispatch` runs.

## One-time setup — Cloudflare API token

The workflow needs a single repository secret: `CLOUDFLARE_API_TOKEN`. Without
it, every run logs a warning and short-circuits — the deploy doesn't fail
red, it just no-ops, until the token is configured.

### 1. Create the token

1. Go to <https://dash.cloudflare.com/profile/api-tokens>.
2. Click **Create Token**.
3. Pick the **Edit Cloudflare Workers** template.
4. Account resources: **Include — your account** (the one that owns
   `ai-dev-toolkit-library`).
5. Zone resources: **Include — All zones** (or only the zones used by the
   custom domains; we touch them at deploy time).
6. (Optional) Set TTL to 90 days and rotate quarterly. If you skip TTL,
   set a calendar reminder.
7. **Continue → Summary → Create Token.** Copy the token string. Cloudflare
   shows it once.

### 2. Store it as a GitHub secret

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo LucasSantana-Dev/forgekit
# Paste the token at the prompt.
```

Or via the GitHub UI: **Settings → Secrets and variables → Actions → New
repository secret → name `CLOUDFLARE_API_TOKEN`, value `<token>`**.

### 3. Trigger a first run

Either push something to `main` that matches the path filter, or manually:

```bash
gh workflow run deploy-web.yml --repo LucasSantana-Dev/forgekit
gh run watch --repo LucasSantana-Dev/forgekit
```

Expected output: `Validate catalog ✅`, `Build webapp ✅`, `Deploy to
Cloudflare Workers ✅`, `Smoke check` returning 200 on `/`,
`/sitemap-index.xml`, `/robots.txt`.

## Manual deploy (fallback)

If the workflow ever needs to be bypassed (CF outage, token rotation
window, etc.):

```bash
pnpm --filter @forge-kit/catalog run validate
pnpm --filter @forge-kit/web run build
cd apps/web && pnpm exec wrangler deploy
```

You'll need a local `wrangler login` first. Output ends with `Deployed
ai-dev-toolkit-library triggers ...`.

## What the smoke check does

After `wrangler deploy` finishes, the workflow waits 8 seconds, then
probes 3 canonical URLs:

| URL | Expected |
|---|---|
| `https://forgekit.lucassantana.tech/` | 200 (catalog homepage) |
| `https://forgekit.lucassantana.tech/sitemap-index.xml` | 200 (sitemap from `@astrojs/sitemap`) |
| `https://forgekit.lucassantana.tech/robots.txt` | 200 (static asset from `apps/web/public/`) |

Any non-200 fails the workflow with `::error::`. The deploy itself stays
live — there's no automatic rollback. If you see a red smoke check, run
`wrangler rollback` from `apps/web/` or push a fix.

## Why not Cloudflare's GitHub integration?

Cloudflare offers a Git-watching auto-deploy in the dashboard for Pages
and now for Workers Builds. Two reasons we don't use it here:

1. The webapp is part of a pnpm monorepo at `apps/web/` — Workers Builds
   sometimes wrestles with non-root build dirs.
2. Wrangler-on-CI is portable: same recipe works for any CI provider, and
   any contributor can re-run the deploy locally with the same command.

If Workers Builds becomes the better choice later, this workflow is one
file to delete + one toggle in the Cloudflare dashboard.

## Related

- `apps/web/wrangler.jsonc` — worker name, custom domains, asset config.
- `.github/workflows/deploy-web.yml` — the workflow this guide configures.
- `apps/web/public/` — static assets served as-is (favicon, robots.txt,
  og-image.svg).
