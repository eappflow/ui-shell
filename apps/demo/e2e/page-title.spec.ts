import { test, expect, type Page } from "@playwright/test";
import { login } from "./utils";

async function selectLanguage(page: Page, code: string): Promise<void> {
  await page.getByTestId("account-menu-button").click();
  await page.getByTestId("language-select").click();
  await page.getByTestId(`language-option-${code}`).click();
}

test("titles the tab with the page's menu group and name, translated", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("DemoFlow");

  await login(page);
  await expect(page).toHaveURL("/");
  await page.getByTestId("app-sidebar").getByText("Diagnostics").click();
  await expect(page).toHaveTitle("eAppFlow | Diagnostics");

  await selectLanguage(page, "pl");
  await expect(page).toHaveTitle("eAppFlow | Diagnostyka");
});

test("keeps a page's own title across a language switch, until the page goes", async ({
  page,
}) => {
  await login(page);
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("Welcome back");

  await selectLanguage(page, "pl");
  await expect(page).toHaveTitle("Witaj ponownie");

  await page.getByTestId("app-sidebar").getByText("Diagnostyka").click();
  await expect(page).toHaveTitle("eAppFlow | Diagnostyka");
});

test("titles the AI chat's tab with the open conversation", async ({
  page,
}) => {
  await login(page);
  await expect(page).toHaveURL("/");
  await page.getByTestId("app-sidebar").getByText("AI Chat").click();
  await expect(page).toHaveTitle("AI | AI Chat");

  await page.getByText("What time is it?").click();
  await expect(page).toHaveTitle("What time is it?");
});
