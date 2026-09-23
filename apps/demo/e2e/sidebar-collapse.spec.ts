import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("collapses the sidebar to a compact labelled rail and restores it", async ({
  page,
}) => {
  await login(page);

  const sidebar = page.getByTestId("app-sidebar");
  const toggle = page.getByTestId("toggle-sidebar-button");

  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "false");
  await expect(sidebar.getByText("Welcome")).toBeVisible();

  await toggle.click();
  // The sidebar stays visible, just narrowed down to its labelled icon rail.
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
  await expect(sidebar.locator("nav a").first()).toBeVisible();
  // The label is captioned under the icon.
  await expect(sidebar.getByText("Welcome")).toBeVisible();

  // No tooltip - the caption is shown instead.
  await sidebar.locator("nav a").first().hover();
  await expect(page.locator(".p-tooltip")).toHaveCount(0);

  await toggle.click();
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "false");
  await expect(sidebar.getByText("Welcome")).toBeVisible();
});

test("keeps the collapsed sidebar after a reload", async ({ page }) => {
  await login(page);

  const sidebar = page.getByTestId("app-sidebar");
  await page.getByTestId("toggle-sidebar-button").click();
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("eappflow_sidebar_collapsed")),
    )
    .toBe("true");

  await page.reload();

  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
});
