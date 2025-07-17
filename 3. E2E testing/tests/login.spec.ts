import { test, expect } from "@playwright/test";

const START_URL = "http://localhost:5173";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(START_URL);
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("Solvro Testing Course 🥰");

    await expect(
      page.getByRole("heading", {
        name: "Zaloguj się do planera",
      })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("123456@student.pwr.edu.pl")
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Wyślij kod",
      })
    ).toBeVisible();
  });

  test("should sign in and sign out from the app", async ({ page }) => {
    const EMAIL: string = "123456@student.pwr.edu.pl";

    const emailBtn = page.getByRole("button", { name: "Wyślij kod" });
    const input = page.getByPlaceholder("123456@student.pwr.edu.pl");

    await input.fill(EMAIL);
    await emailBtn.click();

    const otpInput = page.getByLabel("Hasło jednorazowe");
    const otpBtn = page.getByRole("button", { name: "Zaloguj się" });
    await expect(otpInput).toBeVisible();

    await otpInput.fill("000000");
    await otpBtn.click();

    const toast = page.getByText(/invalid otp/i);
    await expect(toast).toBeVisible();
    const toastText = (await toast.innerText()).split(" ");
    const correctOTP = toastText[toastText.length - 1];

    await otpInput.fill("");
    await otpInput.fill(correctOTP);
    await otpBtn.click();

    await expect(
      page.getByRole("heading", {
        name: "Planer - kocham planer",
      })
    ).toBeVisible();
    await expect(page.getByText(EMAIL)).toBeVisible();

    const logoutBtn = page.getByRole("button", { name: "Wyloguj" });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.hover();
    await logoutBtn.click();

    await expect(
      page.getByRole("heading", {
        name: "Zaloguj się do planera",
      })
    ).toBeVisible();
  });
});
