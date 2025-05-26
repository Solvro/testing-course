import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://planer.solvro.pl/");

  await page.getByRole("link", { name: "Kontynuuj bez logowania" }).click();

  await page.getByRole("button").filter({ hasText: /^$/ }).click();

  await page.getByRole("combobox").click();

  await page.getByRole("option", { name: "Wydział Informatyki i" }).click();

  await page.getByRole("button", { name: "wybranych" }).click();

  await page.getByPlaceholder("Wybierz rejestrację").fill("ist si sem 5");
  await page
    .getByRole("option", { name: "IST SI sem. 6, 2024/25-L W04-" })
    .click();

  
});
