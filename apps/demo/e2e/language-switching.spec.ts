import { test, expect, type Page } from "@playwright/test";
import { login } from "./utils";

// Switching locale reflows the sidebar (translated labels are different
// lengths), which triggers the account popover's own resize/scroll-driven
// auto-close. Escape first so "open" is always from a known closed state,
// instead of assuming the previous action left it open.
async function openAccountMenu(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page.getByTestId("account-menu-button").click();
}

async function selectLanguage(page: Page, code: string): Promise<void> {
  await page.getByTestId("language-select").click();
  await page.getByTestId(`language-option-${code}`).click();
}

test("switches the UI language via the account menu", async ({ page }) => {
  await login(page);

  await openAccountMenu(page);
  await selectLanguage(page, "pl");
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");

  await openAccountMenu(page);
  await expect(page.getByTestId("logout-menu-item")).toHaveText("Wyloguj");

  await openAccountMenu(page);
  await selectLanguage(page, "en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await openAccountMenu(page);
  await expect(page.getByTestId("logout-menu-item")).toHaveText("Logout");
});
