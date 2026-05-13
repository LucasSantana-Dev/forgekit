// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Deploy target is Cloudflare Workers at forgekit.lucassantana.tech — the site
// lives at the root of the domain, so no base prefix. Override with ASTRO_BASE
// only when building for a different host.
const base = process.env.ASTRO_BASE ?? "/";
const site = process.env.ASTRO_SITE ?? "https://forgekit.lucassantana.tech";

export default defineConfig({
  site,
  base,
  // "always" eliminates the `/skills → /skills/` 307 redirect chain that
  // squirrelscan flagged on 99 pages — every internal link now goes directly
  // to the canonical trailing-slash URL.
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  // pt-BR locale was unpublished — the i18n + sitemap blocks no longer reference
  // it so `@astrojs/sitemap` doesn't emit 338 stale `/pt-br/*` URLs.
  integrations: [sitemap()],
});
