# Getting Started

::: warning Under heavy development
UI Shell is changing fast, and anything may change in any release: the API,
the packages, these docs. Pin exact versions and read the
[changelog](https://github.com/eappflow/ui-shell/blob/main/packages/ui-shell/CHANGELOG.md)
before you update.
:::

UI Shell is a Vue plugin. Your app passes it its modules and services, and the
shell sets up Pinia, the router, i18n, the auth flow and the layout (sidebar,
header, footer).

## Try the demo

```bash
pnpm install
pnpm dev
```

The demo runs on `http://localhost:5173` with a fake auth service, so any login
and password work.

## Install

```bash
pnpm add @eappflow/ui-shell vue primevue @primeuix/themes primeicons
pnpm add -D tailwindcss @tailwindcss/vite tailwindcss-primeui
```

These are the packages your app imports itself (in `main.ts` and
`main.css`). The shell's other peer dependencies (`vue-router`, `vue-i18n`,
`pinia`, `zod`, `@eappflow/ui-shell-components`) are installed for you by
pnpm and npm. Add one to your `package.json` only when your own code imports
it.

Add `tailwindcss()` from `@tailwindcss/vite` to the `plugins` in your
`vite.config.ts`.

## Styles

```css
/* src/assets/main.css */
@import "tailwindcss";
@import "tailwindcss-primeui";
@import "primeicons/primeicons.css";
@custom-variant dark (&:is(.dark, .dark *));

@import "@eappflow/ui-shell/style";
```

## Bootstrap

```ts
// src/main.ts
import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { EAppFlowUIShell } from "@eappflow/ui-shell";

import App from "./App.vue";
import { authService } from "./services/authService";

const app = createApp(App);

app.use(PrimeVue, {
  theme: { preset: Aura, options: { darkModeSelector: ".dark" } },
});

app.use(EAppFlowUIShell, {
  modules: [],
  appConfig: { name: "MyApp", version: "1.0.0" },
  services: { authService },
});

app.mount("#app");
```

```vue
<!-- src/App.vue -->
<template>
  <router-view />
</template>
```

Do not create your own router or Pinia. The plugin does that.

## Auth service

The shell does not talk to your backend. You give it an `AuthService` (login,
logout, current user, password reset). The demo's
[fake service](https://github.com/eappflow/ui-shell/blob/main/apps/demo/src/services/fakeAuthService.ts)
is a good starting point.

Two transports are supported, picked by `AuthService.mode`:

- **`"token"` (default)** — `login()` resolves with `{ accessToken }`. The shell
  keeps it in `localStorage`; your HTTP client sends it as a header.
- **`"session"`** — the backend keeps the session itself (e.g. an HttpOnly
  cookie) and `login()` resolves with nothing. The shell never sees a token: on
  boot it asks `getCurrentUser()` whether a session exists. Configure your HTTP
  client to send the cookie (`withCredentials: true`, or same-origin).

In session mode `useAuthStore().accessToken` stays `null` and `isAuthenticated`
is driven by the loaded user, so don't read the token in interceptors.

## Next steps

- [Modules](../core-concepts/modules.md): add routes, menu items and permissions.
- [Forms](../core-concepts/forms.md) and [AI Assistant](../core-concepts/ai-assistant.md).
- See [`apps/demo/src/main.ts`](https://github.com/eappflow/ui-shell/blob/main/apps/demo/src/main.ts)
  for a full setup with i18n, Microsoft SSO and the AI chat.
