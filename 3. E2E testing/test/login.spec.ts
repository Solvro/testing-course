import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
    });

    test('should display login form', async ({ page }) => {
        await expect(page.locator('form')).toBeVisible();
    });

    test('should allow user to log in with valid emial and otp', async ({ page }) => {
        await page.fill('input[name="email"]', '123456@student.pwr.edu.pl');
        await page.click('button[type="submit"]');

        const logMessage = await new Promise<string>((resolve) => {
                page.on('console', msg => {
                const match = msg.text().match(/\b\d{6}\b/);
                if (match) {
                    resolve(match[0]);
                }
            });
        });

        await page.waitForSelector('input[id="«r1»-form-item"]', { timeout: 5000 });
        await page.fill('input[id="«r1»-form-item"]', logMessage);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/plans', { timeout: 10000 });
    });

    test('should show error message on invalid email', async ({ page }) => {
        await page.fill('input[name="email"]', 'invalid-email');
        await page.click('button[type="submit"]');

        const error = page.locator('text=Podaj poprawny adres email');
        await expect(error).toBeVisible();
        await expect(page).not.toHaveURL('http://localhost:5173/plans');
    });

    test('should prevent login if OTP is missing', async ({ page }) => {
        await page.fill('input[name="email"]', '654321@student.pwr.edu.pl');
        await page.click('button[type="submit"]');

        await page.waitForSelector('input[id="«r1»-form-item"]', { timeout: 5000 });

        await page.click('button[type="submit"]');
        await expect(page.getByText('Kod OTP musi mieć 6 znaków')).toBeVisible();
        await expect(page).not.toHaveURL('http://localhost:5173/plans');
    });
});