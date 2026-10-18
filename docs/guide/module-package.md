# Creating a Module Package

A [module](../core-concepts/modules.md) usually lives in its own workspace
package. The package ships its source: the host app imports `src/index.ts`
directly and the host's Vite compiles it, so the package needs no build step.

The `diagnostics` module (`modules/diagnostics/`) is a working example. It is
published to npm, so it also has a library build (see
[Publishing to npm](#publishing-to-npm)).

## Structure

```
modules/orders/
├── src/
│   ├── composables/
│   │   └── i18n.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── pl.json
│   ├── style/
│   │   └── index.css
│   ├── views/
│   │   └── OrdersView.vue
│   ├── env.d.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

- `src/index.ts`: the module, see [Modules](../core-concepts/modules.md).
- `src/locales`, `src/composables/i18n.ts`: its texts, see
  [Translations](../core-concepts/translations.md).

The host's `pnpm-workspace.yaml` must include the folder (e.g. `modules/*`).

## Package files

### `package.json`

```json
{
  "name": "@my-app/orders",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./style": "./src/style/index.css"
  },
  "scripts": {
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "@eappflow/ui-shell": "workspace:*",
    "vue": "^3.5.0 || ^4.0.0",
    "vue-router": "^4.5.0 || ^5.1.0"
  },
  "devDependencies": {
    "@eappflow/ui-shell": "workspace:*",
    "primevue": "^4.5.5",
    "typescript": "~6.0.3",
    "vue": "^3.5.38",
    "vue-router": "^5.1.0",
    "vue-tsc": "^3.3.5"
  }
}
```

- `exports` points at the source, so the host needs no aliases.
- The shell, Vue and Vue Router are peer dependencies: the module must use
  the host's copy, not its own.
- `workspace:*` works when the shell is in the same workspace. If the host
  installs the shell from npm, use a version range.

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*.ts", "src/**/*.vue", "src/**/*.json"]
}
```

The base config must have `"resolveJsonModule": true`, as the locale files are
imported as JSON.

### `src/env.d.ts`

```ts
/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
```

## Styles

```css
/* src/style/index.css */
/* For the host's Tailwind build, next to @eappflow/ui-shell/style */
@source "../";
```

The module ships no compiled CSS. `@source` tells the host's Tailwind to scan
the module's files, so all utility classes come from one build. Do not import
`tailwindcss`, `tailwindcss-primeui` or `primeicons` here: the host imports
them once.

## Adding it to the host

Add the package to the host's `package.json` and run `pnpm install`:

```json
"dependencies": {
  "@my-app/orders": "workspace:*"
}
```

Import its styles in the host's `main.css`, after Tailwind and the shell:

```css
@import "tailwindcss";
@import "tailwindcss-primeui";
@import "primeicons/primeicons.css";
@custom-variant dark (&:is(.dark, .dark *));

@import "@eappflow/ui-shell/style";
@import "@my-app/orders/style";
```

Then [register the module](../core-concepts/modules.md#registering-it) in
`main.ts`.

## Publishing to npm

A module installed from npm must ship compiled JavaScript, so it needs a Vite
library build. Copy the setup from `modules/diagnostics`: `vite.config.ts`,
the `dist` entries in `package.json` `exports`, and
`@source "../../dist/**/*.js"` in the stylesheet.

::: warning
In the library build, `external` **must** include `/^primevue\/.*/`.
Otherwise PrimeVue is bundled into the module, and its components get
registered twice and lose their styles.
:::

## Troubleshooting

### Route not found

Check that the route paths in `routes` do not start with `/`.

### Styles not applied

- The host's `main.css` imports `@my-app/orders/style` after
  `tailwindcss` and `tailwindcss-primeui`.
- `@source` in the module's stylesheet points at the module's files.

### PrimeVue components missing styles or registered twice

The module bundles its own PrimeVue: see [Publishing to npm](#publishing-to-npm).
