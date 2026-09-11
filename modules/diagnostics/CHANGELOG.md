# @eappflow/diagnostics

## 0.1.1

### Patch Changes

- 3f023cf: Fix dark mode: the toggle now actually applies the dark theme (was silently disabled), the shell chrome, diagnostics panels, and Welcome page follow it correctly, and redundant PrimeVue Menu borders are removed.

  Refine the account menu: it drops the nested PrimeVue Menu in favour of standalone `ThemeColorPicker` (color dots) and `LanguageSelect` components, with a transparent menu background and primary-coloured active item. The unauthorized (login) layout gains a language selector and a dark-mode-aware login card, and the sidebar/menu styles move from custom CSS to Tailwind utilities.

- Updated dependencies [fe796a8]
- Updated dependencies [3f023cf]
- Updated dependencies [97e1329]
- Updated dependencies [f4ba5f8]
- Updated dependencies [325838a]
  - @eappflow/ui-shell@0.1.1
