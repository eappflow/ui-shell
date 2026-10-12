import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("changes the password from the account menu", async ({ page }) => {
  await login(page);
  await page.getByTestId("account-menu-button").click();
  await page.getByTestId("change-password-menu-item").click();
  await expect(page).toHaveURL(/\/change-password/);

  const current = page.getByTestId("currentPassword");
  const confirm = page.getByTestId("confirmPassword");

  // Showing the password is no leaving the field - Tab is
  await current.locator("input").focus();
  await current.locator(".p-password-toggle-mask-icon").click();
  await expect(page.getByTestId("currentPassword-error")).toHaveCount(0);
  await current.locator("input").press("Tab");
  await expect(page.getByTestId("currentPassword-error")).toBeVisible();

  await current.locator("input").fill("old-secret");
  await page.getByTestId("newPassword").locator("input").fill("new-secret");
  await confirm.locator("input").fill("other");
  await confirm.locator("input").press("Enter");
  await expect(page.getByTestId("confirmPassword-error")).toHaveText(
    "Passwords do not match",
  );

  await confirm.locator("input").fill("new-secret");
  await confirm.locator("input").press("Enter");
  await expect(page.getByTestId("confirmPassword-error")).toHaveCount(0);
  await expect(current.locator("input")).toHaveValue("");
});
