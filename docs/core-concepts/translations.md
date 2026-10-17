# Translations

The shell uses [vue-i18n](https://vue-i18n.intlify.dev). The user picks the
language in the account menu or on the login page.

## The app's languages

You choose the languages in the plugin's `i18nConfig`, along with the app's
own messages:

```ts
import en from "./locales/en.json";
import pl from "./locales/pl.json";
import de from "./locales/de.json";

app.use(EAppFlowUIShell, {
  // ...
  i18nConfig: {
    defaultLanguage: "en",
    supportedLanguages: [
      { localeCode: "en", displayName: "English" },
      { localeCode: "pl", displayName: "Polski" },
      { localeCode: "de", displayName: "Deutsch" },
    ],
    messages: { en, pl, de },
  },
});
```

- Without `i18nConfig`, the app has English and Polish, English first.
- The app starts in the language the user picked last time, else the
  browser's language if it is supported, else `defaultLanguage`.
- `messages` are merged into the shell's own, key by key, so you can also
  change a text of the shell, e.g. `validation.required`.

The shell's own texts (login, menus, forms) come in English and Polish. For
another language, translate them in that language's `messages`.

## A module's texts

`createScopedI18n` gives the module a `t()` of its own, which follows the
language the user picked:

```ts
// src/composables/i18n.ts
import { createScopedI18n } from "@eappflow/ui-shell";
import en from "../locales/en.json";
import pl from "../locales/pl.json";

export const useScopedI18n = createScopedI18n({ en, pl });
```

### English and Polish in one place

With `t(key, english, polish)` you write both languages right where the text
is used, with no locale file to open:

```vue
<!-- src/views/OrdersView.vue -->
<script setup lang="ts">
import { useScopedI18n } from "../composables/i18n";

const { t } = useScopedI18n();
</script>

<template>
  <h1>{{ t("title", "Orders", "Zamówienia") }}</h1>
  <p>{{ t("empty", "No orders yet", "Nie ma jeszcze zamówień") }}</p>
  <p>
    {{ t("count", "{count} orders", "{count} zamówień", { count: 3 }) }}
  </p>
</template>
```

- The key, the English and the Polish text sit in one line, next to the
  markup that shows them.
- If a locale file has the key, its text wins over the inline one.
- It works for English and Polish. Another language needs the key in its
  locale file.

The shell's own screens are written this way.

### Locale files

Texts used in many places, or in more languages, go into the module's
locale files. The `menu` key holds the
[menu labels](./routes-and-menu.md#menu-labels):

```json
// src/locales/en.json
{
  "menu": {
    "group": "Sales",
    "orders": "Orders"
  },
  "status": {
    "paid": "Paid",
    "shipped": "Shipped"
  }
}
```

Then `t()` takes just the key: `t("status.paid")`.

## Missing keys

[i18n Key Extraction](../guide/i18n-key-extraction.md) finds the keys used in
`t()` that the locale files lack.

::: warning
`--add` writes the missing keys with an empty text (`""`). A key in the file
wins over its inline texts, so fill in the texts of those keys right away, or
copy the inline ones there.
:::
