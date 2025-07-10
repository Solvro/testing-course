import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http:localhost:5173");
  });

  test("loads login page", async ({ page }) => {
    await expect(page).toHaveTitle(/solvro Testing/i);

    await expect(
      page.getByRole("heading", { name: "Zaloguj się do planera" })
    ).toBeVisible();
  });
});
