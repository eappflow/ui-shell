import type { Page } from "@playwright/test";

export async function login(
  page: Page,
  login = "testuser",
  password = "password",
): Promise<void> {
  await page.goto("/login");
  await page.getByTestId("login-input").fill(login);
  await page.getByTestId("password-input").fill(password);
  await page.getByTestId("login-button").click();
}
