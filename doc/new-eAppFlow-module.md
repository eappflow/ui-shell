# How to Create a New eAppFlow Module

This guide describes the steps required to create a new **eAppFlow Module** in the `ui-shell` monorepo.  
The existing `diagnostics` module at `modules/diagnostics/` serves as the reference.

---

## Overview

An eAppFlow Module is a **separate npm package** living under `modules/` that contributes:

- **Vue Router routes** (nested under the authorized layout)
- **Menu items** (shown in the sidebar)
- **Permissions** (role-based access control)
- **An install hook** (for providing DI keys, registering components, etc.)

The module is registered into the shell via the `EAppFlowUIShell` Vue plugin at app bootstrap.

---

## 1. Scaffold the Module Directory

Create a new folder under `modules/`. For this guide we'll use `<module-name>` as a placeholder.

```
modules/<module-name>/
├── src/
│   ├── views/
│   │   └── YourView.vue
│   ├── style/
│   │   └── index.css
│   ├── types.ts
│   ├── index.ts
│   └── env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
```

---

## 2. `package.json`

```json
{
  "name": "@eappflow/<module-name>",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style": {
      "import": "./dist/style.css",
      "require": "./dist/style.css"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && vue-tsc --declaration --emitDeclarationOnly",
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "@eappflow/ui-shell": "workspace:*",
    "vue": "^3.5.0",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@eappflow/ui-shell": "workspace:*",
    "@tailwindcss/vite": "^4.3.1",
    "@vitejs/plugin-vue": "^5.2.0",
    "primevue": "^4.0.0",
    "tailwindcss": "^4.3.1",
    "tailwindcss-primeui": "^0.6.1",
    "typescript": "~5.7.0",
    "vite": "^6.1.0",
    "vue": "^3.5.0",
    "vue-router": "^4.5.0",
    "vue-tsc": "^2.2.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

> **Notes:**
>
> - `"private": false` allows publishing to npm if needed.
> - `peerDependencies` ensure the host app provides Vue, Vue Router, and the UI Shell.
> - The `exports` map exposes two entry points: the module code (`"."`) and styles (`"./style"`).

---

## 3. `vite.config.ts`

```ts
import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        style: resolve(__dirname, "src/style/index.css"),
      },
      name: "Eappflow<ModuleName>",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue", "vue-router", "@eappflow/ui-shell", /^primevue\/.*/],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
        },
      },
    },
  },
});
```

> ⚠️ **Critical:** The `external` array **must** include `/^primevue\/.*/` (a regex).  
> Without it, PrimeVue components used in the module's views will be bundled, causing duplicate registrations and style conflicts at runtime.

---

## 4. `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": false,
    "sourceMap": true,
    "noEmit": false
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

If your module depends on `@eappflow/ui-shell-components` and needs to resolve its `@/` alias, add `paths`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": false,
    "sourceMap": true,
    "noEmit": false,
    "paths": {
      "@/*": ["../../packages/ui-shell-components/src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

---

## 5. `src/env.d.ts`

```ts
/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
```

---

## 6. `src/types.ts` — Module Configuration Type

Define a configuration interface and an injection key for the module:

```ts
import type { InjectionKey } from "vue";

export interface <ModuleName>Config {
  /** Whether to register the module in the menu */
  registerInMenu?: boolean;
  // Add other configuration options here
}

/** Injection key for <module-name> module config */
export const <MODULE_NAME>_CONFIG_KEY: InjectionKey<<ModuleName>Config> =
  Symbol("<moduleName>Config");
```

---

## 7. `src/style/index.css` — Module Styles

```css
/* Tailwind CSS base styles */
@import "tailwindcss";

/* PrimeVue styles */
@import "primeicons/primeicons.css";

@source "../components";
@source "../views";
@import "tailwindcss-primeui";
```

> `@import "tailwindcss-primeui"` enables the PrimeVue TailwindCSS plugin (required for compatibility).
> `@source` directives tell Tailwind to scan the module's views/components for class usage.

---

## 8. `src/index.ts` — Module Factory Function

This is the core of the module. Export a **factory function** that creates an `EafModule` object:

```ts
/**
 * <ModuleName> Module — @eappflow/<module-name>
 *
 * Provides <module-name> routes, menu items, and permissions
 * for the eAppFlow UI Shell.
 */

import { EafModule } from "@eappflow/ui-shell";
import type { <ModuleName>Config } from "./types";
import { <MODULE_NAME>_CONFIG_KEY } from "./types";
import { menu as enMenu } from "./locales/en.json";
import { menu as plMenu } from "./locales/pl.json";

/**
 * Creates the <ModuleName> module instance.
 *
 * @param config - Optional module configuration
 */
export function create<ModuleName>Module(config?: <ModuleName>Config): EafModule {
  return {
    id: "<module-id>",
    name: "<ModuleName>",
    version: "0.1.0",
    permissions: ["<Permission1>", "<Permission2>"],

    routes: [
      {
        path: "<module-id>/view1",
        name: "<route-name>",
        component: () => import("./views/YourView.vue"),
        meta: { permissions: ["<RequiredPermission>"] },
      },
      // Add more routes as needed
    ],

    // Translations for menuModules' `nameKey`s below (see "Translating
    // Menu Items & Menu Groups") — short, local keys, scoped to this module.
    menuI18nMessages: {
      en: enMenu,
      pl: plMenu,
    },

    menuModules: [
      {
        name: "<MenuGroupName>", // fallback label
        nameKey: "group",
        icon: "pi pi-<icon>",
        items: [
          {
            name: "<DisplayName>", // fallback label
            nameKey: "<displayName>",
            icon: "pi pi-<icon>",
            path: "/<module-id>/view1",
            permissions: ["<RequiredPermission>"],
          },
        ],
      },
    ],

    install(app) {
      // Provide module config to downstream consumers
      app.provide(<MODULE_NAME>_CONFIG_KEY, config ?? {});
    },
  };
}
```

### The `EafModule` Interface (from `@eappflow/ui-shell`)

```ts
export interface EafModule {
  /** Unique module identifier (e.g. "diagnostics") */
  id: string;
  /** Human-readable module name */
  name: string;
  /** Module version */
  version?: string;
  /** Vue Router routes contributed by this module */
  routes?: RouteRecordRaw[];
  /** Menu modules contributed by this module */
  menuModules?: EafMenuModule[];
  /** Translation messages backing menuModules' `nameKey`s, per locale */
  menuI18nMessages?: I18nOptions["messages"];
  /** Permissions declared by this module */
  permissions?: Permission[];
  /** Optional install hook called when the module is registered */
  install?(app: App, config?: unknown): void | Promise<void>;
}
```

### Route Path Convention

Module routes use **relative paths** (without a leading `/`). They are nested as children under the `AuthorizedLayout` route, so a route with `path: "diagnostics/welcome"` becomes available at `/diagnostics/welcome` in the browser.

### Menu Item Permissions Logic

- **Empty permissions array (`[]`)** → the menu item is **always visible** to any authenticated user.
- **Permissions listed** → the item is visible only if the user has **at least one** of the listed permissions (OR logic).

### Translating Menu Items & Menu Groups

Both menu items (`EafMenuItem.nameKey`) and menu groups
(`EafMenuModule.nameKey`) can carry an optional translation key. They are
resolved by `AppMainMenu` through the shell's **global** i18n instance,
falling back to the plain `name` if the key isn't set or has no
translation for the active locale.

`nameKey` on menu items/groups is a **short, local key** - just the leaf
name, scoped to your own module. The module ships its own translations
for these keys via `menuI18nMessages`, and the
shell namespaces and merges them automatically; you never repeat your
module id inside every key:

```ts
// src/index.ts
import { menu as enMenu } from "./locales/en.json";
import { menu as plMenu } from "./locales/pl.json";

export function createDiagnosticsModule(config?: DiagnosticsConfig): EafModule {
  return {
    id: "diagnostics",
    // ...
    menuI18nMessages: {
      en: enMenu,
      pl: plMenu,
    },
    menuModules: [
      {
        name: "eAppFlow", // fallback label
        nameKey: "group",
        icon: "pi pi-cog",
        items: [
          {
            name: "Welcome", // fallback label
            nameKey: "welcome",
            icon: "pi pi-users",
            path: "/diagnostics/welcome",
            permissions: [],
          },
        ],
      },
    ],
  };
}
```

```json
// src/locales/en.json
{
  "menu": {
    "group": "eAppFlow",
    "welcome": "Welcome"
  }
}
```

At registration time, `configureModules()` rewrites every `nameKey` to
`menu.<moduleId>.<yourKey>` (e.g. `menu.diagnostics.welcome`), and
`createEafI18n()` merges each module's `menuI18nMessages` into the global
instance under that same `menu.<moduleId>` namespace. This guarantees keys
from different modules never collide, without any module needing to know
about - or repeat - its own id inside every translation key.

---

## 9. Create View Components

Place your Vue views in `src/views/`. You can use PrimeVue components and TailwindCSS classes freely.

```vue
<script setup lang="ts">
import Card from "primevue/card";
</script>

<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <i class="pi pi-<icon> text-2xl text-primary"></i>
          <span class="text-xl font-semibold">Your View</span>
        </div>
      </template>
      <template #content>
        <p class="text-muted-color">Content goes here.</p>
      </template>
    </Card>
  </div>
</template>
```

---

## 10. Register the Module in the Host App

In the host app (e.g. `apps/demo/src/main.ts`), import the module factory and pass it to the `EAppFlowUIShell` plugin:

```ts
import { EAppFlowUIShell } from "@eappflow/ui-shell";
import { create<ModuleName>Module } from "@eappflow/<module-name>";

const <moduleName>Module = create<ModuleName>Module({
  registerInMenu: true,
});

app.use(EAppFlowUIShell, {
  modules: [<moduleName>Module /* , otherModules */],
  appConfig: { name: "MyApp", version: "1.0.0" },
  // ...
});
```

---

## 11. Import Module Styles in the Host App

In the host's main CSS file (e.g. `apps/demo/src/assets/main.css`), import the module's styles:

```css
@import "tailwindcss";
@import "@eappflow/<module-name>/style";
@import "tailwindcss-primeui";
@import "primeicons/primeicons.css";
```

---

## 12. Configure Source Aliases in the Demo App

If the host app resolves modules to source (for HMR during development), add an alias in both:

### `apps/demo/vite.config.ts`

```ts
resolve: {
  alias: {
    "@eappflow/<module-name>": resolve(__dirname, "../../modules/<module-name>/src"),
    // ... existing aliases
  },
},
```

### `apps/demo/tsconfig.json`

```json
"paths": {
  "@eappflow/<module-name>": ["../../modules/<module-name>/src"],
  // ... existing paths
}
```

---

## 13. Install Dependencies & Build

```bash
# Install dependencies from the monorepo root
pnpm install

# Build all packages
pnpm build

# Or build only the new module
pnpm --filter @eappflow/<module-name> build
```

---

## Summary Checklist

| Step | File / Action                           | Purpose                                                       |
| ---- | --------------------------------------- | ------------------------------------------------------------- |
| 1    | `modules/<module-name>/`                | Create directory structure                                    |
| 2    | `package.json`                          | Define package metadata & dependencies                        |
| 3    | `vite.config.ts`                        | Configure Vite library build with PrimeVue externalization    |
| 4    | `tsconfig.json`                         | TypeScript configuration extending base                       |
| 5    | `src/env.d.ts`                          | Vite + Vue SFC type declarations                              |
| 6    | `src/types.ts`                          | Module config interface & injection key                       |
| 7    | `src/style/index.css`                   | TailwindCSS + PrimeVue styles with `tailwindcss-primeui`      |
| 8    | `src/index.ts`                          | Module factory function (routes, menus, permissions, install) |
| 9    | `src/views/*.vue`                       | View components                                               |
| 10   | Host `main.ts`                          | Import & register module via plugin options                   |
| 11   | Host `main.css`                         | Import module styles                                          |
| 12   | Host `vite.config.ts` + `tsconfig.json` | Source aliases for HMR                                        |

---

## Troubleshooting

### PrimeVue Components Not Rendering / Duplicate Registration

Ensure `/^primevue\/.*/` is in `vite.config.ts` → `build.rollupOptions.external`. Without it, PrimeVue components from the module bundle conflict with the host app's PrimeVue instance.

### Styles Not Applied

Make sure:

- `@import "tailwindcss-primeui"` is in the module's `src/style/index.css`
- The host app imports `@eappflow/<module-name>/style` in its CSS
- The host app also imports `tailwindcss-primeui` in its own CSS

### Module Routes Not Found

Module routes use **relative paths** (no leading `/`). Verify the route paths in the `routes` array do not start with `/`.

### Type Errors in Views

If your module uses components from `@eappflow/ui-shell-components` with `@/` imports, add the `paths` configuration to `tsconfig.json` (see Step 4).

### Build Fails with `vue-tsc` Declaration Errors

Ensure that all dependencies listed as `devDependencies` (Vue, Vue Router, PrimeVue, etc.) are installed — they are needed for type checking even if they are `peerDependencies`.
