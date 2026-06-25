import { test, expect } from "@playwright/test";

const CATALOG_ROUTES = [
  { path: "/skills/", heading: "Skills" },
  { path: "/hooks/", heading: "Hooks" },
  { path: "/agents/", heading: "Agents" },
  { path: "/servers/", heading: "Servers" },
  { path: "/collections/", heading: "Collections" },
  { path: "/tools/", heading: "Tools" },
];

// Catalog index pages — must load with content and no console errors
for (const { path, heading } of CATALOG_ROUTES) {
  test(`${path} — loads with entries`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(path);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();

    // At least one card rendered (cards are <a class="card ...">)
    await expect(page.locator("a.card").first()).toBeVisible();

    expect(errors).toHaveLength(0);
  });
}

// Home page
test("/ — renders hero and catalog sections", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(/forge.kit/i);
  await expect(page.locator('a[href="/skills/"]').first()).toBeVisible();
});

// Search page
test("/search/ — page loads and input is interactive", async ({ page }) => {
  await page.goto("/search/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Search", level: 1 })).toBeVisible();
  const input = page.locator('input[type="search"]');
  await expect(input).toBeVisible();
  await input.fill("plan");
  // Tag chips and structure still visible after typing
  await expect(page.locator(".chip").first()).toBeVisible();
});

// Entry detail pages — one per type
test("/skills/adt-add/ — renders entry detail", async ({ page }) => {
  await page.goto("/skills/adt-add/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("code, pre").first()).toBeVisible();
});

test("/hooks/auto-context-pack/ — renders entry detail", async ({ page }) => {
  await page.goto("/hooks/auto-context-pack/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("/agents/adt-code-reviewer/ — renders entry detail", async ({ page }) => {
  await page.goto("/agents/adt-code-reviewer/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("/tools/capture-training/ — renders entry detail", async ({ page }) => {
  await page.goto("/tools/capture-training/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

// Unknown entry — server must not crash (404 is acceptable, 500 is not)
test("unknown skill id — does not 500", async ({ page }) => {
  const response = await page.goto("/skills/this-does-not-exist-xyz/");
  expect(response?.status()).not.toBe(500);
});
