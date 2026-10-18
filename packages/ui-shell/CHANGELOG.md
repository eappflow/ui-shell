# @eappflow/ui-shell

## 1.0.0

### Minor Changes

- aef870e: AI chat: provide an `AiChatService` under `AI_CHAT_SERVICE_KEY` for the chat panel, `EafAiChatView` gives it a full page. Its tools fill the forms on screen (`exposeToAi`), open app pages, and run what screens (`useEafAiTool`) and modules (`aiTools`) add, with zod arguments. `canChangeModel` with `getModels()` adds a model picker.
- aef870e: **BREAKING:** `useEafForm` validates with a zod `schema` (zod 4 peer dependency) instead of `rules`, and takes its type from it. `data` → `defaultValues`, `$f.submit(handler)` → `onSubmit` in the config and `$f.submit()`, `validateOnChange` → `validateOn` (`"blur"` by default). Breaking in 0.x, hence a minor bump. A field is required when its schema takes no empty value (`z.string().min(1)`, `z.number()`), `defaultValues` is optional - the form starts from the schema's empty values - and `onSubmit` gets empty values as `null` or left out, as the schema takes them, so an API's generated schema (e.g. orval's zod) fits as it is. `EafFormValidationSummary` also shows the errors of fields no `EafFormItem` shows, and zod's messages follow vue-i18n's language (English or Polish).
- 24db455: `supportedLanguages` uses `displayName` shown as-is instead of translated `displayNameKey`.
- 24db455: Logo is now a Vue component, set per area: `authorized.logo` / `unauthorized.logo`.
- 187bd2f: - Sidebar collapses to an icon rail that expands on hover, state persisted. It has its own collapse button; the header one is for mobile.
  - Primary color is driven through PrimeVue preset palettes.
  - Externalize `@primeuix` so theme updates reach the host.
- aef870e: **BREAKING:** `./style` is no longer compiled CSS but a stylesheet for the host's own Tailwind build - its `@source` (the package's `dist`), theme tokens and the components' own CSS. Packages compiled separately and appended one after another let a plain class of one override a variant of another (`hidden` beating `md:block` hid the sidebar). Import it after Tailwind, PrimeUI and PrimeIcons, and declare the dark variant:

  ```css
  @import "tailwindcss";
  @import "tailwindcss-primeui";
  @import "primeicons/primeicons.css";
  @custom-variant dark (&:is(.dark, .dark *));
  @import "@eappflow/ui-shell/style";
  ```

### Patch Changes

- aef870e: The account menu's Change Password opens a working page: the shell registers `/change-password` (an app's own route wins), the menu closes, and the success message shows.
- 187bd2f: **BREAKING:** `EafFormItem` drops the `form` prop - pass a field from `$f.fields` instead: `for="email" :form="$f"` → `:field="$f.fields.email"`. A typo in it is a type error. A field's state lives on the field: `$f.fields.email.$error` / `$errors` / `$required` / `$setError(msg)` / `$clearError()` replace the form's `getFieldError`, `getAllFieldErrors`, `hasFieldError`, `isFieldRequired`, `setFieldError` and `clearFieldError` (for a path known only at runtime use `$f.fieldErrors`). `showAllErrors` is gone - `EafFormItem` shows the field's first error. Breaking in 0.x, hence a minor bump.

  `useEafForm` supports nested data (`{ address: { street: string } }`):

  - **`$f.fields`** mirrors the data with LSP completion at every level, array indexes included: `:field="$f.fields.users[2].email"` (`EafFields<T>`, `EafField`). `data-testid` and the label's `for` are the path (`"users[2].email"`), the error - now a PrimeVue `Message` (`severity="error" size="small" variant="simple"`) instead of a red `<small>` - is under `${path}-error`; the slot gets the path as `id` for the input (`v-slot="{ id }"` → `:id="id"`, replacing the slot's `field`) and `EafFormItem` no longer sets `name` on it; while there's an error, PrimeVue inputs anywhere inside turn invalid - wrapped ones too, e.g. in an `IconField`, and `Password`, `DatePicker`, `InputNumber` - through an injected `$pcFormField`, as under PrimeVue Forms' `FormField`; no `p-invalid` class is added by `EafFormItem` any more.
  - **Errors keyed by field path** (`address.street`, `items[0].name` - the API's format), from `validate()` and from API errors. Errors on paths not in the data go to the summary.
  - **`resetForm()` restores nested data** from a deep copy taken at creation; `resetForm(data)` puts the given data in instead (e.g. a loaded record), clearing errors without validating it.
  - New types: `EafField`, `EafFields`.

  The `primevue` peer range is now `^4.2.0` (still below 5): the error `Message` uses `size`/`variant`, added in 4.2.0.

  The login and password views use `$f.fields`.

- Updated dependencies [aef870e]
- Updated dependencies [aef870e]
- Updated dependencies [187bd2f]
- Updated dependencies [aef870e]
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
