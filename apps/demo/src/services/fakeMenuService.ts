/**
 * Fake Menu Service - Demo implementation
 *
 * Provides a static menu configuration for the demo app.
 * In production, this would come from the API or a config file.
 */
import type { MenuModule } from "@eappflow/ui-shell";

export function createFakeMenuService(): { getMenu(): MenuModule[] } {
  return {
    getMenu(): MenuModule[] {
      return [
        {
          name: "Dashboard",
          icon: "pi pi-chart-bar",
          items: [
            {
              name: "Overview",
              icon: "pi pi-home",
              path: "/",
              permissions: [],
            },
          ],
        },
        {
          name: "Administration",
          icon: "pi pi-cog",
          items: [
            {
              name: "Employees",
              icon: "pi pi-briefcase",
              path: "/employees",
              permissions: ["Employees"],
            },
            {
              name: "Settings",
              icon: "pi pi-sliders-h",
              path: "/settings",
              permissions: ["TenantSettings"],
            },
          ],
        },
        {
          name: "Account",
          icon: "pi pi-user",
          items: [
            {
              name: "Change Password",
              icon: "pi pi-key",
              path: "/change-password",
              permissions: [],
            },
          ],
        },
      ];
    },
  };
}