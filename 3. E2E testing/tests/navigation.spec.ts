import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the application homepage', async ({ page }) => {
    await page.goto('/');

    // Check that page loads and has basic content
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working form elements', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Check elements are present and interactive
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test typing in email field
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // Clear the field
    await emailInput.clear();
    await expect(emailInput).toHaveValue('');
  });

  test('should handle page refresh', async ({ page }) => {
    await page.goto('/');

    // Verify initial load
    await expect(page.locator('h1')).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still work after refresh
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});
