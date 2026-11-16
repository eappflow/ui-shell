import { test, expect } from "@playwright/test";
import { login } from "./utils";

test.beforeEach(async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL("/");
});

test("closes right away while nothing is changed", async ({ page }) => {
  await page.getByTestId("edit-contact-button").click();
  const dialog = page.getByTestId("edit-contact-dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("save-button")).toBeDisabled();
  await expect(page.getByTestId("unsaved-changes")).toBeHidden();

  await page.getByTestId("cancel-button").click();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL("/");
});

test("asks before closing with unsaved changes", async ({ page }) => {
  await page.getByTestId("edit-contact-button").click();
  const dialog = page.getByTestId("edit-contact-dialog");
  const name = dialog.getByTestId("name").getByRole("textbox");
  // Its label, not the dashboard form's - that one has a "name" too
  await expect(name).toHaveAccessibleName(/^Name/);
  await name.fill("Anna Nowak");

  await expect(page.getByTestId("unsaved-changes")).toBeVisible();
  await expect(page.getByTestId("save-button")).toBeEnabled();

  // Keep editing: the dialog stays, with the changes
  await page.getByTestId("cancel-button").click();
  await page.getByTestId("keep-editing-button").click();
  await expect(page.getByTestId("keep-editing-button")).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(name).toHaveValue("Anna Nowak");

  // Escape asks as well; Discard closes
  await name.press("Escape");
  await page.getByTestId("discard-button").click();
  await expect(dialog).toBeHidden();

  // Opened again: the loaded contact, not dirty
  await page.getByTestId("edit-contact-button").click();
  await expect(name).toHaveValue("Jan Kowalski");
  await expect(page.getByTestId("unsaved-changes")).toBeHidden();
  await expect(page).toHaveURL("/");
});

test("is not dirty once a change is undone", async ({ page }) => {
  await page.getByTestId("edit-contact-button").click();
  const dialog = page.getByTestId("edit-contact-dialog");
  const note = dialog.getByTestId("note").getByRole("textbox");

  await note.fill("Call back");
  await expect(page.getByTestId("unsaved-changes")).toBeVisible();
  await note.fill("");

  await expect(page.getByTestId("unsaved-changes")).toBeHidden();
  await page.getByTestId("cancel-button").click();
  await expect(dialog).toBeHidden();
});
