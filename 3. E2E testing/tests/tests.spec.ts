import { test, expect } from "@playwright/test";

test("login", async ({ page }) => {
  // Create a promise to capture the OTP from the console log
  const otpPromise = new Promise<string>((resolve) => {
    page.on("console", (msg) => {
      const match = msg.text().match(/Kod OTP to (\d{6})/);
      if (match) resolve(match[1]);
    });
  });
  await page.goto("http://localhost:5173/");
  await expect(page.getByRole("heading")).toContainText(
    "Zaloguj się do planera"
  );
  await page
    .getByRole("textbox", { name: "Adres e-mail" })
    .fill("123456@student.pwr.edu.pl");
  await page.getByRole("button", { name: "Wyślij kod" }).click();
  const otp = await otpPromise;
  await page.getByRole("textbox", { name: "Hasło jednorazowe" }).fill(otp);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page.locator("h1")).toContainText("Planer - kocham planer");
});
