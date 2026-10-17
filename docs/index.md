---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "UI Shell"
  text: "Start with the boring parts done"
  tagline: Auth, layout, navigation and theming for business apps.
  image:
    src: /logo.svg
    alt: UI Shell
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/eappflow/ui-shell

features:
  - title: ⚡ One-call setup
    details: app.use(EAppFlowUIShell) sets up Pinia, the router, i18n and route guards. Your app brings only its modules and services.
    link: /guide/getting-started
  - title: 🧩 Modules
    details: Each module adds its own routes, menu items and permissions. Teams build them apart, and the shell puts them together.
    link: /core-concepts/modules
  - title: 🔐 Auth and permissions
    details: Login, password reset and Microsoft SSO screens. Menu items and pages show only to users with the right permissions.
  - title: 📝 Zod-driven forms
    details: One schema checks the values, marks the required fields and puts the API's errors under the right fields.
    link: /core-concepts/forms
  - title: ✨ AI assistant
    details: A chat that can open pages and fill in the forms on screen, with your own backend behind it.
    link: /core-concepts/ai-assistant
  - title: 🎨 Layout and theming
    details: Sidebar, header, light and dark mode, a picker for the theme color, and Polish and English out of the box.
---
