# Deploy to Cloudflare Workers Static Assets + custom domain

Target: **`forgekit.lucassantana.tech`** on Cloudflare Workers. Free tier. Works with the private GitHub repo.

Cloudflare builds and deploys on every push to `main` via its Git integration. No GitHub Actions workflow needed.

---

## 1. Create the Worker project (one-time, ~10 min)

1. Log in to Cloudflare → **Workers & Pages** → **Create** → **Worker**.
2. Authorize the Cloudflare GitHub app for `LucasSantana-Dev/forgekit`.
3. Project settings:
   - **Project name:** keep the existing `ai-dev-toolkit-library` Worker binding until the production app rename is scheduled.
   - **Production branch:** `main`
   - **Framework preset:** Astro
   - **Build command:** `pnpm install --frozen-lockfile && pnpm --filter @forge-kit/web run build`
   - **Deploy command:** `cd apps/web && npx wrangler deploy`
   - **Build output directory:** `apps/web/dist`
   - **Root directory:** _(leave empty)_
4. **Environment variables** (Production):
   - `NODE_VERSION` = `20`
   - `ASTRO_SITE` = `https://forgekit.lucassantana.tech`
   - `ASTRO_BASE` = `/`
5. **Save and deploy.** First build takes ~2 min; subsequent rebuilds ~30–60s.

Every push to `main` rebuilds and publishes. Every non-main push gets a preview deploy.

## 2. Custom domain — `forgekit.lucassantana.tech`

In the Worker project → **Settings** → **Domains & Routes** → enter `forgekit.lucassantana.tech`.
Keep `library.lucassantana.tech` attached during rollout until the new host resolves and serves the same app.

- **If `lucassantana.tech` is on Cloudflare DNS:** CF auto-adds the CNAME — done in ~30s. Verify in the DNS tab:
  ```
  forgekit  CNAME  <worker-target>  (Proxied)
  ```
- **If `lucassantana.tech` is on another registrar:** CF shows DNS instructions — add at your registrar:
  ```
  Host:   forgekit
  Type:   CNAME
  Value:  <worker-target>
  TTL:    300
  ```

SSL propagates automatically (CF issues a Universal cert). Site live in 1–2 min.

## 3. Rollback

Cloudflare dashboard → Worker project → **Deployments** → pick any historical deploy → **Rollback**. Instant, zero-downtime.

## 4. Cost

Free tier capacity is more than enough for the static catalog.

## Troubleshooting

- **Build fails with `pnpm: command not found`** — add `PNPM_VERSION=9.12.0` to env vars. CF detects pnpm from `packageManager` in `package.json`, but being explicit helps.
- **Site loads but assets 404** — `ASTRO_BASE` must be `/` for root-of-domain deploys. It gets baked into every asset URL at build time.
- **Custom domain stuck on "Verifying"** — usually DNS propagation or pending certificate issuance. Wait 5–10 min, then check the Cloudflare-provided target for the route.
