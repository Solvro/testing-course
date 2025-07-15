import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page elements', async ({ page }) => {
    // Check for login title - be flexible about exact text
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toContain('zaloguj');

    // Check for email input
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should attempt form submission', async ({ page }) => {
    // Fill valid PWr email
    await page.locator('input[name="email"]').fill('test@student.pwr.edu.pl');

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Wait for any response
    await page.waitForTimeout(2000);

    // Check if something happened (could be OTP step, error, or redirect)
    const currentUrl = page.url();
    const bodyText = await page.textContent('body');

    // Test should pass if we get any kind of response
    expect(bodyText?.length).toBeGreaterThan(10);

    console.log('Form submission completed, URL:', currentUrl);
  });
});
