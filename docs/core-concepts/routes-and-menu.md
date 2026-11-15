# Routes and Menu

A module brings its pages (`routes`) and the menu items that lead to them
(`menuModules`). Both can be limited to users with some permissions.

## Routes

`routes` are Vue Router routes:

```ts
routes: [
  {
    path: "orders",
    name: "orders",
    component: () => import("./views/OrdersView.vue"),
    meta: { permissions: ["Orders"] },
  },
  {
    path: "orders/:id",
    name: "order",
    component: () => import("./views/OrderView.vue"),
    meta: { permissions: ["Orders"] },
  },
],
```

- Paths are **relative**, without a leading `/`. The shell nests them under its
  layout (sidebar, header), so `path: "orders"` opens at `/orders`.
- Load views lazily with `() => import(...)`, so each module's code loads only
  when it is needed.
- Only logged-in users get to these pages. The login and password pages are
  the shell's own.

## Menu

`menuModules` are groups in the sidebar, each with its items:

```ts
menuModules: [
  {
    name: "Sales",
    icon: "pi pi-briefcase",
    items: [
      {
        name: "Orders",
        icon: "pi pi-shopping-cart",
        path: "/orders",
        permissions: ["Orders"],
      },
    ],
  },
],
```

- Menu paths are **absolute** (`/orders`), as they are links.
- Icons are CSS classes, e.g. [PrimeIcons](https://primevue.org/icons) (`pi pi-...`).
- Groups with the same `name` become one group, even from different modules.
  The groups come in the order of the modules.
- Users fold a group with a click on its name. The shell remembers it per
  browser.
- The browser tab's title is the page's group and name, e.g. `Sales | Orders`,
  translated. A page off the menu has the app's name (`appConfig.name`).
- A page sets its own title with `usePageTitle`. Give it a getter or a ref, so
  the title follows the language and the data:

  ```ts
  import { usePageTitle } from "@eappflow/ui-shell";

  usePageTitle(() => t("order_title", { number: order.value?.number }));
  ```

  Don't set `document.title` yourself: the shell sets it again when the
  language or the menu changes.

## Permissions

A permission is a string your app defines, e.g. `"Orders"`. The shell gets the
user's permissions from `AuthService.getCurrentUser()`.

- An empty `permissions` array (`[]`) shows the menu item to every logged-in
  user.
- Otherwise the user needs **at least one** of the listed permissions.
- `meta.permissions` on a route works the same way. A user without them can't
  open the page, even by typing its address.

## Menu labels

To translate the menu, give groups and items a `nameKey`, and the module its
`menuI18nMessages`:

```ts
menuI18nMessages: {
  en: { group: "Sales", orders: "Orders" },
  pl: { group: "Sprzedaż", orders: "Zamówienia" },
},
menuModules: [
  {
    name: "Sales",
    nameKey: "group",
    // ...
    items: [{ name: "Orders", nameKey: "orders" /* ... */ }],
  },
],
```

The keys are short and local to the module: the shell turns `orders` into
`menu.<moduleId>.orders`, so keys of different modules never clash. If a key
has no translation, the menu shows `name`.

In practice the messages come from the module's locale files, see
[Translations](./translations.md).

## Items loaded at run time

Items that depend on the user's data, e.g. their own dashboards, come from a
menu source. It names a group of `menuModules` and loads the items:

```ts
import type { EafMenuSource } from "@eappflow/ui-shell";

export const dashboardsMenuSource: EafMenuSource = {
  group: "Dashboards",
  permissions: ["Dashboard"],
  load: async () =>
    (await api.getMyDashboards()).map((dashboard) => ({
      name: dashboard.name,
      icon: "pi pi-chart-bar",
      path: `/dashboards/${dashboard.id}`,
    })),
};

// The module
menuSources: [dashboardsMenuSource],
```

- The shell loads the items when a user signs in and drops them when they
  sign out, so one user's items never show to the next.
- Without any of the source's `permissions` the user gets no items, and
  `load` isn't called.
- The items come after the group's own. Data shows as it is, in `name`. A
  `nameKey` is translated like the module's other items, e.g. a "New dashboard"
  item after the dashboards.
- After a change to the data, load them again:

  ```ts
  await useEafNavigation().reloadMenuSource(dashboardsMenuSource);
  ```

  The menu keeps the old items until the new ones arrive. A failed load keeps
  them too.

The items are part of `useEafNavigation().menuModules`, so they are in the
browser tab's title and the AI chat can open them too.

## Pinned pages

Users can pin menu pages with the pin button shown next to them on hover.
Pinned pages show in a "Pinned" group at the top of the menu. A pin to a page
the user can no longer see stays hidden.

A page that is gone for good, e.g. a deleted record's, is the module's to
unpin:

```ts
import { usePinnedPages } from "@eappflow/ui-shell";

usePinnedPages().unpin(`/dashboards/${id}`);
```

The pins are kept with the user's other preferences, see
[User preferences](../guide/getting-started.md#user-preferences).
