import test, { expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
});

test.describe("Authentication flow", () => {
  async function login(page: Page) {
    const emailInput = page.getByPlaceholder(/student.pwr.edu.pl/i);
    emailInput.fill("1234@student.pwr.edu.pl");
    await emailInput.press("Enter");

    const msg = await page.waitForEvent("console");
    const message = (await msg.args()[0].jsonValue()) as string;
    const otpCode = message.split(" ")[message.split(" ").length - 2];

    const otpInput = page.getByRole("textbox", { name: /hasło/i });
    await otpInput.fill(otpCode);
    await otpInput.press("Enter");
  }

  test("should let me log in", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("heading", { name: /kocham planer/i })
    ).toBeVisible();
  });

  test("should let me log out", async ({ page }) => {
    await login(page);
    const logOutButton = page.getByRole("button", { name: /wyloguj/i });

    logOutButton.click();

    await expect(page.getByPlaceholder(/student.pwr.edu.pl/i)).toBeVisible();
  });
});
