import { test, expect } from "@playwright/test";
import { login } from "./utils";

test("logs out via the account menu and blocks access to protected routes", async ({
  page,
}) => {
  await login(page);
  await expect(page).toHaveURL("/");

  await page.getByTestId("account-menu-button").click();
  await page.getByTestId("logout-menu-item").click();

  await expect(page).toHaveURL(/\/login/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});
