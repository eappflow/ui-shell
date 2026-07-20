import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("collapses and restores the sidebar via the header toggle", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByTestId("app-sidebar")).toBeVisible();

  await page.getByTestId("toggle-sidebar-button").click();
  await expect(page.getByTestId("app-sidebar")).not.toBeVisible();

  await page.getByTestId("toggle-sidebar-button").click();
  await expect(page.getByTestId("app-sidebar")).toBeVisible();
});
