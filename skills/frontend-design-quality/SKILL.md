---
name: frontend-design-quality
description: Ensure frontend design work follows established repo patterns, minimizes clicks, fills real viewports, stays responsive, avoids text overflow, reduces portal UI clutter, covers content-rich surfaces such as blogs/resources, and is verified with Playwright or equivalent visual screenshots. Use when building, changing, or reviewing frontend UI, pages, portals, dashboards, navigation, forms, content systems, responsive layouts, or user-facing flows in a repo.
---

# Frontend Design Quality

## Core Standard

Treat frontend work as complete only when the implemented flow is usable, visually coherent, and verified across real viewport sizes.

Start by reading the repo's existing UI patterns before designing anything new. Prefer established layout primitives, typography, spacing, navigation, form controls, loading states, empty states, error states, and test utilities over new visual systems.

## Workflow

1. Map the user path.
   - Identify the fewest practical clicks from entry point to successful outcome.
   - Remove redundant confirmation screens, duplicate navigation, avoidable modals, and repeated data entry.
   - Preserve necessary safety checks for destructive, billing, privacy, and admin actions.

2. Inventory existing patterns.
   - Inspect similar pages and shared components before adding new layout or component styles.
   - Reuse project design tokens, shells, grids, buttons, form fields, cards, menus, tabs, toasts, and table/list patterns.
   - If a new pattern is required, make it small, explain why existing patterns do not fit, and keep it compatible with the current design language.

3. Design by actual viewport, not breakpoint labels.
   - Reason about concrete widths and heights, including short laptop screens, tablet portrait/landscape, small phones, and wide desktop.
   - Fill the useful viewport for primary tasks without creating empty "lg-only" layouts.
   - Use grid, flex, container constraints, `minmax`, `min-height: 100dvh`, sticky regions, and scroll regions intentionally.
   - Avoid viewport-scaled font sizing; make text responsive through layout, wrapping, hierarchy, and container constraints.

4. Keep every screen responsive.
   - Verify no horizontal document overflow.
   - Ensure long labels, names, emails, URLs, headings, and translated-length strings wrap or truncate intentionally.
   - Ensure buttons, tabs, filters, table cells, cards, and form labels cannot resize the layout into overlap.
   - Support keyboard navigation, focus visibility, touch targets, and accessible names.

5. Simplify portal flows.
   - For user and admin portals, prioritize fast scanning, clear task status, obvious next actions, and low visual clutter.
   - Prefer dense but calm operational layouts over marketing-style sections.
   - Keep destructive, financial, permission, and publishing actions explicit and recoverable.

6. Cover content-rich implementations.
   - For blogs, resources, articles, docs, manifests, newsletters, or CMS-backed pages, design the full content system: listing, detail page, rich text rendering, metadata, categories/tags, author/date, media, empty states, errors, draft/unpublished states where applicable, SEO/social metadata, and admin editing/preview flows when the repo supports them.
   - If the user points to an existing content-rich repo as the reference implementation, inspect it when available and use it only as a pattern reference, not as a dependency.

7. Verify visually and behaviorally.
   - Read `references/design-verification.md` for the verification checklist.
   - Read `references/playwright-design-patterns.md` when adding or updating Playwright tests for frontend design coverage.
   - Add or update automated coverage for every user action introduced or changed.
   - Use Playwright or the repo's equivalent browser testing tool for screenshots, interaction tests, overflow checks, and route coverage.
   - Run the repo's local test commands, honoring AGENTS.md and container requirements.

## Acceptance Bar

Do not present frontend work as done until these are true:

- The design matches or deliberately extends established repo patterns.
- The primary task can be completed with the minimum practical number of clicks.
- Every changed route works at small phone, large phone, tablet portrait, tablet landscape, laptop, desktop, and wide desktop dimensions.
- Screens fill the useful viewport without awkward dead zones or clipped primary content.
- No visible text, buttons, cards, nav items, form controls, tables, or media overlap or overflow unintentionally.
- Loading, empty, error, validation, disabled, success, and permission states are designed when they can occur.
- All changed user actions have automated browser coverage.
- Screenshots or visual assertions prove the final UI works, not just that tests passed.

## Reference

Use `references/design-verification.md` for concrete viewport sets, Playwright assertions, screenshot expectations, and review checks.

Use `references/playwright-design-patterns.md` for reusable Playwright test templates covering viewport matrices, overflow detection, screenshots, user actions, portals, and content-rich pages.
