import { test, expect, type Page } from "@playwright/test";

const localhost_url = "http://localhost:5173";
const enter_button = "Enter";

async function pass_email(page: Page, email: string) {
  const passed_email = page.getByPlaceholder(/student.pwr.edu.pl/i);
  await expect(passed_email).toBeVisible();
  await passed_email.fill(email);
  await passed_email.press(enter_button);
}

async function pass_otp(page: Page, otp: string) {
  const passed_otp = page.getByLabel(/Hasło jednorazowe/i);
  await expect(passed_otp).toBeVisible();
  await passed_otp.fill(otp);
  await passed_otp.press(enter_button);
}

test.beforeEach(async ({ page }) => {
  await page.goto(localhost_url);
});

test.describe("Testing login", () => {
  test("should display login page", async ({ page }) => {
    await expect(page).toHaveTitle(/solvro/i);
    await expect(
      page.getByRole("heading", { name: "Zaloguj się", level: 1 })
    ).toBeVisible();
  });

  test("should display incorrect email", async ({ page }) => {
    await pass_email(page, "incorrect_mail@error.com");
    await expect(page.getByText(/musi kończyć się/i)).toBeVisible();
  });

  test("should display incorrect otp", async ({ page }) => {
    await pass_email(page, "test_error@student.pwr.edu.pl");
    await pass_otp(page, "17072025");
    await expect(
      page.getByText(/invalid otp/i).or(page.getByText(/no otp requested/i))
    ).toBeVisible();
  });

  test("should display loging out", async ({ page }) => {
    await pass_email(page, "volodymyr@student.pwr.edu.pl");
    const msg = await page.waitForEvent("console");
    const message = (await msg.args()[0].jsonValue()) as string;
    const otp_pass = message.split(" ")[message.split(" ").length - 2];

    await pass_otp(page, otp_pass);
    const log_out_btn = page.getByRole("button", { name: /wyloguj/i });

    log_out_btn.click();

    await expect(page.getByPlaceholder(/student.pwr.edu.pl/i)).toBeVisible();
  });
});
