import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "UI Shell",
  description:
    "Modular Vue 3 UI shell and component library with Zod-driven forms and a context-aware AI assistant.",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  themeConfig: {
    logo: "/logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    outline: [2, 3],
    nav: [
      {
        text: "Guide",
        link: "/guide/getting-started",
        activeMatch: "^/(guide|core-concepts)/",
      },
      {
        text: "🚧 In development",
        link: "https://github.com/eappflow/ui-shell/blob/main/packages/ui-shell/CHANGELOG.md",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Getting Started", link: "/guide/getting-started" }],
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Modules", link: "/core-concepts/modules" },
          { text: "Routes and Menu", link: "/core-concepts/routes-and-menu" },
          { text: "Translations", link: "/core-concepts/translations" },
          { text: "Forms", link: "/core-concepts/forms" },
          { text: "AI Assistant", link: "/core-concepts/ai-assistant" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Creating a Module Package", link: "/guide/module-package" },
        ],
      },
      {
        text: "Tooling",
        items: [
          { text: "i18n Key Extraction", link: "/guide/i18n-key-extraction" },
        ],
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026-present eAppFlow",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/eappflow/ui-shell" },
    ],
  },
});
