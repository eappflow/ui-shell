import { test, expect } from "@playwright/test";

test("login components share the PrimeVue theme in both modes", async ({ page }) => {
  await page.goto("/login");
  const toggle = page.locator("#login-dark-mode");
  const card = page.locator(".p-card");
  const heading = page.locator(".eaf-login-title");
  const input = page.getByTestId("login-input");

  await toggle.check();
  await expect(card).toHaveCSS("background-color", "rgb(24, 24, 27)");
  await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("background-color", "rgb(9, 9, 11)");
  await expect(page.locator(".p-card-body")).toHaveCSS("padding", "20px");
  await expect(page.locator(".p-toggleswitch")).toHaveCSS("width", "40px");

  await page.reload();
  await expect(toggle).toBeChecked();
  await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");

  await toggle.uncheck();
  await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(heading).toHaveCSS("color", "rgb(51, 65, 85)");
});
