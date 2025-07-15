import { test, expect } from '@playwright/test';

test.describe('Plan Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
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