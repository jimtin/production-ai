# frontend-design-quality

**The failure this prevents:** the agent reports the dashboard "done," and it *is* done — at the exact viewport it was built at. On a short laptop screen the primary action is below the fold; on tablet the table overflows the document; on a phone the nav overlaps the content; and the German translation breaks every button. Agents don't resize windows unless something makes them.

This skill defines frontend "done" as *verified usable across real viewports, with screenshot evidence*.

## What it does

A quality bar for building, changing, or reviewing UI:

1. Map the user path and minimize clicks (while keeping safety confirmations for destructive/billing/admin actions).
2. Inventory existing repo patterns before inventing any new visual system.
3. Design by concrete widths and heights — including the chronically forgotten short-laptop case — not by breakpoint labels.
4. Keep every screen responsive: no horizontal document overflow, intentional wrapping/truncation for long content, keyboard and touch accessibility.
5. Verify behaviorally and visually with Playwright: viewport matrix, overflow checks, screenshots, coverage for every changed user action.

## The design choices worth stealing

- **An explicit acceptance bar.** Eight conditions ("every changed route works at small phone / large phone / tablet portrait / tablet landscape / laptop / desktop / wide desktop", "screenshots prove the final UI works, not just that tests passed") that the agent cannot satisfy by assertion — only by evidence.
- **Viewports, not breakpoints.** Reasoning about `1366×650` catches the dead zone that "lg:" never will. The verification reference pins the concrete matrix.
- **Pattern reuse as a rule, not taste.** New layout systems require justification for why existing primitives don't fit — which is most of what keeps an agent-built app visually coherent over months.
- **States are part of the definition.** Loading, empty, error, validation, disabled, success, permission — designed whenever they can occur, checked in review.
- **Reusable Playwright templates.** `references/playwright-design-patterns.md` carries test patterns for viewport matrices, overflow detection, and screenshot assertions, so "verify visually" costs minutes, not a research project.

## Install

```bash
cp -R skills/frontend-design-quality ~/.codex/skills/
```

Triggers on UI build/change/review work; other skills pull it in for any plan that touches frontend.

## Adapt it

- Pin the viewport matrix to your analytics reality — if 40% of traffic is one device class, it belongs in the matrix.
- Point the pattern-inventory step at your design system or component library docs.
- If you don't use Playwright, keep the acceptance bar and swap the tooling reference; the bar is the skill.
