import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://planer.solvro.pl/");
  await page.getByRole("link", { name: "Kontynuuj bez logowania" }).click();
  await page.getByRole("button").filter({ hasText: /^$/ }).click();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Wydział Informatyki i" }).click();
  await page.getByRole("button", { name: "wybranych" }).click();
  await page.getByPlaceholder("Wybierz rejestrację").fill("ist si sem 6");
  await page
    .getByRole("option", { name: "IST SI sem. 6, 2024/25-L W04-" })
    .click();
  await page
    .getByRole("button", {
      name: "L Grupa 5 Hurtownie danych Bernadetta Maleszka 16/",
    })
    .click();
  await page
    .getByRole("button", { name: "L Grupa 3 Programowanie gier" })
    .click();
  await page
    .getByRole("button", { name: "W Grupa 1 Programowanie gier" })
    .click();
  await page
    .getByRole("button", {
      name: "W Grupa 1 Hurtownie danych Bernadetta Maleszka 102/",
    })
    .click();
  await page.getByRole("button", { name: "L Grupa 6 Programowanie w" }).click();
  await page
    .getByRole("button", { name: "L Grupa 3 Wspomaganie zarzą" })
    .click();
  await page
    .getByRole("button", {
      name: "L Grupa 2 Programowanie aplikacji multimedialnych Stanisław Saganowski 15/",
    })
    .click();
  await page.getByRole("button", { name: "W |TN Grupa 1 Wspomaganie" }).click();
  await page
    .getByRole("button", { name: "L Grupa 1 Grafika komputerowa" })
    .click();
  await page
    .getByRole("button", {
      name: "W Grupa 1 Programowanie aplikacji multimedialnych Stanisław Saganowski 62/",
    })
    .click();
  await page
    .getByRole("button", {
      name: "L Grupa 4 Sztuczna inteligencja i inżynieria wiedzy Aleksandra Kawala-Sterniuk, Daria Dziubałtowska 16/16",
      exact: true,
    })
    .click();
});
