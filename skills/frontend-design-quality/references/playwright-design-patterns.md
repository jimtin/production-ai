# Playwright Design Test Patterns

Use these patterns when adding or updating Playwright coverage for frontend design quality. Adapt them to the repo's existing test utilities, auth helpers, factories, routes, and container commands.

Official references:

- Playwright viewport and device emulation: https://playwright.dev/docs/emulation
- Playwright web-first assertions and `expect.poll`: https://playwright.dev/docs/test-assertions
- Playwright visual comparisons and `toHaveScreenshot`: https://playwright.dev/docs/test-snapshots
- Playwright accessibility testing with axe: https://playwright.dev/docs/accessibility-testing
- Playwright best practices for user-visible behavior: https://playwright.dev/docs/best-practices

## Design Coverage Shape

Every changed frontend route should have browser coverage that combines:

- A viewport matrix for responsive layout.
- Semantic assertions for the user's actual goal.
- Overflow and containment checks.
- Screenshots or visual snapshots.
- Long-content stress data.
- Interaction coverage for every changed user action.
- Role and permission coverage for portals.

Prefer user-facing locators such as roles, labels, text, and accessible names. Use test IDs only when the UI has no stable accessible target.

## Viewport Matrix

Use concrete dimensions instead of relying on labels like `sm`, `md`, or `lg`.

```ts
export const designViewports = [
  { name: "small-phone", width: 360, height: 740 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "short-laptop", width: 1280, height: 720 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide-desktop", width: 1920, height: 1080 },
] as const;
```

## Shared Helpers

Create helpers in the repo's existing Playwright helper location when multiple tests need them.

```ts
import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

export async function expectNoDocumentHorizontalOverflow(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        })),
      { message: "document must not have unintended horizontal overflow" }
    )
    .toMatchObject({ hasOverflow: false });
}

export async function expectLocatorWithinViewport(
  page: Page,
  locator: Locator,
  label: string
) {
  await expect(locator, `${label} should be visible`).toBeVisible();

  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box, `${label} should have a bounding box`).not.toBeNull();
  expect(viewport, "page should have a viewport").not.toBeNull();

  expect(box!.x, `${label} left edge`).toBeGreaterThanOrEqual(0);
  expect(box!.y, `${label} top edge`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `${label} right edge`).toBeLessThanOrEqual(viewport!.width + 1);
  expect(box!.y + box!.height, `${label} bottom edge`).toBeLessThanOrEqual(viewport!.height + 1);
}

export async function findUnexpectedTextClipping(page: Page) {
  return page.evaluate(() => {
    const selector = [
      "a",
      "button",
      "h1",
      "h2",
      "h3",
      "h4",
      "label",
      "legend",
      "th",
      "td",
      "p",
      "li",
      "[data-design-check]",
    ].join(",");

    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const hidden =
          style.display === "none" ||
          style.visibility === "hidden" ||
          rect.width === 0 ||
          rect.height === 0;
        const intentionallyClipped =
          element.hasAttribute("data-allow-text-overflow") ||
          style.textOverflow === "ellipsis";

        return (
          !hidden &&
          !intentionallyClipped &&
          element.scrollWidth > element.clientWidth + 1
        );
      })
      .slice(0, 20)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: (element.textContent || "").trim().slice(0, 120),
        className: element.className.toString(),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));
  });
}

export async function attachDesignScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string
) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, {
    body: screenshot,
    contentType: "image/png",
  });
}
```

## Route Visual Coverage Template

Use this for pages where screenshots are evidence for manual review. Use `toHaveScreenshot` instead when the repo already maintains visual baselines.

```ts
import { expect, test } from "@playwright/test";
import {
  attachDesignScreenshot,
  designViewports,
  expectLocatorWithinViewport,
  expectNoDocumentHorizontalOverflow,
  findUnexpectedTextClipping,
} from "./design-test-helpers";

for (const viewport of designViewports) {
  test(`dashboard design holds at ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /new/i })).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
    await expectLocatorWithinViewport(
      page,
      page.getByRole("main"),
      `main content at ${viewport.name}`
    );

    expect(await findUnexpectedTextClipping(page)).toEqual([]);
    await attachDesignScreenshot(page, testInfo, `dashboard-${viewport.name}`);
  });
}
```

## Visual Snapshot Template

Use visual snapshots for stable pages where the repo is prepared to commit and review baselines. Run in the same OS/browser/container environment that generated the baseline.

```ts
for (const viewport of designViewports) {
  test(`marketing page visual snapshot ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await expectNoDocumentHorizontalOverflow(page);
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixels: 100,
    });
  });
}
```

For volatile regions such as videos, clocks, ads, maps, cursors, or third-party embeds, use the repo's existing screenshot stylesheet pattern or Playwright's `stylePath` option to hide only the unstable region.

## Long-Content Stress Template

Use realistic worst-case data. Prefer seeded test data or route mocks over hardcoded DOM mutation when the repo already has factories.

```ts
test("resource listing handles long titles and metadata on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await seedResource({
    title:
      "A very long practical guide title that should wrap cleanly without pushing cards outside the viewport",
    authorName: "Alexandria Montgomery-Smith-Rodriguez",
    category: "Advanced Implementation Notes and Field Reports",
  });

  await page.goto("/resources");
  await expect(page.getByRole("heading", { name: /resources/i })).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);
  expect(await findUnexpectedTextClipping(page)).toEqual([]);
  await attachDesignScreenshot(page, testInfo, "resources-long-content-mobile");
});
```

## Click-Minimization Template

Write tests around the shortest successful path. Count only user-visible actions such as clicks, taps, selections, and submissions.

```ts
test("participant can submit the primary portal task through the shortest path", async ({
  page,
}) => {
  await signInAsParticipant(page);
  await page.goto("/portal");

  await page.getByRole("link", { name: /today's task/i }).click();
  await page.getByLabel(/submission/i).fill("Completed the task with notes.");
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/submitted/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /today's task/i })).toBeVisible();
});
```

If the implemented flow needs more steps, document the product reason in the test or completion report.

## Portal Role Template

Cover admin and user portals separately. Verify role-specific navigation, primary action visibility, reduced clutter, empty states, and permission boundaries.

```ts
test("admin portal keeps the primary moderation flow visible on a short laptop", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await signInAsAdmin(page);
  await page.goto("/admin/reviews");

  await expect(page.getByRole("heading", { name: /reviews/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /approve/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /reject/i }).first()).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);
  expect(await findUnexpectedTextClipping(page)).toEqual([]);
  await attachDesignScreenshot(page, testInfo, "admin-reviews-short-laptop");
});

test("participant portal does not expose admin actions", async ({ page }) => {
  await signInAsParticipant(page);
  await page.goto("/portal");

  await expect(page.getByRole("link", { name: /admin/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /approve|reject|delete user/i })).toHaveCount(0);
});
```

## Content System Template

For blogs, resources, docs, and manifestos, cover list, detail, rich content, and editor/publishing flows when the repo has them.

```ts
test("blog reader flow covers listing, detail, rich content, and no overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await seedBlogPost({
    title: "How Experts Build Trust With Useful Public Proof",
    excerpt: "A practical article with tags, media, quotes, and long-form sections.",
    html:
      "<h2>Field notes</h2><p>Long useful paragraph...</p><blockquote>Quoted insight</blockquote>",
    tags: ["Strategy", "Content Systems"],
  });

  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: /blog/i })).toBeVisible();
  await page.getByRole("link", { name: /experts build trust/i }).click();

  await expect(page.getByRole("heading", { name: /experts build trust/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /field notes/i })).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);
  expect(await findUnexpectedTextClipping(page)).toEqual([]);
  await attachDesignScreenshot(page, testInfo, "blog-detail-mobile-rich-content");
});
```

## Accessibility Layer

When the repo already has `@axe-core/playwright` or accessibility tests, include scans for changed routes and interactive revealed states. Automated scans do not replace manual visual inspection or keyboard testing.

```ts
import AxeBuilder from "@axe-core/playwright";

test("changed page has no obvious WCAG A/AA regressions", async ({ page }) => {
  await page.goto("/changed-route");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## Completion Criteria

Report the concrete evidence:

- Route and user action coverage added or updated.
- Viewports tested.
- Screenshots or snapshot baselines produced.
- Long-content and portal states covered.
- Accessibility checks run, if supported by the repo.
- Local container commands run before any GitHub push.
