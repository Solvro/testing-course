import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const logMessagePromise = new Promise<string>((resolve) => {
    page.on('console', (message) => {
    const text = message.text();
        if (text.includes('Kod OTP to')) {
            const otp = text.slice(-9, -2);
            resolve(otp);
        }
        });
    });

    await page.fill('input[name="email"]', '123456@student.pwr.edu.pl');
    await page.click('button[type="submit"]');

    const logMessage = await logMessagePromise;

    await page.fill('input[id="«r1»-form-item"]', logMessage);
    await page.click('button[type="submit"]');
  });

 test('should display all 3 plan types', async ({ page }) => {
    await expect(page.getByText('Plan Poniedziałkowy')).toBeVisible();
    await expect(page.getByText('Plan Rozłożony')).toBeVisible();
    await expect(page.getByText('Plan Kompaktowy')).toBeVisible();
  });

  test('should show correct number of classes and ECTS', async ({ page }) => {
    await expect(page.getByText('18 ECTS')).toBeVisible();
    await expect(page.getByText('19 ECTS')).toBeVisible();
    await expect(page.getByText('1 konflikt')).toBeVisible();
  });

  test('should list "Fizyka II" in Monday plan', async ({ page }) => {
    await expect(page.getByText('Fizyka II')).toBeVisible();
    await expect(page.getByText('Sala Fizyki')).toBeVisible();
  });

  test('should show logged-in email and logout button', async ({ page }) => {
    await expect(page.getByText('123456@student.pwr.edu.pl')).toBeVisible();
    await expect(page.getByText('Wyloguj')).toBeVisible();
  });

  test('should allow switching to another plan if clickable', async ({ page }) => {
    await page.getByText('Plan Rozłożony').click();
    await expect(page.getByText('Sala 103')).toBeVisible();
  });
});