# Design Verification Checklist

Use this checklist when implementing or reviewing frontend UI with the `frontend-design-quality` skill.

## Context Discovery

- Read the repo's AGENTS.md, README, package scripts, Playwright config, test setup, and relevant shared layout/components.
- Find nearby examples before editing: shells, dashboards, forms, content pages, tables, cards, navigation, empty states, and error states.
- Identify the route, user role, data state, and exact user actions being changed.
- Note whether tests must run in Docker or another local container before any GitHub push.

## Click-Minimization Review

- Count clicks from entry to successful completion for each changed flow.
- Remove avoidable intermediate pages, duplicated buttons, unnecessary modals, hidden primary actions, and repeated fields.
- Keep confirmation only for destructive, expensive, security-sensitive, irreversible, or high-risk actions.
- Make the next action visible without forcing the user to scan unrelated controls.

## Viewport Set

Verify each changed route at representative dimensions. Adjust for app-specific devices when the repo already defines them.

```ts
const designViewports = [
  { name: "small-phone", width: 360, height: 740 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "short-laptop", width: 1280, height: 720 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide-desktop", width: 1920, height: 1080 },
];
```

For dense portals, include at least one short-height viewport. For marketing or editorial pages, include at least one narrow mobile viewport with real long copy.

## Responsive Layout Checks

- Assert no horizontal page overflow:

```ts
await expect
  .poll(() =>
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  )
  .toBe(true);
```

- Check that primary headings, nav, action bars, tables, forms, cards, media, and sticky regions stay inside the viewport or intentional scroll containers.
- Use realistic long values for names, emails, labels, article titles, URLs, category names, and CTA text.
- Test hover, focus, active, disabled, validation, loading, empty, error, and success states when present.
- Confirm touch targets are usable on mobile and dense controls remain keyboard accessible.

## Portal Design Checks

- Make admin and user portals task-first: surface status, blockers, next actions, and recent activity before secondary decoration.
- Keep navigation predictable and persistent enough for repeated work.
- Avoid nested cards and excessive panels; use full-width bands, tables, lists, forms, tabs, drawers, and modals according to existing repo patterns.
- Keep filters, bulk actions, search, pagination, sorting, and edit flows close to the data they affect.
- Verify permission-gated, empty, loading, and partial-data states.

## Content-Rich Page Checks

For blogs, resources, articles, manifestos, docs, and CMS-backed pages, cover the whole system:

- Listing page: title, summary, media, tags/categories, author/date, pagination or load-more, empty state.
- Detail page: readable prose, headings, media, embeds, tables, quotes, code blocks if supported, related content, sharing or CTA, SEO metadata.
- Admin/editor: create, edit, preview, publish/unpublish, delete/archive, validation, upload/media selection if supported.
- Rendering safety: sanitized HTML/Markdown, constrained media, responsive embeds, accessible headings, and no layout break from user-provided content.
- Data states: draft, scheduled, unpublished, missing media, long title, no results, network/server error.

When using an existing content-rich repo as an example, look for content constants, rich-text renderers, public content routes, admin content editors, and Playwright route coverage. Treat those as examples of surface coverage, not visual rules to copy blindly.

## Screenshot and Browser Verification

- Prefer the repo's Playwright setup. Use another browser tool only when the repo already standardizes on it.
- Capture screenshots for every changed route at the viewport set above, or use Playwright visual snapshots if the repo supports them.
- Add semantic assertions in addition to screenshots: visible headings, primary actions, successful submissions, role-specific controls, URL changes, and data persistence.
- Use `page.locator(...).boundingBox()` or DOM measurements for critical layout promises such as hero fit, sticky toolbar placement, table containment, and non-overlap.
- Inspect screenshots manually before finalizing. Passing browser tests is not enough if the screenshot is visually broken.

## Completion Report

When reporting completion, include:

- Changed UI surfaces and user flows.
- Viewports visually checked.
- Tests run, including whether they ran locally in containers when required.
- Any known visual or coverage gaps.
- When the same visual issue recurs across threads, add it to the route-specific screenshot checklist before implementation so Playwright verifies the exact viewport, long-text, and state combination that failed previously.
