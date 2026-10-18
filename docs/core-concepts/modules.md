# Modules

A module is one part of your app, e.g. orders or users. It adds its pages, menu
items, permissions and AI tools to the shell. The shell puts the modules
together: one router, one menu, one login.

## Defining a module

A module is a function that returns an `EafModule`:

```ts
// src/index.ts
import type { EafModule } from "@eappflow/ui-shell";
import { menu as enMenu } from "./locales/en.json";
import { menu as plMenu } from "./locales/pl.json";

export function createOrdersModule(): EafModule {
  return {
    id: "orders",
    name: "Orders",
    version: "0.1.0",
    permissions: ["Orders"],

    routes: [
      {
        path: "orders",
        name: "orders",
        component: () => import("./views/OrdersView.vue"),
        meta: { permissions: ["Orders"] },
      },
    ],

    menuI18nMessages: { en: enMenu, pl: plMenu },

    menuModules: [
      {
        name: "Sales",
        nameKey: "group",
        icon: "pi pi-briefcase",
        items: [
          {
            name: "Orders",
            nameKey: "orders",
            icon: "pi pi-shopping-cart",
            path: "/orders",
            permissions: ["Orders"],
          },
        ],
      },
    ],
  };
}
```

[Routes and Menu](./routes-and-menu.md) explains `routes`, `menuModules` and
the permissions. [Translations](./translations.md) covers the locale files.

## Registering it

Pass the modules to the plugin. Their order is the order of the menu groups:

```ts
// main.ts
import { createOrdersModule } from "@my-app/orders";

app.use(EAppFlowUIShell, {
  modules: [createOrdersModule()],
  // ...
});
```

## What a module can add

| Field              | What it is                                                                            |
| ------------------ | ------------------------------------------------------------------------------------- |
| `id`, `name`       | The module's id (used in its menu keys) and name                                      |
| `routes`           | Its pages, see [Routes and Menu](./routes-and-menu.md#routes)                         |
| `menuModules`      | Its menu groups and items, see [Routes and Menu](./routes-and-menu.md#menu)           |
| `menuI18nMessages` | Translations of its menu labels, see [Menu labels](./routes-and-menu.md#menu-labels)  |
| `permissions`      | The permissions it uses, for reference                                                |
| `aiTools`          | Tools for the AI chat, see [AI Assistant](./ai-assistant.md#a-tool-for-the-whole-app) |
| `install(app)`     | Runs once at startup, e.g. to provide a service                                       |

## Config and the install hook

If the host must configure the module, take a config object in the factory
and provide it in `install`. The module's components get it with `inject`:

```ts
import type { InjectionKey } from "vue";

export interface OrdersConfig {
  registerInMenu?: boolean;
}

export const ORDERS_CONFIG_KEY: InjectionKey<OrdersConfig> =
  Symbol("ordersConfig");

export function createOrdersModule(config?: OrdersConfig): EafModule {
  return {
    // ...
    install(app) {
      app.provide(ORDERS_CONFIG_KEY, config ?? {});
    },
  };
}
```

## As a package

A module usually lives in its own workspace package, e.g. `modules/orders`.
[Creating a Module Package](../guide/module-package.md) shows how to set one
up.
