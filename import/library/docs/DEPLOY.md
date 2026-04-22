# Deploy to Cloudflare Pages + custom domain

Target: **`library.lucassantana.tech`**. Free tier. Works with the private GitHub repo.

Two paths: (A) **Git integration** (Cloudflare builds on push — simplest), or (B) **GitHub Actions** (we build, Wrangler uploads — already wired in `.github/workflows/cloudflare-pages.yml`).

Pick one. Below: (A) is one-time setup, (B) is the automation.

---

## A. Cloudflare Pages — Git integration (recommended, 10 min)

1. Log in to Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize the GitHub app for `LucasSantana-Dev/ai-dev-toolkit-library`.
3. Project settings:
   - **Project name:** `ai-dev-toolkit-library` (becomes `ai-dev-toolkit-library.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** Astro
   - **Build command:** `pnpm install --frozen-lockfile && pnpm --filter web run build`
   - **Build output directory:** `web/dist`
   - **Root directory:** *(leave empty)*
   - **Environment variables:**
     - `NODE_ENV=production`
     - `ASTRO_SITE=https://library.lucassantana.tech`
     - `ASTRO_BASE=/`
     - `NODE_VERSION=20` *(CF needs this)*
4. **Save and deploy.** First build takes ~2 minutes.

That's the deploy path. Every push to `main` rebuilds and publishes. If you keep this, **delete** `.github/workflows/cloudflare-pages.yml` — no reason to build twice.

## B. GitHub Actions — Wrangler deploy (already in repo)

Use this if you want to build on GH runners (no CF build minutes consumed) or you need custom build steps.

### One-time Cloudflare setup

1. Log in to Cloudflare → **My Profile** → **API Tokens** → **Create Token** → "Create Custom Token":
   - **Token name:** `gh-pages-deploy`
   - **Permissions:** `Account → Cloudflare Pages → Edit`
   - **Account Resources:** Include → *your account*
   - Create → copy the token.
2. Get your account ID: Cloudflare dashboard right sidebar → "Account ID" (copy).
3. Create the Pages project **once**, without Git integration:
   ```bash
   npm i -g wrangler
   wrangler login
   wrangler pages project create ai-dev-toolkit-library --production-branch=main
   ```
4. Add GitHub secrets:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --repo LucasSantana-Dev/ai-dev-toolkit-library --body '<token>'
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo LucasSantana-Dev/ai-dev-toolkit-library --body '<account-id>'
   ```
5. Next push to `main` → `cloudflare-pages` workflow runs → site lives at `https://ai-dev-toolkit-library.pages.dev`.

---

## Custom domain — `library.lucassantana.tech`

Works the same way for both path A and path B.

1. In the Cloudflare Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `library.lucassantana.tech`.
3. If `lucassantana.tech` is on Cloudflare DNS: CF auto-adds a CNAME — done in ~30s. Confirm in DNS tab:
   ```
   library  CNAME  ai-dev-toolkit-library.pages.dev  (Proxied)
   ```
4. If `lucassantana.tech` is NOT on Cloudflare: CF shows a DNS instruction — add a CNAME at your registrar:
   ```
   Host:   library
   Type:   CNAME
   Value:  ai-dev-toolkit-library.pages.dev
   TTL:    300
   ```
5. SSL propagates automatically (CF issues a Universal cert). Site live in ~1–2 min.

## Preview deploys

CF Pages auto-creates a `<hash>.<project>.pages.dev` URL for every non-main push, which is the preview for PRs. You get those for free with either path.

## Rollback

Cloudflare dashboard → Pages → project → **Deployments** → pick any historical deploy → **Rollback**. Zero-downtime, instant.

## Cost

Free tier: 500 builds/month, unlimited requests, unlimited bandwidth, unlimited sites. We'll never approach the ceiling with a catalog site.
