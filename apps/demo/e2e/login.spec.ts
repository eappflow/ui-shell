import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("logs in and lands on the dashboard", async ({ page }) => {
  await login(page);

  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await expect(page.getByTestId("dashboard-welcome-heading")).toContainText(
    `Welcome, Demo User`,
  );
});

test("shows validation errors when submitting an empty form", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByTestId("login-button").click();

  await expect(page.getByTestId("field-login-error")).toBeVisible();
  await expect(page.getByTestId("field-password-error")).toBeVisible();
  await expect(page).toHaveURL("/login");
});
