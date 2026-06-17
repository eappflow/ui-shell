/**
 * Diagnostics Module — @eappflow/diagnostics
 *
 * Provides diagnostics routes, menu items, and permissions
 * for the eAppFlow UI Shell.
 */

import type { EafModule } from "@eappflow/ui-shell";
import type { EafMenuModule } from "@eappflow/ui-shell";
import type { DiagnosticsConfig } from "./types";
import { DIAGNOSTICS_CONFIG_KEY } from "./types";

/**
 * Creates the Diagnostics module instance.
 *
 * @param config - Optional diagnostics configuration
 */
export function createDiagnosticsModule(config?: DiagnosticsConfig): EafModule {
  return {
    id: "diagnostics",
    name: "Diagnostics",
    version: "0.1.0",
    permissions: ["TechnicalAdministrator"],  
    routes: [
      {
        path: "diagnostics/welcome",
        name: "welcome",
        component: () => import("./views/Welcome.vue"),
        meta: { permissions: [] },
      },
      {
        path: "diagnostics",
        name: "diagnostics",
        component: () => import("./views/Diagnostics.vue"),
        meta: { permissions: ["TechnicalAdministrator"] },
      },
    ],

    menuModules: [
      {
        name: "eAppFlow",
        icon: "pi pi-cog",
        items: [
          {
            name: "Welcome",
            icon: "pi pi-users",
            path: "/diagnostics/welcome",
            permissions: [],
          },
          {
            name: "Diagnostics",
            icon: "pi pi-shield",
            path: "/diagnostics",
            permissions: ["TechnicalAdministrator"],
          },
        ],
      },
    ],

    install(app) {
      // Provide diagnostics config to any downstream consumers
      app.provide(DIAGNOSTICS_CONFIG_KEY, config ?? {});
    },
  };
}