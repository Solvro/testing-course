import { test, expect } from "@playwright/test";
import { BASE_URL } from "../src/api/base-url";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/");
  });
  test("should render title and components", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Zaloguj się do planera" })).toBeVisible();
    await expect(page.getByPlaceholder("123456@student.pwr.edu.pl")).toBeVisible();
    await expect(page.getByRole("button", { name: "Wyślij kod" })).toBeVisible();
  });
  test("should login to page", async ({ page }) => {
    const responsePromise = page.waitForResponse(`${BASE_URL}/user/otp/get`);
    await page.getByPlaceholder("123456@student.pwr.edu.pl").fill("student@student.pwr.edu.pl");
    await page.getByRole("button", { name: "Wyślij kod" }).click();
    const response = await responsePromise;
    const responseBody = await response.json();
    const otp = responseBody.otp;
    await page.getByRole("textbox").fill(otp);
    await page.getByRole("button", { name: "Zaloguj się" }).click();
    await expect(page.getByRole("heading", { name: "Planer - kocham planer" })).toBeVisible();
  });
});
