# @eappflow/ui-shell

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
