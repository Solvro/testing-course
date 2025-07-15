import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
    });

    test('should display login form', async ({ page }) => {
        await expect(page.locator('form')).toBeVisible();
    });

    test('should allow user to log in with valid emial and otp', async ({ page }) => {
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

        await expect(page).toHaveURL('http://localhost:5173/plans');
    });

    test('should show error message on invalid email', async ({ page }) => {
        await page.fill('input[name="email"]', 'invalid-email');
        await page.click('button[type="submit"]');

        const error = page.locator('text=Podaj poprawny adres email');
        await expect(error).toBeVisible();
        await expect(page).not.toHaveURL('http://localhost:5173/plans');
    });

    test('should prevent login if OTP is missing', async ({ page }) => {
        await page.fill('input[name="email"]', '123456@student.pwr.edu.pl');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(1000);
        await page.click('button[type="submit"]');

        const error = page.locator('text=Kod OTP musi mieć 6 znaków');
        await expect(error).toBeVisible();
        await expect(page).not.toHaveURL('http://localhost:5173/plans');
    });
});