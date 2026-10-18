import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { navigateTool } from "../navigateTool";

const page = { template: "<div />" };

function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: page },
      { path: "/orders", component: page },
      { path: "/no-access", component: page },
      {
        path: "/admin",
        component: page,
        beforeEnter: () => "/no-access",
      },
    ],
  });
  const tool = navigateTool(router, [
    {
      name: "Sales",
      icon: "pi pi-shop",
      items: [{ name: "Orders", path: "/orders" }],
    },
  ]);
  return { router, tool };
}

describe("navigateTool", () => {
  it("lists the menu's pages for the model", () => {
    expect(setup().tool.description).toContain("- /orders: Sales / Orders");
  });

  it("opens the page and tells where the user is", async () => {
    const { router, tool } = setup();

    expect(await tool.run({ path: "/orders?status=new" })).toEqual({
      currentPage: "/orders?status=new",
    });
    expect(router.currentRoute.value.path).toBe("/orders");
  });

  it("tells where a guard sent the user instead", async () => {
    expect(await setup().tool.run({ path: "/admin" })).toEqual({
      currentPage: "/no-access",
    });
  });

  it("opens only the app's own pages", async () => {
    const { tool } = setup();

    for (const path of ["https://evil.com", "//evil.com", "/\\evil.com", 1]) {
      expect(tool.parameters!.safeParse({ path }).success).toBe(false);
    }
    await expect(tool.run({ path: "/missing" })).rejects.toThrow(
      "no page at /missing",
    );
  });
});
