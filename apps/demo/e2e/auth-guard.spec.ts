import { test, expect } from "@playwright/test";

test("redirects unauthenticated users to login with a redirect param", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login\?redirect=\//);
  await expect(page.getByTestId("login-input")).toBeVisible();
});
