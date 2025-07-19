import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.describe("login page", () => {
  const BASE_URL = "http://localhost:5173";

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("should display login form", async ({ page }) => {
    await expect(
      page.getByPlaceholder("123456@student.pwr.edu.pl")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Wyślij kod/i })
    ).toBeVisible();
  });

  test("should show error on invalid email", async ({ page }) => {
    await page.getByPlaceholder("123456@student.pwr.edu.pl").fill("labubu");
    await page.getByRole("button", { name: /Wyślij kod/i }).click();
    await expect(page.getByText(/Podaj poprawny adres/i)).toBeVisible();
  });

  test("should not login with incorrect OTP code", async ({ page }) => {
    //i have to use unique mail name for each test run
    //separate for each session, otherwise sessions conflict and tests fail
    const TEST_EMAIL = `${randomUUID()}@student.pwr.edu.pl`;

    await page.getByPlaceholder("123456@student.pwr.edu.pl").fill(TEST_EMAIL);

    const logPromise = page.waitForEvent("console");
    await page.getByRole("button", { name: /Wyślij kod/i }).click();
    await page.getByLabel("Hasło jednorazowe").waitFor();

    const consoleMessage = await logPromise;
    const otpMatch = consoleMessage.text().match(/OTP to (\d{6})/);
    expect(otpMatch).not.toBeNull();
    const correctOtp = otpMatch![1];

    //get incorrect code - add 1 to first digit to create incorrect otp
    const incorrectOtp =
      correctOtp[0] === "9"
        ? "0" + correctOtp.slice(1)
        : (parseInt(correctOtp[0]) + 1).toString() + correctOtp.slice(1);

    await page.getByLabel("Hasło jednorazowe").fill(incorrectOtp);
    await page.getByRole("button", { name: /Zaloguj się/i }).click();

    await expect(page).not.toHaveURL(/.*\/plans/);
    await expect(page.getByText(/Invalid OTP/i)).toBeVisible();
  });

  test("should login with correct email and OTP code", async ({ page }) => {
    const TEST_EMAIL = `${randomUUID()}@student.pwr.edu.pl`;
    await page.getByPlaceholder("123456@student.pwr.edu.pl").fill(TEST_EMAIL);

    //listen before click
    const logPromise = page.waitForEvent("console");

    await page.getByRole("button", { name: /Wyślij kod/i }).click();
    await page.getByLabel("Hasło jednorazowe").waitFor();

    const consoleMessage = await logPromise;
    const otpMatch = consoleMessage.text().match(/OTP to (\d{6})/);
    expect(otpMatch).not.toBeNull();
    const otpCode = otpMatch![1];

    await page.getByLabel("Hasło jednorazowe").fill(otpCode);
    await expect(page.getByLabel("Hasło jednorazowe")).toHaveValue(otpCode);

    //debug - handler to check response
    page.on("response", async (res) => {
      if (res.url().includes("/user/otp/verify")) {
        console.log("response:", res.url(), res.status(), await res.text());
      }
    });

    await page.getByRole("button", { name: /Zaloguj się/i }).click();
    await expect(page).toHaveURL(/.*\/plans/);
  });
});
