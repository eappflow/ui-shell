import { nextTick } from "vue";
import type { Router } from "vue-router";
import { z } from "zod";
import { defineEafAiTool } from "@eappflow/ui-shell-components";
import type { EafFilteredMenuModule } from "../types";
import { isAppPath } from "../utils/isAppPath";

/**
 * Lets the AI chat take the user to a page of the app, not only link it -
 * with the pages of the user's menu to choose from.
 */
export function navigateTool(router: Router, menu: EafFilteredMenuModule[]) {
  const pages = menu.flatMap((group) =>
    group.items.map((item) => `- ${item.path}: ${group.name} / ${item.name}`),
  );
  return defineEafAiTool({
    name: "navigate",
    description:
      "Opens a page of the app for the user, when they ask to go there or to do something on it - " +
      "then the page's tools, such as its forms', are offered. Returns the page the user is on " +
      `afterwards, another one when they may not open it. The menu's pages:\n${pages.join("\n")}`,
    parameters: z.object({
      path: z
        .string()
        .refine(isAppPath, "The path must be the app's, starting with one /.")
        .describe("The app's path, starting with /, e.g. a menu page's"),
    }),
    async run({ path }) {
      if (!router.resolve(path).matched.length) {
        throw new Error(`There is no page at ${path}.`);
      }
      await router.push(path);
      // The page's forms are on screen before the chat asks for the tools again
      await nextTick();
      return { currentPage: router.currentRoute.value.fullPath };
    },
  });
}
