import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("menu pages are links: Ctrl+click opens a new tab, a click stays in the app", async ({
  page,
  context,
}) => {
  await login(page);
  await expect(page).toHaveURL("/");

  const link = page
    .getByTestId("app-sidebar")
    .getByRole("link", { name: "Diagnostics" });
  await expect(link).toHaveAttribute("href", "/diagnostics");

  const newTab = context.waitForEvent("page");
  await link.click({ modifiers: ["ControlOrMeta"] });
  await expect(await newTab).toHaveURL("/diagnostics");
  await expect(page).toHaveURL("/");

  // A marker on the window survives only if the page doesn't reload
  await page.evaluate(() => Object.assign(window, { stayed: true }));
  await link.click();
  await expect(page).toHaveURL("/diagnostics");
  expect(await page.evaluate(() => "stayed" in window)).toBe(true);
});
