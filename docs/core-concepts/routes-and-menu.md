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
