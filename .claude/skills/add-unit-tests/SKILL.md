---
name: add-unit-tests
description: Add a Vitest unit test for a store, composable, component, or util in this repo. Use when the user wants to add/write unit tests, increase coverage, or test a specific file with Vitest.
---

# Add Unit Tests

This is a project-specific reference for adding **Vitest** unit tests in this monorepo — where they go, how to run them, and the patterns already established in `packages/ui-shell` and `packages/ui-shell-components`. For full red→green TDD methodology, use the `tdd` skill instead; this skill is the fast path for adding tests to existing code.

## Where tests go

Test files live in a `__tests__/` directory next to the code they cover, inside the package:

- `packages/ui-shell/src/composables/__tests__/creatScopedI18n.spec.ts`
- `packages/ui-shell-components/src/stores/__tests__/useEafMessageStore.spec.ts`
- `packages/ui-shell/__tests__/constants.test.ts` (package-root-level tests)

Either `.spec.ts` or `.test.ts` is fine — match whatever the nearest existing sibling file uses. Don't invent a new tests location (e.g. a flat top-level `tests/` folder) — Vitest is configured per-package via `vitest.config.ts` (`environment: "jsdom"`), picked up by the root `vitest.config.ts`'s `test.projects`.

## Running tests

```bash
pnpm --filter @eappflow/ui-shell exec vitest run                                  # all tests in a package
pnpm --filter @eappflow/ui-shell exec vitest run path/to/thing.spec.ts            # single file
pnpm test:watch                                                                    # watch mode, repo root
pnpm test                                                                          # full run, repo root
```

## What to test — pick the real seam, not the export list

Test the **public behavior**, not that a symbol exists. A smoke test that only asserts an export is `toBeDefined()` is not a unit test — it gives no coverage and should not be how new test files are seeded. Assert on outcomes: state after an action, a return value, a thrown error, a rendered/emitted result.

```typescript
// BAD — asserts nothing about behavior
test("useEafMessageStore is defined", () => {
  expect(useEafMessageStore).toBeDefined();
});

// GOOD — asserts behavior through the real public interface
it("should add message and clear from EafMessageStore", () => {
  const store = useEafMessageStore();
  store.addMessage(message);
  expect(store.messages[0]).toEqual(message);
  store.clearMessages();
  expect(store.messages.length).toBe(0);
});
```

## Pinia stores

Reset Pinia before each test with `setActivePinia(createPinia())`, then call the store composable directly:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useEafMessageStore } from "../useEafMessageStore";

describe("useEafMessageStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("...", () => {
    const store = useEafMessageStore();
    // act + assert against store state/getters/actions
  });
});
```

## DI services (AuthService, MenuService, ThemeService, AppConfig)

Stores/composables inject services via `inject(SOME_KEY, undefined) ?? createDefault...()` (see `useAuthStore.ts`). Don't reach into or mock the internals of the default implementation — provide a fake through Vue's DI instead, the same way `apps/demo` provides `createFakeAuthService()`:

```typescript
import { provide } from "vue"; // inside a test setup component, not the store call itself
// mount a host component that calls `app.provide(AUTH_SERVICE_KEY, fakeAuthService)`
// before invoking the store, so useAuthStore's inject() resolves to the fake.
```

If the composable/store under test doesn't use DI, don't introduce it just to make it "mockable" — that's speculative generality. Only reach for a fake when the code already injects.

## Composables that use Vue APIs (`useI18n`, lifecycle hooks, etc.)

Composables relying on Vue context (injection, `nextTick`, component lifecycle) need a host component via `@vue/test-utils`'s `mount`, not a bare function call — see the `withSetup` helper pattern in `creatScopedI18n.spec.ts`:

```typescript
function withSetup<T>(composable: () => T) {
  let result!: T;
  const wrapper = mount({
    setup() {
      result = composable();
      return () => null;
    },
  });
  return { result, wrapper };
}
```

Plain composables/utils with no Vue context dependency can just be called directly.

## Assertions must come from an independent source of truth

Don't recompute the expected value the same way the implementation does — that passes by construction and never catches a real bug. Use a known literal instead:

```typescript
// BAD — expected is derived the same way the code derives it
const expected = items.reduce((sum, i) => sum + i.price, 0);
expect(calculateTotal(items)).toBe(expected);

// GOOD — expected is a hand-picked literal
expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
```

## Checklist before calling a test file done

- [ ] Lives in a `__tests__/` dir next to the code it covers
- [ ] Asserts on behavior/state, not just that something is defined or importable
- [ ] Uses the public interface (store actions/getters, composable return value, component's rendered output/emitted events) — not internals
- [ ] Pinia stores reset via `setActivePinia(createPinia())` in `beforeEach`
- [ ] DI services faked through `provide`/injection keys, never mocked by reaching into a default implementation
- [ ] Expected values are independent literals, not recomputed via the same logic under test
- [ ] `pnpm --filter <package> exec vitest run <file>` passes locally
