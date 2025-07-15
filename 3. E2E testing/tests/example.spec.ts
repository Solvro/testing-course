import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("should have the correct title", async ({ page }) => {
    await page.goto("http://localhost:5173/");
    await expect(page).toHaveTitle(/Testing/i);
  });

  test("it should log in with data from opt", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    const optPassword = new Promise<string>((resolve) => {
      page.on("console", (msg) => {
        const message = msg.text().match(/ (\d{6})/);
        if (message) {
          resolve(message[1]);
        }
      });
    });

    await page.getByRole("textbox").fill("gaming@student.pwr.edu.pl");
    await page.getByRole("button").click();

    const opt = await optPassword;

    await page.getByRole("textbox").fill(opt);
    await page.getByRole("button").click();

    await expect(page.getByText(/kocham/i)).toBeVisible();
  });
});
