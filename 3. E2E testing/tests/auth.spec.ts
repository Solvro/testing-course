import { test, expect } from "@playwright/test";
import { MOCK_EMAIL, MOCK_OTP, WEBPAGE_URL } from "./mocks/constants";
import { mockGetOtp, mockVerifyOtp } from "./mocks/handlers";

test.describe("Authentication flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WEBPAGE_URL);
  });

  test("should log in successfully", async ({ page }) => {
    await mockGetOtp(page);
    await mockVerifyOtp(page);

    const emailInput = page.getByRole("textbox", { name: "Adres e-mail" });
    const emailSubmit = page.getByRole("button", { name: "Wyślij kod" });
    expect(emailInput).toBeVisible();
    expect(emailSubmit).toBeVisible();

    await emailInput.fill(MOCK_EMAIL.VALID);
    await emailSubmit.click();

    const otpInput = page.getByRole("textbox", { name: "Hasło jednorazowe" });
    const otpSubmit = page.getByRole("button", { name: "Zaloguj się" });
    expect(otpInput).toBeVisible();
    expect(otpSubmit).toBeVisible();
    await otpInput.fill(MOCK_OTP.VALID);
    await otpSubmit.click();

    const redirectUrl = `${WEBPAGE_URL}/plans`;
    await page.waitForURL(redirectUrl);
    expect(page.url()).toBe(redirectUrl);
  });
});
