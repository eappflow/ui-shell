import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("collapses the sidebar to an icon rail that expands on hover", async ({
  page,
}) => {
  await login(page);

  const sidebar = page.getByTestId("app-sidebar");
  const toggle = page.getByTestId("toggle-sidebar-button");

  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "false");
  await expect(sidebar.getByText("Welcome")).toBeVisible();

  await toggle.click();
  // The sidebar stays visible, narrowed down to its icon rail without labels.
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
  await expect(sidebar.locator("nav a").first()).toBeVisible();
  // Kept for screen readers only.
  await expect(sidebar.getByText("Welcome")).toHaveClass(/sr-only/);

  // The toggle sits in the sidebar, yet collapsing doesn't leave it peeking.
  await expect(sidebar).toHaveAttribute("data-peek", "false");

  // Hovering the rail again expands it over the page, labels included.
  await page.mouse.move(1000, 400);
  await sidebar.locator("nav a").first().hover();
  await expect(sidebar).toHaveAttribute("data-peek", "true");
  await expect(sidebar.getByText("Welcome")).not.toHaveClass(/sr-only/);

  await page.mouse.move(1000, 400);
  await expect(sidebar).toHaveAttribute("data-peek", "false");
  await expect(sidebar.getByText("Welcome")).toHaveClass(/sr-only/);

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
