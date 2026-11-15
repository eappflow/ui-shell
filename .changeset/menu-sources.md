---
"@eappflow/ui-shell": minor
---

Menu items loaded at run time, e.g. the user's own dashboards: a module lists `menuSources`, the shell loads them for the signed-in user and drops them on sign-out, `useEafNavigation().reloadMenuSource(source)` loads them again.
