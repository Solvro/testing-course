import { test, expect, type Page } from '@playwright/test';

async function fillEmailInput(page: Page, email: string) {
  const emailInput = page.getByPlaceholder(/@student/);

  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await emailInput.press('Enter');
}

async function fillOtpInput(page: Page, otp: string) {
  const otpInput = page.getByLabel(/Hasło jednorazowe/i);

  await expect(otpInput).toBeVisible();
  await otpInput.fill(otp);
  await otpInput.press('Enter');
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

test.describe('Login tests', () => {
  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Solvro/i);
    await expect(
      page.getByRole('heading', { name: 'Zaloguj się do planera', level: 1 })
    ).toBeVisible();
  });

  test('submit incorrect email', async ({ page }) => {
    await fillEmailInput(page, 'kfjdskfjkdskfldsjlfjdskljfsd@test.pl');

    await expect(page.getByText(/musi kończyć się na/i)).toBeVisible();
  });

  test('submit incorrect otp', async ({ page }) => {
    await fillEmailInput(page, 'test1@student.pwr.edu.pl');
    await fillOtpInput(page, '999999');

    await expect(
      page.getByText(/invalid otp/i).or(page.getByText(/no otp requested/i))
    ).toBeVisible();
  });

  test('should submit correct otp', async ({ page }) => {
    await fillEmailInput(page, 'kamil.marczak@student.pwr.edu.pl');
    const otpCode = await new Promise<string>((resolve) => {
      page.on('console', (msg) => {
        const match = msg.text().match(/\b\d{6}\b/);
        if (match) {
          resolve(match[0]);
        }
      });
    });

    await fillOtpInput(page, otpCode);

    await expect(page.getByText(/kocham planer/i)).toBeVisible();
  });
});
