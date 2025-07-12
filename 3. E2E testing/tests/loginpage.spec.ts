import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("should display login page", async ({ page }) => {
    await expect(page).toHaveTitle(/testing/i);
    await expect(
      page.getByRole("heading", { name: /zaloguj się/i })
    ).toBeVisible();
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("should display error on invalid email", async ({ page }) => {
    const emailInput = page.getByRole("textbox");
    const submitButton = page.getByRole("button");

    await emailInput.fill("invalidmail");
    await submitButton.click();

    await expect(page.getByText(/podaj poprawny/i)).toBeVisible();
  });

  test("should display error when wrong email domen", async ({ page }) => {
    const emailInput = page.getByRole("textbox");
    const submitButton = page.getByRole("button");

    await emailInput.fill("email@example.com");
    await submitButton.click();

    await expect(page.getByText(/@student\.pwr\.edu\.pl/i)).toBeVisible();
  });

  test("should redirect to login page if not logged in", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(
      page.getByRole("heading", { name: /zaloguj się/i })
    ).toBeVisible();
  });

  test("should send otp on correct email and login", async ({ page }) => {
    const emailInput = page.getByRole("textbox");
    const submitButton = page.getByRole("button");

    let code: string | null = null;

    await emailInput.fill("student@student.pwr.edu.pl");

    page.on("console", (msg) => {
      if (msg.text().includes("OTP")) {
        code = msg.text().match(/\d+/g)![0];
      }
    });

    await submitButton.click();

    await expect(page.getByText(/wpisz kod/i)).toBeVisible();
    expect(code).not.toBeNull();

    const otpInput = page.getByRole("textbox", { name: /hasło/i });
    await otpInput.fill(code!);

    const loginButton = page.getByRole("button", { name: /zaloguj/i });
    await loginButton.click();

    await expect(page.getByText(/kocham planer/i)).toBeVisible();
    await expect(page).toHaveURL(/.*\/plans/);
  });
});
