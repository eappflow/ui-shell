# @eappflow/ui-shell

## 1.0.0

### Minor Changes

- 24db455: `supportedLanguages` uses `displayName` shown as-is instead of translated `displayNameKey`.
- 24db455: Logo is now a Vue component, set per area: `authorized.logo` / `unauthorized.logo`.
- 5a3bb93: - Sidebar collapses to an icon rail with captions, state persisted.
  - Primary color is driven through PrimeVue preset palettes.
  - Externalize `@primeuix` so theme updates reach the host.

### Patch Changes

- 5a3bb93: **BREAKING:** `EafFormItem` drops the `form` prop - pass a field from `$f.fields` instead: `for="email" :form="$f"` → `:field="$f.fields.email"`. A typo in it is a type error. A field's state lives on the field: `$f.fields.email.$error` / `$errors` / `$required` / `$setError(msg)` / `$clearError()` replace the form's `getFieldError`, `getAllFieldErrors`, `hasFieldError`, `isFieldRequired`, `setFieldError` and `clearFieldError` (for a path known only at runtime use `$f.fieldErrors`). `showAllErrors` is gone - `EafFormItem` shows the field's first error. Rule keys get a `$` too, so they never clash with data fields: `required`/`length`/`pattern`/`range` → `$required`/`$length`/`$pattern`/`$range` (a field named `required` or `length` can now have rules at any depth). Breaking in 0.x, hence a minor bump.

  `useEafForm` supports nested data (`{ address: { street: string } }`):

  - **`$f.fields`** mirrors the data with LSP completion at every level, array indexes included: `:field="$f.fields.users[2].email"` (`EafFields<T>`, `EafField`). `data-testid` and the label's `for` are the path (`"users[2].email"`), the error - now a PrimeVue `Message` (`severity="error" size="small" variant="simple"`) instead of a red `<small>` - is under `${path}-error`; the slot gets the path as `id` for the input (`v-slot="{ id }"` → `:id="id"`, replacing the slot's `field`) and `EafFormItem` no longer sets `name` on it; while there's an error, PrimeVue inputs anywhere inside turn invalid - wrapped ones too, e.g. in an `IconField`, and `Password`, `DatePicker`, `InputNumber` - through an injected `$pcFormField`, as under PrimeVue Forms' `FormField`; no `p-invalid` class is added by `EafFormItem` any more.
  - **Nested rules** (`EafRules<T>`) mirror the data: `address: { $required: true, street: { $required: true } }`. Array items get rules through `$each`: `addresses: { $each: { street: { $required: true } } }` (errors under `addresses[0].street`, like the API's), `tags: { $each: { $length: {...} } }`. On an array `$length` counts its items: `addresses: { $length: { minLength: 1, message } }`. `$pattern` skips an empty value - requiring one is `$required`'s job. A `null`/`undefined` sub-object only checks its own `$required`; its children are skipped.
  - **Errors keyed by field path** (`address.street`, `items[0].name` - the API's format), from `validate()` and from API errors. Errors on paths not in the data go to the summary.
  - **Rules are checked when a value changes**, field by field: changing a field sets or clears its errors (an API error on it too); untouched fields wait for `validate()`/`submit()`. Watchers follow the data, so added array items and sub-objects set later are covered; a removed item's errors are cleared. Data restored by `resetForm()` isn't validated. Turn it off with `useEafForm({ ..., validateOnChange: false })`.
  - **`resetForm()` restores nested data** from a deep copy taken at creation; `resetForm(data)` puts the given data in instead (e.g. a loaded record), clearing errors without validating it.
  - New types: `EafField`, `EafFields`, `EafRules`.

  The `primevue` peer range is now `^4.2.0` (still below 5): the error `Message` uses `size`/`variant`, added in 4.2.0.

  The login and password views use `$f.fields` and take `$required` from their rules.

- Updated dependencies [5a3bb93]
  - @eappflow/ui-shell-components@0.2.0

## 0.1.1

### Patch Changes

- fe796a8: Fix stale validation banner (e.g. a failed Microsoft account link/login) staying visible after a subsequent successful login.
- 3f023cf: Fix dark mode: the toggle now actually applies the dark theme (was silently disabled), the shell chrome, diagnostics panels, and Welcome page follow it correctly, and redundant PrimeVue Menu borders are removed.

  Refine the account menu: it drops the nested PrimeVue Menu in favour of standalone `ThemeColorPicker` (color dots) and `LanguageSelect` components, with a transparent menu background and primary-coloured active item. The unauthorized (login) layout gains a language selector and a dark-mode-aware login card, and the sidebar/menu styles move from custom CSS to Tailwind utilities.

- 97e1329: Export a named `ScopedI18nComposer` type for `createScopedI18n`'s return value, fixing a TypeScript error some consumers hit when re-exporting it.
- f4ba5f8: `required: true` in `useEafForm` now falls back to a translated message (`validation.required`), overridable via `i18nConfig.messages`.
- 325838a: Login and Microsoft SSO errors are now shown through a shared validation banner instead of being scattered across individual forms.
- Updated dependencies [3f023cf]
- Updated dependencies [f4ba5f8]
- Updated dependencies [325838a]
  - @eappflow/ui-shell-components@0.1.1
