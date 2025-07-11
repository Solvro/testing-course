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

  test("shows incorrect email message on incorrect email", async ({ page }) => {
    const emailInput = page.getByRole("textbox");
    await emailInput.fill("invalid-email");
    const submitButton = page.getByRole("button");
    submitButton.click();
    await expect(page.getByText(/podaj poprawny/i)).toBeVisible();
  });

  test("shows incorrect email message on not student email", async ({
    page,
  }) => {
    const emailInput = page.getByRole("textbox");
    await emailInput.fill("mikifikizafryki@gmail.com");
    const submitButton = page.getByRole("button");
    submitButton.click();
    await expect(page.getByText(/musi kończyć/i)).toBeVisible();
  });

  test("login with correct email", async ({ page }) => {
    const emailInput = page.getByRole("textbox");
    await emailInput.fill("272662@student.pwr.edu.pl");
    const submitButton = page.getByRole("button");

    let otpCode: string | null = null;

    page.on("console", (msg) => {
      if (msg.text().includes("Kod OTP to")) {
        otpCode = msg.text().split("Kod OTP to ")[1].split(" ")[0]; // Extract just the number
      }
    });

    await submitButton.click();

    await expect(page.getByText(/wpisz kod/i)).toBeVisible();

    const otpInput = page.getByRole("textbox", { name: /hasło/i });

    expect(otpCode).not.toBeNull();
    await otpInput.fill(otpCode!);

    const loginButton = page.getByRole("button", { name: /zaloguj/i });
    await loginButton.click();

    await expect(page.getByText(/kocham planer/i)).toBeVisible();
    await expect(page).toHaveURL(/.*\/plans/);
  });
});
