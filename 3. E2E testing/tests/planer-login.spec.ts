import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  const fillDataAndGetOTP = async (page): Promise<string> => {
    await page.getByRole("textbox", { name: "adres" }).fill("test@student.pwr.edu.pl");
    await page.getByRole("button", { name: "wyślij" }).click();

    return new Promise<string>((resolve) => {
      page.on("console", (msg) => {
        const match = msg.text().match(/\d{6}/);
        if (match) {
          resolve(match[0]);
        }
      });
    });
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("http:localhost:5173");
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("Solvro Testing Course 🥰");
    await expect(page.getByRole("heading", { name: "Zaloguj się do planera" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Adres e-mail" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wyślij kod" })).toBeVisible();
  });

  test("should display toast if incorrect otp given", async ({ page }) => {
    const code = await fillDataAndGetOTP(page);
    const otpToFill = code == "000000" ? "111111" : "000000";

    await page.getByRole("textbox", { name: "hasło jednorazowe" }).fill(otpToFill);
    await page.getByRole("button", { name: "zaloguj" }).click();

    await expect(page.getByRole("heading", { name: "Zaloguj się do planera" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "hasło jednorazowe" })).toBeVisible();
    await expect(page.getByText("Invalid OTP - please use")).toBeVisible();
  });

  test("should display plans if correct otp given", async ({ page }) => {
    const code = await fillDataAndGetOTP(page);

    await page.getByRole("textbox", { name: "hasło jednorazowe" }).fill(code);
    await page.getByRole("button", { name: "zaloguj" }).click();

    await expect(page.getByRole("heading", { name: "Planer - kocham planer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plan poniedziałkowy" })).toBeVisible();
    expect( await page.getByRole("heading", { name: "Algorytmy i struktury danych" }).count()).toBeGreaterThan(0);
  });

  test("should login and then logout", async ({ page }) => {
    const code = await fillDataAndGetOTP(page);

    await page.getByRole("textbox", { name: "hasło jednorazowe" }).fill(code);
    await page.getByRole("button", { name: "zaloguj" }).click();
    await page.getByRole("button", { name: "wyloguj" }).click();

    await expect(page.getByRole("heading", { name: "Zaloguj się do planera" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Adres e-mail" })).toBeVisible();
  });
});
