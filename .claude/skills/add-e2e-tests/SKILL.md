---
name: add-e2e-tests
description: Add a Playwright e2e test driving the demo app in this repo. Use when the user wants to add/write e2e tests, cover a user flow end-to-end, or test something with Playwright.
---

# Add E2E Tests

This is a project-specific reference for adding **Playwright** e2e tests against `apps/demo` — where they go, how to run them, and the patterns already established in `apps/demo/e2e`. For unit/component-level tests, use the `add-unit-tests` skill instead; this skill is for full-stack user flows driven through the browser against the demo app's fake `AuthService`.

## Where tests go

Test files live flat in `apps/demo/e2e/`, one file per user-facing flow, named `<flow>.spec.ts`:

- `apps/demo/e2e/login.spec.ts`
- `apps/demo/e2e/logout.spec.ts`
- `apps/demo/e2e/auth-guard.spec.ts`

Shared helpers (like the `login()` flow) live in `apps/demo/e2e/utils.ts` — reuse them instead of re-typing the login steps in every spec that needs an authenticated session.

Don't invent a new e2e location or config — `apps/demo/playwright.config.ts` sets `testDir: "./e2e"` and is the only Playwright config in the repo.

## Running tests

```bash
pnpm --filter @eappflow/demo test:e2e                                   # full e2e suite
pnpm --filter @eappflow/demo exec playwright test e2e/login.spec.ts     # single file
pnpm --filter @eappflow/demo exec playwright test --ui                  # interactive UI mode
pnpm test:e2e                                                            # same suite, from repo root
```

The Playwright config starts the demo app for you (`vite dev` locally, a production-shaped build via `vite preview` on CI) — don't start `pnpm dev` yourself first, `reuseExistingServer` will pick up an already-running one but it isn't required.

## What to test — real user flows, not implementation details

Drive the app the way a user would: navigate, fill fields, click, then assert on URL and visible content. Don't reach into Pinia stores, component internals, or network calls from a spec — that's what unit tests are for.

```typescript
// GOOD — drives the UI, asserts on outcome
test("logs in and lands on the dashboard", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
});
```

Cover the golden path plus the meaningful edge cases for the flow (validation errors, unauthenticated redirects, permission denials) — see `auth-guard.spec.ts` and the second test in `login.spec.ts` for the shape.

## Selectors: `getByTestId`, not CSS/text

Every interactive element already exposes `data-testid` (see `LoginView.vue`, `AppHeader.vue`, `EafFormItem.vue`). Use `page.getByTestId(...)` — never CSS selectors, `nth()`, or brittle text matches. If the element you need doesn't have a `data-testid` yet, add one to the component rather than working around its absence in the test.

## Authenticated flows: reuse `login()`, don't hand-roll

`apps/demo/src/services/fakeAuthService.ts` is the fake `AuthService` the demo app is wired to — any username/password combination it accepts works through the real login form. For any spec needing a logged-in session, import and call the shared helper instead of repeating the fill/click sequence:

```typescript
import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("...", async ({ page }) => {
  await login(page);
  // ...continue the flow
});
```

If a new flow needs a login variant not covered by `login()`'s defaults (e.g. a specific user/permission set), extend `utils.ts` with a new parameter or helper rather than duplicating the whole sequence inline.

## Assertions: URL + visible state, not just "didn't throw"

Every test should assert both the resulting route and the resulting visible UI state — a test that only checks one is checking half the behavior:

```typescript
await expect(page).toHaveURL(/\/login/);
await expect(page.getByTestId("login-input")).toBeVisible();
```

## Checklist before calling an e2e spec done

- [ ] Lives in `apps/demo/e2e/<flow>.spec.ts`, one file per user flow
- [ ] Uses `page.getByTestId(...)` exclusively — no CSS/text selectors, no `nth()`
- [ ] Reuses `login()` from `./utils` for authenticated flows instead of duplicating steps
- [ ] Asserts both the resulting URL and the resulting visible content
- [ ] Covers the golden path and the flow's real edge cases (validation, redirects, permissions) — not just the happy path
- [ ] Drives the UI only — no reaching into stores, composables, or network internals from the spec
- [ ] `pnpm --filter @eappflow/demo exec playwright test e2e/<file>` passes locally
