/**
 * Identity Plugin — @eappflow/identity
 *
 * Provides user management routes, menu items, and permissions
 * for the eAppFlow UI Shell.
 */

import type { EafPlugin, MenuModule } from "@eappflow/ui-shell";
import type { IdentityConfig } from "./types";
import { IDENTITY_CONFIG_KEY } from "./types";

/**
 * Creates the Identity plugin instance.
 *
 * @param config - Optional identity configuration
 */
export function createIdentityPlugin(config?: IdentityConfig): EafPlugin {
  return {
    id: "identity",
    name: "Identity",
    version: "0.1.0",

    permissions: ["Users", "Roles"],

    routes: [
      {
        path: "users",
        name: "users",
        component: () => import("./views/UsersView.vue"),
        meta: { permissions: ["Users"] },
      },
      {
        path: "roles",
        name: "roles",
        component: () => import("./views/RolesView.vue"),
        meta: { permissions: ["Roles"] },
      },
    ],

    menuModules: [
      {
        name: "Administration",
        icon: "pi pi-cog",
        items: [
          {
            name: "Users",
            icon: "pi pi-users",
            path: "/users",
            permissions: ["Users"],
          },
          {
            name: "Roles",
            icon: "pi pi-shield",
            path: "/roles",
            permissions: ["Roles"],
          },
        ],
      },
    ],

    install(app) {
      // Provide identity config to any downstream consumers
      app.provide(IDENTITY_CONFIG_KEY, config ?? {});
    },
  };
}