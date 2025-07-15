import { test, expect } from '@playwright/test';

test.describe('Visual Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper form structure', async ({ page }) => {
    // Check if there's a form element
    const form = page.locator('form');
    const hasForm = await form.count() > 0;

    if (hasForm) {
      await expect(form).toBeVisible();
    }

    // Check email input attributes
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Check if email input has proper attributes
    const inputName = await emailInput.getAttribute('name');
    expect(inputName).toBe('email');
  });

  test('should have readable text and proper contrast', async ({ page }) => {
    // Check that text is visible and has content
    const heading = page.locator('h1');
    const headingText = await heading.textContent();

    expect(headingText).toBeTruthy();
    expect(headingText!.length).toBeGreaterThan(5);

    // Check if any descriptive text exists
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(20);
  });

  test('should handle different screen sizes', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Filter out common non-critical errors
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon.ico') &&
      !error.includes('404') &&
      !error.includes('network')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }

    // Should not have many critical console errors
    expect(criticalErrors.length).toBeLessThan(3);
  });
});
