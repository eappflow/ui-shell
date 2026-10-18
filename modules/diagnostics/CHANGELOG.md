# @eappflow/diagnostics

## 1.0.0

### Minor Changes

- aef870e: **BREAKING:** `./style` is no longer compiled CSS but a stylesheet for the host's own Tailwind build - its `@source` (the package's `dist`), theme tokens and the components' own CSS. Packages compiled separately and appended one after another let a plain class of one override a variant of another (`hidden` beating `md:block` hid the sidebar). Import it after Tailwind, PrimeUI and PrimeIcons, and declare the dark variant:

  ```css
  @import "tailwindcss";
  @import "tailwindcss-primeui";
  @import "primeicons/primeicons.css";
  @custom-variant dark (&:is(.dark, .dark *));
  @import "@eappflow/ui-shell/style";
  ```

### Patch Changes

- Updated dependencies [aef870e]
- Updated dependencies [aef870e]
- Updated dependencies [aef870e]
- Updated dependencies [24db455]
- Updated dependencies [24db455]
- Updated dependencies [187bd2f]
- Updated dependencies [187bd2f]
- Updated dependencies [aef870e]
  - @eappflow/ui-shell@1.0.0

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
