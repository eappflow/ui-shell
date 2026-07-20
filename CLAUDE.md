# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@eappflow/ui-shell** is a pnpm monorepo delivering a configurable Vue 3 application shell — auth flow, layout (sidebar/header/footer), navigation, theming, and form components — designed for business applications. It is **not** a standalone app; host applications (like `fransible-platform`) consume it as a Vue plugin.

```
packages/
  ui-shell/           # @eappflow/ui-shell — Vue plugin, layouts, auth, router, DI
  ui-shell-components/# @eappflow/ui-shell-components — form/validation/filter components
apps/
  demo/               # @eappflow/demo — demo app showcasing the shell
modules/
  diagnostics/        # @eappflow/diagnostics — example EafModule (routes, menus, permissions)
```

## Architecture

### Vue Plugin Bootstrap (`EAppFlowUIShell`)

Host apps call `app.use(EAppFlowUIShell, options)` which handles everything in one call:

1. Creates Pinia instance
2. Provides DI services (`AuthService`, `MenuService`, `ThemeService`, `AppConfig`) via `app.provide()`
3. Builds the router — public routes under `UnauthorizedLayout`, module routes nested under `AuthorizedLayout`
4. Registers navigation guards (auth initialization, login redirect, permission checks)
5. Registers modules (runs `install` hooks, merges menu items into the navigation store)
6. Installs the router

The host app never builds its own router or Pinia — see `apps/demo/src/main.ts` for the canonical usage pattern.

### Module System (`EafModule`)

Modules (e.g. Diagnostics) implement the `EafModule` interface (`packages/ui-shell/src/types/index.ts`) to contribute:

- **Routes** — Vue Router child routes with **relative paths** (no leading `/`), nested under `AuthorizedLayout`
- **Menu items** (`menuModules`) — grouped by module name, with permission-based visibility
- **Permissions** — declared permission strings for documentation/validation
- **Install hook** — optional `install(app)` for providing DI keys

Modules are created via factory functions (e.g. `createDiagnosticsModule(config)`). See `modules/diagnostics/src/index.ts` for the canonical shape.

To create a new module, follow `doc/new-eAppFlow-module.md`. Critical: `vite.config.ts` must externalize `/^primevue\/.*/` to avoid duplicate PrimeVue registrations.

### DI Pattern (Dependency Inversion)

Services follow the Dependency Inversion Principle:

- **Interfaces** + **InjectionKeys** defined in `packages/ui-shell/src/services/interfaces.ts` (`AuthService`, `MenuService`, `ThemeService`, `AppConfig`)
- **Default implementations** in `packages/ui-shell/src/services/` throw by default — host apps **must** provide concrete implementations at bootstrap
- **Stores and composables** inject services rather than importing them directly (see `useAuthStore` for the pattern: `inject(AUTH_SERVICE_KEY, undefined) ?? createDefaultAuthService()`)

### Auth Flow

1. App boots → `useAuthStore` checks `localStorage` for `access_token`
2. If found, calls `authService.getCurrentUser()` to hydrate the user
3. Login via `authService.login()` stores token, loads user
4. Logout clears token and user state
5. Route-level permissions checked via `meta.permissions` in navigation guards (OR logic — any matching permission grants access)

### Layout & Routing

- **Public routes** (`/login`, `/restore-password`, `/recover-password/:token?`) render under `UnauthorizedLayout` — centered card layout without sidebar
- **Protected routes** are children of `AuthorizedLayout` — sidebar + header + content area + footer
- **Navigation guards** handle: auth init wait, unauthenticated redirect, authenticated user redirected from login, permission-based access
- **Two sidebar implementations** exist: `AppLayout.vue` (legacy, uses `<slot>`) and `AuthorizedLayout.vue` (current, uses `<router-view>`) — `AuthorizedLayout.vue` is what the plugin defaults to

### Event Bus

A typed event bus (`packages/ui-shell/src/utils/eventBus.ts`) using `mitt` for shell events: `auth:login`, `auth:logout`, `navigation:changed`, `layout:theme-changed`, `layout:sidebar-toggled`.

## Commands

```bash
# Root (monorepo)
pnpm build                  # Build all packages (-r)
pnpm lint                   # ESLint across all packages (.vue, .ts)
pnpm type-check             # vue-tsc type checking across all packages (-r)
pnpm test                   # Vitest run (all packages, via root vitest.config.ts `test.projects`)
pnpm test:watch             # Vitest watch mode
pnpm test:coverage          # Vitest run with coverage (v8 provider)
pnpm test:e2e               # Playwright e2e tests (apps/demo)
pnpm format                 # Prettier on .vue, .ts, .json, .css, .md
pnpm dev                    # Start demo app dev server (@eappflow/demo)

# Per-package
pnpm --filter @eappflow/ui-shell build          # Build ui-shell package
pnpm --filter @eappflow/ui-shell test           # Run ui-shell tests
pnpm --filter @eappflow/ui-shell type-check     # Type-check ui-shell
pnpm --filter @eappflow/demo build              # Build demo app

# Publishing (via changesets — CI only, see .github/workflows/release.yml)
```

### Requirements

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0

### CI Pipeline

Two workflows run on PRs to `main` and pushes to `main`:

- `.github/workflows/ci.yml`: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm build` → `pnpm type-check` → `pnpm test`.
- `.github/workflows/playwright.yml`: installs Playwright browsers and runs `pnpm exec playwright test` in `apps/demo`, uploading the HTML report as an artifact.

### Testing

Unit/component tests use **Vitest with jsdom**. Test files live in `__tests__/` directories within each package:

```bash
pnpm --filter @eappflow/ui-shell exec vitest run                         # Run all ui-shell tests
pnpm --filter @eappflow/ui-shell exec vitest run packages/ui-shell/__tests__/constants.test.ts  # Single file
pnpm test:watch                                          # Watch mode
```

E2e tests use **Playwright** and live in `apps/demo/e2e/`, driving the demo app against its fake `AuthService` (`apps/demo/src/services/fakeAuthService.ts`):

```bash
pnpm --filter @eappflow/demo test:e2e                    # Run e2e suite (apps/demo)
pnpm test:e2e                                             # Same, from repo root (pnpm -r test:e2e)
```

### Linting & Formatting

- **ESLint** (flat config, `eslint.config.js`): Vue + TypeScript rules, `vue/multi-word-component-names: off`, `vue/component-tags-order: [script, template, style]`
- **Prettier**: `prettier --write \"**/*.{vue,ts,json,css,md}\"`
- **Husky pre-commit** hook runs `lint-staged` (ESLint + Prettier on staged `.vue` and `.ts` files)

### Permissions Model

- `Permission` is an opaque string, defined by the host application
- Empty permissions array `[]` on a menu item → visible to any authenticated user
- Non-empty permissions → visible if user has **at least one** (OR logic)
- Route-level permissions in `meta.permissions` work the same way via navigation guards

### Key Files

| File                                                    | Purpose                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `packages/ui-shell/src/plugin.ts`                       | Plugin bootstrap (entry point for host apps)                    |
| `packages/ui-shell/src/types/index.ts`                  | All TypeScript types (`EafModule`, `EafMenuItem`, `User`, etc.) |
| `packages/ui-shell/src/services/interfaces.ts`          | DI interfaces + injection keys                                  |
| `packages/ui-shell/src/plugins/registry.ts`             | Module registration logic                                       |
| `packages/ui-shell/src/router/navigationGuards.ts`      | Auth/permission route guards                                    |
| `packages/ui-shell/src/router/buildModuleRoutes.ts`     | Route tree construction                                         |
| `packages/ui-shell/src/stores/useAuthStore.ts`          | Auth state management                                           |
| `packages/ui-shell/src/stores/useEafNavigationStore.ts` | Navigation/menu state                                           |
| `packages/ui-shell/src/stores/useLayoutStore.ts`        | Theme/sidebar state                                             |
| `packages/ui-shell/src/utils/permissions.ts`            | Permission filtering utilities                                  |
| `doc/new-eAppFlow-module.md`                            | Guide for creating new modules                                  |
