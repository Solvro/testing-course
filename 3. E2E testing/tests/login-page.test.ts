import test, { expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("LoginPage", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    loginPage = new LoginPage(page);
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("should show otp step after entering correct email", async ({
    page,
  }) => {
    await loginPage.enterEmail("test@student.pwr.edu.pl");
    await expect(page.getByText(/hasło/i)).toBeVisible();
  });

  test("should display error message when wrong email domain is provided", async ({
    page,
  }) => {
    await loginPage.enterEmail("wrong@domain.com");
    await expect(page.getByText(/@student.pwr.edu.pl/i)).toBeVisible();
  });

  test("should redirect to plans page after entering correct otp", async ({
    page,
  }) => {
    let otp: string | null = null;
    page.on("console", (msg) => {
      if (msg.type() === "info") {
        const match = msg.text().match(/\d{6}/);
        if (match !== null) {
          otp = match[0];
        }
      }
    });

    await loginPage.enterEmail("test@student.pwr.edu.pl");
    await expect(page.getByText(/hasło/i)).toBeVisible();

    if (otp === null) {
      throw new Error("OTP not found! Aborting...");
    }

    await loginPage.enterOtpCode(otp);
    await expect(page).toHaveURL(/plans/i);
  });

  test("should display error message after entering wrong otp", async ({
    page,
  }) => {
    await page.route("*/**/user/otp/get", async (route) => {
      await route.fulfill({ json: { success: true }, status: 200 });
    });

    const ERROR_MESSAGE = "Error message";
    await page.route("*/**/user/otp/verify", async (route) => {
      await route.fulfill({
        json: { success: false, message: ERROR_MESSAGE },
        status: 400,
      });
    });

    await loginPage.enterEmail("test@student.pwr.edu.pl");
    await expect(page.getByText(/hasło/i)).toBeVisible();

    // Entered OTP doesn't matter since API is mocked
    await loginPage.enterOtpCode("123456");
    await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();
  });
});
