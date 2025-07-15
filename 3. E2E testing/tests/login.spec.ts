import { test, expect, Page } from "@playwright/test";
import {
  BASE_URL,
  INVALID_EMAIL,
  INVALID_EMAIL_DOMAIN,
  VALID_EMAIL,
} from "./utils/constants";

const enterEmail = async (page: Page, email: string) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill(email);
  await emailInput.press("Enter");
};

const enterOtp = async (page: Page, otp: string) => {
  const otpInput = page.locator('input[name="otp"]');
  await otpInput.fill(otp);
  await otpInput.press("Enter");
};

test("should have title", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page).toHaveTitle(/solvro/i);
});

test("should display the login form", async ({ page }) => {
  await page.goto(BASE_URL);

  const loginForm = page.locator("form");
  await expect(loginForm).toBeVisible();

  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeVisible();
});

test("should login and redirect with valid email and OTP", async ({ page }) => {
  await page.goto(BASE_URL);

  await enterEmail(page, VALID_EMAIL);
  const otpCode = await new Promise<string>((resolve) => {
    page.on("console", (log) => {
      const otpMatch = log.text().match(/\b\d{6}\b/);
      if (otpMatch) {
        resolve(otpMatch[0]);
      }
    });
  });

  await enterOtp(page, otpCode);
  await page.waitForURL(/\/plans/);
});

test("should display error message while entering invalid email", async ({
  page,
}) => {
  await page.goto(BASE_URL);

  await enterEmail(page, INVALID_EMAIL);
  await expect(page.getByText(/poprawny/i)).toBeVisible();
});

test("should display error message while entering email with wrong domain", async ({
  page,
}) => {
  await page.goto(BASE_URL);

  await enterEmail(page, INVALID_EMAIL_DOMAIN);
  await expect(page.getByText("@student.pwr.edu.pl")).toBeVisible();
});
