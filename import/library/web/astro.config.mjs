// @ts-check
import { defineConfig } from "astro/config";

// Deploy target is Cloudflare Pages at library.lucassantana.tech — the site
// lives at the root of the domain, so no base prefix. Override with
// ASTRO_BASE=/ai-dev-toolkit-library for GH Pages fallback.
const base = process.env.ASTRO_BASE ?? "/";
const site = process.env.ASTRO_SITE ?? "https://library.lucassantana.tech";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
});
